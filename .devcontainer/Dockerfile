FROM node:18.14.2

RUN apt update
RUN apt install -y sudo

RUN echo "node ALL=(ALL:ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node

USER node
