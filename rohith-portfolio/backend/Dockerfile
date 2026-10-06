# Build from the REPO ROOT:   docker build -f backend/Dockerfile -t portfolio-api .
FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY database/prisma ./database/prisma
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/src ./src
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
