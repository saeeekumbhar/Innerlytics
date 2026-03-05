import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const Login = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4 relative overflow-hidden">
      {/* Decorative calm background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-pastel-purple)]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-pastel-blue)]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-pastel-peach)]/20 rounded-full blur-[80px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass p-10 md:p-14 rounded-[3rem] soft-shadow max-w-md w-full text-center border-none relative z-10"
      >
        <div className="mb-10 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-pastel-purple)]/30"
          >
            <span className="text-4xl text-white">✨</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-primary)] mb-3 tracking-tight">Innerlytics</h1>
          <p className="text-[var(--color-pastel-purple)] text-lg md:text-xl font-medium tracking-wide">Reflect. Understand. Evolve.</p>
        </div>

        <div className="space-y-8">
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-[15px]">
            Your soft digital diary + intelligent emotional dashboard. Track your mood, journal your thoughts, and find peace.
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center px-6 py-4 border border-[var(--color-border-subtle)]/50 text-base font-medium rounded-full text-[var(--color-text-primary)] bg-[var(--color-bg-primary)]/80 hover:bg-[var(--color-bg-primary)] focus:outline-none transition-all duration-300 soft-shadow hover:shadow-lg hover:-translate-y-1 active:scale-95 group"
          >
            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-[var(--color-text-secondary)]/70 mt-4 leading-relaxed px-4">
            By signing in, you step into a safe space. We respect your Privacy and Terms of Service.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
