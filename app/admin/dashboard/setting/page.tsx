import { COMPANY_CONFIG } from "@/app/config/company";

export default function AdminSettingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Admin Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform contact and support details for the PayCollect admin view.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-muted-foreground">
            <span>Company</span>
            <span className="font-medium text-foreground">
              {COMPANY_CONFIG.name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-muted-foreground">
            <span>Support phone</span>
            <span className="font-medium text-foreground">
              {COMPANY_CONFIG.phone}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-muted-foreground">
            <span>WhatsApp</span>
            <span className="font-medium text-foreground">
              {COMPANY_CONFIG.whatsapp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
