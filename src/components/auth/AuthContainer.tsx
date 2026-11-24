import { useState, useEffect } from 'react';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { supabase } from '../../lib/supabase';

interface AuthContainerProps {
    onAuthSuccess: () => void;
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
    const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

    useEffect(() => {
        // Detect recovery token in URL hash (e.g. from password reset email link)
        if (
            window.location.hash.includes('type=recovery') ||
            window.location.search.includes('type=recovery')
        ) {
            setAuthView('reset');
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setAuthView('reset');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (authView === 'reset') {
        return (
            <ResetPasswordScreen
                onSuccess={() => {
                    setAuthView('login');
                    onAuthSuccess();
                }}
            />
        );
    }

    if (authView === 'forgot') {
        return (
            <ForgotPasswordScreen
                onBackToLogin={() => setAuthView('login')}
                onSuccess={() => {
                    setAuthView('login');
                    onAuthSuccess();
                }}
            />
        );
    }

    if (authView === 'register') {
        return (
            <RegisterScreen
                onSwitchToLogin={() => setAuthView('login')}
                onSuccess={onAuthSuccess}
            />
        );
    }

    return (
        <LoginScreen
            onSwitchToRegister={() => setAuthView('register')}
            onSwitchToForgotPassword={() => setAuthView('forgot')}
            onSuccess={onAuthSuccess}
        />
    );
}
