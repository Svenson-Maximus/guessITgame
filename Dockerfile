FROM openjdk:17-jdk-slim

RUN apt-get update && apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -y nodejs

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/frontend
RUN npm install --verbose
RUN npm run build
WORKDIR /usr/src/app

RUN rm -r frontend

RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw
RUN ./mvnw package
EXPOSE 8080
CMD ["java", "-jar", "/usr/src/app/target/guess-0.0.1-SNAPSHOT.jar"]
