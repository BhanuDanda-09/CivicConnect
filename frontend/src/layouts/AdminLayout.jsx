import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function AdminLayout() {
  return (
    <DashboardLayout
      title="Municipal Operations Hub"
      subtitle="Verify grievances, assign field crews, track SLA timelines, and review civic metrics."
    >
      <Outlet />
    </DashboardLayout>
  );
}
