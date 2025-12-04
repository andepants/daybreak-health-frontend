/**
 * ActionCable Link for Apollo Client
 *
 * Creates an Apollo Link that uses Rails ActionCable for GraphQL subscriptions.
 * This bridges the gap between Apollo Client and Rails' GraphQL subscriptions
 * which use ActionCable instead of the graphql-transport-ws protocol.
 *
 * @see https://guides.rubyonrails.org/action_cable_overview.html
 */
import { ApolloLink, Operation, FetchResult, Observable } from "@apollo/client";
import { print } from "graphql";
import {
  createConsumer,
  Consumer,
  Subscription,
  type CreateMixin,
} from "@rails/actioncable";

import { getAuthToken } from "./links";

/**
 * ActionCable channel mixin type for GraphQL operations
 */
interface GraphQLChannelMixin {
  received: (data: ActionCableMessage) => void;
  execute: (payload: GraphQLPayload) => void;
}

/**
 * Message structure received from ActionCable
 */
interface ActionCableMessage {
  result?: {
    data?: Record<string, unknown>;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  };
  more?: boolean;
}

/**
 * Payload sent to GraphQL channel
 */
interface GraphQLPayload {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string | null;
}

/**
 * Configuration options for ActionCableLink
 */
export interface ActionCableLinkOptions {
  /** WebSocket URL for ActionCable (e.g., ws://localhost:3000/cable) */
  url: string;
  /** Name of the GraphQL channel (default: "GraphqlChannel") */
  channelName?: string;
  /** Connection parameters getter */
  connectionParams?: () => Record<string, unknown>;
}

/**
 * Connection state for ActionCable
 */
export type ActionCableConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Connection state change callback type
 */
export type ActionCableConnectionCallback = (
  state: ActionCableConnectionState
) => void;

// Module-level state for connection tracking
let consumer: Consumer | null = null;
let currentState: ActionCableConnectionState = "disconnected";
const stateListeners = new Set<ActionCableConnectionCallback>();

/**
 * Notifies all listeners of connection state change
 */
function notifyStateChange(state: ActionCableConnectionState): void {
  currentState = state;
  stateListeners.forEach((listener) => listener(state));
}

/**
 * Registers a callback for connection state changes
 * @returns Cleanup function
 */
export function onActionCableStateChange(
  callback: ActionCableConnectionCallback
): () => void {
  stateListeners.add(callback);
  callback(currentState);
  return () => stateListeners.delete(callback);
}

/**
 * Gets the current ActionCable connection state
 */
export function getActionCableState(): ActionCableConnectionState {
  return currentState;
}

/**
 * Creates an ActionCable consumer with auth token
 */
function getOrCreateConsumer(url: string): Consumer {
  if (consumer) return consumer;

  const token = getAuthToken();
  const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

  consumer = createConsumer(wsUrl);
  notifyStateChange("connecting");

  return consumer;
}

/**
 * Disconnects the current ActionCable consumer
 */
export function disconnectActionCable(): void {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
    notifyStateChange("disconnected");
  }
}

/**
 * Reconnects ActionCable (useful after auth token changes)
 */
export function reconnectActionCable(url: string): void {
  disconnectActionCable();
  getOrCreateConsumer(url);
}

/**
 * Creates an Apollo Link that uses ActionCable for subscriptions.
 *
 * This link subscribes to a GraphQL channel on the Rails backend and
 * forwards subscription results to Apollo Client.
 *
 * @param options - Configuration options
 * @returns Apollo Link for ActionCable subscriptions
 *
 * @example
 * ```typescript
 * const actionCableLink = createActionCableLink({
 *   url: 'ws://localhost:3000/cable',
 *   channelName: 'GraphqlChannel',
 * });
 * ```
 */
export function createActionCableLink(
  options: ActionCableLinkOptions
): ApolloLink {
  const { url, channelName = "GraphqlChannel" } = options;

  return new ApolloLink((operation: Operation) => {
    return new Observable<FetchResult>((observer) => {
      const cable = getOrCreateConsumer(url);
      let subscription: Subscription | null = null;

      // Create channel mixin
      const channelMixin: CreateMixin<GraphQLChannelMixin> = {
        // Called when data is received from the channel
        received(data: unknown) {
          const message = data as ActionCableMessage;
          if (message.result) {
            // Forward the GraphQL result to the observer
            observer.next({
              data: message.result.data,
              errors: message.result.errors,
            });

            // If this is the final message (not a subscription), complete
            if (!message.more) {
              observer.complete();
            }
          }
        },

        // Method to send GraphQL queries to the channel
        execute(payload: GraphQLPayload) {
          (this as unknown as Subscription).perform(
            "execute",
            payload as unknown as Record<string, unknown>
          );
        },
      };

      try {
        // Subscribe to the GraphQL channel
        subscription = cable.subscriptions.create(
          { channel: channelName },
          channelMixin
        );

        // Wait for subscription to be connected, then execute
        // ActionCable fires 'connected' callback when ready
        const originalConnected = subscription.connected;
        subscription.connected = function (this: Subscription) {
          notifyStateChange("connected");
          if (originalConnected) {
            originalConnected.call(this);
          }

          // Execute the GraphQL operation
          const payload: GraphQLPayload = {
            query: print(operation.query),
            variables: operation.variables,
            operationName: operation.operationName,
          };

          (this as unknown as GraphQLChannelMixin).execute(payload);
        };

        // Handle disconnection
        const originalDisconnected = subscription.disconnected;
        subscription.disconnected = function (this: Subscription) {
          notifyStateChange("disconnected");
          if (originalDisconnected) {
            originalDisconnected.call(this);
          }
        };

        // Handle rejection (e.g., unauthorized)
        const originalRejected = subscription.rejected;
        subscription.rejected = function (this: Subscription) {
          notifyStateChange("error");
          if (originalRejected) {
            originalRejected.call(this);
          }
          observer.error(new Error("ActionCable subscription rejected"));
        };
      } catch (error) {
        notifyStateChange("error");
        observer.error(error);
      }

      // Cleanup function
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  });
}

/**
 * Default export for convenience
 */
export default createActionCableLink;
