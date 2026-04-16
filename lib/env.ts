const FIREBASE_PUBLIC_ENV = {
  NEXT_PUBLIC_health_triage_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_API_KEY,
  NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_health_triage_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_APP_ID,
} as const;

type FirebasePublicEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function getMissingFirebasePublicEnvNames() {
  return Object.entries(FIREBASE_PUBLIC_ENV)
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);
}

export function getFirebasePublicEnv(): FirebasePublicEnv {
  const missingPublicEnv = getMissingFirebasePublicEnvNames();

  if (missingPublicEnv.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingPublicEnv.join(", ")}. Add them to .env.local for local development and to Vercel Project Settings for deployment.`
    );
  }

  return {
    apiKey: FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_API_KEY!,
    authDomain: FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN!,
    projectId: FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID!,
    storageBucket:
      FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId:
      FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID!,
    appId: FIREBASE_PUBLIC_ENV.NEXT_PUBLIC_health_triage_FIREBASE_APP_ID!,
  };
}
