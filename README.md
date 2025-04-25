```markdown
# video-editing-platform-api

Follow these steps to get the backend environment up and running:

## Prerequisites

Make sure the following are installed on your system:

- [FFmpeg](https://ffmpeg.org/download.html)  
- [Bun](https://bun.sh/)

You can verify installations by running:

```bash
ffmpeg -version
bun -v
```

## Setup

1. **Navigate to the backend directory**

   ```bash
   cd backend/
   ```

2. **Create a `.env` file**

   Use the `.env.sample` file as a reference for the required environment variables:

   ```bash
   cp .env.sample .env
   ```

3. **Add your database URL**

   Open the `.env` file and set your `DATABASE_URL`.  
   It should follow the structure shown in the `.env.sample` file.

4. **Generate Prisma client**

   ```bash
   bunx prisma generate
   ```

5. **Run database migrations**

   ```bash
   bunx prisma migrate dev
   ```

6. **Start the backend**

   ```bash
   bun index.ts
   ```
```
