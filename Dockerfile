FROM node:lts

WORKDIR /app

RUN corepack enable

RUN apt-get update \
    && apt-get install -y --no-install-recommends git curl \
    && rm -rf /var/lib/apt/lists/*

CMD ["pnpm", "dev", "--host", "0.0.0.0"]