/**
 * Unit tests for Intercom Provider component.
 *
 * Tests:
 * - Provider renders children correctly
 * - Intercom loads with valid app_id
 * - Warning logged when app_id is missing
 * - Client-side only rendering
 * - Cleanup on unmount
 * - Script injection behavior
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IntercomProvider } from '@/providers';

/**
 * Mock environment variables
 */
const mockEnv = {
  NEXT_PUBLIC_INTERCOM_APP_ID: 'test_app_id_123',
};

describe('IntercomProvider', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let mockIntercom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Mock console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock Intercom function
    mockIntercom = vi.fn();
    (window as Window).Intercom = mockIntercom;

    // Mock window.intercomSettings
    delete (window as Window).intercomSettings;

    // Mock document methods for script injection
    vi.spyOn(document, 'createElement');
    vi.spyOn(document, 'getElementsByTagName').mockReturnValue([
      {
        parentNode: {
          insertBefore: vi.fn(),
        },
      } as unknown as HTMLScriptElement,
    ] as unknown as HTMLCollectionOf<HTMLScriptElement>);

    // Mock readyState as complete
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'complete',
    });
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Restore mocks
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();

    // Clean up window.Intercom
    delete (window as Window).Intercom;
    delete (window as Window).intercomSettings;
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div data-testid="test-child">Test Content</div>
        </IntercomProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </IntercomProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Intercom Initialization', () => {
    it('initializes Intercom with valid app_id', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      await waitFor(() => {
        // Check that window.intercomSettings was set
        expect(window.intercomSettings).toBeDefined();
        expect(window.intercomSettings?.app_id).toBe('test_app_id_123');
      });
    });

    it('sets correct Intercom configuration', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      await waitFor(() => {
        expect(window.intercomSettings).toEqual({
          app_id: 'test_app_id_123',
          alignment: 'right',
          horizontal_padding: 20,
          vertical_padding: 20,
          action_color: '#2A9D8F', // Daybreak teal
        });
      });
    });

    it('calls reattach_activator when Intercom already exists', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      await waitFor(() => {
        expect(mockIntercom).toHaveBeenCalledWith('reattach_activator');
        expect(mockIntercom).toHaveBeenCalledWith('update', expect.any(Object));
      });
    });

    it('injects Intercom script when not already loaded', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      // Remove existing Intercom function
      delete (window as Window).Intercom;

      const createElementSpy = vi.spyOn(document, 'createElement');

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      await waitFor(() => {
        // Check that a script element was created
        expect(createElementSpy).toHaveBeenCalledWith('script');
      });
    });
  });

  describe('Error Handling', () => {
    it('logs warning when NEXT_PUBLIC_INTERCOM_APP_ID is missing', () => {
      // Remove app_id from environment
      delete process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Intercom] NEXT_PUBLIC_INTERCOM_APP_ID not configured')
      );
    });

    it('does not initialize Intercom when app_id is missing', () => {
      delete process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      expect(window.intercomSettings).toBeUndefined();
    });

    it('still renders children when app_id is missing', () => {
      delete process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div data-testid="child">Content</div>
        </IntercomProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('calls shutdown on unmount', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      const { unmount } = render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(window.Intercom).toBeDefined();
      });

      // Clear previous calls
      mockIntercom.mockClear();

      // Unmount component
      unmount();

      // Check shutdown was called
      expect(mockIntercom).toHaveBeenCalledWith('shutdown');
    });

    it('handles unmount gracefully when Intercom not loaded', () => {
      delete process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
      delete (window as Window).Intercom;

      const { unmount } = render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      // Should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Client-Side Only', () => {
    it('only initializes in browser environment', async () => {
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID = mockEnv.NEXT_PUBLIC_INTERCOM_APP_ID;

      render(
        <IntercomProvider>
          <div>Content</div>
        </IntercomProvider>
      );

      // In test environment, window is defined
      await waitFor(() => {
        expect(window.intercomSettings).toBeDefined();
      });
    });
  });
});
