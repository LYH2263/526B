import React, { useState, useEffect, useMemo } from 'react';
import request from '../api/request';

const BookPriceHistory = ({ isOpen, onClose, book }) => {
    const [timeRange, setTimeRange] = useState('all');
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && book) {
            fetchData();
        }
    }, [isOpen, book, timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [historyData, statsData] = await Promise.all([
                request.get(`/books/${book.id}/price-history?range=${timeRange}`),
                request.get(`/books/${book.id}/price-stats?range=${timeRange}`)
            ]);
            setHistory(historyData || []);
            setStats(statsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return dateStr.replace('T', ' ').substring(0, 16);
    };

    const chartData = useMemo(() => {
        if (!book || history.length === 0) {
            return book ? [{
                time: '当前',
                price: Number(book.price),
                isCurrent: true
            }] : [];
        }
        const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const points = [];
        points.push({
            time: formatDateTime(sorted[0].createdAt),
            price: Number(sorted[0].oldPrice),
            isStart: true
        });
        sorted.forEach((h, idx) => {
            points.push({
                time: formatDateTime(h.createdAt),
                price: Number(h.newPrice),
                isCurrent: idx === sorted.length - 1
            });
        });
        return points;
    }, [history, book]);

    const { minPrice, maxPrice, highestIdx, lowestIdx } = useMemo(() => {
        if (chartData.length === 0) return { minPrice: 0, maxPrice: 0, highestIdx: -1, lowestIdx: -1 };
        const prices = chartData.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return {
            minPrice: min,
            maxPrice: max,
            highestIdx: prices.indexOf(max),
            lowestIdx: prices.indexOf(min)
        };
    }, [chartData]);

    const renderChart = () => {
        const width = 600;
        const height = 280;
        const paddingLeft = 60;
        const paddingRight = 30;
        const paddingTop = 30;
        const paddingBottom = 50;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        if (chartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-[280px] text-gray-400">
                    <p>暂无价格数据</p>
                </div>
            );
        }

        if (chartData.length === 1) {
            const y = paddingTop + chartHeight / 2;
            const price = chartData[0].price;
            return (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx={width / 2} cy={y} r="6" fill="#3b82f6" />
                    <text x={width / 2} y={y - 12} textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="600">
                        当前价 ¥{price.toFixed(2)}
                    </text>
                    <text x={width / 2} y={height - 20} textAnchor="middle" fill="#6b7280" fontSize="11">
                        {chartData[0].time}
                    </text>
                </svg>
            );
        }

        const xStep = chartData.length > 1 ? chartWidth / (chartData.length - 1) : 0;
        const priceRange = maxPrice - minPrice;
        const yScale = priceRange > 0 ? chartHeight / priceRange : 0;

        const getX = (idx) => paddingLeft + idx * xStep;
        const getY = (price) => {
            if (priceRange === 0) return paddingTop + chartHeight / 2;
            return paddingTop + chartHeight - (price - minPrice) * yScale;
        };

        const pathD = chartData.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.price);
            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        const areaD = `${pathD} L ${getX(chartData.length - 1)} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`;

        const yTicks = 4;
        const yTickValues = [];
        for (let i = 0; i <= yTicks; i++) {
            yTickValues.push(minPrice + (priceRange * i / yTicks));
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {yTickValues.map((val, idx) => {
                    const y = getY(val);
                    return (
                        <g key={idx}>
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                            <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
                                ¥{val.toFixed(2)}
                            </text>
                        </g>
                    );
                })}

                <path d={areaD} fill="url(#priceGradient)" />
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {chartData.map((p, idx) => {
                    const x = getX(idx);
                    const y = getY(p.price);
                    const isHighest = idx === highestIdx;
                    const isLowest = idx === lowestIdx && !isHighest;
                    const isCurrent = p.isCurrent;
                    let fillColor = '#3b82f6';
                    let strokeColor = '#fff';
                    let radius = 5;
                    if (isHighest) { fillColor = '#ef4444'; radius = 7; }
                    else if (isLowest) { fillColor = '#10b981'; radius = 7; }
                    else if (isCurrent) { fillColor = '#6366f1'; radius = 6; }

                    return (
                        <g key={idx}>
                            <circle cx={x} cy={y} r={radius} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
                            {isHighest && (
                                <text x={x} y={y - 14} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">
                                    最高 ¥{p.price.toFixed(2)}
                                </text>
                            )}
                            {isLowest && (
                                <text x={x} y={y - 14} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">
                                    最低 ¥{p.price.toFixed(2)}
                                </text>
                            )}
                            {isCurrent && !isHighest && !isLowest && (
                                <text x={x} y={y - 14} textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="700">
                                    当前 ¥{p.price.toFixed(2)}
                                </text>
                            )}
                            {chartData.length <= 8 && (
                                <text x={x} y={height - 25} textAnchor="middle" fill="#6b7280" fontSize="9" transform={`rotate(-30, ${x}, ${height - 25})`}>
                                    {p.time.split(' ')[0]}
                                </text>
                            )}
                        </g>
                    );
                })}

                {chartData.length > 1 && (
                    <>
                        <text x={paddingLeft} y={height - 8} textAnchor="start" fill="#9ca3af" fontSize="10">
                            {chartData[0].time}
                        </text>
                        <text x={width - paddingRight} y={height - 8} textAnchor="end" fill="#9ca3af" fontSize="10">
                            {chartData[chartData.length - 1].time}
                        </text>
                    </>
                )}
            </svg>
        );
    };

    const timeRangeOptions = [
        { key: 'month', label: '近一月' },
        { key: 'year', label: '近一年' },
        { key: 'all', label: '全部' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] transform transition-all scale-100 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            价格历史走势
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{book?.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                {timeRangeOptions.map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setTimeRange(opt.key)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                            timeRange === opt.key
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {stats && (
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                                        <div className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">当前价</div>
                                        <div className="text-lg font-bold text-indigo-700">¥{Number(stats.currentPrice).toFixed(2)}</div>
                                    </div>
                                    <div className="px-4 py-2 bg-red-50 rounded-xl">
                                        <div className="text-[10px] text-red-500 font-medium uppercase tracking-wider">最高价</div>
                                        <div className="text-lg font-bold text-red-700">¥{Number(stats.highestPrice).toFixed(2)}</div>
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                                        <div className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">最低价</div>
                                        <div className="text-lg font-bold text-emerald-700">¥{Number(stats.lowestPrice).toFixed(2)}</div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl ${Number(stats.changeAmount) >= 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                                        <div className={`text-[10px] font-medium uppercase tracking-wider ${Number(stats.changeAmount) >= 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                            {Number(stats.changeAmount) >= 0 ? '涨幅' : '跌幅'}
                                        </div>
                                        <div className={`text-lg font-bold ${Number(stats.changeAmount) >= 0 ? 'text-orange-700' : 'text-green-700'}`}>
                                            {Number(stats.changeAmount) >= 0 ? '+' : ''}{Number(stats.changeAmount).toFixed(2)}
                                            <span className="text-sm font-medium ml-1">({Number(stats.changePercent).toFixed(2)}%)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 mb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : (
                                renderChart()
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                变更明细
                                <span className="text-xs font-normal text-gray-400">共 {history.length} 条记录</span>
                            </h3>

                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm">暂无价格变更记录</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((h, idx) => {
                                        const diff = Number(h.newPrice) - Number(h.oldPrice);
                                        const diffPercent = Number(h.oldPrice) > 0 ? (diff / Number(h.oldPrice)) * 100 : 0;
                                        const isUp = diff > 0;
                                        return (
                                            <div key={h.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUp ? 'bg-orange-50' : 'bg-green-50'}`}>
                                                            <svg className={`w-5 h-5 ${isUp ? 'text-orange-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {isUp ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                                )}
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="font-semibold text-gray-800">
                                                                    ¥{Number(h.oldPrice).toFixed(2)}
                                                                </span>
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                </svg>
                                                                <span className={`font-bold ${isUp ? 'text-orange-600' : 'text-green-600'}`}>
                                                                    ¥{Number(h.newPrice).toFixed(2)}
                                                                </span>
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                                    {isUp ? '+' : ''}{diff.toFixed(2)} ({diffPercent.toFixed(2)}%)
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    {h.modifierName}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {formatDateTime(h.createdAt)}
                                                                </span>
                                                            </div>
                                                            {h.changeReason && (
                                                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                                                    <span className="text-gray-400 text-xs mr-1">备注：</span>
                                                                    {h.changeReason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookPriceHistory;
