import { Resend } from 'resend';

let client: Resend | null = null;

function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = 'DevFolio <notifications@devfolio.io>';

export async function sendOutreachOpportunityEmail(params: {
  to: string;
  developerName: string;
  jobTitle: string;
  matchScore: number;
  reviewUrl: string;
}) {
  return getClient().emails.send({
    from: FROM,
    to: params.to,
    subject: `New ${params.matchScore}% match: ${params.jobTitle}`,
    html: `<p>Hi ${params.developerName},</p>
<p>DevFolio found a new opportunity that matches your profile at <strong>${params.matchScore}%</strong>:</p>
<p><strong>${params.jobTitle}</strong></p>
<p>We've drafted a personalised proposal for you — review and send it with one click:</p>
<p><a href="${params.reviewUrl}">${params.reviewUrl}</a></p>`,
  });
}

export async function sendTestimonialRequestEmail(params: {
  to: string;
  clientName: string;
  developerName: string;
  formUrl: string;
}) {
  return getClient().emails.send({
    from: FROM,
    to: params.to,
    subject: `Quick favor for ${params.developerName}?`,
    html: `<p>Hi ${params.clientName},</p>
<p>${params.developerName} recently wrapped up a project with you and would love your feedback — it takes less than a minute:</p>
<p><a href="${params.formUrl}">${params.formUrl}</a></p>`,
  });
}

export async function sendContactFormEmail(params: {
  to: string;
  fromName: string;
  fromEmail: string;
  message: string;
  portfolioSlug: string;
}) {
  return getClient().emails.send({
    from: FROM,
    to: params.to,
    replyTo: params.fromEmail,
    subject: `New contact form message from ${params.fromName} (via ${params.portfolioSlug}.devfolio.io)`,
    html: `<p><strong>${params.fromName}</strong> (${params.fromEmail}) sent you a message:</p>
<p>${params.message.replace(/\n/g, '<br />')}</p>`,
  });
}
