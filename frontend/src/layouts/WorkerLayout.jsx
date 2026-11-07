import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function WorkerLayout() {
  return (
    <DashboardLayout
      title="Field Worker Desk"
      subtitle="View dispatched repairs, navigate on-site, upload progress photos, and mark tasks completed."
    >
      <Outlet />
    </DashboardLayout>
  );
}
