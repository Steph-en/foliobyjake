/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ShoppingCart, Menu, X, ArrowRight, Instagram, Twitter, Facebook, Plus, Minus, ExternalLink, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-white/5 rounded-lg", className)} />
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Work {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  longDescription: string;
  gallery: string[];
  client?: string;
  year?: string;
  role?: string;
}

const WORKS: Work[] = [
  { 
    id: 1, 
    name: 'Urban Branding', 
    category: 'Graphic Design', 
    image: 'https://picsum.photos/seed/work1/800/1000', 
    description: 'A comprehensive branding project for a modern urban lifestyle brand, focusing on minimalist aesthetics and bold typography.',
    longDescription: 'This project involved creating a complete visual identity for "Urban Pulse," a lifestyle brand targeting Gen Z. The challenge was to balance high-fashion elegance with street-level grit. We developed a custom typeface, a modular logo system, and a color palette that adapts to different seasonal collections. The result was a 40% increase in brand recognition within the first quarter of launch.',
    gallery: [
      'https://picsum.photos/seed/work1-1/1200/800',
      'https://picsum.photos/seed/work1-2/1200/800',
      'https://picsum.photos/seed/work1-3/1200/800'
    ],
    client: 'Urban Pulse',
    year: '2024',
    role: 'Lead Designer'
  },
  { 
    id: 2, 
    name: 'Digital Dreams', 
    category: 'Digital Art', 
    image: 'https://picsum.photos/seed/work2/800/1000', 
    description: 'An experimental digital art series exploring the intersection of human emotion and artificial intelligence.',
    longDescription: 'Digital Dreams is a series of 12 unique digital paintings created using a hybrid process of traditional digital painting and AI-assisted texture generation. Each piece represents a specific subconscious state, from "Lucid Clarity" to "Static Anxiety." The series was exhibited at the Accra Digital Arts Festival and sold as a limited NFT collection.',
    gallery: [
      'https://picsum.photos/seed/work2-1/1200/800',
      'https://picsum.photos/seed/work2-2/1200/800',
      'https://picsum.photos/seed/work2-3/1200/800'
    ],
    client: 'Personal Project',
    year: '2025',
    role: 'Digital Artist'
  },
  { 
    id: 3, 
    name: 'Motion Identity', 
    category: 'Motion Graphics', 
    image: 'https://picsum.photos/seed/work3/800/1000', 
    description: 'Dynamic motion graphics created for a tech startup\'s product launch, emphasizing fluid transitions and vibrant colors.',
    longDescription: 'For the launch of "FlowState," a productivity app, we created a 60-second brand anthem and a series of UI-focused social clips. The motion language was built around the concept of "frictionless flow," using liquid simulations and rhythmic editing. The campaign reached over 1 million views across platforms in its first week.',
    gallery: [
      'https://picsum.photos/seed/work3-1/1200/800',
      'https://picsum.photos/seed/work3-2/1200/800',
      'https://picsum.photos/seed/work3-3/1200/800'
    ],
    client: 'FlowState Tech',
    year: '2024',
    role: 'Motion Designer'
  },
  { 
    id: 4, 
    name: 'Editorial Layout', 
    category: 'Print Design', 
    image: 'https://picsum.photos/seed/work4/800/1000', 
    description: 'A sophisticated editorial layout for a high-end fashion magazine, balancing negative space with striking photography.',
    longDescription: 'This 24-page feature for "Vogue Ghana" explored the rise of sustainable textiles in West Africa. We utilized a grid-breaking layout and custom-shot macro photography of fabric textures. The design won the "Excellence in Print Media" award at the 2024 Design Awards.',
    gallery: [
      'https://picsum.photos/seed/work4-1/1200/800',
      'https://picsum.photos/seed/work4-2/1200/800',
      'https://picsum.photos/seed/work4-3/1200/800'
    ],
    client: 'Vogue Ghana',
    year: '2024',
    role: 'Art Director'
  },
  { 
    id: 5, 
    name: 'Social Campaign', 
    category: 'Digital Marketing', 
    image: 'https://picsum.photos/seed/work5/800/1000', 
    description: 'A successful social media campaign designed to increase engagement for a sustainable clothing label.',
    longDescription: 'The "Wear the Change" campaign for EcoThreads focused on transparency. We designed a series of interactive Instagram stories and a high-impact video series showcasing the artisans behind the brand. Engagement rates increased by 250% compared to previous campaigns.',
    gallery: [
      'https://picsum.photos/seed/work5-1/1200/800',
      'https://picsum.photos/seed/work5-2/1200/800',
      'https://picsum.photos/seed/work5-3/1200/800'
    ],
    client: 'EcoThreads',
    year: '2025',
    role: 'Creative Lead'
  },
  { 
    id: 6, 
    name: '3D Abstract', 
    category: '3D Design', 
    image: 'https://picsum.photos/seed/work6/800/1000', 
    description: 'A series of abstract 3D renders exploring texture, light, and form in a virtual environment.',
    longDescription: 'This personal exploration pushed the boundaries of procedural material generation in Blender. I focused on the contrast between organic, soft forms and harsh, metallic surfaces. The renders were featured on the front page of Behance\'s 3D Design gallery.',
    gallery: [
      'https://picsum.photos/seed/work6-1/1200/800',
      'https://picsum.photos/seed/work6-2/1200/800',
      'https://picsum.photos/seed/work6-3/1200/800'
    ],
    client: 'Personal Project',
    year: '2026',
    role: '3D Artist'
  },
  { 
    id: 7, 
    name: 'Web Experience', 
    category: 'UI/UX Design', 
    image: 'https://picsum.photos/seed/work7/800/1000', 
    description: 'An immersive web experience designed for a creative agency, featuring interactive elements and smooth animations.',
    longDescription: 'The "Studio X" portfolio site was built to feel like a physical gallery. We implemented custom WebGL transitions and a non-linear navigation system. The site was awarded "Site of the Day" on Awwwards.',
    gallery: [
      'https://picsum.photos/seed/work7-1/1200/800',
      'https://picsum.photos/seed/work7-2/1200/800',
      'https://picsum.photos/seed/work7-3/1200/800'
    ],
    client: 'Studio X',
    year: '2025',
    role: 'UI/UX Designer'
  },
  { 
    id: 8, 
    name: 'Packaging Design', 
    category: 'Graphic Design', 
    image: 'https://picsum.photos/seed/work8/800/1000', 
    description: 'Eco-friendly packaging design for a premium skincare line, using sustainable materials and elegant illustrations.',
    longDescription: 'For "Nura Skincare," we developed a packaging system that uses 100% recycled paper and soy-based inks. The visual language uses delicate botanical illustrations and a muted, earthy color palette to reflect the brand\'s natural ingredients.',
    gallery: [
      'https://picsum.photos/seed/work8-1/1200/800',
      'https://picsum.photos/seed/work8-2/1200/800',
      'https://picsum.photos/seed/work8-3/1200/800'
    ],
    client: 'Nura Skincare',
    year: '2024',
    role: 'Packaging Designer'
  },
  { 
    id: 9, 
    name: 'Typography Study', 
    category: 'Graphic Design', 
    image: 'https://picsum.photos/seed/work9/800/1000', 
    description: 'An in-depth study of typography, exploring the history and application of various typefaces in modern design.',
    longDescription: 'This self-published book, "Type & Time," explores how typography has evolved alongside technology. It features 50 detailed case studies of iconic typefaces. The project was funded via a successful Kickstarter campaign.',
    gallery: [
      'https://picsum.photos/seed/work9-1/1200/800',
      'https://picsum.photos/seed/work9-2/1200/800',
      'https://picsum.photos/seed/work9-3/1200/800'
    ],
    client: 'Self-Published',
    year: '2026',
    role: 'Author & Designer'
  },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = Array.from(new Set(WORKS.map(w => w.category)));

  const filteredWorks = WORKS.filter(work => 
    !selectedCategory || work.category === selectedCategory
  );

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

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
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

    // Staggered Work Cards
    gsap.from('.work-card', {
      scrollTrigger: {
        trigger: '.work-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
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
              <h1 className="text-3xl font-display">PORTFOLIO</h1>
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
          <h1 className="hero-title font-jake text-[clamp(3rem,15vw,12rem)] leading-[0.85] flex flex-col items-center overflow-x-visible">
            <span className="block">JAKE</span>
            <span className="block tracking-normal">AMPONSAH</span>
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

        {/* Filtering */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 reveal-up">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                !selectedCategory ? "bg-white text-black border-white" : "bg-transparent text-white border-white/20 hover:border-white"
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                  selectedCategory === cat ? "bg-white text-black border-white" : "bg-transparent text-white border-white/20 hover:border-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 work-grid">
          {(isExpanded ? filteredWorks : filteredWorks.slice(0, 6)).map((work) => (
            <div 
              key={work.id} 
              className="work-card group cursor-pointer"
              onClick={() => setSelectedWork(work)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 parallax-img-container">
                <img 
                  src={work.image} 
                  alt={work.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-center px-6">
                    <span className="block px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform">
                      View Work
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl tracking-tight uppercase group-hover:text-zinc-400 transition-colors">{work.name}</h3>
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
              
              <ModalCarousel images={selectedWork.gallery.length > 0 ? selectedWork.gallery : [selectedWork.image]} name={selectedWork.name} />
              
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
                    <span className="text-sm uppercase">{selectedWork.year || '2026'}</span>
                  </div>
                  <div className="flex flex-col ml-12">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Role</span>
                    <span className="text-sm uppercase">{selectedWork.role || 'Lead Artist'}</span>
                  </div>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => navigate(`/work/${selectedWork.id}`)}
                    className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold group hover:text-zinc-400 transition-colors"
                  >
                    View Full Details
                    <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
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
                src="https://res.cloudinary.com/degd6ahfu/image/upload/v1773974518/PHOTO-2026-03-17-23-00-06_ralnm5.jpg" 
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
              className="reveal-up flex-1 bg-transparent border-b border-white/30 py-4 px-2 focus:border-white outline-none transition-colors font-mono text-sm"
            />
            <button className="reveal-up px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer active:scale-95">
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
              <li><a href="#works" className="hover:line-through transition-all">Works</a></li>
              <li><a href="#about" className="hover:line-through transition-all">About</a></li>
              <li><a href="#contact" className="hover:line-through transition-all">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Social</h4>
            <ul className="space-y-4 text-sm uppercase tracking-widest">
              <li><a href="https://www.instagram.com/bvhiewz/" className="hover:line-through transition-all">Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            © 2026 JAKE AMPONSAH. All Rights Reserved.
          </div>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/bvhiewz/" className="hover:opacity-60 transition-opacity"><Instagram size={20} /></a>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
            Designed in Accra, Ghana
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}

function ModalCarousel({ images, name }: { images: string[], name: string }) {
  return (
    <div className="relative aspect-[4/5] lg:aspect-auto overflow-hidden bg-zinc-900">
      <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="w-full h-full shrink-0 snap-center"
          >
            <ImageWithLoader 
              src={img} 
              alt={`${name} slide ${i + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageWithLoader({ src, alt, className, priority = false }: { src: string, alt: string, className?: string, priority?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div className={cn("relative w-full h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
          <LoadingSpinner />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={cn("w-full h-full object-cover transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
        onLoad={() => setIsLoading(false)}
        referrerPolicy="no-referrer"
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[60] p-4 bg-white text-black rounded-full shadow-2xl hover:bg-zinc-200 transition-colors active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function WorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const work = WORKS.find(w => w.id === Number(id));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate page data loading
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);

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

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.detail-header', { opacity: 0, y: 30, duration: 1, ease: 'power4.out' })
      .from('.detail-meta', { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, '-=0.6')
      .from('.detail-content', { opacity: 0, y: 30, duration: 1 }, '-=0.6')
      .from('.gallery-item', { 
        opacity: 0, 
        y: 50, 
        stagger: 0.2, 
        duration: 1,
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top 80%',
        }
      });
  }, { scope: containerRef });

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <nav className="flex justify-between items-center py-8">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-24 h-6" />
        </nav>
        <div className="mt-12">
          <Skeleton className="w-full h-[60vh] rounded-2xl mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
            <div className="lg:col-span-4 space-y-8">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-display mb-8">Work not found</h1>
        <Link to="/" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full">
          Back to Home
        </Link>
      </div>
    );
  }

  const nextWork = WORKS.find(w => w.id === (work.id % WORKS.length) + 1) || WORKS[0];

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-8 mix-blend-difference">
        <Link to="/" className="text-2xl font-display tracking-tighter">
          PORTFOLIO
        </Link>
        <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:opacity-60 transition-opacity">
          <ChevronLeft size={16} />
          Back to Works
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <ImageWithLoader 
          src={work.image} 
          alt={work.name} 
          className="w-full h-full grayscale brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="detail-header">
            <span className="text-xs font-mono uppercase tracking-[0.4em] opacity-60 mb-4 block">{work.category}</span>
            <h1 className="text-[10vw] font-display leading-none uppercase tracking-tighter">{work.name}</h1>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="detail-meta">
              <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Client</h4>
              <p className="text-lg uppercase tracking-tight">{work.client || 'Confidential'}</p>
            </div>
            <div className="detail-meta">
              <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Year</h4>
              <p className="text-lg uppercase tracking-tight">{work.year || '2025'}</p>
            </div>
            <div className="detail-meta">
              <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Role</h4>
              <p className="text-lg uppercase tracking-tight">{work.role || 'Lead Designer'}</p>
            </div>
          </div>
          
          <div className="lg:col-span-8 detail-content">
            <h3 className="text-3xl md:text-4xl mb-8 uppercase tracking-tight leading-tight">
              {work.description}
            </h3>
            <div className="space-y-6 text-lg opacity-70 leading-relaxed font-light max-w-2xl">
              <p>{work.longDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-6 bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex justify-between items-end">
            <h2 className="text-3xl uppercase tracking-tighter">Gallery</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const carousel = document.getElementById('gallery-carousel');
                  if (carousel) carousel.scrollBy({ left: -600, behavior: 'smooth' });
                }}
                className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => {
                  const carousel = document.getElementById('gallery-carousel');
                  if (carousel) carousel.scrollBy({ left: 600, behavior: 'smooth' });
                }}
                className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div 
            id="gallery-carousel"
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing scroll-smooth"
          >
            {work.gallery.map((img, index) => (
              <motion.div 
                key={index} 
                className="min-w-[300px] md:min-w-[600px] aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900 gallery-item snap-center shrink-0"
                whileHover={{ scale: 0.98 }}
              >
                <ImageWithLoader 
                  src={img} 
                  alt={`${work.name} gallery ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Project */}
      <section className="py-32 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest opacity-40 mb-8 block">Next Project</span>
          <Link 
            to={`/work/${nextWork.id}`}
            className="group block"
          >
            <h2 className="text-[8vw] font-display uppercase tracking-tighter group-hover:italic transition-all duration-500">
              {nextWork.name}
            </h2>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm uppercase tracking-widest font-bold">
              View Project
              <ArrowRight className="group-hover:translate-x-4 transition-transform duration-500" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
          © 2026 JAKE AMPONSAH. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:id" element={<WorkDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
