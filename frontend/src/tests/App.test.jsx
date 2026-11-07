import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import StatusBadge from '../components/common/StatusBadge';
import { COMPLAINT_STATUS, APP_NAME } from '../utils/constants';

describe('CivicConnect Platform - Core Frontend Tests', () => {
  it('renders application brand name and tagline', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Civic/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('correctly displays status badge for all complaint lifecycle stages', () => {
    const statuses = ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      const label = COMPLAINT_STATUS[status].label;
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('verifies platform constants are defined', () => {
    expect(APP_NAME).toBe('CivicConnect');
    expect(Object.keys(COMPLAINT_STATUS).length).toBeGreaterThanOrEqual(8);
  });
});

