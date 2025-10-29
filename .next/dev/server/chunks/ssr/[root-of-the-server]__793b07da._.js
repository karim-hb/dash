module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/app/hooks/useWsSnapshot.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWsSnapshot",
    ()=>useWsSnapshot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function useWsSnapshot() {
    const [snapshot, setSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function connect() {
            try {
                const url = process.env.NEXT_PUBLIC_UI_WS_URL || 'ws://localhost:3006';
                const ws = new WebSocket(url);
                wsRef.current = ws;
                ws.onopen = ()=>setConnected(true);
                ws.onclose = ()=>{
                    setConnected(false);
                    setTimeout(connect, 2000);
                };
                ws.onerror = ()=>setConnected(false);
                ws.onmessage = (evt)=>{
                    try {
                        const data = JSON.parse(evt.data);
                        if (data && typeof data === 'object' && data.summary) {
                            setSnapshot(data);
                        }
                    } catch  {
                    // ignore
                    }
                };
            } catch  {
                setTimeout(connect, 2000);
            }
        }
        connect();
        return ()=>{
            try {
                wsRef.current?.close();
            } catch  {}
            wsRef.current = null;
        };
    }, []);
    return {
        snapshot,
        connected
    };
}
}),
"[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFilters",
    ()=>useFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
'use client';
;
const defaultState = {
    protocols: [],
    whitelist: [],
    blacklist: [],
    decodedOnly: false
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
const useFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
}),
"[project]/src/app/components/Table.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Table
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function Table({ data, columns, loading = false, emptyMessage = "[NO DATA AVAILABLE]", onRowClick, className = "", variant = 'terminal', density = 'compact' }) {
    const [sortColumn, setSortColumn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sortDirection, setSortDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('asc');
    const isCompact = density === 'compact';
    const headerPad = isCompact ? 'px-1 py-1' : 'px-2 py-1.5';
    const cellPad = isCompact ? 'px-1 py-0.5' : 'px-2 py-1';
    const rowText = isCompact ? 'text-[9px]' : 'text-[10px]';
    const headText = isCompact ? 'text-[8px]' : 'text-[9px]';
    const handleSort = (columnKey)=>{
        const column = columns.find((col)=>col.key === columnKey);
        if (!column?.sortable) return;
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };
    const sortedData = [
        ...data
    ].sort((a, b)=>{
        if (!sortColumn) return 0;
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (sortDirection === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `p-8 text-center ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-slate-400 font-mono text-sm",
                children: "[LOADING...]"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Table.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Table.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: `min-w-full ${rowText} border-collapse`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-900 border-b border-gray-700",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: columns.map((column, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: `text-left font-mono ${headText} text-gray-400 uppercase tracking-widest ${headerPad} border-r border-gray-800 last:border-r-0 ${column.sortable ? 'cursor-pointer hover:bg-gray-800 select-none' : ''} ${column.className || ''}`,
                                        onClick: ()=>column.sortable && handleSort(String(column.key)),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: column.header
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Table.tsx",
                                                    lineNumber: 102,
                                                    columnNumber: 21
                                                }, this),
                                                column.sortable && sortColumn === column.key && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `${sortDirection === 'desc' ? 'text-red-400' : 'text-green-400'} text-[7px]`,
                                                    children: sortDirection === 'desc' ? '▼' : '▲'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Table.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Table.tsx",
                                            lineNumber: 101,
                                            columnNumber: 19
                                        }, this)
                                    }, String(column.key) + index, false, {
                                        fileName: "[project]/src/app/components/Table.tsx",
                                        lineNumber: 94,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Table.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Table.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: sortedData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: columns.length,
                                    className: `px-4 py-6 text-center text-gray-600 font-mono ${rowText} bg-black`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: emptyMessage
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Table.tsx",
                                        lineNumber: 117,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Table.tsx",
                                    lineNumber: 116,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Table.tsx",
                                lineNumber: 115,
                                columnNumber: 15
                            }, this) : sortedData.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: `font-mono ${rowText} border-b border-gray-900 hover:bg-gray-900 ${onRowClick ? 'cursor-pointer' : ''}`,
                                    onClick: ()=>onRowClick?.(row, index),
                                    children: columns.map((column, colIndex)=>{
                                        const value = row[column.key];
                                        const renderedValue = column.render ? column.render(value, row, index) : value;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: `${cellPad} ${column.className || ''}`,
                                            children: renderedValue
                                        }, String(column.key) + colIndex, false, {
                                            fileName: "[project]/src/app/components/Table.tsx",
                                            lineNumber: 136,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, index, false, {
                                    fileName: "[project]/src/app/components/Table.tsx",
                                    lineNumber: 122,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Table.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Table.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Table.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            sortedData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `border-t border-gray-800 px-2 py-1 bg-gray-900`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex items-center justify-between text-gray-400 font-mono ${rowText}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-500",
                                children: [
                                    sortedData.length,
                                    " entries"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Table.tsx",
                                lineNumber: 155,
                                columnNumber: 15
                            }, this),
                            sortColumn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-400",
                                children: [
                                    "sorted by ",
                                    columns.find((col)=>col.key === sortColumn)?.header,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSortColumn(null),
                                        className: "ml-1 text-gray-600 hover:text-gray-400 text-[8px]",
                                        children: "[clear]"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Table.tsx",
                                        lineNumber: 159,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Table.tsx",
                                lineNumber: 157,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Table.tsx",
                        lineNumber: 154,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Table.tsx",
                    lineNumber: 153,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Table.tsx",
                lineNumber: 152,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Table.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/charts/SparklineChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SparklineChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
'use client';
;
;
function SparklineChart({ data, color = '#06b6d4', width = '100%', height = 40, className = '' }) {
    const chartData = data.map((value, index)=>({
            value,
            index
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${className}`,
        style: {
            width,
            height
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineChart"], {
                data: chartData,
                margin: {
                    top: 2,
                    right: 2,
                    bottom: 2,
                    left: 2
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                    type: "monotone",
                    dataKey: "value",
                    stroke: color,
                    strokeWidth: 2,
                    dot: false,
                    isAnimationActive: false
                }, void 0, false, {
                    fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
                    lineNumber: 26,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/charts/SparklineChart.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/charts/BarChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-ssr] (ecmascript)");
'use client';
;
;
const DEFAULT_COLORS = [
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b'
];
function BarChart({ data, height = 300, colors = DEFAULT_COLORS, showGrid = true, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        style: {
            height
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BarChart"], {
                data: data,
                margin: {
                    top: 10,
                    right: 10,
                    bottom: 20,
                    left: 10
                },
                children: [
                    showGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                        strokeDasharray: "3 3",
                        stroke: "rgba(71, 85, 105, 0.3)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/BarChart.tsx",
                        lineNumber: 27,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
                        dataKey: "name",
                        tick: {
                            fill: '#94a3b8',
                            fontSize: 12,
                            fontFamily: 'monospace'
                        },
                        stroke: "rgba(71, 85, 105, 0.5)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/BarChart.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
                        tick: {
                            fill: '#94a3b8',
                            fontSize: 12,
                            fontFamily: 'monospace'
                        },
                        stroke: "rgba(71, 85, 105, 0.5)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/BarChart.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                        contentStyle: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                            fontFamily: 'monospace',
                            fontSize: '12px'
                        },
                        cursor: {
                            fill: 'rgba(56, 189, 248, 0.1)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/BarChart.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bar"], {
                        dataKey: "value",
                        radius: [
                            4,
                            4,
                            0,
                            0
                        ],
                        children: data.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cell"], {
                                fill: entry.color || colors[index % colors.length]
                            }, `cell-${index}`, false, {
                                fileName: "[project]/src/app/components/charts/BarChart.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/BarChart.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/charts/BarChart.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/BarChart.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/charts/BarChart.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/charts/TimeSeriesChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimeSeriesChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
'use client';
;
;
function TimeSeriesChart({ data, lines, height = 300, showGrid = true, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        style: {
            height
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineChart"], {
                data: data,
                margin: {
                    top: 10,
                    right: 30,
                    left: 10,
                    bottom: 10
                },
                children: [
                    showGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                        strokeDasharray: "3 3",
                        stroke: "rgba(71, 85, 105, 0.3)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
                        dataKey: "time",
                        tick: {
                            fill: '#94a3b8',
                            fontSize: 11,
                            fontFamily: 'monospace'
                        },
                        stroke: "rgba(71, 85, 105, 0.5)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
                        tick: {
                            fill: '#94a3b8',
                            fontSize: 11,
                            fontFamily: 'monospace'
                        },
                        stroke: "rgba(71, 85, 105, 0.5)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                        contentStyle: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                            fontFamily: 'monospace',
                            fontSize: '12px'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Legend"], {
                        wrapperStyle: {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#94a3b8'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this),
                    lines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                            type: "monotone",
                            dataKey: line.dataKey,
                            stroke: line.color,
                            strokeWidth: 2,
                            dot: false,
                            name: line.name,
                            isAnimationActive: false
                        }, line.dataKey, false, {
                            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/charts/TimeSeriesChart.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/Dashboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$SparklineChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/SparklineChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$BarChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/BarChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$TimeSeriesChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/charts/TimeSeriesChart.tsx [app-ssr] (ecmascript)");
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
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFilters"])();
    // Real-time data tracking
    const [gasPriceHistory, setGasPriceHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ingressHistory, setIngressHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (snapshot?.gas?.base_fee) {
            const gasPrice = snapshot.gas.base_fee / 1e9;
            setGasPriceHistory((prev)=>{
                const newHistory = [
                    ...prev,
                    gasPrice
                ];
                return newHistory.slice(-60);
            });
        }
        if (snapshot?.summary) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            setIngressHistory((prev)=>{
                const newHistory = [
                    ...prev,
                    {
                        time: timeStr,
                        ingress: snapshot.summary.ingress_per_sec || 0,
                        egress: snapshot.summary.egress_per_sec || 0
                    }
                ];
                return newHistory.slice(-20);
            });
        }
    }, [
        snapshot
    ]);
    if (!snapshot) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center py-20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600 font-mono text-[10px]",
                children: "CONNECTING TO MEMPOOL TERMINAL..."
            }, void 0, false, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 47,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/Dashboard.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this);
    }
    const { summary, status, gas } = snapshot;
    const filteredTxs = filters.applyFilters(snapshot.live || []);
    // Contract analysis
    const contractCounts = new Map();
    for (const tx of filteredTxs){
        const key = (tx.to || '').toLowerCase();
        if (key) contractCounts.set(key, (contractCounts.get(key) || 0) + 1);
    }
    const topContracts = Array.from(contractCounts.entries()).sort((a, b)=>b[1] - a[1]).slice(0, 10);
    // Sender analysis for Top Senders by Volume
    const senderCounts = new Map();
    const senderVolumes = new Map();
    for (const tx of filteredTxs){
        const key = (tx.from || '').toLowerCase();
        if (key) {
            senderCounts.set(key, (senderCounts.get(key) || 0) + 1);
            const currentVolume = senderVolumes.get(key) || BigInt(0);
            const txValue = tx.value ? BigInt(tx.value) : BigInt(0);
            senderVolumes.set(key, currentVolume + txValue);
        }
    }
    const topSenders = Array.from(senderCounts.entries()).sort((a, b)=>b[1] - a[1]).slice(0, 10);
    const topSendersByVolume = Array.from(senderVolumes.entries()).sort((a, b)=>Number(b[1] - a[1])).slice(0, 10).map(([address, volume])=>({
            address,
            volume: Number(volume) / 1e18,
            count: senderCounts.get(address) || 0
        }));
    // Protocol usage
    const protocolData = Object.entries(summary.by_type || {}).sort(([, a], [, b])=>b - a).slice(0, 8).map(([name, value])=>({
            name: name.length > 15 ? name.slice(0, 15) + '...' : name,
            value: value
        }));
    // Gas distribution
    const gasBuckets = summary.gas_buckets || {};
    const gasDistribution = [
        {
            name: '≥100G',
            value: gasBuckets.gte_100 || 0
        },
        {
            name: '≥150G',
            value: gasBuckets.gte_150 || 0
        },
        {
            name: '≥200G',
            value: gasBuckets.gte_200 || 0
        },
        {
            name: '≥300G',
            value: gasBuckets.gte_300 || 0
        }
    ];
    // Gas oracle data
    const baseFee = gas?.base_fee ? (gas.base_fee / 1e9).toFixed(2) : '—';
    const priorityFees = {
        rapid: gas?.tips?.['1_block'] || 0,
        fast: gas?.tips?.['3_blocks'] || 0,
        standard: gas?.tips?.['5_blocks'] || 0
    };
    // Mempool health indicators
    const congestionLevel = summary.total_pending > 150 ? 'HIGH' : summary.total_pending > 75 ? 'MEDIUM' : 'LOW';
    const congestionColor = congestionLevel === 'HIGH' ? 'text-red-400' : congestionLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';
    const avgWaitTime = summary.age_p50?.toFixed(1) || '—';
    // Top Senders by Volume columns with ranking colors
    const volumeColumns = [
        {
            key: 'rank',
            header: '#',
            render: (_, __, index)=>{
                const rank = index + 1;
                const rankStr = rank.toString().padStart(2, '0');
                let colorClass = 'text-gray-600';
                if (rank === 1) colorClass = 'text-yellow-400';
                else if (rank === 2) colorClass = 'text-gray-400';
                else if (rank === 3) colorClass = 'text-orange-500';
                else if (rank <= 5) colorClass = 'text-emerald-400';
                else if (rank <= 10) colorClass = 'text-sky-400';
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `${colorClass} font-mono font-bold`,
                    children: rankStr
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 138,
                    columnNumber: 16
                }, this);
            },
            className: 'font-mono'
        },
        {
            key: 'address',
            header: 'Address',
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer",
                    children: [
                        value.slice(0, 6),
                        "...",
                        value.slice(-4)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Dashboard.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this),
            className: 'font-mono'
        },
        {
            key: 'volume',
            header: 'Volume (ETH)',
            render: (value)=>{
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                if (value >= 1) return value.toFixed(3);
                if (value >= 0.001) return `${(value * 1000).toFixed(0)}m`;
                return `${(value * 1e6).toFixed(0)}μ`;
            },
            className: 'text-green-400 font-medium font-mono'
        },
        {
            key: 'count',
            header: 'Tx Count',
            render: (value)=>value.toLocaleString(),
            className: 'text-blue-400 font-mono'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-4 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                children: "PENDING TXS"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-emerald-400 font-mono text-xs font-bold",
                                children: summary.total_pending || 0
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                children: "BASE FEE"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-amber-400 font-mono text-xs font-bold",
                                children: [
                                    baseFee,
                                    " G"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                children: "CONGESTION"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `font-mono text-xs font-bold ${congestionColor}`,
                                children: congestionLevel
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 185,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                children: "SUCCESS RATE"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sky-400 font-mono text-xs font-bold",
                                children: [
                                    summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—',
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "⛽"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 201,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "GAS ORACLE"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 202,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 200,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-3 gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                        children: "RAPID"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-red-400 font-mono text-[9px] font-bold",
                                                        children: priorityFees.rapid
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-700 font-mono text-[6px]",
                                                        children: "~15s"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 212,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 209,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                        children: "FAST"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-yellow-400 font-mono text-[9px] font-bold",
                                                        children: priorityFees.fast
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 216,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-700 font-mono text-[6px]",
                                                        children: "~45s"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 214,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                        children: "STANDARD"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-green-400 font-mono text-[9px] font-bold",
                                                        children: priorityFees.standard
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 221,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-700 font-mono text-[6px]",
                                                        children: "~75s"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 219,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 208,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 bg-gray-900 border border-gray-800 px-1.5 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-400 font-mono text-[7px] tracking-widest",
                                                        children: "BASE FEE TREND (60s)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-cyan-400 font-mono text-[7px]",
                                                        children: [
                                                            baseFee,
                                                            " GWEI"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 227,
                                                columnNumber: 15
                                            }, this),
                                            gasPriceHistory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$SparklineChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                data: gasPriceHistory,
                                                color: "#06b6d4",
                                                height: 35
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                                lineNumber: 232,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 226,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "🏥"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 242,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "MEMPOOL HEALTH"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 243,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 241,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 240,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                    children: "CONGESTION"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `font-mono text-[9px] font-bold ${congestionColor}`,
                                                    children: congestionLevel
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-700 font-mono text-[6px]",
                                                    children: [
                                                        summary.total_pending,
                                                        " pending"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                    children: "AVG WAIT"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-blue-400 font-mono text-[9px] font-bold",
                                                    children: [
                                                        avgWaitTime,
                                                        "s"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 257,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-700 font-mono text-[6px]",
                                                    children: "P50 latency"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                    children: "SUCCESS RATE"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 261,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-green-400 font-mono text-[9px] font-bold",
                                                    children: [
                                                        summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—',
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-700 font-mono text-[6px]",
                                                    children: "Inclusion rate"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 260,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-900 border border-gray-800 px-1.5 py-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-600 font-mono text-[7px] tracking-widest mb-0.5",
                                                    children: "RPC LATENCY"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 268,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-purple-400 font-mono text-[9px] font-bold",
                                                    children: [
                                                        status.rpc_latency_ms || '—',
                                                        "ms"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-gray-700 font-mono text-[6px]",
                                                    children: "Response time"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 249,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 248,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "📊"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 284,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "GAS PRICE DISTRIBUTION"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 285,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 283,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 282,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$BarChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    data: gasDistribution,
                                    height: 180
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "📈"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 298,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "INGRESS/EGRESS RATES (5min)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 299,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 297,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 296,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: ingressHistory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$TimeSeriesChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    data: ingressHistory,
                                    lines: [
                                        {
                                            dataKey: 'ingress',
                                            color: '#10b981',
                                            name: 'Ingress'
                                        },
                                        {
                                            dataKey: 'egress',
                                            color: '#ef4444',
                                            name: 'Egress'
                                        }
                                    ],
                                    height: 180
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 306,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 304,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "🏷️"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 324,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "TX TYPE DISTRIBUTION"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 325,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$charts$2f$BarChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    data: protocolData.slice(0, 6),
                                    height: 180
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 331,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 330,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "🔮"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 338,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "PROTOCOL USAGE"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 337,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 336,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-600 font-mono text-[7px] text-center",
                                    children: [
                                        "[PIE CHART PLACEHOLDER - Top protocols: ",
                                        protocolData.map((d)=>d.name).join(', '),
                                        "]"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 345,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 335,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 320,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "🏛️"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 357,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "TOP CONTRACTS"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 358,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                                            children: [
                                                topContracts.length,
                                                " ACTIVE"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 361,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    data: topContracts.map(([address, count])=>({
                                            address,
                                            count
                                        })),
                                    columns: [
                                        {
                                            key: 'rank',
                                            header: '#',
                                            render: (_, __, index)=>(index + 1).toString(),
                                            className: 'text-cyan-400 font-mono font-bold'
                                        },
                                        {
                                            key: 'address',
                                            header: 'Address',
                                            render: (value)=>`${value.slice(0, 6)}...${value.slice(-4)}`,
                                            className: 'font-mono text-cyan-400'
                                        },
                                        {
                                            key: 'count',
                                            header: 'Txs',
                                            render: (value)=>value.toString(),
                                            className: 'text-cyan-400 font-mono'
                                        }
                                    ],
                                    emptyMessage: "[NO CONTRACT ACTIVITY]",
                                    density: "compact"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 367,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 366,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 354,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-400 text-[8px]",
                                            children: "👤"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 398,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                            children: "TOP SENDERS BY ACTIVITY"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 399,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                                            children: [
                                                topSenders.length,
                                                " ACTIVE"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Dashboard.tsx",
                                            lineNumber: 402,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 397,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 396,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    data: topSenders.map(([address, count])=>({
                                            address,
                                            count
                                        })),
                                    columns: [
                                        {
                                            key: 'rank',
                                            header: '#',
                                            render: (_, __, index)=>(index + 1).toString(),
                                            className: 'text-purple-400 font-mono font-bold'
                                        },
                                        {
                                            key: 'address',
                                            header: 'Address',
                                            render: (value)=>`${value.slice(0, 6)}...${value.slice(-4)}`,
                                            className: 'font-mono text-purple-400'
                                        },
                                        {
                                            key: 'count',
                                            header: 'Txs',
                                            render: (value)=>value.toString(),
                                            className: 'text-purple-400 font-mono'
                                        }
                                    ],
                                    emptyMessage: "[NO SENDER ACTIVITY]",
                                    density: "compact"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 408,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 407,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 353,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border border-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[8px]",
                                    children: "💎"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 441,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[8px] uppercase tracking-widest text-gray-300",
                                    children: "TOP SENDERS BY VOLUME"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 442,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700",
                                    children: [
                                        topSendersByVolume.length,
                                        " HIGH VALUE"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Dashboard.tsx",
                                    lineNumber: 445,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 440,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 439,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-1.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            data: topSendersByVolume,
                            columns: volumeColumns,
                            emptyMessage: "[NO VOLUME DATA...]",
                            density: "compact"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Dashboard.tsx",
                            lineNumber: 451,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 450,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 438,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-green-400 text-[8px]",
                                        children: "🔗"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 464,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400 font-mono text-[7px] tracking-widest",
                                        children: "WEBSOCKET"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 465,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 463,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-green-400 font-mono text-[8px] font-bold",
                                children: "CONNECTED"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 467,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 462,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-400 text-[8px]",
                                        children: "📡"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 471,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400 font-mono text-[7px] tracking-widest",
                                        children: "SUBSCRIPTIONS"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 472,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 470,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-blue-400 font-mono text-[8px] font-bold",
                                children: (status.subscriptions_active || []).length
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 474,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 469,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900 border border-gray-800 px-2 py-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${(status.errors || []).length ? 'text-red-400' : 'text-green-400'} text-[8px]`,
                                        children: (status.errors || []).length ? '🚨' : '✅'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 478,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400 font-mono text-[7px] tracking-widest",
                                        children: "ERRORS"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Dashboard.tsx",
                                        lineNumber: 481,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 477,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `font-mono text-[8px] font-bold ${(status.errors || []).length ? 'text-red-400' : 'text-green-400'}`,
                                children: (status.errors || []).length
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Dashboard.tsx",
                                lineNumber: 483,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Dashboard.tsx",
                        lineNumber: 476,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Dashboard.tsx",
                lineNumber: 461,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Dashboard.tsx",
        lineNumber: 172,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/utils/amountUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared amount decoding utilities for transaction amount extraction
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
// Comprehensive token registry with major DeFi tokens
const TOKEN_REGISTRY = {
    // Native ETH
    '0x0000000000000000000000000000000000000000': {
        symbol: 'ETH',
        decimals: 18
    },
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': {
        symbol: 'ETH',
        decimals: 18
    },
    // Wrapped ETH
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
        symbol: 'WETH',
        decimals: 18
    },
    // Stablecoins
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
    '0x4fabb145d64652a948d72533023f6e7a623c7c53': {
        symbol: 'BUSD',
        decimals: 18
    },
    '0x8e870d67f660d95d5be530380d0ec0bd388289e1': {
        symbol: 'USDP',
        decimals: 18
    },
    '0xa693b19d2931d498c5b318df961919bb4aee87a5': {
        symbol: 'UST',
        decimals: 6
    },
    '0x1456688345527be1f37e9e627da0837d6f08c925': {
        symbol: 'USDD',
        decimals: 18
    },
    // Major cryptocurrencies
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
        symbol: 'WBTC',
        decimals: 8
    },
    '0x321162cd933e2be498cd2267a90534a804051b46': {
        symbol: 'BTCB',
        decimals: 18
    },
    '0x75231f58b43240c9718dd58b4967c5114342a86c': {
        symbol: 'OKB',
        decimals: 18
    },
    '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': {
        symbol: 'SHIB',
        decimals: 18
    },
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': {
        symbol: 'MATIC',
        decimals: 18
    },
    // DeFi tokens
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
        symbol: 'UNI',
        decimals: 18
    },
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': {
        symbol: 'AAVE',
        decimals: 18
    },
    '0xc00e94cb662c3520282e6f5717214004a7f26888': {
        symbol: 'COMP',
        decimals: 18
    },
    '0x514910771af9ca656af840dff83e8264ecf986ca': {
        symbol: 'LINK',
        decimals: 18
    },
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': {
        symbol: 'YFI',
        decimals: 18
    },
    '0xba100000625a3754423978a60c9317c58a424e3d': {
        symbol: 'BAL',
        decimals: 18
    },
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44': {
        symbol: 'KP3R',
        decimals: 18
    },
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': {
        symbol: 'SNX',
        decimals: 18
    },
    '0x408e41876cccdc0f92210600ef50372656052a38': {
        symbol: 'REN',
        decimals: 18
    },
    '0x4e15361fd6b4bb609fa63c81d99d0ce2bcb7c04': {
        symbol: 'FTM',
        decimals: 18
    },
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': {
        symbol: 'SUSHI',
        decimals: 18
    },
    '0xd533a949740bb3306d119cc777fa900ba034cd52': {
        symbol: 'CRV',
        decimals: 18
    },
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b': {
        symbol: 'CVX',
        decimals: 18
    },
    '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0': {
        symbol: 'FXS',
        decimals: 18
    },
    '0xd46ba6d942050d489dbd938a2c909a5d5039a161': {
        symbol: 'AMPL',
        decimals: 9
    },
    // Layer 2 tokens
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': {
        symbol: 'LDO',
        decimals: 18
    },
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
        symbol: 'wstETH',
        decimals: 18
    },
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': {
        symbol: 'stETH',
        decimals: 18
    },
    '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb': {
        symbol: 'sETH',
        decimals: 18
    },
    // Gaming tokens
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': {
        symbol: 'MANA',
        decimals: 18
    },
    '0x3845badade8e6dff049820680d1f14bd3903a5d0': {
        symbol: 'SAND',
        decimals: 18
    },
    '0xf57e7e7c23978c3caec3c3548a3d29cbfcfae9': {
        symbol: 'IMX',
        decimals: 18
    },
    // Privacy tokens
    '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671': {
        symbol: 'NMR',
        decimals: 18
    },
    '0x8290333cef9e6d528dd5618fb97a76f07': {
        symbol: 'ANKR',
        decimals: 18
    },
    // Oracle tokens
    '0x0f9ffb58ae4ba5a879ed3c7d7b3f8e3e3b3c7d3': {
        symbol: 'MKR',
        decimals: 18
    },
    '0x8290333cef9e6d528dd5618fb97a76f07': {
        symbol: 'REP',
        decimals: 18
    }
};
// Get token info from address
function getTokenInfo(address) {
    const normalizedAddr = (address || '').toLowerCase();
    return TOKEN_REGISTRY[normalizedAddr] || {
        symbol: 'TOKEN',
        decimals: 18
    };
}
// BigInt helpers to safely handle 256-bit values
function toBigInt(value) {
    try {
        if (typeof value === 'bigint') return value;
        if (typeof value === 'number') return BigInt(Math.trunc(value));
        if (typeof value === 'string') {
            return value.startsWith('0x') || value.startsWith('0X') ? BigInt(value) : BigInt(value);
        }
        if (value && typeof value === 'object' && 'toString' in value) {
            return toBigInt(value.toString());
        }
    } catch  {}
    return 0n;
}
function formatUnitsBigInt(amount, decimals, precision = 6) {
    if (decimals < 0) decimals = 0;
    const base = 10n ** BigInt(decimals);
    const neg = amount < 0n;
    const abs = neg ? -amount : amount;
    const whole = abs / base;
    const frac = abs % base;
    const fracScaled = frac * 10n ** BigInt(precision) / base;
    let fracStr = fracScaled.toString().padStart(precision, '0');
    fracStr = fracStr.replace(/0+$/g, '');
    let out = whole.toString();
    if (fracStr.length > 0) out += `.${fracStr}`;
    if (neg) out = `-${out}`;
    const len = whole.toString().length;
    if (len > 12) return `${whole.toString().slice(0, len - 12)}.${whole.toString().slice(len - 12, len - 10)}T`;
    if (len > 9) return `${whole.toString().slice(0, len - 9)}.${whole.toString().slice(len - 9, len - 7)}B`;
    if (len > 6) return `${whole.toString().slice(0, len - 6)}.${whole.toString().slice(len - 6, len - 4)}M`;
    if (len > 3 && fracStr.length === 0) return `${whole.toString().slice(0, len - 3)}.${whole.toString().slice(len - 3, len - 1)}K`;
    if (whole === 0n && frac > 0n) return formatUnitsBigInt(amount, decimals, Math.max(precision, 8));
    return out;
}
function extractAmountInfo(tx) {
    try {
        if (!tx) return {
            amount: '-',
            unit: 'ETH',
            unifiedEth: '-'
        };
        // 1. NATIVE ETH TRANSFERS - Always check first
        const valueWei = toBigInt(tx.value || '0x0');
        if (valueWei > 0n) {
            const amount = formatUnitsBigInt(valueWei, 18, 6);
            const unifiedEth = formatUnitsBigInt(valueWei, 18, 4);
            return {
                amount,
                unit: 'ETH',
                unifiedEth
            };
        }
        const decoded = tx._decoded_fn;
        const decodedEvents = tx._decoded_events;
        // 2. EVENT-BASED AMOUNT EXTRACTION (Most reliable)
        if (decodedEvents && decodedEvents.length > 0) {
            for (const event of decodedEvents){
                if (event.confidence >= 0.7) {
                    // ERC-20 Transfer Events
                    if (event.event === 'Transfer' && event.args) {
                        const valueArg = event.args.find((arg)=>arg.name === 'value' || arg.name === 'wad' || arg.name === 'amount');
                        if (valueArg && valueArg.value) {
                            try {
                                const amountValue = typeof valueArg.value === 'string' ? parseInt(valueArg.value, 16) : valueArg.value;
                                if (amountValue > 0) {
                                    const tokenInfo = getTokenInfo(event.address);
                                    return {
                                        amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                        unit: tokenInfo.symbol,
                                        unifiedEth: '-'
                                    };
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                    // DEX Swap Events (Uniswap V2/V3, SushiSwap, etc.)
                    if (event.event === 'Swap' && event.args) {
                        // Attempt to infer token0/token1 from Transfer events where pair is sender/recipient
                        const pairAddr = (event.address || '').toLowerCase();
                        const transferEvents = (decodedEvents || []).filter((e)=>e.event === 'Transfer' && e.args && e.address && e.address !== pairAddr);
                        const tokensByInvolvement = [];
                        for (const te of transferEvents){
                            const fromArg = te.args.find((a)=>a.name === 'from');
                            const toArg = te.args.find((a)=>a.name === 'to');
                            const involved = fromArg && typeof fromArg.value === 'string' && fromArg.value.toLowerCase() === pairAddr || toArg && typeof toArg.value === 'string' && toArg.value.toLowerCase() === pairAddr;
                            if (involved) {
                                tokensByInvolvement.push((te.address || '').toLowerCase());
                            }
                            if (tokensByInvolvement.length >= 2) break;
                        }
                        const token0Addr = tokensByInvolvement[0];
                        const token1Addr = tokensByInvolvement[1];
                        const token0Info = token0Addr ? getTokenInfo(token0Addr) : {
                            symbol: 'TOKEN0',
                            decimals: 18
                        };
                        const token1Info = token1Addr ? getTokenInfo(token1Addr) : {
                            symbol: 'TOKEN1',
                            decimals: 18
                        };
                        // Check all amount fields
                        const amountFields = [
                            'amount0In',
                            'amount1In',
                            'amount0Out',
                            'amount1Out',
                            'amountIn',
                            'amountOut'
                        ];
                        for (const field of amountFields){
                            const arg = event.args.find((a)=>a.name === field);
                            if (arg && arg.value) {
                                try {
                                    const amountValue = toBigInt(arg.value);
                                    if (amountValue > 0n) {
                                        // Map amount0* to token0, amount1* to token1
                                        const isZero = field.toLowerCase().includes('0');
                                        const tokenInfo = isZero ? token0Info : token1Info;
                                        const direction = field.includes('In') ? 'IN' : 'OUT';
                                        return {
                                            amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                            unit: direction === 'IN' ? `${tokenInfo.symbol} in` : `${tokenInfo.symbol} out`,
                                            unifiedEth: '-'
                                        };
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                        }
                    }
                    // Perp/Leverage Position Events (GMX, Synthetix)
                    if ((event.event === 'IncreasePosition' || event.event === 'DecreasePosition' || event.event === 'UpdatePosition' || event.event === 'ClosePosition') && event.args) {
                        const positionFields = [
                            'collateralDelta',
                            'sizeDelta',
                            'collateral',
                            'size',
                            'margin',
                            'leverage'
                        ];
                        for (const field of positionFields){
                            const arg = event.args.find((a)=>a.name === field);
                            if (arg && arg.value) {
                                try {
                                    const amountValue = toBigInt(arg.value);
                                    if (amountValue > 0n) {
                                        // Perp protocols typically use 6 decimals for USD values
                                        return {
                                            amount: formatTokenAmount(amountValue, 6),
                                            unit: field.toUpperCase(),
                                            unifiedEth: '-'
                                        };
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                        }
                    }
                    // Lending Events (Aave, Compound)
                    if ((event.event === 'Supply' || event.event === 'Withdraw' || event.event === 'Borrow' || event.event === 'Repay') && event.args) {
                        const lendingFields = [
                            'amount',
                            'value',
                            'principal',
                            'interest'
                        ];
                        for (const field of lendingFields){
                            const arg = event.args.find((a)=>a.name === field);
                            if (arg && arg.value) {
                                try {
                                    const amountValue = toBigInt(arg.value);
                                    if (amountValue > 0n) {
                                        const tokenInfo = getTokenInfo(event.address);
                                        return {
                                            amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                            unit: tokenInfo.symbol,
                                            unifiedEth: '-'
                                        };
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                        }
                    }
                    // Staking Events (Lido, Rocket Pool)
                    if ((event.event === 'Staked' || event.event === 'Unstaked' || event.event === 'Submitted' || event.event === 'Unsubmitted') && event.args) {
                        const stakingFields = [
                            'amount',
                            'value',
                            'ethAmount'
                        ];
                        for (const field of stakingFields){
                            const arg = event.args.find((a)=>a.name === field);
                            if (arg && arg.value) {
                                try {
                                    const amountValue = typeof arg.value === 'string' ? parseInt(arg.value, 16) : arg.value;
                                    if (amountValue > 0) {
                                        const tokenInfo = getTokenInfo(event.address);
                                        return {
                                            amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                            unit: tokenInfo.symbol,
                                            unifiedEth: '-'
                                        };
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        }
        // 3. FUNCTION-BASED AMOUNT EXTRACTION (High confidence required)
        if (decoded && decoded.decoded && decoded.confidence >= 0.8) {
            const functionName = (decoded.function || '').toLowerCase();
            // DEX Swap Functions
            if (functionName.includes('swap') || functionName.includes('exchange') || functionName.includes('trade') || decoded.confidence >= 0.9) {
                const swapFields = [
                    'amountIn',
                    'amountOut',
                    'amountInMax',
                    'amountOutMin',
                    'amount'
                ];
                for (const field of swapFields){
                    const arg = decoded.args.find((a)=>a.name === field);
                    if (arg && arg.value) {
                        try {
                            const amountValue = toBigInt(arg.value);
                            if (amountValue > 0n) {
                                const tokenInfo = getTokenInfo(tx.to || '');
                                const direction = field.includes('In') ? 'IN' : 'OUT';
                                return {
                                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                    unit: `${tokenInfo.symbol}(${direction})`,
                                    unifiedEth: '-'
                                };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            // ERC-20 Transfer/Approve Functions
            if (functionName.includes('transfer') || functionName.includes('approve') || functionName.includes('permit')) {
                const transferFields = [
                    'amount',
                    'value',
                    'wad'
                ];
                for (const field of transferFields){
                    const arg = decoded.args.find((a)=>a.name === field);
                    if (arg && arg.value) {
                        try {
                            const amountValue = toBigInt(arg.value);
                            if (amountValue > 0n) {
                                const tokenInfo = getTokenInfo(tx.to || '');
                                return {
                                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                    unit: tokenInfo.symbol,
                                    unifiedEth: '-'
                                };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            // Lending Functions
            if (functionName.includes('supply') || functionName.includes('withdraw') || functionName.includes('borrow') || functionName.includes('repay') || functionName.includes('deposit') || functionName.includes('redeem')) {
                const lendingFields = [
                    'amount',
                    'value',
                    'principal'
                ];
                for (const field of lendingFields){
                    const arg = decoded.args.find((a)=>a.name === field);
                    if (arg && arg.value) {
                        try {
                            const amountValue = toBigInt(arg.value);
                            if (amountValue > 0n) {
                                const tokenInfo = getTokenInfo(tx.to || '');
                                return {
                                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                    unit: tokenInfo.symbol,
                                    unifiedEth: '-'
                                };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            // Staking Functions
            if (functionName.includes('stake') || functionName.includes('unstake') || functionName.includes('submit') || functionName.includes('withdraw')) {
                const stakingFields = [
                    'amount',
                    'value',
                    '_amount'
                ];
                for (const field of stakingFields){
                    const arg = decoded.args.find((a)=>a.name === field);
                    if (arg && arg.value) {
                        try {
                            const amountValue = toBigInt(arg.value);
                            if (amountValue > 0n) {
                                const tokenInfo = getTokenInfo(tx.to || '');
                                return {
                                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                    unit: tokenInfo.symbol,
                                    unifiedEth: '-'
                                };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            // Liquidity Functions
            if (functionName.includes('addliquidity') || functionName.includes('removeliquidity')) {
                const liquidityFields = [
                    'amountADesired',
                    'amountBDesired',
                    'amountAMin',
                    'amountBMin',
                    'liquidity'
                ];
                for (const field of liquidityFields){
                    const arg = decoded.args.find((a)=>a.name === field);
                    if (arg && arg.value) {
                        try {
                            const amountValue = toBigInt(arg.value);
                            if (amountValue > 0n) {
                                const tokenInfo = getTokenInfo(tx.to || '');
                                return {
                                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                    unit: tokenInfo.symbol,
                                    unifiedEth: '-'
                                };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            // Generic amount fields for any function
            const genericFields = [
                'amount',
                'value',
                'wad',
                '_amount',
                '_value'
            ];
            for (const field of genericFields){
                const arg = decoded.args.find((a)=>a.name === field && a.type === 'uint256');
                if (arg && arg.value) {
                    try {
                        const amountValue = toBigInt(arg.value);
                        if (amountValue > 1000000000000n) {
                            const tokenInfo = getTokenInfo(tx.to || '');
                            return {
                                amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                unit: tokenInfo.symbol,
                                unifiedEth: '-'
                            };
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        // 4. FALLBACK: Check for any large uint256 values in events (lower confidence)
        if (decodedEvents && decodedEvents.length > 0) {
            for (const event of decodedEvents){
                if (event.args) {
                    for (const arg of event.args){
                        if (arg.type === 'uint256' && arg.value) {
                            try {
                                const amountValue = toBigInt(arg.value);
                                if (amountValue > 1000000000000000n) {
                                    const tokenInfo = getTokenInfo(event.address);
                                    return {
                                        amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                                        unit: tokenInfo.symbol,
                                        unifiedEth: '-'
                                    };
                                }
                            } catch (e) {
                                continue;
                            }
                        }
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
    try {
        const bi = toBigInt(amount);
        return formatUnitsBigInt(bi, decimals, 6);
    } catch  {
        try {
            return amount.toString();
        } catch  {
            return '-';
        }
    }
}
function calculateAmount(tx) {
    const info = extractAmountInfo(tx);
    return info.amount === '-' ? '-' : `${info.amount} ${info.unit}`;
}
function calculateUnifiedEth(tx) {
    const info = extractAmountInfo(tx);
    return info.unifiedEth || '-';
}
}),
"[project]/src/app/components/Opportunities.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Opportunities
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-ssr] (ecmascript)");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtils.ts [app-ssr] (ecmascript)");
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
function Opportunities() {
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFilters"])();
    // Get opportunities and enrich with full transaction data from live
    const liveTxs = snapshot?.live || [];
    const enrichedOpportunities = snapshot?.opportunities?.map((opp)=>{
        const fullTx = liveTxs.find((tx)=>tx.hash === opp.hash);
        return {
            ...opp,
            ...fullTx
        };
    }) || [];
    const rows = filters.applyFilters(enrichedOpportunities);
    const columns = [
        {
            key: 'rank',
            header: 'Rank',
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "inline-flex items-center justify-center w-8 h-8 bg-yellow-500 text-black text-xs font-bold rounded-full",
                    children: value
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
            className: 'w-16'
        },
        {
            key: 'hash',
            header: 'Hash',
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-mono text-green-400 hover:text-green-300 cursor-pointer",
                    children: short(value, 12)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this),
            className: 'font-mono'
        },
        {
            key: 'from',
            header: 'From',
            render: (value)=>short(value || '', 10),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'to',
            header: 'To',
            render: (value)=>short(value || '', 10),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'category_key',
            header: 'Type',
            render: (value)=>value || '-'
        },
        {
            key: 'category_key',
            header: 'Protocol',
            render: (value)=>getProtocolDisplay(value)
        },
        {
            key: '_decoded_fn',
            header: 'Function',
            render: (value)=>value?.function || '-',
            className: 'text-cyan-400'
        },
        {
            key: '_decoded_events',
            header: 'Events',
            render: (_, row)=>summarizeEvents(row),
            className: 'text-blue-400'
        },
        {
            key: 'value',
            header: 'Unified(ETH)',
            render: (_, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateUnifiedEth"])(row),
            className: 'text-green-400 font-medium'
        },
        {
            key: 'value',
            header: 'Amount',
            render: (_, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateAmount"])(row),
            className: 'text-green-400 font-medium'
        },
        {
            key: 'maxFeePerGas',
            header: 'Gas',
            render: (value, row)=>`${fmtGwei(value || row.gasPrice)}g`,
            className: 'text-yellow-400'
        },
        {
            key: '_first_seen_ts',
            header: 'Age',
            render: (value)=>fmtAge(value),
            className: 'text-purple-400'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-amber-400 text-[9px]",
                                children: "🏆"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Opportunities.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
                                children: "OPPORTUNITIES"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Opportunities.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this),
                            rows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-1 py-0.5 bg-amber-900 text-amber-300 text-[7px] font-mono border border-amber-700",
                                children: [
                                    rows.length,
                                    " FOUND"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Opportunities.tsx",
                                lineNumber: 162,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Opportunities.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-1.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    data: rows,
                    columns: columns,
                    emptyMessage: "[NO OPPORTUNITIES DETECTED • TRANSACTIONS NEED HIGH VALUE OR GAS TO QUALIFY]",
                    density: "compact"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Opportunities.tsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Opportunities.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Opportunities.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/Live.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Live
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-ssr] (ecmascript)");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtils.ts [app-ssr] (ecmascript)");
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
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFilters"])();
    const rows = filters.applyFilters(snapshot?.live || []);
    // Calculate pending transactions (not yet included)
    const pendingCount = rows.length;
    const gasGaugedCount = rows.filter((tx)=>tx._decoded_fn?.confidence > 0).length;
    const columns = [
        {
            key: '_first_seen_ts',
            header: 'Time',
            render: (value)=>value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
            className: 'text-gray-500'
        },
        {
            key: 'hash',
            header: 'Hash',
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-mono text-green-400 hover:text-green-300 cursor-pointer",
                    children: short(value, 12)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Live.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
            className: 'font-mono'
        },
        {
            key: 'from',
            header: 'From',
            render: (value)=>short(value || '', 10),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'to',
            header: 'To',
            render: (value)=>short(value || '', 10),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'category_key',
            header: 'Type',
            render: (value)=>value || '-'
        },
        {
            key: 'category_key',
            header: 'Protocol',
            render: (value)=>getProtocolDisplay(value)
        },
        {
            key: '_decoded_fn',
            header: 'Function',
            render: (value)=>value?.function || '-',
            className: 'text-cyan-400'
        },
        {
            key: '_decoded_events',
            header: 'Events',
            render: (_, row)=>summarizeEvents(row),
            className: 'text-blue-400'
        },
        {
            key: 'value',
            header: 'Amount',
            render: (_, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateAmount"])(row),
            className: 'text-green-400 font-medium'
        },
        {
            key: 'maxFeePerGas',
            header: 'Gas',
            render: (value, row)=>`${fmtGwei(value || row.gasPrice)}g`,
            className: 'text-yellow-400'
        },
        {
            key: '_first_seen_ts',
            header: 'Age',
            render: (value)=>fmtAge(value),
            className: 'text-purple-400'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-[9px]",
                                    children: "⚡"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Live.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
                                    children: "LIVE TRANSACTIONS"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Live.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700",
                                    children: [
                                        pendingCount,
                                        " PENDING"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Live.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Live.tsx",
                            lineNumber: 140,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-0.5 h-0.5 rounded-full ${gasGaugedCount > 0 ? 'bg-sky-500' : 'bg-gray-700'}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Live.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `font-mono text-[7px] tracking-widest ${gasGaugedCount > 0 ? 'text-sky-400' : 'text-gray-600'}`,
                                        children: [
                                            gasGaugedCount,
                                            "/",
                                            pendingCount,
                                            " GASSED"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Live.tsx",
                                        lineNumber: 152,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Live.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Live.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Live.tsx",
                    lineNumber: 139,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Live.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-1.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    data: rows,
                    columns: columns,
                    emptyMessage: "[WAITING FOR LIVE TRANSACTION DATA...]",
                    density: "compact"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Live.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Live.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Live.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/Included.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Included
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useWsSnapshot.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Table.tsx [app-ssr] (ecmascript)");
// Import shared amount decoding utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/utils/amountUtils.ts [app-ssr] (ecmascript)");
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
    const { snapshot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useWsSnapshot$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWsSnapshot"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFilters"])();
    const rows = filters.applyFilters(snapshot?.included || []);
    const columns = [
        {
            key: '_inclusion_ts',
            header: 'Time',
            render: (value)=>value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
            className: 'text-gray-500'
        },
        {
            key: 'hash',
            header: 'Hash',
            render: (value)=>short(value, 16),
            className: 'font-mono text-green-400'
        },
        {
            key: 'from',
            header: 'From',
            render: (value)=>short(value || '', 14),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'to',
            header: 'To',
            render: (value)=>short(value || '', 14),
            className: 'font-mono text-gray-500'
        },
        {
            key: 'value',
            header: 'Amount',
            render: (_, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$utils$2f$amountUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateAmount"])(row),
            className: 'text-green-400 font-medium'
        },
        {
            key: 'category_key',
            header: 'Protocol',
            render: (value)=>getProtocolDisplay(value)
        },
        {
            key: '_decoded_fn',
            header: 'Function',
            render: (value)=>value?.function || '-',
            className: 'text-cyan-400'
        },
        {
            key: '_decoded_events',
            header: 'Events',
            render: (_, row)=>summarizeEvents(row),
            className: 'text-blue-400'
        },
        {
            key: 'blockNumber',
            header: 'Block',
            render: (_, row)=>hexToNum(row.blockNumber) || hexToNum(row._receipt?.blockNumber) || hexToNum(row._inclusion_block) || '-'
        },
        {
            key: 'transactionIndex',
            header: 'TxIdx',
            render: (_, row)=>hexToNum(row.transactionIndex) || hexToNum(row._receipt?.transactionIndex) || '-'
        },
        {
            key: 'nonce',
            header: 'Nonce',
            render: (value)=>hexToNum(value) || '-'
        },
        {
            key: '_receipt',
            header: 'Status',
            render: (value)=>fmtStatus(value)
        },
        {
            key: '_first_seen_ts',
            header: 'Delay',
            render: (_, row)=>fmtDelay(row._first_seen_ts, row._inclusion_ts)
        },
        {
            key: '_confirmation_depth',
            header: 'Conf',
            render: (value)=>value ?? 0
        },
        {
            key: '_receipt',
            header: 'GasUsed',
            render: (value)=>hexToNum(value?.gasUsed) || '-'
        },
        {
            key: 'gas',
            header: 'GasLimit',
            render: (value)=>hexToNum(value) || '-'
        },
        {
            key: 'gasPrice',
            header: 'GasPrice',
            render: (value)=>fmtHexGwei(value)
        },
        {
            key: 'maxFeePerGas',
            header: 'MaxFee',
            render: (value)=>fmtHexGwei(value)
        },
        {
            key: '_receipt',
            header: 'Fee(ETH)',
            render: (value)=>fmtFeeEth(value)
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-900 border-b border-gray-800 px-1.5 py-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sky-400 text-[9px]",
                                children: "✅"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Included.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-mono text-[9px] uppercase tracking-widest text-gray-300",
                                children: "INCLUDED TRANSACTIONS"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Included.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700",
                                children: [
                                    rows.length,
                                    " COMPLETED"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Included.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/Included.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Included.tsx",
                    lineNumber: 204,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Included.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-1.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    data: rows,
                    columns: columns,
                    emptyMessage: "[NO INCLUDED TRANSACTIONS...]",
                    density: "compact"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Included.tsx",
                    lineNumber: 219,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Included.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Included.tsx",
        lineNumber: 201,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/FilterPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/hooks/useFilters.ts [app-ssr] (ecmascript)");
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
    const f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$hooks$2f$useFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFilters"])();
    const [presetName, setPresetName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Load presets into store state
        f.loadPreset(''); // triggers preset refresh silently
    }, []);
    const hasActiveFilters = f.minEth || f.maxEth || f.minGasGwei || f.maxGasGwei || f.protocols.length > 0 || f.tokenQuery || f.whitelist.length > 0 || f.blacklist.length > 0 || f.timeRangeMin || f.decodedOnly;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass-card border border-slate-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-slate-700/30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setExpanded(!expanded),
                                    className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors font-mono",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: `w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`,
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M19 9l-7 7-7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                lineNumber: 34,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 32,
                                            columnNumber: 15
                                        }, this),
                                        "[FILTERS] ",
                                        hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "terminal-badge live text-xs",
                                            children: [
                                                Object.values(f).filter((v)=>v && (Array.isArray(v) ? v.length > 0 : true)).length,
                                                " ACTIVE"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 37,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, this),
                                hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>f.reset(),
                                    className: "terminal-btn text-xs px-3 py-1",
                                    children: "[CLEAR ALL]"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 43,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "terminal-input text-xs px-3 py-1 bg-slate-800/50",
                                onChange: (e)=>{
                                    if (e.target.value) f.loadPreset(e.target.value);
                                    e.target.value = '';
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "[LOAD PRESET]"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/FilterPanel.tsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, this),
                                    f.presets.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: p.name,
                                            children: p.name
                                        }, p.name, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 60,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/FilterPanel.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "terminal-grid terminal-grid-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 75,
                                            columnNumber: 17
                                        }, this),
                                        "[VALUE RANGE • ETH]"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1 font-mono",
                                                    children: "MIN"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    step: "0.001",
                                                    placeholder: "0.00",
                                                    className: "terminal-input w-full",
                                                    value: f.minEth ?? '',
                                                    onChange: (e)=>f.set({
                                                            minEth: e.target.value === '' ? undefined : Number(e.target.value)
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 81,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 79,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1 font-mono",
                                                    children: "MAX"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    step: "0.001",
                                                    placeholder: "∞",
                                                    className: "terminal-input w-full",
                                                    value: f.maxEth ?? '',
                                                    onChange: (e)=>f.set({
                                                            maxEth: e.target.value === '' ? undefined : Number(e.target.value)
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-sm font-mono font-semibold text-blue-300 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this),
                                        "[GAS RANGE • GWEI]"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1 font-mono",
                                                    children: "MIN"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 112,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    step: "0.1",
                                                    placeholder: "10",
                                                    className: "terminal-input w-full",
                                                    value: f.minGasGwei ?? '',
                                                    onChange: (e)=>f.set({
                                                            minGasGwei: e.target.value === '' ? undefined : Number(e.target.value)
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 113,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 111,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1 font-mono",
                                                    children: "MAX"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    step: "0.1",
                                                    placeholder: "∞",
                                                    className: "terminal-input w-full",
                                                    value: f.maxGasGwei ?? '',
                                                    onChange: (e)=>f.set({
                                                            maxGasGwei: e.target.value === '' ? undefined : Number(e.target.value)
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 124,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 122,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-sm font-mono font-semibold text-purple-300 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this),
                                        "[PROTOCOLS]"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 138,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-1",
                                    children: protocols.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: f.protocols.includes(p),
                                                    onChange: (e)=>{
                                                        const newProtocols = e.target.checked ? [
                                                            ...f.protocols,
                                                            p
                                                        ] : f.protocols.filter((proto)=>proto !== p);
                                                        f.set({
                                                            protocols: newProtocols
                                                        });
                                                    },
                                                    className: "rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 21
                                                }, this),
                                                "[",
                                                p,
                                                "]"
                                            ]
                                        }, p, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 144,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 142,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 137,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-sm font-mono font-semibold text-orange-300 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 166,
                                                    columnNumber: 19
                                                }, this),
                                                "[TIME RANGE]"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 165,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "terminal-input w-full",
                                            value: String(f.timeRangeMin ?? ''),
                                            onChange: (e)=>f.set({
                                                    timeRangeMin: e.target.value === '' ? undefined : Number(e.target.value)
                                                }),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "[ALL TIME]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "1",
                                                    children: "[LAST 1 MINUTE]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "5",
                                                    children: "[LAST 5 MINUTES]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "15",
                                                    children: "[LAST 15 MINUTES]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "60",
                                                    children: "[LAST HOUR]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 178,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 19
                                                }, this),
                                                "[TOKEN SEARCH]"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 183,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Token symbol or address",
                                            className: "terminal-input w-full",
                                            value: f.tokenQuery ?? '',
                                            onChange: (e)=>f.set({
                                                    tokenQuery: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 182,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: f.decodedOnly,
                                            onChange: (e)=>f.set({
                                                    decodedOnly: e.target.checked
                                                }),
                                            className: "rounded border-slate-600 text-green-500 focus:ring-green-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 197,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 bg-green-500 rounded-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 19
                                                }, this),
                                                "[DECODED TRANSACTIONS ONLY]"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 163,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 terminal-grid-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-sm font-mono font-semibold text-emerald-300 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 19
                                                }, this),
                                                "[WHITELIST • ADDRESSES]"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 213,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            placeholder: "0xabc..., 0xdef...",
                                            className: "terminal-input w-full resize-none",
                                            rows: 2,
                                            onChange: (e)=>f.set({
                                                    whitelist: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean)
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 217,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 212,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-sm font-mono font-semibold text-red-300 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 19
                                                }, this),
                                                "[BLACKLIST • ADDRESSES]"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 225,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            placeholder: "0xabc..., 0xdef...",
                                            className: "terminal-input w-full resize-none",
                                            rows: 2,
                                            onChange: (e)=>f.set({
                                                    blacklist: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean)
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 229,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 224,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 211,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "terminal-grid-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "glass-card p-4 border border-slate-700/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-end gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-48",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-mono font-semibold text-yellow-300 mb-2",
                                                    children: "[PRESET MANAGEMENT]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    placeholder: "Enter preset name",
                                                    className: "terminal-input w-full",
                                                    value: presetName,
                                                    onChange: (e)=>setPresetName(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 244,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 242,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "terminal-btn primary",
                                                    onClick: ()=>{
                                                        if (presetName.trim()) f.savePreset(presetName.trim());
                                                    },
                                                    disabled: !presetName.trim(),
                                                    children: "[SAVE]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "terminal-btn",
                                                    onClick: ()=>{
                                                        if (presetName.trim()) f.deletePreset(presetName.trim());
                                                    },
                                                    disabled: !presetName.trim(),
                                                    children: "[DELETE]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                                            lineNumber: 252,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/FilterPanel.tsx",
                                lineNumber: 240,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/FilterPanel.tsx",
                            lineNumber: 239,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/FilterPanel.tsx",
                    lineNumber: 70,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/FilterPanel.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/FilterPanel.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Opportunities$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Opportunities.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Live$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Live.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Included$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Included.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$FilterPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/FilterPanel.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function Home() {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const tabs = [
        {
            id: 'dashboard',
            label: '📊 ANALYTICS TERMINAL',
            component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        },
        {
            id: 'opportunities',
            label: '💎 OPPORTUNITIES',
            component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Opportunities$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        },
        {
            id: 'live',
            label: '🔴 LIVE FEED',
            component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Live$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        },
        {
            id: 'included',
            label: '✅ INCLUDED',
            component: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Included$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        }
    ];
    const ActiveComponent = tabs.find((tab)=>tab.id === activeTab)?.component || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "bg-black border-b border-gray-800 px-2 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-emerald-400 font-mono text-[10px] font-bold tracking-wider",
                                        children: "Ξ ETHEREUM TERMINAL v3.0.0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 31,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-700 font-mono text-[8px] tracking-wide",
                                        children: "BLOOMBERG-STYLE ANALYTICS"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1 h-1 bg-emerald-600 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 42,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-emerald-400 font-mono text-[8px] tracking-wide",
                                                children: "LIVE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 43,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 41,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1 h-1 bg-sky-600 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 46,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sky-400 font-mono text-[8px] tracking-wide",
                                                children: "SYNC"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 47,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 45,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-600 font-mono text-[8px] tracking-wide",
                                        children: new Date().toLocaleTimeString('en-US', {
                                            hour12: false
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 28,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "bg-black border-b border-gray-800 px-2 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab(tab.id),
                                className: `font-mono text-[9px] px-2 py-1 border-b transition-colors tracking-wider ${activeTab === tab.id ? 'text-emerald-400 border-emerald-500 bg-gray-900' : 'text-gray-600 border-transparent hover:text-gray-400 hover:border-gray-700'}`,
                                children: tab.label
                            }, tab.id, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 57,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-3 py-1 bg-black border-b border-gray-800",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$FilterPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 76,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "flex-1 px-3 py-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-black border border-gray-800",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-y-auto",
                            style: {
                                maxHeight: 'calc(100vh - 200px)',
                                minHeight: '600px'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActiveComponent, {}, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 81,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "bg-black border-t border-gray-800 px-2 py-0.5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1 h-1 bg-emerald-600 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 94,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-emerald-400 font-mono text-[8px] tracking-widest",
                                                children: "WS SUB"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 95,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1 h-1 bg-sky-600 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 98,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sky-400 font-mono text-[8px] tracking-widest",
                                                children: "SYNC"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 99,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1 h-1 bg-gray-700 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 102,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-600 font-mono text-[8px] tracking-widest",
                                                children: "NO ERR"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 103,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-700 font-mono text-[7px] tracking-widest",
                                children: "BLOOMBERG TERMINAL v3.0.0"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 90,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__793b07da._.js.map