FROM node:16

# Create app directory for bot
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy app and install dependencies for bot
COPY . /usr/src/app
RUN npm install

# Register guild (Optional)
RUN npm run register 700013821804412980

RUN apt update && apt upgrade -y

CMD [ "npm", "run", "bot" ]
