# Discord Clone (ProjectManagement Course)

## Set up npm modules
```bash
# npm i
```

## Set up .env variables
Example: 
```
SECRET=SECRET_KEY
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=root

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

## Run Backend
```bash
# npm run start
```


## Extra

### Setup migration of prisma

```bash
# npx prisma migrate dev --name init
```

### Setup prisma provider

```bash
# npx prisma generate
```