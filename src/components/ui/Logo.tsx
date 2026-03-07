import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-sm"
            >
                <defs>
                    <linearGradient id="logoGradAnim" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C8B6FF" />   {/* pastel-purple */}
                        <stop offset="50%" stopColor="#A0C4FF" />  {/* pastel-blue */}
                        <stop offset="100%" stopColor="#94CDB8" /> {/* pastel-teal */}
                    </linearGradient>
                </defs>
                <motion.path
                    d="M 10,70 C 5,50 30,30 20,60 C 15,80 40,80 30,50 C 25,30 40,20 50,40 C 60,10 85,10 90,30 C 95,50 85,70 50,90 C 15,70 5,50 10,30 C 15,10 40,10 50,40"
                    fill="none"
                    stroke="url(#logoGradAnim)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                    }}
                />
            </motion.svg>
        </div>
    );
};
