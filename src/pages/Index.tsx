import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import CommunityStats from '@/components/CommunityStats';
import DiscountSection from '@/components/DiscountSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Benefits />
      <CommunityStats />
      <DiscountSection />
      <Footer />
    </div>
  );
};

export default Index;
