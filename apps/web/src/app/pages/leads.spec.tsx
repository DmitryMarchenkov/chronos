import { fireEvent, render, waitFor } from '@testing-library/react';
import { LeadStatus } from '@chronos/shared-types';
import { LeadsPage } from './leads';
import { api } from '../api';

describe('LeadsPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a lead from the form', async () => {
    const lead = {
      id: 'lead-1',
      name: 'Acme',
      contact: 'owner@acme.com',
      source: 'Referral',
      status: LeadStatus.NEW,
      createdAt: new Date().toISOString(),
    };

    jest.spyOn(api, 'listLeads').mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: [lead],
    });
    jest.spyOn(api, 'createLead').mockResolvedValue(lead);
    jest.spyOn(api, 'updateLeadStatus').mockResolvedValue(lead);
    jest.spyOn(api, 'convertLead').mockResolvedValue({
      lead: { ...lead, status: LeadStatus.CONVERTED },
      client: {
        id: 'client-1',
        name: lead.name,
        createdAt: new Date().toISOString(),
      },
    });

    const { findByText, getByPlaceholderText, getByRole } = render(<LeadsPage />);
    await findByText(/no leads yet/i);

    fireEvent.change(getByPlaceholderText('Lead name'), { target: { value: 'Acme' } });
    fireEvent.change(getByPlaceholderText('Contact'), { target: { value: 'owner@acme.com' } });
    fireEvent.change(getByPlaceholderText('Source'), { target: { value: 'Referral' } });
    fireEvent.click(getByRole('button', { name: /create lead/i }));

    await waitFor(() => {
      expect(api.createLead).toHaveBeenCalledWith('Acme', 'owner@acme.com', 'Referral');
    });
    expect(await findByText('Lead created')).toBeTruthy();
  });

  it('updates lead status', async () => {
    const lead = {
      id: 'lead-2',
      name: 'Beta',
      contact: 'contact@beta.com',
      source: 'Inbound',
      status: LeadStatus.NEW,
      createdAt: new Date().toISOString(),
    };

    jest
      .spyOn(api, 'listLeads')
      .mockResolvedValueOnce({ data: [lead] })
      .mockResolvedValueOnce({ data: [{ ...lead, status: LeadStatus.PROSPECTING }] });
    jest.spyOn(api, 'createLead').mockResolvedValue(lead);
    jest.spyOn(api, 'updateLeadStatus').mockResolvedValue({ ...lead, status: LeadStatus.PROSPECTING });
    jest.spyOn(api, 'convertLead').mockResolvedValue({
      lead: { ...lead, status: LeadStatus.CONVERTED },
      client: {
        id: 'client-2',
        name: lead.name,
        createdAt: new Date().toISOString(),
      },
    });

    const { findByText, getByRole, getAllByRole } = render(<LeadsPage />);
    await findByText('Beta');

    fireEvent.change(getAllByRole('combobox')[0], { target: { value: LeadStatus.PROSPECTING } });
    fireEvent.click(getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(api.updateLeadStatus).toHaveBeenCalledWith('lead-2', LeadStatus.PROSPECTING);
    });
    expect(await findByText('Lead status updated')).toBeTruthy();
  });
});
