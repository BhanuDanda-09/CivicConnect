// ==============================================================================
// CivicConnect Pan-India Map & Location Selection Test Suite (geoMap.test.jsx)
// ==============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MapPicker from '../components/common/MapPicker';
import ComplaintForm from '../components/complaints/ComplaintForm';
import {
  INDIAN_STATES_AND_UT,
  INDIAN_DISTRICTS_BY_STATE,
  searchLocalIndianPlaces,
  findNearestIndianLocation,
  validateIndianPinCode,
  formatFullIndianAddress,
} from '../utils/indianGeoData';

describe('Pan-India Interactive Map & Geocoding Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. MapPicker rendering with search box and controls
  it('1. renders MapPicker with prominent search box, GPS button, and coordinates readout', () => {
    render(
      <BrowserRouter>
        <MapPicker onLocationSelect={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Search anywhere in India/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use My Current GPS/i })).toBeInTheDocument();
    expect(screen.getByText(/Latitude:/i)).toBeInTheDocument();
    expect(screen.getByText(/Longitude:/i)).toBeInTheDocument();
    expect(screen.getByText(/All India/i)).toBeInTheDocument();
  });

  // 2. Local Indian places search
  it('2. searches local Indian places across multiple states and returns matches', () => {
    const hydMatches = searchLocalIndianPlaces('Hyderabad');
    expect(hydMatches.length).toBeGreaterThan(0);
    expect(hydMatches[0].name).toBe('Hyderabad');
    expect(hydMatches[0].address.state).toBe('Telangana');

    const vijMatches = searchLocalIndianPlaces('Vijayawada');
    expect(vijMatches.length).toBeGreaterThan(0);
    expect(vijMatches[0].name).toBe('Vijayawada');
    expect(vijMatches[0].address.state).toBe('Andhra Pradesh');

    const blrMatches = searchLocalIndianPlaces('Bengaluru');
    expect(blrMatches.length).toBeGreaterThan(0);
    expect(blrMatches[0].address.state).toBe('Karnataka');

    const delMatches = searchLocalIndianPlaces('Delhi');
    expect(delMatches.length).toBeGreaterThan(0);

    const srinagarMatches = searchLocalIndianPlaces('Srinagar');
    expect(srinagarMatches.length).toBeGreaterThan(0);
    expect(srinagarMatches[0].address.state).toBe('Jammu and Kashmir');

    const portBlairMatches = searchLocalIndianPlaces('Port Blair');
    expect(portBlairMatches.length).toBeGreaterThan(0);
    expect(portBlairMatches[0].address.state).toBe('Andaman and Nicobar Islands');
  });

  // 3. Indian PIN code validation
  it('3. validates 6-digit Indian PIN codes correctly', () => {
    expect(validateIndianPinCode('500001')).toBe(true); // Hyderabad
    expect(validateIndianPinCode('520001')).toBe(true); // Vijayawada
    expect(validateIndianPinCode('560001')).toBe(true); // Bengaluru
    expect(validateIndianPinCode('110001')).toBe(true); // New Delhi
    expect(validateIndianPinCode('400001')).toBe(true); // Mumbai
    expect(validateIndianPinCode('700001')).toBe(true); // Kolkata
    expect(validateIndianPinCode('190001')).toBe(true); // Srinagar
    expect(validateIndianPinCode('744101')).toBe(true); // Port Blair

    // Invalid PIN codes
    expect(validateIndianPinCode('012345')).toBe(false); // Starts with 0
    expect(validateIndianPinCode('12345')).toBe(false);  // 5 digits
    expect(validateIndianPinCode('1234567')).toBe(false); // 7 digits
    expect(validateIndianPinCode('ABCDEF')).toBe(false); // Non-numeric
  });

  // 4. Formatted Indian address generation
  it('4. formats structured Indian addresses with all standard municipal components', () => {
    const formatted = formatFullIndianAddress({
      houseNumber: 'Flat 402',
      street: 'Road No. 12, Banjara Hills',
      landmark: 'Near Care Hospital',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    });

    expect(formatted).toContain('Flat 402');
    expect(formatted).toContain('Road No. 12, Banjara Hills');
    expect(formatted).toContain('Near Care Hospital');
    expect(formatted).toContain('Hyderabad');
    expect(formatted).toContain('Telangana');
    expect(formatted).toContain('PIN: 500034');
    expect(formatted).toContain('India');
  });

  // 5. Nearest Indian location fallback calculation
  it('5. identifies nearest Indian city or district center from arbitrary coordinates', () => {
    // Near Hyderabad
    const nearHyd = findNearestIndianLocation(17.4, 78.5);
    expect(nearHyd.name).toBe('Hyderabad');

    // Near Mumbai
    const nearMum = findNearestIndianLocation(19.1, 72.9);
    expect(nearMum.name).toBe('Mumbai');

    // Near New Delhi
    const nearDel = findNearestIndianLocation(28.6, 77.2);
    expect(nearDel.name).toBe('Delhi');
  });

  // 6. Cascading State and District dropdowns in ComplaintForm
  it('6. provides cascading State and dynamic District selection in ComplaintForm', () => {
    render(
      <BrowserRouter>
        <ComplaintForm onSubmit={vi.fn()} />
      </BrowserRouter>
    );

    // Verify Country: India is displayed
    expect(screen.getByText('India')).toBeInTheDocument();

    // Verify State select is populated with Indian states
    const stateSelect = screen.getByDisplayValue(/Telangana/i);
    expect(stateSelect).toBeInTheDocument();

    // Change state to Andhra Pradesh
    fireEvent.change(stateSelect, { target: { value: 'Andhra Pradesh' } });

    // Verify dynamic districts for Andhra Pradesh are available
    expect(screen.getByText('Visakhapatnam')).toBeInTheDocument();
    expect(screen.getByText('NTR (Vijayawada)')).toBeInTheDocument();
  });
});

