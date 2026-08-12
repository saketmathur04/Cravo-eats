import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  lottieSrc: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ title, description, lottieSrc, actionLabel, onAction, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs mb-8"
      >
        <DotLottieReact
          src={lottieSrc}
          loop
          autoplay
          className="w-full h-full"
        />
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold tracking-tight text-foreground mb-2"
      >
        {title}
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-foreground/60 mb-8 max-w-sm"
      >
        {description}
      </motion.p>
      {actionLabel && onAction && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} size="lg" className="rounded-full px-8">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
