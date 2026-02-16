# Build stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY .sequelizerc ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Prepare production artifacts in a separate directory
RUN mkdir -p /prod/src/config
COPY package*.json /prod/
COPY .sequelizerc /prod/
COPY src/config/database.js /prod/src/config/
COPY src/migrations /prod/src/migrations
COPY src/seeders /prod/src/seeders

# Production stage
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package.json and config from the prepared directory
COPY --from=builder /prod/package*.json ./
COPY --from=builder /prod/.sequelizerc ./

# Install only production dependencies
RUN npm ci --only=production && npm install sequelize-cli --no-save

# Copy built application and source artifacts (config, migrations, seeders)
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /prod/src ./src

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
