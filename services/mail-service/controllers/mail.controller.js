import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { transporter, emailConfig } from '../config/email.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template helper functies
const loadTemplate = async (templateName) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    return await fs.readFile(templatePath, 'utf8');
};

const compileTemplate = (template, data) => {
    let compiled = template;
    
    // Vervang alle placeholders
    Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = data[key];
        
        if (typeof value === 'object' && value !== null) {
            // Handle arrays (voor contest results)
            if (Array.isArray(value)) {
                let arrayHtml = '';
                value.forEach((item, index) => {
                    let itemHtml = '';
                    Object.keys(item).forEach(itemKey => {
                        const itemPlaceholder = `{{${itemKey}}}`;
                        itemHtml = itemHtml.replace(new RegExp(itemPlaceholder, 'g'), item[itemKey]);
                    });
                    arrayHtml += itemHtml;
                });
                compiled = compiled.replace(new RegExp(`{{#each ${key}}}([\\s\\S]*?){{/each}}`, 'g'), (match, content) => {
                    return value.map(item => {
                        let itemContent = content;
                        Object.keys(item).forEach(itemKey => {
                            const itemPlaceholder = `{{${itemKey}}}`;
                            itemContent = itemContent.replace(new RegExp(itemPlaceholder, 'g'), item[itemKey]);
                        });
                        return itemContent;
                    }).join('');
                });
            }
        } else {
            compiled = compiled.replace(new RegExp(placeholder, 'g'), value);
        }
    });
    
    return compiled;
};

// Email verzend functie
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: emailConfig.from,
            to: to,
            subject: emailConfig.subjectPrefix + subject,
            html: html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email verzonden naar ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Fout bij verzenden email:', error);
        throw error;
    }
};

// Registratie bevestiging email
export const sendRegistrationEmail = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, naam en wachtwoord zijn verplicht'
            });
        }
        
        // Template laden en compileren
        const template = await loadTemplate('registration');
        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';
        
        const html = compileTemplate(template, {
            name,
            email,
            password,
            loginUrl
        });
        
        // Email verzenden
        await sendEmail(email, 'Welkom bij Photo Hunt!', html);
        
        res.status(200).json({
            success: true,
            message: 'Registratie email succesvol verzonden'
        });
        
    } catch (error) {
        console.error('Fout bij verzenden registratie email:', error);
        res.status(500).json({
            success: false,
            message: 'Fout bij verzenden registratie email',
            error: error.message
        });
    }
};

// Contest resultaten email naar target owner
export const sendContestResultsEmail = async (req, res) => {
    try {
        const { 
            targetOwnerEmail, 
            contestTitle, 
            endDate, 
            description, 
            participants,
            totalParticipants,
            totalSubmissions,
            averageScore,
            winnerName,
            winnerScore
        } = req.body;
        
        if (!targetOwnerEmail || !contestTitle || !participants) {
            return res.status(400).json({
                success: false,
                message: 'Target owner email, contest titel en deelnemers zijn verplicht'
            });
        }
        
        // Template laden en compileren
        const template = await loadTemplate('contest-results');
        
        const html = compileTemplate(template, {
            contestTitle,
            endDate: endDate || 'Onbekend',
            description: description || 'Geen beschrijving beschikbaar',
            participants,
            totalParticipants: totalParticipants || participants.length,
            totalSubmissions: totalSubmissions || participants.length,
            averageScore: averageScore || 'N/A',
            winnerName: winnerName || 'Onbekend',
            winnerScore: winnerScore || 'N/A'
        });
        
        // Email verzenden
        await sendEmail(targetOwnerEmail, `Contest Resultaten: ${contestTitle}`, html);
        
        res.status(200).json({
            success: true,
            message: 'Contest resultaten email succesvol verzonden naar target owner'
        });
        
    } catch (error) {
        console.error('Fout bij verzenden contest resultaten email:', error);
        res.status(500).json({
            success: false,
            message: 'Fout bij verzenden contest resultaten email',
            error: error.message
        });
    }
};

// Individuele score email naar deelnemer
export const sendIndividualScoreEmail = async (req, res) => {
    try {
        const {
            participantEmail,
            participantName,
            contestTitle,
            endDate,
            description,
            score,
            position,
            totalParticipants,
            averageScore,
            highestScore,
            submissionDate,
            isWinner
        } = req.body;
        
        if (!participantEmail || !participantName || !contestTitle || !score) {
            return res.status(400).json({
                success: false,
                message: 'Deelnemer email, naam, contest titel en score zijn verplicht'
            });
        }
        
        // Template laden en compileren
        const template = await loadTemplate('individual-score');
        
        const html = compileTemplate(template, {
            contestTitle,
            endDate: endDate || 'Onbekend',
            description: description || 'Geen beschrijving beschikbaar',
            score,
            position: position || 'Onbekend',
            totalParticipants: totalParticipants || 'Onbekend',
            averageScore: averageScore || 'N/A',
            highestScore: highestScore || 'N/A',
            submissionDate: submissionDate || 'Onbekend',
            isWinner: isWinner || false
        });
        
        // Email verzenden
        await sendEmail(participantEmail, `Je Score: ${contestTitle}`, html);
        
        res.status(200).json({
            success: true,
            message: 'Individuele score email succesvol verzonden'
        });
        
    } catch (error) {
        console.error('Fout bij verzenden individuele score email:', error);
        res.status(500).json({
            success: false,
            message: 'Fout bij verzenden individuele score email',
            error: error.message
        });
    }
};

// Test email endpoint
export const sendTestEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email adres is verplicht'
            });
        }
        
        const testHtml = `
            <h1>Test Email</h1>
            <p>Dit is een test email van de Photo Hunt mail service.</p>
            <p>Tijd: ${new Date().toLocaleString('nl-NL')}</p>
        `;
        
        await sendEmail(email, 'Test Email - Photo Hunt', testHtml);
        
        res.status(200).json({
            success: true,
            message: 'Test email succesvol verzonden'
        });
        
    } catch (error) {
        console.error('Fout bij verzenden test email:', error);
        res.status(500).json({
            success: false,
            message: 'Fout bij verzenden test email',
            error: error.message
        });
    }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
    try {
        // Test email configuratie
        await transporter.verify();
        
        res.status(200).json({
            success: true,
            message: 'Mail service is gezond',
            timestamp: new Date().toISOString(),
            emailConfig: {
                host: process.env.SMTP_HOST || 'smtp.ethereal.email (test mode)',
                port: process.env.SMTP_PORT || 587,
                user: process.env.SMTP_USER ? 'Configured' : 'Test mode (no real emails)',
                mode: process.env.SMTP_USER ? 'PRODUCTION' : 'TEST'
            }
        });
        
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Mail service is niet gezond',
            error: error.message,
            mode: process.env.SMTP_USER ? 'PRODUCTION' : 'TEST'
        });
    }
};
