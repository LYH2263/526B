import React, { useState, useEffect } from 'react';
import request from '../api/request';
import ImageUploader from './ImageUploader';

const BookModal = ({ isOpen, onClose, onSuccess, bookToEdit, user }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        publishDate: '',
        description: '',
        coverUrl: '',
        coverThumbList: '',
        coverThumbDetail: '',
        changeReason: ''
    });

    const [coverImage, setCoverImage] = useState(null);
    const [originalPrice, setOriginalPrice] = useState(null);

    useEffect(() => {
        if (bookToEdit) {
            setFormData({
                ...bookToEdit,
                changeReason: ''
            });
            setOriginalPrice(bookToEdit.price);
            if (bookToEdit.coverUrl) {
                setCoverImage({
                    originalUrl: bookToEdit.coverUrl,
                    thumbListUrl: bookToEdit.coverThumbList,
                    thumbDetailUrl: bookToEdit.coverThumbDetail
                });
            } else {
                setCoverImage(null);
            }
        } else {
            setFormData({
                title: '',
                author: '',
                price: '',
                publishDate: '',
                description: '',
                coverUrl: '',
                coverThumbList: '',
                coverThumbDetail: '',
                changeReason: ''
            });
            setOriginalPrice(null);
            setCoverImage(null);
        }
    }, [bookToEdit, isOpen]);

    const handleCoverChange = (result) => {
        if (result) {
            setCoverImage(result);
            setFormData({
                ...formData,
                coverUrl: result.originalUrl,
                coverThumbList: result.thumbListUrl,
                coverThumbDetail: result.thumbDetailUrl
            });
        } else {
            setCoverImage(null);
            setFormData({
                ...formData,
                coverUrl: '',
                coverThumbList: '',
                coverThumbDetail: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                modifierName: user?.username || '未知'
            };
            if (bookToEdit?.id) {
                await request.put('/books', submitData);
            } else {
                await request.post('/books', submitData);
            }
            onSuccess();
            onClose();
        } catch (error) {
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {bookToEdit ? '编辑图书' : '新增图书'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">图书封面</label>
                            <ImageUploader
                                value={coverImage}
                                onChange={handleCoverChange}
                                maxSizeMB={10}
                                quality={0.8}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">书名</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="填写图书名称"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">作者</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="填写作者名字"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">价格 (¥)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">出版日期</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">简介</label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                            rows="4"
                            placeholder="请输入内容简介..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {bookToEdit && originalPrice !== null && Number(formData.price) !== Number(originalPrice) && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-amber-800">检测到价格变更</span>
                                <span className="text-xs text-amber-600">
                                    ¥{Number(originalPrice).toFixed(2)} → ¥{Number(formData.price || 0).toFixed(2)}
                                </span>
                            </div>
                            <label className="block text-sm font-medium text-amber-800 mb-1.5">变更原因（可选）</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                placeholder="请输入价格变更原因，例如：促销调整、成本上涨等"
                                value={formData.changeReason}
                                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
                            />
                        </div>
                    )}
                    
                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
                        >
                            保 存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookModal;
