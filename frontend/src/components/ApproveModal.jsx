import React, { useState } from 'react';
import request from '../api/request';

const STATUS_TEXT = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    STOCKED: '已入库'
};

const STATUS_COLOR = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    STOCKED: 'bg-blue-100 text-blue-800 border-blue-200'
};

const ApproveModal = ({ isOpen, onClose, onSuccess, record, actionType, user }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setRejectReason('');
        setError('');
        onClose();
    };

    const getActionConfig = () => {
        switch (actionType) {
            case 'approve':
                return {
                    title: '审批通过',
                    subtitle: '确认通过此采购申请？通过后将可标记入库。',
                    buttonText: '确认通过',
                    buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl shadow-green-500/30',
                    iconColor: 'text-green-500',
                    iconBg: 'bg-green-100'
                };
            case 'reject':
                return {
                    title: '驳回申请',
                    subtitle: '请填写驳回理由，便于申请人了解原因。',
                    buttonText: '确认驳回',
                    buttonClass: 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-xl shadow-red-500/30',
                    iconColor: 'text-red-500',
                    iconBg: 'bg-red-100'
                };
            case 'stock':
                return {
                    title: '标记入库',
                    subtitle: '确认该图书已入库？入库后将自动添加到图书列表。',
                    buttonText: '确认入库',
                    buttonClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl shadow-blue-500/30',
                    iconColor: 'text-blue-500',
                    iconBg: 'bg-blue-100'
                };
            default:
                return {};
        }
    };

    const config = getActionConfig();

    const handleSubmit = async () => {
        setError('');
        if (actionType === 'reject' && !rejectReason.trim()) {
            setError('请填写驳回理由');
            return;
        }

        setLoading(true);
        try {
            if (actionType === 'approve') {
                await request.post('/purchase-requests/approve', {
                    id: record.id,
                    approverId: user.id
                });
            } else if (actionType === 'reject') {
                await request.post('/purchase-requests/reject', {
                    id: record.id,
                    approverId: user.id,
                    rejectReason: rejectReason.trim()
                });
            } else if (actionType === 'stock') {
                await request.post('/purchase-requests/stock', {
                    id: record.id,
                    stockerId: user.id
                });
            }
            handleClose();
            onSuccess && onSuccess();
        } catch (e) {
            setError(e.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className={`${config.iconBg} rounded-2xl p-3 flex-shrink-0`}>
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {actionType === 'approve' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                )}
                                {actionType === 'reject' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                )}
                                {actionType === 'stock' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                )}
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">{config.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">申请单号</p>
                                <p className="text-sm font-mono font-semibold text-gray-800 mt-0.5">#{record.id}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[record.status]}`}>
                                {STATUS_TEXT[record.status]}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <p className="font-semibold text-gray-900">{record.bookTitle}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{record.bookAuthor} 著</p>
                        </div>
                        <div className="flex gap-6 text-sm">
                            <div>
                                <span className="text-gray-400">单价：</span>
                                <span className="font-semibold text-gray-700">¥{Number(record.estimatedPrice).toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">数量：</span>
                                <span className="font-semibold text-gray-700">× {record.quantity}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">总计：</span>
                                <span className="font-bold text-blue-600">¥{(Number(record.estimatedPrice) * record.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {actionType === 'reject' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                驳回理由 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white resize-none ${
                                    error ? 'border-red-300' : 'border-gray-200'
                                }`}
                                placeholder="请详细说明驳回原因..."
                                value={rejectReason}
                                onChange={(e) => {
                                    setRejectReason(e.target.value);
                                    if (error) setError('');
                                }}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-3 text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : config.buttonClass
                        }`}
                    >
                        {loading ? '处理中...' : config.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveModal;
