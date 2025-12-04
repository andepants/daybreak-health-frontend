/**
 * Support Feature Module
 *
 * Exports components and hooks for customer support integration.
 * Includes Intercom widget, contextual help, and self-help resources.
 *
 * Epic 7: Support/Intercom Integration
 * Epic X: Emotional Support Content & Self-Help Resources
 */

export { useIntercom } from './useIntercom';

// Resource Components
export { ResourceCard, type ResourceCardProps } from './ResourceCard';
export { ResourceAccordion, type ResourceAccordionProps } from './ResourceAccordion';
export { ResourcePanel, type ResourcePanelProps } from './ResourcePanel';
export { ChatResourceBubble, type ChatResourceBubbleProps } from './ChatResourceBubble';
