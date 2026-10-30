import SupportProject from "@/components/support-project";
import NewAppDialog from "@/components/app-form/new-app-dialog";
import { withSiteLayout } from "@/hoc";
import UserApps from "@/components/user-apps";
import CommentContent from "@/components/embed-comments/comment-content";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, ChatBubbleIcon, ExternalLinkIcon, GlobeIcon } from "@radix-ui/react-icons";
import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import App from "@/models/App";
import { DEFAULT_COMMENT_STYLES } from "@/utils/commentStyles";

export const metadata: Metadata = {
  title: `Dashboard | ${SITE_DATA.title}`,
};

async function DashboardPage({ searchParams }: { searchParams?: { page?: string } }) {
  const session = await getServerSession(options);
  if (!session?.user.id) redirect("/signin?callbackUrl=/dashboard");
  await dbConnect();
  const requestedPage = Number(searchParams?.page ?? 1);
  const [activity, sitesCount] = await Promise.all([
    commentService.getOwnComments(session.user.id, Number.isFinite(requestedPage) ? requestedPage : 1),
    App.countDocuments({ user: session.user.id }),
  ]);
  const firstName = session.user.name?.trim().split(/\s+/)[0];

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      <header className="border-b bg-white">
        <div className="max-w-screen-lg mx-auto px-[15px] py-10 sm:py-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Your Commentsy</span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3">{firstName ? `Welcome back, ${firstName}.` : "Welcome to your corner."}</h1>
          <p className="text-neutral-600 mt-3 max-w-xl leading-relaxed">Stay part of the conversation. Manage your comments across the web, or bring the conversation to your own site.</p>
          <nav aria-label="Dashboard sections" className="grid sm:grid-cols-2 gap-4 mt-8">
            <a href="#your-comments" className="group rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-4 hover:border-amber-400 transition-colors">
              <span className="rounded-lg bg-amber-100 p-3 h-fit"><ChatBubbleIcon width={22} height={22} aria-hidden="true" /></span>
              <div className="flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Your comments</h2><span className="text-sm rounded-full bg-white px-2.5 py-0.5 border border-amber-200">{activity.total}</span></div><p className="text-sm text-neutral-600 mt-1">Revisit, edit, and manage what you&apos;ve shared.</p><span className="inline-flex items-center gap-2 mt-3 text-xs font-semibold">See your activity <ArrowRightIcon aria-hidden="true" /></span></div>
            </a>
            <a href="#your-sites" className="group rounded-xl border border-neutral-200 bg-white p-5 flex gap-4 hover:border-neutral-400 transition-colors">
              <span className="rounded-lg bg-neutral-100 p-3 h-fit"><GlobeIcon width={22} height={22} aria-hidden="true" /></span>
              <div className="flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Your sites</h2><span className="text-sm rounded-full bg-neutral-50 px-2.5 py-0.5 border">{sitesCount}</span></div><p className="text-sm text-neutral-600 mt-1">Add comments to your site and make it your own.</p><span className="inline-flex items-center gap-2 mt-3 text-xs font-semibold">Manage integrations <ArrowRightIcon aria-hidden="true" /></span></div>
            </a>
          </nav>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px]">
        <section id="your-comments" className="pt-10 scroll-mt-6" aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="text-2xl font-semibold tracking-tight">Your comments</h2>
          <p className="text-sm text-neutral-500 mt-2 mb-5">Comments and replies you posted while signed in. Guest, removed, and hidden comments won&apos;t appear here.</p>
          {activity.comments.length ? <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {activity.comments.map(comment => {
              let pageUrl: string | undefined;
              try { const url = new URL(comment.pageUrl); if (["http:", "https:"].includes(url.protocol)) pageUrl = url.href; } catch { /* Older entries may not have a valid page URL. */ }
              return <article key={comment._id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-3">
                  <span className="rounded-full bg-neutral-100 px-2 py-1">{comment.parent ? "Reply" : "Comment"}</span>
                  <time dateTime={new Date(comment.createdAt).toISOString()}>{new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
                </div>
                {pageUrl ? <a href={pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold hover:underline mb-3 break-words">{comment.pageTitle || "View original page"}<ExternalLinkIcon className="shrink-0" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a> : <h3 className="font-semibold mb-3">{comment.pageTitle || "Original page unavailable"}</h3>}
                <CommentContent comment={comment} user={session.user} palette={DEFAULT_COMMENT_STYLES.light} />
              </article>;
            })}
          </div> : <div className="border border-dashed border-neutral-300 bg-white rounded-xl px-6 py-10 text-center">
            <ChatBubbleIcon className="mx-auto text-neutral-400 mb-3" width={28} height={28} aria-hidden="true" />
            <h3 className="font-semibold text-lg">Your next conversation starts out there.</h3>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">Leave a comment on any site using Commentsy while signed in. You&apos;ll be able to find and manage it here.</p>
          </div>}
          {activity.pages > 1 && <nav aria-label="Comment pages" className="flex items-center justify-between mt-5 text-sm">
            {activity.page > 1 ? <Link className="border rounded-lg bg-white px-3 py-2 hover:bg-neutral-100" href={`/dashboard?page=${activity.page - 1}#your-comments`}>Previous</Link> : <span />}
            <span className="text-neutral-500">Page {activity.page} of {activity.pages}</span>
            {activity.page < activity.pages ? <Link className="border rounded-lg bg-white px-3 py-2 hover:bg-neutral-100" href={`/dashboard?page=${activity.page + 1}#your-comments`}>Next</Link> : <span />}
          </nav>}
        </section>
        <section id="your-sites" className="pt-12 scroll-mt-6" aria-labelledby="sites-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div><h2 id="sites-heading" className="text-2xl font-semibold tracking-tight">Your sites</h2><p className="text-sm text-neutral-500 mt-2">Manage your Commentsy apps, appearance, and conversations.</p></div>
            <NewAppDialog />
          </div>
          <UserApps />
        </section>
        <SupportProject />
      </div>
    </div>
  );
}

export default withSiteLayout(DashboardPage);
