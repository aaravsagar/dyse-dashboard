import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  guildId?: string;
  title?: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, guildId, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar guildId={guildId} title={title} subtitle={subtitle} />
      <div className="md:ml-64">
        <main className="min-h-[calc(100vh-73px)] bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;