FROM node:23-slim

USER root

COPY index.js reasons.json frontend package.json /app/
WORKDIR /app

RUN useradd -m -s /usr/sbin/nologin no &&\
    chown -R no:no /app && \
    chmod -R 755 /app && \
    npm install &&\
    rm -rf package.json && \
    rm -rf package-lock.json

USER no

EXPOSE 8080

CMD ["node", "index.js"]
