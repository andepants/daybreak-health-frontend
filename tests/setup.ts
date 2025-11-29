/**
 * Vitest test setup file.
 * Configures testing-library and global test utilities.
 */
import '@testing-library/dom'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
