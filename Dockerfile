# ---- Build the Vite SPA (needs Supabase reachable + build args) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG SITE_URL=https://example.com
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    SITE_URL=$SITE_URL
RUN node scripts/generate-sitemap.mjs && npm run build

# ---- Serve statically with SPA fallback ----
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Railway injects $PORT; the official image envsubst's the template on start.
