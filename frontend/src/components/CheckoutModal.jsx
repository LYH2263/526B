import React, { useState } from 'react';
import request from '../api/request';

const CheckoutModal = ({ isOpen, onClose, user, cartItems, totalAmount, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !cartItems || cartItems.length === 0) return null;

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const data = await request.post('/orders/place', { userId: user.id });
            onClose();
            onSuccess && onSuccess(data);
        } catch (e) {
            alert(e.message || '下单失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={submitting ? undefined : onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        确认订单
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            下单时将锁定当前价格，价格变动不影响本订单
                        </div>
                    </div>

                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.bookId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                    {(item.bookTitle || '?').charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 text-sm truncate">{item.bookTitle}</h4>
                                    <p className="text-xs text-gray-400">{item.bookAuthor}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-emerald-600 font-semibold text-sm">¥{Number(item.price).toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">× {item.quantity}</div>
                                </div>
                                <div className="text-right flex-shrink-0 w-20">
                                    <div className="text-blue-600 font-bold">¥{(Number(item.price) * item.quantity).toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">商品种类</span>
                            <span className="text-gray-700 font-medium">{cartItems.length} 种</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">商品总数</span>
                            <span className="text-gray-700 font-medium">{cartItems.reduce((s, i) => s + i.quantity, 0)} 件</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-gray-200">
                            <span className="text-gray-700 font-semibold">应付总额</span>
                            <span className="text-2xl font-bold text-red-500">¥{Number(totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {submitting ? '提交中...' : '提交订单'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
