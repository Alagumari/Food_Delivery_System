import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheck, FiPlus } from 'react-icons/fi';
import { selectCartItems, selectCartSubtotal, selectCartDeliveryFee, selectCartRestaurantId, clearCart } from '../../store/slices/cartSlice';
import { authAPI, ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when food arrives' },
  { value: 'upi', label: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'All major cards accepted' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectCartDeliveryFee);
  const restaurantId = useSelector(selectCartRestaurantId);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_address: '', city: '', pincode: '', label: 'home' });
  const [addingAddress, setAddingAddress] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const TAX = subtotal * 0.05;
  const total = subtotal + deliveryFee + TAX;

  useEffect(() => {
    if (items.length === 0) { navigate('/cart'); return; }
    authAPI.getAddresses().then((res) => {
      const addrs = res.data.results || res.data;
      setAddresses(addrs);
      const def = addrs.find((a) => a.is_default) || addrs[0];
      if (def) setSelectedAddress(def);
    }).catch(() => {});
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const res = await authAPI.addAddress(newAddress);
      const addr = res.data;
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddress(addr);
      setShowAddForm(false);
      setNewAddress({ full_address: '', city: '', pincode: '', label: 'home' });
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    toast.error('Please select a delivery address');
    return;
  }

  setPlacing(true);

  try {
    const orderData = {
      restaurant_id: restaurantId,
      items: items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        variant_id: item.variantId || null,
        addon_ids: [],
      })),
      delivery_address: selectedAddress.full_address,
      delivery_city: selectedAddress.city,
      delivery_pincode: selectedAddress.pincode,
      payment_method: paymentMethod,
      special_instructions: specialInstructions,
    };

    const res = await ordersAPI.place(orderData);

    // COD
    if (paymentMethod === 'cod') {
      dispatch(clearCart());
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.order_id}`);
      return;
    }

    // Razorpay
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      const options = {
        key: res.data.key,
        amount: res.data.amount,
        currency: "INR",
        name: "FoodRush",
        description: "Food Order Payment",
        order_id: res.data.razorpay_order_id,

        handler: async function (response) {
          try {
            await ordersAPI.verifyPayment({
              order_id: res.data.order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            dispatch(clearCart());
            toast.success("Payment successful 🎉");
            navigate(`/orders/${res.data.order_id}`);
          } catch {
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },

        theme: {
          color: "#f97316",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    }

  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to place order');
  } finally {
    setPlacing(false);
  }
};

  return (
    <div className="container-page py-8">
      <h1 className="section-title mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Address + Payment */}
        <div className="lg:col-span-2 space-y-5">

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-500" /> Delivery Address
            </h2>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddress?.id === addr.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                    className="mt-1 accent-primary-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{addr.label}</p>
                    <p className="text-sm text-gray-500">{addr.full_address}</p>
                    <p className="text-sm text-gray-500">{addr.city} - {addr.pincode}</p>
                  </div>
                  {selectedAddress?.id === addr.id && (
                    <FiCheck className="ml-auto text-primary-500 mt-1 flex-shrink-0" />
                  )}
                </label>
              ))}

              {/* Add new address */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 text-gray-500 hover:text-primary-500 transition-all text-sm font-medium"
                >
                  <FiPlus size={16} /> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="p-4 rounded-xl border-2 border-primary-200 bg-primary-50 space-y-3">
                  <div className="flex gap-2">
                    {['home', 'work', 'other'].map((t) => (
                      <button
                        key={t} type="button"
                        onClick={() => setNewAddress({ ...newAddress, label: t })}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize ${
                          newAddress.label === t ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    value={newAddress.full_address}
                    onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                    placeholder="Full address" className="input-field text-sm" required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City" className="input-field text-sm" required
                    />
                    <input
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      placeholder="Pincode" className="input-field text-sm" required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                    <button type="submit" disabled={addingAddress} className="btn-primary flex-1 py-2 text-sm">
                      {addingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-primary-500" /> Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio" name="payment" value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="accent-primary-500"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                  {paymentMethod === method.value && <FiCheck className="ml-auto text-primary-500" />}
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Special Instructions</h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any specific instructions for the restaurant or delivery partner? (optional)"
              rows={3}
              className="input-field resize-none text-sm"
            />
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="flex-shrink-0 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>₹{TAX.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddress}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              {placing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing order...</>
              ) : `Place Order · ₹${total.toFixed(2)}`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">By placing your order, you agree to our Terms & Conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
