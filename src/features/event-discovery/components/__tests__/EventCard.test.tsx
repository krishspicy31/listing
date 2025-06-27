/**
 * Unit tests for EventCard component
 * Tests accessibility, responsive design, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventCard } from '../EventCard';
import { Event } from '@/types/event';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onError, onLoad, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        onLoad={onLoad}
        {...props}
      />
    );
  },
}));

// Mock event data
const mockEvent: Event = {
  id: 1,
  title: 'Jazz Night at Blue Note',
  description: 'An evening of smooth jazz music featuring local and international artists. Experience the best of contemporary jazz in an intimate setting.',
  city: 'New York',
  event_date: '2025-07-15T19:00:00.000Z',
  image_url: 'https://example.com/jazz-night.jpg',
  category: {
    name: 'Music',
    slug: 'music'
  }
};

const mockEventLongTitle: Event = {
  ...mockEvent,
  id: 2,
  title: 'This is a very long event title that should be truncated after two lines to test the text overflow behavior and ellipsis functionality',
};

describe('EventCard', () => {
  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Jazz Night at Blue Note')).toBeInTheDocument();
    expect(screen.getByText(/An evening of smooth jazz music/)).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    // Should format ISO date to readable format
    expect(screen.getByText(/Tue, Jul 15, 2025/)).toBeInTheDocument();
  });

  it('displays proper alt text for images', () => {
    render(<EventCard event={mockEvent} />);
    
    const image = screen.getByAltText('Event image for Jazz Night at Blue Note in New York');
    expect(image).toBeInTheDocument();
  });

  it('handles image loading errors with fallback', () => {
    render(<EventCard event={mockEvent} />);
    
    const image = screen.getByAltText('Event image for Jazz Night at Blue Note in New York');
    
    // Simulate image error
    fireEvent.error(image);
    
    // Should switch to placeholder image
    expect(image).toHaveAttribute('src', '/images/event-placeholder.svg');
  });

  it('calls onClick handler when card is clicked', () => {
    const mockOnClick = jest.fn();
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
  });

  it('handles keyboard navigation', () => {
    const mockOnClick = jest.fn();
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
    
    // Test other keys (should not trigger)
    mockOnClick.mockClear();
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(<EventCard event={mockEvent} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 
      'Jazz Night at Blue Note, Music event in New York on Tue, Jul 15, 2025'
    );
  });

  it('renders as article when no onClick handler provided', () => {
    render(<EventCard event={mockEvent} />);
    
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('truncates long titles properly', () => {
    render(<EventCard event={mockEventLongTitle} />);
    
    const titleElement = screen.getByText(/This is a very long event title/);
    expect(titleElement).toHaveClass('line-clamp-2');
    expect(titleElement).toHaveAttribute('title', mockEventLongTitle.title);
  });

  it('displays category badge', () => {
    render(<EventCard event={mockEvent} />);
    
    const categoryBadge = screen.getByLabelText('Category: Music');
    expect(categoryBadge).toBeInTheDocument();
    expect(categoryBadge).toHaveTextContent('Music');
  });

  it('has proper focus styles', () => {
    render(<EventCard event={mockEvent} onClick={() => {}} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('focus-within:ring-2', 'focus-within:ring-orange-500');
  });

  it('handles invalid date gracefully', () => {
    const eventWithInvalidDate = {
      ...mockEvent,
      event_date: 'invalid-date'
    };
    
    render(<EventCard event={eventWithInvalidDate} />);
    
    expect(screen.getByText('Date TBD')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EventCard event={mockEvent} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
