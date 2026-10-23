import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import NotAProductionAlert from "@/components/not-a-production-alert";

/* eslint-disable react/display-name */
export const withSiteLayout =
  (WrappedComponent: React.ComponentType<any>) => (props: any) =>
    (
      <main>
        <NotAProductionAlert />
        <Navbar />
        <div style={{ minHeight: "calc(100vh - 106px)", position: "relative" }}>
          <WrappedComponent {...props} />
        </div>
        <Footer />
      </main>
    );
