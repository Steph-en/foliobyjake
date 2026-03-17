/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ShoppingCart, Menu, X, ArrowRight, Instagram, Twitter, Facebook, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Classic Black Tee', price: 120, image: 'https://picsum.photos/seed/hoodie1/800/1000', description: 'Premium heavy-weight cotton tee with a relaxed fit. Perfect for everyday street style.' },
  { id: 2, name: 'Urban White Hoodie', price: 150, image: 'https://picsum.photos/seed/hoodie2/800/1000', description: 'Soft-touch fleece hoodie with minimalist branding. Designed for comfort and durability.' },
  { id: 3, name: 'Street Culture Cap', price: 80, image: 'https://picsum.photos/seed/cap1/800/1000', description: 'Classic 6-panel cap featuring our signature embroidery. Adjustable strap for a custom fit.' },
  { id: 4, name: 'Limited Edition Jacket', price: 250, image: 'https://picsum.photos/seed/jacket1/800/1000', description: 'Water-resistant outer shell with custom artwork lining. Only 50 pieces ever produced.' },
  { id: 5, name: 'Graphic Print Tee', price: 120, image: 'https://picsum.photos/seed/tee1/800/1000', description: 'Artistic vision meets street culture. Screen-printed graphic on premium organic cotton.' },
  { id: 6, name: 'Oversized Hoodie', price: 180, image: 'https://picsum.photos/seed/hoodie3/800/1000', description: 'Extra-roomy fit with dropped shoulders. The ultimate statement piece for your urban wardrobe.' },
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([]);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  // Cart Logic
  const addToCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useGSAP(() => {
    // Logo Intro Animation
    const introTl = gsap.timeline({
      onComplete: () => setIsIntroComplete(true)
    });

    introTl.set('.intro-logo', { opacity: 0, scale: 2, y: 100 })
      .to('.intro-logo', { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out' })
      .to('.intro-logo', { scale: 1, duration: 1, ease: 'power2.inOut' }, '+=0.5')
      .to('.intro-overlay', { opacity: 0, duration: 1, pointerEvents: 'none' }, '-=0.5')
      .from('.nav-item', { opacity: 0, y: -20, stagger: 0.1, duration: 0.8 }, '-=0.5');

    // Hero Text Animation
    const heroTl = gsap.timeline({ delay: 3 });
    heroTl.from('.hero-title span', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power4.out',
    })
    .from('.hero-sub', {
      opacity: 0,
      y: 20,
      duration: 0.8,
    }, '-=0.5')
    .from('.hero-btn', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
    }, '-=0.3');

    // Scroll Animations
    gsap.utils.toArray('.reveal-up').forEach((elem: any) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });

    // Enhanced Parallax/Smooth Scroll for Images
    gsap.utils.toArray('.parallax-img-container').forEach((container: any) => {
      const img = container.querySelector('img');
      gsap.fromTo(img, 
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );
    });

    // Marquee Animation
    gsap.to('.marquee-inner', {
      xPercent: -50,
      repeat: -1,
      duration: 20,
      ease: 'none',
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Intro Overlay */}
      {!isIntroComplete && (
        <div className="intro-overlay fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <h1 className="intro-logo text-6xl md:text-9xl font-display tracking-tighter">
            DEHOOD
          </h1>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
        <div className="flex items-center gap-8 nav-item">
          <button onClick={() => setIsMenuOpen(true)} className="hover:opacity-60 transition-opacity">
            <Menu size={24} />
          </button>
          <div className="hidden md:flex gap-6 text-xs uppercase tracking-widest font-mono">
            <a href="#" className="hover:line-through">Shop</a>
            <a href="#" className="hover:line-through">About</a>
            <a href="#" className="hover:line-through">Contact</a>
          </div>
        </div>
        
        <h1 ref={logoRef} className="nav-item text-2xl md:text-3xl font-display tracking-tighter absolute left-1/2 -translate-x-1/2">
          DEHOOD
        </h1>

        <div className="flex items-center gap-6 nav-item">
          <div className="hidden md:block text-xs uppercase tracking-widest font-mono">
            GH¢ (GHS)
          </div>
          <button className="relative hover:opacity-60 transition-opacity">
            <ShoppingCart size={24} />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-white text-black p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <h1 className="text-3xl font-display">DEHOOD</h1>
              <button onClick={() => setIsMenuOpen(false)}>
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8 text-6xl md:text-8xl font-display uppercase tracking-tighter">
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                href="#" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Shop</motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                href="#" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Collections</motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                href="#" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Our Story</motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                href="#" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Contact</motion.a>
            </div>
            <div className="mt-auto flex justify-between items-end">
              <div className="flex gap-4">
                <Instagram size={20} />
                <Twitter size={20} />
                <Facebook size={20} />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest">
                © 2026 DEHOOD Authentic
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/dehood-hero/1920/1080" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>

        <div className="relative z-10">
          <h1 className="hero-title text-[15vw] md:text-[12vw] leading-[0.85] flex flex-col items-center overflow-hidden">
            <span className="block">AUTHENTIC</span>
            <span className="block italic font-serif lowercase tracking-normal">Streetwear</span>
          </h1>
          <p className="hero-sub mt-8 text-sm md:text-lg max-w-xl mx-auto font-mono uppercase tracking-widest opacity-80">
            Inspired by street culture. Every design tells a story. Premium quality pieces at fair prices.
          </p>
          <button className="hero-btn mt-12 px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-white transition-all duration-300 flex items-center gap-2 group">
            Shop Collection
            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-[1px] h-12 bg-white" />
        </div>
      </section>

      {/* Marquee */}
      <div className="py-12 border-y border-white/10 overflow-hidden whitespace-nowrap bg-white text-black">
        <div className="marquee-inner flex gap-12 text-4xl md:text-6xl font-display uppercase tracking-tighter">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              DEHOOD AUTHENTIC <span className="w-3 h-3 bg-black rounded-full" />
              STREET CULTURE <span className="w-3 h-3 bg-black rounded-full" />
              LIMITED EDITION <span className="w-3 h-3 bg-black rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="reveal-up">
            <h2 className="text-5xl md:text-7xl">Featured Drops</h2>
            <p className="font-mono uppercase tracking-widest opacity-60 mt-4">Selected pieces from our latest collection</p>
          </div>
          <a href="#" className="reveal-up text-xs uppercase tracking-widest font-bold border-b border-white pb-1 hover:opacity-60 transition-opacity">
            View All Products
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="reveal-up group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 parallax-img-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl tracking-tight">{product.name}</h3>
                  <p className="text-xs font-mono opacity-60 mt-1 uppercase">Limited Edition</p>
                </div>
                <div className="text-xl font-mono">GH¢{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-up order-2 lg:order-1">
            <h2 className="text-6xl md:text-8xl leading-none mb-12">
              Where Street <br />
              <span className="italic font-serif lowercase tracking-normal text-zinc-500">Culture</span> <br />
              Meets Vision
            </h2>
            <div className="space-y-6 text-lg opacity-80 max-w-lg">
              <p>
                DEHOOD is more than just a clothing brand. It's a movement born from the streets of Accra, inspired by the raw energy and artistic vision of urban culture.
              </p>
              <p>
                Every piece we create is a canvas, telling stories of resilience, creativity, and the authentic spirit of the streets. We believe in premium quality that doesn't break the bank.
              </p>
            </div>
            <button className="mt-12 text-xs uppercase tracking-[0.3em] font-bold flex items-center gap-4 group">
              Read Our Full Story
              <div className="w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500" />
            </button>
          </div>
          <div className="relative order-1 lg:order-2 parallax-img-container">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl">
              <img 
                src="https://picsum.photos/seed/dehood-story/800/1000" 
                alt="Story" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white text-black p-6 rounded-full flex flex-col items-center justify-center text-center reveal-up hidden md:flex">
              <span className="text-xs font-mono uppercase tracking-widest mb-2">Est.</span>
              <span className="text-4xl font-display">2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center reveal-up">
          <h2 className="text-4xl md:text-6xl mb-8">Join the Hood</h2>
          <p className="font-mono uppercase tracking-widest opacity-60 mb-12">Get early access to drops and exclusive content.</p>
          <form className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              className="flex-1 bg-transparent border-b border-white/30 py-4 px-2 focus:border-white outline-none transition-colors font-mono text-sm"
            />
            <button className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-display mb-6">DEHOOD</h1>
            <p className="max-w-xs opacity-60 text-sm leading-relaxed">
              Authentic streetwear inspired by street culture. Premium quality pieces at fair prices. Every design tells a story.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Shop</h4>
            <ul className="space-y-4 text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:line-through">All Products</a></li>
              <li><a href="#" className="hover:line-through">T-Shirts</a></li>
              <li><a href="#" className="hover:line-through">Hoodies</a></li>
              <li><a href="#" className="hover:line-through">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Support</h4>
            <ul className="space-y-4 text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:line-through">Shipping</a></li>
              <li><a href="#" className="hover:line-through">Returns</a></li>
              <li><a href="#" className="hover:line-through">FAQ</a></li>
              <li><a href="#" className="hover:line-through">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            © 2026 DEHOOD Authentic. All Rights Reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:opacity-60 transition-opacity"><Instagram size={20} /></a>
            <a href="#" className="hover:opacity-60 transition-opacity"><Twitter size={20} /></a>
            <a href="#" className="hover:opacity-60 transition-opacity"><Facebook size={20} /></a>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            Designed in Accra, Ghana
          </div>
        </div>
      </footer>
    </div>
  );
}
