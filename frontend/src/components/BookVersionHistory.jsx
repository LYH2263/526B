import React, { useState, useEffect } from 'react';
import request from '../api/request';

const BookVersionHistory = ({ isOpen, onClose, book, user, onRollbackSuccess }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [diffs, setDiffs] = useState(null);
    const [diffLoading, setDiffLoading] = useState(false);
    const [rollbackConfirm, setRollbackConfirm] = useState(null);
    const [detailVersion, setDetailVersion] = useState(null);

    useEffect(() => {
        if (isOpen && book) {
            fetchVersions();
            setSelectedVersions([]);
            setDiffs(null);
            setDetailVersion(null);
            setRollbackConfirm(null);
        }
    }, [isOpen, book]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const data = await request.get(`/books/${book.id}/versions`);
            setVersions(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleVersionSelect = (versionNumber) => {
        setSelectedVersions(prev => {
            if (prev.includes(versionNumber)) {
                return prev.filter(v => v !== versionNumber);
            }
            if (prev.length >= 2) {
                return [prev[1], versionNumber];
            }
            return [...prev, versionNumber];
        });
        setDiffs(null);
    };

    const handleCompare = async () => {
        if (selectedVersions.length !== 2) return;
        setDiffLoading(true);
        try {
            const [v1, v2] = selectedVersions.sort((a, b) => a - b);
            const data = await request.get(`/books/${book.id}/versions/compare?v1=${v1}&v2=${v2}`);
            setDiffs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setDiffLoading(false);
        }
    };

    const handleViewDetail = async (versionNumber) => {
        if (detailVersion?.versionNumber === versionNumber) {
            setDetailVersion(null);
            return;
        }
        try {
            const data = await request.get(`/books/${book.id}/versions/${versionNumber}`);
            setDetailVersion(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRollback = async (versionNumber) => {
        try {
            await request.post(`/books/${book.id}/versions/${versionNumber}/rollback`, {
                modifierName: user?.username || '未知'
            });
            setRollbackConfirm(null);
            fetchVersions();
            onRollbackSuccess && onRollbackSuccess();
        } catch (e) {
            console.error(e);
            alert(e.message || '回滚失败');
        }
    };

    const getChangeTypeLabel = (type) => {
        switch (type) {
            case 'CREATE': return { text: '新建', color: 'bg-green-100 text-green-700' };
            case 'UPDATE': return { text: '修改', color: 'bg-blue-100 text-blue-700' };
            case 'ROLLBACK': return { text: '回滚', color: 'bg-orange-100 text-orange-700' };
            default: return { text: type, color: 'bg-gray-100 text-gray-700' };
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return dateStr.replace('T', ' ').substring(0, 19);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] transform transition-all scale-100 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">修订历史</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{book?.title} — 共 {versions.length} 个版本</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/2 border-r border-gray-100 overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">版本时间线</h3>
                            <div className="flex items-center gap-2">
                                {selectedVersions.length === 2 && (
                                    <button
                                        onClick={handleCompare}
                                        disabled={diffLoading}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {diffLoading ? '对比中...' : '对比差异'}
                                    </button>
                                )}
                                <span className="text-xs text-gray-400">
                                    {selectedVersions.length > 0 ? `已选 ${selectedVersions.length}/2` : '选择2个版本对比'}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <p>暂无版本记录</p>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {versions.map((v, idx) => {
                                    const typeInfo = getChangeTypeLabel(v.changeType);
                                    const isSelected = selectedVersions.includes(v.versionNumber);
                                    const isLatest = idx === versions.length - 1;
                                    return (
                                        <div key={v.id}>
                                            <div
                                                className={`relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                    isSelected ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => handleVersionSelect(v.versionNumber)}
                                            >
                                                <div className="flex flex-col items-center shrink-0 mt-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        V{v.versionNumber}
                                                    </div>
                                                    {idx < versions.length - 1 && (
                                                        <div className="w-0.5 h-4 bg-gray-200 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${typeInfo.color}`}>
                                                            {typeInfo.text}
                                                        </span>
                                                        {isLatest && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">当前</span>
                                                        )}
                                                        {v.rollbackFromVersion && (
                                                            <span className="text-[10px] text-orange-500">← V{v.rollbackFromVersion}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-800 truncate">{v.title}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{v.modifierName} · {formatDateTime(v.createdAt)}</div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewDetail(v.versionNumber); }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="查看详情"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    {!isLatest && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setRollbackConfirm(v.versionNumber); }}
                                                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="回滚到此版本"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {detailVersion && detailVersion.versionNumber === v.versionNumber && (
                                                <div className="ml-11 mb-3 p-3 bg-gray-50 rounded-xl text-sm border border-gray-100">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div><span className="text-gray-400">书名：</span><span className="text-gray-700">{detailVersion.title}</span></div>
                                                        <div><span className="text-gray-400">作者：</span><span className="text-gray-700">{detailVersion.author}</span></div>
                                                        <div><span className="text-gray-400">价格：</span><span className="text-gray-700">¥{Number(detailVersion.price).toFixed(2)}</span></div>
                                                        <div><span className="text-gray-400">出版日期：</span><span className="text-gray-700">{detailVersion.publishDate || '-'}</span></div>
                                                    </div>
                                                    <div className="mt-2"><span className="text-gray-400">简介：</span><span className="text-gray-700">{detailVersion.description || '-'}</span></div>
                                                </div>
                                            )}

                                            {rollbackConfirm === v.versionNumber && (
                                                <div className="ml-11 mb-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                                    <p className="text-sm text-orange-800 mb-3">
                                                        确定要回滚到 <strong>V{v.versionNumber}</strong> 吗？回滚将产生一个新版本。
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRollback(v.versionNumber)}
                                                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            确认回滚
                                                        </button>
                                                        <button
                                                            onClick={() => setRollbackConfirm(null)}
                                                            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                                                        >
                                                            取消
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="w-1/2 overflow-y-auto p-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">差异对比</h3>
                        {diffs ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">V{selectedVersions.sort((a,b) => a-b)[0]}</span>
                                    <span>→</span>
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">V{selectedVersions.sort((a,b) => a-b)[1]}</span>
                                </div>
                                {diffs.map((diff, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-4 transition-all ${
                                            diff.changed
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-gray-50 border-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-gray-600">{diff.label}</span>
                                            {diff.changed && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">已变更</span>
                                            )}
                                            {!diff.changed && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-bold">未变更</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1 uppercase">旧值</div>
                                                <div className={`text-sm p-2 rounded-lg ${
                                                    diff.changed ? 'bg-red-50 text-red-800 line-through' : 'bg-white text-gray-600'
                                                }`}>
                                                    {diff.oldValue || <span className="text-gray-300 italic">空</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1 uppercase">新值</div>
                                                <div className={`text-sm p-2 rounded-lg ${
                                                    diff.changed ? 'bg-green-50 text-green-800 font-medium' : 'bg-white text-gray-600'
                                                }`}>
                                                    {diff.newValue || <span className="text-gray-300 italic">空</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-sm">在左侧选择两个版本进行对比</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookVersionHistory;
