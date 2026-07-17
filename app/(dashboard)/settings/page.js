import ThemeSection from "@/components/settings/ThemeSection";

export default function SettingsPage() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Preferences for this device.
        </p>
      </div>

      <ThemeSection />
    </div>
  );
}
