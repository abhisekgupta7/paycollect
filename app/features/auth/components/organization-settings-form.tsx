"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateActiveOrganizationDetails } from "../actions/organization";

type OrganizationSettingsFormProps = {
  initialName: string;
};

export default function OrganizationSettingsForm({
  initialName,
}: OrganizationSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const result = await updateActiveOrganizationDetails({ name });

    if (!result.success) {
      toast.error(result.message || "Failed to update organization");
      setIsSaving(false);
      return;
    }

    toast.success("Organization details updated");
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <div>
        <p className="text-sm font-semibold text-foreground">
          Organization Profile
        </p>
        <p className="text-xs text-muted-foreground">
          Update your active organization details.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input
          id="org-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-9"
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
      >
        {isSaving ? "Saving..." : "Save organization"}
      </Button>
    </form>
  );
}
