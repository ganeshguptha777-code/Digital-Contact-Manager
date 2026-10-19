import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactCard from '../components/ContactCard';

describe('ContactCard Component', () => {
  const mockContact = {
    _id: 'c123',
    firstName: 'Peter',
    lastName: 'Parker',
    email: 'peter@dailybugle.com',
    phone: '+1 555 0123',
    company: 'Daily Bugle',
    jobTitle: 'Photographer',
    category: 'Work',
    isFavorite: false
  };

  it('renders contact details and avatar initials accurately', () => {
    render(
      <ContactCard
        contact={mockContact}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText('Peter Parker')).toBeInTheDocument();
    expect(screen.getByText('PP')).toBeInTheDocument();
    expect(screen.getByText('peter@dailybugle.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555 0123')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when star button is clicked', () => {
    const handleToggleFavorite = vi.fn();

    render(
      <ContactCard
        contact={mockContact}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    const favButton = screen.getByTitle('Mark as favorite');
    fireEvent.click(favButton);

    expect(handleToggleFavorite).toHaveBeenCalledWith(mockContact);
  });

  it('calls onView, onEdit, and onDelete with contact when clicked', () => {
    const handleView = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ContactCard
        contact={mockContact}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('View Details'));
    expect(handleView).toHaveBeenCalledWith(mockContact);

    fireEvent.click(screen.getByTitle('Edit Contact'));
    expect(handleEdit).toHaveBeenCalledWith(mockContact);

    fireEvent.click(screen.getByTitle('Delete Contact'));
    expect(handleDelete).toHaveBeenCalledWith(mockContact);
  });
});
