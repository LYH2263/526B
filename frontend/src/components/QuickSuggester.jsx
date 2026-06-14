import React, { useState, useRef, useEffect } from 'react';

const QuickSuggester = ({ onSelect }) => {
  const suggestions = [
    '想看适合初中生、轻松点的科幻',
    '推荐几本适合大学生读的文学经典',
    '有什么轻松幽默的历史书',
    '想读一些治愈系的小说',
    '适合程序员入门的编程书',
    '深刻一点的哲学书',
    '适合青少年的悬疑推理小说',
    '轻松有趣的科普读物',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default QuickSuggester;
