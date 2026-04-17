"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  CreditCard,
  Smartphone,
  Landmark,
  Truck,
  MapPin,
  Package,
} from "lucide-react";
import { useCartStore, useOrderStore, useUserStore } from "@/lib/store";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Step = "address" | "delivery" | "payment" | "review";

interface Address {
  name: string;
  phone: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
  landmark: string;
}

const STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala",
  "Maharashtra", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "West Bengal",
];

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    duration: "3–5 business days",
    price: 0,
    icon: "📦",
  },
  {
    id: "express",
    label: "Express Delivery",
    duration: "1–2 business days",
    price: 99,
    icon: "⚡",
  },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Pay using any UPI app" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Landmark, desc: "All major banks" },
  { id: "cod", label: "Cash on Delivery", icon: Truck, desc: "Pay when delivered" },
];

const STEPS: Step[] = ["address", "delivery", "payment", "review"];
const STEP_LABELS = ["Address", "Delivery", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getSubtotal, discount, coupon, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { setProfile } = useUserStore();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    landmark: "",
  });
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");

  const rawSubtotal = getSubtotal();
  const subtotal = getTotal(); // after coupon
  const deliveryCharge =
    delivery === "express" ? 99 : subtotal >= 799 ? 0 : 99;
  const total = subtotal + deliveryCharge;
  const stepIndex = STEPS.indexOf(currentStep);

  const handlePlaceOrder = () => {
    const now = new Date();
    const id = `VD${Math.floor(Math.random() * 900000 + 100000)}`;
    const estimatedDays = delivery === "express" ? 2 : 5;
    const estimatedDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);

    const order: Order = {
      id,
      createdAt: now.toISOString(),
      status: "processing",
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0],
        price: product.price,
        quantity,
      })),
      address: {
        name: address.name,
        phone: address.phone,
        email: address.email,
        address: address.address,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      deliveryType: delivery as "standard" | "express",
      paymentMethod: payment === "upi" ? `UPI${upiId ? ` (${upiId})` : ""}` : PAYMENT_METHODS.find(p => p.id === payment)?.label || payment,
      subtotal: rawSubtotal,
      deliveryCharge,
      discount: rawSubtotal - subtotal,
      coupon,
      total,
      estimatedDelivery: estimatedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      trackingUpdates: [
        {
          status: "processing",
          timestamp: now.toISOString(),
          message: "Order received and is being processed",
          location: "Vidaniq Warehouse",
        },
      ],
    };

    addOrder(order);

    // Save user profile for account page
    setProfile({
      name: address.name,
      email: address.email,
      phone: address.phone,
      addresses: [order.address],
    });

    // Attempt backend API call (works in server mode; fails silently on static export)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch(() => {/* static export — silently ignore */});

    setOrderId(id);
    setOrdered(true);
    clearCart();
  };

  if (ordered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 py-20 px-4 text-center">
        <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-sage-600" />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-gray-900 mb-2">
            Order Placed! 🎉
          </h2>
          <p className="text-gray-500">
            Thank you, {address.name || "valued customer"}! Your order has been confirmed.
          </p>
          <p className="text-sage-600 font-semibold mt-1">
            Order #{orderId}
          </p>
        </div>
        <div className="bg-sage-50 rounded-2xl p-5 max-w-sm w-full text-left space-y-2">
          <p className="text-sm text-gray-600">
            📧 Confirmation sent to{" "}
            <span className="font-semibold">{address.email || "your email"}</span>
          </p>
          <p className="text-sm text-gray-600">
            📦 Estimated delivery:{" "}
            <span className="font-semibold">
              {delivery === "express" ? "1–2" : "3–5"} business days
            </span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href={`/orders?id=${orderId}`} className="btn-primary">
            Track Order
          </Link>
          <Link href="/orders" className="btn-secondary">
            All Orders
          </Link>
          <Link href="/products" className="btn-ghost">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/products" className="btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/cart" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" /> Cart
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900 capitalize">
          {currentStep}
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "flex items-center gap-2",
                i <= stepIndex ? "text-sage-700" : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  i < stepIndex
                    ? "bg-sage-600 text-white"
                    : i === stepIndex
                    ? "bg-sage-100 text-sage-700 border-2 border-sage-600"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-3",
                  i < stepIndex ? "bg-sage-400" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step: Address */}
          {currentStep === "address" && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-sage-600" />
                <h2 className="font-semibold text-lg text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                    placeholder="Priya Sharma"
                    className="input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    placeholder="10-digit mobile number"
                    className="input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) =>
                      setAddress({ ...address, email: e.target.value })
                    }
                    placeholder="priya@email.com"
                    className="input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Address *
                  </label>
                  <textarea
                    value={address.address}
                    onChange={(e) =>
                      setAddress({ ...address, address: e.target.value })
                    }
                    rows={2}
                    placeholder="House no., street, area"
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) =>
                      setAddress({ ...address, landmark: e.target.value })
                    }
                    placeholder="Near ..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                    placeholder="6-digit pincode"
                    className="input"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    placeholder="Mumbai"
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    State *
                  </label>
                  <select
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Select State</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep("delivery")}
                disabled={
                  !address.name ||
                  !address.phone ||
                  !address.email ||
                  !address.address ||
                  !address.pincode ||
                  !address.city ||
                  !address.state
                }
                className="w-full bg-sage-600 text-white font-semibold py-3.5 rounded-xl hover:bg-sage-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Delivery <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step: Delivery */}
          {currentStep === "delivery" && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-sage-600" />
                <h2 className="font-semibold text-lg text-gray-900">
                  Delivery Options
                </h2>
              </div>
              {DELIVERY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDelivery(opt.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    delivery === opt.id
                      ? "border-sage-500 bg-sage-50"
                      : "border-gray-100 hover:border-sage-200"
                  )}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-sm text-gray-500">{opt.duration}</p>
                  </div>
                  <div className="text-right">
                    {opt.price === 0 ? (
                      <span className="font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="font-bold text-gray-900">
                        +{formatPrice(opt.price)}
                      </span>
                    )}
                  </div>
                  {delivery === opt.id && (
                    <div className="w-5 h-5 bg-sage-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep("address")}
                  className="btn-ghost"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setCurrentStep("payment")}
                  className="flex-1 bg-sage-600 text-white font-semibold py-3.5 rounded-xl hover:bg-sage-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {currentStep === "payment" && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-sage-600" />
                <h2 className="font-semibold text-lg text-gray-900">
                  Payment Method
                </h2>
                <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 256-bit SSL
                </span>
              </div>
              {PAYMENT_METHODS.map((method) => (
                <div key={method.id}>
                  <button
                    onClick={() => setPayment(method.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                      payment === method.id
                        ? "border-sage-500 bg-sage-50"
                        : "border-gray-100 hover:border-sage-200"
                    )}
                  >
                    <method.icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    {payment === method.id && (
                      <div className="w-5 h-5 bg-sage-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                  {payment === "upi" && method.id === "upi" && (
                    <div className="px-4 pb-2 pt-1">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="input text-sm mt-2"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep("delivery")}
                  className="btn-ghost"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setCurrentStep("review")}
                  className="flex-1 bg-sage-600 text-white font-semibold py-3.5 rounded-xl hover:bg-sage-700 transition-colors flex items-center justify-center gap-2"
                >
                  Review Order <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {currentStep === "review" && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sage-600" />
                <h2 className="font-semibold text-lg text-gray-900">
                  Review Your Order
                </h2>
              </div>

              {/* Summary blocks */}
              <div className="space-y-3">
                <ReviewBlock
                  title="Delivery Address"
                  onEdit={() => setCurrentStep("address")}
                >
                  <p className="font-semibold">{address.name}</p>
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} — {address.pincode}
                  </p>
                  <p>{address.phone}</p>
                </ReviewBlock>

                <ReviewBlock
                  title="Delivery"
                  onEdit={() => setCurrentStep("delivery")}
                >
                  <p>
                    {
                      DELIVERY_OPTIONS.find((d) => d.id === delivery)
                        ?.label
                    }{" "}
                    —{" "}
                    {
                      DELIVERY_OPTIONS.find((d) => d.id === delivery)
                        ?.duration
                    }
                  </p>
                </ReviewBlock>

                <ReviewBlock
                  title="Payment"
                  onEdit={() => setCurrentStep("payment")}
                >
                  <p>
                    {
                      PAYMENT_METHODS.find((p) => p.id === payment)
                        ?.label
                    }
                  </p>
                  {payment === "upi" && upiId && <p>{upiId}</p>}
                </ReviewBlock>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <p className="font-semibold text-sm text-gray-700">
                  Items ({items.length})
                </p>
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-50 shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Qty: {quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep("payment")}
                  className="btn-ghost"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-sage-600 text-white font-bold py-4 rounded-xl hover:bg-sage-700 transition-colors flex items-center justify-center gap-2 text-base"
                >
                  <Shield className="w-4 h-4" />
                  Place Order — {formatPrice(total)}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-gray-600">
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit space-y-4">
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-50 shrink-0">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-gray-700 flex-1 line-clamp-2">
                {product.name}
              </p>
              <p className="text-xs font-semibold shrink-0">
                {formatPrice(product.price * quantity)}
              </p>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({coupon})</span>
                <span>-{formatPrice(subtotal - getTotal())}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Shield className="w-3.5 h-3.5" />
            Secure Payment · SSL Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </span>
        <button
          onClick={onEdit}
          className="text-xs text-sage-600 hover:text-sage-800 font-medium"
        >
          Edit
        </button>
      </div>
      <div className="text-sm text-gray-700 space-y-0.5">{children}</div>
    </div>
  );
}
