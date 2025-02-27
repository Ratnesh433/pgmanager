# PG Management System

## Overview
This is a **PG Management System** built using **Node.js, Express, and PostgreSQL**. It allows administrators to manage tenant records, including adding, updating, viewing, and deleting users.

## Features
- **Admin Login**: Secure authentication for administrators.
- **User Management**:
  - Add new tenants with validation.
  - View all registered tenants.
  - Edit tenant details.
  - Delete tenant records.
- **Validation**:
  - Phone numbers must be 10 digits.
  - Aadhar numbers must be 12 digits.
  - Unique constraint for Aadhar numbers.

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Templating Engine**: EJS
- **Middleware**: body-parser, express.static

## Prerequisites
Ensure you have the following installed:
- **Node.js** (v14+ recommended)
- **PostgreSQL** (v12+ recommended)

## Installation
### 1. Clone the Repository
```sh
git clone https://github.com/your-repo/pg-management.git
cd pg-management
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up the Database
1. Create a PostgreSQL database named `pgman`.
2. Run the following SQL commands:
```sql
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO admin (username, password) VALUES ('admin', 'admin123');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    aadhar VARCHAR(12) UNIQUE NOT NULL
);
```

### 4. Configure Database Connection
Update the following details in `server.js`:
```js
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "pgman",
    password: "your_password",
    port: 5432,
});
```

### 5. Run the Server
```sh
node server.js
```

### 6. Access the Application
Open your browser and go to:
```
http://localhost:3000
```

## API Routes
| Method | Endpoint       | Description          |
|--------|---------------|----------------------|
| GET    | `/`           | Login Page          |
| POST   | `/login`      | Admin Login         |
| GET    | `/view.ejs`   | View all users      |
| POST   | `/submit`     | Add new user        |
| GET    | `/edit/:id`   | Edit user details   |
| POST   | `/edit/:id`   | Update user details |
| POST   | `/delete/:id` | Delete a user       |

## License
This project is licensed under the MIT License.


