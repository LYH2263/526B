import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import request from '../api/request';

const ContinueReading = forwardRef(({ user, onReadBook }, ref) => {
    const [readingList, setReadingList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReadingList = async () => {
        if (!user) return;
        try {
            const data = await request.get(`/reading-progress/my-reading?userId=${user.id}`);
            setReadingList(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadingList();
    }, [user]);

    const refresh = () => {
        fetchReadingList();
    };

    useImperativeHandle(ref, () => ({
        refresh
    }));

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (readingList.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl border border-indigo-400/30 p-6 mb-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">继续阅读</h3>
                            <p className="text-indigo-200 text-sm">上次未读完的书籍</p>
                        </div>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                        {readingList.length} 本在读
                    </span>
                </div>

                <div className="grid gap-3">
                    {readingList.slice(0, 3).map((item) => (
                        <div 
                            key={item.id}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer group border border-white/10 hover:border-white/30"
                            onClick={() => onReadBook && onReadBook(item)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {item.bookTitle.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-white truncate group-hover:text-amber-200 transition-colors">
                                                {item.bookTitle}
                                            </h4>
                                            <p className="text-indigo-200 text-sm truncate">{item.bookAuthor}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-amber-300 font-bold text-lg">
                                                {Number(item.progressPercent).toFixed(1)}%
                                            </span>
                                            <p className="text-indigo-200 text-xs mt-0.5">
                                                {item.lastReadTimeStr || '刚刚'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                                                style={{ width: `${item.progressPercent}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-xs text-indigo-200">
                                            <span>第 {item.currentPage} 页</span>
                                            <span>共 {item.totalPages} 页</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center h-14 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {readingList.length > 3 && (
                    <div className="mt-4 text-center">
                        <span className="text-indigo-200 text-sm">还有 {readingList.length - 3} 本书在读</span>
                    </div>
                )}
            </div>
        </div>
    );
});

ContinueReading.displayName = 'ContinueReading';

export default ContinueReading;
