import React, { useState, useEffect } from 'react';
import { getBooklistByShareToken } from '../api/booklist';

const BooklistShare = ({ shareToken }) => {
    const [booklist, setBooklist] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetail = async () => {
        if (!shareToken) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getBooklistByShareToken(shareToken);
            setBooklist(data);
            setItems(data.items || []);
        } catch (e) {
            setError(e.message || '书单不存在或已失效');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [shareToken]);

    const getCoverClass = () => {
        if (booklist?.coverUrl) return '';
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-orange-500 to-pink-500',
            'from-rose-500 to-red-500',
            'from-amber-500 to-yellow-500'
        ];
        const hash = (shareToken || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `bg-gradient-to-br ${colors[hash % colors.length]}`;
    };

    const getCoverStyle = () => {
        if (booklist?.coverUrl) {
            return { backgroundImage: `url(${booklist.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        return {};
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !booklist) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">无法访问该书单</h2>
                    <p className="text-gray-500 text-sm">{error || '分享链接无效或书单已设为私有'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur bg-white/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 rounded-lg p-1">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">图书管理系统</span>
                    </div>
                    <span className="text-xs text-gray-400 px-3 py-1 bg-green-50 text-green-600 rounded-full font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        公开分享
                    </span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8">
                    <div
                        className={`h-48 sm:h-56 ${getCoverClass()} flex items-center justify-center`}
                        style={getCoverStyle()}
                    >
                        {!booklist.coverUrl && (
                            <span className="text-white text-6xl sm:text-7xl font-bold opacity-90 drop-shadow-lg">
                                {(booklist.name || '?').charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">
                            {booklist.name}
                        </h1>
                        {booklist.description && (
                            <p className="text-white/80 text-sm sm:text-base mt-2 line-clamp-2">
                                {booklist.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs sm:text-sm rounded-full font-medium">
                                {items.length} 本图书
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {items.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-gray-500">这个书单还是空的</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors"
                                >
                                    <div className="w-8 text-center text-gray-300 font-bold text-lg flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="h-16 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                                        {(item.title || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                                        <div className="text-sm text-gray-400 mt-0.5 truncate">{item.author}</div>
                                        {item.description && (
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                    {item.price != null && (
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-emerald-600 font-bold">¥{Number(item.price).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        这是一个公开分享的书单 · 仅可查看不可编辑
                    </p>
                </div>
            </main>
        </div>
    );
};

export default BooklistShare;
