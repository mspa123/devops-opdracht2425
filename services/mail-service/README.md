# Mail Service - Photo Hunt

De Mail Service is verantwoordelijk voor het verzenden van alle e-mail notificaties in de Photo Hunt applicatie.

## Functionaliteiten

### 1. Registratiebevestiging
- Verzendt automatisch een welkomst e-mail na registratie van een nieuwe gebruiker
- Bevat gegenereerde inloggegevens (e-mail en wachtwoord)
- Mooie HTML template met styling

### 2. Contest Resultaten
- **Naar Target Owner**: Overzicht van alle deelnemers met scores
- **Naar Individuele Deelnemers**: Persoonlijke score met ranking

### 3. Event-Driven Architectuur
- Luistert naar events via RabbitMQ message bus
- Automatische verwerking van events zonder handmatige triggers

## Events

### Subscriptions
- `UserRegistered` (user exchange)
- `ContestEnded` (deadline exchange)  
- `SubmissionScored` (photo exchange) - optioneel

### Event Payloads

#### UserRegistered
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "generatedPassword123"
}
```

#### ContestEnded
```json
{
  "targetOwnerEmail": "owner@example.com",
  "contestTitle": "Zomer Foto Contest",
  "endDate": "2024-07-15T18:00:00Z",
  "description": "Maak de mooiste zomerfoto",
  "participants": [
    {
      "email": "user1@example.com",
      "name": "User One",
      "score": 85,
      "rank": 1,
      "isWinner": true,
      "submissionDate": "2024-07-14T10:30:00Z"
    }
  ],
  "totalParticipants": 10,
  "totalSubmissions": 10,
  "averageScore": 75.5,
  "winnerName": "User One",
  "winnerScore": 85
}
```

#### SubmissionScored
```json
{
  "participantEmail": "user@example.com",
  "participantName": "John Doe",
  "contestTitle": "Zomer Foto Contest",
  "score": 85,
  "submissionDate": "2024-07-14T10:30:00Z"
}
```

## API Endpoints

### Health Check
```
GET /api/mail/health
```

### Test Email
```
POST /api/mail/test
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Registratie Email
```
POST /api/mail/registration
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "generatedPassword123"
}
```

### Contest Resultaten Email
```
POST /api/mail/contest-results
Content-Type: application/json

{
  "targetOwnerEmail": "owner@example.com",
  "contestTitle": "Zomer Foto Contest",
  "participants": [...]
}
```

### Individuele Score Email
```
POST /api/mail/individual-score
Content-Type: application/json

{
  "participantEmail": "user@example.com",
  "participantName": "John Doe",
  "contestTitle": "Zomer Foto Contest",
  "score": 85
}
```

## Configuratie

### Environment Variables

```env
# Server
PORT=3006

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@photohunt.com

# Message Bus
AMQP_URL=amqp://localhost

# Frontend URL (voor login links)
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup
Voor Gmail moet je een App Password gebruiken:
1. Ga naar Google Account instellingen
2. Beveiliging → 2-staps verificatie inschakelen
3. App-wachtwoorden → Genereer een nieuw wachtwoord
4. Gebruik dit wachtwoord in `SMTP_PASS`

## Email Templates

### Registratie Template (`registration.html`)
- Welkomst bericht
- Inloggegevens in duidelijke box
- Veiligheidsadvies
- Login knop

### Contest Resultaten Template (`contest-results.html`)
- Overzicht van alle deelnemers
- Statistieken (totaal, gemiddelde, etc.)
- Winnaar highlight
- Responsive tabel layout

### Individuele Score Template (`individual-score.html`)
- Persoonlijke score prominent weergegeven
- Ranking informatie
- Statistieken
- Motivatie bericht

## Installatie & Starten

```bash
# Dependencies installeren
npm install

# Development mode
npm run dev

# Production mode
npm start
```

## Docker

```bash
# Build image
docker build -t mail-service .

# Run container
docker run -p 3006:3006 --env-file .env mail-service
```

## Monitoring

### Logs
De service logt alle belangrijke acties:
- Email verzendingen
- Event ontvangst
- Fouten en waarschuwingen

### Health Check
Controleer de service status:
```bash
curl http://localhost:3006/api/mail/health
```

## Troubleshooting

### Email verzending faalt
1. Controleer SMTP instellingen
2. Verifieer Gmail App Password
3. Controleer firewall/poort instellingen

### Events niet ontvangen
1. Controleer RabbitMQ connectie
2. Verifieer exchange en queue namen
3. Controleer routing keys

### Templates laden faalt
1. Controleer template bestanden bestaan
2. Verifieer bestandsrechten
3. Controleer template syntax

## Ontwikkeling

### Nieuwe Email Template Toevoegen
1. Maak HTML template in `templates/` directory
2. Voeg template naam toe aan `emailConfig.templates`
3. Implementeer handler functie
4. Test met `/test` endpoint

### Event Handler Toevoegen
1. Implementeer handler functie in `services/eventHandler.js`
2. Voeg subscription toe aan `startEventSubscriptions()`
3. Test met event publishing

## Beveiliging

- Alle emails worden via SMTP verzonden
- Geen gevoelige gegevens in logs
- Input validatie op alle endpoints
- Error handling zonder data lekken 