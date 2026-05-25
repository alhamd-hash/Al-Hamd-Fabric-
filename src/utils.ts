import { Collection, Product, Order, Review, Subscription } from './types';
import { INITIAL_COLLECTIONS, INITIAL_PRODUCTS, INITIAL_REVIEWS } from './data';

// Local Storage Keys
const KEYS = {
  PRODUCTS: 'alhamd_products',
  COLLECTIONS: 'alhamd_collections',
  ORDERS: 'alhamd_orders',
  REVIEWS: 'alhamd_reviews',
  SUBSCRIPTIONS: 'alhamd_subscriptions'
};

export const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem(KEYS.PRODUCTS);
  if (data && (data.includes('prod-1') || data.includes('col-summer'))) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  if (!data) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

export const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredCollections = (): Collection[] => {
  const data = localStorage.getItem(KEYS.COLLECTIONS);
  if (data && (data.includes('col-summer') || data.includes('col-luxury'))) {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
    return INITIAL_COLLECTIONS;
  }
  if (!data) {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
    return INITIAL_COLLECTIONS;
  }
  return JSON.parse(data);
};

export const saveStoredCollections = (collections: Collection[]) => {
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(collections));
};

export const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const saveStoredOrders = (orders: Order[]) => {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
};

export const getStoredReviews = (): Review[] => {
  const data = localStorage.getItem(KEYS.REVIEWS);
  if (!data) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  return JSON.parse(data);
};

export const saveStoredReviews = (reviews: Review[]) => {
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
};

export const getStoredSubscriptions = (): Subscription[] => {
  const data = localStorage.getItem(KEYS.SUBSCRIPTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveStoredSubscriptions = (subs: Subscription[]) => {
  localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
};

export const formatPKR = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

// Delivery charges logic
// Standard delivery: 300 PKR
// Free delivery if total exceeds 6000 PKR
export const calculateDeliveryCharges = (subtotal: number): number => {
  if (subtotal > 6000) return 0;
  return 300;
};
