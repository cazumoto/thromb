# Usa un'immagine di base con Java 11
FROM openjdk:11-jdk-slim

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file del progetto nel container
COPY . .

# Esegui la build del progetto Java usando Gradle
RUN ./gradlew build

# Esponi la porta 8080
EXPOSE 8080

# Esegui l'applicazione Java utilizzando il file app.jar generato dalla build
CMD ["java", "-jar", "app/build/libs/app.jar"]
