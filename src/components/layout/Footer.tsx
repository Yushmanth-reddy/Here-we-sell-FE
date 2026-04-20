import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span>Here We Sell — IIITM Gwalior Campus Marketplace</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link to="/sell" className="transition-colors hover:text-foreground">
            Sell
          </Link>
        </div>
      </div>
    </footer>
  );
}
