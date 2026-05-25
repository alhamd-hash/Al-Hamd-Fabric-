import React, { useState } from 'react';
import { CreditCard, ShoppingBag, Truck, Check, HelpCircle, ShieldCheck, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Product, Order } from '../types';
import { formatPKR, calculateDeliveryCharges } from '../utils';

interface CheckoutFormProps {
  cart: { product: Product; quantity: number; selectedImage: string }[];
  onSubmitOrder: (formData: any) => Promise<string>; // returns the new orderId
  onCancel: () => void;
  onClearCart: () => void;
}

export default function CheckoutForm({
  cart,
  onSubmitOrder,
  onCancel,
  onClearCart
}: CheckoutFormProps) {
  // Customer details form state
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Punjab');
  const [address, setAddress] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');

  // Stripe Card Input Details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [stripeError, setStripeError] = useState('');

  // Order state handling
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [orderIdCreated, setOrderIdCreated] = useState('');
  const [purchasedSnapshot, setPurchasedSnapshot] = useState<{ name: string; quantity: number; price: number }[]>([]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryCharges = calculateDeliveryCharges(subtotal);
  const grandTotal = subtotal + deliveryCharges;

  // Masking functions for Stripe card input dummy values
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(val);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim() || !city.trim() || !address.trim()) {
      return;
    }

    if (paymentMethod === 'stripe') {
      const parsedNum = cardNumber.replace(/\s/g, '');
      if (parsedNum.length < 16) {
        setStripeError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setStripeError('Please enter a valid MM/YY expiration date.');
        return;
      }
      if (cardCvv.length < 3) {
        setStripeError('Please enter your 3-digit CVV number.');
        return;
      }
      setStripeError('');
    }

    // Begin Stripe/Checkout Simulation process
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'stripe') {
        setProcessingStep('Initiating secure Stripe Gateway handshakes...');
        await new Promise((r) => setTimeout(r, 1200));

        setProcessingStep('Validating Credit details with Stripe standard ledger...');
        await new Promise((r) => setTimeout(r, 1000));

        setProcessingStep(`Authorizing transaction for ${formatPKR(grandTotal)}...`);
        await new Promise((r) => setTimeout(r, 1000));

        setProcessingStep('Card authorized! Saving checkout ledger values...');
        await new Promise((r) => setTimeout(r, 800));
      } else {
        setProcessingStep('Confirming your Order request ledger...');
        await new Promise((r) => setTimeout(r, 1200));
      }

      // Compile payload
      const orderPayload = {
        customerName,
        whatsappNumber,
        phoneNumber,
        city,
        province,
        address,
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' ? ('paid' as const) : ('pending' as const),
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedImage: item.selectedImage
        })),
        subtotal,
        deliveryCharges,
        total: grandTotal
      };

      setPurchasedSnapshot(cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })));

      const newId = await onSubmitOrder(orderPayload);
      setOrderIdCreated(newId);
    } catch (err) {
      console.error(err);
      setStripeError('Something went wrong during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If order was successfully completed, show checkout completion success panel!
  if (orderIdCreated) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in" id="order-success-screen">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-400 mx-auto text-emerald-500 shadow-xs animate-bounce">
          <Check size={32} className="stroke-[3]" />
        </div>
        
        <div className="space-y-1.5">
          <span className="text-xs text-amber-600 font-extrabold uppercase tracking-wide">ALHAMDULILLAH!</span>
          <h2 className="font-serif text-2xl font-extrabold text-[#1e152a] tracking-tight">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
            Your beautiful clothing selection is locked down! We have registered your inquiry and our team is preparing it for secure Lahore dispatch.
          </p>
        </div>

        <div className="bg-[#faf9f6] border-2 border-[#e1d9cd] rounded-2xl p-6 text-left max-w-md mx-auto space-y-4 shadow-xs relative overflow-hidden" id="invoice-receipt-card">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#c5a880]/5 rounded-bl-full pointer-events-none" />
          
          <div className="text-center pb-3 border-b border-[#e1d9cd]/50">
            <h3 className="font-serif font-extrabold text-sm uppercase text-[#1e152a] tracking-widest">
              Al-Hamd Fabrics
            </h3>
            <span className="text-[10px] text-gray-400 font-sans block mt-0.5 tracking-wider uppercase font-light">
              Lahore Premium Heritage • Sourced Manga Mandi
            </span>
          </div>

          <div className="text-xs space-y-2.5 text-gray-600">
            <div className="flex justify-between items-center bg-[#1e152a]/5 p-2 rounded border border-[#e1d9cd]/40">
              <span className="font-bold uppercase text-[9px] text-[#1e152a]">Order Code:</span>
              <strong className="text-[#c5a880] font-mono text-sm leading-none select-all">{orderIdCreated}</strong>
            </div>

            <div className="space-y-1 mt-1 font-sans">
              <div className="flex justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Recipient Name:</span>
                <strong className="text-gray-900">{customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Contact Phone:</span>
                <strong className="text-gray-900 font-mono">{phoneNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Destination:</span>
                <strong className="text-gray-900">{city}, {province}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Payment Status:</span>
                <strong className="text-emerald-700 uppercase text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                  {paymentMethod === 'stripe' ? 'STRIPE (PAID)' : 'C.O.D (AWAITING)'}
                </strong>
              </div>
            </div>

            {/* List the purchased items snapshotted */}
            <div className="border-t border-b border-dashed border-[#e1d9cd] py-3 my-2 bg-stone-50/50 px-2.5 rounded-xl">
              <span className="text-[9px] font-extrabold uppercase text-[#c5a880] tracking-widest block mb-2">Invoiced Fabric Suites:</span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                {purchasedSnapshot.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-gray-700 font-sans gap-2 leading-tight">
                    <span className="truncate flex-1 font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-400 text-[10px] shrink-0">×{item.quantity}</span>
                    <strong className="text-gray-800 font-mono text-[11px] shrink-0">{formatPKR(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Price lines */}
            <div className="space-y-1 text-[11px] text-gray-650 pt-1">
              <div className="flex justify-between">
                <span>Fabric Subtotal:</span>
                <strong className="font-mono">{formatPKR(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Shipping Surcharge:</span>
                <strong className="font-mono text-gray-750">{formatPKR(deliveryCharges)}</strong>
              </div>
              <div className="flex justify-between text-[#1e152a] font-extrabold text-xs pt-2.5 border-t border-[#e1d9cd]/60">
                <span className="uppercase tracking-wider text-[10px] text-gray-900">Total Bill Due:</span>
                <span className="text-sm font-black text-[#c5a880] font-sans">{formatPKR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4 max-w-sm mx-auto font-sans">
          <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl text-center">
            <p className="text-[11px] text-[#c5a880] font-bold leading-relaxed">
              📸 PLEASE TAKE A SCREENSHOT OF THIS INVOICE RECEIPT!
            </p>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-light">
              Order Code is required for tracking. Use code <strong className="font-mono text-gray-800 select-all font-bold">{orderIdCreated}</strong> in the <strong>Track Order</strong> portal at the top menu to check live لاہور dispatch schedules.
            </p>
          </div>
          <button
            onClick={() => {
              onClearCart();
              onCancel();
            }}
            className="w-full py-3 bg-[#1e152a] text-[#f1ebd9] hover:bg-[#c5a880] hover:text-black font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="checkout-form-container">
      {/* Checkout Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#1e152a]/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
            <RefreshCw size={44} className="text-[#c5a880] animate-spin mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#1e152a]">Processing Checkout...</h3>
            <p className="text-xs text-gray-500 font-mono p-2 bg-[#faf9f6] border border-gray-100 rounded leading-relaxed animate-pulse">
              {processingStep}
            </p>
            <p className="text-[10px] text-gray-400">
              Please do lock your screen or reload. Connecting securely with standard APIs.
            </p>
          </div>
        </div>
      )}

      <h1 className="font-serif text-3xl text-[#1e152a] font-extrabold tracking-tight mb-8 pb-3 border-b border-[#e1d9cd]">
        Order Checkout & Dispatch Request
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Checkout Inputs (Grid-Columns: 7) */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Delivery Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 bg-[#c5a880] text-black font-bold text-[10px] rounded-full flex items-center justify-center">1</span>
              <h2 className="font-serif font-bold text-md text-[#1e152a] tracking-wide uppercase">Shipping & Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Recipient Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zafar Iqbal / Ayesha Bibi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Primary Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03001234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">WhatsApp Inquiry Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 03053131133"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Karachi, Manga Mandi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Province <span className="text-red-500">*</span></label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs text-gray-700"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa (KPK)">Khyber Pakhtunkhwa (KPK)</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Complete Delivery Address <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="House number, Street name, Mohallah, Area details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-gray-200 focus:border-[#c5a880] rounded focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Selector and Simulation */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 bg-[#c5a880] text-black font-bold text-[10px] rounded-full flex items-center justify-center">2</span>
              <h2 className="font-serif font-bold text-md text-[#1e152a] tracking-wide uppercase">Select Secured Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* COD */}
              <label className={`block px-5 py-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'border-[#1e152a] bg-[#1e152a]/5 shadow-2xs' : 'border-gray-200 hover:border-[#c5a880]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-[#100c18] focus:ring-[#c5a880] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm block text-gray-800">Cash On Delivery</span>
                      <span className="text-[10px] text-gray-400">Pay when suit reaches Lahore/Pakistan</span>
                    </div>
                  </div>
                  <Truck size={20} className={paymentMethod === 'cod' ? 'text-[#c5a880]' : 'text-gray-400'} />
                </div>
              </label>

              {/* Stripe Credit Card */}
              <label className={`block px-5 py-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'stripe' ? 'border-[#1e152a] bg-[#1e152a]/5 shadow-2xs' : 'border-gray-200 hover:border-[#c5a880]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="text-[#100c18] focus:ring-[#c5a880] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm block text-gray-800">Stripe Secure Card</span>
                      <span className="text-[10px] text-gray-400">Simulate seamless debit transaction</span>
                    </div>
                  </div>
                  <CreditCard size={20} className={paymentMethod === 'stripe' ? 'text-[#c5a880]' : 'text-gray-400'} />
                </div>
              </label>
            </div>

            {/* Seamless Stripe Card Simulator Form UI */}
            {paymentMethod === 'stripe' && (
              <div className="p-5 bg-stone-50 rounded-xl border border-gray-200/80 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-xs text-[#222] font-mono leading-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#6757df] rounded-full animate-ping" />
                    🔒 STRIPIFIED PROXIED SHEATH
                  </span>
                  <div className="flex gap-2">
                    {/* Tiny Stripe styled logo */}
                    <span className="bg-[#6757df] text-white font-bold px-2 py-0.5 rounded text-[9px] font-sans tracking-wide">
                      stripe
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#e2f0d9]/60 border border-[#b2cf9d] rounded text-emerald-800 text-[10px] font-mono leading-relaxed space-y-1">
                  <strong>💡 Stripe Sandbox Helper:</strong>
                  <p>You can simulate a verified secure transaction using the Stripe demo card coordinates below:</p>
                  <p>Card: <strong className="bg-[#faf9f6] px-1 font-sans rounded">4242 4242 4242 4242</strong> | Expiry: <strong className="bg-[#faf9f6] px-1 font-sans rounded">12/28</strong> | CVV: <strong className="bg-[#faf9f6] px-1 font-sans rounded">421</strong></p>
                </div>

                {stripeError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded font-medium flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{stripeError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Secure Credit Card Holder</label>
                    <input
                      type="text"
                      required={paymentMethod === 'stripe'}
                      placeholder="e.g. Zafar Iqbal"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#6757df] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required={paymentMethod === 'stripe'}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#6757df] outline-none font-mono"
                      />
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Expiration MM/YY</label>
                      <input
                        type="text"
                        required={paymentMethod === 'stripe'}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#6757df] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">CVV / CVC Code</label>
                      <input
                        type="password"
                        required={paymentMethod === 'stripe'}
                        placeholder="123"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#6757df] outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
                  <Lock size={12} className="text-[#a98d63]" />
                  <span>Fully encrypted 256-Bit Stripe Sandbox TLS Tunnel Sourced Lahore.</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-4 border border-[#e1d9cd] text-[#1e152a] hover:bg-gray-100 font-bold uppercase text-xs tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Back To Cart
            </button>
            <button
              type="submit"
              className="w-full py-4 bg-[#1e152a] hover:bg-emerald-700 text-white font-extrabold uppercase text-xs tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Submit Order ({formatPKR(grandTotal)})
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Right Column: Order Invoice details (Grid-Columns: 5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#1e152a] pb-3 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#c5a880]" />
            Checkout Ledger Overview
          </h3>

          {/* Cart items review */}
          <div className="divide-y divide-gray-100 max-h-[290px] overflow-y-auto pr-2 no-scrollbar">
            {cart.map((item, index) => (
              <div key={index} className="py-2.5 flex items-center gap-3 text-xs">
                <div className="w-12 h-16 rounded overflow-hidden flex-none bg-gray-50 border border-gray-100">
                  <img src={item.selectedImage} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.product.name}</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5 font-semibold">Qty: {item.quantity}</span>
                  <span className="text-gray-500 font-mono text-[10px] block mt-0.5">{formatPKR(item.product.price)} each</span>
                </div>
                <span className="font-bold text-gray-800 text-right shrink-0">
                  {formatPKR(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Settlement ledger rules */}
          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Items Subtotal:</span>
              <strong className="text-gray-800">{formatPKR(subtotal)}</strong>
            </div>
            
            <div className="flex justify-between text-gray-500 items-center">
              <span className="flex items-center gap-1.5">
                Delivery Surcharge:
                {subtotal > 6000 && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wide text-[9px] font-bold">
                    FREE LIMIT
                  </span>
                )}
              </span>
              <strong className={subtotal > 6000 ? 'text-emerald-600 line-through' : 'text-gray-800'}>
                {formatPKR(deliveryCharges)}
              </strong>
            </div>

            {deliveryCharges > 0 && (
              <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-lg text-amber-800 text-[10px] leading-relaxed">
                📢 Delivery becomes <strong>FREE automatically</strong> if your cart total exceeds <strong>PKR 6,000</strong>. Buy for {formatPKR(6001 - subtotal)} more to qualify!
              </div>
            )}

            <div className="pt-3.5 border-t border-gray-100 flex justify-between text-base font-bold text-[#1e152a]">
              <span>Settled Balance due:</span>
              <span className="text-[#c5a880] text-lg font-extrabold">{formatPKR(grandTotal)}</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-gray-400 font-light space-y-1">
            <div className="flex gap-2">
              <ShieldCheck size={14} className="text-[#c5a880] shrink-0" />
              <span>Standard delivery fee holds at 300 PKR across Pakistan.</span>
            </div>
            <div className="flex gap-2">
              <Lock size={14} className="text-[#c5a880] shrink-0" />
              <span>Full SSL support for Cash on Delivery and credit validation.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
