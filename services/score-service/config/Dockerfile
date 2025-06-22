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
ENV MONGO_URL=mongodb://localhost:27017/photo-hunt

# Expose de port
EXPOSE 12345

# Start commando
CMD ["npm", "start"]
