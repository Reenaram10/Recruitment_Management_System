import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Banner = ({ type, message }) => {
    if (!message) return null;

    return (
        <div className={`banner ${type === 'error' ? 'error' : 'success'}`}>
            {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{message}</span>
        </div>
    );
};
