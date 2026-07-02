// Integration tests: mount the real app in jsdom and walk the login flow.
// These guard the highest-risk surfaces — the lock screen, PIN check, and
// role-based navigation — end to end, exactly as a user experiences them.
// Note: view names can appear in both the sidebar and the top bar, so
// assertions use the *All* query variants.
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DentalLabApp from '../LabApp';

const typePin = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
  for (const d of pin) {
    await user.click(screen.getAllByRole('button', { name: d })[0]);
  }
};

const seesSome = (text: string) => screen.getAllByText(text).length > 0;
const seesNone = (text: string) => screen.queryAllByText(text).length === 0;

beforeEach(() => {
  window.localStorage.clear();
});

describe('lock screen & login', () => {
  it('shows the lock screen with all seeded users', async () => {
    render(<DentalLabApp />);
    expect(await screen.findByText('Select a user to sign in')).toBeInTheDocument();
    expect(seesSome('Lab Manager')).toBe(true);
    expect(seesSome('Nawaf (Reception)')).toBe(true);
    expect(seesSome('Hassan (CAD/CAM)')).toBe(true);
    expect(seesSome('Accountant')).toBe(true);
    // Default-PIN hint shown while the manager PIN is unchanged.
    expect(screen.getByText(/Default manager PIN: 1234/)).toBeInTheDocument();
  });

  it('rejects a wrong PIN and accepts the right one', async () => {
    const user = userEvent.setup();
    render(<DentalLabApp />);
    await user.click(await screen.findByText('Lab Manager'));
    await typePin(user, '9999');
    expect(await screen.findByText('Wrong PIN, try again')).toBeInTheDocument();

    await typePin(user, '1234');
    // Manager lands on the dashboard with the full nav.
    await waitFor(() => expect(seesSome('Dashboard')).toBe(true));
    expect(seesSome('Accounting')).toBe(true);
    expect(seesSome('AI Assistant')).toBe(true);
  });

  it('persists the session: reload stays signed in', async () => {
    const user = userEvent.setup();
    const first = render(<DentalLabApp />);
    await user.click(await screen.findByText('Lab Manager'));
    await typePin(user, '1234');
    await waitFor(() => expect(seesSome('Dashboard')).toBe(true));
    // Wait for the debounced save to write localStorage.
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('dental-state') || '{}');
      expect(saved.currentUserId).toBeTruthy();
    }, { timeout: 5000 });
    first.unmount();

    render(<DentalLabApp />);
    await waitFor(() => expect(seesSome('Dashboard')).toBe(true));
    expect(seesNone('Select a user to sign in')).toBe(true);
  });
});

describe('role-based access', () => {
  it('technician gets a restricted nav (no Accounting/Settings/AI) and lands on Production Flow', async () => {
    const user = userEvent.setup();
    render(<DentalLabApp />);
    await user.click(await screen.findByText('Hassan (CAD/CAM)'));
    await typePin(user, '2222');

    await waitFor(() => expect(seesSome('Production Flow')).toBe(true));
    expect(seesNone('Accounting')).toBe(true);
    expect(seesNone('AI Assistant')).toBe(true);
    expect(seesNone('Settings')).toBe(true);
  });

  it('accountant sees Accounting but not the QR scanner', async () => {
    const user = userEvent.setup();
    render(<DentalLabApp />);
    // "Accountant" appears as both the user's name and their role label.
    await waitFor(() => expect(screen.getAllByText('Accountant').length).toBeGreaterThan(0));
    await user.click(screen.getAllByText('Accountant')[0]);
    await typePin(user, '3333');

    await waitFor(() => expect(seesSome('Accounting')).toBe(true));
    expect(seesNone('QR Scanner')).toBe(true);
  });

  it('logout returns to the lock screen', async () => {
    const user = userEvent.setup();
    render(<DentalLabApp />);
    await user.click(await screen.findByText('Lab Manager'));
    await typePin(user, '1234');
    await waitFor(() => expect(seesSome('Dashboard')).toBe(true));

    await user.click(screen.getByTitle('Log out'));
    expect(await screen.findByText('Select a user to sign in')).toBeInTheDocument();
  });
});

describe('seeded workspace after login', () => {
  it('dashboard reflects the seed (brand + room pipeline visible)', async () => {
    const user = userEvent.setup();
    render(<DentalLabApp />);
    await user.click(await screen.findByText('Lab Manager'));
    await typePin(user, '1234');
    await waitFor(() => expect(seesSome('Dashboard')).toBe(true));

    expect(screen.getAllByText('Evora Dental').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reception/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ceramic/i).length).toBeGreaterThan(0);
  });
});
