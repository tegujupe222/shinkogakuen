import React from 'react';
import Image from 'next/image';

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
            <Image
                src="/logo.png"
                alt="神港学園高等学校 ロゴ"
                width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
                height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
                className="w-full h-full object-contain"
                priority={size === 'lg'} // ログイン画面の大きなロゴは優先読み込み
            />
        </div>
    );
};

export default Logo;
