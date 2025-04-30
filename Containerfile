FROM node:23-slim

USER root

COPY . /app
WORKDIR /app

RUN useradd -m -s /usr/sbin/nologin no &&\
    chown -R no:no /app && \
    chmod -R 755 /app && \
    npm install

USER no

EXPOSE 3000

CMD ["npm", "start"]
