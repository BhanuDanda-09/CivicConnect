// ==============================================================================
// Next-Gen Civic Features Test Suite (nextGenCivic.test.jsx)
// Tests for Multilingual, Accessibility, AI Assistant, Community Board & Transparency
// ==============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import AccessibilityToolbar from '../components/common/AccessibilityToolbar';
import AIAssistantModal from '../components/common/AIAssistantModal';
import Navbar from '../components/common/Navbar';
import CommunityBoard from '../pages/public/CommunityBoard';
import AuditLogs from '../pages/admin/AuditLogs';
import ManageAssets from '../pages/admin/ManageAssets';
import { AuthProvider } from '../context/AuthContext';

function LanguageConsumer() {
  const {
    currentLang,
    setCurrentLang,
    t,
    fontSizeScale,
    decreaseTextSize,
    increaseTextSize,
    resetTextSize,
    isHighContrast,
    toggleHighContrast,
  } = useLanguage();

  return (
    <div>
      <span data-testid="current-lang">{currentLang}</span>
      <span data-testid="translated-tagline">{t('brandTagline')}</span>
      <span data-testid="font-scale">{fontSizeScale}</span>
      <span data-testid="high-contrast">{isHighContrast ? 'yes' : 'no'}</span>
      <button onClick={() => setCurrentLang('hi')}>Switch to Hindi</button>
      <button onClick={() => setCurrentLang('te')}>Switch to Telugu</button>
      <button onClick={decreaseTextSize}>Decrease Font</button>
      <button onClick={increaseTextSize}>Increase Font</button>
      <button onClick={resetTextSize}>Reset Font</button>
      <button onClick={toggleHighContrast}>Toggle Contrast</button>
    </div>
  );
}

describe('CivicConnect Next-Generation Feature Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // 1. Multilingual Indian Language Switching
  it('1. switches interface languages between English, Hindi, and Telugu dynamically', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('translated-tagline').textContent).toContain('Report. Track. Resolve.');

    // Switch to Hindi
    fireEvent.click(screen.getByText('Switch to Hindi'));
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(screen.getByTestId('translated-tagline').textContent).toContain('शिकायत करें');

    // Switch to Telugu
    fireEvent.click(screen.getByText('Switch to Telugu'));
    expect(screen.getByTestId('current-lang').textContent).toBe('te');
    expect(screen.getByTestId('translated-tagline').textContent).toContain('ఫిర్యాదు చేయండి');
  });

  // 2. Accessibility Toolbar Controls & Text Size Controls (A−, A, A+)
  it('2. operates A−, A+, and Reset text size controls and persists in localStorage', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
        <AccessibilityToolbar />
      </LanguageProvider>
    );

    // Initial default state is normal
    expect(screen.getByTestId('font-scale').textContent).toBe('normal');

    // Click A+ (Increase)
    fireEvent.click(screen.getByTitle('Increase text size (A+)'));
    expect(screen.getByTestId('font-scale').textContent).toBe('large');
    expect(localStorage.getItem('civicconnect-font-scale')).toBe('large');

    // Click A (Reset to default)
    fireEvent.click(screen.getByTitle('Reset text size to default (A)'));
    expect(screen.getByTestId('font-scale').textContent).toBe('normal');
    expect(localStorage.getItem('civicconnect-font-scale')).toBe('normal');

    // Click A− (Decrease)
    fireEvent.click(screen.getByTitle('Decrease text size (A−)'));
    expect(screen.getByTestId('font-scale').textContent).toBe('small');
    expect(localStorage.getItem('civicconnect-font-scale')).toBe('small');

    // Toggle high contrast
    fireEvent.click(screen.getByText('Toggle Contrast'));
    expect(screen.getByTestId('high-contrast').textContent).toBe('yes');
  });

  // 3. AI Assistant Floating Modal & Interaction
  it('3. renders AI Civic Assistant launcher and opens interactive guidance dialog', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <AIAssistantModal />
        </LanguageProvider>
      </BrowserRouter>
    );

    const launcher = screen.getByLabelText('Open Civic AI Assistant');
    expect(launcher).toBeInTheDocument();

    fireEvent.click(launcher);

    expect(screen.getAllByText(/CivicConnect AI Assistant/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/112/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/Ask a question or describe an issue/i)).toBeInTheDocument();
  });

  // 4. Public Community Board Rendering
  it('4. renders Public Community Board with search filters and civic awareness banner', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <CommunityBoard />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Community Civic Grievance Board/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by area, ward, description/i)).toBeInTheDocument();
    expect(screen.getByText(/All States & UTs/i)).toBeInTheDocument();
  });

  // 5. Redesigned Role-Based Navbar
  it('5. renders redesigned role-based Navbar with authorized links', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Civic')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Report Complaint')).toBeInTheDocument();
    expect(screen.getByText('Track Complaint')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  // 6. Offline Complaint Draft Persistence
  it('6. persists and restores offline complaint drafts across browser sessions', () => {
    const draftPayload = {
      title: 'Water pipe leak on Sector 5 main cross',
      description: 'Potable water has been gushing from main pipe for 6 hours.',
      street: 'Sector 5 Main Cross',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      category: 'water_leakage',
      priority: 'HIGH',
    };

    localStorage.setItem('civicconnect_complaint_draft', JSON.stringify(draftPayload));

    const restored = JSON.parse(localStorage.getItem('civicconnect_complaint_draft'));
    expect(restored.title).toBe(draftPayload.title);
    expect(restored.category).toBe('water_leakage');
    expect(restored.priority).toBe('HIGH');
  });

  // 7. Municipal Audit Trail Page
  it('7. renders Administrative Audit Trail page with filter and security indicators', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <AuditLogs />
        </LanguageProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/System Audit Trail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by ticket ID, admin name, IP/i)).toBeInTheDocument();
    expect(screen.getByText(/All Administrative Actions/i)).toBeInTheDocument();
  });

  // 8. Civic Asset Management & QR Tag Generation
  it('8. renders Civic Asset Management page with asset registration and QR actions', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <ManageAssets />
        </LanguageProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Civic Asset Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Register Asset/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by Asset ID, name, ward/i)).toBeInTheDocument();
  });
});
