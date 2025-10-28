(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__d04c1540._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/types/transaction.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlockHeaderSchema",
    ()=>BlockHeaderSchema,
    "CategoryKeySchema",
    ()=>CategoryKeySchema,
    "DecodedCallSchema",
    ()=>DecodedCallSchema,
    "ProtocolEntrySchema",
    ()=>ProtocolEntrySchema,
    "RawTransactionSchema",
    ()=>RawTransactionSchema,
    "ReceiptSchema",
    ()=>ReceiptSchema,
    "RouterEntrySchema",
    ()=>RouterEntrySchema,
    "SwapDetailsSchema",
    ()=>SwapDetailsSchema,
    "TokenSchema",
    ()=>TokenSchema,
    "TransactionSchema",
    ()=>TransactionSchema,
    "TxState",
    ()=>TxState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-edge-route] (ecmascript) <export * as z>");
;
var TxState = /*#__PURE__*/ function(TxState) {
    TxState["PENDING"] = "PENDING";
    TxState["INCLUDED"] = "INCLUDED";
    TxState["CONFIRMED"] = "CONFIRMED";
    TxState["FINALIZED"] = "FINALIZED";
    TxState["DROPPED"] = "DROPPED";
    return TxState;
}({});
const CategoryKeySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(); // e.g., "erc20:transfer", "dex:swap"
const DecodedCallSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    function: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    args: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()
    })),
    confidence: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    decoded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const SwapDetailsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    is_swap: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    dex_version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    swap_type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    amount_in: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    amount_out: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    token_in: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    token_out: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string())
});
const TransactionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    nonce: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    to: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    from: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    input: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    gasPrice: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    maxFeePerGas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    maxPriorityFeePerGas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    v: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    r: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    s: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    transactionIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    blockHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    blockNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    gas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    // Extended fields
    category_key: CategoryKeySchema,
    _decoded_fn: DecodedCallSchema.optional(),
    _swap_details: SwapDetailsSchema.optional(),
    _first_seen_ts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    _last_seen_ts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    _score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    _state: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].nativeEnum(TxState),
    _confirmation_depth: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    _inclusion_block: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    _inclusion_ts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    _receipt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional()
});
const RawTransactionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    nonce: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    to: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    from: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    input: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    gasPrice: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    maxFeePerGas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    maxPriorityFeePerGas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    gas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    v: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    r: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    s: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    transactionIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    blockHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    blockNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable()
});
const BlockHeaderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    number: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    timestamp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    transactions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(RawTransactionSchema)
});
const ReceiptSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    transactionHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    transactionIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    blockHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    blockNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    from: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    to: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    cumulativeGasUsed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    effectiveGasPrice: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    gasUsed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    logs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()),
    logsBloom: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const TokenSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    address: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    symbol: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    decimals: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    _last_updated: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional()
});
const RouterEntrySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    address: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    factory: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const ProtocolEntrySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    addresses: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
}),
"[project]/src/lib/types/metrics.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeeHistoryPercentileSchema",
    ()=>FeeHistoryPercentileSchema,
    "FilterStateSchema",
    ()=>FilterStateSchema,
    "FlowMetricsSchema",
    ()=>FlowMetricsSchema,
    "GasBucketsSchema",
    ()=>GasBucketsSchema,
    "GasSuggestionsSchema",
    ()=>GasSuggestionsSchema,
    "MetricsResultSchema",
    ()=>MetricsResultSchema,
    "StateCountsSchema",
    ()=>StateCountsSchema,
    "StateMetricsSchema",
    ()=>StateMetricsSchema,
    "UiSnapshotSchema",
    ()=>UiSnapshotSchema,
    "WatchlistEntrySchema",
    ()=>WatchlistEntrySchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-edge-route] (ecmascript) <export * as z>");
;
const GasBucketsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    gte_100: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    gte_150: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    gte_200: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    gte_300: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
});
const StateCountsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()); // TxState -> count
const FlowMetricsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    flow_ingress_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_included_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_dropped_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_stuck_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
});
const StateMetricsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    state_counts: StateCountsSchema,
    success_rate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    avg_inclusion_time: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    congestion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    flow_ingress_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_included_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_dropped_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    flow_stuck_per_window: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
});
const MetricsResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    total_pending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    total_queued: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    by_type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()),
    large_eth_count: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    gas_buckets: GasBucketsSchema,
    ingress_per_sec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    egress_per_sec: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    age_p50: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    age_p90: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    age_max: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable()
});
const FeeHistoryPercentileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    base_fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    suggested_gas_price: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    suggested_max_fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    suggested_priority_fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    percentiles: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number())
});
const GasSuggestionsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    base_fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    tips: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number())
});
const UiSnapshotSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    timestamp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    summary: MetricsResultSchema.extend({
        state_counts: StateCountsSchema.optional(),
        success_rate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
        avg_inclusion_time: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
        congestion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
        flow_spark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional()
    }),
    opportunities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        rank: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        category_key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        decoded_fn: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional()
    })).optional(),
    live: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional(),
    included: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional(),
    gas: GasSuggestionsSchema.optional(),
    contracts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        address: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        tx_count: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).optional(),
    senders: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        address: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        tx_count: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        success_rate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        total_value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).optional(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        ws_connected: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        rpc_latency_ms: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
        subscriptions_active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()),
        errors: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string())
    }).optional()
});
const WatchlistEntrySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    address: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const FilterStateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    decoded_only: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    protocol_filter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    min_value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    max_value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    search_term: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
}),
"[project]/src/lib/types/index.ts [app-edge-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Export all types from a central location
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types/transaction.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$metrics$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types/metrics.ts [app-edge-route] (ecmascript)");
;
;
}),
"[project]/ [app-edge-route] (unsupported edge import 'timers', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`timers`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'crypto', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`crypto`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'fs', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`fs`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'http', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`http`));
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[project]/ [app-edge-route] (unsupported edge import 'stream', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`stream`));
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[project]/ [app-edge-route] (unsupported edge import 'dns', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`dns`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'os', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`os`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'process', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`process`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'zlib', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`zlib`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'net', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`net`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'tls', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`tls`));
}),
"[project]/ [app-edge-route] (unsupported edge import 'child_process', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`child_process`));
}),
"[project]/src/lib/db/mongo.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closeMongo",
    ()=>closeMongo,
    "getDb",
    ()=>getDb,
    "getReceiptsCollection",
    ()=>getReceiptsCollection,
    "getSignaturesCacheCollection",
    ()=>getSignaturesCacheCollection,
    "getTokensCollection",
    ()=>getTokensCollection,
    "getTransactionsCollection",
    ()=>getTransactionsCollection,
    "initMongo",
    ()=>initMongo,
    "pingMongo",
    ()=>pingMongo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mongodb$2f$lib$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mongodb/lib/index.js [app-edge-route] (ecmascript)");
