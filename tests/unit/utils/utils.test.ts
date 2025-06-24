import { cn } from '../../../src/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    // Happy path
    test('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    // Edge case
    test('should handle conditional classes', () => {
      const condition = true;
      const result = cn('base-class', condition && 'conditional-class');
      expect(result).toBe('base-class conditional-class');
    });

    // Edge case - falsy values
    test('should filter out falsy values', () => {
      const condition = false;
      const result = cn('class1', condition && 'class2', null, undefined, 0, 'class3');
      expect(result).toBe('class1 class3');
    });

    // Edge case - tailwind variants
    test('should handle tailwind class variants correctly', () => {
      const result = cn('text-base', 'md:text-lg', 'lg:text-xl');
      expect(result).toBe('text-base md:text-lg lg:text-xl');
    });

    // Edge case - class conflicts
    test('should handle conflicting classes with tailwind-merge', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    // Edge case - complex variants
    test('should handle complex variants and conflicts', () => {
      const result = cn(
        'px-2 py-1 bg-red-500',
        'p-4 bg-blue-500'
      );
      // tailwind-merge should resolve p-4 over px-2 py-1, and bg-blue-500 over bg-red-500
      expect(result).toBe('p-4 bg-blue-500');
    });
  });
});
