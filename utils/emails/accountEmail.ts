// Escape URLs before placing them in HTML attributes or link text.
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

/** Email-safe layout: inline styles, system fonts, and no remote assets. */
export function accountEmail(verificationUrl?: string) {
  const isVerificationEmail = Boolean(verificationUrl);
  const dashboardUrl = new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL)
    .href;
  const docsUrl = new URL("/docs", process.env.NEXT_PUBLIC_SITE_URL).href;
  const contactUrl = new URL("/contact", process.env.NEXT_PUBLIC_SITE_URL).href;
  const actionUrl = verificationUrl || dashboardUrl;
  const safeActionUrl = escapeHtml(actionUrl);
  const title = isVerificationEmail
    ? "One click. Then let’s talk."
    : "Your corner of the conversation.";
  const preheader = isVerificationEmail
    ? "Confirm your email and make yourself at home."
    : "Your account is ready. Here’s where the good conversations begin.";
  const message = isVerificationEmail
    ? "You’re almost in. Confirm your email to finish setting up your Commentsy account, then sign in and make yourself at home."
    : "Welcome to Commentsy! Good things start with a conversation. Now you have a place for yours.";
  const buttonLabel = isVerificationEmail
    ? "Confirm my email"
    : "Make yourself at home";
  // Welcome content is shared by the HTML and plain-text versions.
  const gettingStartedSteps = [
    {
      number: "01",
      heading: "Give your readers a voice.",
      body: "Add your website from the dashboard, then copy its two embed snippets into your pages. Each page can have its own discussion.",
    },
    {
      number: "02",
      heading: "Make it feel like your site.",
      body: "Choose light or dark mode and customize the colors. Enable guest approval if you’d like to review guest posts before they appear.",
    },
    {
      number: "03",
      heading: "Keep the conversation going.",
      body: "Manage comments and replies from your dashboard. Here to participate? Sign in when commenting to keep your contributions within reach.",
    },
  ];
  const gettingStartedRowsHtml = gettingStartedSteps
    .map(
      ({ number, heading, body }) => `
<tr>
  <td valign="top" width="36" style="padding-top:24px;color:#a08758;font-size:12px;font-weight:bold;">${number}
  </td>
  <td style="padding-top:20px;">
    <h2 style="font-size:16px;line-height:1.5;margin:0 0 6px;font-weight:600;color:#302a21;">${heading}
    </h2>
    <p style="font-size:13px;line-height:1.8;color:#6e6e6e;margin:0;">${body}
    </p>
  </td>
</tr>
`,
    )
    .join("");

  // Confirmation explains the link; welcome introduces the product.
  const detailsHtml = isVerificationEmail
    ? `
<div style="margin-top:28px;padding:18px 20px;background:#f7f5ef;border-radius:8px;font-size:13px;line-height:1.8;color:#6e6453;"><strong style="color:#443824;">A quick heads-up</strong><br>This link expires in 24 hours and works once. Opening it confirms your email automatically and takes you to sign-in.
</div>
<p style="margin:24px 0 0;font-size:12px;line-height:1.8;color:#777;">Didn’t create a Commentsy account? You can ignore this email. No action is needed.
</p>
`
    : `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #eee;">${gettingStartedRowsHtml}
</table>
<p style="margin:28px 0 0;font-size:13px;line-height:1.8;color:#666;">Need a hand getting started? <a href="${escapeHtml(docsUrl)}" style="color:#443824;">Read the setup guide</a> or <a href="${escapeHtml(contactUrl)}" style="color:#443824;">get in touch</a>.
</p>
`;
  // Keep the plain-text alternative useful when HTML is unavailable.
  const detailsText = isVerificationEmail
    ? "This link expires in 24 hours and works once. Opening it automatically confirms your email and takes you to sign-in. If you didn’t create this account, ignore this email."
    : [
        gettingStartedSteps
          .map(({ heading, body }) => `${heading}\n${body}`)
          .join("\n\n"),
        `Setup guide: ${docsUrl}\nContact: ${contactUrl}`,
      ].join("\n\n");

  const eyebrow = isVerificationEmail
    ? "YOUR NEXT CONVERSATION STARTS HERE"
    : "SMALL ADDITION. MORE CONNECTION.";
  const text = [
    title,
    message,
    `${buttonLabel}: ${actionUrl}`,
    detailsText,
    "Thanks for being here,\nCommentsy",
  ].join("\n\n");

  return {
    text,
    html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#262626;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 8px 24px;font-size:24px;font-weight:bold;letter-spacing:-1px;">commentsy<span style="color:#a08758;">.</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;background:#f1eadb;border:1px solid #e8e1d3;border-radius:14px 14px 0 0;">
                <p style="margin:0 0 18px;font-size:10px;letter-spacing:2px;font-weight:bold;color:#82745c;">${eyebrow}
                </p>
                <h1 style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-1px;font-weight:600;color:#302a21;">${title}
                </h1>
                <p style="margin:18px 0 0;font-size:12px;color:#82745c;">Your content. Their thoughts. One conversation.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;background:#fff;border:1px solid #e8e1d3;border-top:0;border-radius:0 0 14px 14px;">
                <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#666;">${message}
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#262626" style="border-radius:7px;"><a href="${safeActionUrl}" style="display:inline-block;padding:15px 24px;border:1px solid #262626;border-radius:7px;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;">${buttonLabel} &rarr;</a>
                    </td>
                  </tr>
                </table>
                ${detailsHtml}
                <p style="margin:28px 0 0;font-size:13px;line-height:1.8;color:#777;">Thanks for being here,<br><strong style="color:#443824;">Commentsy</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px 0;font-size:11px;line-height:1.8;color:#777;">Button not working? Copy this link into your browser:<br><a href="${safeActionUrl}" style="color:#777;word-break:break-all;overflow-wrap:anywhere;">${safeActionUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px 0;font-size:11px;line-height:1.8;color:#888;">Independent. Open source. Built for conversation.<br>This is an automated email; this inbox doesn’t accept replies.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };
}
