import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Order, Review, OrderStatus } from './types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Test connection on boot according to guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Define error handling types and operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  }
}

// Global firestore error handling wrapper conforming exactly to specifications
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Document Operations for Orders and Reviews
const ORDERS_PATH = 'orders';
const REVIEWS_PATH = 'reviews';

// --- Orders Firestore Utilities ---
export async function addOrderToFirestore(order: Order): Promise<void> {
  const docRef = doc(db, ORDERS_PATH, order.id);
  try {
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_PATH}/${order.id}`);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus): Promise<void> {
  const docRef = doc(db, ORDERS_PATH, orderId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_PATH}/${orderId}`);
  }
}

export async function updateOrderInFirestore(orderId: string, updatedOrder: Order): Promise<void> {
  const docRef = doc(db, ORDERS_PATH, orderId);
  try {
    await setDoc(docRef, updatedOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_PATH}/${orderId}`);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const docRef = doc(db, ORDERS_PATH, orderId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_PATH}/${orderId}`);
  }
}

export function listenToOrders(onUpdate: (orders: Order[]) => void, onError?: (err: Error) => void) {
  const ordersCol = collection(db, ORDERS_PATH);
  return onSnapshot(ordersCol, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Order);
    });
    // Sort orders descending by createdAt timestamp/ISO date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (error) => {
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.GET, ORDERS_PATH);
    }
  });
}

// --- Reviews Firestore Utilities ---
export async function addReviewToFirestore(review: Review): Promise<void> {
  const docRef = doc(db, REVIEWS_PATH, review.id);
  try {
    await setDoc(docRef, review);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REVIEWS_PATH}/${review.id}`);
  }
}

export async function approveReviewInFirestore(reviewId: string): Promise<void> {
  const docRef = doc(db, REVIEWS_PATH, reviewId);
  try {
    await updateDoc(docRef, { approved: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${REVIEWS_PATH}/${reviewId}`);
  }
}

export async function deleteReviewInFirestore(reviewId: string): Promise<void> {
  const docRef = doc(db, REVIEWS_PATH, reviewId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${REVIEWS_PATH}/${reviewId}`);
  }
}

export function listenToReviews(onUpdate: (reviews: Review[]) => void, onError?: (err: Error) => void) {
  const reviewsCol = collection(db, REVIEWS_PATH);
  return onSnapshot(reviewsCol, (snapshot) => {
    const list: Review[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Review);
    });
    // Sort reviews descending by createdAt
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (error) => {
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.GET, REVIEWS_PATH);
    }
  });
}
