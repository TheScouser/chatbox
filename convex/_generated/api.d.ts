/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as chat from "../chat.js";
import type * as conversations from "../conversations.js";
import type * as embeddings from "../embeddings.js";
import type * as files from "../files.js";
import type * as knowledge from "../knowledge.js";
import type * as openai from "../openai.js";
import type * as textExtraction from "../textExtraction.js";
import type * as users from "../users.js";
import type * as vectorSearch from "../vectorSearch.js";
import type * as webCrawling from "../webCrawling.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  chat: typeof chat;
  conversations: typeof conversations;
  embeddings: typeof embeddings;
  files: typeof files;
  knowledge: typeof knowledge;
  openai: typeof openai;
  textExtraction: typeof textExtraction;
  users: typeof users;
  vectorSearch: typeof vectorSearch;
  webCrawling: typeof webCrawling;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
