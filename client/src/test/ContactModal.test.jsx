import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactModal from '../components/ContactModal';

describe('ContactModal Component Validation & Submission', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ContactModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('validates required firstName on submission', () => {
    const handleSubmit = vi.fn();

    render(
      <ContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={[{ _id: '1', name: 'Work' }]}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /create contact/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates email format on submission if invalid email entered', () => {
    const handleSubmit = vi.fn();

    render(
      <ContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={[{ _id: '1', name: 'Work' }]}
      />
    );

    const firstNameInput = screen.getByPlaceholderText('e.g. Eleanor');
    const emailInput = screen.getByPlaceholderText('name@example.com');

    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Eleanor' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'not-valid-email' } });

    const submitBtn = screen.getByRole('button', { name: /create contact/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(screen.getByText('Please provide a valid email format')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully when required inputs are valid', () => {
    const handleSubmit = vi.fn();

    render(
      <ContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={[{ _id: '1', name: 'Work' }]}
      />
    );

    const firstNameInput = screen.getByPlaceholderText('e.g. Eleanor');
    const emailInput = screen.getByPlaceholderText('name@example.com');

    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Eleanor' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'eleanor@goodplace.com' } });

    const submitBtn = screen.getByRole('button', { name: /create contact/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Eleanor',
        email: 'eleanor@goodplace.com',
        category: 'Work'
      })
    );
  });
});
