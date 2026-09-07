import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Resolved Firebase configuration (supports Vercel/production env vars or bundled json)
const metaEnv = (import.meta as any)?.env || {};

export const resolvedFirebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(resolvedFirebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with the provisioned database ID
export const db = getFirestore(
  app,
  resolvedFirebaseConfig.firestoreDatabaseId && resolvedFirebaseConfig.firestoreDatabaseId !== '(default)'
    ? resolvedFirebaseConfig.firestoreDatabaseId
    : undefined
);

// Connection test helper
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
    return true;
  } catch (err: unknown) {
    // Permission or not-found errors still indicate reachability
    const message = err instanceof Error ? err.message : '';
    if (message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline');
      return false;
    }
    return true;
  }
}

export interface FirebaseDiagnosis {
  id?: string;
  farmerId?: string;
  cropName: string;
  cropScientific?: string;
  diseaseName: string;
  diseaseScientific?: string;
  severity: string;
  confidenceScore: number;
  symptomsObserved?: string;
  cause?: string;
  treatments?: string;
  expertNote?: string;
  imageUrl?: string;
  modelProvider?: string;
  plantPart?: string;
  createdAt?: any;
}

// Save diagnosis to Firestore
export async function saveDiagnosisToFirestore(diagnosis: Omit<FirebaseDiagnosis, 'id' | 'createdAt'>) {
  try {
    const colRef = collection(db, 'diagnoses');
    const docRef = await addDoc(colRef, {
      ...diagnosis,
      createdAt: serverTimestamp(),
      clientTimestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving diagnosis to Firestore:', error);
    return null;
  }
}

// Fetch recent diagnoses from Firestore
export async function getRecentFirestoreDiagnoses(maxCount: number = 10): Promise<FirebaseDiagnosis[]> {
  try {
    const colRef = collection(db, 'diagnoses');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirebaseDiagnosis, 'id'>)
    }));
  } catch (error) {
    console.warn('Fallback fetching without index or offline:', error);
    try {
      const colRef = collection(db, 'diagnoses');
      const qSimple = query(colRef, limit(maxCount));
      const snapshot = await getDocs(qSimple);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirebaseDiagnosis, 'id'>)
      }));
    } catch (fallbackError) {
      console.error('Failed to get Firestore diagnoses:', fallbackError);
      return [];
    }
  }
}

// Listen to real-time diagnoses
export function subscribeToDiagnoses(callback: (diagnoses: FirebaseDiagnosis[]) => void) {
  const colRef = collection(db, 'diagnoses');
  const q = query(colRef, limit(15));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirebaseDiagnosis, 'id'>)
      }));
      callback(items);
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
    }
  );
}

export interface FarmerAccount {
  name: string;
  phone: string;
  password?: string;
  district: string;
  upazila?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Register farmer account directly into Firebase Auth & Cloud Firestore (/farmers/{phone})
export async function registerFarmerToFirestore(account: {
  name: string;
  phone: string;
  password: string;
  district: string;
}): Promise<{ success: boolean; message?: string; user?: FarmerAccount }> {
  const cleanPhone = account.phone.trim();
  const cleanName = account.name.trim();
  const cleanPass = account.password.trim();
  const authEmail = `${cleanPhone.replace(/[^0-9]/g, '')}@krishiguide.com`;

  let authCreated = false;

  // 1. First, create user in Firebase Authentication (shows in Firebase Console > Authentication > Users)
  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail, cleanPass);
    if (cred.user) {
      authCreated = true;
      await updateProfile(cred.user, { displayName: cleanName });
    }
  } catch (authErr: any) {
    if (authErr?.code === 'auth/email-already-in-use') {
      return {
        success: false,
        message: 'এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে একাউন্ট খোলা হয়েছে। দয়া করে লগইন করুন।',
      };
    }
    console.log('Firebase Auth signup note:', authErr?.code || authErr?.message);
  }

  // 2. Save profile in Firestore Database (/farmers/{phone})
  const newUserData = {
    name: cleanName,
    phone: cleanPhone,
    password: cleanPass,
    district: account.district || 'ঢাকা',
    createdAt: new Date().toISOString(),
  };

  try {
    const farmerDocRef = doc(db, 'farmers', cleanPhone);
    await setDoc(farmerDocRef, newUserData, { merge: true });
  } catch (firestoreErr: any) {
    console.warn('Firestore database write warning:', firestoreErr);
    // If Firestore rules are locked, but Auth succeeded or client is ready
    if (!authCreated && firestoreErr?.message?.includes('permission')) {
      return {
        success: false,
        message: 'Firebase Rules অনুমতি দিচ্ছে না। ফায়ারবেস কনসোলের "Rules" ট্যাবে গিয়ে allow read, write চালু করুন।',
      };
    }
  }

  return {
    success: true,
    user: {
      name: newUserData.name,
      phone: newUserData.phone,
      district: newUserData.district,
    },
  };
}

