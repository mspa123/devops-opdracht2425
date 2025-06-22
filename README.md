# Foto Speurtocht Applicatie

[![Jest Tests with Coverage](https://github.com/Avans/devops-opdracht-2425-mspa123/actions/workflows/jest-coverage.yml/badge.svg)](https://github.com/Avans/devops-opdracht-2425-mspa123/actions/workflows/jest-coverage.yml)
[![ESLint](https://github.com/Avans/devops-opdracht-2425-mspa123/actions/workflows/lint.yml/badge.svg)](https://github.com/Avans/devops-opdracht-2425-mspa123/actions/workflows/lint.yml)

Een microservices-gebaseerde applicatie voor een massive multiplayer online fotospeurtocht.

## Services

1. **Authorization & Authentication Service** (Poort: 3001)
   - Gebruikersauthenticatie met Passport.js
   - JWT token management
   - Rolgebaseerde toegangscontrole

2. **Target Service** (Poort: 3002)
   - Beheer van targetfoto's
   - Locatiebeheer
   - Foto-upload functionaliteit

3. **Register Service** (Poort: 3003)
   - Gebruikersregistratie
   - RabbitMQ integratie voor events

4. **Mail Service** (Poort: 3004)
   - E-mail notificaties
   - Registratiebevestigingen
   - Score updates

5. **Clock Service** (Poort: 3005)
   - Wedstrijdtimer management
   - RabbitMQ event triggers

6. **Score Service** (Poort: 3006)
   - Foto-vergelijking met externe API
   - Score berekening
   - Winnaar bepaling

7. **Read Service** (Poort: 3007)
   - Overzicht van actieve wedstrijden
   - Filtering en zoekfunctionaliteit

## Vereisten

- Node.js (v14+)
- MongoDB
- RabbitMQ
- Docker (optioneel)

## Setup Instructies

1. Installeer de dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB:
   ```bash
   mongod
   ```

3. Start RabbitMQ:
   ```bash
   # Als je Docker gebruikt:
   docker run -d --hostname my-rabbit --name rabbit-mq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

4. Maak een .env bestand aan in de root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/photo-hunt
   RABBITMQ_URL=amqp://localhost
   JWT_SECRET=jouw_jwt_secret
   MAIL_USER=jouw_email
   MAIL_PASS=jouw_email_wachtwoord
   VISION_API_KEY=jouw_vision_api_key
   ```

5. Start alle services:
   ```bash
   npm start
   ```

## API Documentatie

Gedetailleerde API documentatie is beschikbaar in de `/docs` map van elke service.

## Tests

Run de tests met:
```bash
npm test
```
