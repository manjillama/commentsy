import Navbar from "@/components/navbar";

/* eslint-disable react/display-name */
export const withNavbar =
  (WrappedComponent: React.ComponentType<any>) => (props: any) =>
    (
      <main>
        <Navbar />
        <WrappedComponent {...props} />
      </main>
    );
