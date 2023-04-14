# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the entire application code
COPY . .

# Set the port for application
EXPOSE 8000

# Start the application
CMD [ "npm", "start" ]