;
// Global connection cache
let client = null;
let db = null;
// Collections
let transactionsCollection = null;
let receiptsCollection = null;
let signaturesCacheCollection = null;
let tokensCollection = null;
async function initMongo(url = 'mongodb://127.0.0.1:27017/tracker') {
    if (client) return; // Already initialized
    try {
        client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mongodb$2f$lib$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["MongoClient"](url);
        await client.connect();
        db = client.db('tracker');
        // Initialize collections
        transactionsCollection = db.collection('transactions');
        receiptsCollection = db.collection('receipts');
        signaturesCacheCollection = db.collection('signatures_cache');
        tokensCollection = db.collection('tokens');
        // Create indexes for performance
        await transactionsCollection.createIndex({
            hash: 1
        }, {
            unique: true
        });
        await transactionsCollection.createIndex({
            _state: 1,
            _first_seen_ts: -1
        });
        await transactionsCollection.createIndex({
            category_key: 1
        });
        await receiptsCollection.createIndex({
            transactionHash: 1
        }, {
            unique: true
        });
        await signaturesCacheCollection.createIndex({
            selector: 1
        }, {
            unique: true
        });
        await tokensCollection.createIndex({
            address: 1
        }, {
            unique: true
        });
        console.log('✅ MongoDB connected and initialized');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}
function getDb() {
    if (!db) throw new Error('MongoDB not initialized');
    return db;
}
function getTransactionsCollection() {
    if (!transactionsCollection) throw new Error('Transactions collection not initialized');
    return transactionsCollection;
}
function getReceiptsCollection() {
    if (!receiptsCollection) throw new Error('Receipts collection not initialized');
    return receiptsCollection;
}
function getSignaturesCacheCollection() {
    if (!signaturesCacheCollection) throw new Error('Signatures cache collection not initialized');
    return signaturesCacheCollection;
}
function getTokensCollection() {
    if (!tokensCollection) throw new Error('Tokens collection not initialized');
    return tokensCollection;
}
async function closeMongo() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        transactionsCollection = null;
        receiptsCollection = null;
        signaturesCacheCollection = null;
        tokensCollection = null;
        console.log('✅ MongoDB connection closed');
    }
}
async function pingMongo() {
    try {
        if (!db) return false;
        await db.admin().ping();
        return true;
    } catch  {
        return false;
    }
}
}),
"[project]/ [app-edge-route] (unsupported edge import 'path', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`path`));
}),
"[project]/src/server/classify.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROUTERS",
    ()=>ROUTERS,
    "categoryKey",
    ()=>categoryKey,
    "classifyTx",
    ()=>classifyTx,
    "getRouterInfo",
    ()=>getRouterInfo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__ = __turbopack_context__.i("[project]/ [app-edge-route] (unsupported edge import 'fs', ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__ = __turbopack_context__.i("[project]/ [app-edge-route] (unsupported edge import 'path', ecmascript)");
;
;
// Router registry (loaded from JSON)
let ROUTERS = {};
// Load router registries
function loadRouters() {
    if (Object.keys(ROUTERS).length > 0) return;
    try {
        // Load router registry
        const routerPath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/router_registry.json');
        if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(routerPath)) {
            const routerData = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(routerPath, 'utf8'));
            Object.assign(ROUTERS, routerData);
        }
        // Load extended router registry
        const extRouterPath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/router_registry.ext.json');
        if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(extRouterPath)) {
            const extRouterData = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(extRouterPath, 'utf8'));
            Object.assign(ROUTERS, extRouterData);
        }
        console.log(`✅ Loaded ${Object.keys(ROUTERS).length} router entries`);
    } catch (error) {
        console.error('Failed to load router registries:', error);
    }
}
function classifyTx(tx) {
    loadRouters();
    const toAddr = tx.to?.toLowerCase();
    const input = tx.input;
    // Default classification
    const result = {
        category: 'generic',
        protocol: 'unknown',
        version: '',
        confidence: 0.1
    };
    if (!toAddr) return result;
    // Check router registry
    const routerInfo = ROUTERS[toAddr];
    if (routerInfo) {
        result.category = 'dex';
        result.protocol = routerInfo.name || 'DEX';
        result.version = routerInfo.version || '';
        result.confidence = 0.9;
        return result;
    }
    // Check for ERC-20 patterns
    if (input && input.startsWith('0xa9059cbb')) {
        result.category = 'erc20';
        result.protocol = 'ERC-20';
        result.version = '';
        result.confidence = 0.8;
        return result;
    }
    if (input && (input.startsWith('0x095ea7b3') || input.startsWith('0x23b872dd'))) {
        result.category = 'erc20';
        result.protocol = 'ERC-20';
        result.version = '';
        result.confidence = 0.8;
        return result;
    }
    // Check for ETH transfers
    if ((!input || input === '0x') && tx.value && BigInt(tx.value) > 0) {
        result.category = 'eth_transfer';
        result.protocol = 'ETH';
        result.version = '';
        result.confidence = 0.9;
        return result;
    }
    // Check protocols registry for bridges, aggregators, etc.
    try {
        const protocolsPath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/protocols.json');
        if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(protocolsPath)) {
            const protocolsData = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(protocolsPath, 'utf8'));
            for (const [category, protocols] of Object.entries(protocolsData)){
                if (Array.isArray(protocols)) {
                    for (const protocol of protocols){
                        if (protocol.addresses && protocol.addresses.includes(toAddr)) {
                            result.category = category;
                            result.protocol = protocol.name;
                            result.version = '';
                            result.confidence = 0.8;
                            return result;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Protocol classification error:', error);
    }
    // Check for NFT patterns (ERC-721/1155)
    if (input && (input.includes('70a08231') || input.includes('6352211e'))) {
        result.category = 'erc721';
        result.protocol = 'NFT';
        result.version = '';
        result.confidence = 0.7;
        return result;
    }
    return result;
}
function categoryKey(classification) {
    const { category, protocol, version } = classification;
    if (category === 'dex') {
        return `${category}:${protocol.toLowerCase().replace(/\s+/g, '-')}`;
    }
    if (category === 'erc20') {
        return 'erc20:transfer';
    }
    if (category === 'eth_transfer') {
        return 'eth_transfer:transfer';
    }
    if (category === 'erc721' || category === 'erc1155') {
        return `${category}:transfer`;
    }
    return `${category}:call`;
}
function getRouterInfo(address) {
    loadRouters();
    return ROUTERS[address.toLowerCase()] || null;
}
;
}),
"[project]/src/lib/util/hex.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checksumAddress",
    ()=>checksumAddress,
    "decodeAddressArray",
    ()=>decodeAddressArray,
    "formatEthValue",
    ()=>formatEthValue,
    "formatGasValue",
    ()=>formatGasValue,
    "hexToBigInt",
    ()=>hexToBigInt,
    "hexToNumber",
    ()=>hexToNumber,
    "isValidAddress",
    ()=>isValidAddress,
    "normalizeAddress",
    ()=>normalizeAddress,
    "numberToHex",
    ()=>numberToHex,
    "selector",
    ()=>selector,
    "truncateHash",
    ()=>truncateHash,
    "wordAt",
    ()=>wordAt
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = /*#__PURE__*/ __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$crypto$2f$keccak$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/crypto/keccak.js [app-edge-route] (ecmascript)");
;
function selector(input) {
    if (!input || input === '0x') return null;
    try {
        const data = input.startsWith('0x') ? input.slice(2) : input;
        if (data.length < 8) return null;
        return data.slice(0, 8).toLowerCase();
    } catch  {
        return null;
    }
}
function wordAt(input, position) {
    const data = input.startsWith('0x') ? input.slice(2) : input;
    const start = position * 64;
    const end = start + 64;
    return data.slice(start, end);
}
function hexToNumber(hex) {
    if (!hex) return 0;
    try {
        return parseInt(hex.startsWith('0x') ? hex : `0x${hex}`, 16);
    } catch  {
        return 0;
    }
}
function hexToBigInt(hex) {
    if (!hex) return 0n;
    try {
        return BigInt(hex.startsWith('0x') ? hex : `0x${hex}`);
    } catch  {
        return 0n;
    }
}
function numberToHex(num) {
    return `0x${num.toString(16)}`;
}
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
function normalizeAddress(address) {
    if (!isValidAddress(address)) return address;
    return address.toLowerCase();
}
function checksumAddress(address) {
    if (!isValidAddress(address)) return address;
    const addr = address.toLowerCase().replace('0x', '');
    const hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$crypto$2f$keccak$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["keccak256"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(addr, 'utf8')).replace('0x', '');
    let checksumAddress = '0x';
    for(let i = 0; i < addr.length; i++){
        const char = addr[i];
        if (parseInt(hash[i], 16) >= 8) {
            checksumAddress += char.toUpperCase();
        } else {
            checksumAddress += char;
        }
    }
    return checksumAddress;
}
function decodeAddressArray(input, offsetWords) {
    const addresses = [];
    const data = input.startsWith('0x') ? input.slice(2) : input;
    try {
        // Get array length at offset
        const lengthWord = wordAt(`0x${data}`, offsetWords);
        const length = hexToNumber(lengthWord);
        // Get addresses starting from offset + 1
        for(let i = 0; i < length && i < 20; i++){
            const addrWord = wordAt(`0x${data}`, offsetWords + 1 + i);
            if (addrWord.length >= 40) {
                const addr = `0x${addrWord.slice(-40)}`;
                if (isValidAddress(addr)) {
                    addresses.push(normalizeAddress(addr));
                }
            }
        }
    } catch  {
    // Ignore decode errors
    }
    return addresses;
}
function truncateHash(hash, startChars = 6, endChars = 4) {
    if (!hash || hash.length <= startChars + endChars + 2) return hash;
    return `${hash.slice(0, startChars + 2)}...${hash.slice(-endChars)}`;
}
function formatEthValue(wei, decimals = 4) {
    try {
        const value = typeof wei === 'string' ? hexToBigInt(wei) : wei;
        const eth = Number(value) / 1e18;
        if (eth === 0) return '0';
        if (eth < 0.001) {
            return eth.toFixed(6);
        } else if (eth < 1) {
            return eth.toFixed(4);
        } else {
            return eth.toFixed(2);
        }
    } catch  {
        return wei.toString();
    }
}
function formatGasValue(gas) {
    if (gas >= 1e9) {
        return `${(gas / 1e9).toFixed(1)}B`;
    } else if (gas >= 1e6) {
        return `${(gas / 1e6).toFixed(1)}M`;
    } else if (gas >= 1e3) {
        return `${(gas / 1e3).toFixed(1)}K`;
    } else {
        return gas.toString();
    }
}
}),
"[project]/src/server/decoding/abiRegistry.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbiRegistry",
    ()=>AbiRegistry,
    "getAbiRegistry",
    ()=>getAbiRegistry,
    "initAbiRegistry",
    ()=>initAbiRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__ = __turbopack_context__.i("[project]/ [app-edge-route] (unsupported edge import 'fs', ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__ = __turbopack_context__.i("[project]/ [app-edge-route] (unsupported edge import 'path', ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/mongo.ts [app-edge-route] (ecmascript)");
;
;
;
class AbiRegistry {
    signatures = new Map();
    reverseSignatures = new Map();
    loaded = false;
    constructor(){
        this.loadSignatures();
    }
    // Load signatures from JSON files
    loadSignatures() {
        if (this.loaded) return;
        try {
            // Load main signatures
            const signaturesPath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/signatures.json');
            if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(signaturesPath)) {
                const signaturesData = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(signaturesPath, 'utf8'));
                for (const [selector, signature] of Object.entries(signaturesData)){
                    const sel = selector.toLowerCase();
                    this.signatures.set(sel, signature);
                    this.reverseSignatures.set(signature, sel);
                }
            }
            // Load selectors mapping
            const selectorsPath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/selectors.json');
            if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(selectorsPath)) {
                const selectorsData = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(selectorsPath, 'utf8'));
            // Process selectors if needed
            }
            console.log(`✅ Loaded ${this.signatures.size} signatures`);
            this.loaded = true;
        } catch (error) {
            console.error('Failed to load signatures:', error);
        }
    }
    // Resolve signature from selector
    resolveSignature(selector) {
        const sel = selector.toLowerCase();
        return this.signatures.get(sel) || null;
    }
    // Get selector from signature
    getSelector(signature) {
        return this.reverseSignatures.get(signature) || null;
    }
    // Cache discovered signature (to MongoDB and optionally JSON)
    async cacheDiscoveredSignature(selector, signature) {
        const sel = selector.toLowerCase();
        const sig = signature.trim();
        if (!sel || !sig) return;
        // Don't overwrite existing signatures
        if (this.signatures.has(sel)) return;
        try {
            // Add to in-memory cache
            this.signatures.set(sel, sig);
            this.reverseSignatures.set(sig, sel);
            // Persist to MongoDB
            const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getSignaturesCacheCollection"])();
            await collection.updateOne({
                selector: sel
            }, {
                $set: {
                    selector: sel,
                    signature: sig
                }
            }, {
                upsert: true
            });
            // Optionally save to JSON file as backup
            this.saveToJsonFile(sel, sig);
        } catch (error) {
            console.error('Failed to cache signature:', error);
        }
    }
    // Load cached signatures from MongoDB
    async loadCachedSignatures() {
        try {
            const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getSignaturesCacheCollection"])();
            const cached = await collection.find({}).toArray();
            for (const item of cached){
                const sel = item.selector.toLowerCase();
                const sig = item.signature.trim();
                // Only add if not already in main signatures
                if (!this.signatures.has(sel)) {
                    this.signatures.set(sel, sig);
                    this.reverseSignatures.set(sig, sel);
                }
            }
            console.log(`✅ Loaded ${cached.length} cached signatures from MongoDB`);
        } catch (error) {
            console.error('Failed to load cached signatures:', error);
        }
    }
    // Save to JSON file as backup
    saveToJsonFile(selector, signature) {
        try {
            const cachePath = __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$path$272c$__ecmascript$29$__["default"].join(process.cwd(), 'src/server/catalog/4byte_cache.json');
            let cache = {};
            if (__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].existsSync(cachePath)) {
                cache = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].readFileSync(cachePath, 'utf8'));
            }
            cache[selector] = signature;
            __TURBOPACK__imported__module__$5b$project$5d2f$__$5b$app$2d$edge$2d$route$5d$__$28$unsupported__edge__import__$27$fs$272c$__ecmascript$29$__["default"].writeFileSync(cachePath, JSON.stringify(cache, null, 2));
        } catch (error) {
        // Ignore file write errors
        }
    }
    // Get all signatures (for debugging)
    getAllSignatures() {
        const result = {};
        for (const [sel, sig] of this.signatures){
            result[sel] = sig;
        }
        return result;
    }
    // Get signature count
    getSignatureCount() {
        return this.signatures.size;
    }
}
// Global registry instance
let registry = null;
function getAbiRegistry() {
    if (!registry) {
        registry = new AbiRegistry();
    }
    return registry;
}
async function initAbiRegistry() {
    const reg = getAbiRegistry();
    await reg.loadCachedSignatures();
}
}),
"[project]/src/server/decoding/coreDecoder.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CoreDecoder",
    ()=>CoreDecoder,
    "getCoreDecoder",
    ()=>getCoreDecoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/util/hex.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$abiRegistry$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/decoding/abiRegistry.ts [app-edge-route] (ecmascript)");
