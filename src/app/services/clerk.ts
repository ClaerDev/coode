import { UserRole } from "@/drizzle/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function getCurrentUser() {
    const {userId, sessionClaims, redirectToSignIn } = await auth()

    return {
        clerkUserId: userId,
        userId: sessionClaims?.dbId,
        role: sessionClaims?.role,
        redirectToSignIn
    }
}

export async function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
        dbId: user.id,
        role: user.role,
    },
  });
}
