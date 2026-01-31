import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface ToastState {
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showSuccess = useCallback((msg: string) => {
        setToast({ message: msg, type: 'success' });
    }, []);

    const showError = useCallback((msg: string) => {
        setToast({ message: msg, type: 'error' });
    }, []);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    return {
        toast,
        showSuccess,
        showError,
        closeToast
    };
}
