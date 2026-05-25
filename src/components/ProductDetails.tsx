import React, { useState } from 'react';
import { Star, Shield, RefreshCw, ChevronLeft, Calendar, User, MessageSquare, Plus, ShoppingCart, Send, Truck } from 'lucide-react';
import { Product, Review } from '../types';
import { formatPKR } from '../utils';

interface ProductDetailsProps {
  product: Product;
  allReviews: Review[];
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedImage: string) => void;
  onOrderNow: (product: Product, quantity: number, selectedImage: string) => void;
  onSubmitReview: (productId: string, customerName: string, rating: number, comment: string) => void;
}

export default function ProductDetails({
  product,
  allReviews,
  onBack,
  onAddToCart,
  onOrderNow,
  onSubmitReview
}: ProductDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');

  // Get only approved reviews for this product
  const approvedReviews = allReviews.filter(
    (rev) => rev.productId === product.id && rev.approved
  );

  const imagesList = product.images.length > 0 ? product.images : [
    'https://picsum.photos/seed/fabric1/600/800',
    'https://picsum.photos/seed/fabric2/600/800',
    'https://picsum.photos/seed/fabric3/600/800'
  ];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    onSubmitReview(product.id, reviewName, reviewRating, reviewComment);
    
    // Clear form and show feedback
    setReviewName('');
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccessMessage('Alhamdulillah! Your review has been submitted. It will appear publicly as soon as it is approved by the admin.');
    
    setTimeout(() => {
      setReviewSuccessMessage('');
    }, 8000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id={`product-detail-view-${product.id}`}>
      
      {/* Back button and navigation breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#e1d9cd] rounded-full text-xs font-semibold text-[#1e152a] hover:bg-[#faf9f6] hover:border-[#c5a880] transition-all cursor-pointer shadow-2xs"
          id="detail-back-button"
        >
          <ChevronLeft size={16} />
          Back to Catalog
        </button>
        <div className="text-xs text-gray-500">
          Home / Collections / <span className="text-[#c5a880] font-semibold">{product.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-xs">
        
        {/* Left Column: Image Gallery (Grid-Columns: 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] bg-[#faf9f6] rounded-xl overflow-hidden border border-gray-100 shadow-2xs group">
            {/* Main Stage Image */}
            <img
              src={imagesList[selectedImageIndex]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
            />
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 bg-[#1e152a] text-[#f1ebd9] text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-xs">
                NEW ARRIVAL
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`flex-none w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-gray-50 ${
                  idx === selectedImageIndex ? 'border-[#c5a880] scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Key purchase components (Grid-Columns: 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-[#c5a880] uppercase tracking-widest block mb-2">
              {product.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1e152a] font-extrabold leading-tight tracking-tight">
              {product.name}
            </h1>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed italic">
              {product.shortDetails || 'Premium high-end dress fabric with timeless details.'}
            </p>

            {/* Ratings Summary */}
            <div className="flex items-center gap-4 mt-4 py-2 border-y border-gray-100">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i <= Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}
                  />
                ))}
                <span className="text-sm font-bold text-gray-800 ml-1 mt-0.5">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-400">
                | &nbsp;{approvedReviews.length} Verified Customer Review{approvedReviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Price display container */}
            <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#e1d9cd] mt-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-semibold block uppercase">Our Special Price</span>
                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#100c18]">
                  {formatPKR(product.price)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  In Stock (Available)
                </span>
              </div>
            </div>

            {/* Large full description */}
            <div className="mt-5">
              <h3 className="font-serif font-bold text-[#1e152a] text-md mb-2">Product Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-sans font-light">
                {product.description}
              </p>
            </div>

            {/* Special Ladies Suit Specifications layout */}
            {product.isLadiesSuit && product.ladiesSuitInfo && (
              <div className="mt-6 bg-[#1e152a]/5 border border-[#1e152a]/15 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1e152a]/15 pb-2">
                  <span className="w-2.5 h-2.5 bg-[#c5a880] rounded-sm" />
                  <h4 className="font-serif font-bold text-[#1e152a] text-sm tracking-wide uppercase">
                    Ladies Suit Premium Specifications
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  {product.ladiesSuitInfo.shirt && (
                    <div>
                      <span className="text-gray-400 font-medium block">Shirt Fabric Details:</span>
                      <strong className="text-gray-700">{product.ladiesSuitInfo.shirt}</strong>
                    </div>
                  )}
                  {product.ladiesSuitInfo.dupatta && (
                    <div>
                      <span className="text-gray-400 font-medium block">Dupatta Material Details:</span>
                      <strong className="text-gray-700">{product.ladiesSuitInfo.dupatta}</strong>
                    </div>
                  )}
                  {product.ladiesSuitInfo.trouser && (
                    <div>
                      <span className="text-gray-400 font-medium block">Trouser Specifications:</span>
                      <strong className="text-gray-700">{product.ladiesSuitInfo.trouser}</strong>
                    </div>
                  )}
                  {product.ladiesSuitInfo.fabricType && (
                    <div>
                      <span className="text-gray-400 font-medium block">Fabric Sourced Sizing:</span>
                      <strong className="text-gray-700 capitalize">{product.ladiesSuitInfo.fabricType}</strong>
                    </div>
                  )}
                  {product.ladiesSuitInfo.embroideryDetails && (
                    <div className="sm:col-span-2 border-t border-dashed border-[#1e152a]/10 pt-2.5">
                      <span className="text-gray-400 font-medium block">Intricate Threadwork Details:</span>
                      <strong className="text-[#100c18] font-medium block leading-relaxed mt-0.5">
                        {product.ladiesSuitInfo.embroideryDetails}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Extra Specifications Table */}
            <div className="mt-6 border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <span className="font-serif text-xs font-semibold text-gray-700 uppercase tracking-wider">Suit Specifications Grid</span>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 px-4 py-2.5 text-xs font-sans">
                    <span className="text-gray-400 font-medium">{key}</span>
                    <span className="text-gray-800 font-bold col-span-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout triggers and actions container */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            {/* Quantities selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase">Quantity:</span>
              <div className="flex items-center border border-[#e1d9cd] rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold transition-all text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-[#1e152a] font-bold text-sm w-12 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold transition-all text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
              {quantity > 1 && (
                <span className="text-xs font-semibold text-gray-400">
                  Total item amount: {formatPKR(product.price * quantity)}
                </span>
              )}
            </div>

            {/* CTA Buy/Cart Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => onAddToCart(product, quantity, imagesList[selectedImageIndex])}
                className="w-full py-4 px-6 border-2 border-[#1e152a] text-[#1e152a] hover:bg-[#1e152a] hover:text-white font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs rounded-xs"
              >
                <ShoppingCart size={16} />
                Add To Cart
              </button>
              
              <button
                onClick={() => onOrderNow(product, quantity, imagesList[selectedImageIndex])}
                className="w-full py-4 px-6 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black font-extrabold uppercase text-xs tracking-widest transition-all shadow-md transform active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer rounded-xs"
              >
                🔥 Order Now (Direct Checkout)
              </button>
            </div>

            {/* Guaranteed Trust badge icons */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="p-3 bg-[#faf9f6] rounded-lg border border-gray-100 flex flex-col items-center">
                <Shield size={16} className="text-[#c5a880] mb-1" />
                <span className="text-[10px] font-bold text-[#1e152a]">100% Genuine</span>
                <span className="text-[9px] text-gray-400">Premium Fabrics Only</span>
              </div>
              <div className="p-3 bg-[#faf9f6] rounded-lg border border-gray-100 flex flex-col items-center">
                <RefreshCw size={16} className="text-[#c5a880] mb-1" />
                <span className="text-[10px] font-bold text-[#1e152a]">Easy Returns</span>
                <span className="text-[9px] text-gray-400">Within 7 Days S.O.P</span>
              </div>
              <div className="p-3 bg-[#faf9f6] rounded-lg border border-gray-100 flex flex-col items-center">
                <Truck size={16} className="text-[#c5a880] mb-1" />
                <span className="text-[10px] font-bold text-[#1e152a]">Swift Delivery</span>
                <span className="text-[9px] text-gray-400">Dispatch Across Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review system layout panel (Permanently Stored, Approved ones displayed) */}
      <h2 id="reviews-section-header" className="font-serif text-2xl text-[#1e152a] font-extrabold tracking-tight mt-16 mb-6 pb-2 border-b border-[#e1d9cd]">
        Customer Reviews & Testimonials
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel to submit feedback */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#1e152a]">Share Your Honest Experience</h3>
          <p className="text-xs text-gray-400">
            Write down details about the texture fallback, quality of the tila thread, dyeing quality or printing. Your critique directly benefits others!
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-1">
            {reviewSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-lg font-medium leading-relaxed animate-fade-in">
                {reviewSuccessMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Maria Bibi / Saira Rasheed"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fabric Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className="p-1 cursor-pointer transition-transform duration-100 hover:scale-120"
                  >
                    <Star
                      size={20}
                      className={stars <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Review Comment</label>
              <textarea
                rows={4}
                required
                placeholder="Explain fabric color fastness, shrinkage details or embroidery weight..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1e152a] text-white hover:bg-[#c5a880] hover:text-black font-bold uppercase text-[11px] tracking-widest rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send size={12} />
              Submit For Approval
            </button>
          </form>
        </div>

        {/* List of customer testimonials */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
            <h3 className="font-serif font-bold text-lg text-[#1e152a] mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#c5a880]" />
              Verified Buyers Feedbacks ({approvedReviews.length})
            </h3>

            {approvedReviews.length === 0 ? (
              <div className="text-center py-12 bg-[#faf9f6] rounded-xl border border-dashed border-gray-100">
                <span className="text-4xl">🌸</span>
                <h4 className="font-serif font-bold text-md text-[#1e152a] mt-3">Be the first to write a review!</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  Ensure to buy this high standard unstitched {product.name} suit and share your genuine review about fabric density and colors.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {approvedReviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1e152a]/5 border border-[#1e152a]/10 flex items-center justify-center text-xs font-bold text-[#1e152a]">
                          {rev.customerName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            {rev.customerName}
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-emerald-100 inline-block font-sans">
                              Verified Buyer
                            </span>
                          </h4>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Display reviewer stars */}
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 font-sans font-light leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
