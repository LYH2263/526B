import React, { useState, useEffect, useMemo } from 'react';
import { getBooklistDetail, addBookToBooklist, removeBookFromBooklist, reorderBooksInBooklist, getAllBooks, generateShareLink } from '../api/booklist';

const AddBookModal = ({ isOpen, onClose, onAdd, existingBookIds }) => {
    const [allBooks, setAllBooks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBooks();
            setSearchKeyword('');
        }
    }, [isOpen]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await getAllBooks();
            setAllBooks(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        return allBooks.filter(book => {
            const notInList = !existingBookIds.includes(book.id);
            if (!keyword) return notInList;
            return notInList && (
                book.title?.toLowerCase().includes(keyword) ||
                book.author?.toLowerCase().includes(keyword)
            );
        });
    }, [allBooks, searchKeyword, existingBookIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">添加图书</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-4 border-b border-gray-50 flex-shrink-0">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="搜索书名或作者..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">
                                {searchKeyword ? '没有找到匹配的图书' : '所有图书都已添加到书单中'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredBooks.map((book) => (
                                <div
                                    key={book.id}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                                >
                                    <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                        {(book.title || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 text-sm truncate">{book.title}</div>
                                        <div className="text-xs text-gray-400">{book.author}</div>
                                    </div>
                                    <button
                                        onClick={() => onAdd(book.id)}
                                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        添加
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShareModal = ({ isOpen, onClose, shareUrl, booklistName }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) setCopied(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">分享书单</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <div className="font-bold text-gray-800">{booklistName}</div>
                        <div className="text-sm text-gray-400 mt-1">他人凭此链接可只读查看</div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-mono truncate">
                            {shareUrl}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                                copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {copied ? '已复制' : '复制'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BooklistDetail = ({ booklistId, user, onBack }) => {
    const [booklist, setBooklist] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [shareModal, setShareModal] = useState({ isOpen: false, url: '', name: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const fetchDetail = async () => {
        if (!booklistId || !user) return;
        setLoading(true);
        try {
            const data = await getBooklistDetail(booklistId, user.id);
            setBooklist(data);
            setItems(data.items || []);
        } catch (e) {
            console.error(e);
            alert(e.message || '加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [booklistId, user]);

    const existingBookIds = useMemo(() => items.map(i => i.bookId), [items]);

    const handleAddBook = async (bookId) => {
        try {
            await addBookToBooklist(booklistId, bookId, user.id);
            fetchDetail();
        } catch (e) {
            alert(e.message || '添加失败');
        }
    };

    const handleRemoveBook = async (bookId) => {
        if (!confirm('确定要从书单中移除这本书吗？')) return;
        try {
            await removeBookFromBooklist(booklistId, bookId, user.id);
            fetchDetail();
        } catch (e) {
            alert(e.message || '移除失败');
        }
    };

    const handleDragStart = (e, item, index) => {
        setDraggedItem({ item, index });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.index === dropIndex) {
            setDraggedItem(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [removed] = newItems.splice(draggedItem.index, 1);
        newItems.splice(dropIndex, 0, removed);
        setItems(newItems);
        setDraggedItem(null);
        setDragOverIndex(null);

        try {
            const bookIds = newItems.map(i => i.bookId);
            await reorderBooksInBooklist(booklistId, bookIds, user.id);
        } catch (e) {
            alert(e.message || '排序保存失败');
            fetchDetail();
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleShare = async () => {
        try {
            const token = await generateShareLink(booklistId, user.id);
            const url = `${window.location.origin}/#/share/${token}`;
            setShareModal({ isOpen: true, url, name: booklist.name });
        } catch (e) {
            alert(e.message || '生成分享链接失败');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!booklist) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">书单不存在或无权限访问</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    返回
                </button>
            </div>
        );
    }

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
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{booklist.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {booklist.isPublic ? (
                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    公开
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    私有
                                </span>
                            )}
                            <span className="text-gray-400 text-sm">{items.length} 本图书</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        分享
                    </button>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        添加图书
                    </button>
                </div>
            </div>

            {booklist.description && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                    <div className="text-sm text-gray-400 mb-1">简介</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{booklist.description}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">书单还是空的</h3>
                        <p className="text-gray-500 mt-1">点击右上角按钮添加图书</p>
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            添加图书
                        </button>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="text-xs text-gray-400 mb-3 px-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            拖拽左侧图标可调整排序
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-move ${
                                        draggedItem?.item.id === item.id
                                            ? 'border-blue-400 bg-blue-50 opacity-50 scale-[0.98]'
                                            : dragOverIndex === index
                                            ? 'border-blue-300 bg-blue-50/50 transform translate-y-1'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="9" cy="6" r="1.5" />
                                            <circle cx="15" cy="6" r="1.5" />
                                            <circle cx="9" cy="12" r="1.5" />
                                            <circle cx="15" cy="12" r="1.5" />
                                            <circle cx="9" cy="18" r="1.5" />
                                            <circle cx="15" cy="18" r="1.5" />
                                        </svg>
                                    </div>
                                    <div className="w-8 text-center text-gray-400 font-medium text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="h-14 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                                        {(item.title || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                                        <div className="text-sm text-gray-400 truncate">{item.author}</div>
                                        {item.price != null && (
                                            <div className="text-xs text-emerald-600 mt-0.5">¥{Number(item.price).toFixed(2)}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBook(item.bookId)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        title="移除"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AddBookModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddBook}
                existingBookIds={existingBookIds}
            />

            <ShareModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ isOpen: false, url: '', name: '' })}
                shareUrl={shareModal.url}
                booklistName={shareModal.name}
            />
        </div>
    );
};

export default BooklistDetail;
