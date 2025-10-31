(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWsSnapshot",
    ()=>useWsSnapshot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
let state = {
    snapshot: null,
    connected: false
};
const listeners = new Set();
let started = false;
let ws = null;
let reconnectTimer = null;
function emit(partial) {
    state = {
        ...state,
        ...partial
    };
    listeners.forEach((listener)=>listener());
}
function subscribe(listener) {
    listeners.add(listener);
    return ()=>{
        listeners.delete(listener);
    };
}
function getSnapshotState() {
    return state;
}
function scheduleReconnect() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (reconnectTimer !== null) return;
    reconnectTimer = window.setTimeout(()=>{
        reconnectTimer = null;
        connect();
    }, 2000);
}
function handleMessage(evt) {
    try {
        const data = JSON.parse(evt.data);
        if (data && typeof data === 'object' && (data.summary || data.tokens || data.pools || data.oracles)) {
            emit({
                snapshot: data
            });
        }
    } catch (err) {
        console.warn('Failed to parse WS snapshot payload', err);
    }
}
function connect() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (ws) {
        try {
            ws.close();
        } catch  {}
    }
    const url = ("TURBOPACK compile-time value", "ws://localhost:3006") || 'ws://localhost:3006';
    try {
        ws = new WebSocket(url);
    } catch (err) {
        console.error('Failed to create WebSocket connection', err);
        scheduleReconnect();
        return;
    }
    ws.onopen = ()=>{
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        emit({
            connected: true
        });
    };
    ws.onclose = ()=>{
        emit({
            connected: false
        });
        scheduleReconnect();
    };
    ws.onerror = ()=>{
        emit({
            connected: false
        });
    };
    ws.onmessage = handleMessage;
}
function ensureStarted() {
    if (started) return;
    started = true;
    if ("TURBOPACK compile-time truthy", 1) {
        connect();
        window.addEventListener('beforeunload', ()=>{
            try {
                ws?.close();
            } catch  {}
        });
    }
}
function useWsSnapshot() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(2);
    if ($[0] !== "c08468b416f5a669e2a8ab4f269237441dd246a9ab0294ca18a315abcac4bbf4") {
        for(let $i = 0; $i < 2; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "c08468b416f5a669e2a8ab4f269237441dd246a9ab0294ca18a315abcac4bbf4";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(_useWsSnapshotUseEffect, t0);
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, getSnapshotState, getSnapshotState);
    return store;
}
_s(useWsSnapshot, "xWFVV7RTqvg0VkOBTLB1Uo7E/Xc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
function _useWsSnapshotUseEffect() {
    ensureStarted();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFilters",
    ()=>useFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
'use client';
;
const defaultState = {
    protocols: [],
    whitelist: [],
    blacklist: [],
    decodedOnly: false,
    searchText: ''
};
function loadPresets() {
    try {
        const raw = localStorage.getItem('filters.presets');
        if (!raw) return [];
        return JSON.parse(raw);
    } catch  {
        return [];
    }
}
function savePresets(presets) {
    try {
        localStorage.setItem('filters.presets', JSON.stringify(presets));
    } catch  {}
}
function toEth(hex) {
    try {
        return hex ? parseInt(hex, 16) / 1e18 : 0;
    } catch  {
        return 0;
    }
}
function toGwei(hex) {
    try {
        return hex ? parseInt(hex, 16) / 1e9 : 0;
    } catch  {
        return 0;
    }
}
function protocolLabelFromCategory(categoryKey) {
    if (!categoryKey) return 'Other';
    if (categoryKey.startsWith('dex:')) return 'DEX';
    if (categoryKey.startsWith('nft_market:') || categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
    if (categoryKey.startsWith('bridge:')) return 'Bridge';
    if (categoryKey.startsWith('defi:')) return 'DeFi';
    if (categoryKey.startsWith('erc20:')) return 'ERC-20';
    if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
    return 'Other';
}
const useFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        ...defaultState,
        presets: [],
        set: (s)=>set({
                ...get(),
                ...s
            }),
        reset: ()=>set({
                ...defaultState
            }),
        savePreset: (name)=>{
            const presets = loadPresets();
            const state = {
                ...get()
            };
            delete state.presets;
            const idx = presets.findIndex((p)=>p.name === name);
            const preset = {
                name,
                state
            };
            if (idx >= 0) presets[idx] = preset;
            else presets.push(preset);
            savePresets(presets);
            set({
                presets
            });
        },
        loadPreset: (name)=>{
            const presets = loadPresets();
            const found = presets.find((p)=>p.name === name);
            if (found) set({
                ...found.state
            });
            set({
                presets
            });
        },
        deletePreset: (name)=>{
            const presets = loadPresets().filter((p)=>p.name !== name);
            savePresets(presets);
            set({
                presets
            });
        },
        applyFilters: (rows)=>{
            const f = get();
            const nowSec = Date.now() / 1000;
            return rows.filter((tx)=>{
                // decoded only
                if (f.decodedOnly && !tx._decoded_fn) return false;
                // time range
                if (f.timeRangeMin) {
                    const baseTs = tx._inclusion_ts || tx._first_seen_ts;
                    if (!baseTs || nowSec - baseTs > f.timeRangeMin * 60) return false;
                }
                // value range
                const eth = toEth(tx.value);
                if (f.minEth !== undefined && eth < f.minEth) return false;
                if (f.maxEth !== undefined && eth > f.maxEth) return false;
                // gas range
                const gasGwei = toGwei(tx.maxFeePerGas || tx.gasPrice);
                if (f.minGasGwei !== undefined && gasGwei < f.minGasGwei) return false;
                if (f.maxGasGwei !== undefined && gasGwei > f.maxGasGwei) return false;
                // protocol multi-select
                if (f.protocols && f.protocols.length > 0) {
                    const label = protocolLabelFromCategory(tx.category_key);
                    if (!f.protocols.includes(label)) return false;
                }
                if (f.searchText && f.searchText.trim()) {
                    const q = f.searchText.trim().toLowerCase();
                    const matches = (tx.hash || '').toLowerCase().includes(q) || (tx.from || '').toLowerCase().includes(q) || (tx.to || '').toLowerCase().includes(q) || (tx.category_key || '').toLowerCase().includes(q) || (tx._decoded_fn?.function || '').toLowerCase().includes(q) || (tx._decoded_events || []).some((evt)=>(evt.event || '').toLowerCase().includes(q));
                    if (!matches) return false;
                }
                // token query in input or decoded args
                if (f.tokenQuery && f.tokenQuery.trim()) {
                    const q = f.tokenQuery.trim().toLowerCase();
                    const inInput = (tx.input || '').toLowerCase().includes(q);
                    const inArgs = (tx._decoded_fn?.args || []).some((a)=>String(a.value || '').toLowerCase().includes(q));
                    if (!inInput && !inArgs) return false;
                }
                // whitelist/blacklist
                const from = (tx.from || '').toLowerCase();
                const to = (tx.to || '').toLowerCase();
                if (f.whitelist.length > 0) {
                    const ok = f.whitelist.map((a)=>a.toLowerCase()).some((a)=>a === from || a === to);
                    if (!ok) return false;
                }
                if (f.blacklist.length > 0) {
                    const bad = f.blacklist.map((a)=>a.toLowerCase()).some((a)=>a === from || a === to);
                    if (bad) return false;
                }
                return true;
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Table.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Table
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Table(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(64);
    if ($[0] !== "5ce800455e1936bbbc97a0d3b7c656ddc67b050e394306f6b4451d79ae5e848e") {
        for(let $i = 0; $i < 64; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5ce800455e1936bbbc97a0d3b7c656ddc67b050e394306f6b4451d79ae5e848e";
    }
    const { data, columns, loading: t1, emptyMessage: t2, onRowClick, className: t3, variant: t4, density: t5 } = t0;
    const loading = t1 === undefined ? false : t1;
    const emptyMessage = t2 === undefined ? "[NO DATA AVAILABLE]" : t2;
    const className = t3 === undefined ? "" : t3;
    t4 === undefined ? "terminal" : t4;
    const density = t5 === undefined ? "compact" : t5;
    const [sortColumn, setSortColumn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sortDirection, setSortDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("asc");
    const isCompact = density === "compact";
    const headerPad = isCompact ? "px-1 py-1" : "px-2 py-1.5";
    const cellPad = isCompact ? "px-1 py-0.5" : "px-2 py-1";
    const rowText = isCompact ? "text-[9px]" : "text-[10px]";
    const headText = isCompact ? "text-[8px]" : "text-[9px]";
    let t6;
    if ($[1] !== columns || $[2] !== sortColumn || $[3] !== sortDirection) {
        t6 = ({
            "Table[handleSort]": (columnKey)=>{
                const column = columns.find({
                    "Table[handleSort > columns.find()]": (col)=>col.key === columnKey
                }["Table[handleSort > columns.find()]"]);
                if (!column?.sortable) {
                    return;
                }
                if (sortColumn === columnKey) {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                    setSortColumn(columnKey);
                    setSortDirection("asc");
                }
            }
        })["Table[handleSort]"];
        $[1] = columns;
        $[2] = sortColumn;
        $[3] = sortDirection;
        $[4] = t6;
    } else {
        t6 = $[4];
    }
    const handleSort = t6;
    let sortedData;
    let t10;
    let t11;
    let t12;
    let t7;
    let t8;
    let t9;
    if ($[5] !== cellPad || $[6] !== className || $[7] !== columns || $[8] !== data || $[9] !== emptyMessage || $[10] !== handleSort || $[11] !== headText || $[12] !== headerPad || $[13] !== loading || $[14] !== onRowClick || $[15] !== rowText || $[16] !== sortColumn || $[17] !== sortDirection) {
        t12 = Symbol.for("react.early_return_sentinel");
        bb0: {
            let t13;
            if ($[25] !== sortColumn || $[26] !== sortDirection) {
                t13 = ({
                    "Table[(anonymous)()]": (a, b)=>{
                        if (!sortColumn) {
                            return 0;
                        }
                        const aValue = a[sortColumn];
                        const bValue = b[sortColumn];
                        if (aValue == null && bValue == null) {
                            return 0;
                        }
                        if (aValue == null) {
                            return sortDirection === "asc" ? -1 : 1;
                        }
                        if (bValue == null) {
                            return sortDirection === "asc" ? 1 : -1;
                        }
                        if (typeof aValue === "number" && typeof bValue === "number") {
                            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
                        }
                        const aStr = String(aValue).toLowerCase();
                        const bStr = String(bValue).toLowerCase();
                        if (sortDirection === "asc") {
                            return aStr.localeCompare(bStr);
                        } else {
                            return bStr.localeCompare(aStr);
                        }
                    }
                })["Table[(anonymous)()]"];
                $[25] = sortColumn;
                $[26] = sortDirection;
                $[27] = t13;
            } else {
                t13 = $[27];
            }
            sortedData = [
                ...data
            ].sort(t13);
            if (loading) {
                const t14 = `p-8 text-center ${className}`;
                let t15;
                if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
                    t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-slate-400 font-mono text-sm",
                        children: "[LOADING...]"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 129,
                        columnNumber: 17
                    }, this);
                    $[28] = t15;
                } else {
                    t15 = $[28];
                }
                let t16;
                if ($[29] !== t14) {
                    t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: t14,
                        children: t15
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 136,
                        columnNumber: 17
                    }, this);
                    $[29] = t14;
                    $[30] = t16;
                } else {
                    t16 = $[30];
                }
                t12 = t16;
                break bb0;
            }
            t11 = className;
            t10 = "overflow-x-auto";
            t8 = `min-w-full ${rowText} border-collapse`;
            let t14;
            if ($[31] !== columns || $[32] !== handleSort || $[33] !== headText || $[34] !== headerPad || $[35] !== sortColumn || $[36] !== sortDirection) {
                let t15;
                if ($[38] !== handleSort || $[39] !== headText || $[40] !== headerPad || $[41] !== sortColumn || $[42] !== sortDirection) {
                    t15 = ({
                        "Table[columns.map()]": (column_0, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: `text-left font-mono ${headText} text-gray-400 uppercase tracking-widest ${headerPad} border-r border-gray-800 last:border-r-0 ${column_0.sortable ? "cursor-pointer hover:bg-gray-800 select-none" : ""} ${column_0.className || ""}`,
                                onClick: {
                                    "Table[columns.map() > <th>.onClick]": ()=>column_0.sortable && handleSort(String(column_0.key))
                                }["Table[columns.map() > <th>.onClick]"],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: column_0.header
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Table.tsx",
                                            lineNumber: 155,
                                            columnNumber: 96
                                        }, this),
                                        column_0.sortable && sortColumn === column_0.key && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `${sortDirection === "desc" ? "text-red-400" : "text-green-400"} text-[7px]`,
                                            children: sortDirection === "desc" ? "\u25BC" : "\u25B2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Table.tsx",
                                            lineNumber: 155,
                                            columnNumber: 179
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Table.tsx",
                                    lineNumber: 155,
                                    columnNumber: 55
                                }, this)
                            }, String(column_0.key) + index, false, {
                                fileName: "[project]/src/app/components/Table.tsx",
                                lineNumber: 153,
                                columnNumber: 58
                            }, this)
                    })["Table[columns.map()]"];
                    $[38] = handleSort;
                    $[39] = headText;
                    $[40] = headerPad;
                    $[41] = sortColumn;
                    $[42] = sortDirection;
                    $[43] = t15;
                } else {
                    t15 = $[43];
                }
                t14 = columns.map(t15);
                $[31] = columns;
                $[32] = handleSort;
                $[33] = headText;
                $[34] = headerPad;
                $[35] = sortColumn;
                $[36] = sortDirection;
                $[37] = t14;
            } else {
                t14 = $[37];
            }
            if ($[44] !== t14) {
                t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    className: "bg-gray-900 border-b border-gray-700",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: t14
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 178,
                        columnNumber: 70
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Table.tsx",
                    lineNumber: 178,
                    columnNumber: 14
                }, this);
                $[44] = t14;
                $[45] = t9;
            } else {
                t9 = $[45];
            }
            t7 = sortedData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                    colSpan: columns.length,
                    className: `px-4 py-6 text-center text-gray-600 font-mono ${rowText} bg-black`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: emptyMessage
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 184,
                        columnNumber: 151
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Table.tsx",
                    lineNumber: 184,
                    columnNumber: 42
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Table.tsx",
                lineNumber: 184,
                columnNumber: 38
            }, this) : sortedData.map({
                "Table[sortedData.map()]": (row, index_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: `font-mono ${rowText} border-b border-gray-900 hover:bg-gray-900 ${onRowClick ? "cursor-pointer" : ""}`,
                        onClick: {
                            "Table[sortedData.map() > <tr>.onClick]": ()=>onRowClick?.(row, index_0)
                        }["Table[sortedData.map() > <tr>.onClick]"],
                        children: columns.map({
                            "Table[sortedData.map() > columns.map()]": (column_1, colIndex)=>{
                                const value = row[column_1.key];
                                const renderedValue = column_1.render ? column_1.render(value, row, index_0) : value;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: `${cellPad} ${column_1.className || ""}`,
                                    children: renderedValue
                                }, String(column_1.key) + colIndex, false, {
                                    fileName: "[project]/src/app/components/Table.tsx",
                                    lineNumber: 191,
                                    columnNumber: 22
                                }, this);
                            }
                        }["Table[sortedData.map() > columns.map()]"])
                    }, index_0, false, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 185,
                        columnNumber: 54
                    }, this)
            }["Table[sortedData.map()]"]);
        }
        $[5] = cellPad;
        $[6] = className;
        $[7] = columns;
        $[8] = data;
        $[9] = emptyMessage;
        $[10] = handleSort;
        $[11] = headText;
        $[12] = headerPad;
        $[13] = loading;
        $[14] = onRowClick;
        $[15] = rowText;
        $[16] = sortColumn;
        $[17] = sortDirection;
        $[18] = sortedData;
        $[19] = t10;
        $[20] = t11;
        $[21] = t12;
        $[22] = t7;
        $[23] = t8;
        $[24] = t9;
    } else {
        sortedData = $[18];
        t10 = $[19];
        t11 = $[20];
        t12 = $[21];
        t7 = $[22];
        t8 = $[23];
        t9 = $[24];
    }
    if (t12 !== Symbol.for("react.early_return_sentinel")) {
        return t12;
    }
    let t13;
    if ($[46] !== t7) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
            children: t7
        }, void 0, false, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 230,
            columnNumber: 11
        }, this);
        $[46] = t7;
        $[47] = t13;
    } else {
        t13 = $[47];
    }
    let t14;
    if ($[48] !== t13 || $[49] !== t8 || $[50] !== t9) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: t8,
            children: [
                t9,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 238,
            columnNumber: 11
        }, this);
        $[48] = t13;
        $[49] = t8;
        $[50] = t9;
        $[51] = t14;
    } else {
        t14 = $[51];
    }
    let t15;
    if ($[52] !== t10 || $[53] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t10,
            children: t14
        }, void 0, false, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 248,
            columnNumber: 11
        }, this);
        $[52] = t10;
        $[53] = t14;
        $[54] = t15;
    } else {
        t15 = $[54];
    }
    let t16;
    if ($[55] !== columns || $[56] !== rowText || $[57] !== sortColumn || $[58] !== sortedData.length) {
        t16 = sortedData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-gray-800 px-2 py-1 bg-gray-900",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center justify-between text-gray-400 font-mono ${rowText}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-gray-500",
                            children: [
                                sortedData.length,
                                " entries"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Table.tsx",
                            lineNumber: 257,
                            columnNumber: 229
                        }, this),
                        sortColumn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-green-400",
                            children: [
                                "sorted by ",
                                columns.find({
                                    "Table[columns.find()]": (col_0)=>col_0.key === sortColumn
                                }["Table[columns.find()]"])?.header,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: {
                                        "Table[<button>.onClick]": ()=>setSortColumn(null)
                                    }["Table[<button>.onClick]"],
                                    className: "ml-1 text-gray-600 hover:text-gray-400 text-[8px]",
                                    children: "[clear]"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Table.tsx",
                                    lineNumber: 259,
                                    columnNumber: 49
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Table.tsx",
                            lineNumber: 257,
                            columnNumber: 310
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Table.tsx",
                    lineNumber: 257,
                    columnNumber: 188
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Table.tsx",
                lineNumber: 257,
                columnNumber: 100
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 257,
            columnNumber: 36
        }, this);
        $[55] = columns;
        $[56] = rowText;
        $[57] = sortColumn;
        $[58] = sortedData.length;
        $[59] = t16;
    } else {
        t16 = $[59];
    }
    let t17;
    if ($[60] !== t11 || $[61] !== t15 || $[62] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t11,
            children: [
                t15,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 272,
            columnNumber: 11
        }, this);
        $[60] = t11;
        $[61] = t15;
        $[62] = t16;
        $[63] = t17;
    } else {
        t17 = $[63];
    }
    return t17;
}
_s(Table, "pCdlfbZWfqwij9Ip6Vg3al0y1n8=");
_c = Table;
var _c;
__turbopack_context__.k.register(_c, "Table");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/charts/SparklineChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SparklineChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
'use client';
;
;
;
function SparklineChart(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "9a4d2a2cf9bdefb3c077b1e604d161dc69ecbfa9656f81b8ccd7cf116563f69b") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9a4d2a2cf9bdefb3c077b1e604d161dc69ecbfa9656f81b8ccd7cf116563f69b";
    }
    const { data, color: t1, width: t2, height: t3, className: t4 } = t0;
    const color = t1 === undefined ? "#06b6d4" : t1;
    const width = t2 === undefined ? "100%" : t2;
    const height = t3 === undefined ? 40 : t3;
    const className = t4 === undefined ? "" : t4;
    let t5;
    if ($[1] !== data) {
        t5 = data.map(_SparklineChartDataMap);
        $[1] = data;
        $[2] = t5;
    } else {
        t5 = $[2];
    }
    const chartData = t5;
    const t6 = `${className}`;
    let t7;
    if ($[3] !== height || $[4] !== width) {
        t7 = {
            width,
            height
        };
        $[3] = height;
        $[4] = width;
        $[5] = t7;
    } else {
        t7 = $[5];
    }
    let t8;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = {
            top: 2,
            right: 2,
            bottom: 2,
            left: 2
        };
        $[6] = t8;
    } else {
        t8 = $[6];
    }
    let t9;
    if ($[7] !== color) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
            type: "monotone",
            dataKey: "value",
            stroke: color,
            strokeWidth: 2,
            dot: false,
            isAnimationActive: false
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, this);
        $[7] = color;
        $[8] = t9;
    } else {
        t9 = $[8];
    }
    let t10;
    if ($[9] !== chartData || $[10] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                data: chartData,
                margin: t8,
                children: t9
            }, void 0, false, {
                fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
                lineNumber: 75,
                columnNumber: 59
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
            lineNumber: 75,
            columnNumber: 11
        }, this);
        $[9] = chartData;
        $[10] = t9;
        $[11] = t10;
    } else {
        t10 = $[11];
    }
    let t11;
    if ($[12] !== t10 || $[13] !== t6 || $[14] !== t7) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t6,
            style: t7,
            children: t10
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
            lineNumber: 84,
            columnNumber: 11
        }, this);
        $[12] = t10;
        $[13] = t6;
        $[14] = t7;
        $[15] = t11;
    } else {
        t11 = $[15];
    }
    return t11;
}
_c = SparklineChart;
function _SparklineChartDataMap(value, index) {
    return {
        value,
        index
    };
}
var _c;
__turbopack_context__.k.register(_c, "SparklineChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/charts/TimeSeriesChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimeSeriesChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
'use client';
;
;
;
function TimeSeriesChart(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(20);
    if ($[0] !== "f5242ad9eea90c8ba18605493616312ce4a35f274b6df98fdbe81283eeddc995") {
        for(let $i = 0; $i < 20; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f5242ad9eea90c8ba18605493616312ce4a35f274b6df98fdbe81283eeddc995";
    }
    const { data, lines, height: t1, showGrid: t2, className: t3 } = t0;
    const height = t1 === undefined ? 300 : t1;
    const showGrid = t2 === undefined ? true : t2;
    const className = t3 === undefined ? "" : t3;
    let t4;
    if ($[1] !== height) {
        t4 = {
            height
        };
        $[1] = height;
        $[2] = t4;
    } else {
        t4 = $[2];
    }
    let t5;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = {
            top: 10,
            right: 30,
            left: 10,
            bottom: 10
        };
        $[3] = t5;
    } else {
        t5 = $[3];
    }
    let t6;
    if ($[4] !== showGrid) {
        t6 = showGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
            strokeDasharray: "3 3",
            stroke: "rgba(71, 85, 105, 0.3)"
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 62,
            columnNumber: 22
        }, this);
        $[4] = showGrid;
        $[5] = t6;
    } else {
        t6 = $[5];
    }
    let t7;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
            dataKey: "time",
            tick: {
                fill: "#94a3b8",
                fontSize: 11,
                fontFamily: "monospace"
            },
            stroke: "rgba(71, 85, 105, 0.5)"
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 70,
            columnNumber: 10
        }, this);
        $[6] = t7;
    } else {
        t7 = $[6];
    }
    let t8;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
            tick: {
                fill: "#94a3b8",
                fontSize: 11,
                fontFamily: "monospace"
            },
            stroke: "rgba(71, 85, 105, 0.5)"
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 81,
            columnNumber: 10
        }, this);
        $[7] = t8;
    } else {
        t8 = $[7];
    }
    let t9;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
            contentStyle: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontFamily: "monospace",
                fontSize: "12px"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 92,
            columnNumber: 10
        }, this);
        $[8] = t9;
    } else {
        t9 = $[8];
    }
    let t10;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
            wrapperStyle: {
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#94a3b8"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 106,
            columnNumber: 11
        }, this);
        $[9] = t10;
    } else {
        t10 = $[9];
    }
    let t11;
    if ($[10] !== lines) {
        t11 = lines.map(_TimeSeriesChartLinesMap);
        $[10] = lines;
        $[11] = t11;
    } else {
        t11 = $[11];
    }
    let t12;
    if ($[12] !== data || $[13] !== t11 || $[14] !== t6) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                data: data,
                margin: t5,
                children: [
                    t6,
                    t7,
                    t8,
                    t9,
                    t10,
                    t11
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                lineNumber: 125,
                columnNumber: 59
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 125,
            columnNumber: 11
        }, this);
        $[12] = data;
        $[13] = t11;
        $[14] = t6;
        $[15] = t12;
    } else {
        t12 = $[15];
    }
    let t13;
    if ($[16] !== className || $[17] !== t12 || $[18] !== t4) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: className,
            style: t4,
            children: t12
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 135,
            columnNumber: 11
        }, this);
        $[16] = className;
        $[17] = t12;
        $[18] = t4;
        $[19] = t13;
    } else {
        t13 = $[19];
    }
    return t13;
}
_c = TimeSeriesChart;
function _TimeSeriesChartLinesMap(line) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
        type: "monotone",
        dataKey: line.dataKey,
        stroke: line.color,
        strokeWidth: 2,
        dot: false,
        name: line.name,
        isAnimationActive: false
    }, line.dataKey, false, {
        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
        lineNumber: 146,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "TimeSeriesChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/charts/PieChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PieChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
'use client';
;
;
;
const DEFAULT_COLORS = [
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#f43f5e',
    '#6366f1',
    '#14b8a6',
    '#eab308'
];
function PieChart(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(24);
    if ($[0] !== "aa5661a1fb5fc4a3fd93ef353a996386a6c4dc152a9418e560db316231369940") {
        for(let $i = 0; $i < 24; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "aa5661a1fb5fc4a3fd93ef353a996386a6c4dc152a9418e560db316231369940";
    }
    const { data, height: t1, colors: t2, showLegend: t3, innerRadius: t4, className: t5 } = t0;
    const height = t1 === undefined ? 300 : t1;
    const colors = t2 === undefined ? DEFAULT_COLORS : t2;
    const showLegend = t3 === undefined ? true : t3;
    const innerRadius = t4 === undefined ? 0 : t4;
    const className = t5 === undefined ? "" : t5;
    let t6;
    if ($[1] !== height) {
        t6 = {
            height
        };
        $[1] = height;
        $[2] = t6;
    } else {
        t6 = $[2];
    }
    const t7 = innerRadius > 0 ? innerRadius + 60 : 80;
    let t8;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = {
            stroke: "#94a3b8",
            strokeWidth: 1
        };
        $[3] = t8;
    } else {
        t8 = $[3];
    }
    let t9;
    if ($[4] !== colors || $[5] !== data) {
        let t10;
        if ($[7] !== colors) {
            t10 = ({
                "PieChart[data.map()]": (entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                        fill: entry.color || colors[index % colors.length]
                    }, `cell-${index}`, false, {
                        fileName: "[project]/src/app/components/charts/PieChart.tsx",
                        lineNumber: 65,
                        columnNumber: 51
                    }, this)
            })["PieChart[data.map()]"];
            $[7] = colors;
            $[8] = t10;
        } else {
            t10 = $[8];
        }
        t9 = data.map(t10);
        $[4] = colors;
        $[5] = data;
        $[6] = t9;
    } else {
        t9 = $[6];
    }
    let t10;
    if ($[9] !== data || $[10] !== innerRadius || $[11] !== t7 || $[12] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
            data: data,
            cx: "50%",
            cy: "50%",
            innerRadius: innerRadius,
            outerRadius: t7,
            fill: "#8884d8",
            dataKey: "value",
            label: _PieChartPieLabel,
            labelLine: t8,
            children: t9
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/PieChart.tsx",
            lineNumber: 81,
            columnNumber: 11
        }, this);
        $[9] = data;
        $[10] = innerRadius;
        $[11] = t7;
        $[12] = t9;
        $[13] = t10;
    } else {
        t10 = $[13];
    }
    let t11;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
            contentStyle: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontFamily: "monospace",
                fontSize: "12px"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/PieChart.tsx",
            lineNumber: 92,
            columnNumber: 11
        }, this);
        $[14] = t11;
    } else {
        t11 = $[14];
    }
    let t12;
    if ($[15] !== showLegend) {
        t12 = showLegend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
            wrapperStyle: {
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#94a3b8"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/PieChart.tsx",
            lineNumber: 106,
            columnNumber: 25
        }, this);
        $[15] = showLegend;
        $[16] = t12;
    } else {
        t12 = $[16];
    }
    let t13;
    if ($[17] !== t10 || $[18] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChart"], {
                children: [
                    t10,
                    t11,
                    t12
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/charts/PieChart.tsx",
                lineNumber: 118,
                columnNumber: 59
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/PieChart.tsx",
            lineNumber: 118,
            columnNumber: 11
        }, this);
        $[17] = t10;
        $[18] = t12;
        $[19] = t13;
    } else {
        t13 = $[19];
    }
    let t14;
    if ($[20] !== className || $[21] !== t13 || $[22] !== t6) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: className,
            style: t6,
            children: t13
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/PieChart.tsx",
            lineNumber: 127,
            columnNumber: 11
        }, this);
        $[20] = className;
        $[21] = t13;
        $[22] = t6;
        $[23] = t14;
    } else {
        t14 = $[23];
    }
    return t14;
}
_c = PieChart;
function _PieChartPieLabel(t0) {
    const { name, percent } = t0;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
}
var _c;
__turbopack_context__.k.register(_c, "PieChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Dashboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$SparklineChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/SparklineChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$TimeSeriesChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/TimeSeriesChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$PieChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/PieChart.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function Dashboard() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(283);
    if ($[0] !== "672050b881cd32fbba277e9ee243169f69b29a5b7e06ed85440529bce9645d1d") {
        for(let $i = 0; $i < 283; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "672050b881cd32fbba277e9ee243169f69b29a5b7e06ed85440529bce9645d1d";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"])();
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [gasPriceHistory, setGasPriceHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const [ingressHistory, setIngressHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    let t2;
    let t3;
    if ($[3] !== snapshot) {
        t2 = ({
            "Dashboard[useEffect()]": ()=>{
                const baseGwei = snapshot?.gas?.oracle?.baseFeeGwei ?? (snapshot?.gas?.suggestions?.base_fee ? snapshot.gas.suggestions.base_fee / 1000000000 : null);
                if (baseGwei != null) {
                    setGasPriceHistory({
                        "Dashboard[useEffect() > setGasPriceHistory()]": (prev)=>{
                            const newHistory = [
                                ...prev,
                                baseGwei
                            ];
                            return newHistory.slice(-60);
                        }
                    }["Dashboard[useEffect() > setGasPriceHistory()]"]);
                }
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
                const ingressValue = snapshot?.summary?.ingress_per_sec || 0;
                const egressValue = snapshot?.summary?.egress_per_sec || 0;
                setIngressHistory({
                    "Dashboard[useEffect() > setIngressHistory()]": (prev_0)=>{
                        const newHistory_0 = [
                            ...prev_0,
                            {
                                time: timeStr,
                                ingress: ingressValue,
                                egress: egressValue
                            }
                        ];
                        return newHistory_0.slice(-20);
                    }
                }["Dashboard[useEffect() > setIngressHistory()]"]);
            }
        })["Dashboard[useEffect()]"];
        t3 = [
            snapshot
        ];
        $[3] = snapshot;
        $[4] = t2;
        $[5] = t3;
    } else {
        t2 = $[4];
        t3 = $[5];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    if (!snapshot) {
        let t4;
        if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-600 font-mono text-[10px]",
                    children: "CONNECTING TO MEMPOOL TERMINAL..."
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 82,
                    columnNumber: 68
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 82,
                columnNumber: 12
            }, this);
            $[6] = t4;
        } else {
            t4 = $[6];
        }
        return t4;
    }
    const { summary, status, gas } = snapshot;
    let T0;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    let topSendersByVolume;
    let volumeColumns;
    if ($[7] !== filters || $[8] !== gas?.oracle || $[9] !== gas?.suggestions || $[10] !== gasPriceHistory || $[11] !== ingressHistory || $[12] !== snapshot.live || $[13] !== status?.rpc_latency_ms || $[14] !== summary) {
        const filteredTxs = filters.applyFilters(snapshot.live || []);
        const contractCounts = new Map();
        for (const tx of filteredTxs){
            const key = (tx.to || "").toLowerCase();
            if (key) {
                contractCounts.set(key, (contractCounts.get(key) || 0) + 1);
            }
        }
        const topContracts = Array.from(contractCounts.entries()).sort(_DashboardAnonymous).slice(0, 10);
        const senderCounts = new Map();
        const senderVolumes = new Map();
        for (const tx_0 of filteredTxs){
            const key_0 = (tx_0.from || "").toLowerCase();
            if (key_0) {
                senderCounts.set(key_0, (senderCounts.get(key_0) || 0) + 1);
                const currentVolume = senderVolumes.get(key_0) || BigInt(0);
                const txValue = tx_0.value ? BigInt(tx_0.value) : BigInt(0);
                senderVolumes.set(key_0, currentVolume + txValue);
            }
        }
        const topSenders = Array.from(senderCounts.entries()).sort(_DashboardAnonymous2).slice(0, 10);
        topSendersByVolume = Array.from(senderVolumes.entries()).sort(_DashboardAnonymous3).slice(0, 10).map({
            "Dashboard[(anonymous)()]": (t15)=>{
                const [address, volume] = t15;
                return {
                    address,
                    volume: Number(volume) / 1000000000000000000,
                    count: senderCounts.get(address) || 0
                };
            }
        }["Dashboard[(anonymous)()]"]);
        let t16;
        let t17;
        let t18;
        let t19;
        let t20;
        let t21;
        if ($[29] !== gas?.oracle || $[30] !== gas?.suggestions || $[31] !== gasPriceHistory || $[32] !== ingressHistory || $[33] !== status?.rpc_latency_ms || $[34] !== summary.age_p50 || $[35] !== summary.by_type || $[36] !== summary.gas_buckets || $[37] !== summary.success_rate || $[38] !== summary.total_pending) {
            const protocolData = Object.entries(summary.by_type || {}).sort(_DashboardAnonymous4).slice(0, 8).map(_DashboardAnonymous5);
            let gasDistribution;
            let t22;
            let t23;
            let t24;
            let t25;
            let t26;
            let t27;
            if ($[50] !== gas?.oracle || $[51] !== gas?.suggestions || $[52] !== gasPriceHistory || $[53] !== status?.rpc_latency_ms || $[54] !== summary.age_p50 || $[55] !== summary.gas_buckets || $[56] !== summary.success_rate || $[57] !== summary.total_pending) {
                const gasBuckets = summary.gas_buckets || {};
                gasDistribution = [
                    {
                        name: "\u2265100G",
                        value: gasBuckets.gte_100 || 0
                    },
                    {
                        name: "\u2265150G",
                        value: gasBuckets.gte_150 || 0
                    },
                    {
                        name: "\u2265200G",
                        value: gasBuckets.gte_200 || 0
                    },
                    {
                        name: "\u2265300G",
                        value: gasBuckets.gte_300 || 0
                    }
                ];
                const gasOracleData = gas?.oracle;
                const gasSuggestions = gas?.suggestions;
                let t28;
                if ($[69] !== gasOracleData || $[70] !== gasSuggestions) {
                    t28 = gasOracleData?.baseFeeGwei != null ? gasOracleData.baseFeeGwei.toFixed(2) : gasSuggestions?.base_fee ? (gasSuggestions.base_fee / 1000000000).toFixed(2) : "\u2014";
                    $[69] = gasOracleData;
                    $[70] = gasSuggestions;
                    $[71] = t28;
                } else {
                    t28 = $[71];
                }
                const baseFee = t28;
                const fallbackTip = _DashboardFallbackTip;
                const slowTipValue = gasOracleData?.suggestions?.slow ?? fallbackTip(gasSuggestions?.tips?.["5_blocks"] ?? null);
                const averageTipValue = gasOracleData?.suggestions?.average ?? fallbackTip(gasSuggestions?.tips?.["3_blocks"] ?? null);
                const fastTipValue = gasOracleData?.suggestions?.fast ?? fallbackTip(gasSuggestions?.tips?.["1_block"] ?? null);
                const formatPriority = _DashboardFormatPriority;
                let t29;
                if ($[72] !== fastTipValue) {
                    t29 = formatPriority(fastTipValue);
                    $[72] = fastTipValue;
                    $[73] = t29;
                } else {
                    t29 = $[73];
                }
                let t30;
                if ($[74] !== averageTipValue) {
                    t30 = formatPriority(averageTipValue);
                    $[74] = averageTipValue;
                    $[75] = t30;
                } else {
                    t30 = $[75];
                }
                let t31;
                if ($[76] !== slowTipValue) {
                    t31 = formatPriority(slowTipValue);
                    $[76] = slowTipValue;
                    $[77] = t31;
                } else {
                    t31 = $[77];
                }
                let t32;
                if ($[78] !== t29 || $[79] !== t30 || $[80] !== t31) {
                    t32 = {
                        rapid: t29,
                        fast: t30,
                        standard: t31
                    };
                    $[78] = t29;
                    $[79] = t30;
                    $[80] = t31;
                    $[81] = t32;
                } else {
                    t32 = $[81];
                }
                const priorityFees = t32;
                const mempoolSize = gasOracleData?.mempoolCount ?? summary.total_pending;
                const congestionLevel = mempoolSize > 1500 ? "HIGH" : mempoolSize > 800 ? "MEDIUM" : "LOW";
                const congestionColor = congestionLevel === "HIGH" ? "text-red-400" : congestionLevel === "MEDIUM" ? "text-yellow-400" : "text-green-400";
                let t33;
                if ($[82] !== summary.age_p50) {
                    t33 = summary.age_p50?.toFixed(1) || "\u2014";
                    $[82] = summary.age_p50;
                    $[83] = t33;
                } else {
                    t33 = $[83];
                }
                const avgWaitTime = t33;
                let t34;
                if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
                    t34 = [
                        {
                            key: "rank",
                            header: "#",
                            render: _temp,
                            className: "font-mono"
                        },
                        {
                            key: "address",
                            header: "Address",
                            render: _temp2,
                            className: "font-mono"
                        },
                        {
                            key: "volume",
                            header: "Volume (ETH)",
                            render: _temp3,
                            className: "text-green-400 font-medium font-mono"
                        },
                        {
                            key: "count",
                            header: "Tx Count",
                            render: _temp4,
                            className: "text-blue-400 font-mono"
                        }
                    ];
                    $[84] = t34;
                } else {
                    t34 = $[84];
                }
                volumeColumns = t34;
                t10 = "space-y-3";
                let t35;
                if ($[85] === Symbol.for("react.memo_cache_sentinel")) {
                    t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "PENDING"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 269,
                        columnNumber: 17
                    }, this);
                    $[85] = t35;
                } else {
                    t35 = $[85];
                }
                const t36 = summary.total_pending || 0;
                let t37;
                if ($[86] !== t36) {
                    t37 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t35,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-emerald-400 font-mono text-[10px] font-bold",
                                children: t36
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 277,
                                columnNumber: 86
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 277,
                        columnNumber: 17
                    }, this);
                    $[86] = t36;
                    $[87] = t37;
                } else {
                    t37 = $[87];
                }
                let t38;
                if ($[88] === Symbol.for("react.memo_cache_sentinel")) {
                    t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "BASE FEE"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 285,
                        columnNumber: 17
                    }, this);
                    $[88] = t38;
                } else {
                    t38 = $[88];
                }
                let t39;
                if ($[89] !== baseFee) {
                    t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t38,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-amber-400 font-mono text-[10px] font-bold",
                                children: [
                                    baseFee,
                                    "G"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 292,
                                columnNumber: 86
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 292,
                        columnNumber: 17
                    }, this);
                    $[89] = baseFee;
                    $[90] = t39;
                } else {
                    t39 = $[90];
                }
                let t40;
                if ($[91] === Symbol.for("react.memo_cache_sentinel")) {
                    t40 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "CONGESTION"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 300,
                        columnNumber: 17
                    }, this);
                    $[91] = t40;
                } else {
                    t40 = $[91];
                }
                const t41 = `font-mono text-[10px] font-bold ${congestionColor}`;
                let t42;
                if ($[92] !== congestionLevel || $[93] !== t41) {
                    t42 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t40,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: t41,
                                children: congestionLevel
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 308,
                                columnNumber: 86
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 308,
                        columnNumber: 17
                    }, this);
                    $[92] = congestionLevel;
                    $[93] = t41;
                    $[94] = t42;
                } else {
                    t42 = $[94];
                }
                let t43;
                if ($[95] === Symbol.for("react.memo_cache_sentinel")) {
                    t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "SUCCESS"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 317,
                        columnNumber: 17
                    }, this);
                    $[95] = t43;
                } else {
                    t43 = $[95];
                }
                let t44;
                if ($[96] !== summary.success_rate) {
                    t44 = summary.success_rate ? (summary.success_rate * 100).toFixed(0) : "\u2014";
                    $[96] = summary.success_rate;
                    $[97] = t44;
                } else {
                    t44 = $[97];
                }
                let t45;
                if ($[98] !== t44) {
                    t45 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t43,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sky-400 font-mono text-[10px] font-bold",
                                children: [
                                    t44,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 332,
                                columnNumber: 86
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 332,
                        columnNumber: 17
                    }, this);
                    $[98] = t44;
                    $[99] = t45;
                } else {
                    t45 = $[99];
                }
                if ($[100] !== t37 || $[101] !== t39 || $[102] !== t42 || $[103] !== t45) {
                    t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-4 gap-1.5",
                        children: [
                            t37,
                            t39,
                            t42,
                            t45
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 339,
                        columnNumber: 17
                    }, this);
                    $[100] = t37;
                    $[101] = t39;
                    $[102] = t42;
                    $[103] = t45;
                    $[104] = t11;
                } else {
                    t11 = $[104];
                }
                let t46;
                if ($[105] === Symbol.for("react.memo_cache_sentinel")) {
                    t46 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[8px]",
                                    children: "⛽"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 350,
                                    columnNumber: 126
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                    children: "GAS ORACLE"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 350,
                                    columnNumber: 180
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 350,
                            columnNumber: 85
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 350,
                        columnNumber: 17
                    }, this);
                    $[105] = t46;
                } else {
                    t46 = $[105];
                }
                let t47;
                if ($[106] === Symbol.for("react.memo_cache_sentinel")) {
                    t47 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                        children: "RAPID"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 357,
                        columnNumber: 17
                    }, this);
                    $[106] = t47;
                } else {
                    t47 = $[106];
                }
                let t48;
                if ($[107] !== priorityFees.rapid) {
                    t48 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-red-400 font-mono text-[9px] font-bold",
                        children: priorityFees.rapid
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 364,
                        columnNumber: 17
                    }, this);
                    $[107] = priorityFees.rapid;
                    $[108] = t48;
                } else {
                    t48 = $[108];
                }
                let t49;
                if ($[109] === Symbol.for("react.memo_cache_sentinel")) {
                    t49 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[6px]",
                        children: "~15s"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 372,
                        columnNumber: 17
                    }, this);
                    $[109] = t49;
                } else {
                    t49 = $[109];
                }
                let t50;
                if ($[110] !== t48) {
                    t50 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t47,
                            t48,
                            t49
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 379,
                        columnNumber: 17
                    }, this);
                    $[110] = t48;
                    $[111] = t50;
                } else {
                    t50 = $[111];
                }
                let t51;
                if ($[112] === Symbol.for("react.memo_cache_sentinel")) {
                    t51 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                        children: "FAST"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 387,
                        columnNumber: 17
                    }, this);
                    $[112] = t51;
                } else {
                    t51 = $[112];
                }
                let t52;
                if ($[113] !== priorityFees.fast) {
                    t52 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-yellow-400 font-mono text-[9px] font-bold",
                        children: priorityFees.fast
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 394,
                        columnNumber: 17
                    }, this);
                    $[113] = priorityFees.fast;
                    $[114] = t52;
                } else {
                    t52 = $[114];
                }
                let t53;
                if ($[115] === Symbol.for("react.memo_cache_sentinel")) {
                    t53 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[6px]",
                        children: "~45s"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 402,
                        columnNumber: 17
                    }, this);
                    $[115] = t53;
                } else {
                    t53 = $[115];
                }
                let t54;
                if ($[116] !== t52) {
                    t54 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t51,
                            t52,
                            t53
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 409,
                        columnNumber: 17
                    }, this);
                    $[116] = t52;
                    $[117] = t54;
                } else {
                    t54 = $[117];
                }
                let t55;
                if ($[118] === Symbol.for("react.memo_cache_sentinel")) {
                    t55 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                        children: "STANDARD"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 417,
                        columnNumber: 17
                    }, this);
                    $[118] = t55;
                } else {
                    t55 = $[118];
                }
                let t56;
                if ($[119] !== priorityFees.standard) {
                    t56 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-green-400 font-mono text-[9px] font-bold",
                        children: priorityFees.standard
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 424,
                        columnNumber: 17
                    }, this);
                    $[119] = priorityFees.standard;
                    $[120] = t56;
                } else {
                    t56 = $[120];
                }
                let t57;
                if ($[121] === Symbol.for("react.memo_cache_sentinel")) {
                    t57 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[6px]",
                        children: "~75s"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 432,
                        columnNumber: 17
                    }, this);
                    $[121] = t57;
                } else {
                    t57 = $[121];
                }
                let t58;
                if ($[122] !== t56) {
                    t58 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t55,
                            t56,
                            t57
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 439,
                        columnNumber: 17
                    }, this);
                    $[122] = t56;
                    $[123] = t58;
                } else {
                    t58 = $[123];
                }
                let t59;
                if ($[124] !== t50 || $[125] !== t54 || $[126] !== t58) {
                    t59 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-1.5",
                        children: [
                            t50,
                            t54,
                            t58
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 447,
                        columnNumber: 17
                    }, this);
                    $[124] = t50;
                    $[125] = t54;
                    $[126] = t58;
                    $[127] = t59;
                } else {
                    t59 = $[127];
                }
                let t60;
                if ($[128] === Symbol.for("react.memo_cache_sentinel")) {
                    t60 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-400 font-mono text-[6px] tracking-widest",
                        children: "TREND (60s)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 457,
                        columnNumber: 17
                    }, this);
                    $[128] = t60;
                } else {
                    t60 = $[128];
                }
                let t61;
                if ($[129] !== baseFee) {
                    t61 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-0.5",
                        children: [
                            t60,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-cyan-400 font-mono text-[6px]",
                                children: [
                                    baseFee,
                                    "G"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 464,
                                columnNumber: 80
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 464,
                        columnNumber: 17
                    }, this);
                    $[129] = baseFee;
                    $[130] = t61;
                } else {
                    t61 = $[130];
                }
                let t62;
                if ($[131] !== gasPriceHistory) {
                    t62 = gasPriceHistory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$SparklineChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        data: gasPriceHistory,
                        color: "#06b6d4",
                        height: 30
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 472,
                        columnNumber: 47
                    }, this);
                    $[131] = gasPriceHistory;
                    $[132] = t62;
                } else {
                    t62 = $[132];
                }
                let t63;
                if ($[133] !== t61 || $[134] !== t62) {
                    t63 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1.5 bg-gray-900 border border-gray-800 px-1.5 py-1",
                        children: [
                            t61,
                            t62
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 480,
                        columnNumber: 17
                    }, this);
                    $[133] = t61;
                    $[134] = t62;
                    $[135] = t63;
                } else {
                    t63 = $[135];
                }
                let t64;
                if ($[136] !== t59 || $[137] !== t63) {
                    t64 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            t46,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: [
                                    t59,
                                    t63
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 489,
                                columnNumber: 74
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 489,
                        columnNumber: 17
                    }, this);
                    $[136] = t59;
                    $[137] = t63;
                    $[138] = t64;
                } else {
                    t64 = $[138];
                }
                let t65;
                if ($[139] === Symbol.for("react.memo_cache_sentinel")) {
                    t65 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[8px]",
                                    children: "🏥"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 498,
                                    columnNumber: 126
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                    children: "MEMPOOL HEALTH"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 498,
                                    columnNumber: 181
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 498,
                            columnNumber: 85
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 498,
                        columnNumber: 17
                    }, this);
                    $[139] = t65;
                } else {
                    t65 = $[139];
                }
                let t66;
                if ($[140] === Symbol.for("react.memo_cache_sentinel")) {
                    t66 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "CONGESTION"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 505,
                        columnNumber: 17
                    }, this);
                    $[140] = t66;
                } else {
                    t66 = $[140];
                }
                const t67 = `font-mono text-[8px] font-bold ${congestionColor}`;
                let t68;
                if ($[141] !== congestionLevel || $[142] !== t67) {
                    t68 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: t67,
                        children: congestionLevel
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 513,
                        columnNumber: 17
                    }, this);
                    $[141] = congestionLevel;
                    $[142] = t67;
                    $[143] = t68;
                } else {
                    t68 = $[143];
                }
                let t69;
                if ($[144] !== summary.total_pending) {
                    t69 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[5px]",
                        children: [
                            summary.total_pending,
                            " pending"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 522,
                        columnNumber: 17
                    }, this);
                    $[144] = summary.total_pending;
                    $[145] = t69;
                } else {
                    t69 = $[145];
                }
                let t70;
                if ($[146] !== t68 || $[147] !== t69) {
                    t70 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1 py-0.5",
                        children: [
                            t66,
                            t68,
                            t69
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 530,
                        columnNumber: 17
                    }, this);
                    $[146] = t68;
                    $[147] = t69;
                    $[148] = t70;
                } else {
                    t70 = $[148];
                }
                let t71;
                if ($[149] === Symbol.for("react.memo_cache_sentinel")) {
                    t71 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "AVG WAIT"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 539,
                        columnNumber: 17
                    }, this);
                    $[149] = t71;
                } else {
                    t71 = $[149];
                }
                let t72;
                if ($[150] !== avgWaitTime) {
                    t72 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-blue-400 font-mono text-[8px] font-bold",
                        children: [
                            avgWaitTime,
                            "s"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 546,
                        columnNumber: 17
                    }, this);
                    $[150] = avgWaitTime;
                    $[151] = t72;
                } else {
                    t72 = $[151];
                }
                let t73;
                if ($[152] === Symbol.for("react.memo_cache_sentinel")) {
                    t73 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[5px]",
                        children: "P50 latency"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 554,
                        columnNumber: 17
                    }, this);
                    $[152] = t73;
                } else {
                    t73 = $[152];
                }
                let t74;
                if ($[153] !== t72) {
                    t74 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1 py-0.5",
                        children: [
                            t71,
                            t72,
                            t73
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 561,
                        columnNumber: 17
                    }, this);
                    $[153] = t72;
                    $[154] = t74;
                } else {
                    t74 = $[154];
                }
                let t75;
                if ($[155] === Symbol.for("react.memo_cache_sentinel")) {
                    t75 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "SUCCESS"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 569,
                        columnNumber: 17
                    }, this);
                    $[155] = t75;
                } else {
                    t75 = $[155];
                }
                let t76;
                if ($[156] !== summary.success_rate) {
                    t76 = summary.success_rate ? (summary.success_rate * 100).toFixed(0) : "\u2014";
                    $[156] = summary.success_rate;
                    $[157] = t76;
                } else {
                    t76 = $[157];
                }
                let t77;
                if ($[158] !== t76) {
                    t77 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-green-400 font-mono text-[8px] font-bold",
                        children: [
                            t76,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 584,
                        columnNumber: 17
                    }, this);
                    $[158] = t76;
                    $[159] = t77;
                } else {
                    t77 = $[159];
                }
                let t78;
                if ($[160] === Symbol.for("react.memo_cache_sentinel")) {
                    t78 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[5px]",
                        children: "Inclusion"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 592,
                        columnNumber: 17
                    }, this);
                    $[160] = t78;
                } else {
                    t78 = $[160];
                }
                let t79;
                if ($[161] !== t77) {
                    t79 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1 py-0.5",
                        children: [
                            t75,
                            t77,
                            t78
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 599,
                        columnNumber: 17
                    }, this);
                    $[161] = t77;
                    $[162] = t79;
                } else {
                    t79 = $[162];
                }
                let t80;
                if ($[163] === Symbol.for("react.memo_cache_sentinel")) {
                    t80 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-600 font-mono text-[6px] tracking-widest mb-0.5",
                        children: "RPC"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 607,
                        columnNumber: 17
                    }, this);
                    $[163] = t80;
                } else {
                    t80 = $[163];
                }
                const t81 = status?.rpc_latency_ms || "\u2014";
                let t82;
                if ($[164] !== t81) {
                    t82 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-purple-400 font-mono text-[8px] font-bold",
                        children: [
                            t81,
                            "ms"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 615,
                        columnNumber: 17
                    }, this);
                    $[164] = t81;
                    $[165] = t82;
                } else {
                    t82 = $[165];
                }
                let t83;
                if ($[166] === Symbol.for("react.memo_cache_sentinel")) {
                    t83 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[5px]",
                        children: "Response"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 623,
                        columnNumber: 17
                    }, this);
                    $[166] = t83;
                } else {
                    t83 = $[166];
                }
                let t84;
                if ($[167] !== t82) {
                    t84 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-1 py-0.5",
                        children: [
                            t80,
                            t82,
                            t83
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 630,
                        columnNumber: 17
                    }, this);
                    $[167] = t82;
                    $[168] = t84;
                } else {
                    t84 = $[168];
                }
                let t85;
                if ($[169] !== t70 || $[170] !== t74 || $[171] !== t79 || $[172] !== t84) {
                    t85 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            t65,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-1",
                                    children: [
                                        t70,
                                        t74,
                                        t79,
                                        t84
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 638,
                                    columnNumber: 97
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 638,
                                columnNumber: 74
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 638,
                        columnNumber: 17
                    }, this);
                    $[169] = t70;
                    $[170] = t74;
                    $[171] = t79;
                    $[172] = t84;
                    $[173] = t85;
                } else {
                    t85 = $[173];
                }
                if ($[174] !== t64 || $[175] !== t85) {
                    t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
                        children: [
                            t64,
                            t85
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 648,
                        columnNumber: 17
                    }, this);
                    $[174] = t64;
                    $[175] = t85;
                    $[176] = t12;
                } else {
                    t12 = $[176];
                }
                t27 = "grid grid-cols-1 lg:grid-cols-2 gap-3";
                t25 = "bg-gray-900 border border-gray-800";
                if ($[177] === Symbol.for("react.memo_cache_sentinel")) {
                    t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[8px]",
                                    children: "📊"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 658,
                                    columnNumber: 126
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                    children: "GAS PRICE DISTRIBUTION"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 658,
                                    columnNumber: 181
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 658,
                            columnNumber: 85
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 658,
                        columnNumber: 17
                    }, this);
                    $[177] = t26;
                } else {
                    t26 = $[177];
                }
                t24 = "p-2";
                t22 = "space-y-2";
                t23 = gasDistribution.map({
                    "Dashboard[gasDistribution.map()]": (item, index_0)=>{
                        const maxValue = Math.max(...gasDistribution.map(_DashboardGasDistributionMapGasDistributionMap));
                        const barWidth = maxValue > 0 ? item.value / maxValue * 100 : 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-400 font-mono text-[6px] w-10 truncate",
                                    children: item.name
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 669,
                                    columnNumber: 75
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 bg-gray-800 rounded-sm h-3 relative",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-sm transition-all duration-300",
                                        style: {
                                            width: `${barWidth}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 669,
                                        columnNumber: 218
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 669,
                                    columnNumber: 158
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-cyan-400 font-mono text-[6px] w-10 text-right",
                                    children: item.value.toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 671,
                                    columnNumber: 28
                                }, this)
                            ]
                        }, index_0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 669,
                            columnNumber: 20
                        }, this);
                    }
                }["Dashboard[gasDistribution.map()]"]);
                $[50] = gas?.oracle;
                $[51] = gas?.suggestions;
                $[52] = gasPriceHistory;
                $[53] = status?.rpc_latency_ms;
                $[54] = summary.age_p50;
                $[55] = summary.gas_buckets;
                $[56] = summary.success_rate;
                $[57] = summary.total_pending;
                $[58] = gasDistribution;
                $[59] = t10;
                $[60] = t11;
                $[61] = t12;
                $[62] = t22;
                $[63] = t23;
                $[64] = t24;
                $[65] = t25;
                $[66] = t26;
                $[67] = t27;
                $[68] = volumeColumns;
            } else {
                gasDistribution = $[58];
                t10 = $[59];
                t11 = $[60];
                t12 = $[61];
                t22 = $[62];
                t23 = $[63];
                t24 = $[64];
                t25 = $[65];
                t26 = $[66];
                t27 = $[67];
                volumeColumns = $[68];
            }
            let t28;
            if ($[178] !== t22 || $[179] !== t23) {
                t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: t22,
                    children: t23
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 708,
                    columnNumber: 15
                }, this);
                $[178] = t22;
                $[179] = t23;
                $[180] = t28;
            } else {
                t28 = $[180];
            }
            let t29;
            if ($[181] !== gasDistribution.length) {
                t29 = gasDistribution.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-600 font-mono text-[7px] text-center py-4",
                    children: "[NO GAS DATA]"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 717,
                    columnNumber: 47
                }, this);
                $[181] = gasDistribution.length;
                $[182] = t29;
            } else {
                t29 = $[182];
            }
            let t30;
            if ($[183] !== t24 || $[184] !== t28 || $[185] !== t29) {
                t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: t24,
                    children: [
                        t28,
                        t29
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 725,
                    columnNumber: 15
                }, this);
                $[183] = t24;
                $[184] = t28;
                $[185] = t29;
                $[186] = t30;
            } else {
                t30 = $[186];
            }
            let t31;
            if ($[187] !== t25 || $[188] !== t26 || $[189] !== t30) {
                t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: t25,
                    children: [
                        t26,
                        t30
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 735,
                    columnNumber: 15
                }, this);
                $[187] = t25;
                $[188] = t26;
                $[189] = t30;
                $[190] = t31;
            } else {
                t31 = $[190];
            }
            let t32;
            if ($[191] === Symbol.for("react.memo_cache_sentinel")) {
                t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-emerald-400 text-[8px]",
                                children: "📈"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 745,
                                columnNumber: 124
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                children: "INGRESS/EGRESS RATES"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 745,
                                columnNumber: 179
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 745,
                        columnNumber: 83
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 745,
                    columnNumber: 15
                }, this);
                $[191] = t32;
            } else {
                t32 = $[191];
            }
            let t33;
            if ($[192] !== ingressHistory) {
                t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 border border-gray-800",
                    children: [
                        t32,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2",
                            children: ingressHistory.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$TimeSeriesChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            data: ingressHistory.slice(-10),
                                            lines: [
                                                {
                                                    dataKey: "ingress",
                                                    color: "#10b981",
                                                    name: "Ingress"
                                                },
                                                {
                                                    dataKey: "egress",
                                                    color: "#ef4444",
                                                    name: "Egress"
                                                }
                                            ],
                                            height: 100
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 752,
                                            columnNumber: 186
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 752,
                                        columnNumber: 149
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center text-[6px] font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-1.5 h-1.5 bg-green-500 rounded-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 155
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-green-400",
                                                        children: "IN:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 212
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-300",
                                                        children: [
                                                            ingressHistory[ingressHistory.length - 1]?.ingress || 0,
                                                            "/s"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 255
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 760,
                                                columnNumber: 114
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-1.5 h-1.5 bg-red-500 rounded-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 400
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-red-400",
                                                        children: "OUT:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 455
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-300",
                                                        children: [
                                                            ingressHistory[ingressHistory.length - 1]?.egress || 0,
                                                            "/s"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 497
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 760,
                                                columnNumber: 359
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 760,
                                        columnNumber: 42
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 752,
                                columnNumber: 122
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[7px] text-center py-6",
                                children: "[NO FLOW DATA]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 760,
                                columnNumber: 615
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 752,
                            columnNumber: 72
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 752,
                    columnNumber: 15
                }, this);
                $[192] = ingressHistory;
                $[193] = t33;
            } else {
                t33 = $[193];
            }
            if ($[194] !== t27 || $[195] !== t31 || $[196] !== t33) {
                t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: t27,
                    children: [
                        t31,
                        t33
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 767,
                    columnNumber: 15
                }, this);
                $[194] = t27;
                $[195] = t31;
                $[196] = t33;
                $[197] = t13;
            } else {
                t13 = $[197];
            }
            t20 = "grid grid-cols-1 lg:grid-cols-2 gap-3";
            let t34;
            if ($[198] === Symbol.for("react.memo_cache_sentinel")) {
                t34 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-emerald-400 text-[8px]",
                                children: "🏷️"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 778,
                                columnNumber: 124
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                children: "TX TYPE DISTRIBUTION"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 778,
                                columnNumber: 180
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 778,
                        columnNumber: 83
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 778,
                    columnNumber: 15
                }, this);
                $[198] = t34;
            } else {
                t34 = $[198];
            }
            const t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-3 gap-1 w-full max-h-24 overflow-y-auto",
                    children: protocolData.map({
                        "Dashboard[protocolData.map()]": (item_0, index_1)=>{
                            const percentage = protocolData.length > 0 ? item_0.value / protocolData.reduce(_DashboardProtocolDataMapProtocolDataReduce, 0) * 100 : 0;
                            const barHeight = Math.max(percentage * 0.8, 4);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-400 font-mono text-[6px] text-center w-full truncate",
                                        title: item_0.name,
                                        children: item_0.name.length > 8 ? `${item_0.name.substring(0, 8)}...` : item_0.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 787,
                                        columnNumber: 86
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gray-800 rounded-sm w-4 h-12 relative flex items-end",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gradient-to-t from-sky-600 to-sky-400 w-full rounded-sm transition-all duration-300",
                                            style: {
                                                height: `${barHeight}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 787,
                                            columnNumber: 341
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 787,
                                        columnNumber: 268
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sky-400 font-mono text-[6px] text-center",
                                        children: [
                                            percentage.toFixed(0),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 789,
                                        columnNumber: 30
                                    }, this)
                                ]
                            }, index_1, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 787,
                                columnNumber: 22
                            }, this);
                        }
                    }["Dashboard[protocolData.map()]"])
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 783,
                    columnNumber: 63
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 783,
                columnNumber: 19
            }, this);
            const t36 = protocolData.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600 font-mono text-[7px] text-center py-4",
                children: "[NO TX TYPE DATA]"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 792,
                columnNumber: 48
            }, this);
            if ($[199] !== t35 || $[200] !== t36) {
                t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 border border-gray-800",
                    children: [
                        t34,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2",
                            children: [
                                t35,
                                t36
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 794,
                            columnNumber: 72
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 794,
                    columnNumber: 15
                }, this);
                $[199] = t35;
                $[200] = t36;
                $[201] = t21;
            } else {
                t21 = $[201];
            }
            t18 = "bg-gray-900 border border-gray-800";
            if ($[202] === Symbol.for("react.memo_cache_sentinel")) {
                t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-emerald-400 text-[8px]",
                                children: "🔮"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 803,
                                columnNumber: 124
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                children: "PROTOCOL USAGE"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 803,
                                columnNumber: 179
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 803,
                        columnNumber: 83
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 803,
                    columnNumber: 15
                }, this);
                $[202] = t19;
            } else {
                t19 = $[202];
            }
            t16 = "p-2";
            t17 = protocolData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$PieChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            data: protocolData.slice(0, 5),
                            height: 120,
                            innerRadius: 25
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 809,
                            columnNumber: 103
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 809,
                        columnNumber: 66
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 gap-1 max-h-20 overflow-y-auto",
                        children: protocolData.slice(0, 6).map(_DashboardAnonymous6)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 809,
                        columnNumber: 183
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 809,
                columnNumber: 39
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600 font-mono text-[7px] text-center py-6",
                children: "[NO PROTOCOL DATA]"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 809,
                columnNumber: 315
            }, this);
            $[29] = gas?.oracle;
            $[30] = gas?.suggestions;
            $[31] = gasPriceHistory;
            $[32] = ingressHistory;
            $[33] = status?.rpc_latency_ms;
            $[34] = summary.age_p50;
            $[35] = summary.by_type;
            $[36] = summary.gas_buckets;
            $[37] = summary.success_rate;
            $[38] = summary.total_pending;
            $[39] = t10;
            $[40] = t11;
            $[41] = t12;
            $[42] = t13;
            $[43] = t16;
            $[44] = t17;
            $[45] = t18;
            $[46] = t19;
            $[47] = t20;
            $[48] = t21;
            $[49] = volumeColumns;
        } else {
            t10 = $[39];
            t11 = $[40];
            t12 = $[41];
            t13 = $[42];
            t16 = $[43];
            t17 = $[44];
            t18 = $[45];
            t19 = $[46];
            t20 = $[47];
            t21 = $[48];
            volumeColumns = $[49];
        }
        let t22;
        if ($[203] !== t16 || $[204] !== t17) {
            t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: t16,
                children: t17
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 846,
                columnNumber: 13
            }, this);
            $[203] = t16;
            $[204] = t17;
            $[205] = t22;
        } else {
            t22 = $[205];
        }
        let t23;
        if ($[206] !== t18 || $[207] !== t19 || $[208] !== t22) {
            t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: t18,
                children: [
                    t19,
                    t22
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 855,
                columnNumber: 13
            }, this);
            $[206] = t18;
            $[207] = t19;
            $[208] = t22;
            $[209] = t23;
        } else {
            t23 = $[209];
        }
        if ($[210] !== t20 || $[211] !== t21 || $[212] !== t23) {
            t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: t20,
                children: [
                    t21,
                    t23
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 864,
                columnNumber: 13
            }, this);
            $[210] = t20;
            $[211] = t21;
            $[212] = t23;
            $[213] = t14;
        } else {
            t14 = $[213];
        }
        t8 = "grid grid-cols-1 lg:grid-cols-2 gap-3";
        let t24;
        let t25;
        if ($[214] === Symbol.for("react.memo_cache_sentinel")) {
            t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-emerald-400 text-[8px]",
                children: "🏛️"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 876,
                columnNumber: 13
            }, this);
            t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                children: "TOP CONTRACTS"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 877,
                columnNumber: 13
            }, this);
            $[214] = t24;
            $[215] = t25;
        } else {
            t24 = $[214];
            t25 = $[215];
        }
        const t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                t24,
                t25,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                    children: [
                        topContracts.length,
                        " ACTIVE"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 884,
                    columnNumber: 68
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 884,
            columnNumber: 17
        }, this);
        let t27;
        if ($[216] !== t26) {
            t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: t26
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 887,
                columnNumber: 13
            }, this);
            $[216] = t26;
            $[217] = t27;
        } else {
            t27 = $[217];
        }
        let t28;
        if ($[218] === Symbol.for("react.memo_cache_sentinel")) {
            t28 = [
                {
                    key: "rank",
                    header: "#",
                    render: _temp5,
                    className: "text-cyan-400 font-mono font-bold"
                },
                {
                    key: "address",
                    header: "Address",
                    render: _temp6,
                    className: "font-mono text-cyan-400"
                },
                {
                    key: "count",
                    header: "Txs",
                    render: _temp7,
                    className: "text-cyan-400 font-mono"
                }
            ];
            $[218] = t28;
        } else {
            t28 = $[218];
        }
        const t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: topContracts.map(_DashboardTopContractsMap),
                columns: t28,
                emptyMessage: "[NO CONTRACT ACTIVITY]",
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 915,
                columnNumber: 40
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 915,
            columnNumber: 17
        }, this);
        if ($[219] !== t27 || $[220] !== t29) {
            t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border border-gray-800",
                children: [
                    t27,
                    t29
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 917,
                columnNumber: 12
            }, this);
            $[219] = t27;
            $[220] = t29;
            $[221] = t9;
        } else {
            t9 = $[221];
        }
        t6 = "bg-gray-900 border border-gray-800";
        let t30;
        let t31;
        if ($[222] === Symbol.for("react.memo_cache_sentinel")) {
            t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-emerald-400 text-[8px]",
                children: "👤"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 928,
                columnNumber: 13
            }, this);
            t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                children: "TOP SENDERS BY ACTIVITY"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 929,
                columnNumber: 13
            }, this);
            $[222] = t30;
            $[223] = t31;
        } else {
            t30 = $[222];
            t31 = $[223];
        }
        const t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                t30,
                t31,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                    children: [
                        topSenders.length,
                        " ACTIVE"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 936,
                    columnNumber: 68
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 936,
            columnNumber: 17
        }, this);
        if ($[224] !== t32) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: t32
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 938,
                columnNumber: 12
            }, this);
            $[224] = t32;
            $[225] = t7;
        } else {
            t7 = $[225];
        }
        t5 = "p-1.5";
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
        t4 = topSenders.map(_DashboardTopSendersMap);
        $[7] = filters;
        $[8] = gas?.oracle;
        $[9] = gas?.suggestions;
        $[10] = gasPriceHistory;
        $[11] = ingressHistory;
        $[12] = snapshot.live;
        $[13] = status?.rpc_latency_ms;
        $[14] = summary;
        $[15] = T0;
        $[16] = t10;
        $[17] = t11;
        $[18] = t12;
        $[19] = t13;
        $[20] = t14;
        $[21] = t4;
        $[22] = t5;
        $[23] = t6;
        $[24] = t7;
        $[25] = t8;
        $[26] = t9;
        $[27] = topSendersByVolume;
        $[28] = volumeColumns;
    } else {
        T0 = $[15];
        t10 = $[16];
        t11 = $[17];
        t12 = $[18];
        t13 = $[19];
        t14 = $[20];
        t4 = $[21];
        t5 = $[22];
        t6 = $[23];
        t7 = $[24];
        t8 = $[25];
        t9 = $[26];
        topSendersByVolume = $[27];
        volumeColumns = $[28];
    }
    let t15;
    if ($[226] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = [
            {
                key: "rank",
                header: "#",
                render: _temp8,
                className: "text-purple-400 font-mono font-bold"
            },
            {
                key: "address",
                header: "Address",
                render: _temp9,
                className: "font-mono text-purple-400"
            },
            {
                key: "count",
                header: "Txs",
                render: _temp10,
                className: "text-purple-400 font-mono"
            }
        ];
        $[226] = t15;
    } else {
        t15 = $[226];
    }
    let t16;
    if ($[227] !== T0 || $[228] !== t4) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            data: t4,
            columns: t15,
            emptyMessage: "[NO SENDER ACTIVITY]",
            density: "compact"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1009,
            columnNumber: 11
        }, this);
        $[227] = T0;
        $[228] = t4;
        $[229] = t16;
    } else {
        t16 = $[229];
    }
    let t17;
    if ($[230] !== t16 || $[231] !== t5) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t5,
            children: t16
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1018,
            columnNumber: 11
        }, this);
        $[230] = t16;
        $[231] = t5;
        $[232] = t17;
    } else {
        t17 = $[232];
    }
    let t18;
    if ($[233] !== t17 || $[234] !== t6 || $[235] !== t7) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t6,
            children: [
                t7,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1027,
            columnNumber: 11
        }, this);
        $[233] = t17;
        $[234] = t6;
        $[235] = t7;
        $[236] = t18;
    } else {
        t18 = $[236];
    }
    let t19;
    if ($[237] !== t18 || $[238] !== t8 || $[239] !== t9) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t8,
            children: [
                t9,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1037,
            columnNumber: 11
        }, this);
        $[237] = t18;
        $[238] = t8;
        $[239] = t9;
        $[240] = t19;
    } else {
        t19 = $[240];
    }
    let t20;
    let t21;
    if ($[241] === Symbol.for("react.memo_cache_sentinel")) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-emerald-400 text-[8px]",
            children: "💎"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1048,
            columnNumber: 11
        }, this);
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
            children: "TOP SENDERS BY VOLUME"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1049,
            columnNumber: 11
        }, this);
        $[241] = t20;
        $[242] = t21;
    } else {
        t20 = $[241];
        t21 = $[242];
    }
    let t22;
    if ($[243] !== topSendersByVolume.length) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    t20,
                    t21,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                        children: [
                            topSendersByVolume.length,
                            " HIGH VALUE"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 1058,
                        columnNumber: 130
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 1058,
                columnNumber: 79
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1058,
            columnNumber: 11
        }, this);
        $[243] = topSendersByVolume.length;
        $[244] = t22;
    } else {
        t22 = $[244];
    }
    let t23;
    if ($[245] !== topSendersByVolume || $[246] !== volumeColumns) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: topSendersByVolume,
                columns: volumeColumns,
                emptyMessage: "[NO VOLUME DATA...]",
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 1066,
                columnNumber: 34
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1066,
            columnNumber: 11
        }, this);
        $[245] = topSendersByVolume;
        $[246] = volumeColumns;
        $[247] = t23;
    } else {
        t23 = $[247];
    }
    let t24;
    if ($[248] !== t22 || $[249] !== t23) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800",
            children: [
                t22,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1075,
            columnNumber: 11
        }, this);
        $[248] = t22;
        $[249] = t23;
        $[250] = t24;
    } else {
        t24 = $[250];
    }
    let t25;
    if ($[251] === Symbol.for("react.memo_cache_sentinel")) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800 px-2 py-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-green-400 text-[8px]",
                            children: "🔗"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 1084,
                            columnNumber: 119
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-gray-400 font-mono text-[7px] tracking-widest",
                            children: "WEBSOCKET"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 1084,
                            columnNumber: 172
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 1084,
                    columnNumber: 73
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-green-400 font-mono text-[8px] font-bold",
                    children: "CONNECTED"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 1084,
                    columnNumber: 263
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1084,
            columnNumber: 11
        }, this);
        $[251] = t25;
    } else {
        t25 = $[251];
    }
    let t26;
    if ($[252] === Symbol.for("react.memo_cache_sentinel")) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-blue-400 text-[8px]",
                    children: "📡"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 1091,
                    columnNumber: 57
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-gray-400 font-mono text-[7px] tracking-widest",
                    children: "SUBSCRIPTIONS"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 1091,
                    columnNumber: 109
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1091,
            columnNumber: 11
        }, this);
        $[252] = t26;
    } else {
        t26 = $[252];
    }
    let t27;
    if ($[253] !== status?.subscriptions_active) {
        t27 = status?.subscriptions_active || [];
        $[253] = status?.subscriptions_active;
        $[254] = t27;
    } else {
        t27 = $[254];
    }
    let t28;
    if ($[255] !== t27.length) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800 px-2 py-1",
            children: [
                t26,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-blue-400 font-mono text-[8px] font-bold",
                    children: t27.length
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 1106,
                    columnNumber: 78
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1106,
            columnNumber: 11
        }, this);
        $[255] = t27.length;
        $[256] = t28;
    } else {
        t28 = $[256];
    }
    const t29 = `${(status?.errors || []).length ? "text-red-400" : "text-green-400"} text-[8px]`;
    const t30 = (status?.errors || []).length ? "\uD83D\uDEA8" : "\u2705";
    let t31;
    if ($[257] !== t29 || $[258] !== t30) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t29,
            children: t30
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1116,
            columnNumber: 11
        }, this);
        $[257] = t29;
        $[258] = t30;
        $[259] = t31;
    } else {
        t31 = $[259];
    }
    let t32;
    if ($[260] === Symbol.for("react.memo_cache_sentinel")) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-gray-400 font-mono text-[7px] tracking-widest",
            children: "ERRORS"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1125,
            columnNumber: 11
        }, this);
        $[260] = t32;
    } else {
        t32 = $[260];
    }
    let t33;
    if ($[261] !== t31) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-1",
            children: [
                t31,
                t32
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1132,
            columnNumber: 11
        }, this);
        $[261] = t31;
        $[262] = t33;
    } else {
        t33 = $[262];
    }
    const t34 = `font-mono text-[8px] font-bold ${(status?.errors || []).length ? "text-red-400" : "text-green-400"}`;
    let t35;
    if ($[263] !== status?.errors) {
        t35 = status?.errors || [];
        $[263] = status?.errors;
        $[264] = t35;
    } else {
        t35 = $[264];
    }
    let t36;
    if ($[265] !== t34 || $[266] !== t35.length) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t34,
            children: t35.length
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1149,
            columnNumber: 11
        }, this);
        $[265] = t34;
        $[266] = t35.length;
        $[267] = t36;
    } else {
        t36 = $[267];
    }
    let t37;
    if ($[268] !== t33 || $[269] !== t36) {
        t37 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800 px-2 py-1",
            children: [
                t33,
                t36
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1158,
            columnNumber: 11
        }, this);
        $[268] = t33;
        $[269] = t36;
        $[270] = t37;
    } else {
        t37 = $[270];
    }
    let t38;
    if ($[271] !== t28 || $[272] !== t37) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-2",
            children: [
                t25,
                t28,
                t37
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1167,
            columnNumber: 11
        }, this);
        $[271] = t28;
        $[272] = t37;
        $[273] = t38;
    } else {
        t38 = $[273];
    }
    let t39;
    if ($[274] !== t10 || $[275] !== t11 || $[276] !== t12 || $[277] !== t13 || $[278] !== t14 || $[279] !== t19 || $[280] !== t24 || $[281] !== t38) {
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t10,
            children: [
                t11,
                t12,
                t13,
                t14,
                t19,
                t24,
                t38
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 1176,
            columnNumber: 11
        }, this);
        $[274] = t10;
        $[275] = t11;
        $[276] = t12;
        $[277] = t13;
        $[278] = t14;
        $[279] = t19;
        $[280] = t24;
        $[281] = t38;
        $[282] = t39;
    } else {
        t39 = $[282];
    }
    return t39;
}
_s(Dashboard, "qvjGRaHde96C9BBfrZJc9IZuwtY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"]
    ];
});
_c = Dashboard;
function _temp10(value_8) {
    return value_8.toString();
}
function _temp9(value_7) {
    return `${value_7.slice(0, 6)}...${value_7.slice(-4)}`;
}
function _temp8(__1, ___1, index_4) {
    return (index_4 + 1).toString();
}
function _DashboardTopSendersMap(t0) {
    const [address_1, count_0] = t0;
    return {
        address: address_1,
        count: count_0
    };
}
function _temp7(value_6) {
    return value_6.toString();
}
function _temp6(value_5) {
    return `${value_5.slice(0, 6)}...${value_5.slice(-4)}`;
}
function _temp5(__0, ___0, index_3) {
    return (index_3 + 1).toString();
}
function _DashboardTopContractsMap(t0) {
    const [address_0, count] = t0;
    return {
        address: address_0,
        count
    };
}
function _DashboardAnonymous6(item_1, index_2) {
    const colors = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-2 h-2 rounded-full flex-shrink-0",
                style: {
                    backgroundColor: colors[index_2 % colors.length]
                }
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 1225,
                columnNumber: 65
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-400 font-mono text-[6px] truncate flex-1",
                children: item_1.name
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 1227,
                columnNumber: 10
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-500 font-mono text-[6px] w-8 text-right",
                children: item_1.value
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 1227,
                columnNumber: 99
            }, this)
        ]
    }, index_2, true, {
        fileName: "[project]/src/app/components/Dashboard.tsx",
        lineNumber: 1225,
        columnNumber: 10
    }, this);
}
function _DashboardProtocolDataMapProtocolDataReduce(sum, d_0) {
    return sum + d_0.value;
}
function _DashboardGasDistributionMapGasDistributionMap(d) {
    return d.value;
}
function _temp4(value_4) {
    return value_4.toLocaleString();
}
function _temp3(value_3) {
    if (value_3 >= 1000) {
        return `${(value_3 / 1000).toFixed(1)}K`;
    }
    if (value_3 >= 1) {
        return value_3.toFixed(3);
    }
    if (value_3 >= 0.001) {
        return `${(value_3 * 1000).toFixed(0)}m`;
    }
    return `${(value_3 * 1000000).toFixed(0)}μ`;
}
function _temp2(value_2) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer",
        children: [
            value_2.slice(0, 6),
            "...",
            value_2.slice(-4)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Dashboard.tsx",
        lineNumber: 1251,
        columnNumber: 10
    }, this);
}
function _temp(_, __, index) {
    const rank = index + 1;
    const rankStr = rank.toString().padStart(2, "0");
    let colorClass = "text-gray-600";
    if (rank === 1) {
        colorClass = "text-yellow-400";
    } else {
        if (rank === 2) {
            colorClass = "text-gray-400";
        } else {
            if (rank === 3) {
                colorClass = "text-orange-500";
            } else {
                if (rank <= 5) {
                    colorClass = "text-emerald-400";
                } else {
                    if (rank <= 10) {
                        colorClass = "text-sky-400";
                    }
                }
            }
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `${colorClass} font-mono font-bold`,
        children: rankStr
    }, void 0, false, {
        fileName: "[project]/src/app/components/Dashboard.tsx",
        lineNumber: 1276,
        columnNumber: 10
    }, this);
}
function _DashboardFormatPriority(value_1) {
    return value_1 != null && Number.isFinite(value_1) ? value_1.toFixed(2) : "\u2014";
}
function _DashboardFallbackTip(value_0) {
    return value_0 != null ? value_0 / 1000000000 : null;
}
function _DashboardAnonymous5(t0) {
    const [name, value] = t0;
    return {
        name: name.length > 15 ? name.slice(0, 15) + "..." : name,
        value: value
    };
}
function _DashboardAnonymous4(t0, t1) {
    const [, a_2] = t0;
    const [, b_2] = t1;
    return b_2 - a_2;
}
function _DashboardAnonymous3(a_1, b_1) {
    return Number(b_1[1] - a_1[1]);
}
function _DashboardAnonymous2(a_0, b_0) {
    return b_0[1] - a_0[1];
}
function _DashboardAnonymous(a, b) {
    return b[1] - a[1];
}
var _c;
__turbopack_context__.k.register(_c, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/utils/amountUtilsEthers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Ethers-based amount decoding and formatting utilities
__turbopack_context__.s([
    "calculateAmount",
    ()=>calculateAmount,
    "calculateUnifiedEth",
    ()=>calculateUnifiedEth,
    "extractAmountInfo",
    ()=>extractAmountInfo,
    "formatTokenAmount",
    ()=>formatTokenAmount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
;
// Minimal well-known tokens to handle non-18 decimals without heavy registries
const KNOWN_TOKENS = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        symbol: 'USDC',
        decimals: 6
    },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
        symbol: 'USDT',
        decimals: 6
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
        symbol: 'DAI',
        decimals: 18
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
        symbol: 'WBTC',
        decimals: 8
    },
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
        symbol: 'WETH',
        decimals: 18
    }
};
function getKnownToken(address) {
    if (!address) return undefined;
    return KNOWN_TOKENS[(address || '').toLowerCase()];
}
const MAX_UINT256 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].MaxUint256;
function toBigIntSafe(v) {
    try {
        if (typeof v === 'bigint') return v;
        return BigInt(v);
    } catch  {
        return BigInt(0);
    }
}
function isUnlimitedUsdt(value) {
    try {
        const bi = toBigIntSafe(value);
        // Treat near-maximum approvals as unlimited
        return bi >= MAX_UINT256 - BigInt(1000);
    } catch  {
        return false;
    }
}
function isHexNonZero(value) {
    if (!value) return false;
    try {
        return BigInt(value) > BigInt(0);
    } catch  {
        return false;
    }
}
function safeFormatUnits(value, decimals) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(value, decimals);
    } catch  {
        return '-';
    }
}
function extractAmountInfo(tx) {
    try {
        if (!tx) return {
            amount: '-',
            unit: 'ETH',
            unifiedEth: '-'
        };
        // Native ETH
        if (isHexNonZero(tx.value)) {
            const eth = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatEther(tx.value);
            return {
                amount: eth,
                unit: 'ETH',
                unifiedEth: eth
            };
        }
        // Function-based (ERC-20 transfer/approve)
        const decoded = tx?._decoded_fn;
        if (decoded && decoded.function) {
            const fn = String(decoded.function).toLowerCase();
            if (fn.includes('transfer') || fn.includes('approve') || fn.includes('permit') || fn.includes('increaseallowance')) {
                const arg = (decoded.args || []).find((a)=>[
                        'value',
                        '_value',
                        'amount',
                        'wad',
                        'amountIn',
                        'amountOutMin'
                    ].includes(a?.name));
                if (arg && arg.value != null) {
                    const tokenMeta = getKnownToken(tx?.to) || {
                        symbol: 'ERC20',
                        decimals: 18
                    };
                    // Special handling for USDT unlimited approvals
                    if (tokenMeta.symbol === 'USDT' && (fn.includes('approve') || fn.includes('permit') || fn.includes('increaseallowance')) && isUnlimitedUsdt(arg.value)) {
                        return {
                            amount: '∞',
                            unit: 'USDT',
                            unifiedEth: '-'
                        };
                    }
                    return {
                        amount: safeFormatUnits(arg.value, tokenMeta.decimals),
                        unit: tokenMeta.symbol,
                        unifiedEth: '-'
                    };
                }
            }
        }
        // Event-based (ERC-20 Transfer/Approval)
        const events = tx?._decoded_events;
        if (Array.isArray(events)) {
            for (const ev of events){
                if ((ev?.event || '').toLowerCase() === 'transfer' && Array.isArray(ev?.args)) {
                    const valArg = ev.args.find((a)=>[
                            'value',
                            'amount',
                            'wad'
                        ].includes(a?.name));
                    if (valArg && valArg.value != null) {
                        const tokenMeta = getKnownToken(ev?.address) || {
                            symbol: 'ERC20',
                            decimals: 18
                        };
                        return {
                            amount: safeFormatUnits(valArg.value, tokenMeta.decimals),
                            unit: tokenMeta.symbol,
                            unifiedEth: '-'
                        };
                    }
                }
                if ((ev?.event || '').toLowerCase() === 'approval' && Array.isArray(ev?.args)) {
                    const valArg = ev.args.find((a)=>[
                            'value',
                            'amount'
                        ].includes(a?.name));
                    if (valArg && valArg.value != null) {
                        const tokenMeta = getKnownToken(ev?.address) || {
                            symbol: 'ERC20',
                            decimals: 18
                        };
                        if (tokenMeta.symbol === 'USDT' && isUnlimitedUsdt(valArg.value)) {
                            return {
                                amount: '∞',
                                unit: 'USDT',
                                unifiedEth: '-'
                            };
                        }
                        return {
                            amount: safeFormatUnits(valArg.value, tokenMeta.decimals),
                            unit: tokenMeta.symbol,
                            unifiedEth: '-'
                        };
                    }
                }
            }
        }
        return {
            amount: '-',
            unit: 'ETH',
            unifiedEth: '-'
        };
    } catch  {
        return {
            amount: '-',
            unit: 'ETH',
            unifiedEth: '-'
        };
    }
}
function formatTokenAmount(amount, decimals = 18) {
    return safeFormatUnits(amount, decimals);
}
function calculateAmount(tx) {
    const info = extractAmountInfo(tx);
    return info.amount === '-' ? '-' : `${info.amount} ${info.unit}`;
}
function calculateUnifiedEth(tx) {
    try {
        return isHexNonZero(tx?.value) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatEther(tx.value) : '-';
    } catch  {
        return '-';
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Opportunities.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Opportunities
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtilsEthers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function short(s, n = 10) {
    return s && s.length > n ? `${s.slice(0, n)}…` : s || '';
}
function fmtGwei(hex) {
    try {
        return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-';
    } catch  {
        return '-';
    }
}
function fmtEth(hex) {
    try {
        return hex ? (parseInt(hex, 16) / 1e18).toFixed(4) : '-';
    } catch  {
        return '-';
    }
}
function fmtAge(firstSeen) {
    if (!firstSeen) return '-';
    const age = Date.now() / 1000 - firstSeen;
    return `${age.toFixed(1)}s`;
}
// Get protocol display name (same as app.py)
function getProtocolDisplay(categoryKey) {
    if (!categoryKey) return '-';
    if (categoryKey.startsWith('dex:')) {
        const parts = categoryKey.split(':');
        if (parts.length >= 3) {
            const protocol = parts[2];
            const version = parts[3] || '';
            return version ? `${protocol}:${version}` : protocol;
        }
        return 'DEX';
    }
    if (categoryKey.startsWith('erc20:')) return 'ERC-20';
    if (categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
    if (categoryKey.startsWith('bridge:')) return categoryKey.split(':')[1] || 'Bridge';
    if (categoryKey.startsWith('nft_market:')) return categoryKey.split(':')[1] || 'NFT Market';
    if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
    if (categoryKey.startsWith('deploy:')) return 'Deploy';
    if (categoryKey.startsWith('utility:')) return 'Utility';
    return 'Contract';
}
;
function Opportunities() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(45);
    if ($[0] !== "0ed0319c69cc1bdd4f880ed046ffe2ea6d6a0d928a4397dca3f6768e77e76338") {
        for(let $i = 0; $i < 45; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0ed0319c69cc1bdd4f880ed046ffe2ea6d6a0d928a4397dca3f6768e77e76338";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"])();
    const scoreClass = _OpportunitiesScoreClass;
    const formatScore = _OpportunitiesFormatScore;
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "Opportunities[renderScoreChip]": (label, score_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `px-1 py-[1px] border border-slate-700 rounded ${scoreClass(score_1)} text-[8px] font-mono`,
                    children: [
                        label,
                        " ",
                        score_1 == null || !Number.isFinite(score_1) ? "\u2014" : Math.round(score_1)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 72,
                    columnNumber: 61
                }, this)
        })["Opportunities[renderScoreChip]"];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const renderScoreChip = t0;
    const renderStateChip = _OpportunitiesRenderStateChip;
    let t1;
    if ($[2] !== snapshot?.live) {
        t1 = snapshot?.live || [];
        $[2] = snapshot?.live;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    const liveTxs = t1;
    let t2;
    if ($[4] !== filters || $[5] !== liveTxs || $[6] !== snapshot?.opportunities) {
        const enrichedOpportunities = snapshot?.opportunities?.map({
            "Opportunities[(anonymous)()]": (opp)=>{
                const fullTx = liveTxs.find({
                    "Opportunities[(anonymous)() > liveTxs.find()]": (tx)=>tx.hash === opp.hash
                }["Opportunities[(anonymous)() > liveTxs.find()]"]);
                return {
                    ...opp,
                    ...fullTx
                };
            }
        }["Opportunities[(anonymous)()]"]) || [];
        t2 = filters.applyFilters(enrichedOpportunities);
        $[4] = filters;
        $[5] = liveTxs;
        $[6] = snapshot?.opportunities;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    const rows = t2;
    const now = Date.now() / 1000;
    let t3;
    if ($[8] !== rows) {
        let t4;
        if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = ({
                "Opportunities[rows.map()]": (row, index)=>{
                    const composite = row.composite_score ?? row._score ?? 0;
                    const nonceValue = row.nonce ? parseInt(row.nonce, row.nonce.toString().startsWith("0x") ? 16 : 10) : 0;
                    return {
                        ...row,
                        displayRank: index + 1,
                        score_sort: composite,
                        value_sort: row.value_score ?? 0,
                        gas_sort: row.gas_score ?? 0,
                        mev_sort: row.mev_score ?? 0,
                        smart_sort: row.smart_money_score ?? (row.smart_money_flag ? 100 : 0),
                        urgency_sort: row.urgency_score ?? 0,
                        age_sort: now - (row._first_seen_ts ?? now),
                        nonce_sort: Number.isFinite(nonceValue) ? nonceValue : 0
                    };
                }
            })["Opportunities[rows.map()]"];
            $[10] = t4;
        } else {
            t4 = $[10];
        }
        t3 = rows.map(t4).sort(_OpportunitiesAnonymous);
        $[8] = rows;
        $[9] = t3;
    } else {
        t3 = $[9];
    }
    const tableRows = t3;
    let t4;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            key: "displayRank",
            header: "#",
            sortable: true,
            className: "text-center w-10",
            render: _temp
        };
        $[11] = t4;
    } else {
        t4 = $[11];
    }
    let t5;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = {
            key: "score_sort",
            header: "Score",
            sortable: true,
            className: "min-w-[110px]",
            render: (__0, row_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[11px] font-bold ${scoreClass(row_0.composite_score ?? row_0._score)}`,
                            children: formatScore(row_0.composite_score ?? row_0._score)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 165,
                            columnNumber: 68
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1",
                            children: [
                                renderScoreChip("V", row_0.value_score),
                                renderScoreChip("G", row_0.gas_score),
                                renderScoreChip("M", row_0.mev_score),
                                renderScoreChip("S", row_0.smart_money_score),
                                renderScoreChip("U", row_0.urgency_score)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 165,
                            columnNumber: 222
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 165,
                    columnNumber: 31
                }, this)
        };
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    let t7;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = {
            key: "hash",
            header: "Transaction",
            className: "min-w-[190px]",
            render: (value, row_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                row_1.smart_money_flag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-yellow-400",
                                    title: "Smart money address",
                                    children: "⭐"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Opportunities.tsx",
                                    lineNumber: 178,
                                    columnNumber: 138
                                }, this),
                                row_1.replacement_tx && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sky-400",
                                    title: `Replaces ${short(row_1.replacement_tx, 8)}`,
                                    children: "🔄"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Opportunities.tsx",
                                    lineNumber: 178,
                                    columnNumber: 234
                                }, this),
                                row_1.replaced_by && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-orange-400",
                                    title: `Replaced by ${short(row_1.replaced_by, 8)}`,
                                    children: "↩"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Opportunities.tsx",
                                    lineNumber: 178,
                                    columnNumber: 350
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 font-mono",
                                    children: short(value || "", 12)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Opportunities.tsx",
                                    lineNumber: 178,
                                    columnNumber: 446
                                }, this),
                                renderStateChip(row_1._state)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 178,
                            columnNumber: 70
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[8px] text-slate-500 font-mono",
                            children: [
                                getProtocolDisplay(row_1.category_key),
                                " • ",
                                row_1._decoded_fn?.function || "unknown"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 178,
                            columnNumber: 559
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 178,
                    columnNumber: 33
                }, this)
        };
        t7 = {
            key: "from",
            header: "From \u2192 To",
            className: "min-w-[160px]",
            render: _temp2
        };
        $[13] = t6;
        $[14] = t7;
    } else {
        t6 = $[13];
        t7 = $[14];
    }
    let t8;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = {
            key: "value_sort",
            header: "Value (ETH)",
            sortable: true,
            className: "min-w-[95px]",
            render: (__2, row_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-0.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-emerald-300 font-mono",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateUnifiedEth"])(row_3)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 199,
                            columnNumber: 70
                        }, this),
                        renderScoreChip("V", row_3.value_score)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 199,
                    columnNumber: 31
                }, this)
        };
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            key: "gas_sort",
            header: "Gas (gwei)",
            sortable: true,
            className: "min-w-[90px]",
            render: (__3, row_4)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-0.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-yellow-400 font-mono",
                            children: [
                                fmtGwei(row_4.maxFeePerGas || row_4.gasPrice),
                                "g"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Opportunities.tsx",
                            lineNumber: 212,
                            columnNumber: 70
                        }, this),
                        renderScoreChip("G", row_4.gas_score)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 212,
                    columnNumber: 31
                }, this)
        };
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = {
            key: "mev_sort",
            header: "MEV",
            sortable: true,
            className: "min-w-[70px]",
            render: (__4, row_5)=>renderScoreChip("MEV", row_5.mev_score)
        };
        $[17] = t10;
    } else {
        t10 = $[17];
    }
    let t11;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = {
            key: "smart_sort",
            header: "Smart",
            sortable: true,
            className: "min-w-[70px]",
            render: (__5, row_6)=>renderScoreChip(row_6.smart_money_flag ? "SMART\u2B50" : "SMART", row_6.smart_money_score)
        };
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = [
            t4,
            t5,
            t6,
            t7,
            t8,
            t9,
            t10,
            t11,
            {
                key: "urgency_sort",
                header: "Urgency",
                sortable: true,
                className: "min-w-[70px]",
                render: (__6, row_7)=>renderScoreChip("URG", row_7.urgency_score)
            },
            {
                key: "age_sort",
                header: "Age",
                sortable: true,
                className: "min-w-[80px]",
                render: _temp3
            },
            {
                key: "nonce_sort",
                header: "Nonce",
                sortable: true,
                className: "min-w-[70px]",
                render: _temp4
            }
        ];
        $[19] = t12;
    } else {
        t12 = $[19];
    }
    const columns = t12;
    let t13;
    let t14;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-amber-400 text-[9px]",
            children: "🏆"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 273,
            columnNumber: 11
        }, this);
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
            children: "OPPORTUNITIES"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 274,
            columnNumber: 11
        }, this);
        $[20] = t13;
        $[21] = t14;
    } else {
        t13 = $[20];
        t14 = $[21];
    }
    let t15;
    if ($[22] !== rows.length) {
        t15 = rows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-1 py-0.5 bg-amber-900 text-amber-300 text-[7px] font-mono border border-amber-700",
            children: [
                rows.length,
                " FOUND"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 283,
            columnNumber: 30
        }, this);
        $[22] = rows.length;
        $[23] = t15;
    } else {
        t15 = $[23];
    }
    let t16;
    if ($[24] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5",
                    children: [
                        t13,
                        t14,
                        t15
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 291,
                    columnNumber: 130
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 291,
                columnNumber: 79
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 291,
            columnNumber: 11
        }, this);
        $[24] = t15;
        $[25] = t16;
    } else {
        t16 = $[25];
    }
    const t17 = tableRows.length;
    let t18;
    if ($[26] !== tableRows) {
        t18 = tableRows.filter(_OpportunitiesTableRowsFilter);
        $[26] = tableRows;
        $[27] = t18;
    } else {
        t18 = $[27];
    }
    const t19 = t18.length;
    let t20;
    if ($[28] !== tableRows) {
        t20 = tableRows.filter(_OpportunitiesTableRowsFilter2);
        $[28] = tableRows;
        $[29] = t20;
    } else {
        t20 = $[29];
    }
    let t21;
    if ($[30] !== t18.length || $[31] !== t20.length || $[32] !== tableRows.length) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                "[",
                t17,
                " entries • ",
                t19,
                " smart money • ",
                t20.length,
                " replacements]"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 317,
            columnNumber: 11
        }, this);
        $[30] = t18.length;
        $[31] = t20.length;
        $[32] = tableRows.length;
        $[33] = t21;
    } else {
        t21 = $[33];
    }
    let t22;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-slate-600",
            children: "click column headers to sort"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 327,
            columnNumber: 11
        }, this);
        $[34] = t22;
    } else {
        t22 = $[34];
    }
    let t23;
    if ($[35] !== t21) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between text-[9px] text-slate-500 font-mono mb-2",
            children: [
                t21,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 334,
            columnNumber: 11
        }, this);
        $[35] = t21;
        $[36] = t23;
    } else {
        t23 = $[36];
    }
    let t24;
    if ($[37] !== tableRows) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            data: tableRows,
            columns: columns,
            emptyMessage: "[NO OPPORTUNITIES DETECTED \u2022 TRANSACTIONS NEED HIGH VALUE OR GAS TO QUALIFY]",
            density: "compact"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 342,
            columnNumber: 11
        }, this);
        $[37] = tableRows;
        $[38] = t24;
    } else {
        t24 = $[38];
    }
    let t25;
    if ($[39] !== t23 || $[40] !== t24) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: [
                t23,
                t24
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 350,
            columnNumber: 11
        }, this);
        $[39] = t23;
        $[40] = t24;
        $[41] = t25;
    } else {
        t25 = $[41];
    }
    let t26;
    if ($[42] !== t16 || $[43] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: [
                t16,
                t25
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Opportunities.tsx",
            lineNumber: 359,
            columnNumber: 11
        }, this);
        $[42] = t16;
        $[43] = t25;
        $[44] = t26;
    } else {
        t26 = $[44];
    }
    return t26;
}
_s(Opportunities, "z7i7o2QeZnHrpMcqtMxxRqrCsx0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"]
    ];
});
_c = Opportunities;
function _OpportunitiesTableRowsFilter2(row_11) {
    return row_11.replacement_tx || row_11.replaced_by;
}
function _OpportunitiesTableRowsFilter(row_10) {
    return row_10.smart_money_flag;
}
function _temp4(__8, row_9) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-0.5 font-mono text-slate-300",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: Number.isFinite(row_9.nonce_sort) ? row_9.nonce_sort : "\u2014"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 375,
                columnNumber: 74
            }, this),
            row_9.nonce_gap ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[8px] text-red-400",
                children: [
                    "gap +",
                    row_9.nonce_gap
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 375,
                columnNumber: 171
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[8px] text-slate-500",
                children: "gap 0"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 375,
                columnNumber: 245
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 375,
        columnNumber: 10
    }, this);
}
function _temp3(__7, row_8) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-0.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-purple-400 font-mono",
                children: fmtAge(row_8._first_seen_ts)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 378,
                columnNumber: 49
            }, this),
            row_8.state_history?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[8px] text-slate-500 font-mono",
                children: [
                    row_8.state_history[row_8.state_history.length - 1]?.state,
                    " @ ",
                    new Date((row_8.state_history[row_8.state_history.length - 1]?.timestamp ?? 0) * 1000).toLocaleTimeString()
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 378,
                columnNumber: 161
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 378,
        columnNumber: 10
    }, this);
}
function _temp2(__1, row_2) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-0.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-slate-300 font-mono",
                children: short(row_2.from || "", 12)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 381,
                columnNumber: 49
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[8px] text-slate-500 font-mono",
                children: [
                    "→ ",
                    short(row_2.to || "", 12)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 381,
                columnNumber: 128
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 381,
        columnNumber: 10
    }, this);
}
function _temp(_, __, index_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `font-mono text-[9px] ${index_0 === 0 ? "text-yellow-300" : "text-slate-500"}`,
        children: String(index_0 + 1).padStart(2, "0")
    }, void 0, false, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 384,
        columnNumber: 10
    }, this);
}
function _OpportunitiesAnonymous(a, b) {
    return b.score_sort - a.score_sort;
}
function _OpportunitiesRenderStateChip(state) {
    if (!state) {
        return null;
    }
    const mapping = {
        PENDING: "text-yellow-400 border-yellow-500",
        REPLACED: "text-orange-400 border-orange-500",
        RESUBMITTED: "text-sky-400 border-sky-500",
        INCLUDED: "text-emerald-400 border-emerald-500",
        CONFIRMED: "text-green-300 border-green-400",
        FINALIZED: "text-blue-300 border-blue-400",
        DROPPED: "text-red-400 border-red-500"
    };
    const cls = mapping[state] || "text-slate-400 border-slate-600";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `${"px-1 py-[1px] text-[8px] font-mono border rounded"} ${cls}`,
        children: state
    }, void 0, false, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 403,
        columnNumber: 10
    }, this);
}
function _OpportunitiesFormatScore(score_0) {
    if (score_0 == null || !Number.isFinite(score_0)) {
        return "\u2014";
    }
    return score_0.toFixed(1);
}
function _OpportunitiesScoreClass(score) {
    if (score == null || !Number.isFinite(score)) {
        return "text-slate-500";
    }
    if (score >= 75) {
        return "text-emerald-400";
    }
    if (score >= 50) {
        return "text-amber-400";
    }
    return "text-red-400";
}
var _c;
__turbopack_context__.k.register(_c, "Opportunities");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Live.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Live
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtilsEthers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function short(s, n = 10) {
    return s && s.length > n ? `${s.slice(0, n)}…` : s || '';
}
function fmtGwei(hex) {
    try {
        return hex ? Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(hex, 9)).toFixed(1) : '-';
    } catch  {
        return '-';
    }
}
function fmtAge(firstSeen) {
    if (!firstSeen) return '-';
    const age = Date.now() / 1000 - firstSeen;
    return `${age.toFixed(1)}s`;
}
// Get protocol display name (same as app.py)
function getProtocolDisplay(categoryKey) {
    if (!categoryKey) return '-';
    if (categoryKey.startsWith('dex:')) {
        const parts = categoryKey.split(':');
        if (parts.length >= 3) {
            const protocol = parts[2];
            const version = parts[3] || '';
            return version ? `${protocol}:${version}` : protocol;
        }
        return 'DEX';
    }
    if (categoryKey.startsWith('erc20:')) return 'ERC-20';
    if (categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
    if (categoryKey.startsWith('bridge:')) return categoryKey.split(':')[1] || 'Bridge';
    if (categoryKey.startsWith('nft_market:')) return categoryKey.split(':')[1] || 'NFT Market';
    if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
    if (categoryKey.startsWith('deploy:')) return 'Deploy';
    if (categoryKey.startsWith('utility:')) return 'Utility';
    return 'Contract';
}
;
function summarizeEvents(row) {
    try {
        const events = row?._decoded_events;
        if (!Array.isArray(events) || events.length === 0) return '-';
        const counts = {};
        for (const e of events){
            const name = e?.event || 'Event';
            counts[name] = (counts[name] || 0) + 1;
        }
        const parts = Object.entries(counts).sort((a, b)=>b[1] - a[1]).slice(0, 3).map(([name, c])=>c > 1 ? `${name}×${c}` : name);
        return parts.join(', ');
    } catch  {
        return '-';
    }
}
function Live() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(28);
    if ($[0] !== "69e3ca03c9a04a0beb7d32210316709b10075e8baecfe54d2b2b4bdec6b06ead") {
        for(let $i = 0; $i < 28; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "69e3ca03c9a04a0beb7d32210316709b10075e8baecfe54d2b2b4bdec6b06ead";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"])();
    let pendingCount;
    let rows;
    let t0;
    if ($[1] !== filters || $[2] !== snapshot?.live) {
        rows = filters.applyFilters(snapshot?.live || []);
        console.log(rows, "rows");
        pendingCount = rows.length;
        t0 = rows.filter(_LiveRowsFilter);
        $[1] = filters;
        $[2] = snapshot?.live;
        $[3] = pendingCount;
        $[4] = rows;
        $[5] = t0;
    } else {
        pendingCount = $[3];
        rows = $[4];
        t0 = $[5];
    }
    const gasGaugedCount = t0.length;
    let t1;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                key: "_first_seen_ts",
                header: "Time",
                render: _temp,
                className: "text-gray-500"
            },
            {
                key: "hash",
                header: "Hash",
                render: _temp2,
                className: "font-mono"
            },
            {
                key: "from",
                header: "From",
                render: _temp3,
                className: "font-mono text-gray-500"
            },
            {
                key: "to",
                header: "To",
                render: _temp4,
                className: "font-mono text-gray-500"
            },
            {
                key: "category_key",
                header: "Type",
                render: _temp5
            },
            {
                key: "category_key",
                header: "Protocol",
                render: _temp6
            },
            {
                key: "_decoded_fn",
                header: "Function",
                render: _temp7,
                className: "text-cyan-400"
            },
            {
                key: "_decoded_events",
                header: "Events",
                render: _temp8,
                className: "text-blue-400"
            },
            {
                key: "value",
                header: "Amount",
                render: _temp9,
                className: "text-green-400 font-medium"
            },
            {
                key: "maxFeePerGas",
                header: "Gas",
                render: _temp10,
                className: "text-yellow-400"
            },
            {
                key: "_first_seen_ts",
                header: "Age",
                render: _temp11,
                className: "text-purple-400"
            }
        ];
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const columns = t1;
    let t2;
    let t3;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-emerald-400 text-[9px]",
            children: "⚡"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 159,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
            children: "LIVE TRANSACTIONS"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 160,
            columnNumber: 10
        }, this);
        $[7] = t2;
        $[8] = t3;
    } else {
        t2 = $[7];
        t3 = $[8];
    }
    let t4;
    if ($[9] !== pendingCount) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1.5",
            children: [
                t2,
                t3,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700",
                    children: [
                        pendingCount,
                        " PENDING"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Live.tsx",
                    lineNumber: 169,
                    columnNumber: 61
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 169,
            columnNumber: 10
        }, this);
        $[9] = pendingCount;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    const t5 = `w-0.5 h-0.5 rounded-full ${gasGaugedCount > 0 ? "bg-sky-500" : "bg-gray-700"}`;
    let t6;
    if ($[11] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t5
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 178,
            columnNumber: 10
        }, this);
        $[11] = t5;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    const t7 = `font-mono text-[7px] tracking-widest ${gasGaugedCount > 0 ? "text-sky-400" : "text-gray-600"}`;
    let t8;
    if ($[13] !== gasGaugedCount || $[14] !== pendingCount || $[15] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t7,
            children: [
                gasGaugedCount,
                "/",
                pendingCount,
                " GASSED"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 187,
            columnNumber: 10
        }, this);
        $[13] = gasGaugedCount;
        $[14] = pendingCount;
        $[15] = t7;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    let t9;
    if ($[17] !== t6 || $[18] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    t6,
                    t8
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Live.tsx",
                lineNumber: 197,
                columnNumber: 53
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 197,
            columnNumber: 10
        }, this);
        $[17] = t6;
        $[18] = t8;
        $[19] = t9;
    } else {
        t9 = $[19];
    }
    let t10;
    if ($[20] !== t4 || $[21] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    t4,
                    t9
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Live.tsx",
                lineNumber: 206,
                columnNumber: 79
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 206,
            columnNumber: 11
        }, this);
        $[20] = t4;
        $[21] = t9;
        $[22] = t10;
    } else {
        t10 = $[22];
    }
    let t11;
    if ($[23] !== rows) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: rows,
                columns: columns,
                emptyMessage: "[WAITING FOR LIVE TRANSACTION DATA...]",
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Live.tsx",
                lineNumber: 215,
                columnNumber: 34
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 215,
            columnNumber: 11
        }, this);
        $[23] = rows;
        $[24] = t11;
    } else {
        t11 = $[24];
    }
    let t12;
    if ($[25] !== t10 || $[26] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: [
                t10,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Live.tsx",
            lineNumber: 223,
            columnNumber: 11
        }, this);
        $[25] = t10;
        $[26] = t11;
        $[27] = t12;
    } else {
        t12 = $[27];
    }
    return t12;
}
_s(Live, "z7i7o2QeZnHrpMcqtMxxRqrCsx0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"]
    ];
});
_c = Live;
function _temp11(value_7) {
    return fmtAge(value_7);
}
function _temp10(value_6, row_1) {
    return `${fmtGwei(value_6 || row_1.gasPrice)}g`;
}
function _temp9(__0, row_0) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAmount"])(row_0);
}
function _temp8(_, row) {
    return summarizeEvents(row);
}
function _temp7(value_5) {
    return value_5?.function || "-";
}
function _temp6(value_4) {
    return getProtocolDisplay(value_4);
}
function _temp5(value_3) {
    return value_3 || "-";
}
function _temp4(value_2) {
    return short(value_2 || "", 10);
}
function _temp3(value_1) {
    return short(value_1 || "", 10);
}
function _temp2(value_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "font-mono text-green-400 hover:text-green-300 cursor-pointer",
        children: short(value_0, 12)
    }, void 0, false, {
        fileName: "[project]/src/app/components/Live.tsx",
        lineNumber: 260,
        columnNumber: 10
    }, this);
}
function _temp(value) {
    return value ? new Date(value * 1000).toLocaleTimeString() : "--:--:--";
}
function _LiveRowsFilter(tx) {
    return tx._decoded_fn?.confidence > 0;
}
var _c;
__turbopack_context__.k.register(_c, "Live");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Included.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Included
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtilsEthers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function short(s, n = 10) {
    return s && s.length > n ? `${s.slice(0, n)}…` : s || '';
}
function fmtGwei(hex) {
    try {
        return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-';
    } catch  {
        return '-';
    }
}
function fmtFeeEth(rcpt) {
    try {
        if (!rcpt) return '-';
        const egp = parseInt(rcpt.effectiveGasPrice || '0x0', 16) / 1e9;
        const gu = parseInt(rcpt.gasUsed || '0x0', 16);
        return (egp * gu / 1e9).toFixed(4);
    } catch  {
        return '-';
    }
}
function fmtHexGwei(hex) {
    try {
        return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-';
    } catch  {
        return '-';
    }
}
function fmtStatus(rcpt) {
    try {
        const s = rcpt?.status;
        if (s === undefined || s === null) return '-';
        const ok = typeof s === 'string' ? parseInt(s, 16) === 1 : !!s;
        return ok ? 'Success' : 'Fail';
    } catch  {
        return '-';
    }
}
function fmtDelay(fs, it) {
    if (!fs || !it) return '-';
    return `${(it - fs).toFixed(1)}s`;
}
function summarizeEvents(row) {
    try {
        const events = row?._decoded_events;
        if (!Array.isArray(events) || events.length === 0) return '-';
        const counts = {};
        for (const e of events){
            const name = e?.event || 'Event';
            counts[name] = (counts[name] || 0) + 1;
        }
        const parts = Object.entries(counts).sort((a, b)=>b[1] - a[1]).slice(0, 3).map(([name, c])=>c > 1 ? `${name}×${c}` : name);
        return parts.join(', ');
    } catch  {
        return '-';
    }
}
function hexToNum(val) {
    try {
        if (val === undefined || val === null) return '-';
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            if (val.startsWith('0x') || val.startsWith('0X')) return parseInt(val, 16);
            const n = Number(val);
            return Number.isFinite(n) ? n : '-';
        }
        return '-';
    } catch  {
        return '-';
    }
}
// Get protocol display name (same as app.py)
function getProtocolDisplay(categoryKey) {
    if (!categoryKey) return '-';
    if (categoryKey.startsWith('dex:')) {
        const parts = categoryKey.split(':');
        if (parts.length >= 3) {
            const protocol = parts[2];
            const version = parts[3] || '';
            return version ? `${protocol}:${version}` : protocol;
        }
        return 'DEX';
    }
    if (categoryKey.startsWith('erc20:')) return 'ERC-20';
    if (categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
    if (categoryKey.startsWith('bridge:')) return categoryKey.split(':')[1] || 'Bridge';
    if (categoryKey.startsWith('nft_market:')) return categoryKey.split(':')[1] || 'NFT Market';
    if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
    if (categoryKey.startsWith('deploy:')) return 'Deploy';
    if (categoryKey.startsWith('utility:')) return 'Utility';
    return 'Contract';
}
;
function Included() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "34d8b713a5b66f70ee13ddfd69fa9477d4bcb9edacf76b9c7c2f202a0f20c7ec") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "34d8b713a5b66f70ee13ddfd69fa9477d4bcb9edacf76b9c7c2f202a0f20c7ec";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"])();
    let t0;
    if ($[1] !== filters || $[2] !== snapshot?.included) {
        let t1;
        if ($[4] !== snapshot?.included) {
            t1 = snapshot?.included || [];
            $[4] = snapshot?.included;
            $[5] = t1;
        } else {
            t1 = $[5];
        }
        t0 = filters.applyFilters(t1);
        $[1] = filters;
        $[2] = snapshot?.included;
        $[3] = t0;
    } else {
        t0 = $[3];
    }
    const rows = t0;
    let t1;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                key: "_inclusion_ts",
                header: "Time",
                render: _temp,
                className: "text-gray-500"
            },
            {
                key: "hash",
                header: "Hash",
                render: _temp2,
                className: "font-mono text-green-400"
            },
            {
                key: "from",
                header: "From",
                render: _temp3,
                className: "font-mono text-gray-500"
            },
            {
                key: "to",
                header: "To",
                render: _temp4,
                className: "font-mono text-gray-500"
            },
            {
                key: "value",
                header: "Amount",
                render: _temp5,
                className: "text-green-400 font-medium"
            },
            {
                key: "category_key",
                header: "Protocol",
                render: _temp6
            },
            {
                key: "_decoded_fn",
                header: "Function",
                render: _temp7,
                className: "text-cyan-400"
            },
            {
                key: "_decoded_events",
                header: "Events",
                render: _temp8,
                className: "text-blue-400"
            },
            {
                key: "blockNumber",
                header: "Block",
                render: _temp9
            },
            {
                key: "transactionIndex",
                header: "TxIdx",
                render: _temp10
            },
            {
                key: "nonce",
                header: "Nonce",
                render: _temp11
            },
            {
                key: "_receipt",
                header: "Status",
                render: _temp12
            },
            {
                key: "_first_seen_ts",
                header: "Delay",
                render: _temp13
            },
            {
                key: "_confirmation_depth",
                header: "Conf",
                render: _temp14
            },
            {
                key: "_receipt",
                header: "GasUsed",
                render: _temp15
            },
            {
                key: "gas",
                header: "GasLimit",
                render: _temp16
            },
            {
                key: "gasPrice",
                header: "GasPrice",
                render: _temp17
            },
            {
                key: "maxFeePerGas",
                header: "MaxFee",
                render: _temp18
            },
            {
                key: "_receipt",
                header: "Fee(ETH)",
                render: _temp19
            }
        ];
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const columns = t1;
    let t2;
    let t3;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sky-400 text-[9px]",
            children: "✅"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Included.tsx",
            lineNumber: 226,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
            children: "INCLUDED TRANSACTIONS"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Included.tsx",
            lineNumber: 227,
            columnNumber: 10
        }, this);
        $[7] = t2;
        $[8] = t3;
    } else {
        t2 = $[7];
        t3 = $[8];
    }
    let t4;
    if ($[9] !== rows.length) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5",
                    children: [
                        t2,
                        t3,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700",
                            children: [
                                rows.length,
                                " COMPLETED"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Included.tsx",
                            lineNumber: 236,
                            columnNumber: 180
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Included.tsx",
                    lineNumber: 236,
                    columnNumber: 129
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Included.tsx",
                lineNumber: 236,
                columnNumber: 78
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Included.tsx",
            lineNumber: 236,
            columnNumber: 10
        }, this);
        $[9] = rows.length;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[11] !== rows) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: rows,
                columns: columns,
                emptyMessage: "[NO INCLUDED TRANSACTIONS...]",
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Included.tsx",
                lineNumber: 244,
                columnNumber: 33
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Included.tsx",
            lineNumber: 244,
            columnNumber: 10
        }, this);
        $[11] = rows;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    if ($[13] !== t4 || $[14] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Included.tsx",
            lineNumber: 252,
            columnNumber: 10
        }, this);
        $[13] = t4;
        $[14] = t5;
        $[15] = t6;
    } else {
        t6 = $[15];
    }
    return t6;
}
_s(Included, "z7i7o2QeZnHrpMcqtMxxRqrCsx0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"]
    ];
});
_c = Included;
function _temp19(value_12) {
    return fmtFeeEth(value_12);
}
function _temp18(value_11) {
    return fmtHexGwei(value_11);
}
function _temp17(value_10) {
    return fmtHexGwei(value_10);
}
function _temp16(value_9) {
    return hexToNum(value_9) || "-";
}
function _temp15(value_8) {
    return hexToNum(value_8?.gasUsed) || "-";
}
function _temp14(value_7) {
    return value_7 ?? 0;
}
function _temp13(__3, row_3) {
    return fmtDelay(row_3._first_seen_ts, row_3._inclusion_ts);
}
function _temp12(value_6) {
    return fmtStatus(value_6);
}
function _temp11(value_5) {
    return hexToNum(value_5) || "-";
}
function _temp10(__2, row_2) {
    return hexToNum(row_2.transactionIndex) || hexToNum(row_2._receipt?.transactionIndex) || "-";
}
function _temp9(__1, row_1) {
    return hexToNum(row_1.blockNumber) || hexToNum(row_1._receipt?.blockNumber) || hexToNum(row_1._inclusion_block) || "-";
}
function _temp8(__0, row_0) {
    return summarizeEvents(row_0);
}
function _temp7(value_4) {
    return value_4?.function || "-";
}
function _temp6(value_3) {
    return getProtocolDisplay(value_3);
}
function _temp5(_, row) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtilsEthers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAmount"])(row);
}
function _temp4(value_2) {
    return short(value_2 || "", 14);
}
function _temp3(value_1) {
    return short(value_1 || "", 14);
}
function _temp2(value_0) {
    return short(value_0, 16);
}
function _temp(value) {
    return value ? new Date(value * 1000).toLocaleTimeString() : "--:--:--";
}
var _c;
__turbopack_context__.k.register(_c, "Included");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Tokens.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Tokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function fmt(num, digits = 2) {
    if (num === null || num === undefined || !Number.isFinite(num)) return '-';
    // At this point, num is guaranteed to be a finite number
    const validNum = num;
    if (Math.abs(validNum) >= 1000) return `${(validNum / 1_000).toFixed(digits)}k`;
    return validNum.toFixed(digits);
}
function Tokens() {
    _s();
    const { snapshot, connected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const [selected, setSelected] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [currentPage, setCurrentPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(1);
    const [searchTerm, setSearchTerm] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [tokenTab, setTokenTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('all');
    const itemsPerPage = 50;
    const [isPending, startTransition] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useTransition();
    const searchInputId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useId();
    const deferredSearch = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDeferredValue(searchTerm);
    const apiBase = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_UI_HTTP_URL || 'http://localhost:3005';
    const tokens = snapshot?.tokens ?? [];
    const pools = snapshot?.pools ?? [];
    const deferredTokens = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDeferredValue(tokens);
    const deferredPools = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDeferredValue(pools);
    const derived = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "Tokens.useMemo[derived]": ()=>{
            const countsByVersion = {
                V1: 0,
                V2: 0,
                V3: 0
            };
            const versionMap = new Map();
            for (const pool of deferredPools){
                if (!pool) continue;
                const version = (pool.version || '').toUpperCase();
                if (!version) continue;
                const token0 = (pool.token0 || '').toLowerCase();
                const token1 = (pool.token1 || '').toLowerCase();
                if (token0) {
                    const set = versionMap.get(token0) ?? new Set();
                    set.add(version);
                    versionMap.set(token0, set);
                }
                if (token1) {
                    const set_0 = versionMap.get(token1) ?? new Set();
                    set_0.add(version);
                    versionMap.set(token1, set_0);
                }
            }
            const enriched = deferredTokens.map({
                "Tokens.useMemo[derived].enriched": (token)=>{
                    const addrLower = (token.address || '').toLowerCase();
                    const versionSet = versionMap.get(addrLower) ?? new Set();
                    const versionKeys = Array.from(versionSet).map({
                        "Tokens.useMemo[derived].enriched.versionKeys": (v)=>v.toUpperCase()
                    }["Tokens.useMemo[derived].enriched.versionKeys"]);
                    const uniqueVersionKeys = Array.from(new Set(versionKeys));
                    uniqueVersionKeys.forEach({
                        "Tokens.useMemo[derived].enriched": (key)=>{
                            if (key === 'V1' || key === 'V2' || key === 'V3') countsByVersion[key] += 1;
                        }
                    }["Tokens.useMemo[derived].enriched"]);
                    const versionLabel = uniqueVersionKeys.length ? uniqueVersionKeys.join('/') : '—';
                    const score = (token.liquidity_usd ?? 0) + (token.volume_24h_usd ?? 0) * 0.01 + (token.mcap_onchain_usd ?? 0) * 0.001;
                    return {
                        ...token,
                        score,
                        versionKeys: uniqueVersionKeys,
                        versionLabel,
                        active: Boolean(token.active)
                    };
                }
            }["Tokens.useMemo[derived].enriched"]);
            const pricedCount = enriched.reduce({
                "Tokens.useMemo[derived].pricedCount": (acc, row)=>{
                    const price = row.price_usd;
                    return acc + (price !== null && price !== undefined && Number.isFinite(price) ? 1 : 0);
                }
            }["Tokens.useMemo[derived].pricedCount"], 0);
            const totalTokens = deferredTokens.length;
            const searchLower = deferredSearch.trim().toLowerCase();
            let filtered = enriched;
            if (searchLower) {
                filtered = filtered.filter({
                    "Tokens.useMemo[derived]": (row_0)=>{
                        const symbol = (row_0.symbol || '').toLowerCase();
                        const address = (row_0.address || '').toLowerCase();
                        const version_0 = (row_0.versionLabel || '').toLowerCase();
                        const primaryPool = (row_0.primary_pool || '').toLowerCase();
                        const heartbeatProvider = (row_0.heartbeat?.provider || '').toLowerCase();
                        return symbol.includes(searchLower) || address.includes(searchLower) || version_0.includes(searchLower) || primaryPool.includes(searchLower) || heartbeatProvider.includes(searchLower);
                    }
                }["Tokens.useMemo[derived]"]);
            }
            if (tokenTab !== 'all') {
                const key_0 = tokenTab.toUpperCase();
                filtered = filtered.filter({
                    "Tokens.useMemo[derived]": (row_1)=>row_1.versionKeys.includes(key_0)
                }["Tokens.useMemo[derived]"]);
            }
            const sorted = filtered.slice().sort({
                "Tokens.useMemo[derived].sorted": (a, b)=>(b.score ?? 0) - (a.score ?? 0)
            }["Tokens.useMemo[derived].sorted"]);
            const total = sorted.length;
            const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
            const safePage = Math.min(Math.max(currentPage, 1), totalPages);
            const start = (safePage - 1) * itemsPerPage;
            const rows = sorted.slice(start, start + itemsPerPage);
            return {
                rows,
                total,
                totalPages,
                pricedCount,
                countsByVersion,
                totalTokens,
                sortedRows: sorted
            };
        }
    }["Tokens.useMemo[derived]"], [
        deferredPools,
        deferredTokens,
        deferredSearch,
        tokenTab,
        currentPage,
        itemsPerPage
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "Tokens.useEffect": ()=>{
            startTransition({
                "Tokens.useEffect": ()=>setCurrentPage(1)
            }["Tokens.useEffect"]);
        }
    }["Tokens.useEffect"], [
        deferredSearch,
        tokenTab,
        deferredTokens.length
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "Tokens.useEffect": ()=>{
            if (currentPage > derived.totalPages) {
                startTransition({
                    "Tokens.useEffect": ()=>setCurrentPage(derived.totalPages)
                }["Tokens.useEffect"]);
            }
        }
    }["Tokens.useEffect"], [
        currentPage,
        derived.totalPages
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "Tokens.useEffect": ()=>{
            if (!selected) return;
            const stillExists = derived.sortedRows.some({
                "Tokens.useEffect.stillExists": (row_2)=>row_2.address === selected
            }["Tokens.useEffect.stillExists"]);
            if (!stillExists) {
                setSelected(null);
            }
        }
    }["Tokens.useEffect"], [
        selected,
        derived.sortedRows
    ]);
    const selectedRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "Tokens.useMemo[selectedRow]": ()=>selected ? derived.sortedRows.find({
                "Tokens.useMemo[selectedRow]": (row_3)=>row_3.address === selected
            }["Tokens.useMemo[selectedRow]"]) ?? null : null
    }["Tokens.useMemo[selectedRow]"], [
        derived.sortedRows,
        selected
    ]);
    const totalPages_0 = derived.totalPages;
    const loading = !snapshot;
    const lastUpdatedLabel = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "Tokens.useMemo[lastUpdatedLabel]": ()=>snapshot ? new Date(snapshot.timestamp).toLocaleTimeString() : null
    }["Tokens.useMemo[lastUpdatedLabel]"], [
        snapshot?.timestamp
    ]);
    const columns = [
        {
            key: 'symbol',
            header: 'Token',
            render: (_, row_4)=>{
                const addr = row_4.address;
                let short = '';
                try {
                    if (addr && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].isAddress(addr)) {
                        const c = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].getAddress(addr);
                        short = `${c.slice(0, 6)}…${c.slice(-4)}`;
                    }
                } catch  {}
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono text-emerald-400",
                            children: row_4.symbol || '-'
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono text-[9px] text-gray-600",
                            children: short
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 143,
                    columnNumber: 14
                }, this);
            }
        },
        // Show version column only in ALL tab
        ...tokenTab === 'all' ? [
            {
                key: 'versions',
                header: 'Version',
                render: (__0, row_5)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-mono text-[8px] text-sky-400",
                        children: row_5.versionLabel || '-'
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 153,
                        columnNumber: 39
                    }, this)
            }
        ] : [],
        {
            key: 'score',
            header: 'Score',
            render: (v_0, row_6)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-mono text-[9px] text-emerald-300",
                    children: fmt(v_0 ?? row_6.score ?? 0, 0)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 157,
                    columnNumber: 42
                }, this)
        },
        {
            key: 'active',
            header: 'Active',
            render: (v_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `inline-flex items-center justify-center w-3 h-3 rounded-full ${v_1 ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-red-400'}`,
                    children: v_1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-black font-bold",
                        children: "●"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 162,
                        columnNumber: 17
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 161,
                    columnNumber: 31
                }, this)
        },
        {
            key: 'price_usd',
            header: 'Price',
            render: (v_2)=>`$${fmt(v_2, 4)}`,
            className: 'text-sky-400'
        },
        {
            key: 'change_24h',
            header: 'Change (%)',
            render: (v_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: v_3 >= 0 ? 'text-emerald-400' : 'text-red-400',
                    children: v_3 ? v_3.toFixed(2) : '-'
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 172,
                    columnNumber: 30
                }, this)
        },
        {
            key: 'volume_24h_usd',
            header: 'Volume (24H)',
            render: (v_4)=>`$${fmt(v_4)}`
        },
        {
            key: 'mcap_circ_usd',
            header: 'Circ MCap',
            render: (v_5)=>`$${fmt(v_5)}`
        },
        {
            key: 'mcap_onchain_usd',
            header: 'Onchain MCap',
            render: (v_6)=>`$${fmt(v_6)}`
        },
        {
            key: 'holders_est',
            header: 'Holders',
            render: (v_7)=>v_7 ? v_7.toLocaleString() : '-'
        },
        {
            key: 'heartbeat',
            header: 'Heartbeat',
            render: (__1, row_7)=>{
                const heartbeat = row_7.heartbeat;
                if (!heartbeat) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-500",
                        children: "—"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 195,
                        columnNumber: 16
                    }, this);
                }
                const isHealthy = heartbeat.status === 'healthy';
                const isStale = heartbeat.status === 'stale';
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `inline-block w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400 animate-pulse' : isStale ? 'bg-yellow-400' : 'bg-red-400'}`
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-gray-400",
                            children: heartbeat.provider?.[0]?.toUpperCase() || '?'
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 201,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 199,
                    columnNumber: 14
                }, this);
            }
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[8px]",
                                    children: "💹"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 211,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                    children: "TOKENS"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 212,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700",
                                    children: [
                                        derived.total,
                                        " LISTED (",
                                        derived.pricedCount,
                                        " PRICED)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `px-1 py-0.5 text-[7px] font-mono border ${connected ? 'bg-emerald-900 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`,
                                    children: [
                                        "WS ",
                                        connected ? 'LIVE' : 'RECONNECTING'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this),
                                lastUpdatedLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-1 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700",
                                    children: [
                                        "last ",
                                        lastUpdatedLabel
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 219,
                                    columnNumber: 34
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 210,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>startTransition(()=>setCurrentPage(1)),
                                    disabled: isPending,
                                    className: "px-1 py-0.5 bg-gray-800 text-gray-300 text-[8px] font-mono border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                    title: "Reset to first page",
                                    children: "⟳"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 224,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: searchInputId,
                                    className: "sr-only",
                                    children: "Search tokens"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 225,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Search tokens...",
                                    value: searchTerm,
                                    onChange: (e)=>setSearchTerm(e.target.value),
                                    id: searchInputId,
                                    className: "px-2 py-0.5 bg-gray-800 text-gray-300 text-[8px] font-mono border border-gray-700 focus:border-emerald-500 focus:outline-none"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 226,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 223,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 209,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Tokens.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-1.5 py-1 bg-black border-b border-gray-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-emerald-400 text-[8px] font-mono",
                            children: "🪙 TOKENS:"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 234,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>startTransition(()=>setTokenTab('all')),
                            disabled: isPending,
                            className: `px-2 py-0.5 text-[7px] font-mono border ${tokenTab === 'all' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`,
                            children: [
                                "ALL (",
                                derived.totalTokens,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>startTransition(()=>setTokenTab('v1')),
                            disabled: isPending,
                            className: `px-2 py-0.5 text-[7px] font-mono border ${tokenTab === 'v1' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`,
                            children: [
                                "V1 (",
                                derived.countsByVersion.V1,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 238,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>startTransition(()=>setTokenTab('v2')),
                            disabled: isPending,
                            className: `px-2 py-0.5 text-[7px] font-mono border ${tokenTab === 'v2' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`,
                            children: [
                                "V2 (",
                                derived.countsByVersion.V2,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>startTransition(()=>setTokenTab('v3')),
                            disabled: isPending,
                            className: `px-2 py-0.5 text-[7px] font-mono border ${tokenTab === 'v3' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`,
                            children: [
                                "V3 (",
                                derived.countsByVersion.V3,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Tokens.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Tokens.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Tokens.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        data: derived.rows,
                        columns: columns,
                        emptyMessage: "[NO TOKEN DATA]",
                        density: "compact",
                        onRowClick: (row_8)=>setSelected(row_8.address),
                        loading: loading
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this),
                    totalPages_0 > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>startTransition(()=>setCurrentPage(Math.max(1, currentPage - 1))),
                                        disabled: currentPage === 1 || isPending,
                                        className: "px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700",
                                        children: "‹"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 255,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400 text-[7px] font-mono px-2",
                                        children: [
                                            currentPage,
                                            " / ",
                                            totalPages_0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>startTransition(()=>setCurrentPage(Math.min(totalPages_0, currentPage + 1))),
                                        disabled: currentPage === totalPages_0 || isPending,
                                        className: "px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700",
                                        children: "›"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 261,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Tokens.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-500 text-[7px] font-mono",
                                children: [
                                    derived.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
                                    "-",
                                    Math.min(currentPage * itemsPerPage, derived.total),
                                    " of ",
                                    derived.total
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Tokens.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 253,
                        columnNumber: 30
                    }, this),
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 border border-gray-800 bg-black",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2 py-1 bg-gray-900 border-b border-gray-800 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[8px] font-mono text-sky-400",
                                        children: "POOLS FOR"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 272,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[8px] font-mono text-emerald-400",
                                        children: selectedRow?.symbol
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 273,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "ml-auto text-[8px] text-gray-500 hover:text-gray-300",
                                        onClick: ()=>setSelected(null),
                                        children: "[close]"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Tokens.tsx",
                                        lineNumber: 274,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Tokens.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PoolsForToken, {
                                    token: selected,
                                    apiBase: apiBase
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Tokens.tsx",
                                    lineNumber: 277,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Tokens.tsx",
                                lineNumber: 276,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Tokens.tsx",
                        lineNumber: 270,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Tokens.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Tokens.tsx",
        lineNumber: 207,
        columnNumber: 10
    }, this);
}
_s(Tokens, "P1xkCEsXAF1/YPBF/RFl0OzdI/U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"]
    ];
});
_c = Tokens;
function PoolsForToken(t0) {
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "609494b781fd0bf1777b41f4ef2f86cdc7ccd93c881d2a288c0ec8d73484548a") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "609494b781fd0bf1777b41f4ef2f86cdc7ccd93c881d2a288c0ec8d73484548a";
    }
    const { token, apiBase } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [rows, setRows] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(t1);
    const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const abortRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    let t2;
    let t3;
    if ($[2] !== apiBase || $[3] !== token) {
        t2 = ({
            "PoolsForToken[useEffect()]": ()=>{
                if (!token) {
                    return;
                }
                setLoading(true);
                if (abortRef.current) {
                    try {
                        abortRef.current.abort();
                    } catch  {}
                }
                const ac = new AbortController();
                abortRef.current = ac;
                fetch(`${apiBase}/api/pools?token=${encodeURIComponent(token)}`, {
                    signal: ac.signal
                }).then(_PoolsForTokenUseEffectAnonymous).then({
                    "PoolsForToken[useEffect() > (anonymous)()]": (json)=>setRows(json.rows || [])
                }["PoolsForToken[useEffect() > (anonymous)()]"]).catch(_PoolsForTokenUseEffectAnonymous2).finally({
                    "PoolsForToken[useEffect() > (anonymous)()]": ()=>setLoading(false)
                }["PoolsForToken[useEffect() > (anonymous)()]"]);
                return ()=>{
                    try {
                        ac.abort();
                    } catch  {}
                };
            }
        })["PoolsForToken[useEffect()]"];
        t3 = [
            token,
            apiBase
        ];
        $[2] = apiBase;
        $[3] = token;
        $[4] = t2;
        $[5] = t3;
    } else {
        t2 = $[4];
        t3 = $[5];
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect(t2, t3);
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = [
            {
                key: "dex",
                header: "DEX"
            },
            {
                key: "version",
                header: "Ver"
            },
            {
                key: "address",
                header: "Pool",
                render: _temp12
            },
            {
                key: "fee_bps",
                header: "Fee (bps)",
                render: _temp13
            },
            {
                key: "tvl_usd",
                header: "TVL",
                render: _temp14
            },
            {
                key: "volume_24h_usd",
                header: "Vol 24H",
                render: _temp15
            },
            {
                key: "fees_24h_usd",
                header: "Fees 24H",
                render: _temp16
            },
            {
                key: "utilization",
                header: "Util",
                render: _temp17
            }
        ];
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== loading || $[8] !== rows) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            data: rows,
            columns: t4,
            emptyMessage: "[NO POOLS FOUND]",
            density: "compact",
            loading: loading
        }, void 0, false, {
            fileName: "[project]/src/app/components/Tokens.tsx",
            lineNumber: 384,
            columnNumber: 10
        }, this);
        $[7] = loading;
        $[8] = rows;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    return t5;
}
_s1(PoolsForToken, "jxXGQunvGrfkI4EeRk077ib3Djs=");
_c1 = PoolsForToken;
function _temp17(v_4) {
    return v_4 != null ? (v_4 * 100).toFixed(1) + "%" : "-";
}
function _temp16(v_3) {
    return `$${fmt(v_3)}`;
}
function _temp15(v_2) {
    return `$${fmt(v_2)}`;
}
function _temp14(v_1) {
    return `$${fmt(v_1)}`;
}
function _temp13(v_0) {
    return v_0 ?? "-";
}
function _temp12(v) {
    return `${String(v).slice(0, 6)}…${String(v).slice(-4)}`;
}
function _PoolsForTokenUseEffectAnonymous2() {}
function _PoolsForTokenUseEffectAnonymous(r) {
    return r.json();
}
var _c, _c1;
__turbopack_context__.k.register(_c, "Tokens");
__turbopack_context__.k.register(_c1, "PoolsForToken");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Pools.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Pools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function short(addr) {
    return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '-';
}
function fmtUsd(v) {
    if (v === null || v === undefined) return '-';
    return `$${v.toLocaleString(undefined, {
        maximumFractionDigits: 0
    })}`;
}
function pct(v) {
    if (v === null || v === undefined) return '-';
    return `${v.toFixed(1)}%`;
}
function Pools() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(45);
    if ($[0] !== "654173e83985891b9344235a5470c581cd82458c56c130920335c791ad4d4b7e") {
        for(let $i = 0; $i < 45; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "654173e83985891b9344235a5470c581cd82458c56c130920335c791ad4d4b7e";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    let t0;
    if ($[1] !== snapshot?.pools) {
        t0 = snapshot?.pools || [];
        $[1] = snapshot?.pools;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const rows = t0;
    const [poolTab, setPoolTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState("v2");
    console.log(rows, "rows");
    let t1;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                key: "dex",
                header: "DEX",
                render: _temp
            },
            {
                key: "version",
                header: "Ver"
            },
            {
                key: "address",
                header: "Pool",
                render: _temp2,
                className: "font-mono text-gray-400"
            },
            {
                key: "token0_symbol",
                header: "T0",
                render: _temp3
            },
            {
                key: "token1_symbol",
                header: "T1",
                render: _temp4
            },
            {
                key: "fee_bps",
                header: "Fee",
                render: _temp5
            },
            {
                key: "tvl_usd",
                header: "TVL",
                render: _temp6
            },
            {
                key: "volume_24h_usd",
                header: "Volume (24H)",
                render: _temp7
            },
            {
                key: "fees_24h_usd",
                header: "Fees (24H)",
                render: _temp8
            },
            {
                key: "utilization",
                header: "Util",
                render: _temp9
            },
            {
                key: "pool0_pct",
                header: "T0 %",
                render: _temp10
            },
            {
                key: "pool1_pct",
                header: "T1 %",
                render: _temp11
            },
            {
                key: "reserve_ratio",
                header: "Ratio",
                render: _temp12
            }
        ];
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    const columns = t1;
    let t2;
    if ($[4] !== poolTab || $[5] !== rows) {
        let t3;
        if ($[7] !== poolTab) {
            t3 = ({
                "Pools[rows.filter()]": (p)=>{
                    const versionMap = {
                        v1: "V1",
                        v2: "V2",
                        v3: "V3"
                    };
                    return p.version === versionMap[poolTab];
                }
            })["Pools[rows.filter()]"];
            $[7] = poolTab;
            $[8] = t3;
        } else {
            t3 = $[8];
        }
        t2 = rows.filter(t3);
        $[4] = poolTab;
        $[5] = rows;
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    const filteredPools = t2;
    let t3;
    let t4;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sky-400 text-[8px]",
            children: "🏦"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 132,
            columnNumber: 10
        }, this);
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
            children: "AMM POOLS"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 133,
            columnNumber: 10
        }, this);
        $[9] = t3;
        $[10] = t4;
    } else {
        t3 = $[9];
        t4 = $[10];
    }
    let t5;
    if ($[11] !== rows.length) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        t3,
                        t4,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700",
                            children: [
                                rows.length,
                                " TOTAL"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Pools.tsx",
                            lineNumber: 142,
                            columnNumber: 178
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Pools.tsx",
                    lineNumber: 142,
                    columnNumber: 129
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Pools.tsx",
                lineNumber: 142,
                columnNumber: 78
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 142,
            columnNumber: 10
        }, this);
        $[11] = rows.length;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    let t7;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sky-400 text-[8px] font-mono",
            children: "🏊 POOLS:"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 151,
            columnNumber: 10
        }, this);
        t7 = ({
            "Pools[<button>.onClick]": ()=>setPoolTab("v1")
        })["Pools[<button>.onClick]"];
        $[13] = t6;
        $[14] = t7;
    } else {
        t6 = $[13];
        t7 = $[14];
    }
    const t8 = `px-2 py-0.5 text-[7px] font-mono border ${poolTab === "v1" ? "bg-sky-900 text-sky-300 border-sky-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`;
    let t9;
    if ($[15] !== rows) {
        t9 = rows.filter(_PoolsRowsFilter);
        $[15] = rows;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] !== t8 || $[18] !== t9.length) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t7,
            className: t8,
            children: [
                "V1 (",
                t9.length,
                ")"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, this);
        $[17] = t8;
        $[18] = t9.length;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = ({
            "Pools[<button>.onClick]": ()=>setPoolTab("v2")
        })["Pools[<button>.onClick]"];
        $[20] = t11;
    } else {
        t11 = $[20];
    }
    const t12 = `px-2 py-0.5 text-[7px] font-mono border ${poolTab === "v2" ? "bg-sky-900 text-sky-300 border-sky-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`;
    let t13;
    if ($[21] !== rows) {
        t13 = rows.filter(_PoolsRowsFilter2);
        $[21] = rows;
        $[22] = t13;
    } else {
        t13 = $[22];
    }
    let t14;
    if ($[23] !== t12 || $[24] !== t13.length) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t11,
            className: t12,
            children: [
                "V2 (",
                t13.length,
                ")"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 199,
            columnNumber: 11
        }, this);
        $[23] = t12;
        $[24] = t13.length;
        $[25] = t14;
    } else {
        t14 = $[25];
    }
    let t15;
    if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = ({
            "Pools[<button>.onClick]": ()=>setPoolTab("v3")
        })["Pools[<button>.onClick]"];
        $[26] = t15;
    } else {
        t15 = $[26];
    }
    const t16 = `px-2 py-0.5 text-[7px] font-mono border ${poolTab === "v3" ? "bg-sky-900 text-sky-300 border-sky-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`;
    let t17;
    if ($[27] !== rows) {
        t17 = rows.filter(_PoolsRowsFilter3);
        $[27] = rows;
        $[28] = t17;
    } else {
        t17 = $[28];
    }
    let t18;
    if ($[29] !== t16 || $[30] !== t17.length) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t15,
            className: t16,
            children: [
                "V3 (",
                t17.length,
                ")"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 226,
            columnNumber: 11
        }, this);
        $[29] = t16;
        $[30] = t17.length;
        $[31] = t18;
    } else {
        t18 = $[31];
    }
    let t19;
    if ($[32] !== t10 || $[33] !== t14 || $[34] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-1.5 py-1 bg-black border-b border-gray-800",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    t6,
                    t10,
                    t14,
                    t18
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Pools.tsx",
                lineNumber: 235,
                columnNumber: 74
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 235,
            columnNumber: 11
        }, this);
        $[32] = t10;
        $[33] = t14;
        $[34] = t18;
        $[35] = t19;
    } else {
        t19 = $[35];
    }
    let t20;
    if ($[36] !== poolTab) {
        t20 = poolTab.toUpperCase();
        $[36] = poolTab;
        $[37] = t20;
    } else {
        t20 = $[37];
    }
    const t21 = `[NO ${t20} POOL DATA]`;
    let t22;
    if ($[38] !== filteredPools || $[39] !== t21) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: filteredPools,
                columns: columns,
                emptyMessage: t21,
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Pools.tsx",
                lineNumber: 254,
                columnNumber: 34
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 254,
            columnNumber: 11
        }, this);
        $[38] = filteredPools;
        $[39] = t21;
        $[40] = t22;
    } else {
        t22 = $[40];
    }
    let t23;
    if ($[41] !== t19 || $[42] !== t22 || $[43] !== t5) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: [
                t5,
                t19,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Pools.tsx",
            lineNumber: 263,
            columnNumber: 11
        }, this);
        $[41] = t19;
        $[42] = t22;
        $[43] = t5;
        $[44] = t23;
    } else {
        t23 = $[44];
    }
    return t23;
}
_s(Pools, "IVReAXbNRZQP2HX8Tkla0cSDJ5A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"]
    ];
});
_c = Pools;
function _PoolsRowsFilter3(p_2) {
    return p_2.version === "V3";
}
function _PoolsRowsFilter2(p_1) {
    return p_1.version === "V2";
}
function _PoolsRowsFilter(p_0) {
    return p_0.version === "V1";
}
function _temp12(v_10) {
    return v_10 != null ? v_10.toFixed(2) : "-";
}
function _temp11(v_9) {
    return pct(v_9);
}
function _temp10(v_8) {
    return pct(v_8);
}
function _temp9(v_7) {
    return v_7 != null ? `${(v_7 * 100).toFixed(1)}%` : "-";
}
function _temp8(v_6) {
    return fmtUsd(v_6);
}
function _temp7(v_5) {
    return fmtUsd(v_5);
}
function _temp6(v_4) {
    return fmtUsd(v_4);
}
function _temp5(v_3) {
    return v_3 ? `${(v_3 / 100).toFixed(2)}%` : "-";
}
function _temp4(v_2, r_1) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        title: r_1.token1,
        className: "font-mono text-gray-300",
        children: v_2 || "UNK"
    }, void 0, false, {
        fileName: "[project]/src/app/components/Pools.tsx",
        lineNumber: 307,
        columnNumber: 10
    }, this);
}
function _temp3(v_1, r_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        title: r_0.token0,
        className: "font-mono text-gray-300",
        children: v_1 || "UNK"
    }, void 0, false, {
        fileName: "[project]/src/app/components/Pools.tsx",
        lineNumber: 310,
        columnNumber: 10
    }, this);
}
function _temp2(v_0) {
    return short(v_0);
}
function _temp(v, r) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "font-mono text-emerald-400",
        children: v
    }, void 0, false, {
        fileName: "[project]/src/app/components/Pools.tsx",
        lineNumber: 316,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "Pools");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/Oracles.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Oracles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ago(ts) {
    if (!ts) return '-';
    const d = Math.max(0, (Date.now() - ts) / 1000);
    return `${d.toFixed(0)}s`;
}
function Oracles() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "07725ad62552cf83bc746c09eeebf87ce5acc87595708d7bb7b57be6dc81735e") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "07725ad62552cf83bc746c09eeebf87ce5acc87595708d7bb7b57be6dc81735e";
    }
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    let t0;
    if ($[1] !== snapshot?.oracles) {
        t0 = snapshot?.oracles || [];
        $[1] = snapshot?.oracles;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const rows = t0;
    let t1;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                key: "provider",
                header: "Provider",
                className: "font-mono text-emerald-400"
            },
            {
                key: "pair",
                header: "Pair"
            },
            {
                key: "price_usd",
                header: "Price",
                render: _temp
            },
            {
                key: "last_updated",
                header: "Last Update",
                render: _temp2
            },
            {
                key: "heartbeat_sec",
                header: "Heartbeat",
                render: _temp3
            },
            {
                key: "status",
                header: "Status",
                render: _temp4
            },
            {
                key: "deviation_vs_spot_pct",
                header: "Dev vs DEX",
                render: _temp5
            }
        ];
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    const columns = t1;
    let t2;
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-amber-400 text-[8px]",
            children: "🛰️"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Oracles.tsx",
            lineNumber: 69,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
            children: "ORACLES"
        }, void 0, false, {
            fileName: "[project]/src/app/components/Oracles.tsx",
            lineNumber: 70,
            columnNumber: 10
        }, this);
        $[4] = t2;
        $[5] = t3;
    } else {
        t2 = $[4];
        t3 = $[5];
    }
    let t4;
    if ($[6] !== rows.length) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    t2,
                    t3,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-1 py-0.5 bg-amber-900 text-amber-300 text-[7px] font-mono border border-amber-700",
                        children: [
                            rows.length,
                            " FEEDS"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Oracles.tsx",
                        lineNumber: 79,
                        columnNumber: 127
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Oracles.tsx",
                lineNumber: 79,
                columnNumber: 78
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Oracles.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, this);
        $[6] = rows.length;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] !== rows) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: rows,
                columns: columns,
                emptyMessage: "[NO ORACLE DATA]",
                density: "compact"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Oracles.tsx",
                lineNumber: 87,
                columnNumber: 33
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Oracles.tsx",
            lineNumber: 87,
            columnNumber: 10
        }, this);
        $[8] = rows;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    let t6;
    if ($[10] !== t4 || $[11] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Oracles.tsx",
            lineNumber: 95,
            columnNumber: 10
        }, this);
        $[10] = t4;
        $[11] = t5;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    return t6;
}
_s(Oracles, "Jl0tA3oJnXAntB1/c5BNqi75ui0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWsSnapshot"]
    ];
});
_c = Oracles;
function _temp5(v_3) {
    return v_3 != null ? `${v_3.toFixed(2)}%` : "-";
}
function _temp4(v_2) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: v_2 === "healthy" ? "text-emerald-400" : v_2 === "stale" ? "text-amber-400" : "text-red-400",
        children: v_2 || "-"
    }, void 0, false, {
        fileName: "[project]/src/app/components/Oracles.tsx",
        lineNumber: 108,
        columnNumber: 10
    }, this);
}
function _temp3(v_1) {
    return v_1 ? `${v_1}s` : "-";
}
function _temp2(v_0) {
    return ago(v_0);
}
function _temp(v) {
    return v != null ? `$${v.toFixed(4)}` : "-";
}
var _c;
__turbopack_context__.k.register(_c, "Oracles");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/FilterPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const protocols = [
    'DEX',
    'NFT',
    'DeFi',
    'Bridge',
    'ERC-20',
    'ETH',
    'Other'
];
function FilterPanel() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(40);
    if ($[0] !== "067f79b85f539e96def934a9ac499b7c222af20e87f5abb10990a3dd19b9c4ff") {
        for(let $i = 0; $i < 40; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "067f79b85f539e96def934a9ac499b7c222af20e87f5abb10990a3dd19b9c4ff";
    }
    const f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"])();
    const [presetName, setPresetName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t0;
    if ($[1] !== f) {
        t0 = ({
            "FilterPanel[useEffect()]": ()=>{
                f.loadPreset("");
            }
        })["FilterPanel[useEffect()]"];
        $[1] = f;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    let t1;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    const hasActiveFilters = f.minEth || f.maxEth || f.minGasGwei || f.maxGasGwei || f.protocols.length > 0 || f.tokenQuery || f.searchText || f.whitelist.length > 0 || f.blacklist.length > 0 || f.timeRangeMin || f.decodedOnly;
    let t2;
    if ($[4] !== expanded) {
        t2 = ({
            "FilterPanel[<button>.onClick]": ()=>setExpanded(!expanded)
        })["FilterPanel[<button>.onClick]"];
        $[4] = expanded;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    const t3 = `w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`;
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M19 9l-7 7-7-7"
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 52,
            columnNumber: 10
        }, this);
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== t3) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: t3,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, this);
        $[7] = t3;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== f || $[10] !== hasActiveFilters) {
        t6 = hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "terminal-badge live text-xs",
            children: [
                Object.values(f).filter(_FilterPanelAnonymous).length,
                " ACTIVE"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 67,
            columnNumber: 30
        }, this);
        $[9] = f;
        $[10] = hasActiveFilters;
        $[11] = t6;
    } else {
        t6 = $[11];
    }
    let t7;
    if ($[12] !== t2 || $[13] !== t5 || $[14] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t2,
            className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors font-mono",
            children: [
                t5,
                "[FILTERS] ",
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 76,
            columnNumber: 10
        }, this);
        $[12] = t2;
        $[13] = t5;
        $[14] = t6;
        $[15] = t7;
    } else {
        t7 = $[15];
    }
    let t8;
    if ($[16] !== f || $[17] !== hasActiveFilters) {
        t8 = hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: {
                "FilterPanel[<button>.onClick]": ()=>f.reset()
            }["FilterPanel[<button>.onClick]"],
            className: "terminal-btn text-xs px-3 py-1",
            children: "[CLEAR ALL]"
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 86,
            columnNumber: 30
        }, this);
        $[16] = f;
        $[17] = hasActiveFilters;
        $[18] = t8;
    } else {
        t8 = $[18];
    }
    let t9;
    if ($[19] !== t7 || $[20] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-4",
            children: [
                t7,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 97,
            columnNumber: 10
        }, this);
        $[19] = t7;
        $[20] = t8;
        $[21] = t9;
    } else {
        t9 = $[21];
    }
    let t10;
    if ($[22] !== f) {
        t10 = ({
            "FilterPanel[<select>.onChange]": (e)=>{
                if (e.target.value) {
                    f.loadPreset(e.target.value);
                }
                e.target.value = "";
            }
        })["FilterPanel[<select>.onChange]"];
        $[22] = f;
        $[23] = t10;
    } else {
        t10 = $[23];
    }
    let t11;
    if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
            value: "",
            children: "[LOAD PRESET]"
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 121,
            columnNumber: 11
        }, this);
        $[24] = t11;
    } else {
        t11 = $[24];
    }
    let t12;
    if ($[25] !== f.presets) {
        t12 = f.presets.map(_FilterPanelFPresetsMap);
        $[25] = f.presets;
        $[26] = t12;
    } else {
        t12 = $[26];
    }
    let t13;
    if ($[27] !== t10 || $[28] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                className: "terminal-input text-xs px-3 py-1 bg-slate-800/50",
                onChange: t10,
                children: [
                    t11,
                    t12
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/FilterPanel.tsx",
                lineNumber: 136,
                columnNumber: 52
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 136,
            columnNumber: 11
        }, this);
        $[27] = t10;
        $[28] = t12;
        $[29] = t13;
    } else {
        t13 = $[29];
    }
    let t14;
    if ($[30] !== t13 || $[31] !== t9) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 border-b border-slate-700/30",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    t9,
                    t13
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/FilterPanel.tsx",
                lineNumber: 145,
                columnNumber: 61
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 145,
            columnNumber: 11
        }, this);
        $[30] = t13;
        $[31] = t9;
        $[32] = t14;
    } else {
        t14 = $[32];
    }
    let t15;
    if ($[33] !== expanded || $[34] !== f || $[35] !== presetName) {
        t15 = expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terminal-grid terminal-grid-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 154,
                                        columnNumber: 204
                                    }, this),
                                    "[VALUE RANGE • ETH]"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 154,
                                columnNumber: 118
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs text-slate-400 mb-1 font-mono",
                                                children: "MIN"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 154,
                                                columnNumber: 341
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                step: "0.001",
                                                placeholder: "0.00",
                                                className: "terminal-input w-full",
                                                value: f.minEth ?? "",
                                                onChange: {
                                                    "FilterPanel[<input>.onChange]": (e_0)=>f.set({
                                                            minEth: e_0.target.value === "" ? undefined : Number(e_0.target.value)
                                                        })
                                                }["FilterPanel[<input>.onChange]"]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 154,
                                                columnNumber: 415
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 154,
                                        columnNumber: 336
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs text-slate-400 mb-1 font-mono",
                                                children: "MAX"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 158,
                                                columnNumber: 64
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                step: "0.001",
                                                placeholder: "\u221E",
                                                className: "terminal-input w-full",
                                                value: f.maxEth ?? "",
                                                onChange: {
                                                    "FilterPanel[<input>.onChange]": (e_1)=>f.set({
                                                            maxEth: e_1.target.value === "" ? undefined : Number(e_1.target.value)
                                                        })
                                                }["FilterPanel[<input>.onChange]"]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 158,
                                                columnNumber: 138
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 158,
                                        columnNumber: 59
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 154,
                                columnNumber: 296
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 154,
                        columnNumber: 91
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-mono font-semibold text-blue-300 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 162,
                                        columnNumber: 184
                                    }, this),
                                    "[GAS RANGE • GWEI]"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 162,
                                columnNumber: 98
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs text-slate-400 mb-1 font-mono",
                                                children: "MIN"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 162,
                                                columnNumber: 319
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                step: "0.1",
                                                placeholder: "10",
                                                className: "terminal-input w-full",
                                                value: f.minGasGwei ?? "",
                                                onChange: {
                                                    "FilterPanel[<input>.onChange]": (e_2)=>f.set({
                                                            minGasGwei: e_2.target.value === "" ? undefined : Number(e_2.target.value)
                                                        })
                                                }["FilterPanel[<input>.onChange]"]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 162,
                                                columnNumber: 393
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 162,
                                        columnNumber: 314
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs text-slate-400 mb-1 font-mono",
                                                children: "MAX"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 166,
                                                columnNumber: 64
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                step: "0.1",
                                                placeholder: "\u221E",
                                                className: "terminal-input w-full",
                                                value: f.maxGasGwei ?? "",
                                                onChange: {
                                                    "FilterPanel[<input>.onChange]": (e_3)=>f.set({
                                                            maxGasGwei: e_3.target.value === "" ? undefined : Number(e_3.target.value)
                                                        })
                                                }["FilterPanel[<input>.onChange]"]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 166,
                                                columnNumber: 138
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 166,
                                        columnNumber: 59
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 162,
                                columnNumber: 274
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 162,
                        columnNumber: 71
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-mono font-semibold text-purple-300 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 170,
                                        columnNumber: 186
                                    }, this),
                                    "[PROTOCOLS]"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 170,
                                columnNumber: 98
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 gap-1",
                                children: protocols.map({
                                    "FilterPanel[protocols.map()]": (p_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: f.protocols.includes(p_0),
                                                    onChange: {
                                                        "FilterPanel[protocols.map() > <input>.onChange]": (e_4)=>{
                                                            const newProtocols = e_4.target.checked ? [
                                                                ...f.protocols,
                                                                p_0
                                                            ] : f.protocols.filter({
                                                                "FilterPanel[protocols.map() > <input>.onChange > f.protocols.filter()]": (proto)=>proto !== p_0
                                                            }["FilterPanel[protocols.map() > <input>.onChange > f.protocols.filter()]"]);
                                                            f.set({
                                                                protocols: newProtocols
                                                            });
                                                        }
                                                    }["FilterPanel[protocols.map() > <input>.onChange]"],
                                                    className: "rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 172
                                                }, this),
                                                "[",
                                                p_0,
                                                "]"
                                            ]
                                        }, p_0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 171,
                                            columnNumber: 54
                                        }, this)
                                }["FilterPanel[protocols.map()]"])
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 170,
                                columnNumber: 271
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 170,
                        columnNumber: 71
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-mono font-semibold text-orange-300 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 181,
                                                columnNumber: 202
                                            }, this),
                                            "[TIME RANGE]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 181,
                                        columnNumber: 114
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "terminal-input w-full",
                                        value: String(f.timeRangeMin ?? ""),
                                        onChange: {
                                            "FilterPanel[<select>.onChange]": (e_5)=>f.set({
                                                    timeRangeMin: e_5.target.value === "" ? undefined : Number(e_5.target.value)
                                                })
                                        }["FilterPanel[<select>.onChange]"],
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "[ALL TIME]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 50
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "1",
                                                children: "[LAST 1 MINUTE]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 86
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "5",
                                                children: "[LAST 5 MINUTES]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 128
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "15",
                                                children: "[LAST 15 MINUTES]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 171
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "60",
                                                children: "[LAST HOUR]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 216
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 181,
                                        columnNumber: 288
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 181,
                                columnNumber: 87
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 185,
                                                columnNumber: 383
                                            }, this),
                                            "[TOKEN SEARCH]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 185,
                                        columnNumber: 297
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Token symbol or address",
                                        className: "terminal-input w-full",
                                        value: f.tokenQuery ?? "",
                                        onChange: {
                                            "FilterPanel[<input>.onChange]": (e_6)=>f.set({
                                                    tokenQuery: e_6.target.value
                                                })
                                        }["FilterPanel[<input>.onChange]"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 185,
                                        columnNumber: 469
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 185,
                                columnNumber: 270
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-mono font-semibold text-lime-300 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-lime-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 189,
                                                columnNumber: 170
                                            }, this),
                                            "[ADDRESS / HASH SEARCH]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 189,
                                        columnNumber: 84
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search hash, from, to, function",
                                        className: "terminal-input w-full",
                                        value: f.searchText ?? "",
                                        onChange: {
                                            "FilterPanel[<input>.onChange]": (e_7)=>f.set({
                                                    searchText: e_7.target.value
                                                })
                                        }["FilterPanel[<input>.onChange]"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 189,
                                        columnNumber: 265
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 189,
                                columnNumber: 57
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: f.decodedOnly,
                                        onChange: {
                                            "FilterPanel[<input>.onChange]": (e_8)=>f.set({
                                                    decodedOnly: e_8.target.checked
                                                })
                                        }["FilterPanel[<input>.onChange]"],
                                        className: "rounded border-slate-600 text-green-500 focus:ring-green-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 193,
                                        columnNumber: 165
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-green-500 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 197,
                                                columnNumber: 166
                                            }, this),
                                            "[DECODED TRANSACTIONS ONLY]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 197,
                                        columnNumber: 124
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 193,
                                columnNumber: 57
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 181,
                        columnNumber: 60
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 terminal-grid-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-mono font-semibold text-emerald-300 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 197,
                                                columnNumber: 427
                                            }, this),
                                            "[WHITELIST • ADDRESSES]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 197,
                                        columnNumber: 338
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        placeholder: "0xabc..., 0xdef...",
                                        className: "terminal-input w-full resize-none",
                                        rows: 2,
                                        onChange: {
                                            "FilterPanel[<textarea>.onChange]": (e_9)=>f.set({
                                                    whitelist: e_9.target.value.split(",").map(_FilterPanelTextareaOnChangeAnonymous).filter(Boolean)
                                                })
                                        }["FilterPanel[<textarea>.onChange]"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 197,
                                        columnNumber: 525
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 197,
                                columnNumber: 311
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-mono font-semibold text-red-300 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 201,
                                                columnNumber: 172
                                            }, this),
                                            "[BLACKLIST • ADDRESSES]"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 201,
                                        columnNumber: 87
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        placeholder: "0xabc..., 0xdef...",
                                        className: "terminal-input w-full resize-none",
                                        rows: 2,
                                        onChange: {
                                            "FilterPanel[<textarea>.onChange]": (e_10)=>f.set({
                                                    blacklist: e_10.target.value.split(",").map(_FilterPanelTextareaOnChangeAnonymous2).filter(Boolean)
                                                })
                                        }["FilterPanel[<textarea>.onChange]"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 201,
                                        columnNumber: 266
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 201,
                                columnNumber: 60
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 197,
                        columnNumber: 268
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "terminal-grid-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "glass-card p-4 border border-slate-700/50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-end gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-48",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-mono font-semibold text-yellow-300 mb-2",
                                                children: "[PRESET MANAGEMENT]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 205,
                                                columnNumber: 239
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Enter preset name",
                                                className: "terminal-input w-full",
                                                value: presetName,
                                                onChange: {
                                                    "FilterPanel[<input>.onChange]": (e_11)=>setPresetName(e_11.target.value)
                                                }["FilterPanel[<input>.onChange]"]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 205,
                                                columnNumber: 344
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 205,
                                        columnNumber: 206
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "terminal-btn primary",
                                                onClick: {
                                                    "FilterPanel[<button>.onClick]": ()=>{
                                                        if (presetName.trim()) {
                                                            f.savePreset(presetName.trim());
                                                        }
                                                    }
                                                }["FilterPanel[<button>.onClick]"],
                                                disabled: !presetName.trim(),
                                                children: "[SAVE]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 207,
                                                columnNumber: 89
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "terminal-btn",
                                                onClick: {
                                                    "FilterPanel[<button>.onClick]": ()=>{
                                                        if (presetName.trim()) {
                                                            f.deletePreset(presetName.trim());
                                                        }
                                                    }
                                                }["FilterPanel[<button>.onClick]"],
                                                disabled: !presetName.trim(),
                                                children: "[DELETE]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 213,
                                                columnNumber: 98
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 207,
                                        columnNumber: 61
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 205,
                                columnNumber: 158
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 205,
                            columnNumber: 99
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                        lineNumber: 205,
                        columnNumber: 66
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/FilterPanel.tsx",
                lineNumber: 154,
                columnNumber: 44
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 154,
            columnNumber: 23
        }, this);
        $[33] = expanded;
        $[34] = f;
        $[35] = presetName;
        $[36] = t15;
    } else {
        t15 = $[36];
    }
    let t16;
    if ($[37] !== t14 || $[38] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "glass-card border border-slate-700/50",
            children: [
                t14,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/FilterPanel.tsx",
            lineNumber: 229,
            columnNumber: 11
        }, this);
        $[37] = t14;
        $[38] = t15;
        $[39] = t16;
    } else {
        t16 = $[39];
    }
    return t16;
}
_s(FilterPanel, "UZlZ+vwhyM+GU/+8CQ/ZEhVG43s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilters"]
    ];
});
_c = FilterPanel;
function _FilterPanelTextareaOnChangeAnonymous2(s_0) {
    return s_0.trim();
}
function _FilterPanelTextareaOnChangeAnonymous(s) {
    return s.trim();
}
function _FilterPanelFPresetsMap(p) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
        value: p.name,
        children: p.name
    }, p.name, false, {
        fileName: "[project]/src/app/components/FilterPanel.tsx",
        lineNumber: 245,
        columnNumber: 10
    }, this);
}
function _FilterPanelAnonymous(v) {
    return v && (Array.isArray(v) ? v.length > 0 : true);
}
var _c;
__turbopack_context__.k.register(_c, "FilterPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Dashboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Opportunities$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Opportunities.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Live$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Live.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Included$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Included.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Tokens$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Tokens.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Pools$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Pools.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Oracles$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Oracles.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$FilterPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/FilterPanel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "9dddfc3ed398da32fb792ef8b30ea5719c10689688b4dbdf4e4bf134e4fa41dd") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9dddfc3ed398da32fb792ef8b30ea5719c10689688b4dbdf4e4bf134e4fa41dd";
    }
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("dashboard");
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [
            {
                id: "dashboard",
                label: "\uD83D\uDCCA ANALYTICS TERMINAL",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "opportunities",
                label: "\uD83D\uDC8E OPPORTUNITIES",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Opportunities$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "live",
                label: "\uD83D\uDD34 LIVE FEED",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Live$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "included",
                label: "\u2705 INCLUDED",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Included$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "tokens",
                label: "\uD83D\uDCB9 TOKENS",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Tokens$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "pools",
                label: "\uD83C\uDFE6 POOLS",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Pools$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            },
            {
                id: "oracles",
                label: "\uD83D\uDEF0\uFE0F ORACLES",
                component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Oracles$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
            }
        ];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const tabs = t0;
    const ActiveComponent = tabs.find({
        "Home[tabs.find()]": (tab)=>tab.id === activeTab
    }["Home[tabs.find()]"])?.component || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    console.log("render main component");
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-emerald-400 font-mono text-[10px] font-bold tracking-wider",
                    children: "Ξ ETHEREUM TERMINAL v3.0.0"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 65,
                    columnNumber: 51
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-700 font-mono text-[8px] tracking-wide",
                    children: "BLOOMBERG-STYLE ANALYTICS"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 65,
                    columnNumber: 164
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 65,
            columnNumber: 10
        }, this);
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-1 h-1 bg-emerald-600 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 72,
                    columnNumber: 51
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-emerald-400 font-mono text-[8px] tracking-wide",
                    children: "LIVE"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 72,
                    columnNumber: 106
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 72,
            columnNumber: 10
        }, this);
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-1 h-1 bg-sky-600 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 79,
                    columnNumber: 51
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sky-400 font-mono text-[8px] tracking-wide",
                    children: "SYNC"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 79,
                    columnNumber: 102
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, this);
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "bg-black border-b border-gray-800 px-2 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    t1,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            t2,
                            t3,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[8px] tracking-wide",
                                children: new Date().toLocaleTimeString("en-US", {
                                    hour12: false
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 86,
                                columnNumber: 180
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 86,
                        columnNumber: 131
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 86,
                columnNumber: 76
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, this);
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== activeTab) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "bg-black border-b border-gray-800 px-2 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3",
                children: tabs.map({
                    "Home[tabs.map()]": (tab_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: {
                                "Home[tabs.map() > <button>.onClick]": ()=>setActiveTab(tab_0.id)
                            }["Home[tabs.map() > <button>.onClick]"],
                            className: `font-mono text-[9px] px-2 py-1 border-b transition-colors tracking-wider ${activeTab === tab_0.id ? "text-emerald-400 border-emerald-500 bg-gray-900" : "text-gray-600 border-transparent hover:text-gray-400 hover:border-gray-700"}`,
                            children: tab_0.label
                        }, tab_0.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 96,
                            columnNumber: 40
                        }, this)
                }["Home[tabs.map()]"])
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 95,
                columnNumber: 73
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 95,
            columnNumber: 10
        }, this);
        $[6] = activeTab;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-3 py-1 bg-black border-b border-gray-800",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$FilterPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 107,
                columnNumber: 71
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 107,
            columnNumber: 10
        }, this);
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    let t7;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            maxHeight: "calc(100vh - 200px)",
            minHeight: "600px"
        };
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] !== ActiveComponent) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex-1 px-3 py-2",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-black border border-gray-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-y-auto",
                    style: t7,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActiveComponent, {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 124,
                        columnNumber: 138
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 124,
                    columnNumber: 94
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 124,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 124,
            columnNumber: 10
        }, this);
        $[10] = ActiveComponent;
        $[11] = t8;
    } else {
        t8 = $[11];
    }
    let t9;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-1 h-1 bg-emerald-600 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 132,
                    columnNumber: 51
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-emerald-400 font-mono text-[8px] tracking-widest",
                    children: "WS SUB"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 132,
                    columnNumber: 106
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 132,
            columnNumber: 10
        }, this);
        $[12] = t9;
    } else {
        t9 = $[12];
    }
    let t10;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-1 h-1 bg-sky-600 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 139,
                    columnNumber: 52
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sky-400 font-mono text-[8px] tracking-widest",
                    children: "SYNC"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 139,
                    columnNumber: 103
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 139,
            columnNumber: 11
        }, this);
        $[13] = t10;
    } else {
        t10 = $[13];
    }
    let t11;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
            className: "bg-black border-t border-gray-800 px-2 py-0.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            t9,
                            t10,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-1 h-1 bg-gray-700 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 219
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600 font-mono text-[8px] tracking-widest",
                                        children: "NO ERR"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 271
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 146,
                                columnNumber: 178
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 146,
                        columnNumber: 128
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 font-mono text-[7px] tracking-widest",
                        children: "BLOOMBERG TERMINAL v3.0.0"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 146,
                        columnNumber: 365
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 146,
                columnNumber: 77
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 146,
            columnNumber: 11
        }, this);
        $[14] = t11;
    } else {
        t11 = $[14];
    }
    let t12;
    if ($[15] !== t5 || $[16] !== t8) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-full",
                children: [
                    t4,
                    t5,
                    t6,
                    t8,
                    t11
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 153,
                columnNumber: 50
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 153,
            columnNumber: 11
        }, this);
        $[15] = t5;
        $[16] = t8;
        $[17] = t12;
    } else {
        t12 = $[17];
    }
    return t12;
}
_s(Home, "xHPw8czwx4p9R+GlBIqC9C+RnkM=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_39661bd4._.js.map