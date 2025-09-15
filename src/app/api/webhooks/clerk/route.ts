import { deleteUser, insertUser, updateUser } from "@/features/users/db/users";
import { syncClerkUserMetadata } from "@/app/services/clerk";
import { env } from "@/data/env/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixSignature = headerPayload.get("svix-signature");
  const svixTimestamp = headerPayload.get("svix-timestamp");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    }) as WebhookEvent;
  } catch (e) {
    console.log("Error verifying webhook", e);
    return new Response("Error occurred", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const email = event.data.email_addresses.find(
        (email) => email.id === event.data.primary_email_address_id
      );
      const name = `${event.data.first_name} ${event.data.last_name}`.trim();
      if (email == null) {
        return new Response("No email", { status: 400 });
      }
      if (name === null) {
        return new Response("No name", { status: 400 });
      }
      if (event.type === "user.created") {
        const user = await insertUser({
          clerkUserId: event.data.id,
          email: email.email_address,
          name,
          imageUrl: event.data.image_url,
          role: "user",
        });
        await syncClerkUserMetadata(user);
      } else {
        await updateUser(
          {
            clerkUserId: event.data.id,
          },
          {
            email: email.email_address,
            name,
            imageUrl: event.data.image_url,
            role: event.data.public_metadata.role,
          }
        );
      }
      break;
    }
    case "user.deleted": {
      if (event.data.id != null) {
        await deleteUser({ clerkUserId: event.data.id });
      }
      break;
    }
  }
  return new Response("", { status: 200 });
}
