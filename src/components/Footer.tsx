export default function Footer() {
  return (
    <footer className="py-12 border-t border-border/30 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold gold-gradient-text">PropFirm Knowledge</span>
            <p className="text-muted-foreground text-sm mt-1">
              India's Fastest Growing Prop Trading Ecosystem
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#benefits" className="hover:text-primary transition-colors">Benefits</a>
            <a href="#community" className="hover:text-primary transition-colors">Community</a>
            <a href="#discounts" className="hover:text-primary transition-colors">Discounts</a>
          </div>

          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} PropFirm Knowledge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
