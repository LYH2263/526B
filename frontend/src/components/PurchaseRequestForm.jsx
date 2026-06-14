import React, { useState } from 'react';
import request from '../api/request';

const PurchaseRequestForm = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        bookTitle: '',
        bookAuthor: '',
        estimatedPrice: '',
        quantity: 1,
        purchaseReason: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            bookTitle: '',
            bookAuthor: '',
            estimatedPrice: '',
            quantity: 1,
            purchaseReason: ''
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.bookTitle.trim()) newErrors.bookTitle = '书名不能为空';
        if (!formData.bookAuthor.trim()) newErrors.bookAuthor = '作者不能为空';
        if (!formData.estimatedPrice || parseFloat(formData.estimatedPrice) <= 0) {
            newErrors.estimatedPrice = '预估单价必须大于0';
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = '数量必须大于0';
        }
        if (!formData.purchaseReason.trim()) newErrors.purchaseReason = '采购理由不能为空';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await request.post('/purchase-requests', {
                ...formData,
                estimatedPrice: parseFloat(formData.estimatedPrice),
                quantity: parseInt(formData.quantity),
                applicantId: user.id
            });
            handleClose();
            onSuccess && onSuccess();
        } catch (error) {
            alert(error.message || '提交申请失败');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">提交采购申请</h3>
                        <p className="text-sm text-gray-500 mt-1">请填写拟采购图书的详细信息</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                拟采购书名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white ${
                                    errors.bookTitle ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                                }`}
                                placeholder="请输入书名"
                                value={formData.bookTitle}
                                onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                            />
                            {errors.bookTitle && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.bookTitle}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                作者 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white ${
                                    errors.bookAuthor ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                                }`}
                                placeholder="请输入作者"
                                value={formData.bookAuthor}
                                onChange={(e) => setFormData({ ...formData, bookAuthor: e.target.value })}
                            />
                            {errors.bookAuthor && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.bookAuthor}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                预估单价（元） <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">¥</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-9 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white ${
                                        errors.estimatedPrice ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.estimatedPrice}
                                    onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                                />
                            </div>
                            {errors.estimatedPrice && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.estimatedPrice}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                采购数量 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white ${
                                    errors.quantity ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                                }`}
                                placeholder="请输入数量"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.quantity}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            采购理由 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white resize-none ${
                                errors.purchaseReason ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                            }`}
                            placeholder="请说明采购理由，如：读者推荐、馆藏缺口、教学参考等"
                            value={formData.purchaseReason}
                            onChange={(e) => setFormData({ ...formData, purchaseReason: e.target.value })}
                        />
                        {errors.purchaseReason && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.purchaseReason}
                            </p>
                        )}
                    </div>

                    {formData.estimatedPrice && formData.quantity && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">预估总金额</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    ¥{(parseFloat(formData.estimatedPrice) * parseInt(formData.quantity || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </form>

                <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                            submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl shadow-blue-500/30'
                        }`}
                    >
                        {submitting ? '提交中...' : '提交申请'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseRequestForm;
