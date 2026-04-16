import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import {
  getFirebaseAuth,
  getFirebaseAuthDomain,
  getFirebaseDb,
  getFirebaseProjectId,
} from "@/lib/firebase/client";

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password
  );

  await setDoc(
    doc(getFirebaseDb(), "users", credential.user.uid),
    {
      uid: credential.user.uid,
      email: credential.user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return credential;
}

export async function logInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function logOutUser() {
  await signOut(getFirebaseAuth());
}

export async function sendUserPasswordReset(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function deleteAuthenticatedUser(user: User) {
  await deleteUser(user);
}

function getFirebaseAuthError(error: unknown): FirebaseErrorLike | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  return error as FirebaseErrorLike;
}

export function getFirebaseAuthDebugContext() {
  return {
    projectId: getFirebaseProjectId(),
    authDomain: getFirebaseAuthDomain(),
  };
}

export function getFirebaseAuthErrorMessage(error: unknown) {
  const firebaseError = getFirebaseAuthError(error);

  if (firebaseError?.code) {
    switch (firebaseError.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled for this Firebase project.";
      case "auth/invalid-api-key":
      case "auth/api-key-not-valid":
        return "Firebase API key is invalid for the configured project.";
      case "auth/app-not-authorized":
        return "This domain is not authorized for the configured Firebase project.";
      case "auth/configuration-not-found":
        return "Firebase Authentication is not configured correctly for this project.";
      case "auth/requires-recent-login":
        return "For security, please sign in again before deleting this account.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

export function getFirebaseAuthDiagnosticMessage(error: unknown) {
  const firebaseError = getFirebaseAuthError(error);
  const code = firebaseError?.code ?? "unknown";
  const message = firebaseError?.message ?? "No Firebase message returned.";
  const { projectId, authDomain } = getFirebaseAuthDebugContext();

  return `Firebase auth failed (${code}): ${message}. Active projectId=${projectId}, authDomain=${authDomain}.`;
}

export function getFirebaseAuthTroubleshootingHint(error: unknown) {
  const firebaseError = getFirebaseAuthError(error);

  switch (firebaseError?.code) {
    case "auth/operation-not-allowed":
      return "Enable Email/Password authentication in Firebase Console for this project.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
      return "Check that Vercel uses the Firebase API key from the same project as the rest of the Firebase public config.";
    case "auth/app-not-authorized":
      return "Add your deployed Vercel domain to Firebase Authentication authorized domains for this same project.";
    case "auth/configuration-not-found":
      return "Confirm Firebase Authentication is enabled and the deployed env vars point to the intended Firebase project.";
    default:
      return "";
  }
}
