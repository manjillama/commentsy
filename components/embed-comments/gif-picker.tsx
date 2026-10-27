"use client";
/* eslint-disable @next/next/no-img-element -- KLIPY media must load directly without optimization. */
import { useEffect, useId, useState } from "react";
import { CommentStyles } from "@/interfaces/IApp";
import { CommentGif } from "@/utils/gif";
import { gifsEnabled, searchGifs } from "@/lib/klipy";
import GifImage from "./gif-image";

export default function GifPicker({ value, onChange, palette }: {
  value?: CommentGif;
  onChange: (gif?: CommentGif) => void;
  palette: CommentStyles["light"];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<CommentGif[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  useEffect(() => {
    if (!open || !gifsEnabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResults([]);
    setHasNext(false);
    const timer = setTimeout(async () => {
      try {
        const data = await searchGifs(query, page, controller.signal);
        if (!controller.signal.aborted) { setResults(data.gifs); setHasNext(data.hasNext); }
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load GIFs.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, query, page]);

  if (!gifsEnabled && !value) return null;
  return (
    <div className="my-3">
      {value && <div><GifImage gif={value} /><button type="button" className="text-sm underline" onClick={() => onChange(undefined)}>Remove GIF</button></div>}
      {gifsEnabled && <button type="button" aria-expanded={open} aria-controls={id} className="border rounded-lg px-3 py-1 mt-2 text-sm" style={palette.primary} onClick={() => setOpen(!open)}>{open ? "Close GIF picker" : value ? "Change GIF" : "GIF"}</button>}
      {open && <section id={id} aria-label="GIF picker" className="border rounded-lg p-3 mt-2" style={palette.primary} onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      }}>
        <label className="sr-only" htmlFor={`${id}-search`}>Search KLIPY</label>
        <input id={`${id}-search`} type="search" placeholder="Search KLIPY" maxLength={100} value={query} autoFocus
          style={palette.primary} className="border rounded-lg p-2 w-full mb-3"
          onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }}
          onChange={event => { setQuery(event.target.value); setPage(1); }} />
        <p role="status" className="text-sm" aria-live="polite">{loading ? "Loading GIFs…" : error || (results.length ? "" : "No GIFs found. Try another search.")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto" aria-busy={loading}>
          {results.map((gif, index) => <button key={`${gif.id}-${index}`} type="button" className="rounded-lg overflow-hidden focus:ring-2 focus:ring-current" aria-label={`Select ${gif.title || "GIF"}`} onClick={() => { onChange(gif); setOpen(false); }}>
            <img src={gif.url} alt={gif.title || "GIF"} loading="lazy" className="w-full h-24 object-contain" />
          </button>)}
        </div>
        <div className="flex justify-between items-center mt-3 text-xs gap-2">
          <button type="button" disabled={page <= 1 || loading} className="disabled:opacity-40" onClick={() => setPage(page - 1)}>Previous</button>
          <a href="https://klipy.com" target="_blank" rel="noreferrer">Powered by KLIPY</a>
          <button type="button" disabled={!hasNext || loading} className="disabled:opacity-40" onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </section>}
    </div>
  );
}
