import React, { useState, useEffect } from 'react';
import request from '../api/request';

const STATUS_TEXT = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    STOCKED: '已入库'
};

const STATUS_COLOR = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', border: 'border-yellow-200' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', border: 'border-green-200' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', border: 'border-red-200' },
    STOCKED: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', border: 'border-blue-200' }
};

const STATUS_ORDER = ['PENDING', 'APPROVED', 'REJECTED', 'STOCKED'];

const PurchaseRequestDetail = ({ isOpen, onClose, recordId }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && recordId) {
            fetchDetail();
        }
    }, [isOpen, recordId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await request.get(`/purchase-requests/${recordId}`);
            setDetail(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        return d.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'APPROVED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'REJECTED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'STOCKED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-800">采购申请详情</h3>
                            {detail && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[detail.status]?.bg} ${STATUS_COLOR[detail.status]?.text} ${STATUS_COLOR[detail.status]?.border}`}>
                                    {getStatusIcon(detail.status)}
                                    {STATUS_TEXT[detail.status]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">申请单号 #{recordId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {loading ? (
                        <div className="text-center py-16">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <p className="mt-4 text-gray-500">加载中...</p>
                        </div>
                    ) : detail ? (
                        <>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    图书信息
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">书名</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{detail.bookTitle}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">作者</p>
                                        <p className="text-lg font-semibold text-gray-700 mt-1">{detail.bookAuthor}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">预估单价</p>
                                        <p className="text-lg font-semibold text-emerald-600 mt-1">¥{Number(detail.estimatedPrice).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">采购数量</p>
                                        <p className="text-lg font-semibold text-gray-700 mt-1">× {detail.quantity}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">预估总金额</span>
                                    <span className="text-2xl font-extrabold text-blue-600">¥{(Number(detail.estimatedPrice) * detail.quantity).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    采购理由
                                </h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.purchaseReason}</p>
                            </div>

                            {detail.rejectReason && (
                                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                                    <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        驳回理由
                                    </h4>
                                    <p className="text-red-700 leading-relaxed whitespace-pre-wrap">{detail.rejectReason}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">申请人</p>
                                    </div>
                                    <p className="font-bold text-gray-800">{detail.applicantName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(detail.createdAt)}</p>
                                </div>
                                {detail.approverName && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">审批人</p>
                                        </div>
                                        <p className="font-bold text-gray-800">{detail.approverName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatDateTime(detail.approvedAt || detail.rejectedAt)}
                                        </p>
                                    </div>
                                )}
                                {detail.stockerName && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">入库人</p>
                                        </div>
                                        <p className="font-bold text-gray-800">{detail.stockerName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(detail.stockedAt)}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    状态流转时间线
                                </h4>
                                <div className="relative pl-8 space-y-6">
                                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-yellow-300 via-green-300 to-blue-300 rounded-full"></div>
                                    {detail.logs && detail.logs.map((log, index) => {
                                        const isCurrent = index === detail.logs.length - 1;
                                        const color = STATUS_COLOR[log.toStatus] || STATUS_COLOR.PENDING;
                                        return (
                                            <div key={log.id} className="relative">
                                                <div className={`absolute -left-8 w-6 h-6 rounded-full ${color.dot} flex items-center justify-center shadow-lg ${isCurrent ? 'ring-4 ring-offset-2 ring-gray-200 scale-110' : ''}`}>
                                                    <span className="text-white w-3 h-3 flex items-center justify-center">
                                                        {getStatusIcon(log.toStatus)}
                                                    </span>
                                                </div>
                                                <div className={`${isCurrent ? 'bg-white shadow-lg border-2' : 'bg-gray-50 border'} ${color.border} rounded-xl p-4 transition-all`}>
                                                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
                                                                {STATUS_TEXT[log.toStatus]}
                                                            </span>
                                                            {isCurrent && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-pulse">
                                                                    当前状态
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-mono">{formatDateTime(log.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {log.operatorName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-700">{log.operatorName}</span>
                                                        {log.fromStatus && (
                                                            <span className="text-gray-400">
                                                                {STATUS_TEXT[log.fromStatus]} → {STATUS_TEXT[log.toStatus]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {log.remark && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-sm text-gray-600 leading-relaxed">{log.remark}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16 text-gray-500">未找到详情数据</div>
                    )}
                </div>

                <div className="px-8 py-5 border-t border-gray-100 flex justify-end bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseRequestDetail;
