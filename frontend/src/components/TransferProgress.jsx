import React from 'react';

const getStatusConfig = (status) => {
  const configs = {
    PENDING: { color: 'bg-gray-400', text: '待出库', index: 0 },
    IN_TRANSIT: { color: 'bg-orange-500', text: '在途', index: 1 },
    COMPLETED: { color: 'bg-green-500', text: '已完成', index: 2 },
    CANCELLED: { color: 'bg-red-500', text: '已取消', index: -1 }
  };
  return configs[status] || configs.PENDING;
};

const TransferProgress = ({ transfer }) => {
  if (!transfer) return null;

  const statusConfig = getStatusConfig(transfer.status);
  const steps = [
    { key: 'PENDING', label: '创建申请', time: transfer.createdAt },
    { key: 'IN_TRANSIT', label: '出库运输', time: transfer.shippedAt },
    { key: 'COMPLETED', label: '入库完成', time: transfer.receivedAt }
  ];

  const isCancelled = transfer.status === 'CANCELLED';
  const currentIndex = isCancelled ? -1 : statusConfig.index;

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleString('zh-CN');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-800">{transfer.bookTitle}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {transfer.sourceBranchName} → {transfer.targetBranchName} · {transfer.quantity} 本
          </p>
        </div>
        <span className="text-sm text-gray-400">{transfer.transferNo}</span>
      </div>

      {isCancelled ? (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            调拨已取消
          </div>
          <p className="text-sm text-red-500">原因：{transfer.cancelReason}</p>
          <p className="text-xs text-red-400 mt-1">取消时间：{formatTime(transfer.cancelledAt)}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-sm text-gray-400">{formatTime(step.time)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transfer.logs?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">操作记录</p>
          <div className="space-y-2">
            {transfer.logs.map((log, index) => (
              <div key={index} className="text-sm flex items-start gap-2">
                <span className="text-gray-400 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                <span className="text-gray-800">
                  <span className="font-medium">{log.operatorName}</span>
                  <span className="text-gray-500">：{log.remark}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferProgress;
