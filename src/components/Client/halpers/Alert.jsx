import React, { useState, useEffect } from 'react';

const Alert = ({ show, onClose, message , duration = 3000}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timer;

    if (show) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);

      // ⏳ يخلي الـ Alert يختفي بعد المدة لي بغيتي
      if (duration > 0) {
        timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setIsMounted(false);
            onClose(); // نستدعي onClose باش نسدّه فالـ parent
          }, 300);
        }, duration);
      }
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300);
    }

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-4 pointer-events-none">
      <div className={`
        bg-white rounded-xl shadow-lg border border-gray-200 max-w-md w-full
        md:max-w-lg lg:max-w-xl
        transform transition-all duration-300 ease-in-out pointer-events-auto
        flex items-start space-x-3 p-4
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
      `}>
        <div className="flex-shrink-0 mt-0.5">
      </div>
        
        <div className="flex-1">
          <p className="text-gray-800 text-sm md:text-base">
            {message}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default Alert;