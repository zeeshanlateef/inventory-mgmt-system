import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const addToast = useCallback(({ type = 'info', title, message }) => {
    const text = title ? `${title}: ${message}` : message;
    const options = {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };
    
    if (type === 'success') {
      toast.success(text, options);
    } else if (type === 'error') {
      toast.error(text, options);
    } else if (type === 'warning') {
      toast.warn(text, options);
    } else {
      toast.info(text, options);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer theme="colored" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
