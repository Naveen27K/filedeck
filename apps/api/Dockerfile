# Production Dockerfile for FileDeck Express API
FROM node:20-slim

# Install system dependencies (ffmpeg and headless libreoffice)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libreoffice \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package configurations
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Run API Server
CMD ["node", "dist/index.js"]
