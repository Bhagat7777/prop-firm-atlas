import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Percent, MessageCircle, Gift, BookOpen, Eye } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Verified Payout Support',
    description: 'We track and verify every payout claim to ensure transparency and trust in the prop trading space.',
    detail: 'Our team independently verifies payouts from all major prop firms, giving you confidence in choosing the right firm.',
  },
  {
    icon: Percent,
    title: '30%–40% Exclusive Discounts',
    description: 'Access the best discount codes for top prop firms, saving you thousands on funded accounts.',
    detail: 'Negotiated directly with prop firms. Updated daily. Stack with seasonal promotions for maximum savings.',
  },
  {
    icon: MessageCircle,
    title: 'Active Discord Analyst Support',
    description: 'Get real-time market analysis, trade ideas, and mentorship from verified analysts.',
    detail: 'Daily market analysis, trade setups, risk management coaching, and Q&A sessions with experienced traders.',
  },
  {
    icon: Gift,
    title: 'Weekly Prop Firm Giveaways',
    description: 'Win free funded account challenges every week through our community giveaways.',
    detail: 'Participate in trading competitions and community events for a chance to win evaluation accounts.',
  },
  {
    icon: BookOpen,
    title: 'Free Trading Journal Tool',
    description: 'Track your trades, analyze performance, and improve your strategy with our free journal.',
    detail: 'Auto-import trades, advanced analytics, pattern recognition, and performance tracking dashboard.',
  },
  {
    icon: Eye,
    title: 'Transparent Payout Tracking',
    description: 'Real-time tracking of payout cases across firms for complete transparency.',
    detail: 'See payout timelines, success rates, and community reviews for every supported prop firm.',
  },
];

function TiltCard({ children, index }: { children: React.ReactNode; index: number }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
    >
      {children}
    </motion.div>
  );
}

export default function Benefits() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="benefits" className="py-24 sm:py-32 section-gradient relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
            The Complete Prop Trading{' '}
            <span className="gold-gradient-text">Ecosystem</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            Everything you need to start, scale, and succeed in prop trading.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <TiltCard key={benefit.title} index={i}>
                <div className="glass-card p-6 sm:p-8 h-full group hover:border-primary/30 transition-all duration-300 gold-glow-hover cursor-pointer">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  <div className="mt-4 pt-4 border-t border-border/30 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-500 overflow-hidden">
                    <p className="text-sm text-muted-foreground/80">{benefit.detail}</p>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
