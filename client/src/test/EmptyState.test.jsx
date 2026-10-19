import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../components/EmptyState';

describe('EmptyState Component', () => {
  it('renders custom title, description, and handles onAction click', () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No contacts available"
        description="Try adding one now."
        actionLabel="Add Contact Now"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No contacts available')).toBeInTheDocument();
    expect(screen.getByText('Try adding one now.')).toBeInTheDocument();

    const actionButton = screen.getByRole('button', { name: /add contact now/i });
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
