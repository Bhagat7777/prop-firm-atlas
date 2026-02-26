import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import CommunityStats from '@/components/CommunityStats';
import DiscountSection from '@/components/DiscountSection';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import GoldenParticles from '@/components/GoldenParticles';
import { trackVisitor } from '@/lib/tracking';
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  // Initialize analytics (add your IDs when ready)
  useAnalytics(/* 'G-XXXXXXXXXX', 'XXXXXXXXXX' */);

  useEffect(() => {
    trackVisitor();
  }, []);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <div className={`min-h-screen bg-background text-foreground ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <GoldenParticles />
        <Navbar />
        <Hero />
        <Benefits />
        <CommunityStats />
        <DiscountSection />
        <Footer />
      </div>
    </>
  );
};

export default Index;
