import React, { useState } from 'react';
import { X, Search, FileText, Calendar, CheckCircle2, ChevronRight, Truck, Info, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatPKR } from '../utils';

interface TrackOrderModalProps {
  onClose: () => void;
  allOrders: Order[];
  onMarkOrderReceived: (orderId: string) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Registered', desc: 'Awaiting admin processing' },
  { status: 'Confirmed', label: 'Inquiry Approved', desc: 'Fabric reserved and quality checked' },
  { status: 'Dispatched', label: 'Dispatched', desc: 'Passed to courier logistics Lahore' },
  { status: 'On The Way', label: 'On The Way', desc: 'Courier out for delivery nearby city' },
  { status: 'Delivered', label: 'Delivered Successfully', desc: 'Package handed over, thank you!' }
];

export default function TrackOrderModal({ onClose, allOrders, onMarkOrderReceived }: TrackOrderModalProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearch.trim()) return;

    // Filter order list based on Order Tracking Code input
    const cleanedSearch = orderSearch.trim().toUpperCase().replace(/#/g, '');
    const matched = allOrders.filter((ord) => {
      const cleanedOrdId = ord.id.trim().toUpperCase().replace(/#/g, '');
      return cleanedOrdId === cleanedSearch;
    });

    setSearchedOrders(matched);
  };

  const getStatusIndex = (currentStatus: OrderStatus): number => {
    if (currentStatus === 'Cancelled') return -1;
    return STATUS_STEPS.findIndex((step) => step.status === currentStatus);
  };

  return (
    <div className="fixed inset-0 bg-[#1e152a]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in" id="track-order-modal">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-[#faf9f6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="text-[#c5a880]" size={22} />
            <span className="font-serif font-extrabold text-[#1e152a] text-lg sm:text-xl">
              Track Your Order Status
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-black cursor-pointer"
            aria-label="Close tracking"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar flex-1">
          <p className="text-xs text-gray-500 leading-relaxed">
            Please enter your **Order Code** (e.g. <strong>AHF-123456</strong> or with #) that was generated for you on checkout screen. This helps you track live Lahore and nationwide courier dispatch logs.
          </p>

          {/* Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter your Order Code (e.g. AHF-123456)..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                required
                className="w-full pl-4 pr-10 py-3 bg-[#faf9f6] border border-[#e1d9cd] rounded-xl text-xs focus:outline-none focus:border-[#c5a880] text-[#1e152a] font-mono tracking-wide"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black hover:shadow font-bold uppercase text-[10px] sm:text-xs tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Search Resulting Panel */}
          {searchedOrders !== null && (
            <div className="space-y-6 pt-2 border-t border-gray-100">
              {searchedOrders.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-gray-100">
                  <span className="text-3xl">⚠️</span>
                  <h4 className="font-serif font-bold text-sm text-gray-800 mt-2">No Order Found!</h4>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1 col-span-2">
                    We could not find any registered order matching code <strong>"{orderSearch}"</strong>. Ensure the code matches the invoice perfectly.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest col-span-2">
                    Matching Order Record
                  </h4>

                  {searchedOrders.map((order) => {
                    const statusIndex = getStatusIndex(order.status);
                    const isCancelled = order.status === 'Cancelled';
                    const isFullyDelivered = order.status === 'Delivered';

                    return (
                      <div
                        key={order.id}
                        className="p-5 border border-gray-100 rounded-xl bg-[#faf9f6]/40 space-y-5 shadow-3xs animate-fade-in"
                      >
                        {/* Order info details summary */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-3 border-b border-gray-100 text-xs shadow-3xs">
                          <div>
                            <span className="text-gray-400 block font-medium">Tracking Order ID</span>
                            <strong className="text-gray-800 font-mono text-[13px]">{order.id}</strong>
                          </div>

                          <div>
                            <span className="text-gray-400 block font-medium">Placing Date</span>
                            <strong className="text-gray-800 flex items-center gap-1">
                              <Calendar size={12} className="text-[#c5a880]" />
                              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </strong>
                          </div>

                          {(!order.isReceived) && (
                            <div>
                              <span className="text-gray-400 block font-medium">Grand Checkout Total</span>
                              <strong className="text-[#c5a880] text-sm font-extrabold">{formatPKR(order.total)}</strong>
                            </div>
                          )}

                          <div>
                            <span className="text-gray-400 block font-medium">Recipient Name</span>
                            <strong className="text-gray-800">
                              {order.isReceived ? '🔒 SECURED / DELETED' : order.customerName || 'N/A'}
                            </strong>
                          </div>
                        </div>

                        {/* Order status tracking steppers */}
                        {isCancelled ? (
                          <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-start gap-2.5">
                            <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <strong>This Order has been Cancelled!</strong>
                              <p className="text-gray-500 mt-1">
                                For any queries regarding cancellations, please contact Owner Zafar Iqbal via WhatsApp at <strong>03053131133</strong>.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Delivery Progress Milestone</span>
                            
                            {/* Desktop timeline horizontal */}
                            <div className="hidden sm:flex items-center justify-between gap-1">
                              {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx <= statusIndex;
                                const isCurrent = idx === statusIndex;
                                
                                return (
                                  <React.Fragment key={step.status}>
                                    <div className="flex flex-col items-center flex-1 text-center relative">
                                      {/* Node circle */}
                                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isCompleted 
                                          ? 'bg-[#1e152a] border-[#c5a880] text-white scale-110 shadow-xs' 
                                          : 'bg-white border-gray-200 text-gray-300'
                                      }`}>
                                        {isCompleted ? (
                                          <CheckCircle2 size={13} className="text-[#c5a880]" />
                                        ) : (
                                          <span className="text-[10px] font-bold">{idx + 1}</span>
                                        )}
                                      </div>

                                      <span className={`text-[10px] font-bold mt-2 leading-tight block ${isCurrent ? 'text-[#c5a880]' : isCompleted ? 'text-[#1e152a]' : 'text-gray-400'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {idx < STATUS_STEPS.length - 1 && (
                                      <div className={`h-0.5 flex-1 mx-[-10px] top-3.5 relative transition-colors ${
                                        idx < statusIndex ? 'bg-[#c5a880]' : 'bg-gray-100'
                                      }`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* Mobile Vertical Stepper timeline list */}
                            <div className="sm:hidden space-y-4 pl-3.5 border-l-2 border-gray-100">
                              {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx <= statusIndex;
                                const isCurrent = idx === statusIndex;

                                return (
                                  <div key={step.status} className="relative pl-5">
                                    {/* Indicator node bubble */}
                                    <span className={`absolute -left-[24px] top-0.5 w-4 h-4 rounded-full border-2 ${
                                      isCompleted ? 'bg-[#1e152a] border-[#c5a880]' : 'bg-white border-gray-200'
                                    }`} />
                                    
                                    <div className="text-xs">
                                      <h5 className={`font-bold uppercase tracking-wider ${isCurrent ? 'text-[#c5a880]' : isCompleted ? 'text-[#1e152a]' : 'text-gray-400'}`}>
                                        {step.label}
                                      </h5>
                                      <p className="text-[10px] text-gray-500 font-light mt-0.5 leading-tight">{step.desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* HIGH-IMPACT GREEN BUTTON "YES, RECEIVED" WHEN STATUS IS DELIVERED AND NOT CONFIRMED YET */}
                        {isFullyDelivered && !order.isReceived && (
                          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3 shadow-3xs">
                            <div className="flex items-start gap-2.5">
                              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                              <div className="text-xs text-gray-700 leading-relaxed">
                                <strong className="text-emerald-800 font-serif text-sm block mb-0.5">Your fabric is delivered successfully!</strong>
                                confirm received to permanently delete your personal numbers and address details from our database logs for safety.
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onMarkOrderReceived(order.id);
                                setSearchedOrders(prev => prev ? prev.map(o => o.id === order.id ? { ...o, isReceived: true } : o) : null);
                              }}
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                            >
                              <CheckCircle2 size={15} />
                              Yes, Received / جی ہاں، پارسل مل گیا ہے
                            </button>
                          </div>
                        )}

                        {/* ALREADY RECEIVED CONFIRMED PRUNED SCREEN */}
                        {order.isReceived && (
                          <div className="p-4 bg-emerald-50 border border-dashed border-emerald-200 rounded-xl">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                              <div className="text-xs text-emerald-800 leading-relaxed font-medium">
                                <span>🎉 <strong>Parcel Received & Confirmed!</strong></span>
                                <p className="text-gray-500 font-normal mt-1 leading-relaxed">
                                  Thank you for your confirmation. All personal shipping numbers, names, and address details have been permanently cleared for privacy. Only the suit name, price, and placing date remain for reference.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Listed items preview */}
                        <div className="border-t border-gray-100 pt-3 text-xs space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Items Ordered</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.items.map((item, id) => (
                              <div key={id} className="bg-white border border-gray-100 p-2 rounded-xl flex items-center gap-3 font-sans shadow-3xs hover:border-[#c5a880]/30 transition-colors">
                                {item.selectedImage ? (
                                  <img
                                    src={item.selectedImage}
                                    alt={item.productName}
                                    className="w-12 h-16 object-cover bg-stone-100 rounded border border-gray-250 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-12 h-16 bg-stone-100 border border-gray-200 rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-450 font-serif">
                                    Suit
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-800 text-xs line-clamp-2 leading-tight">
                                    {item.productName}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    Qty: <strong className="text-gray-700">{item.quantity}</strong> × {formatPKR(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400">
          In case of delayed dispatches, call direct helpline <strong>03053131133</strong> during active business hours.
        </div>
      </div>
    </div>
  );
}
