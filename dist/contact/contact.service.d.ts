import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactService {
    private transporter;
    createHtmlMessage(dto: ContactFormDto): string;
    sendToGal(dto: ContactFormDto): Promise<import("node_modules/@types/nodemailer/lib/smtp-transport").SentMessageInfo>;
}
