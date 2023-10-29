import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

/* eslint-disable react/display-name */
export const withSiteLayout =
  (WrappedComponent: React.ComponentType<any>) => (props: any) =>
    (
      <main>
        <Navbar />
        <div style={{ minHeight: "calc(100vh - 64px)", position: "relative" }}>
          <WrappedComponent {...props} />
        </div>
        <Footer />
      </main>
    );
