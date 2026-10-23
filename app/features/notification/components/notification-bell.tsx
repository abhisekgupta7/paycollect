"use client";

import { useMemo, useState, useTransition } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { markNotificationReadAction } from "../actions/mark-notification-read";

type NotificationItem = {
  id: string;
  orgId?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
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
  const [items, setItems] = useState(notifications);
  const [remainingUnread, setRemainingUnread] = useState(unreadCount);
  const [isPending, startTransition] = useTransition();

  const hasUnread = remainingUnread > 0;

  const sortedNotifications = useMemo(
    () => [...items].sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [items],
  );

  function markAsRead(notificationId: string) {
    const notification = items.find((item) => item.id === notificationId);
    if (!notification || notification.isRead) return;

    setItems((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );
    setRemainingUnread((count) => Math.max(0, count - 1));

    startTransition(async () => {
      const result = await markNotificationReadAction(notificationId);
      if (!result.success) {
        setItems((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, isRead: false } : item,
          ),
        );
        setRemainingUnread((count) => count + 1);
      }
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e7ec] bg-white text-[#667085] transition-colors hover:bg-[#f7f8fa]"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-[#e4e7ec] bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#172033]">
              Notifications
            </p>
              <p className="text-sm font-semibold text-[#243b64]">
              <Link href="/dashboard/payments">
                <span className="inline-flex items-center gap-1">See all <ExternalLink className="h-3.5 w-3.5" /></span>
              </Link>
            </p>
            <p className="text-xs text-[#667085]">
              Unread: {remainingUnread}
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
                className={`rounded-lg border p-3 ${notification.isRead ? "border-[#e4e7ec] bg-[#f8fafc]" : "border-[#cbd8ee] bg-[#f3f6fc]"}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm text-[#172033]">
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
                {!notification.isRead && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => markAsRead(notification.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#243b64] hover:underline disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
