import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// Mock the event service
jest.mock('../src/features/event-discovery/services/eventService', () => ({
  getApprovedEventsWithRetry: jest.fn(),
  EventServiceError: class EventServiceError extends Error {
    constructor(message: string, public statusCode?: number) {
      super(message);
      this.name = 'EventServiceError';
    }
  }
}));

// Mock the components
jest.mock('../src/features/event-discovery/components/EventGrid', () => ({
  EventGrid: ({ events }: { events: any[] }) => (
    <div data-testid="event-grid">
      {events.map((event) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../src/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

const mockGetApprovedEventsWithRetry = require('../src/features/event-discovery/services/eventService').getApprovedEventsWithRetry;

describe('Home Page', () => {
  beforeEach(() => {
    mockGetApprovedEventsWithRetry.mockClear();
  });

  it('renders main heading', () => {
    mockGetApprovedEventsWithRetry.mockResolvedValue({
      success: true,
      data: { results: [] }
    });

    render(<Home />)

    const heading = screen.getByRole('heading', { name: /discover cultural events/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders description text', () => {
    mockGetApprovedEventsWithRetry.mockResolvedValue({
      success: true,
      data: { results: [] }
    });

    render(<Home />)

    const description = screen.getByText(/find amazing cultural experiences/i)
    expect(description).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    mockGetApprovedEventsWithRetry.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Home />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Loading cultural events...')).toBeInTheDocument()
  })

  it('displays events when loaded successfully', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Jazz Night',
        description: 'Jazz event',
        city: 'New York',
        event_date: '2025-07-15T19:00:00.000Z',
        image_url: 'https://example.com/jazz.jpg',
        category: { name: 'Music', slug: 'music' }
      }
    ];

    mockGetApprovedEventsWithRetry.mockResolvedValue({
      success: true,
      data: { results: mockEvents }
    });

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByTestId('event-grid')).toBeInTheDocument()
    })

    expect(screen.getByTestId('event-1')).toBeInTheDocument()
    expect(screen.getByText('Jazz Night')).toBeInTheDocument()
  })

  it('displays error state when API fails', async () => {
    mockGetApprovedEventsWithRetry.mockResolvedValue({
      success: false,
      error: { message: 'Network error' }
    });

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Events')).toBeInTheDocument()
    })

    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})
