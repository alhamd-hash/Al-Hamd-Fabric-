export type OrderStatus = 'Pending' | 'Confirmed' | 'Dispatched' | 'On The Way' | 'Delivered' | 'Cancelled';

export interface LadiesSuitInfo {
  shirt?: string;
  dupatta?: string;
  trouser?: string;
  fabricType?: string;
  embroideryDetails?: string;
}

export interface Product {
  id: string;
  name: string;
  shortDetails: string;
  description: string;
  price: number; // in PKR
  images: string[];
  category: string;
  collectionId: string;
  specifications: Record<string, string>;
  isLadiesSuit?: boolean;
  ladiesSuitInfo?: LadiesSuitInfo;
  isNewArrival: boolean;
  isHotSelling: boolean;
  rating: number;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  banner: string;
  description: string;
  isGents?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedImage: string;
}

export interface Order {
  id: string;
  customerName: string;
  whatsappNumber?: string;
  phoneNumber: string;
  city: string;
  province: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  paymentMethod: 'cod' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  createdAt: string; // ISO string
  isReceived?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean; // Reviews first go to admin approval
  createdAt: string;
}

export interface Subscription {
  id: string;
  customerName: string;
  email: string;
  createdAt: string;
}

export interface NewsletterNotification {
  id: string;
  productName: string;
  productImage: string;
  sentAt: string;
  recipientsCount: number;
}
