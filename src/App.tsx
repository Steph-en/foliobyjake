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

interface Work {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
}

const WORKS: Work[] = [
  { id: 1, name: 'Urban Branding', category: 'Graphic Design', image: 'https://picsum.photos/seed/work1/800/1000', description: 'A comprehensive branding project for a modern urban lifestyle brand, focusing on minimalist aesthetics and bold typography.' },
  { id: 2, name: 'Digital Dreams', category: 'Digital Art', image: 'https://picsum.photos/seed/work2/800/1000', description: 'An experimental digital art series exploring the intersection of human emotion and artificial intelligence.' },
  { id: 3, name: 'Motion Identity', category: 'Motion Graphics', image: 'https://picsum.photos/seed/work3/800/1000', description: 'Dynamic motion graphics created for a tech startup\'s product launch, emphasizing fluid transitions and vibrant colors.' },
  { id: 4, name: 'Editorial Layout', category: 'Print Design', image: 'https://picsum.photos/seed/work4/800/1000', description: 'A sophisticated editorial layout for a high-end fashion magazine, balancing negative space with striking photography.' },
  { id: 5, name: 'Social Campaign', category: 'Digital Marketing', image: 'https://picsum.photos/seed/work5/800/1000', description: 'A successful social media campaign designed to increase engagement for a sustainable clothing label.' },
  { id: 6, name: '3D Abstract', category: '3D Design', image: 'https://picsum.photos/seed/work6/800/1000', description: 'A series of abstract 3D renders exploring texture, light, and form in a virtual environment.' },
  { id: 7, name: 'Web Experience', category: 'UI/UX Design', image: 'https://picsum.photos/seed/work7/800/1000', description: 'An immersive web experience designed for a creative agency, featuring interactive elements and smooth animations.' },
  { id: 8, name: 'Packaging Design', category: 'Graphic Design', image: 'https://picsum.photos/seed/work8/800/1000', description: 'Eco-friendly packaging design for a premium skincare line, using sustainable materials and elegant illustrations.' },
  { id: 9, name: 'Typography Study', category: 'Graphic Design', image: 'https://picsum.photos/seed/work9/800/1000', description: 'An in-depth study of typography, exploring the history and application of various typefaces in modern design.' },
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

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

    introTl.set('.intro-logo', { opacity: 0, scale: 1.5, y: 50 })
      .to('.intro-logo', { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out' })
      .to('.intro-logo', { 
        scale: 0.25, 
        y: -window.innerHeight / 2 + 40,
        duration: 1.2, 
        ease: 'expo.inOut' 
      }, '+=0.5')
      .to('.intro-overlay', { opacity: 0, duration: 0.8, pointerEvents: 'none' }, '-=0.4')
      .from('.nav-item', { opacity: 0, y: -20, stagger: 0.1, duration: 0.8 }, '-=0.4');

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
        <div className="intro-overlay fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
          <h1 className="intro-logo text-[12vw] font-display tracking-tighter whitespace-nowrap">
            PORTFOLIO
          </h1>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
        <div className="flex items-center gap-8 nav-item">
        </div>
        
        <h1 ref={logoRef} className="nav-item text-2xl md:text-3xl font-display tracking-tighter absolute left-1/2 -translate-x-1/2">
          PORTFOLIO
        </h1>

        <div className="flex items-center gap-6 nav-item">
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
                href="#works" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Works</motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                href="#about" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >About</motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                href="#contact" className="hover:italic transition-all" onClick={() => setIsMenuOpen(false)}
              >Contact</motion.a>
            </div>
            <div className="mt-auto flex justify-between items-end">
              <div className="flex gap-4">
                <Instagram size={20} />
                <Twitter size={20} />
                <Facebook size={20} />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest">
                © 2026 JAKE AMPONSAH
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

        <div className="relative z-10 w-full px-6">
          <h1 className="hero-title text-[clamp(3rem,15vw,12rem)] leading-[0.85] flex flex-col items-center overflow-hidden">
            <span className="block">JAKE</span>
            <span className="block italic font-serif lowercase tracking-normal">AMPONSAH</span>
          </h1>
          <p className="hero-sub mt-8 text-sm md:text-lg max-w-xl mx-auto font-mono uppercase tracking-widest opacity-80">
            Graphic designer . Digital artist
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hero-btn mt-12 px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-white transition-all duration-300 flex items-center gap-2 group mx-auto"
          >
            View Works
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
              PHOTOSHOP <span className="w-3 h-3 bg-black rounded-full" />
              ILLUSTRATOR <span className="w-3 h-3 bg-black rounded-full" />
              AFTER EFFECTS <span className="w-3 h-3 bg-black rounded-full" />
              PREMIER PRO <span className="w-3 h-3 bg-black rounded-full" />
              INDESIGN <span className="w-3 h-3 bg-black rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* Works Grid */}
      <section id="works" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="reveal-up">
            <h2 className="text-5xl md:text-7xl uppercase tracking-tighter">RECENT PROJECTS</h2>
            <p className="font-mono uppercase tracking-widest opacity-60 mt-4">Selected works from 2024-2026</p>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="reveal-up text-xs uppercase tracking-widest font-bold border-b border-white pb-1 hover:opacity-60 transition-opacity"
          >
            {isExpanded ? 'View Less Works' : 'View More Works'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {(isExpanded ? WORKS : WORKS.slice(0, 6)).map((work) => (
            <div 
              key={work.id} 
              className="reveal-up group cursor-pointer"
              onClick={() => setSelectedWork(work)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 parallax-img-container">
                <img 
                  src={work.image} 
                  alt={work.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest">
                      View Work
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl tracking-tight uppercase">{work.name}</h3>
                  <p className="text-xs font-mono opacity-60 mt-1 uppercase">{work.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="mt-20 flex justify-center reveal-up">
            <button 
              onClick={() => {
                setIsExpanded(false);
                document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-4 border border-white/20 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
            >
              View Less Works
            </button>
          </div>
        )}
      </section>

      {/* Work Modal */}
      <AnimatePresence>
        {selectedWork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWork(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-zinc-950 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedWork(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="aspect-[4/5] lg:aspect-auto overflow-hidden bg-zinc-900">
                <img 
                  src={selectedWork.image} 
                  alt={selectedWork.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-8 md:p-16 flex flex-col justify-center">
                <div className="mb-8">
                  <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">{selectedWork.category}</span>
                  <h2 className="text-4xl md:text-7xl mt-4 uppercase tracking-tighter leading-none">{selectedWork.name}</h2>
                </div>
                
                <div className="space-y-6 mb-12">
                  <p className="text-lg md:text-xl opacity-70 leading-relaxed font-light">
                    {selectedWork.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Year</span>
                    <span className="text-sm uppercase">2026</span>
                  </div>
                  <div className="flex flex-col ml-12">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Role</span>
                    <span className="text-sm uppercase">Lead Artist</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Section */}
      <section id="about" className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-up order-2 lg:order-1">
            <h2 className="text-[clamp(3rem,8vw,6rem)] leading-none mb-12 uppercase tracking-tighter">
              Creative <br />
              <span className="italic font-serif lowercase tracking-normal text-zinc-500">Visionary</span> <br />
              & Designer
            </h2>
            <div className="space-y-6 text-lg opacity-80 max-w-lg">
              <p>
                Jake Amponsah, a multi-disciplinary designer based in Accra. My work lives at the intersection of traditional graphic design and modern digital art.
              </p>
              <p>
                With over 5 years of experience in the creative industry, I've helped brands tell their stories through compelling visuals and immersive digital experiences. I believe in design that not only looks good but feels right.
              </p>
            </div>
            <button className="mt-12 text-xs uppercase tracking-[0.3em] font-bold flex items-center gap-4 group">
              Download Portfolio
              <div className="w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500" />
            </button>
          </div>
          <div className="relative order-1 lg:order-2 parallax-img-container">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl">
              <img 
                src="/src/assets/jake.jpg" 
                alt="Jake Amponsah" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white text-black p-6 rounded-full flex flex-col items-center justify-center text-center reveal-up hidden md:flex">
              <span className="text-xs font-mono uppercase tracking-widest mb-2">Exp.</span>
              <span className="text-4xl font-display">5+ YRS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center reveal-up">
          <h2 className="text-4xl md:text-6xl mb-8 uppercase tracking-tighter">Let's Work Together</h2>
          <p className="font-mono uppercase tracking-widest opacity-60 mb-12">Available for freelance projects and collaborations.</p>
          <form className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              className="flex-1 bg-transparent border-b border-white/30 py-4 px-2 focus:border-white outline-none transition-colors font-mono text-sm"
            />
            <button className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
              Get in Touch
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-display mb-6 tracking-tighter">JAKE AMPONSAH</h1>
            <p className="max-w-xs opacity-60 text-sm leading-relaxed">
              Graphic designer and digital artist specializing in branding, motion, and immersive digital experiences.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Navigation</h4>
            <ul className="space-y-4 text-sm uppercase tracking-widest">
              <li><a href="#works" className="hover:line-through">Works</a></li>
              <li><a href="#about" className="hover:line-through">About</a></li>
              <li><a href="#contact" className="hover:line-through">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Social</h4>
            <ul className="space-y-4 text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:line-through">Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            © 2026 JAKE AMPONSAH. All Rights Reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:opacity-60 transition-opacity"><Instagram size={20} /></a>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            Designed in Accra, Ghana
          </div>
        </div>
      </footer>
    </div>
  );
}
