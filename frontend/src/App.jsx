import React, { useState, useEffect, useRef } from 'react';
import BookList from './pages/BookList';
import OrderList from './pages/OrderList';
import PurchaseRequestList from './pages/PurchaseRequestList';
import Reader from './pages/Reader';
import MyLevel from './pages/MyLevel';
import MyBooklists from './pages/MyBooklists';
import BooklistDetail from './pages/BooklistDetail';
import BooklistShare from './pages/BooklistShare';
import BookRecommend from './pages/BookRecommend';
import Login from './components/Login';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import ContinueReading from './components/ContinueReading';
import LevelBadge from './components/LevelBadge';
import request from './api/request';
import { getPointsAccount, addLoginPoints } from './api/points';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('books');
  const [recommendBook, setRecommendBook] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ items: [], totalAmount: 0 });
  const [orderResult, setOrderResult] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [readingBook, setReadingBook] = useState(null);
  const [pointsAccount, setPointsAccount] = useState(null);
  const [selectedBooklistId, setSelectedBooklistId] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const continueReadingRef = useRef(null);

  const parseHash = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.startsWith('/share/')) {
      return { type: 'share', token: hash.substring(7) };
    }
    return null;
  };

  useEffect(() => {
    const route = parseHash();
    if (route && route.type === 'share') {
      setShareToken(route.token);
    }
    const handleHashChange = () => {
      const r = parseHash();
      if (r && r.type === 'share') {
        setShareToken(r.token);
      } else {
        setShareToken(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCartCount();
      fetchPointsAccount();
    }
  }, [user]);

  const fetchPointsAccount = async () => {
    if (!user) return;
    try {
      const data = await getPointsAccount(user.id);
      setPointsAccount(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshPoints = () => {
    fetchPointsAccount();
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const data = await request.get(`/cart?userId=${user.id}`);
      setCartCount(data.totalCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    try {
      const account = await addLoginPoints(userData.id);
      setPointsAccount(account);
    } catch (e) {
      console.error('Login points error:', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('books');
    setCartCount(0);
  };

  const handleAddToCart = () => {
    fetchCartCount();
  };

  const handleRefreshCount = (count) => {
    setCartCount(count);
  };

  const handleCheckout = (items, totalAmount) => {
    setCheckoutData({ items, totalAmount });
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (data) => {
    setOrderResult(data);
    setIsOrderSuccessOpen(true);
    setIsCartOpen(false);
    setCartCount(0);
  };

  const handleViewOrders = () => {
    setIsOrderSuccessOpen(false);
    setCurrentPage('orders');
  };

  const handleReadBook = (book) => {
    const bookData = {
      id: book.bookId || book.id,
      title: book.bookTitle || book.title,
      author: book.bookAuthor || book.author
    };
    setReadingBook(bookData);
    setCurrentPage('reader');
  };

  const handleBackFromReader = () => {
    setReadingBook(null);
    setCurrentPage('books');
    if (continueReadingRef.current && continueReadingRef.current.refresh) {
      setTimeout(() => {
        continueReadingRef.current.refresh && continueReadingRef.current.refresh();
      }, 200);
    }
  };

  const handleViewBooklistDetail = (booklist) => {
    setSelectedBooklistId(booklist.id);
    setCurrentPage('booklistDetail');
  };

  const handleBackFromBooklistDetail = () => {
    setSelectedBooklistId(null);
    setCurrentPage('booklists');
  };

  if (shareToken) {
    return <BooklistShare shareToken={shareToken} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const NavButton = ({ page, label, iconSvg }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        if (page !== 'booklistDetail') setSelectedBooklistId(null);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
        currentPage === page || (page === 'booklists' && currentPage === 'booklistDetail')
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {iconSvg}
      </svg>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
       <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-lg p-1.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                         <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none">图书管理系统</h1>
                         <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Library Management</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <NavButton
                        page="books"
                        label="图书商城"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
                    />
                    <NavButton
                        page="recommend"
                        label="智能荐书"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l.707.707M21 12h-1m-1.364 5.636l-.707.707M12 21v-1m-6.364-1.636l-.707.707M3 12h1m1.364-5.636l.707-.707M9 4h6m-3 16a9 9 0 110-18 9 9 0 010 18z" />}
                    />
                    <NavButton
                        page="booklists"
                        label="我的书单"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                    />
                    <NavButton
                        page="orders"
                        label="我的订单"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
                    />
                    <NavButton
                        page="purchase"
                        label="采购审批"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4M9 13h6" />}
                    />
                    <NavButton
                        page="level"
                        label="我的等级"
                        iconSvg={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                    title="购物车"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => { setCurrentPage('level'); setSelectedBooklistId(null); }}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{user.username}</span>
                    {user.role && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {user.role === 'ADMIN' ? '管理员' : '馆员'}
                        </span>
                    )}
                    {pointsAccount && (
                        <LevelBadge level={pointsAccount.level} size="sm" showName={false} />
                    )}
                </div>

                <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    title="退出登录"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </div>
       </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentPage === 'reader' && readingBook && (
                <Reader book={readingBook} user={user} onBack={handleBackFromReader} onPointsChange={refreshPoints} />
            )}
            {currentPage === 'books' && (
                <>
                    <ContinueReading 
                        ref={continueReadingRef}
                        user={user} 
                        onReadBook={handleReadBook} 
                    />
                    <BookList user={user} onAddToCart={handleAddToCart} onReadBook={handleReadBook} />
                </>
            )}
            {currentPage === 'recommend' && (
                <BookRecommend user={user} onAddToCart={handleAddToCart} onReadBook={handleReadBook} />
            )}
            {currentPage === 'booklists' && (
                <MyBooklists user={user} onViewDetail={handleViewBooklistDetail} />
            )}
            {currentPage === 'booklistDetail' && selectedBooklistId && (
                <BooklistDetail booklistId={selectedBooklistId} user={user} onBack={handleBackFromBooklistDetail} />
            )}
            {currentPage === 'orders' && (
                <OrderList user={user} onBack={() => { setCurrentPage('books'); setSelectedBooklistId(null); }} />
            )}
            {currentPage === 'purchase' && (
                <PurchaseRequestList user={user} />
            )}
            {currentPage === 'level' && (
                <MyLevel user={user} />
            )}
        </main>

        <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            user={user}
            onCheckout={handleCheckout}
            onRefreshCount={handleRefreshCount}
        />

        <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            user={user}
            cartItems={checkoutData.items}
            totalAmount={checkoutData.totalAmount}
            onSuccess={handleOrderSuccess}
        />

        <OrderSuccessModal
            isOpen={isOrderSuccessOpen}
            onClose={() => setIsOrderSuccessOpen(false)}
            orderResult={orderResult}
            onViewOrders={handleViewOrders}
        />
    </div>
  );
}

export default App;
