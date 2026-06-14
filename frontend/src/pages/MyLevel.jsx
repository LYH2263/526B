import React, { useState, useEffect } from 'react';
import { getPointsAccount, getPointsRecords } from '../api/points';
import LevelBadge from '../components/LevelBadge';

const MyLevel = ({ user }) => {
    const [account, setAccount] = useState(null);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAccount = async () => {
        if (!user) return;
        try {
            const data = await getPointsAccount(user.id);
            setAccount(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRecords = async (pageNum = 1) => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getPointsRecords(user.id, pageNum, 10);
            setRecords(data.records || []);
            setTotal(data.total || 0);
            setPage(data.page || 1);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAccount();
            fetchRecords(1);
        }
    }, [user]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchRecords(newPage);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const levelProgressBars = [
        { level: 'COMMON', threshold: 0 },
        { level: 'SILVER', threshold: 100 },
        { level: 'GOLD', threshold: 500 },
        { level: 'DIAMOND', threshold: 1000 }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">我的等级</h2>
                            <p className="text-white/80 text-sm mt-1">积累积分，解锁更多专属权益</p>
                        </div>
                        {account && (
                            <div className="text-right">
                                <div className="text-4xl font-bold">{account.totalPoints}</div>
                                <div className="text-white/80 text-sm">当前积分</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {account ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-gray-800">{user.username}</span>
                                        <LevelBadge level={account.level} size="md" />
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {account.isMaxLevel
                                            ? '恭喜您已达到最高等级！'
                                            : `距离 ${account.nextLevelName} 还需 ${account.nextLevelThreshold - account.totalPoints} 积分`}
                                    </p>
                                </div>
                            </div>

                            <div className="relative pt-8 pb-4">
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${account.progressPercent || 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    {levelProgressBars.map((item, index) => (
                                        <div key={item.level} className="flex flex-col items-center">
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 ${
                                                    account.totalPoints >= item.threshold
                                                        ? 'bg-purple-500 border-purple-500'
                                                        : 'bg-white border-gray-300'
                                                }`}
                                                style={{ marginTop: '-10px' }}
                                            />
                                            <span className={`text-xs mt-1 ${
                                                account.totalPoints >= item.threshold
                                                    ? 'text-purple-600 font-medium'
                                                    : 'text-gray-400'
                                            }`}>
                                                {item.threshold}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2">
                                    {levelProgressBars.map((item) => (
                                        <div key={item.level} className="text-[10px] text-gray-400">
                                            {item.level === 'COMMON' && '普通'}
                                            {item.level === 'SILVER' && '银'}
                                            {item.level === 'GOLD' && '金'}
                                            {item.level === 'DIAMOND' && '钻石'}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 pt-4">
                                {[
                                    { label: '登录', points: '+5', desc: '每日登录' },
                                    { label: '阅读', points: '+10', desc: '每本图书' },
                                    { label: '加购', points: '+3', desc: '首次加购' },
                                    { label: '下单', points: '+20', desc: '每笔订单' }
                                ].map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                                        <div className="text-emerald-600 font-bold text-lg">{item.points}</div>
                                        <div className="text-gray-800 font-medium text-sm mt-1">{item.label}</div>
                                        <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">加载中...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">积分明细</h3>
                    <p className="text-gray-500 text-sm mt-1">共 {total} 条记录</p>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : records.length > 0 ? (
                        records.map((record) => (
                            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        record.pointsChange > 0 ? 'bg-emerald-100' : 'bg-red-100'
                                    }`}>
                                        <svg className={`w-5 h-5 ${
                                            record.pointsChange > 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {record.pointsChange > 0 ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{record.sourceName || record.sourceType}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(record.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${
                                        record.pointsChange > 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                        {record.pointsChange > 0 ? '+' : ''}{record.pointsChange}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">余额: {record.pointsAfter}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-gray-500">暂无积分记录</p>
                            <p className="text-gray-400 text-sm mt-1">完成任务获取积分吧</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            上一页
                        </button>
                        <span className="text-sm text-gray-500">
                            第 {page} / {totalPages} 页
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            下一页
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLevel;
