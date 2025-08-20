import React from 'react';
import Image from 'next/image';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <Image
                src="/logo.png"
                alt="神港学園高等学校 ロゴ"
                width={size === 'sm' ? 40 : size === 'md' ? 64 : 96}
                height={size === 'sm' ? 40 : size === 'md' ? 64 : 96}
                className="w-full h-full object-contain"
                priority={size === 'lg'} // ログイン画面の大きなロゴは優先読み込み
            />
        </div>
    );
};

export default Logo;
