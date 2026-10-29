"use client";

import FieldHelp from "./field-help";

export default function GuestApprovalHelp() {
  return (
    <FieldHelp label="About guest comment approval">
      <span className="mb-2 block">Hold comments and replies from visitors who aren&apos;t signed in until you approve them on the Comments page. Signed-in users&apos; posts appear immediately.</span>
      <span className="block">Turning this off won&apos;t publish posts already pending.</span>
    </FieldHelp>
  );
}
