/** Inline styles and a table layout work without external images, fonts, or CSS. */
export function passwordResetEmail(resetUrl: string) {
  const link = resetUrl.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));
  return {
    text: `Reset your Commentsy password using this link:\n\n${resetUrl}\n\nThis link expires in 30 minutes and can only be used once. If you didn’t request this, you can ignore this email. Your password has not changed.`,
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reset your Commentsy password</title></head>
<body style="margin:0;padding:0;background-color:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#262626;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your password reset link is ready. It expires in 30 minutes.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f5f1;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
<tr><td style="padding:0 8px 24px;font-size:23px;font-weight:700;letter-spacing:-1px;">commentsy<span style="color:#a88b50;">.</span></td></tr>
<tr><td style="padding:36px 28px;background-color:#ffffff;border:1px solid #e8e5dd;border-radius:12px;">
<p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:#82745c;">ACCOUNT RECOVERY</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;letter-spacing:-0.7px;">A fresh start for your password.</h1>
<p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:#666666;">We received a request to reset your Commentsy password. Use the button below to choose a new one.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#262626" style="border-radius:7px;"><a href="${link}" style="display:inline-block;padding:15px 24px;border:1px solid #262626;border-radius:7px;font-size:14px;font-weight:700;line-height:1.3;color:#ffffff;text-decoration:none;">Reset password</a></td></tr></table>
<p style="margin:18px 0 28px;font-size:12px;line-height:1.7;color:#777777;">This link expires in <strong>30 minutes</strong> and works only once.</p>
<p style="margin:0;padding-top:24px;border-top:1px solid #eeeeee;font-size:13px;line-height:1.7;color:#666666;">Didn’t request this? You can ignore this email. Your password has not changed.</p>
</td></tr>
<tr><td style="padding:22px 8px 0;font-size:12px;line-height:1.8;color:#777777;">Button not working? Copy and paste this link into your browser:<br><a href="${link}" style="color:#666666;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${link}</a></td></tr>
<tr><td style="padding:24px 8px 0;font-size:11px;line-height:1.8;color:#777777;">Sent by Commentsy · Please don’t reply to this automated email.</td></tr>
</table></td></tr></table>
</body></html>`,
  };
}
