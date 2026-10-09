# Simple Users Dashboard (Express + Neon + Vercel)

A deliberately small example based on the core ideas in the real-backend project:
- Express routes (`GET /api/users`, `POST /api/users`)
- A PostgreSQL `users` table
- A dashboard that reads and adds users

No login, password handling, roles, or extra features are included. This is a learning demo, not a production-ready user-management system.

## 1. Create and deploy the database

1. Create a free PostgreSQL project at [Neon](https://neon.tech/).
2. In the Neon project, open **SQL Editor**.
3. Copy and run the SQL from `database/schema.sql` to create the `users` table.
4. In Neon, copy the connection string for your database. Keep it private.

## 2. Run locally (optional)

You need Node.js installed.

1. Copy `.env.example` to a new file named `.env`.
2. Replace the example `DATABASE_URL` with the Neon connection string.
3. In the project folder, run:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## 3. Deploy the app to Vercel

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com/), choose **Add New → Project**, import the repository, and deploy.
3. In the Vercel project, open **Settings → Environment Variables**.
4. Add `DATABASE_URL` and paste the Neon connection string. Select the environments you want (at least Production; Preview too if you will use preview deployments).
5. Redeploy after adding the variable.
6. Open the Vercel deployment URL. The dashboard should load users from Neon, and the form should add rows to the same database.

Vercel can detect an Express app from the root `index.js`; this project exports the app as required. You do not need to add a separate frontend deployment for this simple version.

## How the pieces connect

Browser dashboard → Express API route → Neon PostgreSQL database.

- `index.js` contains the tiny dashboard and API endpoints.
- `database/schema.sql` creates the table in the hosted database.
- `DATABASE_URL` tells the deployed app where the database is. It is a secret environment variable; never commit it to GitHub.

## Important limitations

This demo stores only a name and email. It has no authentication or authorization, so anyone who can reach the deployed URL can add users. Use fake/demo data only, and do not put real personal information in it.
