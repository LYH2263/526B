import React, { useState, useEffect } from 'react';
import request from '../api/request';

const OrderList = ({ user, onBack }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await request.get(`/orders?userId=${user.id}`);
            setOrders(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 1: return 'bg-blue-100 text-blue-700';
            case 2: return 'bg-emerald-100 text-emerald-700';
            case 3: return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">我的订单</h2>
                        <p className="text-gray-500 text-sm mt-1">查看所有历史订单与明细</p>
                    </div>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    刷新
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">暂无订单</h3>
                    <p className="text-gray-500 mt-1">快去选购喜欢的图书吧</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const isExpanded = expandedId === order.id;
                        const itemCount = order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0;
                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl"
                            >
                                <div
                                    className="px-6 py-5 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:from-blue-50/30"
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 rounded-xl p-2.5">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-mono text-sm font-semibold text-gray-800">{order.orderNo}</div>
                                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                                                <span>{formatDate(order.createdAt)}</span>
                                                <span>共 {itemCount} 件商品</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                                            {order.statusText}
                                        </span>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">订单总额</div>
                                            <div className="text-xl font-bold text-red-500">¥{Number(order.totalAmount).toFixed(2)}</div>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {isExpanded && order.items && (
                                    <div className="p-6 bg-gray-50/30">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">商品明细</div>
                                        <div className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100">
                                                    <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                        {(item.bookTitle || '?').charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-800 text-sm truncate">{item.bookTitle}</div>
                                                        <div className="text-xs text-gray-400">{item.bookAuthor}</div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-emerald-600 font-semibold text-sm">¥{Number(item.price).toFixed(2)}</div>
                                                        <div className="text-xs text-gray-400">× {item.quantity}</div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 w-24">
                                                        <div className="text-blue-600 font-bold">¥{Number(item.subtotal).toFixed(2)}</div>
                                                        <div className="text-[10px] text-gray-400">(快照价)</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-end">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">
                                                    实付: <span className="text-lg font-bold text-red-500 ml-2">¥{Number(order.totalAmount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderList;
