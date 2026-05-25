import React, { useState } from 'react';
import {
  Lock, Settings, ShoppingBag, MessageSquare, Plus, Trash2, Edit2, Filter,
  Calendar, Check, X, LogOut, CheckCircle, Flame, Mail, Send, Eye, Users, AlertTriangle, FileText, Sparkles, Tag, Upload
} from 'lucide-react';
import { Product, Collection, Category, Order, Review, Subscription, OrderStatus, NewsletterNotification, HomeBanner } from '../types';
import { formatPKR } from '../utils';

interface AdminPanelProps {
  products: Product[];
  collections: Collection[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  subscriptions: Subscription[];
  notifications: NewsletterNotification[];
  banners: HomeBanner[];
  onAddProduct: (prod: Product) => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCollection: (col: Collection) => void;
  onEditCollection: (col: Collection) => void;
  onDeleteCollection: (id: string) => void;
  onAddCategory: (cat: Category) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onMarkOrderReceived: (orderId: string) => void;
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string) => void;
  onSendProductNotification: (prodName: string, prodImage: string) => void;
  onAddBanner: (banner: HomeBanner) => void;
  onUpdateBanner: (bannerId: string, banner: HomeBanner) => void;
  onDeleteBanner: (bannerId: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  products,
  collections,
  categories = [],
  orders,
  reviews,
  subscriptions,
  notifications,
  banners = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onMarkOrderReceived,
  onApproveReview,
  onRejectReview,
  onSendProductNotification,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onClose
}: AdminPanelProps) {
  // Authentication State
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Sub-views
  const [currentTab, setCurrentTab] = useState<'orders' | 'reviews' | 'banners' | 'collections' | 'categories' | 'subscribers'>('orders');

  // --- Order Filter states ---
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [datePeriod, setDatePeriod] = useState<'all' | 'lasthour' | 'today' | '7days' | 'lastmonth' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // --- New Collection Form States ---
  const [showColForm, setShowColForm] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colImage, setColImage] = useState('');
  const [colBanner, setColBanner] = useState('');
  const [colIsGents, setColIsGents] = useState(true);

  // --- New Category Form States ---
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIsGents, setCatIsGents] = useState(true);

  // --- New Product Form States ---
  const [showProdForm, setShowProdForm] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodShort, setProdShort] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodCollection, setProdCollection] = useState('');
  const [prodImage1, setProdImage1] = useState('');
  const [prodImage2, setProdImage2] = useState('');
  const [prodImage3, setProdImage3] = useState('');
  
  // Specs and Ladies Suit Details
  const [specFabric, setSpecFabric] = useState('');
  const [specDupatta, setSpecDupatta] = useState('');
  const [specShirt, setSpecShirt] = useState('');
  const [specTrouser, setSpecTrouser] = useState('');
  const [specStyle, setSpecStyle] = useState('Unstitched 3-Piece');

  const [isLadiesSuit, setIsLadiesSuit] = useState(true);
  const [ladiesShirtDetail, setLadiesShirtDetail] = useState('');
  const [ladiesDupattaDetail, setLadiesDupattaDetail] = useState('');
  const [ladiesTrouserDetail, setLadiesTrouserDetail] = useState('');
  const [ladiesFabricType, setLadiesFabricType] = useState('Lawn & Silk');
  const [ladiesEmbroidery, setLadiesEmbroidery] = useState('');

  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isHotSelling, setIsHotSelling] = useState(false);

  // --- New/Edit Home Banner Form States ---
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Shop Collection');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerTargetView, setBannerTargetView] = useState<'home' | 'collection' | 'category'>('home');
  const [bannerTargetPayload, setBannerTargetPayload] = useState('');
  const [bannerBadge, setBannerBadge] = useState('EID SPECIAL');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerOrder, setBannerOrder] = useState(0);
  const [bannerImageError, setBannerImageError] = useState('');

  // Dual levels dropdown state
  const [bannerLinkType, setBannerLinkType] = useState<'gents-collection' | 'gents-category' | 'ladies-collection' | 'ladies-category' | 'none'>('none');
  const [bannerIdToDelete, setBannerIdToDelete] = useState<string | null>(null);
  const [activeConfirmKey, setActiveConfirmKey] = useState<string | null>(null);

  // Interactive Delete Assistant states
  const [deleteWizardType, setDeleteWizardType] = useState<'gents-col' | 'gents-cat' | 'ladies-col' | 'ladies-cat' | null>(null);
  const [deleteWizardSelectedId, setDeleteWizardSelectedId] = useState<string>('');

  // Authentication submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'alHamdNeweb') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Astaghfirullah! Invalid Password. Please check and try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setLoginError('');
  };

  // Date Filtering Logic
  const filterOrdersByDateAndStatus = (orderList: Order[]) => {
    let result = [...orderList];

    // 1. Filter by Status
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    // 2. Filter by Date Range
    const now = new Date();
    
    if (datePeriod === 'lasthour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      result = result.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= oneHourAgo && orderDate <= now;
      });
    } else if (datePeriod === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter(o => new Date(o.createdAt) >= startOfToday);
    } else if (datePeriod === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
    } else if (datePeriod === 'lastmonth') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    } else if (datePeriod === 'custom') {
      if (customStart) {
        const customStartDate = new Date(customStart);
        result = result.filter(o => new Date(o.createdAt) >= customStartDate);
      }
      if (customEnd) {
        const customEndDate = new Date(customEnd);
        // Adjust end date to capture the entire end day
        customEndDate.setHours(23, 59, 59, 999);
        result = result.filter(o => new Date(o.createdAt) <= customEndDate);
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredOrders = filterOrdersByDateAndStatus(orders);

  // Stats Counters
  const pendingReviewsCount = reviews.filter(r => !r.approved).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  // Save/Update Collection
  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    const payload: Collection = {
      id: editingColId || `col-${Date.now()}`,
      name: colName,
      description: colDesc || 'Premium clothing collection catalog item.',
      image: colImage || 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=300&h=300',
      banner: colBanner || 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=1200&h=400',
      isGents: colIsGents
    };

    if (editingColId) {
      onEditCollection(payload);
    } else {
      onAddCollection(payload);
    }

    // Reset
    setColName('');
    setColDesc('');
    setColImage('');
    setColBanner('');
    setColIsGents(true);
    setEditingColId(null);
    setShowColForm(false);
  };

  const startEditCollection = (col: Collection) => {
    setEditingColId(col.id);
    setColName(col.name);
    setColDesc(col.description);
    setColImage(col.image);
    setColBanner(col.banner);
    setColIsGents(col.isGents !== false);
    setShowColForm(true);
  };

  // Save/Update Category
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const payload: Category = {
      id: editingCatId || `cat-${Date.now()}`,
      name: catName,
      description: catDesc || 'Product category description.',
      isGents: catIsGents
    };

    if (editingCatId) {
      onEditCategory(payload);
    } else {
      onAddCategory(payload);
    }

    // Reset
    setCatName('');
    setCatDesc('');
    setCatIsGents(true);
    setEditingCatId(null);
    setShowCatForm(false);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatIsGents(cat.isGents);
    setShowCatForm(true);
  };

  // Save/Update Product
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0 || !prodCollection) return;

    const imagesArray = [prodImage1, prodImage2, prodImage3].filter(img => img.trim() !== '');
    if (imagesArray.length === 0) {
      imagesArray.push('https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=600&h=800');
    }

    const payload: Product = {
      id: editingProdId || `prod-${Date.now()}`,
      name: prodName,
      shortDetails: prodShort || `${specStyle} Premium Collection`,
      description: prodDesc || 'Elegantly tailored traditional unstitched suit fabric with exquisite pattern design details.',
      price: prodPrice,
      images: imagesArray,
      category: prodCategory || 'Lawn Unstitched',
      collectionId: prodCollection,
      specifications: {
        'Fabric': specFabric || 'Premium Voile Lawn',
        'Dupatta': specDupatta || 'Silk Printed (2.5m)',
        'Shirt': specShirt || 'Printed Lawn (3m)',
        'Trouser': specTrouser || 'Cambric Cotton (2.5m)',
        'Style': specStyle
      },
      isLadiesSuit,
      ladiesSuitInfo: isLadiesSuit ? {
        shirt: ladiesShirtDetail || 'Premium Unstitched Front/Back - 3m',
        dupatta: ladiesDupattaDetail || 'Finished Dupatta Fabric - 2.5m',
        trouser: ladiesTrouserDetail || 'Cambric Cotton Base - 2.5m',
        fabricType: ladiesFabricType,
        embroideryDetails: ladiesEmbroidery || 'Fully digital printed floral layouts with soft, color-fast textures.'
      } : undefined,
      isNewArrival,
      isHotSelling,
      rating: 4.8
    };

    if (editingProdId) {
      onEditProduct(payload);
    } else {
      onAddProduct(payload);
      
      // Dispatch Simulated email notification on new product arrival!
      onSendProductNotification(payload.name, imagesArray[0]);
    }

    // Reset Form states
    setEditingProdId(null);
    setProdName('');
    setProdShort('');
    setProdDesc('');
    setProdPrice(0);
    setProdCategory('Printed Suits');
    setProdCollection('');
    setProdImage1('');
    setProdImage2('');
    setProdImage3('');
    
    setSpecFabric('');
    setSpecDupatta('');
    setSpecShirt('');
    setSpecTrouser('');
    setSpecStyle('Unstitched 3-Piece');

    setIsLadiesSuit(true);
    setLadiesShirtDetail('');
    setLadiesDupattaDetail('');
    setLadiesTrouserDetail('');
    setLadiesFabricType('Lawn & Silk');
    setLadiesEmbroidery('');

    setIsNewArrival(true);
    setIsHotSelling(false);
    
    setShowProdForm(false);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProdId(prod.id);
    setProdName(prod.name);
    setProdShort(prod.shortDetails);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdCategory(prod.category);
    setProdCollection(prod.collectionId);
    
    setProdImage1(prod.images[0] || '');
    setProdImage2(prod.images[1] || '');
    setProdImage3(prod.images[2] || '');

    setSpecFabric(prod.specifications['Fabric'] || '');
    setSpecDupatta(prod.specifications['Dupatta'] || '');
    setSpecShirt(prod.specifications['Shirt'] || '');
    setSpecTrouser(prod.specifications['Trouser'] || '');
    setSpecStyle(prod.specifications['Style'] || 'Unstitched 3-Piece');

    setIsLadiesSuit(!!prod.isLadiesSuit);
    if (prod.ladiesSuitInfo) {
      setLadiesShirtDetail(prod.ladiesSuitInfo.shirt || '');
      setLadiesDupattaDetail(prod.ladiesSuitInfo.dupatta || '');
      setLadiesTrouserDetail(prod.ladiesSuitInfo.trouser || '');
      setLadiesFabricType(prod.ladiesSuitInfo.fabricType || 'Lawn & Silk');
      setLadiesEmbroidery(prod.ladiesSuitInfo.embroideryDetails || '');
    }

    setIsNewArrival(!!prod.isNewArrival);
    setIsHotSelling(!!prod.isHotSelling);

    setShowProdForm(true);
  };

  // --- Home Banner Form Handlers ---
  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setBannerImageError('The image is too large! Please upload a compressed photo under 1MB.');
      return;
    }

    setBannerImageError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setBannerImage(reader.result);
      }
    };
    reader.onerror = () => {
      setBannerImageError('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImage.trim()) {
      setBannerImageError('Banner must have an image!');
      return;
    }

    const payload: HomeBanner = {
      id: editingBannerId || `banner-${Date.now()}`,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      ctaText: bannerCtaText,
      image: bannerImage,
      targetView: bannerTargetView,
      targetPayload: bannerTargetPayload,
      badge: bannerBadge,
      isActive: bannerIsActive,
      order: Number(bannerOrder) || 0
    };

    if (editingBannerId) {
      await onUpdateBanner(editingBannerId, payload);
    } else {
      await onAddBanner(payload);
    }

    resetBannerForm();
  };

  const startEditBanner = (banner: HomeBanner) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerCtaText(banner.ctaText);
    setBannerImage(banner.image);
    setBannerTargetView(banner.targetView || 'home');
    setBannerTargetPayload(banner.targetPayload || '');
    setBannerBadge(banner.badge);
    setBannerIsActive(banner.isActive);
    setBannerOrder(banner.order);
    setBannerImageError('');

    // Dynamically calculate the appropriate banner link type
    if (banner.targetView === 'home' || !banner.targetView) {
      setBannerLinkType('none');
    } else if (banner.targetView === 'collection') {
      const parentCol = collections.find(c => c.id === banner.targetPayload);
      if (parentCol && parentCol.isGents) {
        setBannerLinkType('gents-collection');
      } else {
        setBannerLinkType('ladies-collection');
      }
    } else if (banner.targetView === 'category') {
      const isGentsCat = ['Shalwar Kameez', 'Wash & Wear', 'Cotton Suits', 'Casual Wear', 'Premium Suits'].includes(banner.targetPayload);
      if (isGentsCat) {
        setBannerLinkType('gents-category');
      } else {
        setBannerLinkType('ladies-category');
      }
    } else {
      setBannerLinkType('none');
    }

    setShowBannerForm(true);
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerCtaText('Shop Collection');
    setBannerImage('');
    setBannerTargetView('home');
    setBannerTargetPayload('');
    setBannerBadge('EID SPECIAL');
    setBannerIsActive(true);
    setBannerOrder(banners.length);
    setBannerImageError('');
    setBannerLinkType('none');
    setShowBannerForm(false);
  };

  // If Admin is not logged in, showcase secure locks form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6 animate-fade-in" id="admin-login-screen">
        <div className="w-16 h-16 bg-[#1e152a] rounded-full flex items-center justify-center border-2 border-[#c5a880] mx-auto text-[#c5a880] shadow-md">
          <Lock size={26} />
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-[#1e152a]">Al-Hamd Fabrics Admin Console</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Strict Authorised Entry Only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-gray-100 rounded-xl p-6 shadow-md text-left space-y-4">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded font-medium flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Enter Admin Security Key</label>
            <input
              type="password"
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs text-center tracking-widest"
              id="admin-passfield"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1e152a] text-white text-xs font-bold rounded hover:bg-[#c5a880] hover:text-black transition-colors uppercase tracking-wider cursor-pointer shadow-sm"
              id="admin-login-submit"
            >
              Log In
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400">
          Note: This terminal logs IP, login timestamps, and modifications automatically for security and auditing.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="admin-main-console">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 mb-8 border-b border-[#e1d9cd]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e152a] rounded-full flex items-center justify-center border border-[#c5a880]">
            <Settings className="text-[#c5a880] animate-spin" size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-extrabold text-[#1e152a]">Admin Control Hub</h1>
            <p className="text-gray-400 text-[10px] sm:text-xs">
              Manga Mandi Headquarters | Lahore, Pakistan (Owner Zafar Iqbal logs)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Store View
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold bg-[#1e152a] hover:bg-red-700 text-[#f1ebd9] rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      {/* Grid container layout for Sidebar Nav + Selected Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Admin sidebar (Grid-Columns: 3) */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl p-4 shadow-3xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-2.5 mb-2">Management Tabs</span>

          <button
            onClick={() => setCurrentTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'orders' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[#c5a880]" />
              Manage Orders
            </span>
            {pendingOrdersCount > 0 && (
              <span className="bg-[#c5a880] text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse uppercase">
                {pendingOrdersCount} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('reviews')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'reviews' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={14} className="text-[#c5a880]" />
              Approve Reviews
            </span>
            {pendingReviewsCount > 0 && (
              <span className="bg-[#c5a880] text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-bounce uppercase">
                {pendingReviewsCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('banners')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'banners' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye size={14} className="text-[#c5a880]" />
              Home Page Banners
            </span>
            {banners.length > 0 && (
              <span className="bg-[#c5a880]/20 text-[#c5a880] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                {banners.length} Banners
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('collections')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'collections' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#c5a880]" />
              Manage Collections
            </span>
            {collections.length > 0 && (
              <span className="bg-[#c5a880]/20 text-[#c5a880] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                {collections.length} Cols
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('categories')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'categories' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <Tag size={14} className="text-[#c5a880]" />
              Manage Categories
            </span>
            {categories.length > 0 && (
              <span className="bg-[#c5a880]/20 text-[#c5a880] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                {categories.length} Cats
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('subscribers')}
            className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentTab === 'subscribers' ? 'bg-[#1e152a] text-[#f1ebd9]' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={14} className="text-[#c5a880]" />
              Subscribers & Logs
            </span>
            {subscriptions.length > 0 && (
              <span className="bg-[#c5a880]/20 text-[#c5a880] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                {subscriptions.length} Subs
              </span>
            )}
          </button>
        </div>

        {/* Selected Dashboard Detail Panel (Grid-Columns: 9) */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-3xs">
          
          {/* TAB 1:ORDERS MANAGEMENT */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter grid pane */}
              <div className="p-4 bg-stone-50 rounded-xl border border-gray-200/60 text-xs space-y-4">
                <div className="flex items-center gap-1 pb-2 border-b border-gray-200/60 text-gray-700 font-serif font-bold text-sm">
                  <Filter size={15} className="text-[#c5a880]" />
                  <span>Configure Active Orders Queries</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Status Query</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="all">Display All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="On The Way">On The Way</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Date Period Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Date Window Period</label>
                    <select
                      value={datePeriod}
                      onChange={(e) => setDatePeriod(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="all">Lifetime Records</option>
                      <option value="lasthour">Last Decidual Hour</option>
                      <option value="today">Today (Past 24 Hrs)</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="lastmonth">Last Calendar Month</option>
                      <option value="custom">Custom Specified Range</option>
                    </select>
                  </div>

                  {/* Empty Spacer */}
                  <div className="hidden md:block" />

                  {/* Custom Calendar bounds */}
                  {datePeriod === 'custom' && (
                    <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Lower Date Bound</label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded focus:outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Upper Date Bound</label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Orders count layout summary */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  Showing <strong>{filteredOrders.length}</strong> order invoice records matching filters
                </span>
                {(statusFilter !== 'all' || datePeriod !== 'all') && (
                  <button
                    onClick={() => { setStatusFilter('all'); setDatePeriod('all'); }}
                    className="text-[#c5a880] font-bold hover:underline"
                  >
                    Reset Filter Queries
                  </button>
                )}
              </div>

              {/* Main Orders listing accordion */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
                  <span className="text-4xl">🧾</span>
                  <h3 className="font-serif font-bold text-sm text-gray-800 mt-2">No Matching Invoices Found</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                    Select a wider date coverage or status filters in order query panels above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl bg-[#faf9f6]/30 overflow-hidden shadow-2xs">
                      {/* Top ribbon header */}
                      <div className="p-4 bg-stone-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-[#1e152a] font-mono text-[13px]">{order.id}</strong>
                          <span className="text-gray-400 block sm:inline sm:ml-2">
                            Placing: {new Date(order.createdAt).toLocaleString('en-PK')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.status === 'Delivered' && !order.isReceived && (
                            <button
                              type="button"
                              onClick={() => {
                                const key = 'order-received-' + order.id;
                                if (activeConfirmKey === key) {
                                  onMarkOrderReceived(order.id);
                                  setActiveConfirmKey(null);
                                } else {
                                  setActiveConfirmKey(key);
                                  setTimeout(() => setActiveConfirmKey(null), 5000);
                                }
                              }}
                              className={`py-1 px-2.5 font-extrabold text-[9px] sm:text-[10px] uppercase rounded-lg shadow-2xs transition-all tracking-wider cursor-pointer font-sans shrink-0 ${
                                activeConfirmKey === 'order-received-' + order.id
                                  ? 'bg-amber-500 text-black animate-bounce'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                              }`}
                            >
                              {activeConfirmKey === 'order-received-' + order.id ? '⚠️ Tap again to confirm!' : '✓ Received Parcel'}
                            </button>
                          )}

                          {order.isReceived && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-sm text-[9px] font-extrabold tracking-wide uppercase">
                              🎉 CONFIRMED RECEIVED
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                          }`}>
                            💳 {order.paymentMethod.toUpperCase() === 'STRIPE' ? 'STRIPE' : 'COD'} ({order.paymentStatus})
                          </span>

                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-2 py-1 font-bold rounded-lg border text-[10px] uppercase shadow-2xs focus:outline-none cursor-pointer ${
                              order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                              order.status === 'Cancelled' ? 'bg-red-50 border-red-300 text-red-600' :
                              order.status === 'Pending' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' :
                              'bg-amber-50 border-amber-300 text-amber-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="On The Way">On The Way</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Info split body */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        <div className="md:col-span-4 space-y-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Recipient Ledger</span>
                          {order.isReceived ? (
                            <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-lg text-[10px] font-sans space-y-1 animate-fade-in">
                              <span className="font-bold block uppercase text-[8px] tracking-wider text-emerald-600">🎉 DATA CLEANED / RECEIVED</span>
                              <p className="text-gray-500 font-normal leading-relaxed">
                                Personal shipping numbers, recipient name, and address details have been permanently cleared from database logs.
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold text-gray-800">{order.customerName}</p>
                              <p className="text-gray-600 flex items-center gap-1.5 mt-1 font-mono">
                                📞 Phone: <strong>{order.phoneNumber}</strong>
                              </p>
                              {order.whatsappNumber && (
                                <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                                  💬 WhatsApp: <strong>{order.whatsappNumber}</strong>
                                </p>
                              )}
                              <p className="text-gray-500 mt-1 leading-relaxed">
                                📍 {order.address}, {order.city}, {order.province}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Dispatch list items */}
                        <div className="md:col-span-5 space-y-2 border-t md:border-t-0 md:border-x border-gray-100 pt-3 md:pt-0 md:px-4">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Invoiced Outfits</span>
                          <div className="space-y-2">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-3 font-sans pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                {it.selectedImage && (
                                  <img
                                    src={it.selectedImage}
                                    alt={it.productName}
                                    className="w-12 h-16 object-cover bg-stone-100 rounded border border-gray-200 shrink-0 shadow-2xs"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 line-clamp-2 select-all leading-tight">
                                    {it.productName}
                                  </p>
                                  <p className="text-gray-500 text-[10px] mt-1">
                                    Qty: <strong className="text-gray-800">{it.quantity}</strong> × {formatPKR(it.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Invoice summary billing */}
                        <div className="md:col-span-3 text-right space-y-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold text-right">Invoice Sum</span>
                          {order.isReceived ? (
                            <div className="text-xs space-y-1">
                              <span className="text-gray-400 block">Personal billing redacted</span>
                              <strong className="text-emerald-700 block bg-emerald-50 p-1.5 rounded border border-emerald-100/45 text-[10px] text-center font-mono">
                                Total: {formatPKR(order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0))}
                              </strong>
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-500">
                                <span>Subtotal:</span> &nbsp;<strong className="text-gray-700">{formatPKR(order.subtotal)}</strong>
                              </div>
                              <div className="text-gray-500">
                                <span>Delivery Surcharge:</span> &nbsp;<strong className="text-gray-700">{formatPKR(order.deliveryCharges)}</strong>
                              </div>
                              <div className="text-sm font-bold pt-1.5 border-t border-[#f1ebd9] text-[#1e152a]">
                                <span>Grand Total:</span> &nbsp;<span className="text-[#c5a880] text-sm font-extrabold">{formatPKR(order.total)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEWS MANAGEMENT APPROVALS */}
          {currentTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1e152a]">Verify customer reviews before publishing</h3>
                  <p className="text-xs text-gray-400">
                    To maintain store integrity, all incoming buyer reviews must be audited and published manually.
                  </p>
                </div>
                <span className="bg-[#1e152a] text-white px-3 py-1 font-bold text-xs rounded-full">
                  Pending approvals: {reviews.filter(r => !r.approved).length}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 border border-dashed rounded-xl border-gray-100">
                  <span className="text-4xl">💬</span>
                  <h4 className="font-serif font-bold text-sm text-gray-800 mt-2">No Active testimonials submitted yet</h4>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                  {reviews.map(rev => (
                    <div
                      key={rev.id}
                      className={`p-4 border rounded-xl text-xs space-y-2 animate-fade-in transition-all ${
                        rev.approved ? 'border-gray-100 bg-[#faf9f6]/30' : 'border-amber-200 bg-amber-50/20 shadow-2xs'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-gray-800 text-sm block">{rev.customerName}</strong>
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                            Product Reviewed: <strong className="text-gray-600 italic">"{rev.productName}"</strong>
                          </span>
                        </div>

                        {/* Status tag badges */}
                        <div className="flex gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded-sm font-bold uppercase text-[8px] tracking-widest ${
                            rev.approved ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                          }`}>
                            {rev.approved ? 'APPROVED & LIVE' : 'AWAITING APPROVAL'}
                          </span>

                          <div className="text-amber-500 flex gap-0.5 scale-90">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Check key={i} size={10} className={`w-3 h-3 fill-amber-500 ${i < rev.rating ? 'opacity-100' : 'opacity-20'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 font-sans italic p-2.5 bg-white border border-gray-100/50 rounded leading-relaxed">
                        "{rev.comment}"
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Submitted Log timestamp: {new Date(rev.createdAt).toLocaleString()}</span>
                        
                        <div className="flex gap-1.5 shrink-0">
                          {!rev.approved && (
                            <button
                              onClick={() => { onApproveReview(rev.id); }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1 transition-colors uppercase cursor-pointer"
                            >
                              <Check size={11} />
                              Approve & Publish
                            </button>
                          )}
                          <button
                            onClick={() => { onRejectReview(rev.id); }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded flex items-center gap-1 transition-colors uppercase cursor-pointer"
                          >
                            <X size={11} />
                            {rev.approved ? 'Revoke Review' : 'Reject & Delete'}
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2.5: HOME PAGE BANNERS MANAGEMENT */}
          {currentTab === 'banners' && (
            <div className="space-y-6 animate-fade-in">
              {/* CUSTOM IN-UI DELETE CONFIRMATION MODAL */}
              {bannerIdToDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-center border border-gray-100">
                    <span className="text-3xl inline-block mt-1">🗑️</span>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-gray-900 text-base">Delete Banner?</h4>
                      <p className="text-stone-400 text-xs leading-relaxed">
                        This action will immediately remove this custom banner from the active slider carousel in the storefront.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setBannerIdToDelete(null)}
                        className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold text-xs rounded-md uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        No, Keep it
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const id = bannerIdToDelete;
                          setBannerIdToDelete(null);
                          onDeleteBanner(id);
                        }}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
                      >
                        Delete Banner
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1e152a]">Home Carousel Slider Banners</h3>
                  <p className="text-xs text-gray-400">
                    Upload new gallery photos, configure gorgeous titles and descriptions, customize button names, and link slides to categories/collections.
                  </p>
                </div>
                {!showBannerForm && (
                  <button
                    onClick={() => {
                      resetBannerForm();
                      setShowBannerForm(true);
                    }}
                    className="px-4 py-2 bg-[#1e152a] hover:bg-[#c5a880] text-white hover:text-black font-semibold text-xs rounded flex items-center gap-1.5 transition-all uppercase cursor-pointer"
                  >
                    <Plus size={14} />
                    Add New Banner
                  </button>
                )}
              </div>

              {/* BANNER EDIT / CREATE FORM */}
              {showBannerForm && (
                <form onSubmit={handleBannerSubmit} className="p-5 bg-stone-50 border border-gray-200/60 rounded-xl space-y-4 text-xs animate-slide-up">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                    <h4 className="font-serif font-bold text-sm text-gray-800">
                      {editingBannerId ? '✏️ Rewrite Slider Banner' : '✨ Design New Home Slide Banner'}
                    </h4>
                    <button
                      type="button"
                      onClick={resetBannerForm}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Slide Display Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gents Exclusive Cotton Collection"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ribbon Badge Tag Text</label>
                      <input
                        type="text"
                        placeholder="e.g. EID 2026, BEST SELLER, REGIONAL SPEC"
                        value={bannerBadge}
                        onChange={(e) => setBannerBadge(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    {/* Description/Subtitle */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Short Description / Subtitle *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Provide detailed description of this Eid collection suit or discount offer..."
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    {/* Image Upload Option */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Slider Photo * (Upload directly from device gallery or paste direct link URL)
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div className="md:col-span-2 space-y-2">
                          {/* File input */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageUpload}
                            className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                          />
                          {/* Fallback link input */}
                          <input
                            type="text"
                            placeholder="Or paste direct image URL here..."
                            value={bannerImage.startsWith('data:image/') ? '' : bannerImage}
                            onChange={(e) => {
                              if (e.target.value.trim()) {
                                setBannerImage(e.target.value);
                              }
                            }}
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                          />
                        </div>

                        {/* Image Preview Window */}
                        <div className="h-28 border border-gray-200/80 rounded bg-white flex items-center justify-center overflow-hidden relative group">
                          {bannerImage ? (
                            <>
                              <img src={bannerImage} alt="Banner Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setBannerImage('')}
                                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 font-mono text-[9px]">Preview Grid</span>
                          )}
                        </div>
                      </div>

                      {bannerImageError && (
                        <p className="text-red-600 font-semibold text-[10px] sm:text-xs mt-1.5">{bannerImageError}</p>
                      )}
                    </div>

                    {/* Link View Target (Step 1: Selecting the Gender & Category/Collection Sector) */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Where does this banner lead to? *
                      </label>
                      <select
                        value={bannerLinkType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setBannerLinkType(val);
                          
                          if (val === 'none') {
                            setBannerTargetView('home');
                            setBannerTargetPayload('');
                          } else if (val === 'gents-collection') {
                            setBannerTargetView('collection');
                            const gentsCols = collections.filter(c => c.isGents);
                            setBannerTargetPayload(gentsCols.length > 0 ? gentsCols[0].id : '');
                          } else if (val === 'ladies-collection') {
                            setBannerTargetView('collection');
                            const ladiesCols = collections.filter(c => !c.isGents);
                            setBannerTargetPayload(ladiesCols.length > 0 ? ladiesCols[0].id : '');
                          } else if (val === 'gents-category') {
                            setBannerTargetView('category');
                            setBannerTargetPayload('Cotton Suits');
                          } else if (val === 'ladies-category') {
                            setBannerTargetView('category');
                            setBannerTargetPayload('2 Piece');
                          }
                        }}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded font-semibold text-gray-800 cursor-pointer focus:outline-none focus:border-[#c5a880]"
                      >
                        <option value="none">✨ Simple Static Banner (No Redirection Link)</option>
                        <option value="gents-collection">🧔 Gents Collection</option>
                        <option value="gents-category">👔 Gents Categories</option>
                        <option value="ladies-collection">👩 Ladies Collection</option>
                        <option value="ladies-category">👗 Ladies Categories</option>
                      </select>
                    </div>

                    {/* Link Target Payload (Step 2: Selecting the exact item from the filtered items) */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Select Destination Target *
                      </label>
                      
                      {bannerLinkType === 'none' && (
                        <input
                          type="text"
                          disabled
                          placeholder="No redirection needed"
                          value="Informational Banner only"
                          className="w-full bg-gray-100 border border-gray-150 px-3 py-2 rounded text-gray-400 italic"
                        />
                      )}

                      {bannerLinkType === 'gents-collection' && (
                        <select
                          required
                          value={bannerTargetPayload}
                          onChange={(e) => setBannerTargetPayload(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer font-medium focus:outline-none focus:border-[#c5a880]"
                        >
                          <option value="">-- Choose Gents Collection --</option>
                          {collections.filter(c => c.isGents).map(col => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      )}

                      {bannerLinkType === 'ladies-collection' && (
                        <select
                          required
                          value={bannerTargetPayload}
                          onChange={(e) => setBannerTargetPayload(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer font-medium focus:outline-none focus:border-[#c5a880]"
                        >
                          <option value="">-- Choose Ladies Collection --</option>
                          {collections.filter(c => !c.isGents).map(col => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      )}

                      {bannerLinkType === 'gents-category' && (
                        <select
                          required
                          value={bannerTargetPayload}
                          onChange={(e) => setBannerTargetPayload(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer font-medium focus:outline-none focus:border-[#c5a880]"
                        >
                          {['Shalwar Kameez', 'Wash & Wear', 'Cotton Suits', 'Casual Wear', 'Premium Suits'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      )}

                      {bannerLinkType === 'ladies-category' && (
                        <select
                          required
                          value={bannerTargetPayload}
                          onChange={(e) => setBannerTargetPayload(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer font-medium focus:outline-none focus:border-[#c5a880]"
                        >
                          {['2 Piece', '3 Piece', 'Lawn Collection', 'Pret Wear', 'Embroidered'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Custom Button text CTA */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5 align-middle">
                        <input
                          type="checkbox"
                          checked={bannerCtaText !== ''}
                          onChange={(e) => {
                            setBannerCtaText(e.target.checked ? 'Shop Collection' : '');
                          }}
                          className="rounded cursor-pointer"
                        />
                        <span>Enable Call-To-Action Button</span>
                      </label>
                      {bannerCtaText !== '' ? (
                        <input
                          type="text"
                          placeholder="Button label: Like Buy Now, Visit, Purchase"
                          value={bannerCtaText}
                          onChange={(e) => setBannerCtaText(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none mt-1"
                        />
                      ) : (
                        <input
                          type="text"
                          disabled
                          placeholder="CTA Button is hidden"
                          className="w-full bg-gray-100 border border-gray-200 px-3 py-2 rounded mt-1"
                        />
                      )}
                      {bannerCtaText !== '' && (
                        <div className="flex gap-1.5 mt-1">
                          {['Shop Collection', 'Buy Now', 'Visit', 'Purchase'].map(btnText => (
                            <button
                              key={btnText}
                              type="button"
                              onClick={() => setBannerCtaText(btnText)}
                              className="px-1.5 py-0.5 border border-stone-200 hover:border-[#c5a880] rounded-sm text-[8px] bg-[#faf9f6]/80 text-stone-500 hover:text-black"
                            >
                              {btnText}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Order and Active state */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sorting Order</label>
                        <input
                          type="number"
                          value={bannerOrder}
                          onChange={(e) => setBannerOrder(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded text-center focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col justify-center pl-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-3.5 align-middle">
                          <input
                            type="checkbox"
                            checked={bannerIsActive}
                            onChange={(e) => setBannerIsActive(e.target.checked)}
                            className="rounded cursor-pointer"
                          />
                          <span>Visible On Site</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200/50">
                    <button
                      type="button"
                      onClick={resetBannerForm}
                      className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50 uppercase cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#1e152a] text-white hover:bg-[#c5a880] hover:text-black text-xs font-bold rounded transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      {editingBannerId ? 'Update Permanent Slide' : 'Commit Permanent Slide'}
                    </button>
                  </div>
                </form>
              )}

              {/* BANNERS INVENTORY LIST */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#1e152a] pb-2 border-b border-stone-100">
                  Active Carousel Banners ({banners.length})
                </h4>

                {banners.length === 0 ? (
                  <div className="bg-[#faf9f6]/40 border border-dashed border-stone-200 rounded-xl py-12 px-4 text-center space-y-2">
                    <span className="text-3xl">🖼️</span>
                    <h5 className="font-serif font-bold text-gray-700 text-sm">No Custom Banners Uploaded</h5>
                    <p className="text-stone-400 text-xs max-w-sm mx-auto">
                      The active storefront will automatically loop through the default pre-set "Gents Eid cotton suits" and "Ladies Premium Shawls" slides.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {banners.map((slide) => (
                      <div
                        key={slide.id}
                        className={`p-4 bg-white border rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between text-xs transition-all ${
                          slide.isActive ? 'border-stone-200 shadow-3xs' : 'border-dashed border-stone-200 opacity-60 bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Visual Thumbnail */}
                          <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 border border-stone-200 relative shrink-0">
                            <img src={slide.image} alt={slide.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">
                              #{slide.order}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {/* Badge & Title */}
                            <div className="flex items-center gap-1.5">
                              {slide.badge && (
                                <span className="bg-[#c5a880] text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase leading-none">
                                  {slide.badge}
                                </span>
                              )}
                              <span className={`text-[8px] tracking-wider font-bold uppercase rounded px-1.5 py-0.5 leading-none ${
                                slide.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-stone-150 text-stone-600 border border-stone-200'
                              }`}>
                                {slide.isActive ? 'ACTIVE LINK ON HOME' : 'DRAFT INACTIVE'}
                              </span>
                            </div>
                            
                            <h5 className="font-serif font-bold text-gray-800 text-sm leading-snug">{slide.title}</h5>
                            
                            {slide.subtitle && (
                              <p className="text-stone-400 text-[10px] line-clamp-1">{slide.subtitle}</p>
                            )}
                            
                            {/* CTA & Targets */}
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-stone-500 font-mono mt-1 leading-none">
                              {slide.ctaText && (
                                <span className="flex items-center gap-1">
                                  <span>Button label:</span>
                                  <strong className="text-stone-700 italic">"{slide.ctaText}"</strong>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <span>Redirection views:</span>
                                <span className="bg-stone-50 px-1 py-0.5 text-stone-600 border border-stone-100/60 rounded uppercase text-[8px]">
                                  {slide.targetView} {slide.targetPayload && `→ ${slide.targetPayload}`}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => startEditBanner(slide)}
                            className="p-2 border border-stone-200 rounded text-stone-600 hover:text-black hover:border-yellow-400 hover:bg-amber-50/20 cursor-pointer"
                            title="Edit this banner"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setBannerIdToDelete(slide.id)}
                            className="p-2 border border-stone-200 rounded text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/20 cursor-pointer"
                            title="Delete Banner"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT CATALOG (Add / Edit / Delete Products - REMOVED BY REQUEST) */}
          {false && (
            <div className="space-y-6 animate-fade-inOffice">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1e152a]">Inventory Store Catalog</h3>
                  <p className="text-xs text-gray-400">
                    Add new arrivals, configure ladies' unstitched specifications, edit prices or delete entries instantly.
                  </p>
                </div>
                {!showProdForm && (
                  <button
                    onClick={() => {
                      setEditingProdId(null);
                      setShowProdForm(true);
                    }}
                    className="py-2.5 px-4 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black font-bold uppercase text-xs tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add New Suit
                  </button>
                )}
              </div>

              {/* Add/Edit Product Block Form */}
              {showProdForm && (
                <form onSubmit={handleProductSubmit} className="p-5 bg-stone-50 border border-gray-200 rounded-xl text-xs space-y-4 animate-fade-in leading-relaxed">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <h4 className="font-serif font-bold text-md text-[#1e152a]">
                      {editingProdId ? 'Modify Suit Specification Ledger' : 'Register New Unstitched / Lawn Suit'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowProdForm(false)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Product Title / Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Traditional Embroidered Lawn Suit"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Price (PKR) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2850"
                        value={prodPrice || ''}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Short Details (appears as subtitle) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 Piece Unstitched Suit with Silk Dupatta"
                        value={prodShort}
                        onChange={(e) => setProdShort(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Target Category Catalog</label>
                      <input
                        type="text"
                        placeholder="e.g. Printed Suits, Winter Khaddar, Silk, Wedding"
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Link to Collection *</label>
                      <select
                        required
                        value={prodCollection}
                        onChange={(e) => setProdCollection(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded focus:outline-none cursor-pointer"
                      >
                        <option value="">Select linked collection...</option>
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Primary Image URL *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={prodImage1}
                        onChange={(e) => setProdImage1(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Additional Gallery Image 2 URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={prodImage2}
                        onChange={(e) => setProdImage2(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Additional Gallery Image 3 URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={prodImage3}
                        onChange={(e) => setProdImage3(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Long Formal Description</label>
                      <textarea
                        rows={3}
                        placeholder="Explain weave pattern, color fastness, shrinkage parameters, style layouts..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Suit Specs Grid parameters */}
                  <div className="p-4 bg-white/60 border border-gray-200 rounded-lg space-y-3">
                    <span className="font-bold block uppercase text-[10px] tracking-wide text-gray-500">Quick Specs Sheet values</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-[#555] font-semibold">Fabric type</label>
                        <input type="text" placeholder="e.g. Lawn, Karandi, Silk" value={specFabric} onChange={(e) => setSpecFabric(e.target.value)} className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#555] font-semibold">Dupatta Spec</label>
                        <input type="text" placeholder="e.g. Chiffon printed (2.5m)" value={specDupatta} onChange={(e) => setSpecDupatta(e.target.value)} className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#555] font-semibold">Shirt fabric</label>
                        <input type="text" placeholder="e.g. Embroidered (3m)" value={specShirt} onChange={(e) => setSpecShirt(e.target.value)} className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#555] font-semibold">Trouser fabric</label>
                        <input type="text" placeholder="e.g. Dyed Cambric (2.5m)" value={specTrouser} onChange={(e) => setSpecTrouser(e.target.value)} className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#555] font-semibold">Style layout</label>
                        <input type="text" placeholder="e.g. Unstitched 3-piece" value={specStyle} onChange={(e) => setSpecStyle(e.target.value)} className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Switch trigger if ladies suit */}
                  <div className="flex items-center justify-between p-2 pb-0">
                    <span className="font-bold text-gray-700">Is this a Ladies Suit?</span>
                    <button
                      type="button"
                      onClick={() => setIsLadiesSuit(!isLadiesSuit)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        isLadiesSuit ? 'bg-[#1e152a]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                        isLadiesSuit ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {isLadiesSuit && (
                    <div className="p-4 bg-[#c5a880]/5 rounded-lg border border-[#c5a880]/20 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in leading-relaxed">
                      <span className="col-span-1 sm:col-span-2 font-serif font-bold text-xs text-[#1e152a] uppercase tracking-wide mb-1 border-b pb-1.5 border-[#c5a880]/10">
                        Ladies Suit detailed fabric specs
                      </span>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Shirt Cut Length *</label>
                        <input
                          type="text"
                          placeholder="e.g. Embroidered swiss front with printed back - 3m"
                          value={ladiesShirtDetail}
                          onChange={(e) => setLadiesShirtDetail(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Dupatta cut length *</label>
                        <input
                          type="text"
                          placeholder="e.g. Pure chiffon printed - 2.5m"
                          value={ladiesDupattaDetail}
                          onChange={(e) => setLadiesDupattaDetail(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Trouser size details *</label>
                        <input
                          type="text"
                          placeholder="e.g. Dyed cambric cotton with patches - 2.5m"
                          value={ladiesTrouserDetail}
                          onChange={(e) => setLadiesTrouserDetail(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Fabric Type *</label>
                        <input
                          type="text"
                          placeholder="e.g. Swiss Lawn, Raw Silk, Karandi"
                          value={ladiesFabricType}
                          onChange={(e) => setLadiesFabricType(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-[11px]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Embroidery & Threadwork detailed descriptions *</label>
                        <textarea
                          placeholder="e.g. Hand embellished tila work neckline, cross-stitch wool border on dupatta..."
                          value={ladiesEmbroidery}
                          onChange={(e) => setLadiesEmbroidery(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-[11px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Selection checkboxes */}
                  <div className="flex gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 font-bold text-gray-600">
                      <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="rounded cursor-pointer" />
                      Add to "New Arrivals"
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-gray-600">
                      <input type="checkbox" checked={isHotSelling} onChange={(e) => setIsHotSelling(e.target.checked)} className="rounded cursor-pointer" />
                      Add to "Hot Selling Grid"
                    </label>
                  </div>

                  {!editingProdId && (
                    <div className="bg-amber-100/50 p-2 text-amber-900 border border-amber-200 rounded text-[10px] leading-relaxed">
                      💡 <strong>Notification Hook Trigger:</strong> Dispatches a newsletter notification dispatch simulator alert automatically to all <strong>{subscriptions.length}</strong> subscribed emails!
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProdForm(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded text-gray-700 font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#1e152a] text-white hover:bg-[#c5a880] hover:text-black font-extrabold rounded uppercase tracking-wider cursor-pointer"
                    >
                      {editingProdId ? 'Update Suit Entry' : 'Publish & Broadcast Suit'}
                    </button>
                  </div>
                </form>
              )}

              {/* Products table list view */}
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-3xs text-xs">
                <div className="bg-stone-50 px-4 py-3 border-b border-gray-100 grid grid-cols-12 font-serif font-bold text-gray-700">
                  <div className="col-span-6">Suit Title & Collection</div>
                  <div className="col-span-3">Category Tag</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-1 text-center">Delete</div>
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1 no-scrollbar bg-[white]">
                  {products.map(prod => {
                    const linkedCol = collections.find(c => c.id === prod.collectionId);
                    return (
                      <div
                        key={prod.id}
                        className="px-4 py-3 grid grid-cols-12 items-center hover:bg-[#faf9f6]/30 transition-colors animate-fade-in"
                      >
                        <div className="col-span-6 flex gap-3 items-center min-w-0 pr-2">
                          <img
                            src={prod.images[0] || 'https://picsum.photos/seed/p/100/100'}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-12 rounded object-cover flex-none bg-gray-50 border"
                          />
                          <div className="truncate">
                            <strong className="text-gray-800 truncate block text-sm leading-tight hover:text-[#c5a880] transition-colors">{prod.name}</strong>
                            <span className="text-[10px] text-gray-400 font-semibold block mt-1 tracking-wide uppercase">
                              Linked: {linkedCol?.name || 'Unlinked'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 text-gray-500 font-semibold truncate capitalize">
                          {prod.category}
                        </div>

                        <div className="col-span-2 text-right font-bold text-[#1e152a] font-sans">
                          {formatPKR(prod.price)}
                        </div>

                        <div className="col-span-1 flex gap-1 justify-center">
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const key = 'delete-prod-' + prod.id;
                              if (activeConfirmKey === key) {
                                onDeleteProduct(prod.id);
                                setActiveConfirmKey(null);
                              } else {
                                setActiveConfirmKey(key);
                                setTimeout(() => setActiveConfirmKey(null), 4000);
                              }
                            }}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              activeConfirmKey === 'delete-prod-' + prod.id
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 animate-pulse'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                            title={activeConfirmKey === 'delete-prod-' + prod.id ? "Click again to confirm" : "Delete product"}
                          >
                            {activeConfirmKey === 'delete-prod-' + prod.id ? (
                              <span className="text-[9px] font-extrabold tracking-tight px-0.5 uppercase leading-none">TAP TO CONFIRM</span>
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: EDIT COLLECTIONS */}
          {currentTab === 'collections' && (
            <div className="space-y-6 animate-fade-in leading-relaxed">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1e152a]">Manage Circular Collections</h3>
                  <p className="text-xs text-gray-400">
                    Create collection groups. These appear in the horizontal layout directly below navbar on the homepage!
                  </p>
                </div>
                {!showColForm && (
                  <button
                    onClick={() => {
                      setEditingColId(null);
                      setShowColForm(true);
                    }}
                    className="py-2 px-3.5 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black font-bold uppercase text-xs tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> New Collection
                  </button>
                )}
              </div>

              {/* INTERACTIVE GUIDED DELETE ASSISTANT */}
              <div className="bg-stone-50 border-2 border-dashed border-[#c5a880]/30 rounded-xl p-5 mb-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Trash2 size={18} className="text-red-600 animate-pulse" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1e152a]">Guided Deletion Assistant (Mandi HQ Safeguard)</h4>
                    <p className="text-[10px] text-gray-400">Select which classification type you would like to securely delete, then choose the item from the dropdown below.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('gents-col');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'gents-col'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">🧔</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Gents Collection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('gents-cat');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'gents-cat'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👔</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Gents Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('ladies-col');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'ladies-col'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👩</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Ladies Collection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('ladies-cat');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'ladies-cat'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👗</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Ladies Category</span>
                  </button>
                </div>

                {deleteWizardType && (
                  <div className="p-3 bg-white border border-gray-250 rounded-lg space-y-3 animate-fade-in text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-[#c5a880] uppercase tracking-wide mb-1">
                        Select Lead Item to Delete
                      </label>
                      <select
                        value={deleteWizardSelectedId}
                        onChange={(e) => setDeleteWizardSelectedId(e.target.value)}
                        className="w-full bg-white border border-gray-250 px-3 py-2 rounded focus:outline-none focus:border-[#c5a880] cursor-pointer font-medium"
                      >
                        <option value="">-- Choose item below --</option>
                        {deleteWizardType === 'gents-col' &&
                          collections
                            .filter((c) => c.isGents !== false)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                🧔 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'ladies-col' &&
                          collections
                            .filter((c) => !c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👩 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'gents-cat' &&
                          categories
                            .filter((c) => c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👔 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'ladies-cat' &&
                          categories
                            .filter((c) => !c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👗 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                      </select>
                    </div>

                    {deleteWizardSelectedId && (
                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 animate-slide-up bg-red-50/40 p-2.5 rounded border border-red-150">
                        <div className="text-[10px] text-red-800 font-medium">
                          ⚠️ <strong>CRITICAL DATA REMOVAL ACTION:</strong> This will delete this specific entry from the database. This action is irreversible.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId) {
                              if (deleteWizardType === 'gents-col' || deleteWizardType === 'ladies-col') {
                                onDeleteCollection(deleteWizardSelectedId);
                              } else {
                                onDeleteCategory(deleteWizardSelectedId);
                              }
                              setDeleteWizardSelectedId('');
                              setDeleteWizardType(null);
                              setActiveConfirmKey(null);
                            } else {
                              setActiveConfirmKey('guided-delete-' + deleteWizardSelectedId);
                              setTimeout(() => setActiveConfirmKey(null), 5500);
                            }
                          }}
                          className={`py-1.5 px-4 rounded font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer shadow-xs shrink-0 ${
                            activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-[#1e152a] text-white hover:bg-red-600'
                          }`}
                        >
                          {activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId ? 'TAP ONCE MORE TO CONFIRM' : '✓ Secure Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Col editing form */}
              {showColForm && (
                <form onSubmit={handleCollectionSubmit} className="p-5 bg-stone-50 border border-gray-200 rounded-xl text-xs space-y-4 animate-fade-in">
                  <h4 className="font-serif font-bold text-md text-[#1e152a] border-b border-[#e1d9cd]/50 pb-2">
                    {editingColId ? 'Configure Collection Specs' : 'Register New Collection'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Collection Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lawn Embroidered Collection"
                        value={colName}
                        onChange={(e) => setColName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Gender Designation *</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setColIsGents(true)}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all border ${
                            colIsGents 
                              ? 'bg-[#1e152a] border-[#1e152a] text-[#f1ebd9]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          👔 Gents
                        </button>
                        <button
                          type="button"
                          onClick={() => setColIsGents(false)}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all border ${
                            !colIsGents 
                              ? 'bg-[#1e152a] border-[#1e152a] text-[#f1ebd9]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          👗 Ladies
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Circle Thumbnail Image *</label>
                      {colImage && (
                        <div className="flex items-center gap-3 p-2 bg-white border rounded-lg shadow-3xs">
                          <img src={colImage} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#c5a880] bg-[#fff] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-700 block truncate">Selected Thumbnail</span>
                            <span className="text-[8px] text-gray-400 font-mono block truncate">
                              {colImage.startsWith('data:') ? '📂 Encoded Device Image' : colImage}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setColImage('')}
                            className="text-red-650 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 text-[9px] uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-[#c5a880]/30 hover:border-[#c5a880] rounded-lg cursor-pointer bg-white transition-all text-[11px] font-bold text-gray-750">
                          <Upload size={14} className="text-[#c5a880] animate-bounce" />
                          <span>Choose from device gallery</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setColImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste direct image URL fallback..."
                          value={colImage.startsWith('data:') ? '' : colImage}
                          onChange={(e) => setColImage(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none placeholder-gray-350 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Large Header Banner Image *</label>
                      {colBanner && (
                        <div className="p-2.5 bg-white border rounded-lg shadow-3xs space-y-2">
                          <div className="h-24 w-full rounded-lg overflow-hidden bg-gray-50 border relative">
                            <img src={colBanner} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setColBanner('')}
                              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded cursor-pointer shadow-md transition-all"
                            >
                              Remove Banner
                            </button>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono block truncate">
                            {colBanner.startsWith('data:') ? '📂 Encoded Large Device Banner' : colBanner}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-[#c5a880]/30 hover:border-[#c5a880] rounded-lg cursor-pointer bg-white transition-all text-[11px] font-bold text-gray-750 text-center">
                          <Upload size={14} className="text-[#c5a880] animate-bounce" />
                          <span>Choose Banner Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setColBanner(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste direct banner/cover URL fallback..."
                          value={colBanner.startsWith('data:') ? '' : colBanner}
                          onChange={(e) => setColBanner(e.target.value)}
                          className="sm:col-span-2 bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none placeholder-gray-350 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Short collection tagline description</label>
                      <textarea
                        rows={2}
                        placeholder="Briefly state fabric quality and collection target weather styles..."
                        value={colDesc}
                        onChange={(e) => setColDesc(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowColForm(false)}
                      className="flex-1 py-2 border rounded font-semibold text-gray-700 uppercase hover:bg-gray-50 cursor-pointer"
                    >
                      Close Form
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#1e152a] text-white hover:bg-[#c5a880] hover:text-black font-extrabold rounded uppercase tracking-wider cursor-pointer"
                    >
                      {editingColId ? 'Save Specs' : 'Publish Collection'}
                    </button>
                  </div>
                </form>
              )}

              {/* Collections table list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {collections.map(col => (
                  <div key={col.id} className="border border-gray-100 rounded-xl overflow-hidden p-3 bg-stone-50 flex items-center justify-between hover:shadow-xs transition-shadow">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <img src={col.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#c5a880] flex-none bg-[#fff]" />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <strong className="text-gray-800 text-sm font-bold truncate block">{col.name}</strong>
                          <span className="text-[8px] font-extrabold px-1 py-0.5 rounded bg-[#c5a880]/15 text-[#c5a880] shrink-0 uppercase tracking-tight">
                            {col.isGents !== false ? 'Gents' : 'Ladies'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5 truncate">{col.description}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0 pl-1">
                      <button
                        onClick={() => startEditCollection(col)}
                        className="p-1 text-gray-400 hover:text-[#c5a880] rounded cursor-pointer"
                        title="Edit collection specs"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          const key = 'delete-col-' + col.id;
                          if (activeConfirmKey === key) {
                            onDeleteCollection(col.id);
                            setActiveConfirmKey(null);
                          } else {
                            setActiveConfirmKey(key);
                            setTimeout(() => setActiveConfirmKey(null), 4000);
                          }
                        }}
                        className={`p-1 rounded transition-all cursor-pointer ${
                          activeConfirmKey === 'delete-col-' + col.id
                            ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={activeConfirmKey === 'delete-col-' + col.id ? "Click again to confirm" : "Delete collection"}
                      >
                        {activeConfirmKey === 'delete-col-' + col.id ? (
                          <span className="text-[9px] font-extrabold tracking-tight px-0.5 uppercase leading-none">TAP TO CONFIRM</span>
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EDIT CATEGORIES */}
          {currentTab === 'categories' && (
            <div className="space-y-6 animate-fade-in leading-relaxed text-xs">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1e152a]">Manage Dynamic Categories</h3>
                  <p className="text-xs text-gray-400">
                    Create product categories. Easily assign them to Ladies or Gents classifications, appearing directly in the site menus!
                  </p>
                </div>
                {!showCatForm && (
                  <button
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatDesc('');
                      setCatIsGents(true);
                      setShowCatForm(true);
                    }}
                    className="py-2 px-3.5 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black font-bold uppercase text-xs tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> New Category
                  </button>
                )}
              </div>

              {/* INTERACTIVE GUIDED DELETE ASSISTANT */}
              <div className="bg-stone-50 border-2 border-dashed border-[#c5a880]/30 rounded-xl p-5 mb-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Trash2 size={18} className="text-red-600 animate-pulse" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1e152a]">Guided Deletion Assistant (Mandi HQ Safeguard)</h4>
                    <p className="text-[10px] text-gray-400">Select which classification type you would like to securely delete, then choose the item from the dropdown below.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('gents-col');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'gents-col'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">🧔</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Gents Collection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('gents-cat');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'gents-cat'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👔</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Gents Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('ladies-col');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'ladies-col'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👩</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Ladies Collection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteWizardType('ladies-cat');
                      setDeleteWizardSelectedId('');
                    }}
                    className={`p-2.5 rounded border text-center transition-all cursor-pointer ${
                      deleteWizardType === 'ladies-cat'
                        ? 'bg-[#1e152a] text-[#f1ebd9] border-[#1e152a] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-105'
                    }`}
                  >
                    <span className="block text-[14px] mb-1">👗</span>
                    <span className="block text-[10px] uppercase font-bold tracking-tight text-gray-800">Ladies Category</span>
                  </button>
                </div>

                {deleteWizardType && (
                  <div className="p-3 bg-white border border-gray-250 rounded-lg space-y-3 animate-fade-in text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-[#c5a880] uppercase tracking-wide mb-1">
                        Select Lead Item to Delete
                      </label>
                      <select
                        value={deleteWizardSelectedId}
                        onChange={(e) => setDeleteWizardSelectedId(e.target.value)}
                        className="w-full bg-white border border-gray-250 px-3 py-2 rounded focus:outline-none focus:border-[#c5a880] cursor-pointer font-medium"
                      >
                        <option value="">-- Choose item below --</option>
                        {deleteWizardType === 'gents-col' &&
                          collections
                            .filter((c) => c.isGents !== false)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                🧔 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'ladies-col' &&
                          collections
                            .filter((c) => !c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👩 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'gents-cat' &&
                          categories
                            .filter((c) => c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👔 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                        {deleteWizardType === 'ladies-cat' &&
                          categories
                            .filter((c) => !c.isGents)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                👗 {c.name} ({c.description.substring(0, 40)}...)
                              </option>
                            ))}
                      </select>
                    </div>

                    {deleteWizardSelectedId && (
                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 animate-slide-up bg-red-50/40 p-2.5 rounded border border-red-150">
                        <div className="text-[10px] text-red-800 font-medium">
                          ⚠️ <strong>CRITICAL DATA REMOVAL ACTION:</strong> This will delete this specific entry from the database. This action is irreversible.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId) {
                              if (deleteWizardType === 'gents-col' || deleteWizardType === 'ladies-col') {
                                onDeleteCollection(deleteWizardSelectedId);
                              } else {
                                onDeleteCategory(deleteWizardSelectedId);
                              }
                              setDeleteWizardSelectedId('');
                              setDeleteWizardType(null);
                              setActiveConfirmKey(null);
                            } else {
                              setActiveConfirmKey('guided-delete-' + deleteWizardSelectedId);
                              setTimeout(() => setActiveConfirmKey(null), 5500);
                            }
                          }}
                          className={`py-1.5 px-4 rounded font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer shadow-xs shrink-0 ${
                            activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-[#1e152a] text-white hover:bg-red-600'
                          }`}
                        >
                          {activeConfirmKey === 'guided-delete-' + deleteWizardSelectedId ? 'TAP ONCE MORE TO CONFIRM' : '✓ Secure Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cat editing form */}
              {showCatForm && (
                <form onSubmit={handleCategorySubmit} className="p-5 bg-stone-50 border border-gray-200 rounded-xl space-y-4 animate-fade-in text-xs">
                  <h4 className="font-serif font-bold text-md text-[#1e152a] border-b border-[#e1d9cd]/50 pb-2">
                    {editingCatId ? 'Configure Category Specs' : 'Register New Category'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Silk Dupatta"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Gender Belonging *</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCatIsGents(true)}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all border ${
                            catIsGents 
                              ? 'bg-[#1e152a] border-[#1e152a] text-[#f1ebd9]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          👔 Gents Category
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatIsGents(false)}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all border ${
                            !catIsGents 
                              ? 'bg-[#1e152a] border-[#1e152a] text-[#f1ebd9]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          👗 Ladies Category
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Small Tagline / Description *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Elegant printed chiffon or silk dupatta sets..."
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCatForm(false)}
                      className="flex-1 py-2 border rounded font-semibold text-gray-700 uppercase hover:bg-gray-50 cursor-pointer text-xs"
                    >
                      Close Form
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#1e152a] text-white hover:bg-[#c5a880] hover:text-black font-extrabold rounded uppercase tracking-wider cursor-pointer text-xs"
                    >
                      {editingCatId ? 'Save Specs' : 'Publish Category'}
                    </button>
                  </div>
                </form>
              )}

              {/* Categories table list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden p-3 bg-stone-50 flex items-center justify-between hover:shadow-xs transition-shadow">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-gray-800 text-xs font-serif font-bold truncate block">{cat.name}</strong>
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100/30 text-amber-800 uppercase tracking-tight font-sans">
                          {cat.isGents ? '👔 Gents' : '👗 Ladies'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{cat.description}</p>
                    </div>
                    
                    <div className="flex gap-0.5 shrink-0 pl-1 border-l border-gray-200/40">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-1 text-gray-400 hover:text-[#c5a880] rounded cursor-pointer"
                        title="Edit category details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          const key = 'delete-cat-' + cat.id;
                          if (activeConfirmKey === key) {
                            onDeleteCategory(cat.id);
                            setActiveConfirmKey(null);
                          } else {
                            setActiveConfirmKey(key);
                            setTimeout(() => setActiveConfirmKey(null), 4000);
                          }
                        }}
                        className={`p-1 rounded transition-all cursor-pointer ${
                          activeConfirmKey === 'delete-cat-' + cat.id
                            ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={activeConfirmKey === 'delete-cat-' + cat.id ? "Click again to confirm" : "Delete category"}
                      >
                        {activeConfirmKey === 'delete-cat-' + cat.id ? (
                          <span className="text-[9px] font-extrabold tracking-tight px-0.5 uppercase leading-none">CONFIRM</span>
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIBERS LIST AND NEWSLETTER BROADCAST LOGS */}
          {currentTab === 'subscribers' && (
            <div className="space-y-6 animate-fade-in leading-relaxed text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-lg text-[#1e152a]">Subscribed Customers & Email Dispatch Logs</h3>
                <p className="text-xs text-gray-400">
                  Track customers who opted into newsletters, and inspect automated notifications fired on product publishing!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left panel: Active Subscribers (Grid-Columns: 5) */}
                <div className="lg:col-span-5 bg-stone-50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-gray-800 flex items-center gap-1.5 border-b pb-2">
                    <Users size={16} className="text-[#c5a880]" />
                    Registered Subscribers ({subscriptions.length})
                  </h4>

                  {subscriptions.length === 0 ? (
                    <div className="text-center py-10 bg-white border border-gray-100 rounded-lg">
                      <span className="text-2xl">📪</span>
                      <p className="text-[11px] text-gray-400 mt-1">No subscribers recorded yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar bg-white p-3 rounded-lg border border-gray-100">
                      {subscriptions.map(sub => (
                        <div key={sub.id} className="pt-2 first:pt-0 space-y-0.5">
                          <strong className="text-gray-800 block">{sub.customerName || 'Anonymous Friend'}</strong>
                          <span className="text-gray-500 font-mono text-[10px] block">{sub.email}</span>
                          <span className="text-[9px] text-gray-400 font-light block">Opt-in on: {new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right panel: Broadcast Log ledger (Grid-Columns: 7) */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#1e152a] flex items-center gap-1.5 border-b pb-2">
                    <Mail size={16} className="text-[#c5a880]" />
                    Automated Broadcast Histories ({notifications.length})
                  </h4>

                  {notifications.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-gray-100">
                      <p className="text-gray-400 text-xs text-center">
                        Add a new product entry from the "Product Catalog" tab to fire automated email dispatches automatically!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                      {notifications.map(logs => (
                        <div key={logs.id} className="p-3 border border-gray-100 bg-[#faf9f6]/30 rounded-xl space-y-2 animate-fade-in">
                          <div className="flex justify-between items-center bg-white p-1 rounded border">
                            <div className="flex items-center gap-2">
                              <img src={logs.productImage} alt="" className="w-8 h-10 rounded object-cover" />
                              <div>
                                <strong className="text-gray-800 font-serif leading-none text-xs block">"{logs.productName}"</strong>
                                <span className="font-sans text-[10px] text-gray-400 block mt-1">Status: Dispatched</span>
                              </div>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-1 font-bold rounded-sm border border-emerald-100">
                              💌 Sent successful
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                            <span>Target: {logs.recipientsCount} Active Inbox{logs.recipientsCount !== 1 ? 'es' : ''} Lahore</span>
                            <span>Date: {new Date(logs.sentAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
