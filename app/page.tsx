import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { withSiteLayout } from "@/hoc";
import Image from "next/image";
import Link from "next/link";
import HtmlCode from "@/components/code-snippets/html-code";
import JsCode from "@/components/code-snippets/js-code";

async function HomePage() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");
  return (
    <div className="bg-white min-h-screen pb-8 lg:pt-0 pt-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-[15px] py-4">
        <div className="flex flex-wrap rounded-lg mb-4">
          <div className="lg:w-1/2 mb-4 lg:pr-20 flex flex-col justify-center">
            <h1 className="text-3xl font-medium">
              Add comments to your website in just a few minutes.
            </h1>
            <div>
              {["Blog", "Post", "Photo", "Ecommerce", "Services"].map(
                (project) => (
                  <span
                    key={project}
                    className="text-xs inline-block bg-sky-100 text-blue-900 px-[8px] py-[2px] mr-[4px] rounded-full"
                  >
                    {project}
                  </span>
                )
              )}
            </div>
            <p className="text-neutral-500 mt-6 mb-12">
              &quot;Commentsy&quot; is an open-source service for developers,
              bloggers, and content creators looking to enhance their online
              presence and create a more interactive and engaging platform for
              their visitors. With its user-friendly features, it simplifies the
              process of code integration and commenting, saving time and effort
              while improving user interaction and collaboration.
            </p>
            <div>
              <Link
                className="py-4 px-8  bg-black text-white rounded-lg hover:opacity-75"
                href="/signin"
              >
                Get started
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative px-16 py-20">
            <Image
              className="rounded-xl border border-neutral-200 -rotate-12 shadow-md"
              src="/images/banner-1.jpg"
              alt="commentsy banner 1"
              width={900}
              height={796}
            />
            <Image
              className="rounded-xl absolute inset-0 rotate-12 scale-75 shadow-2xl"
              src="/images/banner-2.jpg"
              alt="commentsy banner 2"
              width={900}
              height={796}
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-4">
            No external dependencies. Simple as that.
          </h2>
          <div className="md:flex md:-mx-4">
            <div className="md:w-1/2 md:px-4">
              <p>
                1. Place the following code inside your HTML where you&apos;d
                like Commentsy to load.
              </p>
              <HtmlCode appCode="{{YOUR_APP_CODE}}" />
            </div>
            <div className="md:w-1/2 md:px-4">
              <p>
                2. Place the following JavaScript code inside your HTML head
                tag.
              </p>
              <JsCode />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withSiteLayout(HomePage);
