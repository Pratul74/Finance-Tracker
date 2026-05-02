FROM python:3.14.4 as builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --prefix=/install -r requirements.txt

FROM python:3.14.4-slim

WORKDIR /app

COPY --from=builder ./install .
COPY . .

EXPOSE "8000"
