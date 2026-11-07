import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children, title, subtitle, action }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
          action={action}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
