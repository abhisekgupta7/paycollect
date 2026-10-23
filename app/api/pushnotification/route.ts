import { db } from "@/lib/db/client";
import { pushSubscriptionsTable } from "@/lib/db/schema";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.activeOrgId) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 },
    );
  }

  const data = (await request.json()) as PushSubscriptionPayload;

  if (!data?.endpoint || !data?.keys?.p256dh || !data?.keys?.auth) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid subscription payload" }),
      { status: 400 },
    );
  }

  try {
    await db
      .delete(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.userId, session.user.id),
          eq(pushSubscriptionsTable.organizationId, session.user.activeOrgId),
          eq(pushSubscriptionsTable.endpoint, data.endpoint),
        ),
      );

    await db.insert(pushSubscriptionsTable).values({
      endpoint: data.endpoint,
      keys: data.keys,
      expirationTime: data.expirationTime
        ? new Date(data.expirationTime)
        : null,
      userId: session.user.id,
      organizationId: session.user.activeOrgId,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to save push notification subscription",
      }),
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.activeOrgId) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 },
    );
  }

  const data = await request.json();
  const { endpoint } = data;

  if (!endpoint) {
    return new Response(
      JSON.stringify({ success: false, error: "Endpoint is required" }),
      { status: 400 },
    );
  }

  try {
    await db
      .delete(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.userId, session.user.id),
          eq(pushSubscriptionsTable.organizationId, session.user.activeOrgId),
          eq(pushSubscriptionsTable.endpoint, endpoint),
        ),
      );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to delete push notification subscription",
      }),
      { status: 500 },
    );
  }
}
