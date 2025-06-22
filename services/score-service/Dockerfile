# Gebruik Node.js 18 als base image
FROM node:18-alpine

# Stel de werkdirectory in
WORKDIR /app

# Kopieer package.json en package-lock.json eerst (voor betere caching)
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer alle source code
COPY . .

# Stel omgevingsvariabelen in
ENV PORT=12345
ENV MONGO_URL=mongodb://admin:password123@mongodb:27017/photo-hunt?authSource=admin
ENV NODE_ENV=development

# Expose de port
EXPOSE 12345

# Start commando met nodemon voor development
CMD ["npm", "run", "dev"]
