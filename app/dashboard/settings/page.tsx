import { getActiveOrganizationDetails } from "@/app/features/auth/actions/organization";

export default async function SettingsPage() {
  const result = await getActiveOrganizationDetails();
  const organization = result.success ? result.data : null;

  return (
    <div className="space-y-6 px-5 py-7 sm:px-8">
      <div>
        <p className="text-sm font-medium text-[#667085]">Workspace</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Review your PayCollect workspace details.
        </p>
      </div>
      <section className="max-w-2xl rounded-xl border border-[#e4e7ec] bg-white p-5">
        <p className="text-sm font-semibold text-[#172033]">
          Organization profile
        </p>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
              Organization name
            </dt>
            <dd className="mt-1 text-sm text-[#172033]">
              {organization?.name || "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
              Organization ID
            </dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#667085]">
              {organization?.id || "Unavailable"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
