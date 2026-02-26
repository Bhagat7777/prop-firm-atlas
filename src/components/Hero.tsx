import { Suspense, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import HeroScene from './HeroScene';
import { trackAndRedirect } from '@/lib/tracking';
import heroBg from '@/assets/hero-bg.jpg';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-background/70" />

      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          style={{ rotateX, rotateY, perspective: 1000 }}
          className="space-y-6 sm:space-y-8"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-semibold text-sm sm:text-base tracking-widest uppercase"
          >
            India's #1 Prop Trading Ecosystem
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight text-balance"
          >
            Trade Smarter.{' '}
            <span className="gold-gradient-text">Get Funded.</span>
            <br />
            Get Paid.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            India's Fastest Growing Prop Trading Ecosystem with Verified Payout Support,
            Exclusive Discounts, and Active Analyst Community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => trackAndRedirect('Discount')}
              className="gold-gradient text-primary-foreground px-8 py-4 rounded-xl text-base font-bold gold-glow-hover transition-all duration-300 hover:scale-105 w-full sm:w-auto text-center animate-glow-pulse cursor-pointer"
            >
              Unlock 40% Discount
            </button>
            <button
              onClick={() => trackAndRedirect('Discord', 'https://discord.gg/')}
              className="glass-card text-foreground px-8 py-4 rounded-xl text-base font-semibold hover:border-primary/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto text-center cursor-pointer"
            >
              Join Discord Community
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
