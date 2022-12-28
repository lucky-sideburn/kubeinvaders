FROM python:3.9

WORKDIR /app

COPY requirements.txt requirements.txt

COPY requirements.txt requirements.txt

RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip3 install -r requirements.txt

COPY . .

CMD [ "bash", "start.sh" ]
