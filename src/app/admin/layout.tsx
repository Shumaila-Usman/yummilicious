import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminLayoutClient } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminProviders>
  );
}
