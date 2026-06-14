import React, { useEffect, useState } from 'react';
import request from '../api/request';

const CartDrawer = ({ isOpen, onClose, user, onCheckout, onRefreshCount }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await request.get(`/cart?userId=${user.id}`);
            setCartItems(data.items || []);
            setTotalAmount(parseFloat(data.totalAmount || 0));
            if (onRefreshCount) onRefreshCount(data.totalCount || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchCart();
        }
    }, [isOpen, user]);

    const updateQuantity = async (bookId, newQty) => {
        try {
            await request.put('/cart/update', { userId: user.id, bookId, quantity: newQty });
            fetchCart();
        } catch (e) {
            alert(e.message || '操作失败');
        }
    };

    const removeItem = async (bookId) => {
        if (!confirm('确定要删除该商品吗？')) return;
        try {
            await request.delete(`/cart/remove?userId=${user.id}&bookId=${bookId}`);
            fetchCart();
        } catch (e) {
            alert(e.message || '删除失败');
        }
    };

    const clearCart = async () => {
        if (cartItems.length === 0) return;
        if (!confirm('确定要清空购物车吗？')) return;
        try {
            await request.delete(`/cart/clear?userId=${user.id}`);
            fetchCart();
        } catch (e) {
            alert(e.message || '清空失败');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('购物车为空，无法结算');
            return;
        }
        onCheckout && onCheckout(cartItems, totalAmount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            购物车
                            {cartItems.length > 0 && (
                                <span className="text-sm font-normal text-gray-500">({cartItems.length}种商品)</span>
                            )}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <svg className="w-20 h-20 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm">购物车空空如也</p>
                            <p className="text-xs mt-1">快去添加喜欢的图书吧~</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {cartItems.map((item) => (
                                <div key={item.bookId} className="p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex gap-3">
                                        <div className="h-16 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                                            {(item.bookTitle || '?').charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{item.bookTitle}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.bookAuthor}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-emerald-600 font-bold">¥{Number(item.price).toFixed(2)}</span>
                                                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-sm text-gray-500">
                                                    小计: <span className="text-blue-600 font-semibold">¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.bookId)}
                                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-3">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={clearCart}
                            disabled={cartItems.length === 0}
                            className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            清空购物车
                        </button>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">共 {cartItems.reduce((s, i) => s + i.quantity, 0)} 件商品</div>
                            <div className="text-lg font-bold text-gray-800">
                                合计: <span className="text-red-500">¥{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                    >
                        去结算
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
