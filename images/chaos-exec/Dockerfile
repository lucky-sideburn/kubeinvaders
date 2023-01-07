FROM python:3.9

WORKDIR /app

COPY requirements.txt requirements.txt

COPY requirements.txt requirements.txt

RUN /usr/local/bin/python -m pip install --upgrade pip

RUN pip3 install "setuptools==65.5.1"
RUN pip3 install -r requirements.txt

RUN apt-get update -y && apt-get install -y curl

COPY . .

RUN chmod 777 start.sh

CMD [ "bash", "start.sh" ]
