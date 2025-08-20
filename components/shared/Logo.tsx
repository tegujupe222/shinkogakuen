import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* 背景の円形 */}
            <div className="absolute inset-0 bg-black rounded-full"></div>
            
            {/* 金色の翼のような装飾 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    {/* 左翼 */}
                    <div className="absolute -left-2 -top-1 w-3 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full transform -rotate-12 opacity-80"></div>
                    {/* 右翼 */}
                    <div className="absolute -right-2 -top-1 w-3 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full transform rotate-12 opacity-80"></div>
                </div>
            </div>
            
            {/* 「高」の文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-center leading-none select-none"
                      style={{
                          fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          background: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                      }}>
                    高
                </span>
            </div>
        </div>
    );
};

export default Logo;
