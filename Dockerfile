FROM node:20.14.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:1.25.4-alpine3.18

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /var/www/html/

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]