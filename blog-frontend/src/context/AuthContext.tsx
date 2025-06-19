import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('steakz_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('steakz_user');
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('steakz_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('steakz_user');
        }
    }, [user]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Call the backend login API
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // The backend returns the authenticated user
                const authenticatedUser: User = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role
                };
                setUser(authenticatedUser);
                return true;
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            // Call the backend signup API
            const response = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // The backend returns the created user
                const newUser: User = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role || 'CUSTOMER'
                };
                setUser(newUser);
                return true;
            } else {
                const errorData = await response.json();
                console.error('Signup failed:', errorData);
                return false;
            }
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('steakz_user');
        localStorage.removeItem('steakz_orders'); // Optionally clear orders too
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};