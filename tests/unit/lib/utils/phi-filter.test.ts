/**
 * Unit tests for PHI filtering utility
 *
 * Tests PHI (Protected Health Information) filtering functions to ensure
 * no sensitive data is transmitted to third-party services.
 */

import { describe, it, expect } from 'vitest';
import { filterPHI, containsPHI, validateNoPHI } from '@/lib/utils/phi-filter';

describe('PHI Filter Utility', () => {
  describe('filterPHI', () => {
    it('should remove conversationHistory field', () => {
      const data = {
        firstName: 'Jane',
        email: 'jane@example.com',
        conversationHistory: [
          { role: 'user', content: 'I need help with anxiety' },
        ],
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({
        firstName: 'Jane',
        email: 'jane@example.com',
      });
      expect(filtered).not.toHaveProperty('conversationHistory');
    });

    it('should remove assessment field', () => {
      const data = {
        sessionId: 'abc123',
        assessment: {
          isComplete: true,
          conversationHistory: [],
        },
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({
        sessionId: 'abc123',
      });
      expect(filtered).not.toHaveProperty('assessment');
    });

    it('should remove dateOfBirth field', () => {
      const data = {
        firstName: 'Alex',
        dateOfBirth: '2010-05-15',
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({
        firstName: 'Alex',
      });
      expect(filtered).not.toHaveProperty('dateOfBirth');
    });

    it('should remove age field', () => {
      const data = {
        firstName: 'Alex',
        age: 13,
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({
        firstName: 'Alex',
      });
      expect(filtered).not.toHaveProperty('age');
    });

    it('should remove multiple PHI fields at once', () => {
      const data = {
        firstName: 'Jane',
        email: 'jane@example.com',
        conversationHistory: [],
        dateOfBirth: '2010-05-15',
        assessment: { isComplete: true },
        concerns: ['anxiety', 'depression'],
        demographics: { grade: 8 },
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({
        firstName: 'Jane',
        email: 'jane@example.com',
      });
      expect(filtered).not.toHaveProperty('conversationHistory');
      expect(filtered).not.toHaveProperty('dateOfBirth');
      expect(filtered).not.toHaveProperty('assessment');
      expect(filtered).not.toHaveProperty('concerns');
      expect(filtered).not.toHaveProperty('demographics');
    });

    it('should preserve non-PHI fields', () => {
      const data = {
        sessionId: 'abc123',
        firstName: 'Jane',
        email: 'jane@example.com',
        onboardingStep: 'assessment',
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual(data);
    });

    it('should handle empty object', () => {
      const data = {};

      const filtered = filterPHI(data);

      expect(filtered).toEqual({});
    });

    it('should handle object with only PHI fields', () => {
      const data = {
        conversationHistory: [],
        assessment: {},
        dateOfBirth: '2010-05-15',
      };

      const filtered = filterPHI(data);

      expect(filtered).toEqual({});
    });
  });

  describe('containsPHI', () => {
    it('should return true when conversationHistory present', () => {
      const data = {
        firstName: 'Jane',
        conversationHistory: [],
      };

      expect(containsPHI(data)).toBe(true);
    });

    it('should return true when assessment present', () => {
      const data = {
        sessionId: 'abc123',
        assessment: { isComplete: true },
      };

      expect(containsPHI(data)).toBe(true);
    });

    it('should return true when dateOfBirth present', () => {
      const data = {
        firstName: 'Alex',
        dateOfBirth: '2010-05-15',
      };

      expect(containsPHI(data)).toBe(true);
    });

    it('should return true when age present', () => {
      const data = {
        firstName: 'Alex',
        age: 13,
      };

      expect(containsPHI(data)).toBe(true);
    });

    it('should return true when any PHI field present', () => {
      const data = {
        firstName: 'Jane',
        concerns: ['anxiety'],
      };

      expect(containsPHI(data)).toBe(true);
    });

    it('should return false when no PHI fields present', () => {
      const data = {
        sessionId: 'abc123',
        firstName: 'Jane',
        email: 'jane@example.com',
        onboardingStep: 'assessment',
      };

      expect(containsPHI(data)).toBe(false);
    });

    it('should return false for empty object', () => {
      const data = {};

      expect(containsPHI(data)).toBe(false);
    });

    it('should return true even if PHI field is empty', () => {
      const data = {
        firstName: 'Jane',
        conversationHistory: [], // Empty but still PHI field
      };

      expect(containsPHI(data)).toBe(true);
    });
  });

  describe('validateNoPHI', () => {
    it('should not throw when no PHI fields present', () => {
      const data = {
        sessionId: 'abc123',
        firstName: 'Jane',
        email: 'jane@example.com',
      };

      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).not.toThrow();
    });

    it('should throw when conversationHistory present', () => {
      const data = {
        firstName: 'Jane',
        conversationHistory: [],
      };

      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/PHI detected in Intercom update/);
      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/conversationHistory/);
    });

    it('should throw when assessment present', () => {
      const data = {
        sessionId: 'abc123',
        assessment: {},
      };

      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/PHI detected in Intercom update/);
      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/assessment/);
    });

    it('should throw when dateOfBirth present', () => {
      const data = {
        firstName: 'Alex',
        dateOfBirth: '2010-05-15',
      };

      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/PHI detected in Intercom update/);
      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/dateOfBirth/);
    });

    it('should throw with custom context in error message', () => {
      const data = {
        conversationHistory: [],
      };

      expect(() => {
        validateNoPHI(data, 'Analytics tracking');
      }).toThrow(/PHI detected in Analytics tracking/);
    });

    it('should list all PHI fields found in error message', () => {
      const data = {
        firstName: 'Jane',
        conversationHistory: [],
        dateOfBirth: '2010-05-15',
        assessment: {},
      };

      expect(() => {
        validateNoPHI(data, 'External service');
      }).toThrow(/conversationHistory/);
      expect(() => {
        validateNoPHI(data, 'External service');
      }).toThrow(/dateOfBirth/);
      expect(() => {
        validateNoPHI(data, 'External service');
      }).toThrow(/assessment/);
    });

    it('should include filterPHI guidance in error message', () => {
      const data = {
        conversationHistory: [],
      };

      expect(() => {
        validateNoPHI(data, 'Intercom update');
      }).toThrow(/Use filterPHI\(\) before external transmission/);
    });
  });

  describe('Integration: filterPHI + validateNoPHI', () => {
    it('should pass validation after filtering', () => {
      const unsafeData = {
        firstName: 'Jane',
        email: 'jane@example.com',
        conversationHistory: [],
        dateOfBirth: '2010-05-15',
        assessment: { isComplete: true },
      };

      const safeData = filterPHI(unsafeData);

      expect(() => {
        validateNoPHI(safeData as Record<string, unknown>, 'Intercom update');
      }).not.toThrow();
    });

    it('should filter typical onboarding session for Intercom', () => {
      const session = {
        id: 'session-123',
        parent: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
        child: {
          firstName: 'Alex',
          dateOfBirth: '2010-05-15', // PHI
        },
        assessment: {
          // PHI
          conversationHistory: [
            { role: 'user', content: 'I need help with anxiety' },
          ],
          isComplete: true,
        },
      };

      const intercomData = {
        session_id: session.id,
        name: `${session.parent.firstName} ${session.parent.lastName}`,
        email: session.parent.email,
        child_first_name: session.child.firstName,
        onboarding_step: 'assessment',
        assessment_complete: session.assessment.isComplete,
      };

      const filtered = filterPHI(intercomData);

      expect(() => {
        validateNoPHI(filtered as Record<string, unknown>, 'Intercom update');
      }).not.toThrow();

      expect(filtered).toHaveProperty('session_id');
      expect(filtered).toHaveProperty('name');
      expect(filtered).toHaveProperty('email');
      expect(filtered).toHaveProperty('child_first_name');
      expect(filtered).not.toHaveProperty('conversationHistory');
      expect(filtered).not.toHaveProperty('dateOfBirth');
    });
  });
});
