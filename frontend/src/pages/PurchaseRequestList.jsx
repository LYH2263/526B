import React, { useState, useEffect } from 'react';
import request from '../api/request';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import ApproveModal from '../components/ApproveModal';
import PurchaseRequestDetail from '../components/PurchaseRequestDetail';

const STATUS_TABS = [
    { key: 'ALL', label: '全部', color: 'gray' },
    { key: 'PENDING', label: '待审批', color: 'yellow' },
    { key: 'APPROVED', label: '已通过', color: 'green' },
    { key: 'REJECTED', label: '已驳回', color: 'red' },
    { key: 'STOCKED', label: '已入库', color: 'blue' }
];

const STATUS_TEXT = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    STOCKED: '已入库'
};

const STATUS_COLOR = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    STOCKED: 'bg-blue-100 text-blue-800 border-blue-200'
};

const TAB_COUNT_COLORS = {
    ALL: 'bg-gray-600',
    PENDING: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    STOCKED: 'bg-blue-500'
};

const PurchaseRequestList = ({ user }) => {
    const [list, setList] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [approveModal, setApproveModal] = useState({ isOpen: false, record: null, actionType: null });
    const [detailModal, setDetailModal] = useState({ isOpen: false, recordId: null });

    const isAdmin = user?.role === 'ADMIN';

    const fetchList = async () => {
        setLoading(true);
        try {
            let url = '/purchase-requests';
            const params = [];
            if (activeTab !== 'ALL') {
                params.push(`status=${activeTab}`);
            }
            if (!isAdmin) {
                params.push(`applicantId=${user.id}`);
            }
            if (params.length > 0) {
                url += '?' + params.join('&');
            }
            const data = await request.get(url);
            setList(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, [activeTab, user?.id]);

    const handleApprove = (record) => {
        setApproveModal({ isOpen: true, record, actionType: 'approve' });
    };

    const handleReject = (record) => {
        setApproveModal({ isOpen: true, record, actionType: 'reject' });
    };

    const handleStock = (record) => {
        setApproveModal({ isOpen: true, record, actionType: 'stock' });
    };

    const handleViewDetail = (record) => {
        setDetailModal({ isOpen: true, recordId: record.id });
    };

    const canApprove = (record) => isAdmin && record.status === 'PENDING';
    const canReject = (record) => isAdmin && record.status === 'PENDING';
    const canStock = (record) => record.status === 'APPROVED';

    const filteredList = list;

    const countByStatus = (status) => {
        if (status === 'ALL') return list.length;
        return list.filter(item => item.status === status).length;
    };

    const formatDateTime = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">采购审批管理</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {isAdmin ? '审批采购申请，管理馆藏扩充流程' : '提交采购申请，追踪审批状态'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl shadow-purple-500/30 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <div className="bg-white/20 rounded-full p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        提交采购申请
                    </button>
                </div>

                <div className="border-b border-gray-100 bg-white px-4 sm:px-8">
                    <div className="flex gap-1 overflow-x-auto py-3">
                        {STATUS_TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gray-900 text-white shadow-lg'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                                        isActive ? 'bg-white/20 text-white' : `${TAB_COUNT_COLORS[tab.key]} text-white`
                                    }`}>
                                        {countByStatus(tab.key)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-24">
                            <svg className="animate-spin h-10 w-10 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <p className="mt-4 text-gray-500 font-medium">加载中...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">暂无数据</h3>
                            <p className="text-gray-400 mt-1">
                                {activeTab === 'ALL' ? '还没有采购申请记录' : `暂无${STATUS_TEXT[activeTab]}的申请`}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-8 py-4 border-b border-gray-100">申请信息</th>
                                    <th className="px-6 py-4 border-b border-gray-100">价格/数量</th>
                                    <th className="px-6 py-4 border-b border-gray-100">申请人</th>
                                    <th className="px-6 py-4 border-b border-gray-100">状态</th>
                                    <th className="px-6 py-4 border-b border-gray-100">提交时间</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredList.map((item) => (
                                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-start gap-4">
                                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                                    {item.bookTitle.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate max-w-[220px]">
                                                        {item.bookTitle}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {item.bookAuthor}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 truncate max-w-[260px]">
                                                        单号 #{item.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-600">
                                                    单价 <span className="font-semibold text-emerald-600">¥{Number(item.estimatedPrice).toFixed(2)}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    数量 <span className="font-semibold">× {item.quantity}</span>
                                                </div>
                                                <div className="pt-1 mt-1 border-t border-gray-100">
                                                    <span className="text-xs text-gray-400">总计 </span>
                                                    <span className="font-bold text-blue-600">¥{(Number(item.estimatedPrice) * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                                                    {item.applicantName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{item.applicantName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_COLOR[item.status]}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'PENDING' ? 'bg-yellow-500 animate-pulse' : ''} ${item.status === 'APPROVED' ? 'bg-green-500' : ''} ${item.status === 'REJECTED' ? 'bg-red-500' : ''} ${item.status === 'STOCKED' ? 'bg-blue-500' : ''}`}></span>
                                                {STATUS_TEXT[item.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 font-mono">
                                            {formatDateTime(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => handleViewDetail(item)}
                                                    className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-gray-300"
                                                    title="查看详情"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    详情
                                                </button>
                                                {canApprove(item) && (
                                                    <button
                                                        onClick={() => handleApprove(item)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1.5 border border-green-200 hover:border-green-300"
                                                        title="审批通过"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        通过
                                                    </button>
                                                )}
                                                {canReject(item) && (
                                                    <button
                                                        onClick={() => handleReject(item)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-red-200 hover:border-red-300"
                                                        title="驳回申请"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        驳回
                                                    </button>
                                                )}
                                                {canStock(item) && (
                                                    <button
                                                        onClick={() => handleStock(item)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-blue-200 hover:border-blue-300"
                                                        title="标记入库"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        入库
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <PurchaseRequestForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchList}
                user={user}
            />

            <ApproveModal
                isOpen={approveModal.isOpen}
                onClose={() => setApproveModal({ isOpen: false, record: null, actionType: null })}
                onSuccess={fetchList}
                record={approveModal.record}
                actionType={approveModal.actionType}
                user={user}
            />

            <PurchaseRequestDetail
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, recordId: null })}
                recordId={detailModal.recordId}
            />
        </div>
    );
};

export default PurchaseRequestList;
