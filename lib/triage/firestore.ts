import {
  type DocumentReference,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  FinalTriageResult,
  LocalAssessment,
  PatientProfile,
  TriageConversationTurn,
  TriageQuestion,
  TriageSafetyResponses,
  TriageSession,
  TriageSessionStatus,
  TriageSessionVitals,
  UserProfile,
} from "@/types";

function isFirebaseError(error: unknown): error is { code: string; message?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export function getFirestoreErrorMessage(error: unknown) {
  if (isFirebaseError(error)) {
    switch (error.code) {
      case "permission-denied":
        return "Firestore denied access. Verify that you are signed in with the correct account and that Firebase Console rules allow this user document.";
      case "unauthenticated":
        return "You must be signed in before accessing profile data.";
      case "not-found":
        return "The requested Firestore document could not be found.";
      case "unavailable":
        return "Firestore is temporarily unavailable. Please try again.";
      default:
        return "A Firestore error occurred while loading or saving profile data.";
    }
  }

  return "A Firestore error occurred while loading or saving profile data.";
}

function createProfileDocRef(uid: string): DocumentReference {
  return doc(getFirebaseDb(), "users", uid);
}

function createSessionCollectionRef(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "sessions");
}

function createSessionDocRef(uid: string, sessionId: string): DocumentReference {
  return doc(getFirebaseDb(), "users", uid, "sessions", sessionId);
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  return value instanceof Timestamp ? value.toDate() : null;
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapConversationTurn(value: unknown): TriageConversationTurn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const turn = item as Partial<TriageConversationTurn>;

    return {
      id: turn.id ?? `turn-${index + 1}`,
      role: turn.role === "user" ? "user" : "assistant",
      kind: turn.kind === "answer" ? "answer" : "question",
      questionId: turn.questionId,
      inputType: turn.inputType,
      text: turn.text ?? "",
      answerValue: turn.answerValue,
      createdAt: toDate(turn.createdAt),
    };
  });
}

export function isProfileComplete(profile: PatientProfile | null) {
  if (!profile) {
    return false;
  }

  return (
    profile.age !== null &&
    profile.gender !== null &&
    profile.weight !== null &&
    profile.height !== null
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) {
    throw new Error("Cannot load a user profile without an authenticated uid.");
  }

  const profileRef = createProfileDocRef(uid);

  try {
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as Partial<UserProfile>;

    return {
      uid,
      email: data.email ?? null,
      age: normalizeNumber(data.age),
      gender: data.gender ?? null,
      weight: normalizeNumber(data.weight),
      height: normalizeNumber(data.height),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    throw error;
  }
}

export async function upsertUserProfile(
  uid: string,
  email: string | null,
  profile: PatientProfile
) {
  if (!uid) {
    throw new Error("Cannot save a user profile without an authenticated uid.");
  }

  const profileRef = createProfileDocRef(uid);
  const existingProfile = await getDoc(profileRef);
  const payload = {
    uid,
    email,
    age: normalizeNumber(profile.age),
    gender: profile.gender ?? null,
    weight: normalizeNumber(profile.weight),
    height: normalizeNumber(profile.height),
    updatedAt: serverTimestamp(),
    ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  try {
    await setDoc(profileRef, payload, { merge: true });
  } catch (error) {
    throw error;
  }
}

function mapSession(item: { id: string; data: () => Record<string, unknown> }): TriageSession {
  const data = item.data();

  return {
    id: item.id,
    userId: String(data.userId ?? ""),
    status:
      data.status === "questioning" || data.status === "completed"
        ? (data.status as TriageSessionStatus)
        : "questioning",
    vitals: {
      spo2: Number(data.spo2 ?? 0),
      temperature: Number(data.temperature ?? 0),
      heartRate: Number(data.heartRate ?? 0),
    },
    localAssessment: data.localAssessment as LocalAssessment,
    safetyResponses:
      (data.safetyResponses as TriageSafetyResponses | null | undefined) ?? null,
    currentQuestion: (data.currentQuestion as TriageQuestion | null) ?? null,
    finalResult: (data.finalResult as FinalTriageResult | null) ?? null,
    conversationHistory: mapConversationTurn(data.conversationHistory),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getRecentSessions(uid: string): Promise<TriageSession[]> {
  if (!uid) {
    throw new Error("Cannot load triage sessions without an authenticated uid.");
  }

  const sessionQuery = query(
    createSessionCollectionRef(uid),
    orderBy("updatedAt", "desc"),
    limit(10)
  );

  const snapshot = await getDocs(sessionQuery);

  return snapshot.docs.map((item) => mapSession(item));
}

export async function createTriageSession(
  uid: string,
  vitals: TriageSessionVitals,
  localAssessment: LocalAssessment,
  safetyResponses: TriageSafetyResponses | null,
  conversationHistory: TriageConversationTurn[],
  status: TriageSessionStatus,
  currentQuestion: TriageQuestion | null,
  finalResult: FinalTriageResult | null
) {
  if (!uid) {
    throw new Error("Cannot create a triage session without an authenticated uid.");
  }

  const docRef = await addDoc(createSessionCollectionRef(uid), {
    userId: uid,
    spo2: vitals.spo2,
    temperature: vitals.temperature,
    heartRate: vitals.heartRate,
    status,
    localAssessment,
    safetyResponses,
    currentQuestion,
    finalResult,
    conversationHistory,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId: uid,
    vitals,
    status,
    localAssessment,
    safetyResponses,
    currentQuestion,
    finalResult,
    conversationHistory,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies TriageSession;
}

export async function updateTriageSession(
  uid: string,
  sessionId: string,
  patch: {
    status: TriageSessionStatus;
    localAssessment?: LocalAssessment;
    safetyResponses?: TriageSafetyResponses | null;
    currentQuestion: TriageQuestion | null;
    finalResult: FinalTriageResult | null;
    conversationHistory: TriageConversationTurn[];
  }
) {
  if (!uid || !sessionId) {
    throw new Error("Cannot update a triage session without a uid and session id.");
  }

  await updateDoc(createSessionDocRef(uid, sessionId), {
    status: patch.status,
    ...(patch.localAssessment ? { localAssessment: patch.localAssessment } : {}),
    ...(patch.safetyResponses !== undefined
      ? { safetyResponses: patch.safetyResponses }
      : {}),
    currentQuestion: patch.currentQuestion,
    finalResult: patch.finalResult,
    conversationHistory: patch.conversationHistory,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserClinicalData(uid: string) {
  if (!uid) {
    throw new Error("Cannot delete user data without an authenticated uid.");
  }

  const sessionsSnapshot = await getDocs(createSessionCollectionRef(uid));

  await Promise.all(sessionsSnapshot.docs.map((session) => deleteDoc(session.ref)));
  await deleteDoc(createProfileDocRef(uid));
}