// Login farmer by verifying credentials against Firebase Auth or Firestore
export async function loginFarmerWithFirestore(
  phone: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: FarmerAccount }> {
  const cleanPhone = phone.trim();
  const cleanPass = password.trim();
  const authEmail = `${cleanPhone.replace(/[^0-9]/g, '')}@krishiguide.com`;

  // 1. Try Firebase Authentication first
  try {
    const cred = await signInWithEmailAndPassword(auth, authEmail, cleanPass);
    if (cred.user) {
      // Try to read district from Firestore if permissions allow
      let userDistrict = 'ঢাকা';
      let displayName = cred.user.displayName || cleanPhone;
      try {
        const farmerDocRef = doc(db, 'farmers', cleanPhone);
        const docSnap = await getDoc(farmerDocRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.name) displayName = d.name;
          if (d.district) userDistrict = d.district;
        }
      } catch (err) {
        // Firestore read fallback
      }

      return {
        success: true,
        user: {
          name: displayName,
          phone: cleanPhone,
          district: userDistrict,
        },
      };
    }
  } catch (authErr: any) {
    if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/invalid-credential') {
      return {
        success: false,
        message: 'পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।',
      };
    }
    // Continue to Firestore check below
  }

  // 2. Fallback to Firestore check
  try {
    const farmerDocRef = doc(db, 'farmers', cleanPhone);
    const docSnap = await getDoc(farmerDocRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        message: 'এই মোবাইল নাম্বারে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নতুন একাউন্ট খুলুন।',
      };
    }

    const data = docSnap.data();
    if (data.password !== cleanPass) {
      return {
        success: false,
        message: 'পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।',
      };
    }

    return {
      success: true,
      user: {
        name: data.name || 'কৃষক',
        phone: data.phone || cleanPhone,
        district: data.district || 'ঢাকা',
        upazila: data.upazila || '',
        photoUrl: data.photoUrl || '',
      },
    };
  } catch (error: any) {
    console.warn('Firestore farmer login error:', error);
    return {
      success: false,
      message: 'লগইন করতে সমস্যা হয়েছে। দয়া করে মোবাইল নাম্বার ও পাসওয়ার্ড পরীক্ষা করুন।',
    };
  }
}

// Update farmer profile in Firestore
export async function updateFarmerProfileInFirestore(
  phone: string,
  updates: Partial<FarmerAccount>
): Promise<boolean> {
  try {
    const cleanPhone = phone.trim();
    const farmerDocRef = doc(db, 'farmers', cleanPhone);
    await setDoc(
      farmerDocRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Error updating farmer profile in Firestore:', error);
    return false;
  }
}

// Fetch registered farmers list from Firestore for database explorer
export async function getFirestoreFarmers(maxCount: number = 20): Promise<FarmerAccount[]> {
  try {
    const colRef = collection(db, 'farmers');
    const q = query(colRef, limit(maxCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        name: data.name || '',
        phone: data.phone || docSnap.id,
        district: data.district || '',
        password: data.password ? '••••••••' : undefined,
        createdAt: data.createdAt,
      };
    });
  } catch (err) {
    console.warn('Could not fetch farmers from Firestore:', err);
    return [];
  }
}

export interface FirebaseChatInquiry {
  id?: string;
  farmerId?: string;
  farmerName?: string;
  question: string;
  answer: string;
  detectedCrop?: string;
  model?: string;
  createdAt?: any;
  clientTimestamp?: string;
}

// Save agricultural Q&A to Cloud Firestore (/chat_inquiries)
export async function saveChatInquiryToFirestore(
  inquiry: Omit<FirebaseChatInquiry, 'id' | 'createdAt'>
): Promise<string | null> {
  try {
    const colRef = collection(db, 'chat_inquiries');
    const docRef = await addDoc(colRef, {
      ...inquiry,
      createdAt: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Error saving chat inquiry to Firestore:', error);
    return null;
  }
}

// Fetch recent chat inquiries from Cloud Firestore
export async function getRecentChatInquiries(
  farmerId?: string,
  maxCount: number = 30
): Promise<FirebaseChatInquiry[]> {
  try {
    const colRef = collection(db, 'chat_inquiries');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirebaseChatInquiry, 'id'>),
    }));
    if (farmerId && farmerId !== 'guest') {
      return results.filter(
        (r) => !r.farmerId || r.farmerId === farmerId || r.farmerId === 'guest'
      );
    }
    return results;
  } catch (error) {
    console.warn('Fallback fetching chat inquiries without index or offline:', error);
    try {
      const colRef = collection(db, 'chat_inquiries');
      const qSimple = query(colRef, limit(maxCount));
      const snapshot = await getDocs(qSimple);
      const results = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirebaseChatInquiry, 'id'>),
      }));
      if (farmerId && farmerId !== 'guest') {
        return results.filter(
          (r) => !r.farmerId || r.farmerId === farmerId || r.farmerId === 'guest'
        );
      }
      return results;
    } catch (fallbackError) {
      console.warn('Failed to get Firestore chat inquiries:', fallbackError);
      return [];
    }
  }
}

export { firebaseConfig };
