# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /var/www/webhook

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the current directory contents into the container
COPY . .

# Make port 3000 available to the outside world
EXPOSE ${PORT}

# Run the app
CMD ["node", "index.js"]
