/**
 * Shared ConvexHttpClient instance.
 * Works in both server (Route Handlers, Server Actions) and client contexts.
 * 
 * Wrapped to parse Convex error messages and extract the actual error text
 * from the stack trace format: "[Request ID: ...] Server Error\nUncaught Error: MESSAGE"
 */
import { ConvexHttpClient } from 'convex/browser';
import type { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';

const baseClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);

/**
 * Parse Convex error message to extract the actual error text.
 * Convex errors come as: "[Request ID: xxx] Server Error\nUncaught Error: ACTUAL_MESSAGE\n    at ..."
 */
function parseConvexError(error: unknown): Error {
  if (!(error instanceof Error)) return error as Error;
  
  const convexErrorMatch = error.message.match(/Uncaught Error: ([^\n]+)/);
  if (convexErrorMatch) {
    return new Error(convexErrorMatch[1]);
  }
  
  return error;
}

/**
 * Wrapped Convex client that parses error messages.
 */
export const convex = {
  async query<Query extends FunctionReference<'query'>>(
    query: Query,
    args: FunctionArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    try {
      return await baseClient.query(query, args);
    } catch (err) {
      throw parseConvexError(err);
    }
  },
  
  async mutation<Mutation extends FunctionReference<'mutation'>>(
    mutation: Mutation,
    args: FunctionArgs<Mutation>
  ): Promise<FunctionReturnType<Mutation>> {
    try {
      return await baseClient.mutation(mutation, args);
    } catch (err) {
      throw parseConvexError(err);
    }
  },
  
  async action<Action extends FunctionReference<'action'>>(
    action: Action,
    args: FunctionArgs<Action>
  ): Promise<FunctionReturnType<Action>> {
    try {
      return await baseClient.action(action, args);
    } catch (err) {
      throw parseConvexError(err);
    }
  },
};
