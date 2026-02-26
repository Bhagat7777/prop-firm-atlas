import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress <= 100 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        >
          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <span className="text-3xl sm:text-4xl font-extrabold gold-gradient-text">
              PropFirm Knowledge
            </span>
          </motion.div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gold-gradient rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-xs mt-4 tracking-widest uppercase"
          >
            Loading Experience
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
