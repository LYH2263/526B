import React, { useState, useEffect } from 'react';
import { getMyBooklists, createBooklist, updateBooklist, deleteBooklist, generateShareLink } from '../api/booklist';

const BooklistFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        coverUrl: '',
        isPublic: false
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                coverUrl: initialData.coverUrl || '',
                isPublic: initialData.isPublic || false
            });
        } else if (isOpen) {
            setFormData({ name: '', description: '', coverUrl: '', isPublic: false });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                        {mode === 'create' ? '创建书单' : '编辑书单'}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">书单名称 *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入书单名称"
                            maxLength={50}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">简介</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="简单介绍这个书单"
                            rows={3}
                            maxLength={500}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片URL</label>
                        <input
                            type="text"
                            value={formData.coverUrl}
                            onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="可选：封面图片链接"
                        />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700 flex-1">
                            <span className="font-medium">设为公开</span>
                            <span className="text-gray-400 ml-1">（公开后可生成分享链接）</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            {mode === 'create' ? '创建' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, booklistName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
                    <p className="text-gray-500 text-sm">
                        确定要删除书单 <span className="font-medium text-gray-700">"{booklistName}"</span> 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                    >
                        删除
                    </button>
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
                                copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {copied ? '已复制' : '复制'}
                        </button>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                        <div className="text-xs text-blue-600 flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>分享链接包含随机Token，无法被枚举猜测。若设为私有，链接将自动失效。</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyBooklists = ({ user, onViewDetail, onViewShare }) => {
    const [booklists, setBooklists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formModal, setFormModal] = useState({ isOpen: false, mode: 'create', data: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [shareModal, setShareModal] = useState({ isOpen: false, url: '', name: '' });

    const fetchBooklists = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getMyBooklists(user.id);
            setBooklists(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooklists();
    }, [user]);

    const handleCreate = async (formData) => {
        try {
            await createBooklist({ ...formData, userId: user.id });
            setFormModal({ isOpen: false, mode: 'create', data: null });
            fetchBooklists();
        } catch (e) {
            alert(e.message || '创建失败');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateBooklist({ ...formData, id: formModal.data.id }, user.id);
            setFormModal({ isOpen: false, mode: 'create', data: null });
            fetchBooklists();
        } catch (e) {
            alert(e.message || '更新失败');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBooklist(deleteModal.id, user.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            fetchBooklists();
        } catch (e) {
            alert(e.message || '删除失败');
        }
    };

    const handleShare = async (booklist) => {
        try {
            const token = await generateShareLink(booklist.id, user.id);
            const url = `${window.location.origin}/#/share/${token}`;
            setShareModal({ isOpen: true, url, name: booklist.name });
        } catch (e) {
            alert(e.message || '生成分享链接失败');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getCoverStyle = (booklist) => {
        if (booklist.coverUrl) {
            return { backgroundImage: `url(${booklist.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-orange-500 to-pink-500',
            'from-rose-500 to-red-500',
            'from-amber-500 to-yellow-500'
        ];
        const color = colors[booklist.id % colors.length];
        return {};
    };

    const getCoverClass = (booklist) => {
        if (booklist.coverUrl) return '';
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-orange-500 to-pink-500',
            'from-rose-500 to-red-500',
            'from-amber-500 to-yellow-500'
        ];
        return `bg-gradient-to-br ${colors[(booklist.id || 0) % colors.length]}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">我的书单</h2>
                    <p className="text-gray-500 text-sm mt-1">创建和管理你的主题书单合集</p>
                </div>
                <button
                    onClick={() => setFormModal({ isOpen: true, mode: 'create', data: null })}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    创建书单
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : booklists.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">还没有书单</h3>
                    <p className="text-gray-500 mt-1">创建你的第一个主题书单吧</p>
                    <button
                        onClick={() => setFormModal({ isOpen: true, mode: 'create', data: null })}
                        className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        创建书单
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {booklists.map((booklist) => (
                        <div
                            key={booklist.id}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                        >
                            <div
                                className={`relative h-36 ${getCoverClass(booklist)} flex items-center justify-center cursor-pointer`}
                                style={getCoverStyle(booklist)}
                                onClick={() => onViewDetail(booklist)}
                            >
                                <span className="text-white text-4xl font-bold opacity-80">
                                    {(booklist.name || '?').charAt(0)}
                                </span>
                                {booklist.isPublic && (
                                    <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-green-600 rounded-full flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        公开
                                    </span>
                                )}
                                {!booklist.isPublic && (
                                    <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-gray-600 rounded-full flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        私有
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <div
                                    className="font-bold text-gray-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => onViewDetail(booklist)}
                                >
                                    {booklist.name}
                                </div>
                                <div className="text-xs text-gray-400 mt-1 line-clamp-2 h-8">
                                    {booklist.description || '暂无简介'}
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                    <span className="text-xs text-gray-400">
                                        {booklist.bookCount || 0} 本 · {formatDate(booklist.updatedAt)}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleShare(booklist)}
                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="分享"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setFormModal({ isOpen: true, mode: 'edit', data: booklist })}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="编辑"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, id: booklist.id, name: booklist.name })}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="删除"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BooklistFormModal
                isOpen={formModal.isOpen}
                onClose={() => setFormModal({ isOpen: false, mode: 'create', data: null })}
                onSubmit={formModal.mode === 'create' ? handleCreate : handleUpdate}
                initialData={formModal.data}
                mode={formModal.mode}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                booklistName={deleteModal.name}
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

export default MyBooklists;