;
;
class CoreDecoder {
    registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$abiRegistry$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getAbiRegistry"])();
    // Main decode function
    async decodeTransaction(tx) {
        try {
            const input = tx.input;
            if (!input || input === '0x') {
                return {
                    decoded: false
                };
            }
            // Try ABI-based decoding first
            const abiResult = await this.decodeWithAbi(input);
            if (abiResult) {
                return {
                    decoded: true,
                    function: abiResult
                };
            }
            // Fall back to heuristics
            const heuristicResult = this.decodeWithHeuristics(input);
            if (heuristicResult) {
                return {
                    decoded: true,
                    function: heuristicResult
                };
            }
            // Generic contract call
            const genericResult = this.decodeGeneric(input);
            return {
                decoded: true,
                function: genericResult
            };
        } catch (error) {
            return {
                decoded: false,
                error: `Decode error: ${error instanceof Error ? error.message : 'Unknown'}`
            };
        }
    }
    // Decode using ABI registry
    async decodeWithAbi(input) {
        const sel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["selector"])(input);
        if (!sel) return null;
        const signature = this.registry.resolveSignature(sel);
        if (!signature) return null;
        try {
            // Parse signature to extract function name and parameter types
            const sigMatch = signature.match(/^([^(]+)\(([^)]*)\)$/);
            if (!sigMatch) return null;
            const functionName = sigMatch[1];
            const paramTypes = sigMatch[2].split(',').filter((p)=>p.trim());
            // Decode parameters (simplified - would need full ABI decoder for complex types)
            const args = [];
            const data = input.startsWith('0x') ? input.slice(2) : input;
            for(let i = 0; i < paramTypes.length; i++){
                const paramType = paramTypes[i].trim();
                if (paramType === 'address') {
                    const word = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(`0x${data}`, i + 1);
                    if (word.length >= 40) {
                        args.push(`0x${word.slice(-40).toLowerCase()}`);
                    } else {
                        args.push('0x0000000000000000000000000000000000000000');
                    }
                } else if (paramType.startsWith('uint') || paramType.startsWith('int')) {
                    const word = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(`0x${data}`, i + 1);
                    const num = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(word);
                    args.push(num);
                } else if (paramType === 'bool') {
                    const word = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(`0x${data}`, i + 1);
                    const num = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(word);
                    args.push(num !== 0);
                } else {
                    // Unknown type - include raw data
                    const word = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(`0x${data}`, i + 1);
                    args.push(word || '0x0');
                }
            }
            return {
                function: functionName,
                args: args.map((value, index)=>({
                        name: `arg${index}`,
                        type: paramTypes[index] || 'unknown',
                        value
                    })),
                confidence: 0.9
            };
        } catch (error) {
            console.error('ABI decode error:', error);
            return null;
        }
    }
    // Decode using heuristics
    decodeWithHeuristics(input) {
        const data = input.startsWith('0x') ? input.slice(2) : input;
        const dataLen = data.length;
        const sel = data.slice(0, 8).toLowerCase();
        // ERC-20 transfer(address,uint256)
        if (sel === 'a9059cbb' && dataLen >= 8 + 64 * 2) {
            try {
                const to = `0x${data.slice(8 + 24, 8 + 64)}`;
                const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(`0x${data.slice(8 + 64, 8 + 128)}`);
                return {
                    function: 'transfer',
                    args: [
                        {
                            name: 'to',
                            type: 'address',
                            value: to.toLowerCase()
                        },
                        {
                            name: 'amount',
                            type: 'uint256',
                            value: amount
                        }
                    ],
                    confidence: 0.8
                };
            } catch  {
                return null;
            }
        }
        // ERC-20 approve(address,uint256)
        if (sel === '095ea7b3' && dataLen >= 8 + 64 * 2) {
            try {
                const spender = `0x${data.slice(8 + 24, 8 + 64)}`;
                const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(`0x${data.slice(8 + 64, 8 + 128)}`);
                this.registry.cacheDiscoveredSignature(sel, 'approve(address,uint256)');
                return {
                    function: 'approve',
                    args: [
                        {
                            name: 'spender',
                            type: 'address',
                            value: spender.toLowerCase()
                        },
                        {
                            name: 'amount',
                            type: 'uint256',
                            value: amount
                        }
                    ],
                    confidence: 0.7
                };
            } catch  {
                return null;
            }
        }
        // ERC-20 transferFrom(address,address,uint256)
        if (sel === '23b872dd' && dataLen >= 8 + 64 * 3) {
            try {
                const from = `0x${data.slice(8 + 24, 8 + 64)}`;
                const to = `0x${data.slice(8 + 64 + 24, 8 + 64 * 2)}`;
                const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(`0x${data.slice(8 + 64 * 2, 8 + 64 * 3)}`);
                this.registry.cacheDiscoveredSignature(sel, 'transferFrom(address,address,uint256)');
                return {
                    function: 'transferFrom',
                    args: [
                        {
                            name: 'from',
                            type: 'address',
                            value: from.toLowerCase()
                        },
                        {
                            name: 'to',
                            type: 'address',
                            value: to.toLowerCase()
                        },
                        {
                            name: 'amount',
                            type: 'uint256',
                            value: amount
                        }
                    ],
                    confidence: 0.7
                };
            } catch  {
                return null;
            }
        }
        // Multicall detection (dynamic bytes array)
        if (dataLen >= 8 + 64 * 2) {
            try {
                const offsetWord = data.slice(8, 8 + 64);
                if (offsetWord === '0000000000000000000000000000000000000000000000000000000000000020') {
                    const lengthWord = data.slice(8 + 64, 8 + 128);
                    const arrayLen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(`0x${lengthWord}`);
                    if (1 <= arrayLen && arrayLen <= 50) {
                        this.registry.cacheDiscoveredSignature(sel, 'multicall(bytes[])');
                        return {
                            function: 'multicall',
                            args: [
                                {
                                    name: 'calls',
                                    type: 'bytes[]',
                                    value: `${arrayLen} calls`
                                }
                            ],
                            confidence: 0.6
                        };
                    }
                }
            } catch  {
            // Ignore multicall detection errors
            }
        }
        // ERC-721/1155 transfer patterns
        if (dataLen >= 8 + 64 * 4) {
            try {
                const addr1 = `0x${data.slice(8 + 24, 8 + 64)}`;
                const addr2 = `0x${data.slice(8 + 64 + 24, 8 + 128)}`;
                if (addr1.startsWith('0x') && addr1.length === 42 && addr2.startsWith('0x') && addr2.length === 42) {
                    if (dataLen >= 8 + 64 * 4) {
                        const tokenId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(`0x${data.slice(8 + 192, 8 + 256)}`);
                        return {
                            function: 'transferFrom',
                            args: [
                                {
                                    name: 'from',
                                    type: 'address',
                                    value: addr1.toLowerCase()
                                },
                                {
                                    name: 'to',
                                    type: 'address',
                                    value: addr2.toLowerCase()
                                },
                                {
                                    name: 'tokenId',
                                    type: 'uint256',
                                    value: tokenId
                                }
                            ],
                            confidence: 0.7
                        };
                    }
                }
            } catch  {
                return null;
            }
        }
        return null;
    }
    // Generic contract call fallback
    decodeGeneric(input) {
        const sel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["selector"])(input);
        const dataHex = input.startsWith('0x') ? input.slice(2) : input;
        const dataLen = dataHex.length;
        // Create a generic signature for caching
        const genericSig = 'contract_call(bytes)';
        // Cache this pattern
        if (sel) {
            this.registry.cacheDiscoveredSignature(sel, genericSig).catch(()=>{});
        }
        return {
            function: 'contract_call',
            args: [
                {
                    name: 'selector',
                    type: 'bytes4',
                    value: sel ? `0x${sel}` : '0x00000000'
                },
                {
                    name: 'data',
                    type: 'bytes',
                    value: dataLen > 136 ? `0x${dataHex.slice(8, 136)}...` : `0x${dataHex.slice(8)}`
                }
            ],
            confidence: 0.3
        };
    }
    // Decode swap details for DEX transactions
    decodeSwapDetails(tx) {
        const result = {
            is_swap: false,
            dex_version: '-',
            swap_type: '-',
            amount_in: null,
            amount_out: null,
            token_in: null,
            token_out: null,
            path: []
        };
        const toAddr = tx.to?.toLowerCase();
        const sel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["selector"])(tx.input);
        if (!sel || !toAddr) return result;
        // Check router registries (simplified)
        // In real implementation, load from router_registry.json
        // DEX selector detection
        const dexSelectors = [
            '38ed1739',
            '18cbafe5',
            '7ff36ab5',
            '5c11d795',
            '8803dbee',
            '4a25d94a',
            '791ac947',
            '022c0d9f',
            '414bf389',
            'db3e2198',
            'c04b8d59',
            '04e45aaf',
            'e449022e',
            '5ae401dc',
            '4bb278f3',
            '252dba42'
        ];
        if (dexSelectors.includes(sel)) {
            result.is_swap = true;
            // DEX version detection
            if ([
                '38ed1739',
                '18cbafe5',
                '7ff36ab5',
                '5c11d795',
                '8803dbee',
                '4a25d94a',
                '791ac947'
            ].includes(sel)) {
                result.dex_version = 'v2';
            } else if ([
                '414bf389',
                'db3e2198',
                'c04b8d59',
                '04e45aaf'
            ].includes(sel)) {
                result.dex_version = 'v3';
            } else {
                result.dex_version = 'agg';
            }
            // Decode amounts and tokens based on selector
            const input = tx.input.startsWith('0x') ? tx.input.slice(2) : tx.input;
            try {
                switch(sel){
                    case '38ed1739':
                        result.swap_type = 'exactTokensForTokens';
                        result.amount_in = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 1));
                        result.amount_out = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 2));
                        result.path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["decodeAddressArray"])(input, 3);
                        if (result.path.length >= 2) {
                            result.token_in = result.path[0];
                            result.token_out = result.path[result.path.length - 1];
                        }
                        break;
                    case '414bf389':
                        result.swap_type = 'exactInputSingle';
                        result.amount_in = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 4));
                        result.amount_out = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 5));
                        // Token addresses from input data
                        const tokenInWord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 2);
                        const tokenOutWord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["wordAt"])(tx.input, 3);
                        if (tokenInWord.length >= 40) {
                            result.token_in = `0x${tokenInWord.slice(-40)}`.toLowerCase();
                        }
                        if (tokenOutWord.length >= 40) {
                            result.token_out = `0x${tokenOutWord.slice(-40)}`.toLowerCase();
                        }
                        break;
                }
            } catch (error) {
                console.error('Swap decode error:', error);
            }
        }
        return result;
    }
}
// Global decoder instance
let decoder = null;
function getCoreDecoder() {
    if (!decoder) {
        decoder = new CoreDecoder();
    }
    return decoder;
}
}),
"[project]/src/server/decoding/decoders.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeFunctionAndArgs",
    ()=>decodeFunctionAndArgs,
    "decodeSwapDetails",
    ()=>decodeSwapDetails,
    "getFunctionArgs",
    ()=>getFunctionArgs,
    "getFunctionName",
    ()=>getFunctionName,
    "isDecoded",
    ()=>isDecoded
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$coreDecoder$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/decoding/coreDecoder.ts [app-edge-route] (ecmascript)");
;
async function decodeFunctionAndArgs(tx) {
    const decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$coreDecoder$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getCoreDecoder"])();
    const result = await decoder.decodeTransaction(tx);
    if (result.decoded && result.function) {
        return result.function;
    }
    return null;
}
function decodeSwapDetails(tx) {
    const decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$coreDecoder$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getCoreDecoder"])();
    return decoder.decodeSwapDetails(tx);
}
async function isDecoded(tx) {
    const result = await decodeFunctionAndArgs(tx);
    return result !== null;
}
async function getFunctionName(tx) {
    const decoded = await decodeFunctionAndArgs(tx);
    return decoded?.function || '-';
}
async function getFunctionArgs(tx) {
    const decoded = await decodeFunctionAndArgs(tx);
    return decoded?.args || [];
}
}),
"[project]/src/server/state/state.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrackerState",
    ()=>TrackerState,
    "getTrackerState",
    ()=>getTrackerState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$index$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/types/index.ts [app-edge-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types/transaction.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/mongo.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$classify$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/classify.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$decoders$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/decoding/decoders.ts [app-edge-route] (ecmascript)");
;
;
;
;
class TrackerState {
    txs = new Map();
    maxSize = 10000;
    persistenceEnabled = true;
    constructor(){
        // Optional: load recent transactions from MongoDB on startup
        this.loadRecentState();
    }
    // Upsert transaction (add or update)
    async upsert(tx) {
        const hash = tx.hash.toLowerCase();
        // Classify if not already classified
        if (!tx.category_key) {
            const classification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$classify$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["classifyTx"])(tx);
            tx.category_key = `${classification.category}:${classification.protocol.toLowerCase()}`;
        }
        // Decode function if not already decoded and has input
        if (!tx._decoded_fn && tx.input && tx.input !== '0x') {
            try {
                const decoded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$decoding$2f$decoders$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["decodeFunctionAndArgs"])(tx);
                if (decoded) {
                    tx._decoded_fn = decoded;
                }
            } catch (error) {
                console.error(`Failed to decode tx ${hash}:`, error);
            }
        }
        // Update in-memory state
        this.txs.set(hash, {
            ...tx
        });
        // Persist to MongoDB
        if (this.persistenceEnabled) {
            try {
                const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTransactionsCollection"])();
                await collection.updateOne({
                    hash
                }, {
                    $set: tx
                }, {
                    upsert: true
                });
            } catch (error) {
                console.error('Failed to persist transaction:', error);
            }
        }
        // Maintain size limit
        if (this.txs.size > this.maxSize) {
            // Remove oldest entries (simple FIFO)
            const entries = Array.from(this.txs.entries());
            entries.sort((a, b)=>(a[1]._first_seen_ts || 0) - (b[1]._first_seen_ts || 0));
            const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1)); // Remove 10%
            for (const [hash] of toRemove){
                this.txs.delete(hash);
            }
        }
    }
    // Get transaction by hash
    getTx(hash) {
        return this.txs.get(hash.toLowerCase()) || null;
    }
    // Mark transaction as included
    async markIncluded(hash, blockNumber) {
        const tx = this.getTx(hash);
        if (!tx) return;
        tx._state = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].INCLUDED;
        tx._inclusion_block = blockNumber;
        tx._inclusion_ts = Date.now() / 1000;
        await this.upsert(tx);
    }
    // Set receipt for transaction
    async setReceipt(hash, receipt) {
        const tx = this.getTx(hash);
        if (!tx) return;
        tx._receipt = receipt;
        // Persist receipt
        try {
            const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getReceiptsCollection"])();
            await collection.updateOne({
                transactionHash: hash
            }, {
                $set: receipt
            }, {
                upsert: true
            });
        } catch (error) {
            console.error('Failed to persist receipt:', error);
        }
        await this.upsert(tx);
    }
    // Get state snapshot
    async snapshot(limit = 1000) {
        const txs = Array.from(this.txs.values());
        // Sort by most recent first
        txs.sort((a, b)=>(b._first_seen_ts || 0) - (a._first_seen_ts || 0));
        return {
            txs: txs.slice(0, limit)
        };
    }
    // Get included transactions
    async snapshotIncluded(limit = 200) {
        const included = Array.from(this.txs.values()).filter((tx)=>tx._state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].INCLUDED || tx._state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].CONFIRMED || tx._state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].FINALIZED).sort((a, b)=>(b._inclusion_ts || 0) - (a._inclusion_ts || 0));
        return included.slice(0, limit);
    }
    // Update confirmation depths
    async updateConfirmationDepth(currentBlock) {
        const updates = [];
        for (const tx of this.txs.values()){
            if (tx._state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].INCLUDED && tx._inclusion_block) {
                const inclusionBlock = parseInt(tx._inclusion_block);
                if (!isNaN(inclusionBlock)) {
                    const depth = currentBlock - inclusionBlock;
                    tx._confirmation_depth = Math.max(0, depth);
                    // Update state based on confirmations
                    if (depth >= 12) {
                        tx._state = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].FINALIZED;
                    } else if (depth >= 1) {
                        tx._state = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].CONFIRMED;
                    }
                    updates.push(this.upsert(tx));
                }
            }
        }
        await Promise.allSettled(updates);
    }
    // Get transaction count by state
    getStateCounts() {
        const counts = {};
        for (const tx of this.txs.values()){
            const state = tx._state || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].PENDING;
            counts[state] = (counts[state] || 0) + 1;
        }
        return counts;
    }
    // Get metrics
    getMetrics() {
        const counts = this.getStateCounts();
        return {
            total: this.txs.size,
            pending: counts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].PENDING] || 0,
            included: counts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].INCLUDED] || 0,
            confirmed: counts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].CONFIRMED] || 0,
            finalized: counts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].FINALIZED] || 0,
            dropped: counts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].DROPPED] || 0
        };
    }
    // Load recent state from MongoDB
    async loadRecentState() {
        try {
            const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mongo$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTransactionsCollection"])();
            const recent = await collection.find({}).sort({
                _first_seen_ts: -1
            }).limit(1000).toArray();
            for (const doc of recent){
                this.txs.set(doc.hash.toLowerCase(), doc);
            }
            console.log(`✅ Loaded ${recent.length} transactions from MongoDB`);
        } catch (error) {
            console.error('Failed to load recent state:', error);
        }
    }
    // Clear state (for testing)
    clear() {
        this.txs.clear();
    }
}
// Global state instance
let state = null;
function getTrackerState() {
    if (!state) {
        state = new TrackerState();
    }
    return state;
}
}),
"[project]/src/lib/config.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Configuration loader for tracker_web
__turbopack_context__.s([
    "config",
    ()=>config,
    "getConfig",
    ()=>getConfig,
    "loadConfig",
    ()=>loadConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-edge-route] (ecmascript) <export * as z>");
;
// Environment schema
const configSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    EXECUTION_WS_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().default('ws://127.0.0.1:8545'),
    MONGO_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().default('mongodb://127.0.0.1:27017/tracker'),
    JWT_PATH: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    ENABLE_4BYTE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().transform((val)=>val === 'true').default('false'),
    UI_REFRESH_MS: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().transform(Number).default('200'),
    RECEIPT_CONCURRENCY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().transform(Number).default('8'),
    TOKEN_CONCURRENCY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().transform(Number).default('4')
});
function loadConfig() {
    return configSchema.parse(process.env);
}
// Get config (cached)
let cachedConfig = null;
function getConfig() {
    if (!cachedConfig) {
        cachedConfig = loadConfig();
    }
    return cachedConfig;
}
const config = getConfig();
}),
"[project]/src/server/rpc/wsClient.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WsJsonRpc",
    ()=>WsJsonRpc,
    "closeWsClient",
    ()=>closeWsClient,
    "getWsClient",
    ()=>getWsClient
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = /*#__PURE__*/ __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ws$2f$browser$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ws/browser.js [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:events [external] (node:events, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config.ts [app-edge-route] (ecmascript)");
;
;
;
class WsJsonRpc extends __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__["EventEmitter"] {
    ws = null;
    url;
    jwtSecret = null;
    connected = false;
    connecting = false;
    reconnectDelay = 2000;
    maxReconnectDelay = 30000;
    requestId = 1;
    pendingRequests = new Map();
    subscriptions = new Map();
    constructor(url, jwtPath){
        super();
        this.url = url;
        // Load JWT if provided
        if (jwtPath) {
            try {
                const fs = __turbopack_context__.r("[project]/ [app-edge-route] (unsupported edge import 'fs', ecmascript)");
                this.jwtSecret = fs.readFileSync(jwtPath, 'utf8').trim();
                if (this.jwtSecret.startsWith('0x')) {
                    this.jwtSecret = this.jwtSecret.slice(2);
                }
            } catch (error) {
                console.warn('Failed to load JWT:', error);
            }
        }
    }
    // Connect to WebSocket
    async connect() {
        if (this.connected || this.connecting) return;
        this.connecting = true;
        try {
            // Create JWT token if available
            let headers = {};
            if (this.jwtSecret) {
                const jwt = (()=>{
                    const e = new Error("Cannot find module 'jsonwebtoken'");
                    e.code = 'MODULE_NOT_FOUND';
                    throw e;
                })();
                const token = jwt.sign({
                    iat: Math.floor(Date.now() / 1000)
                }, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(this.jwtSecret, 'hex'), {
                    algorithm: 'HS256'
                });
                headers['Authorization'] = `Bearer ${token}`;
            }
            this.ws = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ws$2f$browser$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["default"](this.url, {
                headers
            });
            return new Promise((resolve, reject)=>{
                if (!this.ws) return reject(new Error('WebSocket creation failed'));
                const timeout = setTimeout(()=>{
                    this.ws?.close();
                    reject(new Error('Connection timeout'));
                }, 10000);
                this.ws.on('open', ()=>{
                    clearTimeout(timeout);
                    this.connected = true;
                    this.connecting = false;
                    this.emit('connected');
                    console.log('✅ WebSocket connected');
                    resolve();
                });
                this.ws.on('message', (data)=>{
                    this.handleMessage(data);
                });
                this.ws.on('error', (error)=>{
                    clearTimeout(timeout);
                    this.connecting = false;
                    console.error('WebSocket error:', error);
                    reject(error);
                });
                this.ws.on('close', ()=>{
                    this.connected = false;
                    this.connecting = false;
                    this.emit('disconnected');
                    console.log('WebSocket disconnected, attempting reconnect...');
                    this.scheduleReconnect();
                });
            });
        } catch (error) {
            this.connecting = false;
            throw error;
        }
    }
    // Send RPC request with timeout
    async rpc(method, params = [], timeoutMs = 10000) {
        if (!this.connected) {
            await this.connect();
        }
        const id = this.requestId++;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };
        return new Promise((resolve, reject)=>{
            const timeout = setTimeout(()=>{
                this.pendingRequests.delete(id);
                reject(new Error(`RPC timeout: ${method}`));
            }, timeoutMs);
            this.pendingRequests.set(id, {
                resolve,
                reject,
                timeout
            });
            try {
                if (this.ws && this.ws.readyState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ws$2f$browser$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["default"].OPEN) {
                    this.ws.send(JSON.stringify(request));
                } else {
                    clearTimeout(timeout);
                    reject(new Error('WebSocket not connected'));
                }
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    // Subscribe to events
    async subscribe(event, callback) {
        if (!this.connected) {
            await this.connect();
        }
        const subscriptionId = await this.rpc('eth_subscribe', [
            event
        ]);
        this.subscriptions.set(subscriptionId, callback);
        return subscriptionId;
    }
    // Unsubscribe from events
    async unsubscribe(subscriptionId) {
        const result = await this.rpc('eth_unsubscribe', [
            subscriptionId
        ]);
        this.subscriptions.delete(subscriptionId);
        return result;
    }
    // Handle incoming messages
    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            // Handle RPC responses
            if (message.id && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id);
                this.pendingRequests.delete(message.id);
                clearTimeout(pending.timeout);
                if (message.error) {
                    pending.reject(new Error(`RPC Error: ${message.error.message}`));
                } else {
                    pending.resolve(message.result);
                }
                return;
            }
            // Handle subscriptions
            if (message.method === 'eth_subscription') {
                const params = message.params;
                if (params && params.subscription) {
                    const callback = this.subscriptions.get(params.subscription);
                    if (callback) {
                        callback(params.result);
                    }
                }
            }
            // Emit for external listeners
            this.emit('message', message);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }
    // Schedule reconnect with exponential backoff
    scheduleReconnect() {
        setTimeout(()=>{
            this.connect().catch(()=>{
            // Reconnect failed, will retry again
            });
        }, this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }
    // Close connection
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        // Reject all pending requests
        for (const [id, pending] of this.pendingRequests){
            clearTimeout(pending.timeout);
            pending.reject(new Error('WebSocket closed'));
        }
        this.pendingRequests.clear();
    }
    // Check if connected
    isConnected() {
        return this.connected && this.ws?.readyState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ws$2f$browser$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["default"].OPEN;
    }
}
// Global WebSocket client instance
let wsClient = null;
function getWsClient() {
    if (!wsClient) {
        wsClient = new WsJsonRpc(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["config"].EXECUTION_WS_URL, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["config"].JWT_PATH);
    }
    return wsClient;
}
function closeWsClient() {
    if (wsClient) {
        wsClient.close();
        wsClient = null;
    }
}
}),
"[project]/src/server/ingest/txpool.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupDroppedTransactions",
    ()=>cleanupDroppedTransactions,
    "getTxpoolContent",
    ()=>getTxpoolContent,
    "getTxpoolStatus",
    ()=>getTxpoolStatus,
    "processTxpoolContent",
    ()=>processTxpoolContent,
    "startTxpoolMonitoring",
    ()=>startTxpoolMonitoring,
    "stopTxpoolMonitoring",
    ()=>stopTxpoolMonitoring
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$index$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/types/index.ts [app-edge-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types/transaction.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$rpc$2f$wsClient$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/rpc/wsClient.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/state/state.ts [app-edge-route] (ecmascript)");
;
;
;
async function getTxpoolStatus() {
    try {
        const wsClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$rpc$2f$wsClient$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getWsClient"])();
        const status = await wsClient.rpc('txpool_status', []);
        if (status && typeof status === 'object') {
            return {
                pending: status.pending || '0x0',
                queued: status.queued || '0x0'
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to get txpool status:', error);
        return null;
    }
}
async function getTxpoolContent() {
    try {
        const wsClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$rpc$2f$wsClient$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getWsClient"])();
        const content = await wsClient.rpc('txpool_content', []);
        if (content && typeof content === 'object') {
            return {
                pending: content.pending || {},
                queued: content.queued || {}
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to get txpool content:', error);
        return null;
    }
}
async function processTxpoolContent() {
    try {
        const content = await getTxpoolContent();
        if (!content) return;
        const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTrackerState"])();
        let updated = 0;
        // Process pending transactions
        for (const [sender, txs] of Object.entries(content.pending)){
            for (const [nonce, tx] of Object.entries(txs)){
                if (tx && tx.hash) {
                    // Check if we already have this transaction
                    const existing = state.getTx(tx.hash);
                    if (!existing) {
                        try {
                            // Add new pending transaction
                            const transaction = {
                                type: tx.type || '0x2',
                                nonce: tx.nonce,
                                to: tx.to,
                                from: tx.from,
                                value: tx.value,
                                input: tx.input,
                                gasPrice: tx.gasPrice,
                                maxFeePerGas: tx.maxFeePerGas,
                                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                                gas: tx.gas,
                                v: tx.v,
                                r: tx.r,
                                s: tx.s,
                                hash: tx.hash,
                                transactionIndex: null,
                                blockHash: null,
                                blockNumber: null,
                                category_key: '',
                                _first_seen_ts: Date.now() / 1000,
                                _last_seen_ts: Date.now() / 1000,
                                _score: 0,
                                _state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].PENDING,
                                _confirmation_depth: 0
                            };
                            await state.upsert(transaction);
                            updated++;
                        } catch (error) {
                            console.error(`Failed to add txpool tx ${tx.hash}:`, error);
                        }
                    }
                }
            }
        }
        if (updated > 0) {
            console.log(`📊 Updated ${updated} transactions from txpool`);
        }
    } catch (error) {
        console.error('Failed to process txpool content:', error);
    }
}
async function cleanupDroppedTransactions() {
    try {
        const content = await getTxpoolContent();
        if (!content) return;
        const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTrackerState"])();
        const pendingHashes = new Set();
        // Collect all hashes currently in txpool
        for (const [sender, txs] of Object.entries(content.pending)){
            for (const [nonce, tx] of Object.entries(txs)){
                if (tx && tx.hash) {
                    pendingHashes.add(tx.hash.toLowerCase());
                }
            }
        }
        // Find transactions we think are pending but aren't in txpool
        const snapshot = await state.snapshot();
        let dropped = 0;
        for (const tx of snapshot.txs){
            if (tx._state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].PENDING && !pendingHashes.has(tx.hash.toLowerCase())) {
                // Mark as dropped (might have been included or replaced)
                tx._state = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2f$transaction$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["TxState"].DROPPED;
                await state.upsert(tx);
                dropped++;
            }
        }
        if (dropped > 0) {
            console.log(`🗑️ Marked ${dropped} transactions as dropped`);
        }
    } catch (error) {
        console.error('Failed to cleanup dropped transactions:', error);
    }
}
// Periodic txpool monitoring task
let monitoringInterval = null;
function startTxpoolMonitoring() {
    if (monitoringInterval) return;
    // Check txpool every 30 seconds
    monitoringInterval = setInterval(async ()=>{
        try {
            await processTxpoolContent();
            await cleanupDroppedTransactions();
        } catch (error) {
            console.error('Txpool monitoring error:', error);
        }
    }, 30000);
    console.log('✅ Started txpool monitoring');
}
function stopTxpoolMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        console.log('✅ Stopped txpool monitoring');
    }
}
}),
"[project]/src/server/metrics/aggregator.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MetricsAggregator",
    ()=>MetricsAggregator,
    "feeHistoryToSuggestions",
    ()=>feeHistoryToSuggestions,
    "getFeeHistoryAnalytics",
    ()=>getFeeHistoryAnalytics,
    "getMetricsAggregator",
    ()=>getMetricsAggregator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/state/state.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ingest$2f$txpool$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/ingest/txpool.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$rpc$2f$wsClient$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/rpc/wsClient.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/util/hex.ts [app-edge-route] (ecmascript)");
