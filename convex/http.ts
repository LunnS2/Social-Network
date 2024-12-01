// social-network\convex\http.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const payloadString = await req.text();
    const headerPayload = req.headers;

    try {
      // Validate necessary headers
      const svixHeaders = ["svix-id", "svix-signature", "svix-timestamp"];
      svixHeaders.forEach((header) => {
        if (!headerPayload.get(header)) {
          throw new Error(`Missing required Svix header: ${header}`);
        }
      });

      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-signature": headerPayload.get("svix-signature")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
        },
      });

      switch (result.type) {
        case "user.created":
          console.log("User created:", result.data.id);
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
            email: result.data.email_addresses[0]?.email_address,
            name: `${result.data.first_name ?? "Guest"} ${result.data.last_name ?? ""}`.trim(),
            image: result.data.image_url,
          });
          break;
        case "user.updated":
          console.log("User updated:", result.data.id);
          await ctx.runMutation(internal.users.updateUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
            image: result.data.image_url,
          });
          break;
        case "session.created":
          console.log("Session created for user:", result.data.user_id);
          await ctx.runMutation(internal.users.setUserOnline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
          });
          break;
        case "session.ended":
          console.log("Session ended for user:", result.data.user_id);
          await ctx.runMutation(internal.users.setUserOffline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
          });
          break;
        default:
          console.log("Unhandled event type:", result.type);
          break;
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Webhook Error🔥🔥:", error.message, error.stack);
      } else {
        console.error("Unknown error:", error);
      }
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

export default http;

