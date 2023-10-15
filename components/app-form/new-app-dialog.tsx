"use client";
import { useState } from "react";
import { Dialog } from "../ui";
import AppForm from "./form";

export default function NewAppDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      openChange={setOpen}
      triggerText="New app"
      triggerClass="bg-black text-white py-2 px-4 rounded-lg hover:opacity-75"
    >
      <h3 className="text-2xl font-semibold mb-4">Create new app</h3>
      <AppForm from="dialog" type="new" setOpen={setOpen} />
    </Dialog>
  );
}
