import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import emailjs from '@emailjs/browser';
import { api } from '../lib/api';

interface ContactModalProps {
  ref?: React.Ref<HTMLDivElement>;
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });
  const [isActive, setIsActive] = useState<{ [key: string]: boolean }>({});
  const [isFilled, setIsFilled] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fields = ['name', 'email', 'service', 'message'] as const;

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Initialize EmailJS with your public key
      emailjs.init('af23tA65sh8fkxJ5G');

      // Send email using EmailJS
      // Make sure to replace these with your actual EmailJS service ID and template ID
      const response = await emailjs.send(
        'service_lrefqpe', // Your EmailJS Service ID
        'template_xb95gh6',      // Your EmailJS Template ID
        {
          to_email: 'hello@foliobyjake.com',
          name: formData.name,
          email: formData.email,
          project_type: formData.service,
          message: formData.message,
          reply_to: formData.email,
        }
      );

      if (response.status === 200) {
        setShowSuccess(true);
        
        // Increment system analytics contact submissions
        api.incrementContactCount().catch(err => console.warn('Failed to register contact metric:', err));

        // Reset form after success
        setFormData({ name: '', email: '', service: '', message: '' });
        setIsFilled({});
        fields.forEach(field => setIsActive(prev => ({ ...prev, [field]: false })));

        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to send message. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, fields]);

  const handleFieldChange = useCallback((field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleFieldFocus = useCallback((field: string) => {
    setIsActive(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleFieldBlur = useCallback((field: string) => {
    setIsActive(prev => ({ ...prev, [field]: false }));
    // Update filled state
    setIsFilled(prev => ({ ...prev, [field]: formData[field as keyof typeof formData]?.toString().trim() !== '' }));
  }, [formData]);

  // GSAP animations for content elements (Framer Motion handles the slide-in)
  useGSAP(() => {
    if (!isOpen || !modalRef.current) return;

    const tl = gsap.timeline();
    tl.from('.contact-section-rule', { opacity: 0, y: 30, duration: 0.6 })
      .from('.contact-headline-wrap', { opacity: 0, y: 40, duration: 0.7 }, '-=0.3')
      .from('.contact-info', { opacity: 0, y: 40, duration: 0.7 }, '-=0.4')
      .from('.contact-form-wrap', { opacity: 0, y: 40, duration: 0.7 }, '-=0.3');
  }, { scope: modalRef, dependencies: [isOpen] });

  // Escape key close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      <motion.div
        ref={modalRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[95vw] md:w-[70vw] lg:w-180 bg-black/98 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 md:top-6 right-6 p-2 bg-black/30 hover:bg-white/10 rounded-xl border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent z-10"
          aria-label="Close contact modal"
        >
          <X size={24} aria-hidden="true" />
        </button>

        <div className="px-6 sm:px-8 py-12 sm:py-16 md:py-20 h-full flex flex-col">
          {/* Section Rule */}
          <div className="contact-section-rule flex items-center gap-5 mb-12 sm:mb-20">
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400">Contact</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Headline */}
          <div className="contact-headline-wrap mb-12 sm:mb-20 flex flex-col gap-10 md:gap-9">
            <h2 className="text-[clamp(2rem,6vw,2.5rem)] leading-[0.95] tracking-[-0.02em] font-display uppercase">
              Let's make
              <span className="text-zinc-400 italic"> something </span>
              great.
            </h2>

            <div className="space-y-7 sm:space-y-9">
              <p className="text-xs uppercase tracking-[0.18em] font-medium text-zinc-400 mb-2">Email</p>
              <a href="mailto:jakeamponsah2019@gmail.com" className="text-lg sm:text-2xl font-display no-underline hover:text-zinc-300 transition-colors block">
              jakeamponsah2019@gmail.com
              </a>
            </div>
          </div>

          {/* Grid - Stack on mobile */}
          <div className="flex lg:flex-row gap-12 sm:gap-16 lg:gap-1">
            {/* Right - Form */}
            <div className="contact-form-wrap w-full lg:w-5/5 shrink-0 pb-12">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 sm:space-y-10" noValidate>
                
                {/* Name/Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="field relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleFieldChange('name')}
                      onFocus={() => handleFieldFocus('name')}
                      onBlur={() => handleFieldBlur('name')}
                      className="w-full bg-transparent border-b border-white/20 py-2 sm:py-3 px-0 text-sm sm:text-base font-light focus:border-zinc-300 focus:placeholder-transparent outline-none transition-all peer placeholder-transparent"
                      placeholder="Full Name"
                      aria-invalid={!!errors.name}
                      required
                    />
                    <label htmlFor="name" className="absolute left-0 top-3 text-xs uppercase tracking-[0.12em] font-medium opacity-60 
                            peer-focus:top-0 peer-focus:text-[10px] peer-focus:opacity-100 peer-focus:text-zinc-300
                            peer-[.filled]:top-0 peer-[.filled]:text-[10px] peer-[.filled]:opacity-100 peer-[.filled]:text-zinc-300
                            transition-all duration-300 pointer-events-none">
                      Full Name
                    </label>
                    <div className={`field-underline h-px bg-zinc-300 transition-all duration-300 absolute bottom-0 left-0 w-0 peer-focus:w-full peer-[.active]:w-full origin-left ${isActive.name || isFilled.name ? 'w-full' : 'w-0'}`} />
                    {errors.name && <p className="mt-1 text-xs text-red-400 font-mono uppercase tracking-wider">{errors.name}</p>}
                  </div>

                  <div className="field relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFieldChange('email')}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={() => handleFieldBlur('email')}
                      className="w-full bg-transparent border-b border-white/20 py-2 sm:py-3 px-0 text-sm sm:text-base font-light focus:border-zinc-300 focus:placeholder-transparent outline-none transition-all peer placeholder-transparent"
                      placeholder="Email Address"
                      aria-invalid={!!errors.email}
                      required
                    />
                    <label htmlFor="email" className="absolute left-0 top-3 text-xs uppercase tracking-[0.12em] font-medium opacity-60 
                            peer-focus:top-0 peer-focus:text-[10px] peer-focus:opacity-100 peer-focus:text-zinc-300
                            peer-[.filled]:top-0 peer-[.filled]:text-[10px] peer-[.filled]:opacity-100 peer-[.filled]:text-zinc-300
                            transition-all duration-300 pointer-events-none">
                      Email Address
                    </label>
                    <div className={`field-underline h-px bg-zinc-300 transition-all duration-300 absolute bottom-0 left-0 w-0 peer-focus:w-full peer-[.active]:w-full origin-left ${isActive.email || isFilled.email ? 'w-full' : 'w-0'}`} />
                    {errors.email && <p className="mt-1 text-xs text-red-400 font-mono uppercase tracking-wider">{errors.email}</p>}
                  </div>
                </div>

                {/* Service */}
                <div className="field relative">
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={(e) => handleFieldChange('service')(e as any)}
                    onFocus={() => handleFieldFocus('service')}
                    onBlur={() => handleFieldBlur('service')}
                    className="w-full bg-transparent border-b border-white/20 py-3 px-0 text-base font-light focus:border-zinc-300 appearance-none outline-none transition-all peer"
                  >
                    <option value="" disabled />
                    <option value="brand">Brand Identity</option>
                    <option value="editorial">Editorial Design</option>
                    <option value="illustration">Digital Illustration</option>
                    <option value="direction">Creative Direction</option>
                    <option value="other">Other</option>
                  </select>
                  <label htmlFor="service" className="absolute left-0 top-3 text-xs uppercase tracking-[0.12em] font-medium opacity-60 
                          peer-focus:top-0 peer-focus:text-[10px] peer-focus:opacity-100 peer-focus:text-zinc-300
                          peer-[.filled]:top-0 peer-[.filled]:text-[10px] peer-[.filled]:opacity-100 peer-[.filled]:text-zinc-300
                          transition-all duration-300 pointer-events-none">
                    Type of Project
                  </label>
                  <div className={`field-underline h-px bg-zinc-300 transition-all duration-300 absolute bottom-0 left-0 w-0 peer-focus:w-full peer-[.active]:w-full origin-left ${isActive.service || isFilled.service ? 'w-full' : 'w-0'}`} />
                  {errors.service && <p className="mt-1 text-xs text-red-400 font-mono uppercase tracking-wider">{errors.service}</p>}
                </div>

                {/* Message */}
                <div className="field relative">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleFieldChange('message')}
                    onFocus={() => handleFieldFocus('message')}
                    onBlur={() => handleFieldBlur('message')}
                    className="w-full bg-transparent border-b border-white/20 py-2 sm:py-3 px-0 text-sm sm:text-base font-light resize-none focus:border-zinc-300 focus:placeholder-transparent outline-none transition-all peer placeholder-transparent min-h-25 sm:min-h-30"
                    placeholder="Tell me about your project"
                    aria-invalid={!!errors.message}
                    required
                  />
                  <label htmlFor="message" className="absolute left-0 top-3 text-xs uppercase tracking-[0.12em] font-medium opacity-60 
                          peer-focus:top-0 peer-focus:text-[10px] peer-focus:opacity-100 peer-focus:text-zinc-300
                          peer-[.filled]:top-0 peer-[.filled]:text-[10px] peer-[.filled]:opacity-100 peer-[.filled]:text-zinc-300
                          transition-all duration-300 pointer-events-none">
                    Tell me about your project
                  </label>
                  <div className={`field-underline h-px bg-zinc-300 transition-all duration-300 absolute bottom-0 left-0 w-0 peer-focus:w-full peer-[.active]:w-full origin-left ${isActive.message || isFilled.message ? 'w-full' : 'w-0'}`} />
                  {errors.message && <p className="mt-1 text-xs text-red-400 font-mono uppercase tracking-wider">{errors.message}</p>}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-4 pb-6 border-t border-white/10">
                  <p className="text-xs sm:text-sm font-medium opacity-60 uppercase tracking-wide">
                    I usually respond within 24–48 hours.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex items-center gap-3 sm:gap-4 bg-black border border-white/20 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-medium uppercase tracking-[0.14em] sm:tracking-[0.16em] text-xs sm:text-sm hover:bg-zinc-900 hover:border-zinc-300 isabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                  >
                    <span className="relative z-10">Send Message</span>
                    <div className="arrow w-5 h-px bg-current group-hover:w-7 transition-all origin-left" />
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-zinc-300 group-hover:animate-slide-right -z-10" />
                    )}
                  </button>
                </div>
              </form>

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 pt-6 border-t border-zinc-700"
                  >
                    <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-300">Message sent — I'll be in touch soon.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ContactModal;