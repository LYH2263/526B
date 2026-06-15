import React from 'react';

const BranchSelector = ({ branches, selectedBranch, onSelect, showAll = true }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {showAll && (
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedBranch === null
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部分馆
        </button>
      )}
      {branches?.map((branch) => (
        <button
          key={branch.id}
          onClick={() => onSelect(branch.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedBranch === branch.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {branch.name}
        </button>
      ))}
    </div>
  );
};

export default BranchSelector;
