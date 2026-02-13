import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.UPLOADTHING_SECRET = 'sk_test_123'
process.env.UPLOADTHING_APP_ID = 'test-app-id'

// Setup jest compatibility with proper types
global.jest = {
  fn: vi.fn as any,
  mock: vi.mock as any,
  clearAllMocks: vi.clearAllMocks as any,
  resetAllMocks: vi.resetAllMocks as any,
  restoreAllMocks: vi.restoreAllMocks as any,
  Mock: vi.fn().constructor as any,
  // Add minimal required jest properties
  advanceTimersByTime: vi.advanceTimersByTime as any,
  advanceTimersByTimeAsync: vi.advanceTimersByTimeAsync as any,
  advanceTimersToNextFrame: vi.advanceTimersToNextFrame as any,
  advanceTimersToNextTimer: vi.advanceTimersToNextTimer as any,
  autoMockOff: (() => global.jest) as any,
  autoMockOn: (() => global.jest) as any,
  clearAllTimers: vi.clearAllTimers as any,
  createMockFromModule: vi.importMock as any,
  deepUnmock: (() => global.jest) as any,
  disableAutomock: (() => global.jest) as any,
  doMock: vi.doMock as any,
  dontMock: vi.doUnmock as any,
  enableAutomock: (() => global.jest) as any,
  genMockFromModule: vi.importMock as any,
  getRealSystemTime: vi.getRealSystemTime as any,
  getSeed: (() => 1) as any,
  getTimerCount: vi.getTimerCount as any,
  isMockFunction: vi.isMockFunction as any,
  isolateModules: ((fn: any) => fn()) as any,
  mocked: ((item: any) => item) as any,
  requireActual: vi.importActual as any,
  requireMock: vi.importMock as any,
  resetModules: (() => global.jest) as any,
  runAllImmediates: vi.runAllTimers as any,
  runAllTicks: vi.runAllTicks as any,
  runAllTimers: vi.runAllTimers as any,
  runOnlyPendingTimers: vi.runOnlyPendingTimers as any,
  setMock: vi.mock as any,
  setTimeout: vi.useRealTimers as any,
  setSystemTime: vi.setSystemTime as any,
  spyOn: vi.spyOn as any,
  unmock: vi.doUnmock as any,
  useFakeTimers: vi.useFakeTimers as any,
  useRealTimers: vi.useRealTimers as any,
} as any