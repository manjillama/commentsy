"use client";
import HtmlCode from "@/components/code-snippets/html-code";
import JsCode from "@/components/code-snippets/js-code";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function App({ params: { id } }: { params: { id: string } }) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  return (
    <div>
      <header className="border-b py-12">
        <div className="max-w-screen-lg px-[15px] mx-auto">
          <span className="text-sm text-neutral-500">{app.code}</span>
          <h1 className="text-4xl my-3">{app.name}</h1>
          <p className="text-neutral-800">{app.description}</p>
        </div>
      </header>
      <div className="max-w-screen-lg px-[15px] mx-auto py-12">
        <h2 className="text-2xl mb-2 font-semibold">
          Integrate commentsy to your site
        </h2>
        <p className="mb-4 text-neutral-500">
          No external dependencies. Just follow the instructions below and
          you&apos;re done!
        </p>
        <br />
        1. Place the following code inside your HTML where you&apos;d like
        Commentsy to load. Iframe src URL has two parameters. First one is&nbsp;
        <b>identifier</b> and it is required, provide your page&apos;s unique
        identifier variable. Second one is <b>theme</b>, your site&apos;s color
        mode, provide &apos;light&apos; for light mode and &apos;dark&apos; for
        dark mode. In case of no theme provided then commentsy will use
        user&apos;s device theme.
        <HtmlCode appCode={app.code} />
        <br />
        2. Place the following JavaScript code inside your HTML head tag. It
        dynamically adjusts the iframe height based on the content inside and
        passes your current URL and page title to commentsy.
        <JsCode />
      </div>
    </div>
  );
}
