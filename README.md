# Health Triage

Next.js App Router rebuild of a health triage platform with Firebase Authentication, Firestore, and a server-side Gemini-assisted follow-up flow.

## Security Setup

This project is intended for public deployment, so secrets must stay out of the repository and out of the browser bundle.

### Local environment

1. Create `.env.local` in the project root.
2. Copy the variable names from [.env.example](./.env.example).
3. Fill in real values locally.
4. Never commit `.env.local`.
5. If a secret was ever pasted into source control, screenshots, or chat, rotate it before publishing.

### Required environment variables

Public-safe Firebase client config:

- `NEXT_PUBLIC_health_triage_FIREBASE_API_KEY`
- `NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_health_triage_FIREBASE_APP_ID`

Secret server-only config:

- `GEMINI_API_KEY`

### Public vs secret variables

Firebase web config values are safe to expose in the client bundle because they identify the Firebase project, not a privileged admin account. Access control still depends on Firebase Authentication and Firestore security rules.

`GEMINI_API_KEY` is secret. It must only exist on the server and must never be prefixed with `NEXT_PUBLIC_`.

## Vercel Deployment

Add every variable from `.env.example` to `Vercel Project Settings -> Environment Variables` before deploying.

- Set these public Firebase variables exactly as named:
  - `NEXT_PUBLIC_health_triage_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_health_triage_FIREBASE_APP_ID`
- Set `GEMINI_API_KEY` as a server-side environment variable in Vercel.
- Do not put the Gemini key into client code, public env vars, or browser requests.
- `.env.local` is only for local development and must never be committed.

## Firebase Auth Debug Notes

If hosted login fails with a `400` response from `identitytoolkit.googleapis.com`, check these first:

- Firebase Email/Password sign-in must be enabled in Firebase Console.
- Your Vercel env vars must all belong to the same Firebase project.
- Your deployed Vercel domain must be added to Firebase Authentication authorized domains.
- A project mismatch between `projectId`, `authDomain`, and `apiKey` can cause hosted auth failures even when the domain is authorized.

In development, the login screen prints a safe Firebase config check using only `projectId` and `authDomain` so you can confirm the deployed app is pointed at the intended project.

## GitHub Publishing Safety

Before pushing this repository publicly:

- confirm `.env.local` is still ignored
- confirm no secret files appear in `git status`
- confirm no real keys were copied into `.env.example`, README, or source files
- rotate any key that may have been exposed previously outside the repo

## Firebase Security

Firestore rules are defined in [firestore.rules](./firestore.rules).

Current access model:

- unauthenticated users cannot read or write user documents
- authenticated users can only access `/users/{uid}`
- authenticated users can only access `/users/{uid}/sessions/{sessionId}`

Deploy the rules with:

```bash
firebase deploy --only firestore:rules
```

## Gemini Safety

Gemini requests are made only from the server through [app/api/triage/route.ts](./app/api/triage/route.ts).

- `lib/env.server.ts` is marked `server-only`
- `lib/gemini.ts` is marked `server-only`
- `lib/triage/orchestrator.ts` is marked `server-only`

If `GEMINI_API_KEY` is missing, the app falls back to deterministic triage heuristics instead of exposing any secret or making insecure client-side calls.

## Development

```bash
npm install
npm run dev
```

## Pre-deploy checklist

- `.env.local` is present locally and not committed
- Vercel environment variables are configured
- Firestore rules are deployed
- Firebase Email/Password auth is enabled
- No secret keys are hardcoded into source files
