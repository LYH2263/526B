import React from 'react';

const getStockStatus = (available, inTransit) => {
  if (available > 0) {
    return { color: 'text-green-600', bg: 'bg-green-100', text: `可借 ${available} 本` };
  } else if (inTransit > 0) {
    return { color: 'text-orange-600', bg: 'bg-orange-100', text: `在途 ${inTransit} 本` };
  } else {
    return { color: 'text-gray-500', bg: 'bg-gray-100', text: '暂无库存' };
  }
};

const StockList = ({ stockList, onTransfer, userLocation, currentBook }) => {
  return (
    <div className="space-y-4">
      {stockList?.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>暂无库存数据</p>
        </div>
      ) : (
        stockList?.map((stock, index) => {
          const status = getStockStatus(stock.availableQuantity, stock.inTransitQuantity);
          return (
            <div
              key={stock.branchId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {index === 0 && userLocation && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        最近
                      </span>
                    )}
                    <h4 className="font-bold text-gray-800 text-lg">{stock.branchName}</h4>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {stock.address}
                  </p>
                  {stock.distanceText && (
                    <p className="text-blue-600 text-sm font-medium mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      距您 {stock.distanceText}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {stock.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {stock.businessHours}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status.bg} ${status.color}`}>
                    {status.text}
                  </div>
                  <div className="text-xs text-gray-400">
                    总库存：{stock.stockQuantity} 本
                  </div>
                  {onTransfer && stock.availableQuantity <= 0 && stock.inTransitQuantity <= 0 && (
                    <button
                      onClick={() => onTransfer(stock)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      申请调拨
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StockList;
