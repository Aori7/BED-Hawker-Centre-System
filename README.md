# HawkerSG - Backend Development
BED/SPM Hawker Centre Management System

## Prerequisites

Before running the project, ensure the following software is installed:

- Node.js
- SQL Server
- SQL Server Management Studio (SSMS)
- Visual Studio Code

---

## Clone the Repository

```bash
git clone <repository-url>
cd BED-Hawker-Centre-System
```

---

## Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

or install individually:

```bash
npm install express
npm install mssql
npm install dotenv
npm install joi
```

---

## Environment Variables

Create a `.env` file in the root directory.

Example:

```env
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=localhost
DB_DATABASE=hawker_db_bed
DB_PORT=1433
```

**Do not commit your `.env` file to GitHub.**

---

## Database Setup

1. Open SQL Server Management Studio.
2. Create a database named:

```
hawker_db_bed
```

3. Run the provided SQL scripts to create all required tables.

---

## Running the Project

Start the backend server:

```bash
node app.js
```

If the connection is successful, you should see:

```text
Database connection established successfully
Server listening on port 3000
```

---

## Accessing the Application

Open your browser and navigate to:

```
http://localhost:3000
```

---

## Project Structure

```
BED-Hawker-Centre-System
│
├── app.js
├── dbConfig.js
├── .env
├── package.json
├── package-lock.json
│
├── controllers/
├── middleware/
├── models/
├── routes/
│
└── public/
    ├── css/
    ├── html/
    ├── images/
    ├── js/
    └── index.html
```

---

## Notes

- `node_modules` is ignored using `.gitignore`.
- `.env` is ignored using `.gitignore`.
- Database credentials are stored securely using environment variables.
- SQL Server must be running before starting the application.