// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AMMPool.sol";

contract AMMFactory {
    mapping(address => mapping(address => mapping(uint24 => address))) public getPool;
    address[] public allPools;

    event PoolCreated(
        address indexed token0,
        address indexed token1,
        uint24 fee,
        address pool
    );

    function createPool(
        address token0,
        address token1,
        uint24 fee
    ) external returns (address pool) {
        require(token0 != token1, "AMMFactory: IDENTICAL_ADDRESSES");
        require(token0 != address(0) && token1 != address(0), "AMMFactory: ZERO_ADDRESS");
        require(fee > 0, "AMMFactory: ZERO_FEE");
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        require(getPool[tokenA][tokenB][fee] == address(0), "AMMFactory: POOL_EXISTS");

        bytes memory bytecode = type(AMMPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB, fee));
        assembly {
            pool := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        require(pool != address(0), "AMMFactory: CREATE_FAILED");

        AMMPool(pool).initialize(tokenA, tokenB, fee);

        getPool[tokenA][tokenB][fee] = pool;
        getPool[tokenB][tokenA][fee] = pool;
        allPools.push(pool);

        emit PoolCreated(tokenA, tokenB, fee, pool);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }
}


