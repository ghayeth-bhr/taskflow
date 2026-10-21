# ---- build stage -----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependencies are resolved first so the layer is cached between code changes
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- runtime stage ---------------------------------------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN useradd --system --create-home --shell /usr/sbin/nologin taskflow
USER taskflow

COPY --from=build /build/target/taskflow-backend-*.jar /app/taskflow.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/taskflow.jar"]
