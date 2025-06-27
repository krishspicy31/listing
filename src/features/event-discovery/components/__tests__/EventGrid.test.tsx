/**
 * Unit tests for EventGrid component
 * Tests responsive layout, empty states, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventGrid } from '../EventGrid';
import { Event } from '@/types/event';

// Mock EventCard component
jest.mock('../EventCard', () => ({
  EventCard: ({ event, onClick }: { event: Event; onClick?: (event: Event) => void }) => (
    <div 
      data-testid={`event-card-${event.id}`}
      onClick={() => onClick?.(event)}
    >
      {event.title}
    </div>
  ),
}));

// Mock event data
const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Jazz Night',
    description: 'Jazz music event',
    city: 'New York',
    event_date: '2025-07-15T19:00:00.000Z',
    image_url: 'https://example.com/jazz.jpg',
    category: { name: 'Music', slug: 'music' }
  },
  {
    id: 2,
    title: 'Art Exhibition',
    description: 'Modern art exhibition',
    city: 'Los Angeles',
    event_date: '2025-07-20T10:00:00.000Z',
    image_url: 'https://example.com/art.jpg',
    category: { name: 'Art', slug: 'art' }
  },
  {
    id: 3,
    title: 'Dance Performance',
    description: 'Contemporary dance show',
    city: 'Chicago',
    event_date: '2025-07-25T20:00:00.000Z',
    image_url: 'https://example.com/dance.jpg',
    category: { name: 'Dance', slug: 'dance' }
  }
];

describe('EventGrid', () => {
  it('renders events in a grid layout', () => {
    render(<EventGrid events={mockEvents} />);
    
    expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-3')).toBeInTheDocument();
  });

  it('has proper responsive grid classes', () => {
    const { container } = render(<EventGrid events={mockEvents} />);
    
    const grid = container.firstChild;
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      '2xl:grid-cols-4'
    );
  });

  it('has proper ARIA attributes', () => {
    render(<EventGrid events={mockEvents} />);
    
    const grid = screen.getByRole('main');
    expect(grid).toHaveAttribute('aria-label', 'Events grid showing 3 events');
  });

  it('displays empty state when no events', () => {
    render(<EventGrid events={[]} />);
    
    expect(screen.getByText('No Events Found')).toBeInTheDocument();
    expect(screen.getByText('No events found for this filter. Try another search!')).toBeInTheDocument();
    expect(screen.getByText('Submit Your Event')).toBeInTheDocument();
  });

  it('displays error state when error provided', () => {
    const errorMessage = 'Failed to load events';
    render(<EventGrid events={[]} error={errorMessage} />);
    
    expect(screen.getByText('Unable to Load Events')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onEventClick when event card is clicked', () => {
    const mockOnEventClick = jest.fn();
    render(<EventGrid events={mockEvents} onEventClick={mockOnEventClick} />);
    
    const eventCard = screen.getByTestId('event-card-1');
    fireEvent.click(eventCard);
    
    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('handles retry button click in error state', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
    
    render(<EventGrid events={[]} error="Network error" />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockReload).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EventGrid events={mockEvents} className="custom-grid-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-grid-class');
  });

  it('shows proper empty state role and aria-live', () => {
    render(<EventGrid events={[]} />);
    
    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveAttribute('aria-live', 'polite');
  });

  it('shows proper error state role and aria-live', () => {
    render(<EventGrid events={[]} error="Test error" />);
    
    const errorState = screen.getByRole('alert');
    expect(errorState).toHaveAttribute('aria-live', 'assertive');
  });

  it('handles loading state correctly', () => {
    render(<EventGrid events={[]} isLoading={true} />);
    
    // Should not show empty state when loading
    expect(screen.queryByText('No Events Found')).not.toBeInTheDocument();
  });

  it('renders correct number of events', () => {
    render(<EventGrid events={mockEvents} />);
    
    const eventCards = screen.getAllByTestId(/event-card-/);
    expect(eventCards).toHaveLength(3);
  });

  it('maintains focus management for grid items', () => {
    const { container } = render(<EventGrid events={mockEvents} />);
    
    const focusContainers = container.querySelectorAll('.focus-within\\:ring-2');
    expect(focusContainers).toHaveLength(mockEvents.length);
  });
});