;
;
;
;
class MetricsAggregator {
    // Build metrics from transactions and txpool status
    async build(txs, txpoolStatus) {
        // Get txpool status if not provided
        if (!txpoolStatus) {
            txpoolStatus = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ingest$2f$txpool$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTxpoolStatus"])();
        }
        // Count transactions by category
        const byType = {};
        let largeEthCount = 0;
        for (const tx of txs){
            // Count by type
            const type = tx.category_key || 'unknown';
            byType[type] = (byType[type] || 0) + 1;
            // Count large ETH transfers
            if (tx.value && !tx.input) {
                const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(tx.value);
                if (value >= 1e18) {
                    largeEthCount++;
                }
            }
        }
        // Gas buckets (simplified - in real implementation, calculate from actual gas prices)
        const gasBuckets = {
            gte_100: 0,
            gte_150: 0,
            gte_200: 0,
            gte_300: 0
        };
        // Parse txpool status
        let pending = 0;
        let queued = 0;
        if (txpoolStatus) {
            try {
                if (typeof txpoolStatus.pending === 'string') {
                    pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(txpoolStatus.pending);
                }
                if (typeof txpoolStatus.queued === 'string') {
                    queued = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(txpoolStatus.queued);
                }
            } catch (error) {
                console.error('Failed to parse txpool status:', error);
            }
        }
        // Calculate rates (simplified - would need time-series data)
        const ingressPerSec = Math.max(0, pending * 0.1); // Rough estimate
        const egressPerSec = Math.max(0, pending * 0.05); // Rough estimate
        // Age percentiles (simplified)
        const ages = txs.filter((tx)=>tx._first_seen_ts).map((tx)=>Date.now() / 1000 - tx._first_seen_ts).sort((a, b)=>a - b);
        let ageP50 = null;
        let ageP90 = null;
        let ageMax = null;
        if (ages.length > 0) {
            const mid = Math.floor(ages.length / 2);
            ageP50 = ages[mid];
            const p90Index = Math.floor(ages.length * 0.9);
            ageP90 = ages[Math.min(p90Index, ages.length - 1)];
            ageMax = ages[ages.length - 1];
        }
        return {
            total_pending: pending,
            total_queued: queued,
            by_type: byType,
            large_eth_count: largeEthCount,
            gas_buckets: gasBuckets,
            ingress_per_sec: ingressPerSec,
            egress_per_sec: egressPerSec,
            age_p50: ageP50,
            age_p90: ageP90,
            age_max: ageMax
        };
    }
    // Get state metrics summary
    getStateMetrics() {
        const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTrackerState"])();
        const metrics = state.getMetrics();
        const counts = state.getStateCounts();
        // Calculate success rate (included / (included + dropped))
        const included = metrics.included + metrics.confirmed + metrics.finalized;
        const dropped = metrics.dropped;
        const successRate = included + dropped > 0 ? included / (included + dropped) : null;
        // Calculate average inclusion time (simplified)
        const snapshot = state.getMetrics();
        const avgInclusionTime = null; // Would need more complex calculation
        // Calculate congestion (pending / (pending + included rate))
        const congestion = metrics.pending > 0 ? metrics.pending / (metrics.pending + 1) : 0;
        return {
            state_counts: counts,
            success_rate: successRate,
            avg_inclusion_time: avgInclusionTime,
            congestion: congestion,
            flow_ingress_per_window: metrics.total_pending,
            flow_included_per_window: metrics.included,
            flow_dropped_per_window: metrics.dropped,
            flow_stuck_per_window: metrics.pending
        };
    }
    // Get flow sparkline data (simplified)
    getFlowSparklines() {
        // In a real implementation, this would maintain rolling windows of flow data
        // For now, return empty sparklines
        return {
            ingress: '',
            included: '',
            dropped: '',
            stuck: ''
        };
    }
}
async function getFeeHistoryAnalytics(blocks = 20) {
    try {
        const wsClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$rpc$2f$wsClient$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getWsClient"])();
        // Get latest block number
        const latestBlock = await wsClient.rpc('eth_blockNumber', []);
        const latestBlockNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(latestBlock);
        // Get fee history
        const feeHistory = await wsClient.rpc('eth_feeHistory', [
            blocks.toString(),
            latestBlock,
            [
                10,
                50,
                90
            ]
        ]);
        if (!feeHistory || !feeHistory.baseFeePerGas) {
            return {
                base_fee: null,
                suggested_gas_price: null,
                suggested_max_fee: null,
                suggested_priority_fee: null,
                percentiles: {}
            };
        }
        // Extract base fee (latest)
        const baseFees = feeHistory.baseFeePerGas.map((fee)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(fee));
        const baseFee = baseFees[baseFees.length - 1] || null;
        // Calculate suggestions based on percentiles
        const priorityFees = feeHistory.reward?.map((rewards)=>rewards.map((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2f$hex$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["hexToNumber"])(r))) || [];
        // Simple suggestion logic
        const suggestedPriorityFee = baseFee ? Math.max(baseFee * 0.1, 2e9) : null; // 2 gwei min
        const suggestedMaxFee = baseFee ? baseFee + (suggestedPriorityFee || 0) : null;
        return {
            base_fee: baseFee,
            suggested_gas_price: suggestedMaxFee,
            suggested_max_fee: suggestedMaxFee,
            suggested_priority_fee: suggestedPriorityFee,
            percentiles: {
                '10': priorityFees.length > 0 ? priorityFees[0][0] : null,
                '50': priorityFees.length > 0 ? priorityFees[0][1] : null,
                '90': priorityFees.length > 0 ? priorityFees[0][2] : null
            }
        };
    } catch (error) {
        console.error('Failed to get fee history analytics:', error);
        return {
            base_fee: null,
            suggested_gas_price: null,
            suggested_max_fee: null,
            suggested_priority_fee: null,
            percentiles: {}
        };
    }
}
function feeHistoryToSuggestions(feeHistory) {
    return {
        base_fee: feeHistory.base_fee,
        tips: {
            '1_block': feeHistory.percentiles['10'] || 0,
            '3_blocks': feeHistory.percentiles['50'] || 0,
            '5_blocks': feeHistory.percentiles['90'] || 0
        }
    };
}
// Global aggregator instance
let aggregator = null;
function getMetricsAggregator() {
    if (!aggregator) {
        aggregator = new MetricsAggregator();
    }
    return aggregator;
}
}),
"[project]/src/app/api/ws/route.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/state/state.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$metrics$2f$aggregator$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/metrics/aggregator.ts [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ingest$2f$txpool$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/ingest/txpool.ts [app-edge-route] (ecmascript)");
const runtime = 'edge';
;
;
;
console.log('WebSocket route loaded');
// WebSocket connections registry
const connections = new Set();
// Broadcast interval
let broadcastInterval = null;
async function GET(request) {
    // Check if WebSocket upgrade is requested
    const upgradeHeader = request.headers.get('upgrade');
    if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', {
            status: 400
        });
    }
    console.log('WebSocket upgrade requested');
    try {
        // Create WebSocket pair (client/server)
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        // Accept the server side of the pair
        // @ts-ignore - Edge runtime WebSocket
        server.accept?.();
        // Add to connections
        connections.add(server);
        // Handle connection close
        server.addEventListener('close', ()=>{
            connections.delete(server);
        });
        // Handle errors
        server.addEventListener('error', (error)=>{
            console.error('WebSocket error:', error);
            connections.delete(server);
        });
        // Start broadcasting if this is the first connection
        if (connections.size === 1 && !broadcastInterval) {
            startBroadcasting();
        }
        return new Response(null, {
            status: 101,
            // @ts-ignore - Next.js WebSocket handling
            webSocket: client
        });
    } catch (error) {
        console.error('WebSocket upgrade failed:', error);
        return new Response('WebSocket upgrade failed', {
            status: 500
        });
    }
}
// Start broadcasting UI updates
function startBroadcasting() {
    console.log('🎯 Starting UI broadcast (200ms intervals)');
    broadcastInterval = setInterval(async ()=>{
        try {
            const snapshot = await generateUiSnapshot();
            // Send to all connected clients
            const message = JSON.stringify(snapshot);
            const deadConnections = [];
            for (const ws of connections){
                try {
                    // Edge runtime WebSocket OPEN state check
                    const isOpen = ws.readyState === WebSocket.OPEN || ws.readyState === 1;
                    if (isOpen) {
                        ws.send(message);
                    } else {
                        deadConnections.push(ws);
                    }
                } catch (error) {
                    console.error('Failed to send to client:', error);
                    deadConnections.push(ws);
                }
            }
            // Clean up dead connections
            for (const ws of deadConnections){
                connections.delete(ws);
            }
            // Stop broadcasting if no connections
            if (connections.size === 0) {
                stopBroadcasting();
            }
        } catch (error) {
            console.error('Broadcast error:', error);
        }
    }, 200); // 200ms intervals for smooth realtime updates
}
// Stop broadcasting
function stopBroadcasting() {
    console.log('Stopping UI broadcast');
    if (broadcastInterval) {
        clearInterval(broadcastInterval);
        broadcastInterval = null;
        console.log('🎯 Stopped UI broadcast');
    }
}
// Generate UI snapshot
async function generateUiSnapshot() {
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$state$2f$state$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTrackerState"])();
    const aggregator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$metrics$2f$aggregator$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getMetricsAggregator"])();
    console.log('Generating UI snapshot');
    // Get basic metrics
    const txpoolStatus = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ingest$2f$txpool$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["getTxpoolStatus"])();
    const snapshot = await state.snapshot(100);
    const metrics = await aggregator.build(snapshot.txs, txpoolStatus);
    const stateMetrics = aggregator.getStateMetrics();
    const flowSparklines = aggregator.getFlowSparklines();
    // Get included transactions
    const included = await state.snapshotIncluded(50);
    // Get gas data (cached or fresh)
    const gasData = {
        base_fee: metrics.age_p50,
        tips: {
            '1_block': 0,
            '3_blocks': 0,
            '5_blocks': 0
        }
    };
    // Build opportunities (top transactions by score)
    const opportunities = snapshot.txs.filter((tx)=>tx._score && tx._score > 100).sort((a, b)=>(b._score || 0) - (a._score || 0)).slice(0, 20).map((tx)=>({
            hash: tx.hash,
            rank: 0,
            score: tx._score || 0,
            category_key: tx.category_key,
            decoded_fn: tx._decoded_fn
        }));
    // Build contracts summary (placeholder)
    const contracts = [
        {
            address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            name: 'Uniswap V2 Router',
            tx_count: 150,
            category: 'DEX'
        }
    ];
    // Build senders summary (placeholder)
    const senders = [
        {
            address: '0xaa0e9a1e2d2ccf2b867fda047bb5394bef1883e0',
            tx_count: 25,
            success_rate: 0.95,
            total_value: '10.5 ETH'
        }
    ];
    return {
        timestamp: Date.now(),
        summary: {
            ...metrics,
            state_counts: stateMetrics.state_counts,
            success_rate: stateMetrics.success_rate,
            avg_inclusion_time: stateMetrics.avg_inclusion_time,
            congestion: stateMetrics.congestion,
            flow_spark: flowSparklines
        },
        opportunities,
        live: snapshot.txs.slice(0, 50),
        included,
        gas: gasData,
        contracts,
        senders,
        status: {
            ws_connected: true,
            rpc_latency_ms: 50,
            subscriptions_active: [
                'newPendingTransactions',
                'newHeads'
            ],
            errors: []
        }
    };
}
// Cleanup on module unload
process.on('SIGTERM', ()=>{
    console.log('SIGTERM received, stopping broadcasting');
    stopBroadcasting();
    for (const ws of connections){
        ws.close();
    }
    connections.clear();
});
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__d04c1540._.js.map