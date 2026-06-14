import React from 'react';

const RecommendResultCard = ({ book, rank, onAddToCart, onReadBook, addingCartId, user }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  const coverClass = 'h-24 w-18 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg relative overflow-hidden';
  const rankBadgeClass = 'absolute -top-2 -left-2 w-8 h-8 rounded-full ' + getScoreBg(book.score) + ' text-white flex items-center justify-center text-xs font-bold shadow-lg';
  const priceClass = 'text-sm font-semibold text-emerald-600 flex items-center gap-1';
  const scoreClass = 'text-2xl font-extrabold ' + getScoreColor(book.score) + ' flex items-baseline gap-0.5';
  
  const addToCartBaseClass = 'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ';
  const addToCartAddedClass = 'bg-emerald-100 text-emerald-600 border border-emerald-200';
  const addToCartNormalClass = 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40';
  const addToCartClass = addToCartBaseClass + (addingCartId === book.bookId ? addToCartAddedClass : addToCartNormalClass);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex gap-5">
          <div className="flex-shrink-0 relative">
            <div className={coverClass}>
              <div className="absolute inset-0 bg-white/10" />
              <span className="relative z-10">{book.title.charAt(0)}</span>
            </div>
            <div className={rankBadgeClass}>
              {rank}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {book.author}
                  </span>
                  <span className={priceClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ¥{Number(book.price).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className={scoreClass}>
                {book.score}
                <span className="text-sm font-medium text-gray-400">分</span>
              </div>
            </div>

            <div className="mt-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l.707.707M21 12h-1m-1.364 5.636l-.707.707M12 21v-1m-6.364-1.636l-.707.707M3 12h1m1.364-5.636l.707-.707" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <span className="font-semibold text-blue-700">推荐理由：</span>
                    {book.reason}
                  </p>
                </div>
              </div>
            </div>

            {book.matchedConstraints && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {book.matchedConstraints.split(', ').map((constraint, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {constraint}
                  </span>
                ))}
              </div>
            )}

            {book.description && (
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                {book.description}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onReadBook && onReadBook(book)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg border border-blue-200 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                开始阅读
              </button>
              <button
                onClick={() => onAddToCart && onAddToCart(book)}
                disabled={addingCartId === book.bookId}
                className={addToCartClass}
              >
                {addingCartId === book.bookId ? (
                  React.createElement(React.Fragment, null,
                    React.createElement('svg', { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M5 13l4 4L19 7' })
                    ),
                    '已添加'
                  )
                ) : (
                  React.createElement(React.Fragment, null,
                    React.createElement('svg', { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' })
                    ),
                    '加入购物车'
                  )
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendResultCard;
