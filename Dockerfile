FROM node:24-bookworm-slim

WORKDIR /app
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npm install --global pnpm@11.24.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

RUN pnpm exec playwright install --with-deps chromium \
    && apt-get update \
    && apt-get install --yes --no-install-recommends xvfb xauth \
    && rm -rf /var/lib/apt/lists/* \
    && chmod -R a+rX /ms-playwright

COPY --chown=node:node main.ts ./
COPY --chown=node:node src ./src

USER node

# Credentials arrive through Docker environment variables, not a baked-in .env.
CMD ["xvfb-run", "-a", "node", "main.ts"]
