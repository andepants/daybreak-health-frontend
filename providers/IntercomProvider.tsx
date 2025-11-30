/**
 * Intercom Provider Component
 *
 * Initializes and manages the Intercom messenger widget throughout the application.
 * Loads the Intercom script asynchronously to avoid blocking page render.
 *
 * Features:
 * - Asynchronous script loading
 * - Client-side only rendering (Next.js App Router compatible)
 * - Daybreak brand color configuration
 * - Mobile-responsive positioning
 * - Accessible widget placement
 *
 * Environment Variables:
 * - NEXT_PUBLIC_INTERCOM_APP_ID: Your Intercom app ID (required)
 *
 * @see https://developers.intercom.com/installing-intercom/docs/intercom-javascript
 */
'use client';

import { useEffect } from 'react';

/**
 * Props for the IntercomProvider component
 */
interface IntercomProviderProps {
  /** React children to wrap with Intercom context */
  children: React.ReactNode;
}

/**
 * Intercom stub function interface for queueing calls before SDK loads.
 * Combines callable function with queue properties.
 */
interface IntercomStub {
  (...args: unknown[]): void;
  q: unknown[][];
  c: (args: unknown[]) => void;
}

/**
 * Daybreak brand color for Intercom widget.
 * Matches the primary teal color from globals.css.
 * @constant {string}
 */
const DAYBREAK_TEAL = '#2A9D8F';

/**
 * Loads the Intercom messenger script and initializes the widget.
 *
 * Configuration:
 * - Position: Fixed bottom-right with padding
 * - Brand color: Daybreak teal (#2A9D8F)
 * - Async loading: Non-blocking script injection
 * - Mobile-optimized: Responsive padding and positioning
 *
 * @param appId - Intercom application ID
 */
function loadIntercom(appId: string): void {
  // Set global Intercom configuration
  window.intercomSettings = {
    app_id: appId,
    alignment: 'right',
    horizontal_padding: 20,
    vertical_padding: 20,
    action_color: DAYBREAK_TEAL,
  };

  // Check if Intercom is already loaded
  const ic = window.Intercom;
  if (typeof ic === 'function') {
    // Reattach and update if already initialized
    ic('reattach_activator');
    ic('update', window.intercomSettings);
    return;
  }

  // Create Intercom stub function for queueing calls
  const intercomStub: IntercomStub = Object.assign(
    function(...args: unknown[]) {
      intercomStub.c(args);
    },
    {
      q: [] as unknown[][],
      c: function(args: unknown[]) {
        this.q.push(args);
      }
    }
  );
  window.Intercom = intercomStub as typeof window.Intercom;

  // Load Intercom script asynchronously
  const loadScript = (): void => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${appId}`;

    // Insert script before first existing script tag
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      // Fallback: append to body if no script tags exist
      document.body.appendChild(script);
    }
  };

  // Load when document is ready
  if (document.readyState === 'complete') {
    loadScript();
  } else if (window.attachEvent) {
    // IE support (legacy)
    window.attachEvent('onload', loadScript);
  } else {
    window.addEventListener('load', loadScript, false);
  }
}

/**
 * IntercomProvider - Wraps the application with Intercom support
 *
 * Initializes Intercom messenger widget on mount and cleans up on unmount.
 * Widget appears on all pages as a fixed bottom-right chat bubble.
 *
 * Usage:
 * ```tsx
 * <IntercomProvider>
 *   <YourApp />
 * </IntercomProvider>
 * ```
 *
 * @param children - React children to wrap with Intercom context
 */
export function IntercomProvider({ children }: IntercomProviderProps) {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

    // Validate app ID is configured
    if (!appId || typeof appId !== 'string' || appId.trim().length === 0) {
      console.warn(
        '[Intercom] NEXT_PUBLIC_INTERCOM_APP_ID not configured or invalid. ' +
        'Expected a non-empty string. ' +
        'Intercom widget will not be loaded. ' +
        'Add NEXT_PUBLIC_INTERCOM_APP_ID to your .env.local file.'
      );
      return;
    }

    // Load Intercom (useEffect ensures browser environment)
    loadIntercom(appId);

    // Cleanup on unmount
    return () => {
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, []);

  return <>{children}</>;
}
