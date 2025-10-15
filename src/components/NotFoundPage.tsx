import React from 'react';
import { Home } from 'lucide-react';
import { Button } from './ui/button';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="font-tangerine text-9xl md:text-[200px] text-white drop-shadow-lg mb-4">
            404
          </h1>
          <h2 className="text-white text-3xl md:text-5xl mb-4">Page Not Found</h2>
          <p className="text-rose-200 text-xl max-w-md mx-auto mb-8">
            Oops! The page you're looking for seems to have wandered off. Let's get you back to
            beauty.
          </p>
        </div>
        <Button
          onClick={() => onNavigate('home')}
          className="bg-white text-rose-600 hover:bg-amber-400 hover:text-white px-8 py-6 text-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
}
