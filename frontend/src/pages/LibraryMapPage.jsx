import React, { useState, useEffect } from 'react';
import { getBranches } from '../api/branch';
import { getStockByBook, findNearbyBranches } from '../api/stock';
import { getTransfers, getTransfer } from '../api/transfer';
import request from '../api/request';
import BranchSelector from '../components/BranchSelector';
import StockList from '../components/StockList';
import TransferModal from '../components/TransferModal';
import TransferProgress from '../components/TransferProgress';

const LibraryMapPage = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [stockList, setStockList] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [transferTab, setTransferTab] = useState('all');
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    mode: 'create',
    transfer: null,
    targetBranch: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      loadStock();
    } else {
      setStockList([]);
    }
  }, [selectedBook, userLocation]);

  useEffect(() => {
    loadTransfers();
  }, [transferTab]);

  const loadBooks = async () => {
    try {
      const data = await request.get('/books');
      setBooks(data);
      if (data.length > 0) {
        setSelectedBook(data[0]);
      }
    } catch (error) {
      console.error('加载图书失败:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await getBranches(1);
      setBranches(data);
    } catch (error) {
      console.error('加载分馆失败:', error);
    }
  };

  const loadStock = async () => {
    if (!selectedBook) return;
    setLoading(true);
    try {
      let data;
      if (userLocation) {
        data = await findNearbyBranches(
          selectedBook.id,
          userLocation.latitude,
          userLocation.longitude,
          1
        );
      } else {
        data = await getStockByBook(selectedBook.id);
      }
      setStockList(data);
    } catch (error) {
      console.error('加载库存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransfers = async () => {
    try {
      const params = {};
      if (transferTab !== 'all') {
        params.status = transferTab;
      }
      const data = await getTransfers(params);
      setTransfers(data);
    } catch (error) {
      console.error('加载调拨记录失败:', error);
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('获取位置失败:', error);
          setUserLocation({
            latitude: 39.9042,
            longitude: 116.4074
          });
          setLocationLoading(false);
        }
      );
    } else {
      setUserLocation({
        latitude: 39.9042,
        longitude: 116.4074
      });
      setLocationLoading(false);
    }
  };

  const clearLocation = () => {
    setUserLocation(null);
  };

  const handleTransfer = (stock) => {
    const targetBranch = branches.find(b => b.id === stock.branchId);
    setTransferModal({
      isOpen: true,
      mode: 'create',
      transfer: null,
      targetBranch
    });
  };

  const handleTransferAction = (transfer, action) => {
    setTransferModal({
      isOpen: true,
      mode: action,
      transfer,
      targetBranch: null
    });
  };

  const handleTransferSuccess = () => {
    loadStock();
    loadTransfers();
  };

  const handleViewTransferDetail = async (transferId) => {
    try {
      const data = await getTransfer(transferId);
      setSelectedTransfer(data);
    } catch (error) {
      console.error('加载调拨详情失败:', error);
    }
  };

  const getMapBounds = () => {
    if (!branches || branches.length === 0) return null;
    const lats = branches.map(b => parseFloat(b.latitude));
    const lngs = branches.map(b => parseFloat(b.longitude));
    return {
      minLat: Math.min(...lats) - 0.02,
      maxLat: Math.max(...lats) + 0.02,
      minLng: Math.min(...lngs) - 0.02,
      maxLng: Math.max(...lngs) + 0.02
    };
  };

  const getMarkerPosition = (branch) => {
    const bounds = getMapBounds();
    if (!bounds) return { left: '50%', top: '50%' };
    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;
    const lat = parseFloat(branch.latitude);
    const lng = parseFloat(branch.longitude);
    return {
      left: `${((lng - bounds.minLng) / lngRange) * 100}%`,
      top: `${((bounds.maxLat - lat) / latRange) * 100}%`
    };
  };

  const bounds = getMapBounds();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">图书馆藏查询</h2>
              <p className="text-gray-500 text-sm mt-1">查询各分馆库存，就近取书或申请调拨</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={userLocation ? clearLocation : getLocation}
                disabled={locationLoading}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  userLocation
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                } disabled:opacity-50`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locationLoading ? '定位中...' : userLocation ? '已定位' : '获取位置'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">选择图书</label>
            <div className="flex flex-wrap gap-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    selectedBook?.id === book.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {book.title}
                </button>
              ))}
            </div>
          </div>

          {selectedBook && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                  {selectedBook.title.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{selectedBook.title}</h3>
                  <p className="text-gray-500 text-sm">{selectedBook.author}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{selectedBook.description}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    ¥{Number(selectedBook.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                viewMode === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                列表视图
              </span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                viewMode === 'map'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                地图视图
              </span>
            </button>
          </div>

          {selectedBook && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">加载库存数据中...</p>
            </div>
          ) : viewMode === 'list' ? (
            <StockList
              stockList={stockList}
              onTransfer={handleTransfer}
              userLocation={userLocation}
              currentBook={selectedBook}
            />
          ) : (
            <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
              
              {userLocation && (
                <div 
                  className="absolute z-20"
                  style={{
                    left: `${((userLocation.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100}%`,
                    top: `${((bounds.maxLat - userLocation.latitude) / (bounds.maxLat - bounds.minLat)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      我的位置
                    </div>
                  </div>
                </div>
              )}

              {branches?.map((branch) => {
                const stock = stockList?.find(s => s.branchId === branch.id);
                const pos = getMarkerPosition(branch);
                const hasStock = stock && stock.availableQuantity > 0;
                const hasInTransit = stock && stock.inTransitQuantity > 0;
                
                return (
                  <div 
                    key={branch.id}
                    className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform"
                    style={{ left: pos.left, top: pos.top }}
                    onClick={() => {
                      if (stock && stock.availableQuantity <= 0 && stock.inTransitQuantity <= 0) {
                        handleTransfer(stock);
                      }
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${
                      hasStock ? 'bg-green-500' : hasInTransit ? 'bg-orange-500' : 'bg-gray-400'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white rounded-lg shadow-xl px-3 py-2 min-w-max">
                      <p className="font-bold text-gray-800 text-sm">{branch.name}</p>
                      {stock && (
                        <p className={`text-xs font-medium ${
                          hasStock ? 'text-green-600' : hasInTransit ? 'text-orange-600' : 'text-gray-400'
                        }`}>
                          {hasStock ? `可借 ${stock.availableQuantity} 本` : hasInTransit ? `在途 ${stock.inTransitQuantity} 本` : '暂无库存'}
                        </p>
                      )}
                      {stock?.distanceText && (
                        <p className="text-xs text-blue-600">{stock.distanceText}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">图例</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-500">有库存</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-gray-500">在途</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-xs text-gray-500">无库存</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">调拨管理</h2>
              <p className="text-gray-500 text-sm mt-1">查看和管理跨馆调拨订单</p>
            </div>
          </div>
          
          <div className="flex gap-1 mt-4 p-1 bg-white/50 rounded-lg">
            {[
              { key: 'all', label: '全部' },
              { key: 'PENDING', label: '待出库' },
              { key: 'IN_TRANSIT', label: '在途' },
              { key: 'COMPLETED', label: '已完成' },
              { key: 'CANCELLED', label: '已取消' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTransferTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  transferTab === tab.key
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {selectedTransfer ? (
            <div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </button>
              <TransferProgress transfer={selectedTransfer} />
              
              {(selectedTransfer.status === 'PENDING' || selectedTransfer.status === 'IN_TRANSIT') && (
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => handleTransferAction(selectedTransfer, 'cancel')}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    取消调拨
                  </button>
                  {selectedTransfer.status === 'PENDING' && (
                    <button
                      onClick={() => handleTransferAction(selectedTransfer, 'ship')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                    >
                      确认出库
                    </button>
                  )}
                  {selectedTransfer.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleTransferAction(selectedTransfer, 'receive')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                    >
                      确认入库
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {transfers?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p>暂无调拨记录</p>
                </div>
              ) : (
                transfers?.map((transfer) => {
                  const statusConfig = {
                    PENDING: { color: 'bg-gray-100 text-gray-700', text: '待出库' },
                    IN_TRANSIT: { color: 'bg-orange-100 text-orange-700', text: '在途' },
                    COMPLETED: { color: 'bg-green-100 text-green-700', text: '已完成' },
                    CANCELLED: { color: 'bg-red-100 text-red-700', text: '已取消' }
                  };
                  const config = statusConfig[transfer.status] || statusConfig.PENDING;
                  
                  return (
                    <div
                      key={transfer.id}
                      className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleViewTransferDetail(transfer.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-800">{transfer.bookTitle}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                              {config.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">{transfer.sourceBranchName}</span>
                            <svg className="w-4 h-4 inline mx-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="font-medium">{transfer.targetBranchName}</span>
                            <span className="ml-2 text-gray-400">· {transfer.quantity} 本</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{transfer.transferNo}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <TransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal({ ...transferModal, isOpen: false })}
        onSuccess={handleTransferSuccess}
        mode={transferModal.mode}
        transfer={transferModal.transfer}
        currentBook={selectedBook}
        user={user}
        targetBranch={transferModal.targetBranch}
      />
    </div>
  );
};

export default LibraryMapPage;
