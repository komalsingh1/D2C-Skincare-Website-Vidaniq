"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Package,
  MapPin,
  Leaf,
  Edit3,
  Save,
  X,
  ChevronRight,
  LogOut,
  Star,
} from "lucide-react";
import { useUserStore, useOrderStore, useSkinProfileStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "profile" | "orders" | "addresses" | "skin-profile";

const STATUS_COLORS: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  "out-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  processing: "Processing",
  confirmed: "Confirmed",
  shipped: "Shipped",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AccountPage() {
  const { profile, setProfile, clearProfile } = useUserStore();
  const { orders } = useOrderStore();
  const { profile: skinProfile, setQuizOpen, clearProfile: clearSkinProfile } = useSkinProfileStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });

  const handleSave = () => {
    setProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      addresses: profile?.addresses || [],
    });

    // Backend sync
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});

    setEditing(false);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders", label: `Orders (${orders.length})`, icon: <Package className="w-4 h-4" /> },
    { id: "addresses", label: "Addresses", icon: <MapPin className="w-4 h-4" /> },
    { id: "skin-profile", label: "Skin Profile", icon: <Leaf className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile?.email || "Welcome to Vidaniq"}
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-sage-700 font-bold text-sm">
                {(profile.name || "V")[0].toUpperCase()}
              </span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">
              {profile.name || "Vidaniq User"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <nav className="lg:col-span-1">
          <div className="card p-2 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all",
                  activeTab === tab.id
                    ? "bg-sage-50 text-sage-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => {
                clearProfile();
                clearSkinProfile();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div className="lg:col-span-3">

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-gray-900">Personal Details</h2>
                {!editing ? (
                  <button
                    onClick={() => {
                      setForm({ name: profile?.name || "", email: profile?.email || "", phone: profile?.phone || "" });
                      setEditing(true);
                    }}
                    className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-800 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-800">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-400 font-medium hover:text-gray-600">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {!profile && !editing ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-sage-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No profile yet. Place an order or fill in your details.</p>
                  <button
                    onClick={() => { setEditing(true); setForm({ name: "", email: "", phone: "" }); }}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    Create Profile
                  </button>
                </div>
              ) : editing ? (
                <div className="grid gap-4">
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "Priya Sharma" },
                    { label: "Email", key: "email", type: "email", placeholder: "priya@email.com" },
                    { label: "Phone", key: "phone", type: "tel", placeholder: "10-digit mobile" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: profile?.name },
                    { label: "Email", value: profile?.email },
                    { label: "Phone", value: profile?.phone },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">{label}</p>
                      <p className="text-gray-900 font-medium">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">Order History</h2>
              {orders.length === 0 ? (
                <div className="card p-10 text-center space-y-4">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500">No orders yet. Start shopping!</p>
                  <Link href="/products" className="btn-primary inline-flex">Shop Now</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">#{order.id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", STATUS_COLORS[order.status])}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {order.items.map((item) => (
                        <div key={item.productId} className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-50 shrink-0">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <Link
                        href={`/orders?id=${order.id}`}
                        className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-800 font-medium"
                      >
                        Track Order <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">Saved Addresses</h2>
              {(!profile?.addresses || profile.addresses.length === 0) ? (
                <div className="card p-10 text-center space-y-4">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500">No saved addresses. They appear here after your first order.</p>
                  <Link href="/products" className="btn-primary inline-flex">Shop Now</Link>
                </div>
              ) : (
                profile.addresses.map((addr, i) => (
                  <div key={i} className="card p-5 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{addr.name}</p>
                      {i === 0 && (
                        <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    {addr.landmark && <p className="text-sm text-gray-500">{addr.landmark}</p>}
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Skin Profile ── */}
          {activeTab === "skin-profile" && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-gray-900">Your Skin Profile</h2>
                <button
                  onClick={() => setQuizOpen(true)}
                  className="text-sm text-sage-600 font-medium hover:text-sage-800 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Retake Quiz
                </button>
              </div>

              {!skinProfile?.completedAt ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-5xl">🌿</div>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Take the 5-step Skin Quiz to get personalized product recommendations tailored to your skin.
                  </p>
                  <button onClick={() => setQuizOpen(true)} className="btn-primary">
                    Take Skin Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-sage-50 rounded-xl p-4">
                      <p className="text-xs text-sage-600 uppercase tracking-wide font-semibold mb-1">Skin Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {skinProfile.skinType?.replace("-", " ") || "Not set"}
                      </p>
                    </div>
                    <div className="bg-sage-50 rounded-xl p-4">
                      <p className="text-xs text-sage-600 uppercase tracking-wide font-semibold mb-1">Sensitivity</p>
                      <p className="font-medium text-gray-900">
                        {skinProfile.isSensitive ? "Sensitive skin" : "Not sensitive"}
                      </p>
                    </div>
                    <div className="bg-sage-50 rounded-xl p-4">
                      <p className="text-xs text-sage-600 uppercase tracking-wide font-semibold mb-1">Routine Preference</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {skinProfile.routinePreference}
                      </p>
                    </div>
                    <div className="bg-sage-50 rounded-xl p-4">
                      <p className="text-xs text-sage-600 uppercase tracking-wide font-semibold mb-1">Quiz Completed</p>
                      <p className="font-medium text-gray-900">
                        {skinProfile.completedAt
                          ? new Date(skinProfile.completedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {skinProfile.concerns.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Skin Concerns</p>
                      <div className="flex flex-wrap gap-2">
                        {skinProfile.concerns.map((c) => (
                          <span key={c} className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
                            {c.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/products?concern=${skinProfile.concerns[0] || ""}&skinType=${skinProfile.skinType || ""}`}
                    className="btn-primary inline-flex items-center gap-2 text-sm"
                  >
                    <Star className="w-4 h-4" />
                    Shop Your Recommendations
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
