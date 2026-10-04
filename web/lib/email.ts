import { Resend } from "resend";
import {
    InnovationNotificationEmail,
    renderInnovationEmailHtml,
    type InnovationEmailTemplateProps,
} from "../emails/InnovationNotificationEmail";

export const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const resend = new Resend(RESEND_API_KEY);

export { InnovationNotificationEmail, renderInnovationEmailHtml };
export type { InnovationEmailTemplateProps };

export interface AdminRecipient {
    email: string;
    name?: string | null;
}

/**
 * Sends an email notification to all administrator emails when a new innovation is created.
 */
export async function sendAdminInnovationNotification({
    adminEmails,
    adminRecipients,
    innovation,
}: {
    adminEmails?: string[];
    adminRecipients?: AdminRecipient[];
    innovation: InnovationEmailTemplateProps["innovation"];
}) {
    const recipients: AdminRecipient[] =
        adminRecipients && adminRecipients.length > 0
            ? adminRecipients.filter((r) => Boolean(r.email && r.email.trim()))
            : (adminEmails || []).filter((email) => Boolean(email && email.trim())).map((email) => ({ email }));

    if (recipients.length === 0) {
        console.warn("[IsKRA] Brak adresów e-mail administratorów do powiadomienia.");
        return [];
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("[IsKRA] Błąd: Brak klucza RESEND_API_KEY w zmiennych środowiskowych.");
        return [];
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) {
        console.error("[IsKRA] Błąd: Brak adresu RESEND_FROM_EMAIL w zmiennych środowiskowych.");
        return [];
    }

    const subject = `Nowe zgłoszenie innowacji: ${innovation.title || "Bez tytułu"}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const sendPromises = recipients.map(async ({ email, name }) => {
        try {
            const html = renderInnovationEmailHtml({
                adminName: name,
                appUrl,
                innovation,
            });

            const response = await resend.emails.send({
                from: fromEmail as string,
                to: email,
                subject,
                html,
            });
            console.log(`[IsKRA] Wysłano powiadomienie do administratora: ${email}`);
            return { email, response, success: true };
        } catch (err) {
            console.error(`[IsKRA] Błąd wysyłania do ${email}:`, err);
            return { email, error: err, success: false };
        }
    });

    return Promise.all(sendPromises);
}
