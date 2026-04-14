import { describe, it, expect } from 'vitest';
import { getLogicalDate } from '../time.service';

describe('time.service', () => {
  describe('getLogicalDate', () => {
    it('should return the same date if time is after 04:00 AM', () => {
      const date = new Date('2024-03-15T10:00:00'); // 10:00 AM
      expect(getLogicalDate(date)).toBe('2024-03-15');
    });

    it('should return the previous date if time is before 04:00 AM', () => {
      const date = new Date('2024-03-15T03:59:59'); // 03:59 AM
      expect(getLogicalDate(date)).toBe('2024-03-14');
    });

    it('should return the same date if time is exactly 04:00 AM', () => {
      const date = new Date('2024-03-15T04:00:00'); // 04:00 AM
      expect(getLogicalDate(date)).toBe('2024-03-15');
    });

    it('should handle month boundaries correctly (e.g., March 1st 03:00 AM)', () => {
      const date = new Date('2024-03-01T03:00:00'); // March 1st 03:00 AM
      expect(getLogicalDate(date)).toBe('2024-02-29'); // Leap year 2024
    });

    it('should handle year boundaries correctly (e.g., Jan 1st 01:00 AM)', () => {
      const date = new Date('2024-01-01T01:00:00'); // Jan 1st 01:00 AM
      expect(getLogicalDate(date)).toBe('2023-12-31');
    });
  });
});
