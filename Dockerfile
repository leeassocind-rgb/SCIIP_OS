FROM node:20-bookworm-slim AS build
WORKDIR /repo/apps/property-command-center
COPY apps/property-command-center/package.json apps/property-command-center/package-lock.json ./
RUN npm ci
WORKDIR /repo
COPY . .
WORKDIR /repo/apps/property-command-center
RUN npm run build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY apps/property-command-center/package.json apps/property-command-center/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /repo/apps/property-command-center/dist ./dist
COPY --from=build /repo/apps/property-command-center/server ./server
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "sciip:production"]
