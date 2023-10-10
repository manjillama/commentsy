"use client";
import { useState } from "react";
import { Dialog, Spinner } from "./ui";

export default function NewAppDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      openChange={setOpen}
      triggerText="New app"
      triggerClass="bg-black text-white py-2 px-4 rounded-lg hover:opacity-75"
    >
      <h3 className="text-2xl font-semibold mb-4">Create new app</h3>
      <form className="space-y-4">
        <div>
          <label className="space-y-2">
            <span className="text-neutral-500">App name*</span>
            <input
              autoComplete="off"
              className="border border-neutral-300 w-full rounded-lg p-3"
              name="name"
              type="text"
            />
          </label>
        </div>
        <div>
          <label className="space-y-2">
            <span className="text-neutral-500">Description*</span>
            <textarea
              className="border border-neutral-300 w-full rounded-lg p-3"
              name="description"
            />
          </label>
        </div>

        <div className="flex justify-between">
          <div>
            <button
              className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
          <div>
            <button
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
              }}
              className="py-2 px-4 block bg-black border border-neutral-200 text-white rounded-lg hover:opacity-75"
              type="submit"
            >
              {isSubmitting && (
                <div className="text-left absolute">
                  <Spinner />
                </div>
              )}
              Create app
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
