FROM node:18-alpine

# Werk directory instellen
WORKDIR /app

# Package files kopiëren
COPY package*.json ./

# Dependencies installeren
RUN npm ci --only=production

# Applicatie code kopiëren
COPY . .

# Expose poort
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3006/api/mail/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start commando
CMD ["npm", "start"] 