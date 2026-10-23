import Submenu from "@/components/submenu";
import { withSiteLayout } from "@/hoc";

function AppLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div>
      <Submenu
        menuLinks={[
          { url: `/apps/${id}`, name: "App" },
          { url: `/apps/${id}/comments`, name: "Comments" },
          { url: `/apps/${id}/appearance`, name: "Appearance" },
          { url: `/apps/${id}/settings`, name: "Settings" },
        ]}
      />
      {children}
    </div>
  );
}

export default withSiteLayout(AppLayout);
