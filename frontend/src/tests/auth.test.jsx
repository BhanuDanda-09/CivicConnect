import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Helper component to test AuthContext consumer
function TestAuthConsumer() {
  const { user, isAuthenticated, role, isAdmin, isWorker, isCitizen } = useAuthContext();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="auth-role">{role || 'none'}</div>
      <div data-testid="is-admin">{isAdmin ? 'yes' : 'no'}</div>
      <div data-testid="is-worker">{isWorker ? 'yes' : 'no'}</div>
      <div data-testid="is-citizen">{isCitizen ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('Frontend Authentication & RBAC Suite', () => {
  it('provides clean unauthenticated state by default when no token in localStorage', () => {
    localStorage.clear();
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('auth-role')).toHaveTextContent('none');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('no');
  });

  it('renders login page with email and password fields', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('displays validation errors on empty login submission', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('renders register page with required citizen fields and no role selector', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /register as a citizen/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\., Rahul Sharma/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    // Role selection should not exist in public registration
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
  });

  it('validates mismatched passwords on registration', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\., Rahul Sharma/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Flat 402/i), {
      target: { value: 'Ward 4' },
    });
    fireEvent.change(screen.getByPlaceholderText(/min 6 characters/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), {
      target: { value: 'Different123' },
    });

    const submitBtn = screen.getByRole('button', { name: /complete registration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});

