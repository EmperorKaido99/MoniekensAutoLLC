import { redirect } from 'next/navigation';

// Company settings are managed on the main settings page
export default function CompanySettingsPage() {
  redirect('/settings');
}
