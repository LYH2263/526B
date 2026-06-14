import React from 'react';

const OrderSuccessModal = ({ isOpen, onClose, orderResult, onViewOrders }) => {
    if (!isOpen || !orderResult) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-bounce-in">
                <div className="px-6 py-8 text-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">下单成功！</h2>
                    <p className="text-gray-500 text-sm">感谢您的购买，订单已创建</p>
                </div>

                <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 text-sm">订单号</span>
                        <span className="font-mono text-gray-800 font-semibold text-sm">{orderResult.orderNo}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                        <span className="text-gray-600">支付金额</span>
                        <span className="text-xl font-bold text-red-500">¥{Number(orderResult.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                        <span className="text-gray-600 text-sm">订单状态</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">已创建</span>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                        继续购物
                    </button>
                    <button
                        onClick={onViewOrders}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                        查看订单
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessModal;
