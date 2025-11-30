/**
 * Unit tests for useIntercomContext hook
 *
 * Tests Intercom context management including:
 * - Session data mapping to Intercom attributes
 * - PHI filtering before transmission
 * - Context updates on route changes
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIntercomContext } from '@/features/support-chat/useIntercomContext';
import type { OnboardingSession } from '@/hooks/useOnboardingSession';

// Mock window.Intercom
const mockIntercom = vi.fn();

describe('useIntercomContext', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup window.Intercom mock
    global.window = global.window || ({} as Window & typeof globalThis);
    window.Intercom = mockIntercom;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Data Mapping', () => {
    it('should map parent name and email to Intercom attributes', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        parent: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        session_id: 'session-123',
      }));
    });

    it('should map child first name to Intercom attributes', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        child: {
          firstName: 'Alex',
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/demographics')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        child_first_name: 'Alex',
        session_id: 'session-123',
      }));
    });

    it('should map current route to onboarding step', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/insurance')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'insurance',
      }));
    });

    it('should map assessment completion status', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        assessment: {
          conversationHistory: [],
          isComplete: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/demographics')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        assessment_complete: true,
      }));
    });

    it('should default assessment_complete to false when no assessment', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        assessment_complete: false,
      }));
    });

    it('should handle partial parent name (first name only)', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        parent: {
          firstName: 'Jane',
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        name: 'Jane',
      }));
    });
  });

  describe('Route to Step Mapping', () => {
    const session: OnboardingSession = {
      id: 'session-123',
      status: 'in-progress',
      createdAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-01-31T00:00:00Z',
    };

    it('should map /assessment to assessment step', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'assessment',
      }));
    });

    it('should map /demographics to demographics step', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/demographics')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'demographics',
      }));
    });

    it('should map /insurance to insurance step', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/insurance')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'insurance',
      }));
    });

    it('should map /match to matching step', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/match')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'matching',
      }));
    });

    it('should map /book to scheduling step', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/book')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'scheduling',
      }));
    });

    it('should default to assessment for unknown routes', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/unknown')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'assessment',
      }));
    });

    it('should default to assessment when no route segment', () => {
      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123')
      );

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'assessment',
      }));
    });
  });

  describe('PHI Filtering', () => {
    it('should not include conversationHistory in Intercom payload', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        assessment: {
          conversationHistory: [
            { role: 'user', content: 'I need help with anxiety' },
          ],
          isComplete: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).toHaveBeenCalled();
      const callArgs = mockIntercom.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('conversationHistory');
    });

    it('should not include assessment object in Intercom payload', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        assessment: {
          conversationHistory: [],
          isComplete: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/demographics')
      );

      expect(mockIntercom).toHaveBeenCalled();
      const callArgs = mockIntercom.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('assessment');
    });

    it('should not include child dateOfBirth in Intercom payload', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        child: {
          firstName: 'Alex',
          dateOfBirth: '2010-05-15',
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/demographics')
      );

      expect(mockIntercom).toHaveBeenCalled();
      const callArgs = mockIntercom.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('dateOfBirth');
      expect(callArgs).toHaveProperty('child_first_name', 'Alex');
    });

    it('should not include demographics object in Intercom payload', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        demographics: {
          grade: 8,
          schoolName: 'Test School',
        },
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      renderHook(() =>
        useIntercomContext(session, '/onboarding/session-123/insurance')
      );

      expect(mockIntercom).toHaveBeenCalled();
      const callArgs = mockIntercom.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('demographics');
    });
  });

  describe('Context Updates on Route Changes', () => {
    it('should update context when pathname changes', () => {
      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      const { rerender } = renderHook(
        ({ pathname }) => useIntercomContext(session, pathname),
        {
          initialProps: { pathname: '/onboarding/session-123/assessment' },
        }
      );

      expect(mockIntercom).toHaveBeenCalledTimes(1);
      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'assessment',
      }));

      // Change route
      mockIntercom.mockClear();
      rerender({ pathname: '/onboarding/session-123/demographics' });

      expect(mockIntercom).toHaveBeenCalledTimes(1);
      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        onboarding_step: 'demographics',
      }));
    });

    it('should update context when session changes', () => {
      const initialSession: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      const { rerender } = renderHook(
        ({ session }) =>
          useIntercomContext(session, '/onboarding/session-123/assessment'),
        {
          initialProps: { session: initialSession },
        }
      );

      expect(mockIntercom).toHaveBeenCalledTimes(1);
      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        name: undefined,
      }));

      // Update session with parent data
      mockIntercom.mockClear();
      const updatedSession: OnboardingSession = {
        ...initialSession,
        parent: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
      };

      rerender({ session: updatedSession });

      expect(mockIntercom).toHaveBeenCalledTimes(1);
      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
      }));
    });
  });

  describe('Error Handling', () => {
    it('should not call Intercom when session is null', () => {
      renderHook(() =>
        useIntercomContext(null, '/onboarding/session-123/assessment')
      );

      expect(mockIntercom).not.toHaveBeenCalled();
    });

    it('should handle Intercom not being loaded', () => {
      delete window.Intercom;

      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      expect(() => {
        renderHook(() =>
          useIntercomContext(session, '/onboarding/session-123/assessment')
        );
      }).not.toThrow();
    });

    it('should handle Intercom update throwing error', () => {
      mockIntercom.mockImplementation(() => {
        throw new Error('Intercom error');
      });

      const session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      // Should not throw - errors are caught and logged
      expect(() => {
        renderHook(() =>
          useIntercomContext(session, '/onboarding/session-123/assessment')
        );
      }).not.toThrow();
    });
  });

  describe('Integration Test: Full Session Flow', () => {
    it('should update context correctly through full onboarding flow', () => {
      // Start with minimal session
      let session: OnboardingSession = {
        id: 'session-123',
        status: 'in-progress',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-31T00:00:00Z',
      };

      const { rerender } = renderHook(
        ({ session, pathname }) => useIntercomContext(session, pathname),
        {
          initialProps: {
            session,
            pathname: '/onboarding/session-123/assessment',
          },
        }
      );

      // Assessment step - minimal data
      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        session_id: 'session-123',
        onboarding_step: 'assessment',
        assessment_complete: false,
      }));

      mockIntercom.mockClear();

      // Complete assessment, add parent data
      session = {
        ...session,
        assessment: {
          conversationHistory: [],
          isComplete: true,
        },
        parent: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
      };

      rerender({
        session,
        pathname: '/onboarding/session-123/demographics',
      });

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        session_id: 'session-123',
        onboarding_step: 'demographics',
        name: 'Jane Doe',
        email: 'jane@example.com',
        assessment_complete: true,
      }));

      mockIntercom.mockClear();

      // Add child data, move to insurance
      session = {
        ...session,
        child: {
          firstName: 'Alex',
          dateOfBirth: '2010-05-15', // PHI - should be filtered
        },
      };

      rerender({
        session,
        pathname: '/onboarding/session-123/insurance',
      });

      expect(mockIntercom).toHaveBeenCalledWith('update', expect.objectContaining({
        session_id: 'session-123',
        onboarding_step: 'insurance',
        child_first_name: 'Alex',
      }));

      const callArgs = mockIntercom.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('dateOfBirth');
      expect(callArgs).not.toHaveProperty('conversationHistory');
      expect(callArgs).not.toHaveProperty('assessment');
    });
  });
});
