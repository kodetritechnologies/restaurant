import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

interface SendMailOptions {
  to: string;
  subject: string;
  templateName: string;
  context: any;
}

export const sendMail = async ({ to, subject, templateName, context }: SendMailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 465,
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Path to the handlebars template
    const templatePath = path.join(process.cwd(), 'utils', 'templates', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    // Compile the template
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlToSend = compiledTemplate(context);

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Support Team'}" <${process.env.MAIL_EMAIL}>`,
      to,
      subject,
      html: htmlToSend,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
