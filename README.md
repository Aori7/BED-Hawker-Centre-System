# HawkerSG – Singapore Hawker Centre Management System

## Overview

HawkerSG is a web application developed for the Back-End Development assignment. It allows customers to browse hawker centres, order food and submit feedback, while vendors, operators and NEA officers each have their own management functions.

---

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Microsoft SQL Server
- MSSQL
- JWT
- bcrypt
- Joi
- Jest
- Supertest
- Postman

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

---

### 2. Create a `.env` file

Create a `.env` file in the project root.

Example:

```env
DB_USER=hawker_admin
DB_PASSWORD=hawkeradmin
DB_SERVER=localhost
DB_DATABASE=hawker_db_bed
DB_PORT=1433
ACCESS_TOKEN_SECRET=your_secret_key
PORT=3000
```

Suggested SQL Server login:

```
Username: hawker_admin
Password: hawkeradmin
```

Make sure your database is named:

```
hawker_db_bed
```

---

### 3. Install dependencies

```bash
npm install
```

---

### 4. Create the database

Run the SQL scripts in the following order:

1. Create_Tables.sql
2. Insert_Records.sql

Then create the default user accounts:

```bash
node seedUsers.js
```

---

### 5. Start the server

```bash
node app.js
```

The application should now be running on:

```
http://localhost:3000
```

---

## Default Login Accounts

### Vendor

Email:

```
stallowner1@hawkersg.com
```

Password:

```
stallowner123
```

---

### Operator

Email:

```
operator1@hawkersg.com
```

Password:

```
operator123
```

---

### NEA Officer

Email:

```
neaofficer1@hawkersg.com
```

Password:

```
neaofficer123
```

---

## Running Tests

Run all unit tests:

```bash
npm test
```

---

## Common Issues

### Database login error

Check that:

- SQL Server is running.
- SQL Server Authentication is enabled.
- The username and password in `.env` are correct.

---

### Cannot connect to SQL Server

Enable TCP/IP in **SQL Server Configuration Manager**, then restart the SQL Server service.

---

### Missing packages

If packages are missing, run:

```bash
npm install
```

---

## Credits

Please refer to **Credit** in the application for external assets, images, libraries and AI usage acknowledgements.