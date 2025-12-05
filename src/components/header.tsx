"use client"

import { Frame } from 'lucide-react';
import React from 'react';

const Header = () => {
  return (
    <header className="py-4 px-4 md:px-8">
      <div className="flex items-center gap-3">
        <Frame className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight">
          Photo Mosaic Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
