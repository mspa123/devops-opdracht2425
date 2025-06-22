import { consume } from '../libs/bus.js';
import { sendRegistrationEmail, sendContestResultsEmail, sendIndividualScoreEmail } from '../controllers/mail.controller.js';
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
        console.log(`[mail-service] Email verzonden naar ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[mail-service] Fout bij verzenden email:', error);
        throw error;
    }
};

// Event handlers
const handleUserRegistered = async (payload) => {
    console.log('[mail-service] UserRegistered event ontvangen:', payload);
    
    try {
        const { email, name, password } = payload;
        
        if (!email || !name || !password) {
            console.error('[mail-service] Ontbrekende gegevens voor registratie email:', payload);
            return;
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
        console.log('[mail-service] Registratie email succesvol verzonden naar:', email);
        
    } catch (error) {
        console.error('[mail-service] Fout bij verwerken UserRegistered event:', error);
    }
};

const handleContestEnded = async (payload) => {
    console.log('[mail-service] ContestEnded event ontvangen:', payload);
    
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
        } = payload;
        
        if (!targetOwnerEmail || !contestTitle || !participants) {
            console.error('[mail-service] Ontbrekende gegevens voor contest resultaten email:', payload);
            return;
        }
        
        // 1. Email naar target owner met alle resultaten
        const contestTemplate = await loadTemplate('contest-results');
        const contestHtml = compileTemplate(contestTemplate, {
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
        
        await sendEmail(targetOwnerEmail, `Contest Resultaten: ${contestTitle}`, contestHtml);
        console.log('[mail-service] Contest resultaten email verzonden naar target owner:', targetOwnerEmail);
        
        // 2. Individuele emails naar alle deelnemers
        const individualTemplate = await loadTemplate('individual-score');
        
        for (const participant of participants) {
            try {
                const individualHtml = compileTemplate(individualTemplate, {
                    contestTitle,
                    endDate: endDate || 'Onbekend',
                    description: description || 'Geen beschrijving beschikbaar',
                    score: participant.score,
                    position: participant.rank,
                    totalParticipants: totalParticipants || participants.length,
                    averageScore: averageScore || 'N/A',
                    highestScore: winnerScore || 'N/A',
                    submissionDate: participant.submissionDate || 'Onbekend',
                    isWinner: participant.isWinner || false
                });
                
                await sendEmail(participant.email, `Je Score: ${contestTitle}`, individualHtml);
                console.log('[mail-service] Individuele score email verzonden naar:', participant.email);
                
            } catch (error) {
                console.error('[mail-service] Fout bij verzenden individuele score email naar:', participant.email, error);
            }
        }
        
    } catch (error) {
        console.error('[mail-service] Fout bij verwerken ContestEnded event:', error);
    }
};

const handleSubmissionScored = async (payload) => {
    console.log('[mail-service] SubmissionScored event ontvangen:', payload);
    
    try {
        const {
            participantEmail,
            participantName,
            contestTitle,
            score,
            submissionDate
        } = payload;
        
        if (!participantEmail || !participantName || !contestTitle || !score) {
            console.error('[mail-service] Ontbrekende gegevens voor submission scored email:', payload);
            return;
        }
        
        // Template laden en compileren
        const template = await loadTemplate('individual-score');
        
        const html = compileTemplate(template, {
            contestTitle,
            endDate: 'Onbekend',
            description: 'Geen beschrijving beschikbaar',
            score,
            position: 'Onbekend',
            totalParticipants: 'Onbekend',
            averageScore: 'N/A',
            highestScore: 'N/A',
            submissionDate: submissionDate || 'Onbekend',
            isWinner: false
        });
        
        // Email verzenden
        await sendEmail(participantEmail, `Je Score: ${contestTitle}`, html);
        console.log('[mail-service] Submission scored email verzonden naar:', participantEmail);
        
    } catch (error) {
        console.error('[mail-service] Fout bij verwerken SubmissionScored event:', error);
    }
};

// Event subscriptions starten
export const startEventSubscriptions = async () => {
    try {
        // Subscribe op UserRegistered events
        await consume(
            'mail-service-user-registered',
            'user',
            'UserRegistered',
            handleUserRegistered
        );
        
        // Subscribe op ContestEnded events
        await consume(
            'mail-service-contest-ended',
            'deadline',
            'ContestEnded',
            handleContestEnded
        );
        
        // Subscribe op SubmissionScored events (optioneel)
        await consume(
            'mail-service-submission-scored',
            'photo',
            'SubmissionScored',
            handleSubmissionScored
        );
        
        console.log('[mail-service] Alle event subscriptions gestart');
        
    } catch (error) {
        console.error('[mail-service] Fout bij starten event subscriptions:', error);
        throw error;
    }
}; 