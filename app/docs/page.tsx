import { withSiteLayout } from "@/hoc";

async function DocsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-lg mx-auto px-[15px] py-10">
        <h2 className="text-4xl font-semibold">Commentsy Documentation</h2>
        <p>@TODO</p>
      </div>
    </div>
  );
}

export default withSiteLayout(DocsPage);
