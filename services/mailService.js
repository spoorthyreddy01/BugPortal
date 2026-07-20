import { SendEmailCommand } from "@aws-sdk/client-ses";
import { getSESClient } from "@/lib/ses";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { USER_STATUS } from "@/config/constants";

// SES caps a single SendEmail call at 50 destination addresses total
// (To + Cc + Bcc), so a large active-user list has to be sent in batches.
const SES_MAX_RECIPIENTS_PER_CALL = 50;

const APP_URL = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function getActiveUserEmails(excludeUserId) {
  await connectDB();

  const filter = { status: USER_STATUS.ACTIVE };
  if (excludeUserId) filter._id = { $ne: excludeUserId };

  const users = await User.find(filter).select("email").lean();
  return users.map((u) => u.email).filter(Boolean);
}

// Recipients go in Bcc so active users don't see each other's email
// addresses; SES requires at least one address across To/Cc/Bcc, so Source
// doubles as the (sole) To address.
async function sendToRecipients(emails, { subject, html, text }) {
  if (!emails.length) return;

  const sender = process.env.AWS_SES_SENDER_EMAIL;
  if (!sender) throw new Error("AWS_SES_SENDER_EMAIL is not configured");

  const client = getSESClient();
  const batches = chunk(emails, SES_MAX_RECIPIENTS_PER_CALL);

  const results = await Promise.allSettled(
    batches.map((batch) =>
      client.send(
        new SendEmailCommand({
          Source: sender,
          Destination: { BccAddresses: batch },
          Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: html, Charset: "UTF-8" },
              Text: { Data: text, Charset: "UTF-8" },
            },
          },
        })
      )
    )
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.error(
      `SES: ${failed.length}/${batches.length} batch(es) failed`,
      failed.map((r) => r.reason?.message || r.reason)
    );
  }
}

// `showLink` is false for the deletion mail — the issue page 404s once
// the record is gone, so pointing at it would just be a dead link.
function issueEmailTemplate({ heading, message, issue, showLink = true }) {
  const link = `${APP_URL}/issues/${issue._id}`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #18181b; margin-bottom: 8px;">${heading}</h2>
      <p style="color: #3f3f46; font-size: 14px;">${message}</p>
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #18181b;">${issue.title}</p>
        <p style="margin: 0; font-size: 13px; color: #71717a; text-transform: capitalize;">
          Priority: ${issue.priority} &middot; Status: ${issue.status.replace("_", " ")}
        </p>
      </div>
      ${
        showLink
          ? `<a href="${link}" style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-size: 14px;">
        View Issue
      </a>`
          : ""
      }
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">
        Bug Portal &middot; Fix4Ever
      </p>
    </div>
  `;

  const text = `${heading}\n\n${message}\n\n${issue.title}\nPriority: ${issue.priority} | Status: ${issue.status}${
    showLink ? `\n\nView issue: ${link}` : ""
  }`;

  return { html, text };
}

export async function sendIssueCreatedMail(issue, reporterName) {
  const emails = await getActiveUserEmails(issue.reporter);
  const { html, text } = issueEmailTemplate({
    heading: "New Issue Reported",
    message: `${reporterName || "Someone"} reported a new issue.`,
    issue,
  });

  await sendToRecipients(emails, {
    subject: `[Bug Portal] New issue: ${issue.title}`,
    html,
    text,
  });
}

export async function sendStartedWorkingMail(issue, developer) {
  const emails = await getActiveUserEmails(developer.id);
  const { html, text } = issueEmailTemplate({
    heading: "Someone Started Working on an Issue",
    message: `${developer.name || "Someone"} started working on this issue.`,
    issue,
  });

  await sendToRecipients(emails, {
    subject: `[Bug Portal] In progress: ${issue.title}`,
    html,
    text,
  });
}

export async function sendIssueResolvedMail(issue, resolver) {
  const emails = await getActiveUserEmails(resolver.id);
  const { html, text } = issueEmailTemplate({
    heading: "Issue Resolved",
    message: `${resolver.name || "Someone"} resolved this issue.`,
    issue,
  });

  await sendToRecipients(emails, {
    subject: `[Bug Portal] Resolved: ${issue.title}`,
    html,
    text,
  });
}

export async function sendIssueDeletedMail(issue, deleter) {
  const emails = await getActiveUserEmails(deleter.id);
  const { html, text } = issueEmailTemplate({
    heading: "Issue Deleted",
    message: `${deleter.name || "Someone"} deleted this issue. It was likely reported by mistake or misunderstanding.`,
    issue,
    showLink: false,
  });

  await sendToRecipients(emails, {
    subject: `[Bug Portal] Deleted: ${issue.title}`,
    html,
    text,
  });
}
