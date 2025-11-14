import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-white', 'bg-black');
      expect(result).toBe('text-white bg-black');
    });

    it('should handle conditional classes', () => {
      const result = cn('text-white', false && 'bg-black', 'p-4');
      expect(result).toBe('text-white p-4');
    });

    it('should handle tailwind merge conflicts', () => {
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle object syntax', () => {
      const result = cn({
        'text-white': true,
        'bg-black': false,
        'p-4': true,
      });
      expect(result).toBe('text-white p-4');
    });
  });
});
