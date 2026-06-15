import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
}: ConfirmModalProps) {
  // Prevent clicks from bubbing out
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={handleContentClick}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl p-6 overflow-hidden text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider font-display">{title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">Confirmation Required</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description content */}
            <div className="mb-6">
              <p className="text-xs text-zinc-400 leading-relaxed font-light">{message}</p>
            </div>

            {/* Actions button footer */}
            <div className="flex items-center justify-end gap-3 font-mono text-[11px]">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors uppercase tracking-widest font-semibold cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-black transition-colors cursor-pointer ${
                  isDanger
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-white hover:bg-zinc-200'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}