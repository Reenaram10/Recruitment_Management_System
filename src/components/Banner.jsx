import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Banner = ({ type, message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose();
    };

    if (!message || !visible) return null;

    return (
        <div className={`banner ${type === 'error' ? 'error' : type === 'info' ? 'info' : 'success'}`}>
            {type === 'error' ? (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
            ) : type === 'info' ? (
                <Info size={18} style={{ flexShrink: 0 }} />
            ) : (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, lineHeight: 1.35 }}>{message}</span>
            <button
                type="button"
                onClick={handleClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem',
                    marginLeft: '0.4rem',
                    opacity: 0.75,
                    borderRadius: '4px'
                }}
                title="Dismiss notification"
            >
                <X size={15} />
            </button>
        </div>
    );
};
