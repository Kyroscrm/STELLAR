import { AxeResults } from 'axe-core';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): Promise<R>;
    }
  }
}

declare module 'jest-axe' {
  export interface JestAxeConfigureOptions {
    globalOptions?: Record<string, unknown>;
    rules?: Record<string, { enabled: boolean }>;
  }

  export function configureAxe(options?: JestAxeConfigureOptions): void;
  export function axe(
    node: Element | string,
    options?: Record<string, unknown>
  ): Promise<AxeResults>;
  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message(): string };
  };
}
