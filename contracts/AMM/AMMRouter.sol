// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AMMFactory.sol";
import "./AMMPool.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract AMMRouter {
    address public immutable factory;
    address public immutable WETH;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "AMMRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (AMMFactory(factory).getPool(tokenA, tokenB, fee) == address(0)) {
            AMMFactory(factory).createPool(tokenA, tokenB, fee);
        }
        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB, fee);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "AMMRouter: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "AMMRouter: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        ensure(deadline)
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            fee,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        address pool = AMMFactory(factory).getPool(tokenA, tokenB, fee);
        IERC20(tokenA).transferFrom(msg.sender, pool, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pool, amountB);
        liquidity = AMMPool(pool).mint(to);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pool = AMMFactory(factory).getPool(tokenA, tokenB, fee);
        AMMPool(pool).transferFrom(msg.sender, pool, liquidity);
        (amountA, amountB) = AMMPool(pool).burn(to);
        require(amountA >= amountAMin, "AMMRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "AMMRouter: INSUFFICIENT_B_AMOUNT");
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        uint24[] calldata fees,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = getAmountsOut(amountIn, path, fees);
        require(amounts[amounts.length - 1] >= amountOutMin, "AMMRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, getPool(path[0], path[1], fees[0]), amounts[0]);
        _swap(amounts, path, fees, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        uint24[] calldata fees,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = getAmountsIn(amountOut, path, fees);
        require(amounts[0] <= amountInMax, "AMMRouter: EXCESSIVE_INPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, getPool(path[0], path[1], fees[0]), amounts[0]);
        _swap(amounts, path, fees, to);
    }

    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        uint24[] memory fees,
        address _to
    ) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = input < output ? (input, output) : (output, input);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2 ? getPool(output, path[i + 2], fees[i + 1]) : _to;
            AMMPool(getPool(input, output, fees[i])).swap(amount0Out, amount1Out, to);
        }
    }

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) public pure returns (uint256 amountB) {
        require(amountA > 0, "AMMRouter: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "AMMRouter: INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint24 fee
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "AMMRouter: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "AMMRouter: INSUFFICIENT_LIQUIDITY");
        uint256 amountInWithFee = amountIn * (10000 - fee);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 10000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut,
        uint24 fee
    ) public pure returns (uint256 amountIn) {
        require(amountOut > 0, "AMMRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "AMMRouter: INSUFFICIENT_LIQUIDITY");
        uint256 numerator = reserveIn * amountOut * 10000;
        uint256 denominator = (reserveOut - amountOut) * (10000 - fee);
        amountIn = (numerator / denominator) + 1;
    }

    function getAmountsOut(
        uint256 amountIn,
        address[] memory path,
        uint24[] memory fees
    ) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "AMMRouter: INVALID_PATH");
        require(fees.length == path.length - 1, "AMMRouter: INVALID_FEES");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = getReserves(
                path[i],
                path[i + 1],
                fees[i]
            );
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut, fees[i]);
        }
    }

    function getAmountsIn(
        uint256 amountOut,
        address[] memory path,
        uint24[] memory fees
    ) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "AMMRouter: INVALID_PATH");
        require(fees.length == path.length - 1, "AMMRouter: INVALID_FEES");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint256 i = path.length - 1; i > 0; i--) {
            (uint256 reserveIn, uint256 reserveOut) = getReserves(
                path[i - 1],
                path[i],
                fees[i - 1]
            );
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut, fees[i - 1]);
        }
    }

    function getReserves(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (uint256 reserveA, uint256 reserveB) {
        address pool = AMMFactory(factory).getPool(tokenA, tokenB, fee);
        if (pool == address(0)) {
            return (0, 0);
        }
        (uint256 reserve0, uint256 reserve1, ) = AMMPool(pool).getReserves();
        (reserveA, reserveB) = tokenA < tokenB ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (address) {
        return AMMFactory(factory).getPool(tokenA, tokenB, fee);
    }
}

