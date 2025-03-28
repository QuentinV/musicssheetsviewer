FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y  \
        curl \
        wget \
        git \
        tesseract-ocr

RUN rm -f /usr/share/tesseract-ocr/5/tessdata/eng.traineddata
RUN wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata -P /usr/share/tesseract-ocr/5/tessdata/
RUN wget https://github.com/tesseract-ocr/tessdata/raw/main/fra.traineddata -P /usr/share/tesseract-ocr/5/tessdata/
RUN wget https://github.com/tesseract-ocr/tessdata/raw/main/deu.traineddata -P /usr/share/tesseract-ocr/5/tessdata/

RUN wget https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.deb \
        && apt install -y ./jdk-21_linux-x64_bin.deb \
        && rm ./jdk-21_linux-x64_bin.deb \
        && JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java)))) \
        && echo "JAVA_HOME=$JAVA_HOME" >> /etc/environment \
        && echo "PATH=$JAVA_HOME/bin:$PATH" >> /etc/environment
        
RUN git clone --branch master https://github.com/Audiveris/audiveris.git

WORKDIR /audiveris
RUN  ./gradlew build -x test && \
        mkdir /audiveris-extract && \
        tar -xvf ./app/build/distributions/*.tar -C /audiveris-extract && \
        mv /audiveris-extract/*/* /audiveris-extract/ && \
        rm -r /audiveris

RUN mkdir -p /restapi && mkdir -p /data/inputs && mkdir -p /data/outputs

ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/
WORKDIR /restapi

EXPOSE 3015