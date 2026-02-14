# iFlow - Step 2 (Secure Registration + Verification)

This step upgrades the backend to include:

- encrypted per-event SMTP password storage
- visitor registration per event
- verification token flow
- DB-backed email outbox worker (queue-ready and KVM-2 friendly)

## What is included

- Event creation with encrypted SMTP password-at-rest
- Visitor registration endpoint by event slug
- Verification endpoint by token
- `visitors` and `email_outbox` schema
- Worker process to send queued verification emails using **event-specific SMTP identity**

## Environment

```bash
cd backend
cp .env.example .env
```

Set a strong key:

- `SMTP_SECRET_KEY` must be at least 32 chars.

## Run

```bash
npm install
npm run migrate
npm run dev
npm run worker
```

## API

### 1) Create event

`POST /v1/events`

```json
{
  "title": "iFlow Expo 2026",
  "slug": "expo-2026",
  "venue": "Pragati Maidan",
  "startsAt": "2026-05-18T09:00:00Z",
  "endsAt": "2026-05-20T18:00:00Z",
  "smtp": {
    "fromEmail": "noreply@expo2026.example.com",
    "fromName": "iFlow Expo Team",
    "host": "mail.expo2026.example.com",
    "port": 587,
    "username": "smtp-user",
    "password": "smtp-password",
    "security": "starttls"
  }
}
```

### 2) Register visitor

`POST /v1/events/:slug/visitors/register`

```json
{
  "email": "visitor@example.com",
  "fullName": "Visitor Name",
  "phone": "+911234567890",
  "formData": {
    "company": "ACME",
    "interest": ["ai", "automation"]
  }
}
```

### 3) Verify visitor

`GET /v1/visitors/verify?token=<token-from-email>`

## KVM-2 note

This uses a lightweight DB outbox pattern with a polling worker, avoiding heavy infrastructure while still enabling async reliable email delivery.
