# Usa un'immagine di base con Java 11
FROM openjdk:11-jdk-slim

# Imposta la directory di lavoro all'interno del container
WORKDIR /SAPT

# Copia tutti i file del progetto nella directory di lavoro del container
COPY . /SAPT

# Esegui la build del progetto Java usando Gradle
RUN ./gradlew build

# Comando per eseguire il file .jar dell'app
CMD ["java", "-jar", "app/build/libs/SAPT-1.0-SNAPSHOT.jar"]
