/**
 * Vitest test setup file.
 * Configures testing-library and global test utilities.
 */
import '@testing-library/dom'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
