# Use the official Node.js image as the base image for the build stage
FROM node:16 AS build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json .

# Install the npm dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Use the official Nginx image for the runtime stage
FROM nginx:stable-alpine

# Copy the bundled files from the build stage to the Nginx html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose the port the app will run on
EXPOSE 80

# Nginx will start automatically, no need for a CMD directive
