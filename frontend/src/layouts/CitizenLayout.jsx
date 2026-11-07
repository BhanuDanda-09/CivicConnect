import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function CitizenLayout() {
  return (
    <DashboardLayout
      title="Citizen Portal"
      subtitle="Report civic grievances, track repair progress, and improve your neighborhood."
    >
      <Outlet />
    </DashboardLayout>
  );
}

