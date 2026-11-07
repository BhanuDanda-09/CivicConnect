import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import ManageWorkers from '../pages/admin/ManageWorkers';
import ComplaintMap from '../components/common/ComplaintMap';
import * as AuthContext from '../context/AuthContext';

// Mock AuthContext
const mockWorkerUser = {
  id: 'usr_worker_01',
  name: 'Ramesh Patel',
  email: 'ramesh.worker@civicconnect.org',
  role: 'worker',
  trade: 'Roads & Public Infrastructure',
  ward: 'Ward 1 - Central Market',
};

const mockAdminUser = {
  id: 'usr_admin_01',
  name: 'Priya Deshmukh',
  email: 'admin@civicconnect.org',
  role: 'admin',
};

describe('CivicConnect Phase 6 - Frontend Dashboards Test Suite', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
      user: mockWorkerUser,
      isAuthenticated: true,
      loading: false,
    });
  });

  // 1. Admin Dashboard Rendering
  it('1. renders AdminDashboard with Municipal Command banner and KPI metric cards', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/City Civic Grievance Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics Time Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Action/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigned Crew/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
  });

  // 2. Admin Dashboard Time Filter Switching
  it('2. switches time horizon filters (7 Days, 30 Days, 3 Months, All Time)', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    const sevenDaysBtn = screen.getByRole('button', { name: /7 Days/i });
    expect(sevenDaysBtn).toBeInTheDocument();

    fireEvent.click(sevenDaysBtn);
    expect(sevenDaysBtn).toHaveClass('bg-indigo-600');
  });

  // 3. Worker Dashboard Rendering & Personal Metrics
  it('3. renders WorkerDashboard with Officer Profile, assigned task metrics, and queue', async () => {
    render(
      <BrowserRouter>
        <WorkerDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Officer Ramesh Patel/i)).toBeInTheDocument();
    expect(screen.getByText(/Municipal Field Operations Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/New Dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/Active in Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed & Closed/i)).toBeInTheDocument();
    expect(screen.getByText(/Work Order Action Queue/i)).toBeInTheDocument();
  });

  // 4. Interactive ComplaintMap Component
  it('4. renders ComplaintMap with geocoded count and priority legend', () => {
    const mockLocations = [
      {
        id: '1',
        complaintId: 'CC-2026-0001',
        title: 'Deep pothole on MG Road',
        priority: 'EMERGENCY',
        status: 'IN_PROGRESS',
        ward: 'Ward 1',
        lat: 18.5204,
        lng: 73.8567,
      },
    ];

    render(
      <BrowserRouter>
        <ComplaintMap locations={mockLocations} title="Live Incident Map" />
      </BrowserRouter>
    );

    expect(screen.getByText(/Live Incident Map/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Geocoded/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency/i)).toBeInTheDocument();
    expect(screen.getByText(/High/i)).toBeInTheDocument();
  });

  // 5. Manage Workers Page & Modal
  it('5. renders ManageWorkers registry and opens Add Field Worker modal', async () => {
    render(
      <BrowserRouter>
        <ManageWorkers />
      </BrowserRouter>
    );

    expect(screen.getByText(/Municipal Field Crew Registry/i)).toBeInTheDocument();
    const addWorkerBtn = screen.getByRole('button', { name: /Add Field Worker/i });
    expect(addWorkerBtn).toBeInTheDocument();

    fireEvent.click(addWorkerBtn);
    expect(screen.getByText(/Register Municipal Field Officer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Ramesh Chandra Patel/i)).toBeInTheDocument();
  });
});
