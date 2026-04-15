import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [activeRequests, setActiveRequests] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => {
        setActiveRequests(prev => {
            const newCount = prev + 1;
            setIsLoading(newCount > 0);
            return newCount;
        });
    };

    const stopLoading = () => {
        setActiveRequests(prev => {
            const newCount = Math.max(0, prev - 1);
            setIsLoading(newCount > 0);
            return newCount;
        });
    };

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            {/* Global Loading Overlay - DISABLED (was irritating) */}
        </LoadingContext.Provider>
    );
};
