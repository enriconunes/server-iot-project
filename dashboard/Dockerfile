FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install

COPY . .

# Env vars needed at build time (t3-env validates on build)
ARG NEXT_PUBLIC_API_KEY
ARG DATABASE_URL
ARG API_KEY
ENV NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV API_KEY=${API_KEY}

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
