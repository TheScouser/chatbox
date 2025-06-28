import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    className?: string;
    children?: React.ReactNode;
}

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    className,
    children,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div
            className={cn("relative", className)}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-blue-500 transition-all duration-300 ease-in-out"
                />
            </svg>
            {/* Content in center */}
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
} 