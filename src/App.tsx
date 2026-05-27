import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Trash2, X, Star, Calendar, MessageSquare, Menu, Globe, Phone,
  MapPin, Heart, Share2, Facebook, Instagram, Send, Sparkles, CheckCircle2, ChevronRight, ArrowRight, CornerDownRight, Loader, Tag, ShieldAlert
} from 'lucide-react';
import { Product, Collection, Order, Review, Subscription, OrderStatus, NewsletterNotification, HomeBanner, Category } from './types';
import {
  getStoredProducts, saveStoredProducts,
  getStoredCollections, saveStoredCollections,
  getStoredCategories, saveStoredCategories,
  getStoredOrders, saveStoredOrders,
  getStoredReviews, saveStoredReviews,
  getStoredSubscriptions, saveStoredSubscriptions,
  formatPKR, calculateDeliveryCharges
} from './utils';
import {
  listenToOrders,
  listenToReviews,
  listenToBanners,
  addOrderToFirestore,
  updateOrderStatusInFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  addReviewToFirestore,
  approveReviewInFirestore,
  deleteReviewInFirestore,
  addBannerToFirestore,
  updateBannerInFirestore,
  deleteBannerFromFirestore,
  listenToProducts,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  listenToCollections,
  addCollectionToFirestore,
  updateCollectionInFirestore,
  deleteCollectionFromFirestore,
  listenToCategories,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore
} from './firebase';
import { INITIAL_COLLECTIONS, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';

// Core layout components
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CheckoutForm from './components/CheckoutForm';
import TrackOrderModal from './components/TrackOrderModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Global Persisted States (Local Storage)
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<NewsletterNotification[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);

  // Preloader syncing state for new visitors and incognito to ensure they see live database changes immediately without flashes
  const [isSyncing, setIsSyncing] = useState(() => {
    const hasCache = getStoredProducts().length > 0 && getStoredCollections().length > 0;
    return !hasCache; // sync screen active on first-ever load
  });

  // Navigation Routing
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact' | 'checkout' | 'admin' | 'collection' | 'category'>('home');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [collectionCategoryFilter, setCollectionCategoryFilter] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Drawer & Modals states
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedImage: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  // Wishlist list
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Hot selling products expansion state
  const [showAllHotSelling, setShowAllHotSelling] = useState(false);

  // Newsletter form inputs
  const [newsName, setNewsName] = useState('');
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');

  // Initialize data on mount
  useEffect(() => {
    setProducts(getStoredProducts());
    setCollections(getStoredCollections());
    setCategories(getStoredCategories());
    setSubscriptions(getStoredSubscriptions());

    // Start with local systems first for instantaneous boot UI
    setOrders(getStoredOrders());
    setReviews(getStoredReviews());

    let productsLoaded = false;
    let collectionsLoaded = false;
    let categoriesLoaded = false;
    let bannersLoaded = false;

    const checkFinishedLoading = () => {
      if (productsLoaded && collectionsLoaded && categoriesLoaded && bannersLoaded) {
        setIsSyncing(false);
      }
    };

    // Safe timeout to disable loader in case of poor connectivity
    const safetyTimeout = setTimeout(() => {
      setIsSyncing(false);
    }, 2800);

    // Bind real-time server database listeners
    const unsubscribeOrders = listenToOrders(
      (firestoreOrders) => {
        setOrders(firestoreOrders);
        saveStoredOrders(firestoreOrders);
      },
      (error) => {
        console.warn('Firestore orders sync deactivated:', error);
      }
    );

    const unsubscribeReviews = listenToReviews(
      (firestoreReviews) => {
        setReviews(firestoreReviews);
        saveStoredReviews(firestoreReviews);
      },
      (error) => {
        console.warn('Firestore reviews sync deactivated:', error);
      }
    );

    const unsubscribeBanners = listenToBanners(
      (firestoreBanners) => {
        setBanners(firestoreBanners);
        localStorage.setItem('alhamd_banners', JSON.stringify(firestoreBanners));
        bannersLoaded = true;
        checkFinishedLoading();
      },
      (error) => {
        console.warn('Firestore banners sync deactivated:', error);
        bannersLoaded = true;
        checkFinishedLoading();
      }
    );

    const unsubscribeProducts = listenToProducts(
      async (firestoreProducts) => {
        const isSeeded = localStorage.getItem('alhamd_products_seeded') === 'true';
        if (firestoreProducts.length === 0 && !isSeeded) {
          localStorage.setItem('alhamd_products_seeded', 'true');
          try {
            for (const prod of INITIAL_PRODUCTS) {
              await addProductToFirestore(prod);
            }
          } catch (e) {
            console.error('Failed to bootstrap products:', e);
          }
        } else {
          if (firestoreProducts.length > 0) {
            localStorage.setItem('alhamd_products_seeded', 'true');
          }
          setProducts(firestoreProducts);
          saveStoredProducts(firestoreProducts);
        }
        productsLoaded = true;
        checkFinishedLoading();
      },
      (error) => {
        console.warn('Firestore products sync deactivated:', error);
        productsLoaded = true;
        checkFinishedLoading();
      }
    );

    const unsubscribeCollections = listenToCollections(
      async (firestoreCollections) => {
        const isSeeded = localStorage.getItem('alhamd_collections_seeded') === 'true';
        if (firestoreCollections.length === 0 && !isSeeded) {
          localStorage.setItem('alhamd_collections_seeded', 'true');
          localStorage.setItem('alhamd_defaults_v2_synced', 'true');
          try {
            for (const col of INITIAL_COLLECTIONS) {
              await addCollectionToFirestore(col);
            }
          } catch (e) {
            console.error('Failed to bootstrap collections:', e);
          }
        } else {
          // Check for new arrivals and hot selling defaults in v2
          const defaultsV2 = localStorage.getItem('alhamd_defaults_v2_synced') === 'true';
          if (!defaultsV2) {
            localStorage.setItem('alhamd_defaults_v2_synced', 'true');
            try {
              const hasNewArrivals = firestoreCollections.some(c => c.id === 'new-arrivals');
              const hasHotSelling = firestoreCollections.some(c => c.id === 'hot-selling');
              if (!hasNewArrivals) {
                const nac = INITIAL_COLLECTIONS.find(c => c.id === 'new-arrivals');
                if (nac) await addCollectionToFirestore(nac);
              }
              if (!hasHotSelling) {
                const hsc = INITIAL_COLLECTIONS.find(c => c.id === 'hot-selling');
                if (hsc) await addCollectionToFirestore(hsc);
              }
            } catch (e) {
              console.error('Failed to auto-upgrade default collections:', e);
            }
          }
          if (firestoreCollections.length > 0) {
            localStorage.setItem('alhamd_collections_seeded', 'true');
          }
          setCollections(firestoreCollections);
          saveStoredCollections(firestoreCollections);
        }
        collectionsLoaded = true;
        checkFinishedLoading();
      },
      (error) => {
        console.warn('Firestore collections sync deactivated:', error);
        collectionsLoaded = true;
        checkFinishedLoading();
      }
    );

    const unsubscribeCategories = listenToCategories(
      async (firestoreCategories) => {
        const isSeeded = localStorage.getItem('alhamd_categories_seeded') === 'true';
        if (firestoreCategories.length === 0 && !isSeeded) {
          localStorage.setItem('alhamd_categories_seeded', 'true');
          try {
            for (const cat of INITIAL_CATEGORIES) {
              await addCategoryToFirestore(cat);
            }
          } catch (e) {
            console.error('Failed to bootstrap categories:', e);
          }
        } else {
          if (firestoreCategories.length > 0) {
            localStorage.setItem('alhamd_categories_seeded', 'true');
          }
          setCategories(firestoreCategories);
          saveStoredCategories(firestoreCategories);
        }
        categoriesLoaded = true;
        checkFinishedLoading();
      },
      (error) => {
        console.warn('Firestore categories sync deactivated:', error);
        categoriesLoaded = true;
        checkFinishedLoading();
      }
    );

    // Bind real-time banners sync from Firestore
    const storedBanners = localStorage.getItem('alhamd_banners');
    if (storedBanners) {
      setBanners(JSON.parse(storedBanners));
    }

    // Load custom notifications if existing
    const storedNotifs = localStorage.getItem('alhamd_notifications');
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    }

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeOrders();
      unsubscribeReviews();
      unsubscribeBanners();
      unsubscribeProducts();
      unsubscribeCollections();
      unsubscribeCategories();
    };
  }, []);

  // Handle wishlisting items
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => 
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Add Item to Shopping Cart Global State
  const handleAddToCart = (product: Product, quantity: number, selectedImage: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.selectedImage === selectedImage);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedImage }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (idx: number, amount: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[idx].quantity = Math.max(1, updated[idx].quantity + amount);
      return updated;
    });
  };

  const handleRemoveFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Direct checkout option "Order Now" from product details
  const handleOrderNow = (product: Product, quantity: number, selectedImage: string) => {
    // Add to cart first
    setCart([{ product, quantity, selectedImage }]);
    // Immediately navigate to checkout view
    handleNavigation('checkout');
    setIsCartOpen(false);
  };

  // Safe navigation trigger helper
  const handleNavigation = (view: typeof currentView | 'product', payload?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Always reset product details view when navigating anywhere
    setSelectedProductId(null);

    if (view === 'product') {
      if (payload) {
        setSelectedProductId(payload);
      }
    } else {
      setCurrentView(view as any);
      if (view === 'collection' && payload) {
        setSelectedCollectionId(payload);
        setCollectionCategoryFilter(null);
      } else if (view === 'category' && payload) {
        setSelectedCategoryName(payload);
      } else if (view === 'home') {
        setSelectedCollectionId(null);
        setSelectedCategoryName(null);
        setCollectionCategoryFilter(null);
      }
    }
  };

  // Submit Order from checkout form
  const handleSubmitOrder = async (formData: any): Promise<string> => {
    const orderId = `AHF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      ...formData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    // Save synchronously as permanent entry in Firestore DB
    try {
      await addOrderToFirestore(newOrder);
    } catch (err) {
      console.error('Failed to publish order to Firestore database:', err);
    }

    return orderId;
  };

  // Submit Newsletter Signup
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim() || !newsName.trim()) return;

    // Check if search email already exists
    if (subscriptions.some(s => s.email.toLowerCase() === newsEmail.toLowerCase().trim())) {
      setNewsSuccess('💡 Subscribed already! You are already on the recipient queue Al-Hamd.');
      return;
    }

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      customerName: newsName,
      email: newsEmail.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedSubs = [newSub, ...subscriptions];
    setSubscriptions(updatedSubs);
    saveStoredSubscriptions(updatedSubs);

    setNewsName('');
    setNewsEmail('');
    setNewsSuccess('Alhamdulillah! You have successfully subscribed to Al-Hamd Fabrics. We will notify you whenever we launch a premium lawn collection!');
    
    setTimeout(() => {
      setNewsSuccess('');
    }, 8500);
  };

  // Submit Product Reviews which require Admin verification
  const handleSubmitReview = async (productId: string, customerName: string, rating: number, comment: string) => {
    const targetProduct = products.find(p => p.id === productId);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      productName: targetProduct?.name || 'Folk Fabric',
      customerName,
      rating,
      comment,
      approved: false, // Must be approved by Admin in Admin Panel first
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    saveStoredReviews(updatedReviews);

    // Save to Firestore permanent database
    try {
      await addReviewToFirestore(newReview);
    } catch (err) {
      console.error('Failed to write review to Firestore database:', err);
    }
  };

  // --- Custom banner management handlers ---
  const handleAddBanner = async (banner: HomeBanner) => {
    const updatedBanners = [...banners, banner];
    setBanners(updatedBanners);
    localStorage.setItem('alhamd_banners', JSON.stringify(updatedBanners));
    try {
      await addBannerToFirestore(banner);
    } catch (err) {
      console.error('Failed to save custom banner to Firestore:', err);
    }
  };

  const handleUpdateBanner = async (bannerId: string, updated: HomeBanner) => {
    const updatedBanners = banners.map(b => b.id === bannerId ? updated : b);
    setBanners(updatedBanners);
    localStorage.setItem('alhamd_banners', JSON.stringify(updatedBanners));
    try {
      await updateBannerInFirestore(bannerId, updated);
    } catch (err) {
      console.error('Failed to update banner in Firestore:', err);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const updatedBanners = banners.filter(b => b.id !== bannerId);
    setBanners(updatedBanners);
    localStorage.setItem('alhamd_banners', JSON.stringify(updatedBanners));
    try {
      await deleteBannerFromFirestore(bannerId);
    } catch (err) {
      console.error('Failed to delete banner from Firestore:', err);
    }
  };

  // Triggered when admin registers a new product. Dispatches mock broadcast log
  const handleSendProductNotification = (prodName: string, prodImage: string) => {
    const newLog: NewsletterNotification = {
      id: `notif-${Date.now()}`,
      productName: prodName,
      productImage: prodImage,
      sentAt: new Date().toISOString(),
      recipientsCount: subscriptions.length > 0 ? subscriptions.length : 12 // fallback simulation scale
    };

    const updatedLogs = [newLog, ...notifications];
    setNotifications(updatedLogs);
    localStorage.setItem('alhamd_notifications', JSON.stringify(updatedLogs));
  };

  // --- Admin actions ---
  const handleAddProduct = async (prod: Product) => {
    const updated = [prod, ...products];
    setProducts(updated);
    saveStoredProducts(updated);
    try {
      await addProductToFirestore(prod);
    } catch (err) {
      console.error('Failed to save product to Firestore:', err);
    }
  };

  const handleEditProduct = async (prod: Product) => {
    const updated = products.map(p => p.id === prod.id ? prod : p);
    setProducts(updated);
    saveStoredProducts(updated);
    try {
      await updateProductInFirestore(prod.id, prod);
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveStoredProducts(updated);
    try {
      await deleteProductFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
    }
  };

  const handleAddCollection = async (col: Collection) => {
    const updated = [...collections, col];
    setCollections(updated);
    saveStoredCollections(updated);
    try {
      await addCollectionToFirestore(col);
    } catch (err) {
      console.error('Failed to save collection to Firestore:', err);
    }
  };

  const handleEditCollection = async (col: Collection) => {
    const updated = collections.map(c => c.id === col.id ? col : c);
    setCollections(updated);
    saveStoredCollections(updated);
    try {
      await updateCollectionInFirestore(col.id, col);
    } catch (err) {
      console.error('Failed to update collection in Firestore:', err);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    saveStoredCollections(updated);
    try {
      await deleteCollectionFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete collection from Firestore:', err);
    }
  };

  const handleAddCategory = async (cat: Category) => {
    const updated = [...categories, cat];
    setCategories(updated);
    try {
      await addCategoryToFirestore(cat);
    } catch (err) {
      console.error('Failed to save category to Firestore:', err);
    }
  };

  const handleEditCategory = async (cat: Category) => {
    const updated = categories.map(c => c.id === cat.id ? cat : c);
    setCategories(updated);
    try {
      await updateCategoryInFirestore(cat.id, cat);
    } catch (err) {
      console.error('Failed to update category in Firestore:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    try {
      await deleteCategoryFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete category from Firestore:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (status === 'Cancelled') {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      saveStoredOrders(updated);

      try {
        await deleteOrderFromFirestore(orderId);
      } catch (err) {
        console.error('Failed to delete cancelled order from Firestore database:', err);
      }
    } else {
      const updated = orders.map(o => {
        if (o.id === orderId) {
          let paymentStatus = o.paymentStatus;
          if (o.paymentMethod === 'advance') {
            if (status === 'Confirmed' || status === 'Dispatched' || status === 'On The Way' || status === 'Delivered') {
              paymentStatus = 'paid';
            } else if (status === 'Pending') {
              paymentStatus = 'pending';
            }
          }
          return { ...o, status, paymentStatus };
        }
        return o;
      });
      setOrders(updated);
      saveStoredOrders(updated);

      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) {
        try {
          await updateOrderInFirestore(orderId, targetOrder);
        } catch (err) {
          console.error('Failed to update order status in Firestore database:', err);
        }
      }
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'failed') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, paymentStatus } : o);
    setOrders(updated);
    saveStoredOrders(updated);

    const targetOrder = updated.find(o => o.id === orderId);
    if (targetOrder) {
      try {
        await updateOrderInFirestore(orderId, targetOrder);
      } catch (err) {
        console.error('Failed to update order payment status in Firestore database:', err);
      }
    }
  };

  const handleMarkOrderReceived = async (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          customerName: '',
          phoneNumber: '',
          whatsappNumber: '',
          address: '',
          city: '',
          province: '',
          subtotal: 0,
          deliveryCharges: 0,
          paymentStatus: 'paid' as const,
          isReceived: true,
          status: 'Delivered' as OrderStatus
        };
      }
      return o;
    });
    setOrders(updated);
    saveStoredOrders(updated);

    const targetOrder = updated.find(o => o.id === orderId);
    if (targetOrder) {
      try {
        await updateOrderInFirestore(orderId, targetOrder);
      } catch (err) {
        console.error('Failed to update received order in Firestore database:', err);
      }
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    const updated = reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r);
    setReviews(updated);
    saveStoredReviews(updated);

    try {
      await approveReviewInFirestore(reviewId);
    } catch (err) {
      console.error('Failed to approve review in Firestore database:', err);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    setReviews(updated);
    saveStoredReviews(updated);

    try {
      await deleteReviewInFirestore(reviewId);
    } catch (err) {
      console.error('Failed to reject/delete review in Firestore database:', err);
    }
  };

  // Shopping Cart computations
  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const cartDelivery = calculateDeliveryCharges(cartSubtotal);
  const cartGrandTotal = cartSubtotal + cartDelivery;

  // Search filter matching
  const getFilteredProducts = () => {
    let result = [...products];

    // Filter by search queries
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const queryWords = q.split(/\s+/).filter(w => w.length > 0);
      
      result = result.filter(p => {
        const titleWords = p.name.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        
        // Match if ANY query word matches or is a substring of ANY word in the product's title
        const matchesTitleWord = queryWords.some(qw => 
          titleWords.some(tw => tw.includes(qw))
        );
        
        // Or if the queries match category, short details, or text elements
        const matchesCategory = queryWords.some(qw => p.category.toLowerCase().includes(qw));
        const matchesDescription = queryWords.some(qw => p.description.toLowerCase().includes(qw));
        const matchesShortDetails = queryWords.some(qw => p.shortDetails.toLowerCase().includes(qw));

        return matchesTitleWord || matchesCategory || matchesDescription || matchesShortDetails;
      });
    }

    return result;
  };

  const searchFilteredProducts = getFilteredProducts();

  // Pick focused product detail
  const focusedProduct = products.find(p => p.id === selectedProductId);

  if (isSyncing) {
    return (
      <div className="min-h-screen w-full bg-[#1e152a] flex flex-col items-center justify-center p-6 text-center text-[#f1ebd9]" id="luxury-app-preloader">
        <div className="space-y-6 max-w-sm flex flex-col items-center">
          {/* Elegant gold logo mark */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/40 rounded-full flex items-center justify-center border-2 border-[#c5a880] shadow-xl relative animate-pulse">
            <span className="font-serif font-extrabold text-[#c5a880] text-xl sm:text-2xl tracking-tighter">AH</span>
            <div className="absolute inset-x-0 -bottom-1 flex justify-center">
              <span className="bg-[#c5a880] text-[#1e152a] text-[8px] px-1.5 py-0.5 rounded-sm font-extrabold tracking-widest leading-none uppercase">LAHORE</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
              Al-Hamd Fabrics
            </h2>
            <div className="w-12 h-0.5 bg-[#c5a880] mx-auto opacity-70"></div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Premium Unstitched Silhouettes
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 pt-3">
            <div className="w-7 h-7 border-2 border-[#c5a880] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-300 font-sans mt-3 animate-pulse leading-snug">
              Syncing live fabrics, categories and new catalog arrivals from our Lahore store database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden font-sans" id="store-app-wrapper">
      
      {/* Sticky Header Nav */}
      <Navbar
        cart={cart}
        onNavigate={handleNavigation}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        collections={collections}
        categories={categories}
      />

      {/* Main Content Stage container */}
      <main className="flex-grow">
        
        {/* VIEW 1: PRODUCT DETAILS PAGE */}
        {selectedProductId && focusedProduct ? (
          <ProductDetails
            product={focusedProduct}
            allReviews={reviews}
            onBack={() => setSelectedProductId(null)}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            onSubmitReview={handleSubmitReview}
          />
        ) : currentView === 'checkout' ? (
          /* VIEW 2: CHECKOUT PAGE */
          cart.length === 0 ? (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <span className="text-4xl text-gray-300">🛒</span>
              <h2 className="font-serif text-xl font-bold text-gray-800">Your Shopping bag is empty</h2>
              <p className="text-xs text-gray-400">Please choose some premium lawn suits or Winter shawls before requesting dispatch delivery.</p>
              <button onClick={() => handleNavigation('home')} className="px-5 py-2 py-2.5 bg-[#1e152a] text-white text-xs font-semibold rounded hover:bg-[#c5a880] uppercase">
                Return to Storefront
              </button>
            </div>
          ) : (
            <CheckoutForm
              cart={cart}
              onSubmitOrder={handleSubmitOrder}
              onCancel={() => handleNavigation('home')}
              onClearCart={handleClearCart}
            />
          )
        ) : currentView === 'admin' ? (
          /* VIEW 3: ADMIN CONSOLE */
          <AdminPanel
            products={products}
            collections={collections}
            orders={orders}
            reviews={reviews}
            subscriptions={subscriptions}
            notifications={notifications}
            banners={banners}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCollection={handleAddCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdateOrderPaymentStatus}
            onMarkOrderReceived={handleMarkOrderReceived}
            onApproveReview={handleApproveReview}
            onRejectReview={handleRejectReview}
            onSendProductNotification={handleSendProductNotification}
            onAddBanner={handleAddBanner}
            onUpdateBanner={handleUpdateBanner}
            onDeleteBanner={handleDeleteBanner}
            categories={categories}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onClose={() => handleNavigation('home')}
          />
        ) : currentView === 'about' ? (
          /* VIEW 4: ABOUT US VIEW */
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 animate-fade-in text-gray-700 leading-relaxed text-sm">
            <div className="text-center space-y-3">
              <span className="text-xs text-[#c5a880] font-extrabold uppercase tracking-widest block">Establishing Heritage</span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1e152a] tracking-tight">
                About Al-Hamd Fabrics
              </h1>
              <p className="text-xs text-gray-400 font-mono">ESTD. LAHORE, PAKISTAN</p>
            </div>

            <div className="aspect-[16/6] rounded-2xl overflow-hidden border">
              <img src="https://images.unsplash.com/photo-1590156546746-c58d04737aa1?auto=format&fit=crop&q=80&w=1200&h=450" alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover filter brightness-[0.7]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-[#1e152a] text-lg">Our Story & Craftsmanship</h3>
                <p>
                  Founded under the visionary leadership of <strong>Zafar Iqbal</strong> in Lahore, Pakistan, <strong>Al-Hamd Fabrics</strong> stands as a shining beacon of pristine fabric quality, luxurious aesthetic designs, and durable threadwork. Over the years, we have mastered the delicate balance of offering traditional ethnic silhouettes with modern high-definition digital prints.
                </p>
                <p>
                  Sourced from long-staple cotton fibers, our Swiss Lawn, Cambric, Karandi and Crinkle Chiffons undergo intense processing, mercerization, and shrinkage checks. When you purchase an unstitched suit from our Lahore catalog, you purchase a promise of unparalleled drapery and soft skin-friendly dyes.
                </p>
              </div>

              <div className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-serif font-bold text-[#1e152a] text-lg">Manga Mandi Flagship Location</h3>
                <p>
                  Our physical roots reside inside the historical apparel block of Lahore. Visitors are always welcome to touch, feel and test physical color densities at our physical fabrics store:
                </p>
                <div className="space-y-2.5 font-sans pt-1">
                  <div className="flex gap-2 text-xs">
                    <MapPin size={17} className="text-[#c5a880] shrink-0" />
                    <span>Manga Mandi, Raiwind Road, Lahore, Punjab, Pakistan</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Phone size={17} className="text-[#c5a880] shrink-0" />
                    <span>Helpline Support: 03053131133</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 text-xs">
                  <strong>Online Delivery Framework:</strong> Flat delivery charges 300 PKR across Balochistan, KP, Sindh and Punjab, with automatic FREE shipping waivers on orders above PKR 6,000.
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'contact' ? (
          /* VIEW 5: CONTACT US VIEW */
          <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in text-gray-700 leading-relaxed text-sm">
            <div className="space-y-6">
              <span className="text-xs text-[#c5a880] font-extrabold uppercase tracking-widest block">Get In Touch</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#110c18] tracking-tight">
                Submit Your Inquiries Directly
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Have customized size requests for wedding formal raw silk suites, bulk printing demands or courier delivery tracking anomalies? Use the contact coordinates to connect directly with Al-Hamd Fabrics.
              </p>

              <div className="divide-y divide-gray-100">
                <div className="py-4 flex gap-4 items-start">
                  <MapPin size={22} className="text-[#c5a880] shrink-0 mt-1" />
                  <div>
                    <strong className="text-[#100c18] block text-sm font-bold">Physical Fabrics Store:</strong>
                    <span className="text-xs text-gray-500 block">Manga Mandi, Raiwind Road, Lahore, Pakistan</span>
                  </div>
                </div>
                <div className="py-4 flex gap-4 items-start">
                  <Phone size={22} className="text-[#c5a880] shrink-0 mt-1" />
                  <div>
                    <strong className="text-[#100c18] block text-sm font-bold">Direct Support Helpline:</strong>
                    <span className="text-xs font-mono text-gray-500 block">03053131133</span>
                  </div>
                </div>
                <div className="py-4 flex gap-4 items-start">
                  <Send size={22} className="text-[#c5a880] shrink-0 mt-1" />
                  <div>
                    <strong className="text-[#100c18] block text-sm font-bold">Managing Owner:</strong>
                    <span className="text-xs text-gray-500 block">Zafar Iqbal (Proprietor Al-Hamd Fabrics)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Contact Form */}
            <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#1e152a]">Send Online Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("JazakAllah! Your contact request has been registered. Zafar Iqbal and team will contact you back shortly."); }} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Full Name</label>
                  <input type="text" required placeholder="e.g. Maria Bibi" className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 rounded focus:outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone / WhatsApp Number</label>
                  <input type="tel" required placeholder="e.g. 03053131133" className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 rounded focus:outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detailed Message</label>
                  <textarea required rows={4} placeholder="Type down fabric requests, queries, or stitching queries..." className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 rounded focus:outline-none text-xs" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#1e152a] hover:bg-[#c5a880] hover:text-black hover:shadow text-white font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer rounded-xs">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        ) : currentView === 'collection' && selectedCollectionId ? (
          /* VIEW 6: CHOSEN DEDICATED COLLECTION PAGE (Circular Collections Deep-Link) */
          (() => {
            const col = collections.find(c => c.id === selectedCollectionId);
            const baseProducts = products.filter(p => p.collectionId === selectedCollectionId || p.collectionIds?.includes(selectedCollectionId));
            
            // Resolve linked categories
            const linkedCats = col && col.linkedCategoryIds
              ? categories.filter(cat => col.linkedCategoryIds?.includes(cat.id))
              : [];
              
            // If the user picked a specific linked category, filter products by it. Else, show all inside this collection.
            const displayedProducts = collectionCategoryFilter
              ? baseProducts.filter(p => p.category.toLowerCase().trim() === collectionCategoryFilter.toLowerCase().trim() || p.categories?.some(c => c.toLowerCase().trim() === collectionCategoryFilter.toLowerCase().trim()))
              : baseProducts;
            
            return (
              <div className="animate-fade-in" id="collection-view-banner">
                {col && (
                  <div className="relative h-[240px] sm:h-[350px] bg-gray-950 flex items-center justify-center text-white overflow-hidden">
                    <img src={col.banner} alt={col.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.6] opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative text-center px-4 max-w-2xl space-y-2 z-10">
                      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md">
                        {col.name}
                      </h1>
                      <p className="text-gray-200 text-xs sm:text-sm font-sans font-light drop-shadow">
                        {col.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Linked Categories Interactive Tab/Filter Bar */}
                {linkedCats.length > 0 ? (
                  <div className="bg-stone-50 border-b border-gray-200 py-4 px-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block sm:inline">
                        🏷️ Filter by Category:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                        <button
                          onClick={() => setCollectionCategoryFilter(null)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            collectionCategoryFilter === null
                              ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] shadow-xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#c5a880] hover:text-[#c5a880]'
                          }`}
                        >
                          Show All ({baseProducts.length})
                        </button>
                        {linkedCats.map((cat) => {
                          const count = baseProducts.filter(p => p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()).length;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setCollectionCategoryFilter(cat.name)}
                              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                collectionCategoryFilter?.toLowerCase().trim() === cat.name.toLowerCase().trim()
                                  ? 'bg-[#c5a880] text-[#1e152a] border-[#c5a880] shadow-xs'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#c5a880] hover:text-[#c5a880]'
                              }`}
                            >
                              <span>{cat.isGents ? '👔' : '👗'}</span>
                              <span>{cat.name}</span>
                              <span className="opacity-60 font-monotext-[10px]">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : baseProducts.length > 0 && (
                  /* Standard auto sub-categories fallback when none are manually linked */
                  <div className="bg-[#faf9f6]/50 border-b border-gray-100 py-3 text-xs text-center flex items-center justify-center gap-4 flex-wrap px-4">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Explore Subcategories:</span>
                    {Array.from(new Set(baseProducts.map(p => p.category))).map((cat, id) => (
                      <button
                        key={id}
                        onClick={() => handleNavigation('category', cat as string)}
                        className="px-3 py-1 bg-white border border-gray-200 hover:border-[#c5a880] rounded hover:text-[#c5a880] transition-colors font-medium cursor-pointer"
                      >
                        {cat as string}
                      </button>
                    ))}
                  </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-2">
                    <h2 className="font-serif text-2xl text-[#1e152a] font-bold tracking-tight">
                      Available Items in {col?.name || 'Collection'} ({displayedProducts.length})
                    </h2>
                    {collectionCategoryFilter && (
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 bg-gray-150 px-2.5 py-1 rounded">
                        Filtered to <strong className="text-[#1e152a] font-bold">{collectionCategoryFilter}</strong>
                      </span>
                    )}
                  </div>

                  {displayedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-stone-50 border border-dashed rounded-2xl">
                      <span className="text-4xl">🌸</span>
                      <h4 className="font-serif font-bold text-gray-700 mt-2">No products found under this filter!</h4>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                        {collectionCategoryFilter 
                          ? `We don't have any items registered under the "${collectionCategoryFilter}" category inside this collection yet.`
                          : 'Our team is actively organizing and restocking this category catalogs now.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                      {displayedProducts.map(prod => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          layout="compact-grid"
                          onViewDetails={(id) => setSelectedProductId(id)}
                          onAddToCart={handleAddToCart}
                          isWishlisted={wishlist.includes(prod.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : currentView === 'category' && selectedCategoryName ? (
          /* VIEW 7: CATEGORY VIEW SCREEN */
          (() => {
            const catProducts = products.filter(p => p.category.toLowerCase().trim() === selectedCategoryName.toLowerCase().trim() || p.categories?.some(c => c.toLowerCase().trim() === selectedCategoryName.toLowerCase().trim()));
            return (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in" id="category-scroller-stage">
                <div className="flex items-center justify-between border-b pb-3.5 border-[#e1d9cd]">
                  <div>
                    <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest block">Filtering Shop</span>
                    <h1 className="font-serif text-3xl font-extrabold text-[#110c18] capitalize">
                      Category: {selectedCategoryName}
                    </h1>
                  </div>
                  <button
                    onClick={() => handleNavigation('home')}
                    className="text-xs text-[#c5a880] font-bold hover:underline"
                  >
                    View All Collections
                  </button>
                </div>

                {catProducts.length === 0 ? (
                  <div className="text-center py-16 bg-stone-50 border rounded-2xl">
                    <p className="text-gray-400">No products registered under this tag currently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {catProducts.map(prod => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        layout="compact-grid"
                        onViewDetails={(id) => setSelectedProductId(id)}
                        onAddToCart={handleAddToCart}
                        isWishlisted={wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* VIEW 8: DEFAULT HOME PAGE WITH EVERYTHING IN THE LIST */
          <div className="space-y-12">
            
            {/* Top Carousel Banner Section */}
            <HeroSlider onNavigate={handleNavigation} slides={banners} />

            {/* If search query entered, display filter results instead of default blocks */}
            {searchQuery.trim() !== '' ? (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in" id="search-filter-page">
                <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-serif text-2xl font-bold text-[#1e152a]">
                    Search Matches for "{searchQuery}" ({searchFilteredProducts.length})
                  </h2>
                  <button onClick={() => setSearchQuery('')} className="text-xs text-[#c5a880] font-semibold hover:underline">
                    Clear Search Query
                  </button>
                </div>
                {searchFilteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-[#faf9f6] rounded-xl border border-dashed text-gray-500">
                    <span className="text-3xl">🧩</span>
                    <h3 className="font-serif font-bold text-md mt-2">No Matching Suits Found</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Try typing general keywords like "lawn", "winter", "unstitched", or "printed".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {searchFilteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        layout="compact-grid"
                        onViewDetails={(id) => setSelectedProductId(id)}
                        onAddToCart={handleAddToCart}
                        isWishlisted={wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* Regular home page layouts */
              <div className="space-y-16">
                
                {/* 2. CIRCULAR COLLECTIONS SECTION */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="circular-collections-container">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1e152a] tracking-tight">
                        Shop By Premium Collections
                      </h2>
                      <p className="text-gray-400 text-xs mt-1">Click any circle below to access their customized catalog details.</p>
                    </div>
                  </div>

                  {/* Gents Collections Row (Upper Line) */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-[#c5a880] uppercase tracking-widest block border-l-2 border-[#c5a880] pl-2.5">
                      Gents Collections
                    </span>
                    <div className="flex gap-4 sm:gap-6 py-2 overflow-x-auto no-scrollbar scroll-smooth">
                      {collections.filter(col => col.isGents && !col.isCombine && col.showInNavbar !== false).map((col) => (
                        <div
                          key={col.id}
                          onClick={() => handleNavigation('collection', col.id)}
                          className="flex-none flex flex-col items-center gap-3.5 cursor-pointer group text-center"
                          id={`circular-col-link-${col.id}`}
                        >
                          <div className="relative w-23 h-23 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#c5a880] group-hover:scale-105 transition-all duration-300 shadow-xs bg-[#faf9f6]">
                            <img
                              src={col.image}
                              alt={col.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <span className="font-serif text-xs font-bold text-gray-800 tracking-wide line-clamp-1 group-hover:text-[#c5a880] transition-colors max-w-[100px] sm:max-w-[120px]">
                            {col.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ladies Collections Row (Lower Line) */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-[#c5a880] uppercase tracking-widest block border-l-2 border-[#c5a880] pl-2.5">
                      Ladies Collections
                    </span>
                    <div className="flex gap-4 sm:gap-6 py-2 overflow-x-auto no-scrollbar scroll-smooth">
                      {collections.filter(col => !col.isGents && !col.isCombine && col.showInNavbar !== false).map((col) => (
                        <div
                          key={col.id}
                          onClick={() => handleNavigation('collection', col.id)}
                          className="flex-none flex flex-col items-center gap-3.5 cursor-pointer group text-center"
                          id={`circular-col-link-${col.id}`}
                        >
                          <div className="relative w-23 h-23 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#c5a880] group-hover:scale-105 transition-all duration-300 shadow-xs bg-[#faf9f6]">
                            <img
                              src={col.image}
                              alt={col.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <span className="font-serif text-xs font-bold text-gray-800 tracking-wide line-clamp-1 group-hover:text-[#c5a880] transition-colors max-w-[100px] sm:max-w-[120px]">
                            {col.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combine Products Collections Row */}
                  {collections.some(col => col.isCombine && col.showInNavbar !== false) && (
                    <div className="space-y-3">
                      <span className="text-xs font-extrabold text-[#c5a880] uppercase tracking-widest block border-l-2 border-[#c5a880] pl-2.5">
                        📦 Combine Products
                      </span>
                      <div className="flex gap-4 sm:gap-6 py-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {collections.filter(col => col.isCombine && col.showInNavbar !== false).map((col) => (
                          <div
                            key={col.id}
                            onClick={() => handleNavigation('collection', col.id)}
                            className="flex-none flex flex-col items-center gap-3.5 cursor-pointer group text-center"
                            id={`circular-col-link-${col.id}`}
                          >
                            <div className="relative w-23 h-23 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#c5a880] group-hover:scale-105 transition-all duration-300 shadow-xs bg-[#faf9f6]">
                              <img
                                src={col.image}
                                alt={col.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <span className="font-serif text-xs font-bold text-gray-800 tracking-wide line-clamp-1 group-hover:text-[#c5a880] transition-colors max-w-[100px] sm:max-w-[120px]">
                              {col.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* 3. NEW ARRIVALS: HORIZONTALLY SCROLLABLE PRODUCT CARDS */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="new-arrivals-row">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#110c18] tracking-tight flex items-center gap-2">
                      <Sparkles className="text-[#c5a880]" size={22} />
                      New Arrivals 2026 Collection
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Swipe horizontally to inspect Lahore's freshest unstitched lawn arrivals.</p>
                  </div>

                  <div className="flex gap-4 sm:gap-6 py-3 overflow-x-auto no-scrollbar scroll-smooth">
                    {products.filter(p => p.isNewArrival).map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        layout="large-horizontal"
                        onViewDetails={(id) => setSelectedProductId(id)}
                        onAddToCart={handleAddToCart}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </section>

                {/* 4. HOT SELLING: RESPONSIVE TILED PRODUCT GRID */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="hot-selling-grid">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#110c18] tracking-tight">
                        Hot Selling Masterpieces
                      </h2>
                      <p className="text-gray-400 text-xs mt-1">Our most popular, highly verified and bought ladies outfits.</p>
                    </div>
                  </div>

                  {/* Responsively styled grids */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                    {products
                      .filter(p => p.isHotSelling)
                      .slice(0, showAllHotSelling ? undefined : 10)
                      .map(prod => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          layout="compact-grid"
                          onViewDetails={(id) => setSelectedProductId(id)}
                          onAddToCart={handleAddToCart}
                          isWishlisted={wishlist.includes(prod.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                  </div>

                  {/* "View More Products" button triggers full expansion */}
                  {products.filter(p => p.isHotSelling).length > 10 && !showAllHotSelling && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowAllHotSelling(true)}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent border-2 border-[#1e152a] hover:bg-[#1e152a] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer shadow-2xs"
                        id="view-more-hotproducts"
                      >
                        View More Products
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </section>

                {/* DYNAMIC COLLECTIONS SECTIONS (Show on Homepage Option) */}
                {collections.filter(col => col.showProductsOnHomepage).map(col => {
                  const colProducts = products.filter(p => p.collectionId === col.id || p.collectionIds?.includes(col.id));
                  if (colProducts.length === 0) return null;
                  const isCarousel = col.homepageLayoutStyle === 'carousel';

                  return (
                    <section key={col.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6" id={`col-homepage-${col.id}`}>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div>
                          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#110c18] tracking-tight flex items-center gap-2">
                            <span className="text-[#c5a880]">⚜️</span>
                            {col.name}
                          </h2>
                          <p className="text-gray-400 text-xs mt-1">{col.description}</p>
                        </div>
                        <button
                          onClick={() => handleNavigation('collection', col.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#c5a880] hover:text-[#110c18] transition-colors cursor-pointer"
                        >
                          View All
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {isCarousel ? (
                        <div className="flex gap-4 sm:gap-6 py-3 overflow-x-auto no-scrollbar scroll-smooth">
                          {colProducts.slice(0, 10).map(prod => (
                            <ProductCard
                              key={prod.id}
                              product={prod}
                              layout="large-horizontal"
                              onViewDetails={(id) => setSelectedProductId(id)}
                              onAddToCart={handleAddToCart}
                              isWishlisted={wishlist.includes(prod.id)}
                              onToggleWishlist={handleToggleWishlist}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                          {colProducts.slice(0, 10).map(prod => (
                            <ProductCard
                              key={prod.id}
                              product={prod}
                              layout="compact-grid"
                              onViewDetails={(id) => setSelectedProductId(id)}
                              onAddToCart={handleAddToCart}
                              isWishlisted={wishlist.includes(prod.id)}
                              onToggleWishlist={handleToggleWishlist}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}

                {/* DYNAMIC CATEGORIES SECTIONS (Show on Homepage Option) */}
                {(categories || []).filter(cat => cat.showProductsOnHomepage).map(cat => {
                  const catProducts = products.filter(p => p.category.toLowerCase().trim() === cat.name.toLowerCase().trim() || p.categories?.some(c => c.toLowerCase().trim() === cat.name.toLowerCase().trim()));
                  if (catProducts.length === 0) return null;
                  return (
                    <section key={cat.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6" id={`cat-homepage-${cat.id}`}>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div>
                          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#110c18] tracking-tight flex items-center gap-2">
                            <span className="text-[#c5a880] font-normal">{cat.isGents ? '👔' : '👗'}</span>
                            {cat.name}
                          </h2>
                          <p className="text-gray-400 text-xs mt-1">{cat.description}</p>
                        </div>
                        <button
                          onClick={() => handleNavigation('category', cat.name)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#c5a880] hover:text-[#110c18] transition-colors cursor-pointer"
                        >
                          View All
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                        {catProducts.slice(0, 10).map(prod => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            layout="compact-grid"
                            onViewDetails={(id) => setSelectedProductId(id)}
                            onAddToCart={handleAddToCart}
                            isWishlisted={wishlist.includes(prod.id)}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}

              </div>
            )}

            {/* 5. NEWSLETTER SUBSCRIBE BANNER BLOCK (Section 4) */}
            <section className="bg-[#1e152a] py-12 md:py-16 text-white border-y border-[#c5a880]/30 shadow-xs relative overflow-hidden" id="newsletter-section">
              {/* Abstract decorative graphic vectors on backdrop */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#c5a880]/5 to-transparent rounded-full filter blur-xl transform translate-x-12 -translate-y-12" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#c5a880]/5 to-transparent rounded-full filter blur-xl transform -translate-x-12 translate-y-12" />

              <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
                <span className="text-3xl">✉️</span>
                <div className="space-y-1 max-w-xl mx-auto">
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f1ebd9] tracking-tight">
                    Subscribe To Our Newsletter
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm font-sans font-light">
                    Get notified immediately on your email inbox about new lawn arrivals, Eid specials, and exclusive Lahore fabric discounts!
                  </p>
                </div>

                {newsSuccess && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-xl leading-relaxed max-w-md mx-auto animate-fade-in">
                    {newsSuccess}
                  </div>
                )}

                <form onSubmit={handleNewsletterSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3.5">
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Name..."
                    value={newsName}
                    onChange={(e) => setNewsName(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/25 rounded px-4 py-3 text-xs focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] w-full text-white placeholder-gray-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Enter Email Address..."
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/25 rounded px-4 py-3 text-xs focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] w-full text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="py-3 px-8 bg-[#c5a880] hover:bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow-md select-none shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* SHOPPING CART OVERLAY SLIDE DRAWER COMPONENT */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[#1e152a]/50 backdrop-blur-3xs z-50 transition-opacity animate-fade-in" id="cart-drawer-overlay">
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white h-full z-50 flex flex-col justify-between shadow-2xl border-l border-gray-100 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 bg-stone-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={20} className="text-[#c5a880]" />
                <span className="font-serif font-extrabold text-[#110c18] text-base">Your Clothing Bag ({cartCount})</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Items body */}
            <div className="flex-grow p-4 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                  <span className="text-4xl">👜</span>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    You have not selected any printed cambric lawn suits or heavy wedding chiffon yet. Browse our Collections circles!
                  </p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="py-4 flex gap-3.5 text-xs first:pt-0 animate-fade-in">
                    <div className="w-16 h-20 rounded border border-gray-100 overflow-hidden flex-none bg-[#faf9f6]">
                      <img src={item.selectedImage} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-[#c5a880] uppercase tracking-wider font-extrabold block">
                          {item.product.category}
                        </span>
                        <h4 className="font-serif font-bold text-gray-800 line-clamp-1 truncate mt-0.5">{item.product.name}</h4>
                        <span className="text-gray-400 text-[10px] block mt-0.5 font-light truncate">{item.product.shortDetails}</span>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center border border-gray-200 bg-[#faf9f6] rounded">
                          <button
                            onClick={() => handleUpdateCartQty(index, -1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold transition-colors cursor-pointer text-[11px]"
                          >
                            -
                          </button>
                          <span className="px-2.5 font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(index, 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold transition-colors cursor-pointer text-[11px]"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-gray-800 font-sans">
                          {formatPKR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(index)}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all self-start cursor-pointer shrink-0"
                      title="Remove from bag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Billing Breakdown and footer actions */}
            <div className="p-5 border-t border-gray-100 bg-[#stone-50] space-y-4">
              <div className="text-xs space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal sum:</span>
                  <strong className="text-gray-800 font-mono font-bold text-sm">{formatPKR(cartSubtotal)}</strong>
                </div>
                <div className="flex justify-between text-gray-500 items-center">
                  <span className="flex items-center gap-1.5">
                    Delivery dispatch:
                    {cartSubtotal > 6000 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-sm font-bold text-[8px] uppercase tracking-wide">
                        FREE SHIP
                      </span>
                    )}
                  </span>
                  <strong className={cartSubtotal > 6000 ? 'text-emerald-600 line-through' : 'text-gray-800'}>
                    {formatPKR(cartDelivery)}
                  </strong>
                </div>

                {cartDelivery > 0 && (
                  <div className="p-2.5 bg-[#c5a880]/10 border border-[#c5a880]/20 rounded-lg text-gray-600 text-[10px] leading-relaxed">
                    🛒 Add items worth <strong>{formatPKR(6001 - cartSubtotal)} More</strong> to qualify for <strong>FREE Delivery!</strong>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total due:</span>
                  <span className="text-[#c5a880] text-lg font-extrabold font-sans">
                    {formatPKR(cartGrandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gray-50 transition-colors"
                >
                  Shop More
                </button>
                <button
                  onClick={() => {
                    if (cart.length > 0) {
                      handleNavigation('checkout');
                      setIsCartOpen(false);
                    }
                  }}
                  disabled={cart.length === 0}
                  className="flex-1 py-3 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black text-xs font-extrabold uppercase tracking-widest rounded-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  Checkout Bag
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACK ORDER STATUS MODAL TRIGGER */}
      {isTrackOpen && (
        <TrackOrderModal
          allOrders={orders}
          onClose={() => setIsTrackOpen(false)}
          onMarkOrderReceived={handleMarkOrderReceived}
        />
      )}

      {/* Quick Benefits row */}
      <section className="bg-[#1e152a] py-6 sm:py-8 text-xs text-[#f1ebd9] border-y border-[#c5a880]/20 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">💎</span>
            <strong className="text-white text-sm font-serif">100% Guaranteed Lawn</strong>
            <span className="text-gray-400 text-[10px] sm:text-xs">Sourced long staple fabrics</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">⭐</span>
            <strong className="text-white text-sm font-serif">Verified Customer reviews</strong>
            <span className="text-gray-400 text-[10px] sm:text-xs">Approved by Lahore control ledger</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🚚</span>
            <strong className="text-white text-sm font-serif">Flat Shipping PKR 300</strong>
            <span className="text-gray-400 text-[10px] sm:text-xs">Free delivery on PKR 6000+ orders</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">💬</span>
            <strong className="text-white text-sm font-serif">Direct WhatsApp Support</strong>
            <span className="text-gray-400 text-[10px] sm:text-xs">24/7 helpline: 03053131133</span>
          </div>
        </div>
      </section>

      {/* 4. PREMIUM COMPOSURE FOOTER */}
      <footer className="bg-[#100c18] border-t border-[#c5a880]/20 text-[#f1ebd9]/90 font-light" id="premium-footer">
        {/* Main Links split */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Store Intro branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#1e152a] rounded-full border border-[#c5a880] flex items-center justify-center font-serif font-bold text-sm text-[#c5a880]">
                AH
              </div>
              <span className="font-serif font-bold text-lg text-white">Al-Hamd Fabrics</span>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-sm">
              Your trusted destination for premium unstitched suits, bridal heavy-neck embroideries, and soft summer printed voile lawns in Lahore, Pakistan. Sourced with timeless dedication.
            </p>

            <div className="space-y-1.5 pt-2 text-xs font-sans text-gray-400">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-[#c5a880]" />
                <span>Manga Mandi, Raiwind Road, Lahore</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-[#c5a880]" />
                <span>WhatsApp: 03053131133</span>
              </p>
            </div>
          </div>

          {/* Column 2: Quick Navigation shortcuts */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-extrabold text-[#c5a880] text-sm uppercase tracking-wide">Quick Navigation</h4>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <button onClick={() => handleNavigation('home')} className="hover:text-[#c5a880] transition-colors text-left cursor-pointer">• Front Storefront</button>
              <button onClick={() => handleNavigation('about')} className="hover:text-[#c5a880] transition-colors text-left cursor-pointer">• About Us Heritage</button>
              <button onClick={() => handleNavigation('contact')} className="hover:text-[#c5a880] transition-colors text-left cursor-pointer">• Direct Contacts & Inquiries</button>
              <button onClick={() => setIsTrackOpen(true)} className="hover:text-[#c5a880] transition-colors text-left cursor-pointer">• Order status tracker</button>
            </div>
          </div>

          {/* Column 3: Collections Lists */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-extrabold text-[#c5a880] text-sm uppercase tracking-wide">Featured Catalogs</h4>
            <div className="flex flex-col gap-2 text-xs text-gray-400 font-mono">
              {collections.filter(c => c.showInNavbar !== false).map(col => (
                <button
                  key={col.id}
                  onClick={() => handleNavigation('collection', col.id)}
                  className="hover:text-[#c5a880] transition-colors text-left cursor-pointer text-xs"
                >
                  • {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Customer Policies & Support (Owner name in footer!) */}
          <div className="space-y-3.5 text-xs">
            <h4 className="font-serif font-extrabold text-[#c5a880] text-sm uppercase tracking-wide">Terms & Ownership</h4>
            <div className="text-gray-400 space-y-1 block font-sans">
              <p>Managing Owner: <strong className="text-white">Zafar Iqbal</strong></p>
              <p>Physical Location: <strong className="text-white">Lahore</strong></p>
            </div>
            
            <div className="flex flex-col gap-1.5 pt-1.5 text-xs text-gray-400 font-sans">
              <span>• Nationwide Delivery within 3-5 Working Days</span>
              <span>• Flat delivery charges: PKR 300</span>
              <span>• Easy Verification & S.O.P returns</span>
            </div>

            {/* Social Share logos */}
            <div className="flex gap-2.5 pt-3 text-[#c5a880]">
              <a href="#" className="p-2 bg-white/5 hover:bg-[#c5a880] hover:text-black rounded-full transition-colors" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="https://instagram.com" className="p-2 bg-white/5 hover:bg-[#c5a880] hover:text-black rounded-full transition-colors" aria-label="Instagram">
                <Instagram size={14} />
              </a>
              <a href="https://wa.me/923053131133" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-emerald-600 hover:text-white rounded-full transition-colors" aria-label="WhatsApp Inquiry Direct">
                <Phone size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* Subfooter bottom panel */}
        <div className="border-t border-[#f1ebd9]/5 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span>© 2026 Al-Hamd Fabrics Lahore. All rights reserved. Sourced Manga Mandi.</span>
            
            {/* 9. SUBTLE PURPLE NESTED HIDDEN ACCESS LINK TO ADMIN LOGIN (Section 9) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 select-none">Protected Console Hub:</span>
              <button
                onClick={() => handleNavigation('admin')}
                className="w-4 h-4 rounded-full bg-[#1e152a] hover:bg-[#c5a880] text-transparent hover:text-white transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-xs border border-[#c5a880]/30"
                title="Admin Control Hub console login panel"
                id="hidden-admin-trigger-puck"
              >
                •
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
