import React, { useState, useEffect, useRef } from 'react';
import request from '../api/request';
import { searchRecommend } from '../api/recommend';
import QuickSuggester from '../components/QuickSuggester';
import RecommendResultCard from '../components/RecommendResultCard';

const BookRecommend = ({ user, onAddToCart, onReadBook }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [parsedConstraints, setParsedConstraints] = useState(null);
  const [searchMode, setSearchMode] = useState('keyword');
  const [message, setMessage] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [addingCartId, setAddingCartId] = useState(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const history = localStorage.getItem('recommendHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history).slice(0, 10));
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
  }, []);

  const saveToHistory = (q) => {
    const newHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('recommendHistory', JSON.stringify(newHistory));
  };

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q || !q.trim()) {
      setMessage('请输入您的阅读需求');
      return;
    }

    setIsSearching(true);
    setMessage('');
    setResults([]);
    setParsedConstraints(null);

    try {
      const data = await searchRecommend(q, 10, searchMode);
      
      setResults(data.results || []);
      setParsedConstraints(data.parsedConstraints);
      setProcessingTime(data.processingTime);
      setMessage(data.message || '');
      
      saveToHistory(q);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      setMessage(e.message || '搜索失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleHistoryClick = (history) => {
    setQuery(history);
    handleSearch(history);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('recommendHistory');
  };

  const handleAddToCart = async (book) => {
    if (!user) return;
    setAddingCartId(book.bookId);
    try {
      await request.post('/cart/add', { userId: user.id, bookId: book.bookId, quantity: 1 });
      onAddToCart && onAddToCart(book);
    } catch (e) {
      alert(e.message || '加入购物车失败');
    } finally {
      setTimeout(() => setAddingCartId(null), 300);
    }
  };

  const getTagColor = (type) => {
    const colors = {
      genre: 'bg-blue-100 text-blue-700 border-blue-200',
      audience: 'bg-purple-100 text-purple-700 border-purple-200',
      style: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      keyword: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTagIcon = (type) => {
    const icons = {
      genre: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      audience: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      style: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      keyword: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
    };
    return icons[type] || null;
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative p-10 md:p-14">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l.707.707M21 12h-1m-1.364 5.636l-.707.707M12 21v-1m-6.364-1.636l-.707.707M3 12h1m1.364-5.636l.707-.707M9 4h6m-3 16a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                智能荐书助手
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                用自然语言描述您的阅读需求，AI 为您精准推荐最适合的图书
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="例如：想看适合初中生、轻松点的科幻小说"
                    className="w-full px-5 py-4 text-gray-800 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-base"
                    rows={2}
                    style={{ minHeight: '80px' }}
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <select
                      value={searchMode}
                      onChange={(e) => setSearchMode(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="keyword">关键词加权</option>
                      <option value="embedding">向量相似度</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {isSearching ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      智能匹配中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      智能推荐
                    </>
                  )}
                </button>
              </div>
            </div>

            {parsedConstraints && (
              <div className="mt-6 bg-white/15 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  理解您的需求：
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedConstraints.genres?.map((g, i) => (
                    <span key={'g-' + i} className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ' + getTagColor('genre')}>
                      {getTagIcon('genre')}
                      题材：{g}
                    </span>
                  ))}
                  {parsedConstraints.audiences?.map((a, i) => (
                    <span key={'a-' + i} className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ' + getTagColor('audience')}>
                      {getTagIcon('audience')}
                      受众：{a}
                    </span>
                  ))}
                  {parsedConstraints.styles?.map((s, i) => (
                    <span key={'s-' + i} className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ' + getTagColor('style')}>
                      {getTagIcon('style')}
                      风格：{s}
                    </span>
                  ))}
                  {parsedConstraints.keywords?.map((k, i) => (
                    <span key={'k-' + i} className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ' + getTagColor('keyword')}>
                      {getTagIcon('keyword')}
                      {k}
                    </span>
                  ))}
                  {!parsedConstraints.genres?.length && !parsedConstraints.audiences?.length && 
                   !parsedConstraints.styles?.length && !parsedConstraints.keywords?.length && (
                    <span className="text-white/70 text-sm">未检测到特定约束，将基于整体语义匹配</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            试试这些：
          </h3>
        </div>
        <QuickSuggester onSelect={handleSuggestionSelect} />
      </div>

      {searchHistory.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              搜索历史
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(h)}
                className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={resultsRef}>
        {(results.length > 0 || message) && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-800">推荐结果</h2>
              {processingTime && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  耗时 {processingTime}
                </span>
              )}
              {results.length > 0 && (
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-medium">
                  {results[0].searchMode === 'keyword' ? '关键词加权模式' : '向量相似度模式'}
                </span>
              )}
            </div>
            {results.length > 0 && (
              <span className="text-sm text-gray-500">
                找到 <span className="font-bold text-blue-600">{results.length}</span> 本相关图书
              </span>
            )}
          </div>
        )}

        {message && results.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-amber-700 font-medium">{message}</p>
            <p className="text-amber-500 text-sm mt-2">试试换一种描述方式，或点击上方的推荐示例</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((book, index) => (
            <RecommendResultCard
              key={book.bookId}
              book={{...book, id: book.bookId}}
              rank={index + 1}
              onAddToCart={handleAddToCart}
              onReadBook={onReadBook}
              addingCartId={addingCartId}
              user={user}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          关于智能荐书
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-1">语义理解</h4>
            <p className="text-sm text-gray-500">自动识别题材、受众、风格等约束，精准匹配您的阅读偏好</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-1">智能排序</h4>
            <p className="text-sm text-gray-500">基于 TF-IDF 加权评分和同义词扩展，确保最相关的图书排在前面</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-1">可解释性</h4>
            <p className="text-sm text-gray-500">每本推荐图书都附带清晰的推荐理由，让您知道为什么推荐</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRecommend;
