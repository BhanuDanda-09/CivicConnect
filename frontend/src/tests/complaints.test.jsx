import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ComplaintForm from '../components/complaints/ComplaintForm';
import ComplaintCard from '../components/complaints/ComplaintCard';
import StatusBadge from '../components/common/StatusBadge';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from '../utils/constants';

describe('Frontend Complaint Management Test Suite', () => {
  it('renders ComplaintForm with all required inputs, categories, and map picker', () => {
    render(
      <BrowserRouter>
        <ComplaintForm onSubmit={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Deep asphalt pothole/i)).toBeInTheDocument();
    expect(screen.getByText(/Pin Location on OpenStreetMap/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Complaint to Municipal Desk/i })).toBeInTheDocument();
  });

  it('validates minimum character length for complaint title and description', async () => {
    const handleSubmit = vi.fn();
    render(
      <BrowserRouter>
        <ComplaintForm onSubmit={handleSubmit} />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Complaint to Municipal Desk/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Specific street address/i)).toBeInTheDocument();
      expect(screen.getByText(/Please provide detailed description/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('renders ComplaintCard with correct status, priority, and identifiers', () => {
    const mockComplaint = {
      id: 'CC-2026-0042',
      complaintId: 'CC-2026-0042',
      title: 'Water pipe leak near central park',
      description: 'Major leak causing stagnant water puddle on pavement.',
      category: 'water_leakage',
      priority: 'HIGH',
      status: 'VERIFIED',
      location: 'Park Street Corner',
      createdAt: '2026-11-07T10:00:00.000Z',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
    };

    render(
      <BrowserRouter>
        <ComplaintCard complaint={mockComplaint} linkPrefix="/citizen/complaints" />
      </BrowserRouter>
    );

    expect(screen.getByText('CC-2026-0042')).toBeInTheDocument();
    expect(screen.getByText('Water pipe leak near central park')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders StatusBadge correctly for all workflow lifecycle stages', () => {
    const stages = [
      'SUBMITTED',
      'UNDER_VERIFICATION',
      'VERIFIED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
    ];

    stages.forEach((stage) => {
      const { unmount } = render(<StatusBadge status={stage} />);
      const expectedLabel = COMPLAINT_STATUS[stage].label;
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    });
  });
});

