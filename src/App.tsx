/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useEffect, useRef, useState, useCallback, useMemo, memo,
} from 'react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  X, ArrowRight, Instagram, ExternalLink,
  ChevronLeft, ChevronRight, ArrowUp, Menu,
} from 'lucide-react';
import ContactModal from './components/ContactModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrowserRouter, Routes, Route, Link,
  useParams, useNavigate, useLocation,
} from 'react-router-dom';
import Lenis from 'lenis';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility 
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cloudinary Helpers 
const CLOUD_NAME = 'degd6ahfu';

function cldImage(url: string, transforms = 'f_auto,q_auto:good,w_1200'): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

function cldEmbedToVideo(embedUrl: string, transforms = 'f_auto,q_auto:eco,w_900'): string {
  const match = embedUrl.match(/public_id=([^&]+)/);
  if (!match) return embedUrl;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${decodeURIComponent(match[1])}.mp4`;
}

function cldLqip(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return '';
  if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/w_')) return '';
  return url.replace('/upload/', '/upload/f_auto,q_auto:low,w_30,e_blur:800/');
}

// Loading UI
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-white/5 rounded-lg', className)} aria-hidden="true" />
);

// GSAP Setup
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Types 
interface Work {
  id: number;
  name: string;
  category: string;
  image?: string;
  video?: string;
  previewImage?: string;
  previewVideo?: string;
  heroImage?: string;
  heroVideo?: string;
  description: string;
  longDescription: string;
  gallery: string[];
  client?: string;
  year?: string;
  role?: string;
}

// Works Data
const WORKS: Work[] = [
  {
    id: 1,
    name: 'Fixed Youth Conference',
    category: 'Graphic Design',
    previewVideo: 'https://player.cloudinary.com/embed/?cloud_name=degd6ahfu&public_id=fxdythconcover_ll2nfk&autoplay=true&muted=true&loop=true&player[hide_controls]=true',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg',
    description: 'A COMPREHENSIVE BRANDING PROJECT FOR A FAITH-BASED YOUTH CONFERENCE, FOCUSED ON CREATING A BOLD, CULTURALLY RELEVANT VISUAL IDENTITY ROOTED IN THE MESSAGE OF THE GOSPEL.',
    longDescription: 'This project involved developing a complete visual identity for FIXED YOUTH CON 2026, a dynamic youth conference hosted by EWC FIXED Teens Church. The objective was to translate a deeply spiritual message into a modern, engaging brand that resonates with today\'s generation. The challenge was to balance clarity of the Gospel message with high-impact visual storytelling that feels fresh, youthful, and culturally aligned. The identity system was built from the ground up, including logo design, typography direction, color systems, and scalable assets across digital and print platforms.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/14_zlxozl.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/2_jrisoo.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/3_ba5hmh.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/26_rt15ep.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/30_dzuiob.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/5_fdzjf1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/7_olui9d.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/18_bajx9j.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/35_uyjv3j.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/9_fca1fd.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/4_kluty2.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/12_asdues.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/11_siobas.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/36_xsjomz.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/8_ichaae.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576067/16_qzf6d1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/29_f31vsf.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/32_octwo6.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/31_d8cihb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/20_jgxzsl.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/10_y7cf9b.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/17_gb6giz.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/28_oraqjh.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/24_pvjohp.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576070/22_adh37d.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/6_crc8p6.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576065/13_p6u3vy.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/25_hc0q6y.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/27_pnxxlm.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/33_kpffn1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/19_hyst5x.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/15_fs5nui.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576070/21_lcp79w.jpg',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130820/IMG_5038_huih0w.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130687/IMG_5040_ooqaiq.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775169590/IMG_5064_9.43.22_PM_zr5dij.mov',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130954/IMG_5039_ngvq7u.mp4',
    ],
    client: 'EWC Fixed Teen\'s Church',
    year: '2026',
    role: 'Lead Conference Brand Designer',
  },
  {
    id: 2,
    name: 'UAI by TúNiyi',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/c_thumb,g_face,w_800/v1774561640/tuniyi_PORTRAIT_COVER_yxvs6h.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg',
    description: 'A BRAND IDENTITY FOR A CONCEPTUAL FASHION LABEL EXPLORING THE INTERSECTION OF HUMAN VISION, SELF-EXPRESSION, AND ARTIFICIAL INTELLIGENCE.',
    longDescription: 'Developed for UAl by TúNiyi, this project transforms the philosophy "You Are Important" into a visually striking and intellectually grounded brand system. Inspired by the spectrum of human vision (20/20–20/200), the identity challenges how individuals perceive and utilize fashion as a form of expression.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442415/Jeans_Mock_up_gcktgr.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442667/STYLING_300x-100_dkbtrs.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442666/CLOTHES_AND_MERCH_300x-100_mnxlwj.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442413/Sweatshirt_2_Mock_Up_zfoxuf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442411/tuniyi_post_5_wxbsdm.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442409/Free_Poster_Mockup_hhudxf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442008/tuniyi_post_6_d52cbe.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442411/Sweatshirt_Mock_Up_knhws5.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442407/Citylight_Mockup_2_oxd0ju.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442008/Vector_Smart_Object_u7u9um.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442410/BRAND_IDENTITY_300x-100_e73mdy.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774471199/tuniyi_post_1_qy6fn1.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442418/tuniyi_post_2_yrrulk.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442006/FREE-Silk-Scarf-Mockup-Studio-Series-DEMO_By-Mocku_yyuggy.png',
    ],
    client: 'TúNiyi',
    year: '2025',
    role: 'Brand Identity Designer',
  },
  {
    id: 3,
    name: 'Scolpta (Ashesi Career Fair)',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/c_fill,w_1920,h_1080/v1774425611/Artboard_1_fxrrrq.jpg',
    description: 'A BRAND IDENTITY AND EXPERIENTIAL DESIGN PROJECT FOR A GEN Z–FOCUSED CAREER FAIR ACTIVATION.',
    longDescription: 'This project involved creating a bold and unconventional visual identity for Scolpta\'s career fair presence. The concept "Think Upside Down" challenged traditional corporate communication by introducing a playful and disruptive design language rooted in Y2K aesthetics and Gen Z culture.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425610/Artboard_2_copy_10_sqyv8y.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774440404/setup__c86oxu.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774440405/stup_2_xidnzf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/board_1_rb71ut.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425613/Artboard_9_sye9mn.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425611/_MG_8714_na4lgt.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425611/Artboard_5_wqyf7l.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425613/Artboard_12_kx71wy.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425617/View_3_b0zaay.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425611/Artboard_4_ugglwp.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425612/Artboard_8_odb620.jpg',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446446/work_with_us_motion_3.0_vgu5uv.mp4',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425613/Artboard_11_pnj5gj.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774440404/scolpta_logo__xyssqt.png',
    ],
    client: 'Scolpta',
    year: '2026',
    role: 'Brand Identity & Experiential Designer',
  },
  {
    id: 4,
    name: 'VANT',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628837/cover_portrait_4x-100_pz4u6u.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_1_4x-100_jl5nih.jpg',
    description: 'A BRAND IDENTITY PROJECT FOR A CONTEMPORARY FASHION LABEL BUILT AROUND PERSPECTIVE, RESTRAINT, AND QUIET CONFIDENCE.',
    longDescription: 'This project translates the idea of vantage into a refined visual system centered on structure and restraint. Using New York typography and a restrained black, white, and ash palette, the identity emphasises balance, contrast, and composure. VANT is not about noise — it is about perspective.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628830/Artboard_8_4x-100_yyxc4i.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_2_copy_4x-100_rhhmfx.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_2_4x-100_cqpzrz.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628828/Artboard_5_4x-100_szeqcb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628838/Artboard_10_4x-100_tbkaui.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628827/Artboard_3_4x-100_mbfpxb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628832/Artboard_10_copy_4x-100_mxi6x4.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628836/Artboard_15_4x-100_ubxvlg.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628833/Artboard_9_4x-100_fuyvwl.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628834/Artboard_12_4x-100_esw5tq.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628828/Artboard_6_4x-100_ckuqie.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628833/Artboard_11_4x-100_rxoc56.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628836/Artboard_17_4x-100_ji8yq2.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628838/Artboard_16_4x-100_axeqyi.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628836/Artboard_14_4x-100_z32uu4.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628834/Artboard_13_4x-100_lvrzvs.jpg',
    ],
    client: 'VANT',
    year: '2026',
    role: 'Brand Identity Designer',
  },
  {
    id: 5,
    name: 'Main Squeeze',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633759/COVER_b61g2a.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633765/MAIN_SQUEEZE_4x-100_or8fag.jpg',
    description: 'A BRAND IDENTITY PROJECT FOR A MODERN BEVERAGE BRAND, FOCUSED ON FRESHNESS, ENERGY, AND BOLD VISUAL APPEAL.',
    longDescription: 'A branding project for Main Squeeze, a beverage brand focused on freshness and energy. The direction leaned into bold typography and clean layouts while feeling consistent and recognisable across packaging and promo materials.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633759/Artboard_5_4x-100_ho8lbg.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633761/IMG_2335_hfuvwr.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633763/IMG_2340_fc4pik.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633757/Artboard_12_4x-100_vol3br.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633760/IMG_2336_uauhwv.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633758/Artboard_4_4x-100_jkpmai.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633763/IMG_2341_tp0vik.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633763/IMG_2339_agzarn.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633755/Artboard_3_4x-100_emzslj.jpg',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774633772/99B98ED4-9383-4541-BDB8-42831F66F7C9_gbqdog.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774633758/c2f141b513704558b8fea924c221e12b_nc29m1.mp4',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633755/Artboard_2_4x-100_yodrxg.jpg',
    ],
    client: 'Ms Jo',
    year: '2023',
    role: 'Brand Identity Designer',
  },
  {
    id: 6,
    name: 'Stackz',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774642493/Artboard_10_4x-100_copy_wmgwyw.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640756/Artboard_1_4x-100_tzpe6t.jpg',
    description: 'BRAND IDENTITY (AVAILABLE FOR SALE)',
    longDescription: 'A self-initiated branding project for Stackz, a pastry brand inspired by a family-style tradition of stacked desserts. The project is currently available for sale, including full brand identity and concept.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640780/Artboard_14_4x-100_otsrtp.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640733/Artboard_8_4x-100_s59olb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640740/Artboard_5_4x-100_zsgqvx.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640773/Artboard_11_4x-100_efloea.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640745/Artboard_10_4x-100_q9u1cn.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640745/Artboard_9_4x-100_nasrxc.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640797/Artboard_2_4x-100_x6rcrh.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640727/Artboard_3_4x-100_kttlbi.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640739/Artboard_6_4x-100_vmrz4z.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640798/Artboard_13_4x-100_h9s6rd.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640738/Artboard_4_4x-100_thdhcr.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640737/Artboard_7_4x-100_hw61a9.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640777/Artboard_12_4x-100_k7l5ry.jpg',
    ],
    client: 'Self Initiated',
    year: '2024',
    role: 'Brand Identity Designer',
  },
  {
    id: 7,
    name: 'Motion',
    category: 'Motion Graphics',
    previewVideo: 'https://player.cloudinary.com/embed/?cloud_name=degd6ahfu&public_id=work_with_us_motion_3.0_vgu5uv',
    heroVideo: 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4',
    description: 'A COLLECTION OF MOTION-DRIVEN VISUALS DESIGNED TO BRING BRANDS AND IDEAS TO LIFE THROUGH DYNAMIC STORYTELLING.',
    longDescription: 'This body of work explores the intersection of design and movement, transforming static visuals into engaging, immersive experiences through typography-driven animations and brand-focused motion systems.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446446/work_with_us_motion_3.0_vgu5uv.mp4',
    ],
    client: 'Personal Project',
    year: '2026',
    role: 'Motion Designer',
  },
  // {
  //   id: 8,
  //   name: 'Digital Art',
  //   category: 'Digital art',
  //   previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639542/Use_this_as_cover_busnvj.png',
  //   heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639538/web_banner_2_wojtaz.png',
  //   description: 'A series of abstract 3D renders exploring texture, light, and form in a virtual environment.',
  //   longDescription: 'This personal exploration pushed the boundaries of procedural material generation in Blender, focusing on the contrast between organic forms and harsh metallic surfaces.',
  //   gallery: [
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639538/pappy_kojo_nothing_matters_BACK_ihgjrc.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639539/love_and_hate_art_zkc5c6.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639540/p_mpwtoo.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639539/kenyaan_car_deluxe_version_xk1wvp.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639535/create_with_jake_tsbafc.png',
  //   ],
  //   client: '',
  //   year: '2023 - 2026',
  //   role: 'Digital Artist',
  // },
  // {
  //   id: 9,
  //   name: 'Creative Exploration',
  //   category: 'Creative Explorations',
  //   previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639570/BRAND_IDENTITY_qzhdw9.png',
  //   heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639571/BM_ADS_FLYERS-02_zkdrxo.png',
  //   description: 'Eco-friendly packaging design for a premium skincare line.',
  //   longDescription: 'For Nura Skincare, we developed a packaging system using 100% recycled paper and soy-based inks. The visual language uses delicate botanical illustrations and a muted, earthy colour palette.',
  //   gallery: [
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639572/Screenshot_2025-02-19_074920_kok6ds.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639579/BM_ADS_FLYERS-01_2_vn9ncj.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639579/bm_matt_drxmk0.png',
  //     'https://res.cloudinary.com/degd6ahfu/image/upload/v1774639581/bm_emulsion_fjeunz.png',
  //   ],
  //   client: 'Nura Skincare',
  //   year: '2024',
  //   role: 'Packaging Designer',
  // },
];

// Custom Hooks 
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', h);
    return () => mql.removeEventListener('change', h);
  }, []);
  return reduced;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let rafId: number;
    const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor?.hash && anchor.origin === window.location.origin) {
        const el = document.querySelector(anchor.hash);
        if (el instanceof HTMLElement) { e.preventDefault(); lenis.scrollTo(el); }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [enabled]);
}

function useInView(ref: React.RefObject<Element | null>, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return inView;
}

/** Traps Tab focus inside `ref` while `isActive`. Restores focus on deactivate. */
function useFocusTrap(ref: React.RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;
    const container = ref.current;
    const prev = document.activeElement as HTMLElement | null;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
      )
    );
    (focusable[0] as HTMLElement)?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); } }
    };
    container.addEventListener('keydown', trap);
    return () => { container.removeEventListener('keydown', trap); prev?.focus(); };
  }, [isActive, ref]);
}

/** Updates <title> and <meta name="description"> on route change. */
function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content = description;
  }, [title, description]);
}

// Media Helpers 
function isVideo(url: string) {
  return url.includes('/video/') || /\.(mp4|webm|mov|avi)$/i.test(url);
}

// MediaLoader 

interface MediaLoaderProps {
  src: string;
  alt: string;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
  transforms?: string;
}

const MediaLoader = memo(function MediaLoader({
  src, alt, className, mediaClassName,
  priority = false,
  transforms = 'f_auto,q_auto:good,w_1400',
}: MediaLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(wrapperRef as React.RefObject<Element>, '300px');
  const shouldLoad = priority || inView;
  const isVid = isVideo(src);
  const optimizedSrc = isVid ? src : cldImage(src, transforms);
  const lqipSrc = isVid ? '' : cldLqip(src);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
    if (isVid) videoRef.current?.play().catch(() => {});
  }, [isVid]);

  const onError = useCallback(() => { setIsLoaded(true); setHasError(true); }, []);

  return (
    <div ref={wrapperRef} className={cn('relative w-full h-full overflow-hidden bg-zinc-900', className)}>
      {!isVid && lqipSrc && !isLoaded && shouldLoad && (
        <img src={lqipSrc} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm" />
      )}
      {(!shouldLoad || !isLoaded) && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      )}
      {hasError && (
        <p role="img" aria-label="Media unavailable"
          className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs font-mono uppercase tracking-widest">
          Media unavailable
        </p>
      )}
      {shouldLoad && !hasError && (
        isVid
          ? <video ref={videoRef} src={optimizedSrc}
              className={cn('w-full h-full object-cover transition-opacity duration-700', isLoaded ? 'opacity-100' : 'opacity-0', mediaClassName)}
              playsInline loop muted preload={priority ? 'auto' : 'metadata'}
              onLoadedData={onLoad} onError={onError} />
          : <img src={optimizedSrc} alt={alt}
              className={cn('w-full h-full object-cover transition-opacity duration-700', isLoaded ? 'opacity-100' : 'opacity-0', mediaClassName)}
              onLoad={onLoad} onError={onError} referrerPolicy="no-referrer"
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'low'} />
      )}
    </div>
  );
});

// PreviewVideo 
const PreviewVideo = memo(function PreviewVideo({
  embedUrl, name, className,
}: { embedUrl: string; name: string; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const inView = useInView(wrapperRef as React.RefObject<Element>, '400px');
  const directUrl = cldEmbedToVideo(embedUrl, 'f_auto,q_auto:eco,w_900,c_fill,ar_4:5');

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !inView) return;
    v.play().catch(() => {});
    return () => { v.pause(); };
  }, [inView]);

  return (
    <div ref={wrapperRef} className={cn('relative w-full h-full bg-zinc-900', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      )}
      {inView && (
        <video ref={videoRef} src={directUrl}
          className={cn('w-full h-full object-cover transition-opacity duration-700', isLoaded ? 'opacity-100' : 'opacity-0')}
          playsInline loop muted preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          aria-hidden="true"
          title={`${name} preview`}
        />
      )}
    </div>
  );
});

// WorkCard
const WorkCard = memo(function WorkCard({ work, onClick }: { work: Work; onClick: (w: Work) => void }) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(work); }
  };
  return (
    <article
      className="work-card group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-sm"
      onClick={() => onClick(work)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`Open ${work.name} — ${work.category}`}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-zinc-900">
        {work.previewVideo
          ? <PreviewVideo embedUrl={work.previewVideo} name={work.name}
              className="grayscale group-hover:grayscale-0 transition-all duration-1000 w-full h-full" />
          : <MediaLoader
              src={work.previewImage || work.image || ''}
              alt={`${work.name} — ${work.category} thumbnail`}
              transforms="f_auto,q_auto:good,w_600,c_fill,ar_4:5"
              mediaClassName="grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
            />}
        <div
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-500 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 block px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest">
            View Work
          </span>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl tracking-tight uppercase group-hover:text-zinc-400 transition-colors">{work.name}</h3>
        <p className="text-xs font-mono opacity-60 mt-1 uppercase">{work.category}</p>
      </div>
    </article>
  );
});

// BackToTop
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.pageYOffset > 500);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top of page"
          className="fixed bottom-8 right-8 z-60 p-4 bg-white text-black rounded-full shadow-2xl hover:bg-zinc-200 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          <ArrowUp size={24} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ModalPoster
function ModalPoster({ mainImage, mainVideo, name }: { mainImage?: string; mainVideo?: string; name: string }) {
  return (
    <div className="relative aspect-4/5 lg:aspect-auto overflow-hidden bg-zinc-900">
      {mainVideo
        ? <PreviewVideo embedUrl={mainVideo} name={name} className="w-full h-full" />
        : <MediaLoader src={mainImage || ''} alt={`${name} — project preview`} priority
            transforms="f_auto,q_auto:good,w_1200" className="w-full h-full object-cover" />}
    </div>
  );
}

// Home
function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [savedScrollY, setSavedScrollY] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  usePageMeta(
    'Jake Amponsah — Graphic Designer & Digital Artist | Accra, Ghana',
    'Multi-disciplinary graphic designer and digital artist based in Accra, Ghana. Brand identity, motion graphics, and immersive digital experiences.'
  );

  useSmoothScroll(!reduced);
  useFocusTrap(modalRef, !!selectedWork);
  const contactModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(contactModalRef, isContactOpen);

  // Scroll lock when modal is open
  useEffect(() => {
    if (selectedWork || isContactOpen) {
      setSavedScrollY(window.scrollY);
      document.body.style.cssText = `position:fixed;top:-${window.scrollY}px;left:0;right:0;overflow:hidden;width:100%`;
    } else {
      document.body.style.cssText = '';
      window.scrollTo(0, savedScrollY);
    }
    return () => { document.body.style.cssText = ''; };
  }, [selectedWork, isContactOpen]);

  // Global Escape to close modal
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedWork(null); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const categories = useMemo(() => Array.from(new Set(WORKS.map(w => w.category))), []);
  const filteredWorks = useMemo(() => WORKS.filter(w => !selectedCategory || w.category === selectedCategory), [selectedCategory]);
  const visibleWorks = useMemo(() => isExpanded ? filteredWorks : filteredWorks.slice(0, 6), [isExpanded, filteredWorks]);

  const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
    setEmailError('');
    setIsSubmitted(true);
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  useGSAP(() => {
    if (reduced) {
      setIsIntroComplete(true);
      return;
    }
    const intro = gsap.timeline({ onComplete: () => setIsIntroComplete(true) });
    intro
      .set('.intro-logo', { opacity: 0, scale: 1.5, y: 50 })
      .to('.intro-logo', { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out' })
      .to('.intro-logo', { scale: 0.25, y: -window.innerHeight / 2 + 40, duration: 1.2, ease: 'expo.inOut' }, '+=0.5')
      .to('.intro-overlay', { opacity: 0, duration: 0.8, pointerEvents: 'none' }, '-=0.4')
      .from('.nav-item', { opacity: 0, y: -20, stagger: 0.1, duration: 0.8 }, '-=0.4');

    gsap.timeline({ delay: 3 })
      .from('.hero-title span', { y: 100, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out' })
      .from('.hero-sub', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5')
      .from('.hero-btn', { scale: 0.8, opacity: 0, duration: 0.5 }, '-=0.3');

    gsap.utils.toArray('.reveal-up:not(#contact *)').forEach((el: any) =>
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
      })
    );

    gsap.to('.marquee-inner', { xPercent: -50, repeat: -1, duration: 10, ease: 'none' });

    gsap.from('.work-card', {
      scrollTrigger: { trigger: '.work-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
      y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
    });
  }, { scope: containerRef, dependencies: [reduced] });

  const menuId = 'mobile-nav-menu';

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-black text-white">

      {/* Intro overlay */}
      {!isIntroComplete && (
        <div className="intro-overlay fixed inset-0 z-100 bg-black flex items-center justify-center overflow-hidden" aria-hidden="true">
          <p className="intro-logo text-[12vw] font-display tracking-tighter whitespace-nowrap">PORTFOLIO</p>
        </div>
      )}

      {/* ─ Header / Nav */}
      <header>
        <nav
          className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 mix-blend-difference"
          aria-label="Primary navigation"
        >
          <a
            ref={logoRef}
            href="/"
            className="nav-item text-2xl md:text-3xl font-display tracking-tighter absolute left-1/2 -translate-x-1/2 focus:outline-none focus:underline"
            aria-label="Jake Amponsah — back to home"
          >
            PORTFOLIO
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 ml-auto nav-item">
            {[['#works','Works'],['#about','About'],['#contact','Contact']].map(([href, label]) => (
              <a key={label} href={href}
                className="text-xs font-mono uppercase tracking-widest hover:opacity-60 transition-opacity focus:outline-none focus:underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                }}>
                {label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden items-center justify-center p-2 ml-auto nav-item focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={() => setIsMenuOpen(v => !v)}
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </nav>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id={menuId}
              role="dialog" aria-modal="true" aria-label="Navigation menu"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-60 bg-white text-black p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-3xl font-display">PORTFOLIO</span>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close navigation menu"
                  className="focus:outline-none focus:ring-2 focus:ring-black rounded">
                  <X size={32} aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Mobile navigation links">
                <ul className="flex flex-col gap-8 text-6xl md:text-8xl font-display uppercase tracking-tighter list-none">
                {[['#works','Works'],['#about','About'],['#contact','Contact']].map(([href, label], i) => (
                    <li key={label}>
                      <motion.a
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i + 1) * 0.1 }}
                        href={href} onClick={(e) => {
                          e.preventDefault();
                          setIsMenuOpen(false);
                          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:italic transition-all focus:outline-none focus:underline"
                      >{label}</motion.a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex justify-between items-end">
                <a href="https://www.instagram.com/bvhiewz/" target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram (opens in new tab)"
                  className="focus:outline-none focus:ring-2 focus:ring-black rounded">
                  <Instagram size={20} aria-hidden="true" />
                </a>
                <p className="text-xs font-mono uppercase tracking-widest">© 2026 JAKE AMPONSAH</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─ Main ─ */}
      <main id="main-content">

        {/* Hero */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
          aria-label="Introduction">
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=degd6ahfu&public_id=videoExport-2026-03-20_03-00-23.875-2800x1750_60fps_i9tkw1&autoplay=true&loop=true&muted=true&player[hide_controls]=true&player[transformation][width]=1920&player[transformation][crop]=limit"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,160vh)] h-[max(100vh,62.5vw)] border-0 opacity-40 pointer-events-none"
              allow="autoplay; fullscreen" title="Decorative background reel" tabIndex={-1}
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black" />
          </div>
          <div className="relative z-10 w-full px-6">
            <h1 className="hero-title font-jake text-[clamp(3rem,15vw,12rem)] leading-[0.85] flex flex-col items-center overflow-x-visible">
              <span className="block">JAKE</span>
              <span className="block tracking-normal">AMPONSAH</span>
            </h1>
            <p className="hero-sub mt-8 text-sm md:text-lg max-w-xl mx-auto font-mono uppercase tracking-widest opacity-80">
              Graphic designer&nbsp;·&nbsp;Digital artist
            </p>
            <a
              href="#works"
              className="hero-btn mt-12 px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-white transition-all duration-300 inline-flex items-center gap-2 group mx-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              View Works
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} aria-hidden="true" />
            </a>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50" aria-hidden="true">
            <div className="w-px h-12 bg-white" />
          </div>
        </section>

        {/* Marquee */}
        <div className="py-12 border-y border-white/10 overflow-hidden whitespace-nowrap bg-white text-black" aria-label="Software skills">
          <div className="marquee-inner flex gap-12 text-4xl md:text-6xl font-display uppercase tracking-tighter" aria-hidden="true">
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
          <ul className="sr-only">
            <li>Photoshop</li><li>Illustrator</li><li>After Effects</li><li>Premiere Pro</li><li>InDesign</li>
          </ul>
        </div>

        {/* Works */}
        <section id="works" className="py-24 px-6 max-w-7xl mx-auto" aria-labelledby="works-heading"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 2000px' } as React.CSSProperties}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="reveal-up">
              <h2 id="works-heading" className="text-5xl md:text-7xl uppercase tracking-tighter">RECENT PROJECTS</h2>
              <p className="font-mono uppercase tracking-widest opacity-60 mt-4">Selected works from 2023–2026</p>
            </div>
            <button
              onClick={() => setIsExpanded(v => !v)}
              aria-expanded={isExpanded}
              className="reveal-up text-xs uppercase tracking-widest font-bold border-b border-white pt-1 pb-1 px-1 hover:opacity-60 cursor-pointer transition-opacity focus:outline-none focus:ring-1 focus:ring-white"
            >
              {isExpanded ? 'View Less Works' : 'View More Works'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 reveal-up"
            role="group" aria-label="Filter projects by category">
            <button onClick={() => setSelectedCategory(null)} aria-pressed={!selectedCategory}
              className={cn('px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border focus:outline-none focus:ring-2 focus:ring-white',
                !selectedCategory ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white cursor-pointer')}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} aria-pressed={selectedCategory === cat}
                className={cn('px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border focus:outline-none focus:ring-2 focus:ring-white',
                  selectedCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white cursor-pointer')}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 work-grid">
            {visibleWorks.map(work => (
              <WorkCard key={work.id} work={work} onClick={setSelectedWork} />
            ))}
          </div>

          {isExpanded && (
            <div className="mt-20 flex justify-center">
              <button
                onClick={() => { setIsExpanded(false); document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-10 py-4 border border-white/20 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all focus:outline-none focus:ring-2 focus:ring-white"
              >View Less Works</button>
            </div>
          )}
        </section>

        {/* Modal */}
        <AnimatePresence>
          {selectedWork && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedWork(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-md" aria-hidden="true" />

              <motion.div
                ref={modalRef}
                role="dialog" aria-modal="true" aria-labelledby="modal-work-title"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-zinc-950 rounded-2xl overflow-y-auto grid grid-cols-1 lg:grid-cols-2 shadow-2xl"
              >
                <button
                  onClick={() => setSelectedWork(null)}
                  aria-label={`Close ${selectedWork.name} preview`}
                  className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X size={24} aria-hidden="true" />
                </button>

                <div className="p-8 pb-4 lg:hidden">
                  <h2 id="modal-work-title" className="text-3xl uppercase tracking-tighter leading-none">{selectedWork.name}</h2>
                </div>

                <ModalPoster mainImage={selectedWork.previewImage || selectedWork.image}
                  mainVideo={selectedWork.previewVideo || selectedWork.video} name={selectedWork.name} />

                <div className="p-8 md:p-16 flex flex-col justify-center">
                  <div className="mb-8 hidden lg:block">
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">{selectedWork.category}</span>
                    <h2 id="modal-work-title" className="text-4xl md:text-7xl mt-4 uppercase tracking-tighter leading-none">{selectedWork.name}</h2>
                  </div>
                  <p className="text-lg md:text-xl opacity-70 leading-relaxed font-light mb-12 hidden lg:block">
                    {selectedWork.description}
                  </p>
                  <dl className="hidden lg:flex flex-wrap gap-4 pt-8 border-t border-white/10">
                    <div className="flex flex-col">
                      <dt className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Year</dt>
                      <dd className="text-sm uppercase">{selectedWork.year || '2026'}</dd>
                    </div>
                    <div className="flex flex-col ml-12">
                      <dt className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Role</dt>
                      <dd className="text-sm uppercase">{selectedWork.role || 'Lead Artist'}</dd>
                    </div>
                  </dl>
                  <div className="mt-8 lg:mt-12">
                    <button
                      onClick={() => navigate(`/work/${selectedWork.id}`)}
                      aria-label={`View full details for ${selectedWork.name}`}
                      className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold group hover:text-zinc-400 transition-colors focus:outline-none focus:underline"
                    >
                      View Full Details
                      <ExternalLink size={18} aria-hidden="true" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* About */}
        <section id="about" className="py-32 bg-zinc-950 relative overflow-hidden" aria-labelledby="about-heading"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' } as React.CSSProperties}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal-up order-2 lg:order-1">
              <h2 id="about-heading" className="text-[clamp(3rem,8vw,6rem)] leading-none mb-12 uppercase tracking-tighter">
                Creative <br />
                <em className="italic font-serif lowercase tracking-normal text-zinc-500">Visionary</em><br />
                & Designer
              </h2>
              <div className="space-y-6 text-lg opacity-80 max-w-lg">
                <p>Jake Amponsah is a multi-disciplinary designer based in Accra, Ghana. His work lives at the intersection of traditional graphic design and modern digital art.</p>
                <p>With over 5 years of experience, he has helped brands tell their stories through compelling visuals and immersive digital experiences.</p>
              </div>
              <p className="mt-12 text-xs uppercase tracking-[0.3em] font-bold flex items-center gap-4 group">
                Portfolio. by Jake
                <span className="w-12 h-px bg-white group-hover:w-20 transition-all duration-500" aria-hidden="true" />
              </p>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-3/4 overflow-hidden rounded-2xl">
                <MediaLoader
                  src="https://res.cloudinary.com/degd6ahfu/image/upload/v1773974518/PHOTO-2026-03-17-23-00-06_ralnm5.jpg"
                  alt="Jake Amponsah, Graphic Designer & Digital Artist based in Accra, Ghana"
                  transforms="f_auto,q_auto:good,w_800"
                  mediaClassName="grayscale"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white text-black p-6 rounded-full flex flex-col items-center justify-center text-center reveal-up" aria-label="Over 5 years of experience">
                <span className="text-xs font-mono uppercase tracking-widest mb-2" aria-hidden="true">Exp.</span>
                <span className="text-4xl font-display" aria-hidden="true">5+ YRS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA - triggers modal */}
        <section id="contact" className="py-24 px-6 border-t border-white/10" aria-labelledby="contact-heading">
          <div className="max-w-3xl mx-auto text-center reveal-up">
            <h2 id="contact-heading" className="text-4xl md:text-6xl mb-8 uppercase tracking-tighter">Let's Work Together</h2>
              <p className="font-mono uppercase tracking-widest opacity-60 mb-12 max-w-lg mx-auto">
              Available for freelance projects and collaborations.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsContactOpen(true)}
              className="mt-10 md:mt-0 px-12 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-100 active:scale-95 rounded-full transition-all shadow-2xl border-2 border-white focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
              aria-label="Open contact form"
            >
              Get In Touch
              <ArrowRight size={20} className="ml-2 inline" aria-hidden="true" />
            </motion.button>
          </div>
        </section>

        {/* Contact Modal */}
        <AnimatePresence>
          {isContactOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
                onClick={() => setIsContactOpen(false)}
                aria-hidden="true"
              />
              <ContactModal ref={contactModalRef} isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black" aria-label="Site footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <p className="text-4xl font-display mb-6 tracking-tighter">JAKE AMPONSAH</p>
            <p className="max-w-xs opacity-60 text-sm leading-relaxed">
              Graphic designer and digital artist specialising in branding, motion, and immersive digital experiences.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Navigation</h3>
            <ul className="space-y-4 text-sm uppercase tracking-widest list-none">
              {[['#works','Works'],['#about','About'],['#contact','Contact']].map(([href,label]) => (
                <li key={label}><a href={href} className="hover:line-through transition-all focus:outline-none focus:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                  }}>{label}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Social media">
            <h3 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-40">Social</h3>
            <ul className="space-y-4 text-sm uppercase tracking-widest list-none">
              <li>
                <a href="https://www.instagram.com/bvhiewz/" target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram (opens in new tab)"
                  className="hover:line-through transition-all focus:outline-none focus:underline">
                  Instagram
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
          <small className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">© 2026 Jake Amponsah. All Rights Reserved.</small>
          <a href="https://www.instagram.com/bvhiewz/" target="_blank" rel="noopener noreferrer"
            aria-label="Instagram (opens in new tab)"
            className="hover:opacity-60 transition-opacity focus:outline-none focus:ring-1 focus:ring-white rounded">
            <Instagram size={20} aria-hidden="true" />
          </a>
          <small className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Designed in Accra, Ghana</small>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}

// WorkDetail

function WorkDetail() {
  const { id } = useParams();
  const work = WORKS.find(w => w.id === Number(id));
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  usePageMeta(
    work ? `${work.name} — Jake Amponsah | ${work.category}` : 'Work not found — Jake Amponsah',
    work ? work.description.charAt(0) + work.description.slice(1).toLowerCase() : 'Project not found.'
  );

  useSmoothScroll(!reduced);
  useFocusTrap(lightboxRef, lightboxIndex !== null);

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 600);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (lightboxIndex === null || !work) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightboxIndex(p => p !== null ? (p + 1) % work.gallery.length : null);
      else if (e.key === 'ArrowLeft') setLightboxIndex(p => p !== null ? (p - 1 + work.gallery.length) % work.gallery.length : null);
      else if (e.key === 'Escape') { setLightboxIndex(null); triggerRefs.current[lightboxIndex]?.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightboxIndex, work]);

  useGSAP(() => {
    if (reduced) return;
    gsap.timeline()
      .from('.detail-header', { opacity: 0, y: 30, duration: 1, ease: 'power4.out' })
      .from('.detail-meta', { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, '-=0.6')
      .from('.detail-content', { opacity: 0, y: 30, duration: 1 }, '-=0.6');
  }, { scope: containerRef, dependencies: [reduced] });

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6" aria-busy="true" aria-label="Loading project">
        <div className="flex justify-between items-center py-8">
          <Skeleton className="w-32 h-8" /><Skeleton className="w-24 h-6" />
        </div>
        <Skeleton className="w-full h-[60vh] rounded-2xl mt-12 mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
          <div className="lg:col-span-4 space-y-8">{[...Array(3)].map((_,i) => (<div key={i}><Skeleton className="w-full h-12" /></div>))}</div>
          <div className="lg:col-span-8 space-y-6"><Skeleton className="w-full h-16" /><Skeleton className="w-full h-32" /></div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-display mb-8">Work not found</h1>
        <Link to="/" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full focus:outline-none focus:ring-2 focus:ring-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const nextWork = WORKS.find(w => w.id === (work.id % WORKS.length) + 1) || WORKS[0];

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen">
      <header>
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-4 mix-blend-difference"
          aria-label="Project navigation">
          <Link to="/" className="text-2xl font-display tracking-tighter focus:outline-none focus:underline">PORTFOLIO</Link>
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:opacity-60 transition-opacity focus:outline-none focus:underline" aria-label="Back to all works">
            <ChevronLeft size={16} aria-hidden="true" /> Back to Works
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section
          className="relative w-full h-auto md:h-[80vh] aspect-video overflow-hidden pt-16"
          aria-label={`${work.name} — hero banner`}
        >
          {/* Inner wrapper fills the full section box (minus the navbar offset) */}
          <div className="absolute inset-0 top-0">
            {work.heroVideo
              ? <MediaLoader
                  src={work.heroVideo}
                  alt={`${work.name} — hero video`}
                  priority
                  className="w-full h-full"
                  mediaClassName="object-cover w-full h-full"
                />
              : <MediaLoader
                  src={work.heroImage || work.image || ''}
                  alt={`${work.name} — hero image`}
                  transforms="f_auto,q_auto:best,w_1920"
                  priority
                  className="w-full h-full"
                  mediaClassName="object-cover w-full h-full"
                />}
            {/* Subtle bottom gradient so content beneath reads cleanly */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40 pointer-events-none" aria-hidden="true" />
          </div>
          <div className="absolute inset-0 top-16 detail-header" />
        </section>

        {/* Project info */}
        <section className="py-24 px-6 max-w-7xl mx-auto" aria-label="Project details">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <dl className="lg:col-span-4 space-y-12">
              {[['Client', work.client || 'Confidential'],['Year', work.year || '2025'],['Role', work.role || 'Lead Designer']].map(([t,v]) => (
                <div key={t} className="detail-meta">
                  <dt className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">{t}</dt>
                  <dd className="text-lg uppercase tracking-tight">{v}</dd>
                </div>
              ))}
            </dl>
            <article className="lg:col-span-8 detail-content">
              <h2 className="text-3xl md:text-4xl mb-8 uppercase tracking-tight leading-tight">{work.description}</h2>
              <p className="text-lg opacity-70 leading-relaxed font-light max-w-2xl">{work.longDescription}</p>
            </article>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-24 px-6 bg-zinc-950 overflow-hidden" aria-labelledby="gallery-heading"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 4000px' } as React.CSSProperties}>
          <div className="max-w-450 mx-auto">
            <div className="mb-16 md:mb-24">
              <h2 id="gallery-heading" className="text-4xl md:text-7xl uppercase tracking-tighter font-display leading-none">Selected Works</h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                <p className="text-xs font-mono uppercase tracking-widest opacity-40">Gallery / {work.gallery.length} items</p>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 hidden md:block">Press Enter or click to view full screen</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 grid-flow-dense">
              {work.gallery.map((src, index) => {
                const mod = index % 8;
                const isFullWidth = mod === 0 || mod === 5;
                const isMid = mod === 3 || mod === 7;
                let spanClass = 'w-full overflow-hidden rounded-xl bg-zinc-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950';
                if (mod === 0)       spanClass += ' md:col-span-12 aspect-[16/9] lg:aspect-[21/9]';
                else if (mod <= 2)   spanClass += ' md:col-span-6 aspect-[4/5] lg:aspect-square';
                else if (mod === 3)  spanClass += ' md:col-span-8 aspect-[3/2]';
                else if (mod === 4)  spanClass += ' md:col-span-4 aspect-[2/3] lg:aspect-[3/4]';
                else if (mod === 5)  spanClass += ' md:col-span-12 aspect-[16/9]';
                else if (mod === 6)  spanClass += ' md:col-span-4 aspect-[2/3] lg:aspect-[3/4]';
                else                 spanClass += ' md:col-span-8 aspect-[3/2]';

                const t = isFullWidth ? 'f_auto,q_auto:good,w_1800' : isMid ? 'f_auto,q_auto:good,w_1200' : 'f_auto,q_auto:good,w_800';

                return (
                  <motion.div
                    key={index}
                    ref={el => { triggerRefs.current[index] = el; }}
                    className={spanClass}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: reduced ? 0 : 0.8, ease: [0.215, 0.61, 0.355, 1], delay: reduced ? 0 : (index % 3) * 0.1 }}
                    whileHover={{ scale: 0.995 }}
                    onClick={() => setLightboxIndex(index)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(index); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open gallery image ${index + 1} of ${work.gallery.length} in full screen`}
                  >
                    <MediaLoader src={src} alt={`${work.name} — gallery image ${index + 1} of ${work.gallery.length}`} transforms={t}
                      mediaClassName="hover:scale-105 transition-transform duration-1000" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              ref={lightboxRef}
              role="dialog" aria-modal="true"
              aria-label={`Fullscreen image ${lightboxIndex + 1} of ${work.gallery.length} — ${work.name}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-200 bg-black/98 flex items-center justify-center p-4 md:p-12"
            >
              <div className="absolute inset-0" onClick={() => setLightboxIndex(null)} aria-hidden="true" />

              <button
                className="absolute top-8 right-8 text-white hover:text-zinc-400 z-210 p-2 focus:outline-none focus:ring-2 focus:ring-white rounded-full"
                onClick={() => { setLightboxIndex(null); triggerRefs.current[lightboxIndex]?.focus(); }}
                aria-label="Close lightbox"
              ><X size={32} aria-hidden="true" /></button>

              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-zinc-400 z-210 p-4 bg-black/20 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                onClick={e => { e.stopPropagation(); setLightboxIndex(p => p !== null ? (p - 1 + work.gallery.length) % work.gallery.length : null); }}
                aria-label="Previous image"
              ><ChevronLeft size={40} aria-hidden="true" /></button>

              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-zinc-400 z-210 p-4 bg-black/20 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                onClick={e => { e.stopPropagation(); setLightboxIndex(p => p !== null ? (p + 1) % work.gallery.length : null); }}
                aria-label="Next image"
              ><ChevronRight size={40} aria-hidden="true" /></button>

              <div className="relative w-full max-w-[95vw] md:max-w-7xl max-h-[95vh] md:max-h-[85vh] p-2 md:p-8 flex flex-col items-center justify-center mx-auto">
                <motion.div key={`lb-${lightboxIndex}`}
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                  className="flex-1 w-full md:h-[85vh] flex items-center justify-center"
                >
                  <MediaLoader src={work.gallery[lightboxIndex]}
                    alt={`${work.name} — image ${lightboxIndex + 1} of ${work.gallery.length}`}
                    transforms="f_auto,q_auto:best,w_2000"
                    className="w-auto h-auto max-w-full md:max-w-7xl max-h-full object-contain rounded-lg shadow-2xl"
                    priority />
                </motion.div>
                <p role="status" aria-live="polite" aria-atomic="true"
                  className="mt-4 text-xs font-mono uppercase tracking-widest opacity-60">
                  {lightboxIndex + 1} / {work.gallery.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next project */}
        <section className="py-32 px-6 border-t border-white/10" aria-label="Next project">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs font-mono uppercase tracking-widest opacity-40 mb-8">Next Project</p>
            <Link to={`/work/${nextWork.id}`} className="group block focus:outline-none focus:underline" aria-label={`View ${nextWork.name}`}>
              <h2 className="text-[8vw] font-display uppercase tracking-tighter group-hover:italic transition-all duration-500">{nextWork.name}</h2>
              <p className="mt-8 flex items-center justify-center gap-4 text-sm uppercase tracking-widest font-bold">
                View Project <ArrowRight className="group-hover:translate-x-4 transition-transform duration-500" aria-hidden="true" />
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/10 text-center">
        <small className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">© 2026 Jake Amponsah. All Rights Reserved.</small>
      </footer>
    </div>
  );
}

// Root 
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
