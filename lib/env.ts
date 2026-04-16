const publicEnv = {
  apiKey: process.env.NEXT_PUBLIC_health_triage_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_health_triage_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_health_triage_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_health_triage_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_health_triage_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_health_triage_FIREBASE_APP_ID,
};

const missingPublicEnv = Object.entries(publicEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export function getFirebasePublicEnv() {
  if (missingPublicEnv.length > 0) {
    throw new Error(
      `Missing Firebase public environment variables: ${missingPublicEnv.join(", ")}`
    );
  }

  return publicEnv as {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
