import React, { useEffect } from "react";

interface PageWrapperProps {
    title?: string;
    children: React.ReactNode;
}

export const PageWrapper = ({ title, children }: PageWrapperProps) => {
    // Set browser tab title
    useEffect(() => {
        if (title) {
            document.title = `${title} | MyApp`;
        }
    }, [title]);

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-4">
            {title && (
                <h1 className="text-2xl font-bold mb-4">
                    {title}
                </h1>
            )}

            {children}
        </div>
    );
};