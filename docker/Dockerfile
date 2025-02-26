# ---------------------------
# Stage 1: Builder (Development Stage)
# ---------------------------
FROM node:20 AS builder

WORKDIR /app
LABEL maintainer="vivek.teega@gmail.com" \
        version="1.0" \
        description="Builder stage for full source code with ts-node execution"

# Copy all contents from the repository root into /app.
# Files listed in .dockerignore (e.g., .env) won’t be copied.
COPY . /app/

# Install all dependencies (including devDependencies)
RUN npm install

# (Optional) Run tests or linting here:
# RUN npm run test

# ---------------------------
# Stage 2: Production
# ---------------------------
FROM node:20-slim

WORKDIR /app
LABEL maintainer="vivek.teega@gmail.com" \
        version="1.0" \
        description="Production stage running ts-node on full source code"

# Copy the built application from the builder stage.
COPY --from=builder /app/ /app/

# Copy the entrypoint script from the docker folder into the container.
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port your validator uses.
EXPOSE 443

# Define a health check (adjust URL and conditions as needed).
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
#         CMD curl -f http://localhost:443/health || exit 1

# Set the entrypoint and default command.
ENTRYPOINT ["/entrypoint.sh"]
# CMD ["npx", "ts-node", "./examples/dockerization/combinedStake.ts"]
