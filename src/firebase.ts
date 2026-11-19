import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

export const ADMIN_CLOUD_EMAIL = "habibfa07@gmail.com";

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// CRITICAL: Pass firebaseConfig.firestoreDatabaseId so queries target the provisioned database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  login_hint: ADMIN_CLOUD_EMAIL,
  prompt: "select_account",
});

export function isVerifiedCloudAdmin(user: { email?: string | null } | null): boolean {
  return Boolean(user?.email && user.email.toLowerCase() === ADMIN_CLOUD_EMAIL);
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogleAdmin() {
  return signInWithPopup(auth, googleProvider);
}

export async function ensureGoogleAdminSignedIn() {
  if (isVerifiedCloudAdmin(auth.currentUser)) {
    return auth.currentUser!;
  }

  if (auth.currentUser) {
    await signOut(auth);
  }

  const credential = await signInWithPopup(auth, googleProvider);
  if (!isVerifiedCloudAdmin(credential.user)) {
    const wrongEmail = credential.user.email || "akun tidak dikenal";
    await signOut(auth);
    const err = new Error(`WRONG_ADMIN_ACCOUNT:${wrongEmail}`);
    (err as any).code = "auth/wrong-admin-account";
    throw err;
  }

  return credential.user;
}

export async function signOutFirebase() {
  return signOut(auth);
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== "undefined") {
  testConnection();
}
