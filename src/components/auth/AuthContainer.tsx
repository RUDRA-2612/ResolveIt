import { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

interface AuthContainerProps {
    onAuthSuccess: () => void;
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

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
            onSuccess={onAuthSuccess}
        />
    );
}