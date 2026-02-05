# Authentication API Documentation

Base URL: `http://localhost:3000` (or your deployed domain)

This API uses JSON for requests and responses. All responses follow a standard structure:
```ts
type ApiResponse<T = {}> = {
    code: number;
    message: string;
} & T;
```

---

## Endpoints

### 1. Register User
Registers a new user in the system. Triggers a welcome email.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Response Success (201):**
  ```json
  {
    "code": 201,
    "message": "success"
  }
  ```
- **Response Error (400/409):**
  - `409 Conflict`: User already exists (username).
  - `400 Bad Request`: Validation errors (e.g., fields too short).

**Example Request:**
```javascript
const response = await fetch("http://localhost:3000/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "jdoe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe"
  })
});
const data = await response.json();
console.log(data);
```

---

### 2. Login Start
Initiates the login process by sending an OTP (One-Time Password) to the user's email.

- **URL:** `/auth/login/start`
- **Method:** `POST`d
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response Success (200):**
  ```json
  {
    "code": 200,
    "message": "success",
    "expiry": 1700000000000 // Timestamp when OTP expires
  }
  ```
- **Response Error (400):** Invalid email or body.

**Example Request:**
```javascript
const response = await fetch("http://localhost:3000/auth/login/start", {
  method: "POST",
  headers: { "Content-Type": "applic{ation/json" },
  body: JSON.stringify({
    email: "john@example.com"
  })
});
const data = await response.json();
```

---

### 3. Login End
Completes the login process by verifying the OTP. Returns access and refresh tokens.

- **URL:** `/auth/login/end`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response Success (200):**
  ```json
  {
    "code": 200,
    "message": "success",
    "accessToken": "eyJhbG...",
    "refreshToken": "MQ.uuid..."
  }
  ```
- **Response Error (401):** Invalid OTP or email.

**Example Request:**
```javascript
const response = await fetch("http://localhost:3000/auth/login/end", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john@example.com",
    otp: "123456"
  })
});
const data = await response.json();
// Store tokens securely
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);
```

---

### 4. Refresh Token
Refreshes the access token using a valid refresh token.

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response Success (200):**
  ```json
  {
    "code": 200,
    "message": "success",
    "accessToken": "neW_eyJhbG...",
    "refreshToken": "neW_MQ.uuid..."
  }
  ```
- **Response Error (401):** Invalid or expired refresh token.

**Example Request:**
```javascript
const response = await fetch("http://localhost:3000/auth/refresh", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    refreshToken: localStorage.getItem("refreshToken")
  })
});
const data = await response.json();
if (data.code === 200) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
}
```

---

### 5. Get Session (Current User)
Retrieves the profile of the currently logged-in user. Requires a valid Access Token.

- **URL:** `/auth/session`
- **Method:** `GET`
- **Headers:**
  - `Authorization`: `Bearer <accessToken>`
- **Response Success (200):**
  ```json
  {
    "code": 200,
    "message": "success",
    "user": {
      "id": 1,
      "username": "jdoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      // ... other user fields
    }
  }
  ```
- **Response Error (401):** Invalid or missing token.

**Example Request:**
```javascript
const response = await fetch("http://localhost:3000/auth/session", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
  }
});
const data = await response.json();
console.log("Current User:", data.user);
```
