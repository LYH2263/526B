import React, { useState, useEffect } from 'react';
import { createTransfer, shipTransfer, receiveTransfer, cancelTransfer } from '../api/transfer';
import { getBranches } from '../api/branch';

const TransferModal = ({ isOpen, onClose, onSuccess, mode, transfer, currentBook, user, targetBranch }) => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    sourceBranchId: '',
    targetBranchId: '',
    quantity: 1,
    remark: '',
    cancelReason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBranches();
      if (mode === 'create' && targetBranch) {
        setFormData(prev => ({ ...prev, targetBranchId: targetBranch.id }));
      }
      if (mode !== 'create' && transfer) {
        setFormData(prev => ({
          ...prev,
          sourceBranchId: transfer.sourceBranchId,
          targetBranchId: transfer.targetBranchId,
          quantity: transfer.quantity
        }));
      }
    }
  }, [isOpen, mode, transfer, targetBranch]);

  const loadBranches = async () => {
    try {
      const data = await getBranches(1);
      setBranches(data);
    } catch (error) {
      console.error('加载分馆失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const operatorId = user?.id || 1;
      
      if (mode === 'create') {
        await createTransfer({
          bookId: currentBook.id,
          sourceBranchId: parseInt(formData.sourceBranchId),
          targetBranchId: parseInt(formData.targetBranchId),
          quantity: parseInt(formData.quantity),
          remark: formData.remark,
          operatorId
        });
      } else if (mode === 'ship') {
        await shipTransfer(transfer.id, { operatorId, remark: formData.remark });
      } else if (mode === 'receive') {
        await receiveTransfer(transfer.id, { operatorId, remark: formData.remark });
      } else if (mode === 'cancel') {
        await cancelTransfer(transfer.id, { operatorId, cancelReason: formData.cancelReason });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'create': return '发起调拨申请';
      case 'ship': return '确认出库';
      case 'receive': return '确认入库';
      case 'cancel': return '取消调拨';
      default: return '调拨操作';
    }
  };

  const getConfirmText = () => {
    switch (mode) {
      case 'create': return '提交申请';
      case 'ship': return '确认出库';
      case 'receive': return '确认入库';
      case 'cancel': return '确认取消';
      default: return '确认';
    }
  };

  const availableBranches = mode === 'create' && targetBranch
    ? branches.filter(b => b.id !== targetBranch.id)
    : branches;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {currentBook && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">调拨图书</p>
              <p className="font-bold text-gray-800">{currentBook.title}</p>
            </div>
          )}

          {transfer && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">源分馆</span>
                <span className="font-medium text-gray-800">{transfer.sourceBranchName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">目标分馆</span>
                <span className="font-medium text-gray-800">{transfer.targetBranchName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">调拨数量</span>
                <span className="font-medium text-gray-800">{transfer.quantity} 本</span>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">源分馆</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.sourceBranchId}
                  onChange={(e) => setFormData({ ...formData, sourceBranchId: e.target.value })}
                >
                  <option value="">请选择源分馆</option>
                  {availableBranches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">目标分馆</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.targetBranchId}
                  onChange={(e) => setFormData({ ...formData, targetBranchId: e.target.value })}
                >
                  <option value="">请选择目标分馆</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">调拨数量</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">备注</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  rows="3"
                  placeholder="请输入备注信息（可选）"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>
            </>
          )}

          {(mode === 'ship' || mode === 'receive') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">备注</label>
              <textarea
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                rows="3"
                placeholder="请输入备注信息（可选）"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          )}

          {mode === 'cancel' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">取消原因</label>
              <textarea
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
                rows="3"
                placeholder="请填写取消原因"
                value={formData.cancelReason}
                onChange={(e) => setFormData({ ...formData, cancelReason: e.target.value })}
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
              disabled={loading}
              className={`px-6 py-2.5 text-white rounded-xl font-medium shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'cancel' 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 hover:shadow-red-500/40'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/40'
              }`}
            >
              {loading ? '处理中...' : getConfirmText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
