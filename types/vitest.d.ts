import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
}

// Extend global with vitest globals
declare global {
  const describe: typeof import('vitest').describe
  const it: typeof import('vitest').it
  const expect: typeof import('vitest').expect
  const beforeEach: typeof import('vitest').beforeEach
  const afterEach: typeof import('vitest').afterEach
  const beforeAll: typeof import('vitest').beforeAll
  const afterAll: typeof import('vitest').afterAll
  const vi: typeof import('vitest').vi

  // Jest compatibility
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> extends import('vitest').MockInstance<T, Y> {}
    const fn: typeof vi.fn
    const Mock: typeof import('vitest').MockInstance
  }

  const jest: {
    fn: typeof vi.fn
    mock: typeof vi.mock
    clearAllMocks: typeof vi.clearAllMocks
    resetAllMocks: typeof vi.resetAllMocks
    restoreAllMocks: typeof vi.restoreAllMocks
    Mock: typeof import('vitest').MockInstance
  }
}