"use client";

import { Download, Smartphone, Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function toUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function PwaManager() {
  const [installEvent, setInstallEvent] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        Boolean(
          (window.navigator as Navigator & { standalone?: boolean }).standalone,
        )),
  );
  const [pushSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }).catch((error) => console.error("PWA service worker registration failed:", error));
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => setIsSubscribed(Boolean(subscription)))
        .catch((error) => console.error("Push subscription lookup failed:", error));
    }

    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  async function installApp() {
    if (!installEvent) return;
    const promptEvent = installEvent as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setIsInstalled(true);
    setInstallEvent(null);
  }

  async function togglePush() {
    if (!pushSupported) return;
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();

      if (current) {
        await current.unsubscribe();
        await fetch("/api/pushnotification", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: current.endpoint }),
        });
        setIsSubscribed(false);
        toast.success("Push notifications disabled");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Push notifications are not configured yet");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(publicKey),
      });
      const response = await fetch("/api/pushnotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error("Could not save push subscription");
      setIsSubscribed(true);
      toast.success("Push notifications enabled");
    } catch (error) {
      console.error("Push notification setup failed:", error);
      toast.error("Could not update push notifications");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isInstalled && installEvent && (
        <button type="button" onClick={installApp} className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-xs font-medium text-[#243b64] hover:bg-[#f7f8fa]">
          <Download className="h-3.5 w-3.5" /> Install app
        </button>
      )}
      {pushSupported && (
        <button type="button" disabled={isBusy} onClick={togglePush} className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-xs font-medium text-[#243b64] hover:bg-[#f7f8fa] disabled:opacity-50">
          {isSubscribed ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {isSubscribed ? "Disable alerts" : "Enable alerts"}
        </button>
      )}
      {!pushSupported && !isInstalled && (
        <span className="inline-flex items-center gap-2 text-xs text-[#98a2b3]"><Smartphone className="h-3.5 w-3.5" /> Add to home screen from your browser menu</span>
      )}
    </div>
  );
}
