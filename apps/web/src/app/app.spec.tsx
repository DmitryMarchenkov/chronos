import { render, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render sign-in when unauthenticated', () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(getAllByText(/sign in/i).length > 0).toBeTruthy();
  });

  it('renders leads route for authenticated users and keeps sidebar order', async () => {
    localStorage.setItem('chronos_token', 'test-token');
    window.history.pushState({}, '', '/leads');

    const { findByRole, container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(await findByRole('heading', { name: /leads/i })).toBeTruthy();
    const nav = container.querySelector('.sidebar nav');
    expect(nav).toBeTruthy();
    const labels = within(nav as HTMLElement)
      .getAllByRole('link')
      .map((node) => node.textContent?.trim());
    expect(labels.slice(0, 2)).toEqual(['Leads', 'Clients']);
  });
});
