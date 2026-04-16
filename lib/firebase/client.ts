import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { getFirebasePublicEnv } from "@/lib/env";

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let firebaseDbInstance: Firestore | null = null;
let firebaseStorageInstance: FirebaseStorage | null = null;
let firebaseFunctionsInstance: Functions | null = null;
let hasLoggedFirebaseClientConfig = false;

export function getFirebaseApp() {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  const firebaseConfig = getFirebasePublicEnv();

  if (
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    !hasLoggedFirebaseClientConfig
  ) {
    console.info("[firebase] Client config check", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
    hasLoggedFirebaseClientConfig = true;
  }

  firebaseAppInstance =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  return firebaseAppInstance;
}

export function getFirebaseProjectId() {
  return getFirebasePublicEnv().projectId;
}

export function getFirebaseAuthDomain() {
  return getFirebasePublicEnv().authDomain;
}

export function getFirebaseAuth() {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance;
  }

  firebaseAuthInstance = getAuth(getFirebaseApp());
  return firebaseAuthInstance;
}

export function getFirebaseDb() {
  if (firebaseDbInstance) {
    return firebaseDbInstance;
  }

  firebaseDbInstance = getFirestore(getFirebaseApp());
  return firebaseDbInstance;
}

export function getFirebaseStorage() {
  if (firebaseStorageInstance) {
    return firebaseStorageInstance;
  }

  firebaseStorageInstance = getStorage(getFirebaseApp());
  return firebaseStorageInstance;
}

export function getFirebaseFunctions() {
  if (firebaseFunctionsInstance) {
    return firebaseFunctionsInstance;
  }

  firebaseFunctionsInstance = getFunctions(getFirebaseApp());
  return firebaseFunctionsInstance;
}
