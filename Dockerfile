FROM python:3.9-alpine3.16

COPY requirements.txt /temp/requirements.txt
COPY service /service

WORKDIR /service

EXPOSE 8000


# RUN apk add posgresql-client build-base postgresql-dev

RUN pip install -r /temp/requirements.txt
