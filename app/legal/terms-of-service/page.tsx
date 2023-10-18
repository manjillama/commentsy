import Footer from "@/components/footer";
import { withSiteLayout } from "@/hoc";

async function TermsOfService() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-lg mx-auto px-[15px] py-10">
        <h2 className="text-6xl font-bold">Terms of Service</h2>
        <p>@TODO</p>
      </div>
      <Footer />
    </div>
  );
}

export default withSiteLayout(TermsOfService);