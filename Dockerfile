FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose the dev server port
EXPOSE 5173

# Run Vite dev server (replace with CRA if needed)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
