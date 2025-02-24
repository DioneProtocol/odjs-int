# ---------------------------
# Stage 1: Builder (Development Stage)
# ---------------------------
FROM node:20 AS builder

WORKDIR /app
LABEL maintainer="your.email@example.com" \
        version="1.0" \
        description="Builder stage for full source code with ts-node execution"

# Copy the full source code into the image.
COPY . .

# Install all dependencies (including devDependencies)
RUN npm install

# (Optional) Run tests or linting here:
# RUN npm run test

# ---------------------------
# Stage 2: Production
# ---------------------------
FROM node:20-slim

WORKDIR /app
LABEL maintainer="your.email@example.com" \
        version="1.0" \
        description="Production stage running ts-node on full source code"

# Copy the built application from the builder stage.
COPY --from=builder /app .

# Copy the entrypoint script into the container.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port your validator uses.
EXPOSE 443

# Define a health check (adjust URL and conditions as needed).
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
        CMD curl -f http://localhost:443/health || exit 1

# Set the entrypoint and default command.
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npx", "ts-node", "./examples/dockerization/combinedStake.ts"]
