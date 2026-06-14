import React from 'react';

const levelConfig = {
    COMMON: { name: '普通会员', color: '#9CA3AF', bgColor: 'bg-gray-100', textColor: 'text-gray-600', icon: '⭐' },
    SILVER: { name: '银会员', color: '#60A5FA', bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: '⭐⭐' },
    GOLD: { name: '金会员', color: '#FBBF24', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', icon: '⭐⭐⭐' },
    DIAMOND: { name: '钻石会员', color: '#A78BFA', bgColor: 'bg-purple-50', textColor: 'text-purple-600', icon: '👑' }
};

const LevelBadge = ({ level, size = 'md', showName = true }) => {
    const config = levelConfig[level] || levelConfig.COMMON;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 font-bold rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
            style={{ borderColor: config.color }}
        >
            <span>{config.icon}</span>
            {showName && <span>{config.name}</span>}
        </span>
    );
};

export default LevelBadge;
