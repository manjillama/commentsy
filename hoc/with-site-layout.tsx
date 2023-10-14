import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

/* eslint-disable react/display-name */
export const withSiteLayout =
  (WrappedComponent: React.ComponentType<any>) => (props: any) =>
    (
      <main>
        <Navbar />
        <div style={{ minHeight: "100vh" }}>
          <WrappedComponent {...props} />
        </div>
        <Footer />
      </main>
    );
