import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Test transporter voor development (geen echte emails)
const createTestTransporter = () => {
    const testTransporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true,
        auth: {
            user: 'test',
            pass: 'test'
        }
    });
    
    // Mock verify functie voor test mode
    testTransporter.verify = async () => {
        console.log('✅ Test email configuratie geverifieerd (mock)');
        return true;
    };
    
    return testTransporter;
};

// Email transporter configuratie
const transporter = process.env.NODE_ENV === 'test' || !process.env.SMTP_USER
    ? createTestTransporter()
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true voor 465, false voor andere poorten
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false // <-- accepteer self-signed/CA issues
        }
    });

// Email templates configuratie
const emailConfig = {
    from: process.env.EMAIL_FROM || 'noreply@photohunt.com',
    subjectPrefix: '[Photo Hunt] ',
    templates: {
        registration: 'registration',
        contestResults: 'contest-results',
        individualScore: 'individual-score'
    }
};

export { transporter, emailConfig };
