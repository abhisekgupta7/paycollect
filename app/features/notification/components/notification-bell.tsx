"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type NotificationItem = {
  id: string;
  orgId?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  paymentId: string | null;
  paymentStatus: string | null;
  proofUrl: string | null;
  amount: number | null;
};

type NotificationBellProps = {
  unreadCount: number;
  notifications: NotificationItem[];
};

function formatCurrency(amountInPaisa: number | null) {
  if (amountInPaisa === null) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amountInPaisa / 100);
}

export default function NotificationBell({
  unreadCount,
  notifications,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasUnread = unreadCount > 0;

  const sortedNotifications = useMemo(() => notifications, [notifications]);

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-95 rounded-xl border border-white/10 bg-[#0f141b] p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
              <p className="text-sm font-semibold text-foreground">
              <Link href="/dashboard/payments">
                See all
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Unread: {unreadCount}
            </p>
          </div>

          <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
            {sortedNotifications.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            )}

            {sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {formatCurrency(notification.amount) && (
                    <span>• {formatCurrency(notification.amount)}</span>
                  )}
                  {notification.paymentStatus && (
                    <span>• {notification.paymentStatus}</span>
                  )}
                </div>

                
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
