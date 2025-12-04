/**
 * Type declarations for @rails/actioncable
 *
 * These declarations provide TypeScript support for the Rails ActionCable
 * JavaScript client library.
 *
 * @see https://guides.rubyonrails.org/action_cable_overview.html
 */
declare module "@rails/actioncable" {
  /**
   * Mixin interface for channel subscription callbacks
   */
  export interface CreateMixin<T = Record<string, unknown>> {
    /** Called when data is received from the channel */
    received?: (data: unknown) => void;
    /** Called when the subscription is successfully connected */
    connected?: () => void;
    /** Called when the subscription is disconnected */
    disconnected?: () => void;
    /** Called when the subscription is rejected by the server */
    rejected?: () => void;
    /** Called when the subscription is initialized */
    initialized?: () => void;
    /** Additional methods defined by the mixin */
    [key: string]: unknown;
  }

  /**
   * Represents an ActionCable subscription
   */
  export interface Subscription {
    /** Identifier for this subscription (JSON string) */
    identifier: string;

    /** Sends data to the server with a given action */
    perform(action: string, data?: Record<string, unknown>): void;

    /** Sends raw data to the channel */
    send(data: Record<string, unknown>): boolean;

    /** Unsubscribes from the channel */
    unsubscribe(): void;

    /** Called when connected - can be overridden */
    connected?: () => void;

    /** Called when disconnected - can be overridden */
    disconnected?: () => void;

    /** Called when subscription is rejected - can be overridden */
    rejected?: () => void;

    /** Called when data is received - can be overridden */
    received?: (data: unknown) => void;
  }

  /**
   * Manages subscriptions for a consumer
   */
  export interface Subscriptions {
    /** Creates a new subscription to a channel */
    create<T extends CreateMixin>(
      channel: string | { channel: string; [key: string]: unknown },
      mixin?: T
    ): Subscription & T;

    /** Removes a subscription */
    remove(subscription: Subscription): void;

    /** Finds subscriptions matching the given identifier */
    findAll(identifier: string): Subscription[];

    /** Sends a command to all subscriptions */
    reload(): void;
  }

  /**
   * Connection to the ActionCable server
   */
  export interface Connection {
    /** Opens the WebSocket connection */
    open(): boolean;

    /** Closes the WebSocket connection */
    close(options?: { allowReconnect?: boolean }): void;

    /** Reopens the connection if it was closed */
    reopen(): void;

    /** Returns whether the connection is open */
    isOpen(): boolean;

    /** Returns whether the connection is active */
    isActive(): boolean;
  }

  /**
   * Consumer represents a client-side connection to the ActionCable server
   */
  export interface Consumer {
    /** The subscriptions manager */
    subscriptions: Subscriptions;

    /** The connection instance */
    connection: Connection;

    /** URL of the ActionCable server */
    url: string;

    /** Connects to the server */
    connect(): boolean;

    /** Disconnects from the server */
    disconnect(): void;

    /** Sends data through the connection */
    send(data: Record<string, unknown>): boolean;

    /** Ensures the connection is active */
    ensureActiveConnection(): void;
  }

  /**
   * Creates a new Consumer instance
   *
   * @param url - WebSocket URL for the ActionCable server
   * @returns A new Consumer instance
   *
   * @example
   * ```typescript
   * const consumer = createConsumer('ws://localhost:3000/cable');
   * ```
   */
  export function createConsumer(url?: string): Consumer;

  /**
   * Returns the default consumer instance
   */
  export function getConsumer(): Consumer | null;

  /**
   * Logger for ActionCable debugging
   */
  export const logger: {
    log(...args: unknown[]): void;
  };

  /**
   * INTERNAL_IDENTIFIERS used by ActionCable
   */
  export const INTERNAL: {
    message_types: {
      welcome: string;
      disconnect: string;
      ping: string;
      confirmation: string;
      rejection: string;
    };
    disconnect_reasons: {
      unauthorized: string;
      invalid_request: string;
      server_restart: string;
    };
    default_mount_path: string;
    protocols: string[];
  };

  /**
   * Adapters for different environments
   */
  export const adapters: {
    logger: typeof console;
    WebSocket: typeof WebSocket;
  };
}
