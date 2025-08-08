import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: number;
}

const STORAGE_KEY = 'typing-trainer-user';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        setUser(null);
      }
    } else {
      // Auto-login with default user if no stored user
      const defaultUser: User = {
        id: 'default_user',
        name: 'Typing Trainer User',
        email: 'user@typingtrainer.com',
        joinDate: Date.now()
      };
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Dummy login - accept any email/password
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0], // Use email prefix as name
          email,
          joinDate: Date.now()
        };
        setUser(newUser);
        resolve(true);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    updateProfile
  };
};
