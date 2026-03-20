'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorToast({ message, onDismiss }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg px-5 py-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">Something went wrong</p>
              <p className="text-sm text-red-600 mt-0.5">{message}</p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded-md hover:bg-red-100 transition-colors"
            >
              <X size={16} className="text-red-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
