import { useEffect, useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

type FeedbackType = 'success' | 'error' | 'warning';

interface FeedbackAnimationProps {
  type: FeedbackType;
  message?: string;
  show: boolean;
  onClose?: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

export function FeedbackAnimation({
  type,
  message,
  show,
  onClose,
  duration = 3000,
  position = 'top',
}: FeedbackAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const config = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      defaultMessage: 'Completado',
    },
    error: {
      icon: X,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      defaultMessage: 'Error',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-black',
      defaultMessage: 'Advertencia',
    },
  };

  const { icon: Icon, bgColor, textColor, defaultMessage } = config[type];

  return (
    <div
      className={clsx(
        'fixed left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3',
        bgColor,
        textColor,
        position === 'top' ? 'top-20' : 'bottom-20',
        isVisible ? 'animate-slideDown' : 'animate-fadeOut'
      )}
    >
      <div className="p-1 bg-white/20 rounded-full">
        <Icon size={18} />
      </div>
      <span className="font-medium">{message || defaultMessage}</span>
    </div>
  );
}

// Hook for easy feedback management
interface UseFeedbackReturn {
  showFeedback: (type: FeedbackType, message?: string) => void;
  FeedbackComponent: React.FC;
}

export function useFeedback(): UseFeedbackReturn {
  const [feedbackState, setFeedbackState] = useState<{
    show: boolean;
    type: FeedbackType;
    message?: string;
  }>({
    show: false,
    type: 'success',
    message: undefined,
  });

  const showFeedback = (type: FeedbackType, message?: string) => {
    setFeedbackState({ show: true, type, message });
  };

  const handleClose = () => {
    setFeedbackState((prev) => ({ ...prev, show: false }));
  };

  const FeedbackComponent = () => (
    <FeedbackAnimation
      type={feedbackState.type}
      message={feedbackState.message}
      show={feedbackState.show}
      onClose={handleClose}
    />
  );

  return { showFeedback, FeedbackComponent };
}

// Shake animation wrapper for error states
interface ShakeWrapperProps {
  children: React.ReactNode;
  shake: boolean;
  className?: string;
}

export function ShakeWrapper({ children, shake, className }: ShakeWrapperProps) {
  return (
    <div className={clsx(shake && 'animate-shake', className)}>{children}</div>
  );
}

// Pulse animation for attention
interface PulseWrapperProps {
  children: React.ReactNode;
  pulse: boolean;
  className?: string;
}

export function PulseWrapper({ children, pulse, className }: PulseWrapperProps) {
  return (
    <div className={clsx(pulse && 'animate-pulse', className)}>{children}</div>
  );
}
