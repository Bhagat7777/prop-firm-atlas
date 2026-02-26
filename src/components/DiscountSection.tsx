import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

const plans = [
  { size: '$10K', original: '$199', discounted: '$119', savings: '40%' },
  { size: '$25K', original: '$349', discounted: '$209', savings: '40%', popular: true },
  { size: '$50K', original: '$549', discounted: '$329', savings: '40%' },
];

export default function DiscountSection() {
  return (
    <section id="discounts" className="py-24 sm:py-32 section-gradient relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 gold-gradient text-primary-foreground px-6 py-2 rounded-full text-sm font-bold mb-6 animate-glow-pulse"
          >
            <Zap className="w-4 h-4" />
            LIMITED TIME — 40% OFF
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
            Get Funded at the{' '}
            <span className="gold-gradient-text">Best Prices</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base sm:text-lg">
            Exclusive discount codes negotiated directly with top prop firms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.size}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 rounded-2xl text-center relative ${
                plan.popular ? 'border-primary/50 gold-glow scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <p className="text-muted-foreground text-sm font-medium mb-1">Account Size</p>
              <h3 className="text-3xl font-bold gold-gradient-text mb-4">{plan.size}</h3>

              <div className="space-y-1 mb-6">
                <p className="text-muted-foreground line-through text-lg">{plan.original}</p>
                <p className="text-3xl font-extrabold text-foreground">{plan.discounted}</p>
                <p className="text-primary text-sm font-bold">Save {plan.savings}</p>
              </div>

              <a
                href="#"
                className="gold-gradient text-primary-foreground w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 gold-glow-hover transition-all duration-300 hover:scale-105"
              >
                Get My Discount <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
