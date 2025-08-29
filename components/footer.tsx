// components/footer.tsx
'use client'; // Next.js 13+ App Router requires this for client components

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-4 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} Search Gourmet
          </p>
          
          <a
            href="https://webservice.recruit.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            Powered by ホットペッパーグルメ Webサービス
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
