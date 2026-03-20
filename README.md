# Frontend

Proyecto Angular del ecommerce.

## Docker

Quedo una sola forma de correr el proyecto con Docker para frontend, backend y base.

Estructura:

- `frontend`: Angular compilado y servido con Nginx
- `backend`: Spring Boot empaquetado como `.jar`
- `db`: PostgreSQL

El `docker-compose.yml` asume que `ecommerce-angular` y `ecommerce-backend` viven como carpetas hermanas.
El `Dockerfile` del backend esta en `../ecommerce-backend/Dockerfile`.

## Variables

Crea un archivo `.env` opcional en la raiz con valores como estos:

```env
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce
POSTGRES_PASSWORD=ecommerce
POSTGRES_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=4200
JWT_SECRET=local-dev-jwt-secret
MERCADOPAGO_ACCESS_TOKEN=123123123123
```

Si queres usar exactamente el mismo secreto que hoy tiene el backend:

```env
JWT_SECRET=fS2UAxl7vRy0XTLfb89RxPEZAjWa6LG2sfKhp_hSz9sAxr9WYsaV4jJ0QL-NUcCT1m1JfL8
```

## Levantar

```bash
docker compose up -d --build
```

Servicios por defecto:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Apagar

```bash
docker compose down
```

Para borrar tambien la data de Postgres:

```bash
docker compose down -v
```

## Angular

- `src/environments/environment.ts`: produccion y Docker/Nginx usando rutas relativas
- `src/environments/environment.development.ts`: desarrollo local con `localhost:8080`

## Nota

- Mercado Pago en el backend todavia tiene URLs de retorno hardcodeadas a `https://www.lcosmeticadigital.com.ar/confirmacion-pago`. Si cambias el dominio final, hay que ajustar eso en el backend.
- El JWT del backend hoy sigue usando una constante hardcodeada en `../ecommerce-backend/src/main/java/com/colors/ecommerce/backend/infrastucture/jwt/Constants.java`. Aunque existe `JWT_SECRET` en Docker, ese valor no controla realmente la firma hasta que se refactorice esa parte del backend.
