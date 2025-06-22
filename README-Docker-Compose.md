# Docker Compose Setup - Photo Hunt App

Deze setup gebruikt Docker Compose om de volledige Photo Hunt applicatie te draaien met MongoDB database.

## Services

### MongoDB
- **Image**: `mongo:latest`
- **Port**: 27017 (alleen voor development)
- **Credentials**: 
  - Root: admin/password123
  - App: appuser/apppassword
- **Database**: photo-hunt
- **Persistentie**: `./database` folder

### Score Service
- **Build**: `./services/score-service`
- **Port**: 3000 (externe toegang)
- **Development**: Nodemon met live reload
- **Database**: Verbonden via service naam 'mongodb'

## Commando's

### Start de applicatie
```bash
docker-compose up -d
```

### Bekijk logs
```bash
# Alle services
docker-compose logs -f

# Specifieke service
docker-compose logs -f score-service
docker-compose logs -f mongodb
```

### Stop de applicatie
```bash
docker-compose down
```

### Rebuild en start
```bash
docker-compose up --build -d
```

### Verwijder alles (inclusief volumes)
```bash
docker-compose down -v
```

## Toegang

- **Score Service API**: http://localhost:3000
- **MongoDB**: localhost:27017 (alleen development)

## Development

De score-service gebruikt volume mounting voor live code updates:
- Code wijzigingen worden automatisch gedetecteerd
- Nodemon herstart de applicatie automatisch
- Database data blijft persistent tussen restarts

## Troubleshooting

### Database connection issues
1. Controleer of MongoDB container draait: `docker-compose ps`
2. Bekijk MongoDB logs: `docker-compose logs mongodb`
3. Test connectie: `docker-compose exec mongodb mongosh`

### Score Service issues
1. Controleer logs: `docker-compose logs score-service`
2. Rebuild service: `docker-compose up --build score-service`
3. Test API: `curl http://localhost:3000/api/scores` 