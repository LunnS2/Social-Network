// social-network\convex\clerk.ts

"use node";

import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import { v } from "convex/values";
import { Webhook } from "svix";
import { internalAction } from "./_generated/server";

const WEB_HOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string;

if (!WEB_HOOK_SECRET) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}

export const fulfill = internalAction({
  args: {
    headers: v.any(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const wh = new Webhook(WEB_HOOK_SECRET);
      const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
      return payload;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Webhook verification failed:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
      throw new Error("Webhook verification error");
    }
  },
});


// https://docs.convex.dev/functions/internal-functions