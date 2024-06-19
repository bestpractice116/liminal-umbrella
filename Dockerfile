# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link .yarnrc.yml package.json yarn.lock ./
COPY --link .yarn/releases/yarn-4.1.0.cjs ./.yarn/releases/yarn-4.1.0.cjs
COPY --link .yarn/patches ./.yarn/patches
RUN yarn install --immutable

# Copy application code
COPY --link . .

# Build application
RUN yarn run build
RUN yarn workspace frontend run build


# Final stage for app image
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates fuse3 sqlite3

COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "yarn", "run", "start" ]
#ENTRYPOINT litefs mount

