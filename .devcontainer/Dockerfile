FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

ARG DEBIAN_FRONTEND=noninteractive

ENV SHELL=/bin/bash

RUN apt-get update && \
    apt-get install -y sudo ca-certificates curl gnupg tar wget python3 python3-pip python3-venv python-is-python3 && \
    curl -fsSL https://build.openmodelica.org/apt/openmodelica.asc | gpg --dearmor -o /usr/share/keyrings/openmodelica-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/openmodelica-keyring.gpg] https://build.openmodelica.org/apt bookworm stable" > /etc/apt/sources.list.d/openmodelica.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends omc  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER node
RUN printf 'success:=installPackage(Modelica, version = "4.0.0", exactMatch = true);\nif not success then exit(1); end if;\n' > /tmp/install.mos && \
    omc /tmp/install.mos && \
    rm -rf /var/lib/apt/lists/* /tmp/install.mos
