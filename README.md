# Smart Diagnosis API

Production-ready backend API using Node.js, Express, MongoDB, JWT, bcrypt, and a switchable AI enhancement layer.

## Features

- User registration and login with JWT authentication
- Protected diagnosis endpoint returning 2-3 probable conditions
- AI enhancement layer (`mock` or `gemini`) used only to improve response quality
- Protected history endpoint with pagination and date filters
- Centralized error handling and input validation

## Run

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Start production server: `npm start`

## API

- `POST /auth/register`
- `POST /auth/login`
- `POST /diagnose` (Protected)
- `GET /history` (Protected)

## Example Diagnose Response

```json
{
  "conditions": [
    {
      "name": "Common Cold",
      "probability": "65%",
      "next_steps": "Rest, hydration, consult general physician if persists"
    }
  ]
}
```
