/**
 * Type definitions for Intercom JavaScript API
 *
 * Provides TypeScript types for the Intercom messenger widget integration.
 * Based on Intercom JavaScript API documentation.
 *
 * @see https://developers.intercom.com/installing-intercom/docs/intercom-javascript
 */

/**
 * Configuration settings for Intercom initialization
 */
interface IntercomSettings {
  /** Your Intercom app ID (optional during delayed boot, required at boot time) */
  app_id?: string;

  /** Widget alignment - left or right side of screen */
  alignment?: 'left' | 'right';

  /** Horizontal padding from screen edge (in pixels) */
  horizontal_padding?: number;

  /** Vertical padding from screen bottom (in pixels) */
  vertical_padding?: number;

  /** Custom CSS selector for custom launcher element */
  custom_launcher_selector?: string;

  /** Hide default launcher (useful with custom launcher) */
  hide_default_launcher?: boolean;

  /** Background color for widget (hex color) */
  background_color?: string;

  /** Action color for buttons and links (hex color) */
  action_color?: string;
}

/**
 * Intercom API methods
 */
type IntercomMethod =
  | 'boot'          // Initialize Intercom
  | 'shutdown'      // Shut down Intercom
  | 'update'        // Update settings and user attributes
  | 'show'          // Show messenger
  | 'hide'          // Hide messenger
  | 'showMessages'  // Show message list
  | 'showNewMessage'// Show new message composer
  | 'onHide'        // Register hide callback
  | 'onShow'        // Register show callback
  | 'onUnreadCountChange' // Register unread count callback
  | 'trackEvent'    // Track custom event
  | 'getVisitorId'  // Get visitor ID
  | 'reattach_activator'; // Reattach activator after update

/**
 * User attributes that can be passed to Intercom
 * Used for user identification and context passing
 */
interface IntercomUserData {
  /** User's name */
  name?: string;
  /** User's email */
  email?: string;
  /** User ID */
  user_id?: string;
  /** Custom user attributes (any key-value pairs) */
  [key: string]: unknown;
}

/**
 * Intercom stub function interface for queueing calls before SDK loads.
 * Combines callable function with queue properties.
 */
interface IntercomStub {
  (method: IntercomMethod, data?: IntercomSettings | IntercomUserData | string | Record<string, unknown>): void;
  q?: unknown[][];
  c?: (args: unknown[]) => void;
}

/**
 * Window object extension for Intercom
 */
interface Window {
  /**
   * Intercom messenger API function.
   * Can be either the stub (before SDK loads) or the full API (after SDK loads).
   *
   * @param method - Intercom API method to call
   * @param data - Optional data for the method (settings, user data, or custom data)
   */
  Intercom?: IntercomStub;

  /**
   * Global Intercom settings object
   * Set this before loading the Intercom script
   */
  intercomSettings?: IntercomSettings;
}
