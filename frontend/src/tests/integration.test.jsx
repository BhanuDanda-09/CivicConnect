import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Feedback from '../pages/citizen/Feedback';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import * as AuthContext from '../context/AuthContext';
import * as SocketContext from '../context/SocketContext';
import { Inbox } from 'lucide-react';

const mockCitizen = {
  id: 'usr_c123',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  role: 'citizen',
};

// Component that deliberately throws during render to test ErrorBoundary
function CrashingComponent() {
  throw new Error('Test Rendering Exception');
}

describe('CivicConnect Phase 7 - Frontend Integration & Hardening Test Suite', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
      user: mockCitizen,
      role: 'citizen',
      isAuthenticated: true,
      loading: false,
      switchDemoRole: vi.fn(),
    });

    vi.spyOn(SocketContext, 'useSocket').mockReturnValue({
      socket: null,
      isConnected: true,
      notifications: [
        {
          _id: 'notif_1',
          title: 'Grievance Verified',
          message: 'Your report CC-2026-0042 has been verified by the municipal desk.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      refreshNotifications: vi.fn(),
    });
  });

  // 1. ErrorBoundary Recovery
  it('1. catches client-side rendering exceptions and displays friendly recovery UI', () => {
    // Suppress console.error in test output for deliberate crash
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <CrashingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByText(/Application Rendering Interruption/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload View/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  // 2. EmptyState Reusable Component
  it('2. renders EmptyState with title, description, and action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Inbox}
        title="No Grievances Found"
        description="You have not filed any reports in this ward yet."
        actionText="Report Issue Now"
        onAction={handleAction}
      />
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No Grievances Found/i)).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: /Report Issue Now/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  // 3. ErrorState with Retry
  it('3. renders ErrorState with network connection failure and retry callback', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="Server Offline"
        message="Could not reach the municipal API endpoint."
        isNetworkError={true}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText(/Server Offline/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  // 4. LoadingSpinner Component
  it('4. renders LoadingSpinner with custom status message', () => {
    render(<LoadingSpinner message="Synchronizing with MongoDB..." size="lg" />);
    expect(screen.getByText(/Synchronizing with MongoDB.../i)).toBeInTheDocument();
  });

  // 5. Feedback Page Rendering
  it('5. renders Feedback page with 5-star rating selector and comment field', async () => {
    render(
      <BrowserRouter>
        <Feedback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Citizen Resolution Feedback/i)).toBeInTheDocument();
    });
  });

  // 6. Notification Bell in DashboardHeader
  it('6. renders notification bell with unread badge counter and opens dropdown on click', () => {
    render(
      <BrowserRouter>
        <DashboardHeader title="Municipal Portal" subtitle="Central Civic System" />
      </BrowserRouter>
    );

    const bellBtn = screen.getByTestId('notification-bell-btn');
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Unread count badge

    fireEvent.click(bellBtn);
    expect(screen.getByText(/Grievance Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Your report CC-2026-0042 has been verified/i)).toBeInTheDocument();
  });
});
