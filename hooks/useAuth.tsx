'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { AuthenticatedUser } from '../types';

interface AuthContextType {
    user: AuthenticatedUser | null;
    loading: boolean;
    login: (examNo: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);

    // 初期化時にローカルストレージからユーザー情報を復元
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const savedToken = localStorage.getItem('token');
            
            if (savedUser && savedToken) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Failed to parse saved user:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error('Error during auth initialization:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (examNo: string, password: string): Promise<boolean> => {
        try {
            const requestBody = { examNo, password };

            console.log('Login attempt:', { examNo, requestBody });

            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('Login failed:', error);
                throw new Error(error.error || 'ログインに失敗しました');
            }

            const data = await response.json();
            console.log('Login success:', data);
            
            const userData: AuthenticatedUser = {
                id: data.user.id,
                exam_no: data.user.exam_no,
                email: data.user.email,
                role: data.user.role,
                name: data.user.name
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        try {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
