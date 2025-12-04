/**
 * Shared Components Index
 *
 * Exports all shared/utility components:
 * - ErrorBoundary: React error boundary for graceful error handling
 * - DataSyncPrompt: Manual sync prompt (deprecated - prefer auto-sync on continue)
 * - SyncErrorBanner: Error banner for sync failures
 */
export { ErrorBoundary } from "./ErrorBoundary";
export type { ErrorBoundaryProps } from "./ErrorBoundary";
export { DataSyncPrompt } from "./DataSyncPrompt";
export type { DataSyncPromptProps } from "./DataSyncPrompt";
export { SyncErrorBanner } from "./SyncErrorBanner";
export type { SyncErrorBannerProps } from "./SyncErrorBanner";
