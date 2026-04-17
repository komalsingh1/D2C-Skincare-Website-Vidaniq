"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  ChevronLeft,
  Truck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import { useOrderStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/types";

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  "out-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  processing: "Order Placed",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  processing: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle2 className="w-4 h-4" />,
  shipped: <Package className="w-4 h-4" />,
  "out-for-delivery": <Truck className="w-4 h-4" />,
  delivered: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <Circle className="w-4 h-4" />,
};

const STATUS_DESC: Record<OrderStatus, string> = {
  processing: "We've received your order and are preparing it.",
  confirmed: "Your order has been confirmed and packed.",
  shipped: "Your order is on its way!",
  "out-for-delivery": "Your order is out for delivery today.",
  delivered: "Your order has been delivered. Enjoy! 🎉",
  cancelled: "This order has been cancelled.",
};

const ALL_STATUSES: OrderStatus[] = [
  "processing",
  "confirmed",
  "shipped",
  "out-for-delivery",
  "delivered",
];

// ── Inner components ────────────────────────────────────────────────────────

function OrdersList() {
  const { orders } = useOrderStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-6 h-6 text-sage-600" />
        <h1 className="font-serif text-3xl text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center space-y-5">
          <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto" />
          <div>
            <p className="text-gray-700 font-semibold text-lg">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Your orders will appear here once you shop with us.
            </p>
          </div>
          <Link href="/products" className="btn-primary inline-flex mx-auto">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders?id=${order.id}`}
              className="card p-5 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">#{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                      STATUS_COLORS[order.status]
                    )}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                {order.items.slice(0, 4).map((item) => (
                  <div
                    key={item.productId}
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-50 shrink-0"
                  >
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-500 font-medium">
                      +{order.items.length - 4}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
                <p className="font-bold text-gray-900">
                  {formatPrice(order.total)}
                </p>
              </div>

              {order.status !== "delivered" && order.status !== "cancelled" && (
                <p className="text-xs text-sage-600 font-medium mt-2">
                  📦 Estimated delivery: {order.estimatedDelivery}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ orderId }: { orderId: string }) {
  const { getOrder } = useOrderStore();
  const order = getOrder(orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
        <Package className="w-14 h-14 text-gray-200" />
        <div>
          <p className="font-semibold text-gray-700 text-lg">Order not found</p>
          <p className="text-gray-400 text-sm mt-1">
            Order #{orderId} could not be found.
          </p>
        </div>
        <Link href="/orders" className="btn-primary">
          View All Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = ALL_STATUSES.indexOf(order.status as OrderStatus);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/orders"
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> All Orders
      </Link>

      {/* Order header + tracker */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-serif text-2xl text-gray-900">
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {!isCancelled && order.status !== "delivered" && (
            <div className="bg-sage-50 text-sage-700 text-sm font-medium px-4 py-2 rounded-xl">
              📦 Expected by {order.estimatedDelivery}
            </div>
          )}
        </div>

        {/* Progress tracker */}
        {!isCancelled ? (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 mx-8" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-sage-400 mx-8 transition-all"
                style={{
                  width: `calc(${
                    (currentStatusIndex / (ALL_STATUSES.length - 1)) * 100
                  }% - 4rem)`,
                  maxWidth: "calc(100% - 4rem)",
                }}
              />
              <div className="relative flex justify-between">
                {ALL_STATUSES.map((status, i) => {
                  const done = i <= currentStatusIndex;
                  const active = i === currentStatusIndex;
                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center gap-2 w-16"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center z-10",
                          done
                            ? "bg-sage-500 text-white"
                            : "bg-white border-2 border-gray-200 text-gray-300"
                        )}
                      >
                        {STATUS_ICONS[status]}
                      </div>
                      <span
                        className={cn(
                          "text-xs text-center leading-tight font-medium",
                          active
                            ? "text-sage-700"
                            : done
                            ? "text-gray-600"
                            : "text-gray-300"
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 bg-sage-50 rounded-xl p-4 text-sm text-sage-800">
              <span className="font-semibold">
                {STATUS_LABELS[order.status as OrderStatus]}:{" "}
              </span>
              {STATUS_DESC[order.status as OrderStatus]}
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-red-50 rounded-xl p-4 text-sm text-red-700">
            This order has been cancelled.
          </div>
        )}
      </div>

      {/* Tracking timeline */}
      {order.trackingUpdates.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sage-600" /> Tracking Updates
          </h2>
          <div className="space-y-4">
            {[...order.trackingUpdates].reverse().map((update, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-0.5 shrink-0",
                      i === 0 ? "bg-sage-500" : "bg-gray-300"
                    )}
                  />
                  {i < order.trackingUpdates.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      i === 0 ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {update.message}
                  </p>
                  {update.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {update.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(update.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-sage-600" /> Delivery Address
          </h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-semibold text-gray-900">{order.address.name}</p>
            <p>{order.address.address}</p>
            {order.address.landmark && <p>{order.address.landmark}</p>}
            <p>
              {order.address.city}, {order.address.state} —{" "}
              {order.address.pincode}
            </p>
            <p>{order.address.phone}</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-sage-600" /> Payment
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="text-gray-400">Method:</span>{" "}
              {order.paymentMethod}
            </p>
            <p>
              <span className="text-gray-400">Delivery:</span>{" "}
              {order.deliveryType === "express" ? "Express" : "Standard"}
            </p>
          </div>
        </div>
      </div>

      {/* Order items + price */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-50 shrink-0">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-medium text-gray-900 hover:text-sage-700 text-sm line-clamp-2"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-sm shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-5 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Discount{order.coupon ? ` (${order.coupon})` : ""}
              </span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <span>
              {order.deliveryCharge === 0
                ? "FREE"
                : formatPrice(order.deliveryCharge)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/orders" className="btn-secondary flex-1 text-center">
          All Orders
        </Link>
        <Link href="/products" className="btn-primary flex-1 text-center">
          Shop Again
        </Link>
      </div>
    </div>
  );
}

// ── Main page: switches between list and detail via ?id= ───────────────────

function OrdersInner() {
  const params = useSearchParams();
  const orderId = params.get("id");

  if (orderId) {
    return <OrderDetail orderId={orderId} />;
  }
  return <OrdersList />;
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrdersInner />
    </Suspense>
  );
}
