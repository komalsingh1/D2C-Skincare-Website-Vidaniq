"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X, Leaf, ChevronDown, Package } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useSkinProfileStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    label: "Shop",
    href: "/products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "Cleansers", href: "/products?category=cleanser" },
      { label: "Serums", href: "/products?category=serum" },
      { label: "Moisturizers", href: "/products?category=moisturizer" },
      { label: "Masks", href: "/products?category=mask" },
      { label: "Sunscreen", href: "/products?category=sunscreen" },
    ],
  },
  {
    label: "Concerns",
    href: "/products",
    children: [
      { label: "Acne Control", href: "/products?concern=acne" },
      { label: "Brightening", href: "/products?concern=pigmentation" },
      { label: "Anti-Aging", href: "/products?concern=fine-lines" },
      { label: "Hydration", href: "/products?concern=dryness" },
    ],
  },
  { label: "Routines", href: "/products?view=bundles" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { setQuizOpen } = useSkinProfileStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-sage-700 text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        Free shipping on orders above ₹799 · Use code{" "}
        <span className="font-bold">FIRSTORDER</span> for 15% off your first order
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b transition-all duration-300",
          scrolled ? "border-cream-200 shadow-sm" : "border-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-sage-800 tracking-tight">
              vidaniq
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.children && setActiveDropdown(link.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-sage-700 rounded-lg hover:bg-sage-50 transition-colors"
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  )}
                </Link>

                {link.children && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-cream-100 py-2 animate-slide-down">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-sage-700 hover:bg-sage-50 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuizOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-sage-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-sage-700 transition-colors"
            >
              <Leaf className="w-3.5 h-3.5" />
              Skin Quiz
            </button>

            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sage-50 text-gray-600 hover:text-sage-700 transition-colors">
              <Search className="w-4.5 h-4.5 w-5 h-5" />
            </button>

            <Link
              href="/account"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sage-50 text-gray-600 hover:text-sage-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            <CartButton count={itemCount} />

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-sage-50 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-cream-100">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 bg-sage-600 rounded-full flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif font-bold text-lg text-sage-800">
                  vidaniq
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setQuizOpen(true);
                }}
                className="w-full flex items-center gap-2 bg-sage-600 text-white font-semibold px-4 py-3 rounded-xl text-sm mb-3"
              >
                <Leaf className="w-4 h-4" />
                Take Skin Quiz
              </button>

              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:text-sage-700 hover:bg-sage-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-500 hover:text-sage-700 hover:bg-sage-50 rounded-xl transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Account links */}
              <div className="border-t border-cream-100 pt-3 mt-3 space-y-1">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:text-sage-700 hover:bg-sage-50 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" /> My Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:text-sage-700 hover:bg-sage-50 rounded-xl transition-colors"
                >
                  <Package className="w-4 h-4" /> My Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CartButton({ count }: { count: number }) {
  const [cartOpen, setCartOpen] = useState(false);

  // We emit a custom event to open cart sidebar
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("openCart"));
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-sage-50 text-gray-600 hover:text-sage-700 transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 w-5 h-5 bg-sage-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
