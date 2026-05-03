import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_12345');

export async function sendInvitationEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] API Key missing. Simulation mode active.");
    return { success: true, id: 'sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const data = await resend.emails.send({
      from: 'Easy Club <events@easy-club.app>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }

    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("[Resend] Email failed:", error);
    throw error;
  }
}
