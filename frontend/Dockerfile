FROM node:18-alpine AS build

WORKDIR /app

COPY package.json vite.config.js ./
COPY src ./src
COPY public ./public
COPY index.html ./

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
