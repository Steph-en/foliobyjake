// scripts/migrate-to-supabase.ts
//
// One-time migration: reads the existing data/db.json (or falls back to the
// hardcoded seed data below if db.json is missing/empty) and inserts it into
// Supabase. Safe to re-run — uses upsert, so it won't create duplicates.
//
// Usage:
//   1. Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
//   2. npx tsx scripts/migrate-to-supabase.ts

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Project, Category, MediaAsset } from "../src/types";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — aborting.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const INITIAL_WORKS: Project[] = [
  {
    id: 1,
    name: 'Fixed Youth Conference',
    slug: 'fixed-youth-conference',
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
    status: 'published',
    isFeatured: true,
    views: 1240,
    seoTitle: 'Fixed Youth Conference 2026 Branding - Jake Amponsah',
    seoDescription: 'Case study of the comprehensive branding system designed for FIXED Teens Church youth conference in Accra, Ghana.',
    seoKeywords: 'Branding, Faith, Youth Conference, Graphic Design, Ghana',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg',
    sections: []
  },
  {
    id: 2,
    name: 'UAI by TúNiyi',
    slug: 'uai-by-tuniyi',
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
    status: 'published',
    isFeatured: true,
    views: 890,
    seoTitle: 'UAI by TúNiyi Brand Identity - Jake Amponsah',
    seoDescription: 'Explore the comprehensive graphic identity and branding system built for the UAI conceptual fashion label exploring self-expression, human vision, and artificial intelligence.',
    seoKeywords: 'UAI by TuNiyi, Brand Identity, Fashion Branding, Graphic Design, Jake Amponsah, Typographic Design, Editorial Design',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg',
    sections: []
  },
  {
    id: 3,
    name: 'Scolpta (Ashesi Career Fair)',
    slug: 'scolpta-ashesi',
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
    status: 'published',
    isFeatured: true,
    views: 955,
    seoTitle: 'Scolpta Ashesi Career Fair Brand & Experiential Design - Jake Amponsah',
    seoDescription: 'Diving into the disruptive and bold Y2K-inspired Gen Z brand identity and experiential design system created for the Scolpta campaign at the Ashesi Career Fair.',
    seoKeywords: 'Scolpta, Ashesi Career Fair, Experiential Design, Gen Z Branding, Y2K Aesthetic, Brand Identity, Accra Graphic Design, Disruptive Design',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg',
    sections: []
  },
  {
    id: 4,
    name: 'VANT',
    slug: 'vant-branding',
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
    status: 'published',
    isFeatured: false,
    views: 420,
    seoTitle: 'VANT Contemporary Fashion Label Brand Identity - Jake Amponsah',
    seoDescription: 'A refined case study showcasing the minimalist visual system, NY typography selection, and restraint styled for the VANT contemporary fashion label.',
    seoKeywords: 'VANT, Fashion Branding, Minimalist Graphic Design, Visual Identity, NYC Style Typography, Editorial Web Design, Quiet Luxury Brand',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628837/cover_portrait_4x-100_pz4u6u.jpg',
    sections: []
  },
  {
    id: 5,
    name: 'Main Squeeze',
    slug: 'main-squeeze',
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
    status: 'published',
    isFeatured: false,
    views: 532,
    seoTitle: 'Main Squeeze Beverage Brand Identity & Packaging - Jake Amponsah',
    seoDescription: 'A vibrant, bold beverage brand identity and packaging design case study for Main Squeeze, centering high-energy typography and clean layout aesthetics.',
    seoKeywords: 'Main Squeeze, Beverage Packaging, Brand Identity, Bold Typography, Product Design, Graphic Design Portfolio, Creative Juice Brand',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633759/COVER_b61g2a.jpg',
    sections: []
  },
  {
    id: 6,
    name: 'Stackz',
    slug: 'stackz',
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
    status: 'published',
    isFeatured: false,
    views: 311,
    seoTitle: 'Stackz Pastry Brand Brand Identity for Sale - Jake Amponsah',
    seoDescription: 'A self-initiated premium branding identity concept designed for Stackz, a pastry brand showcasing stacked dessert structures and warm, family-style heritage aesthetics.',
    seoKeywords: 'Stackz, Pastry Branding, Brand Identity for Sale, Bakery Visual Identity, Creative Logo Design, Packaging Concepts, Jake Amponsah',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774642493/Artboard_10_4x-100_copy_wmgwyw.jpg',
    sections: []
  },
  {
    id: 7,
    name: 'Motion Collection',
    slug: 'motion-graphics',
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
    status: 'published',
    isFeatured: true,
    views: 742,
    seoTitle: 'Motion Collection Showcase: Typography & Visual Kinetics - Jake Amponsah',
    seoDescription: 'Explore a selective collection of high-fidelity, typography-driven brand motion designs, animated system loops, and immersive modern video storytelling.',
    seoKeywords: 'Motion Graphics, 2D Animation, Kinetic Typography, Video Reels, Brand Motion Systems, Visual Storytelling, Creative Motion Portfolio',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4',
    sections: []
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Graphic Design', slug: 'graphic-design' },
  { id: 'cat2', name: 'Motion Graphics', slug: 'motion-graphics' }
];

const INITIAL_MEDIA: MediaAsset[] = [
  { id: 'm1', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg', name: 'Youth Conference Hero', type: 'image', size: '1.2 MB', createdAt: new Date().toISOString() },
  { id: 'm2', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg', name: 'UAI Banner', type: 'image', size: '840 KB', createdAt: new Date().toISOString() },
  { id: 'm3', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg', name: 'Scolpta Poster', type: 'image', size: '1.4 MB', createdAt: new Date().toISOString() },
  { id: 'm4', url: 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4', name: 'Logo Motion Loop', type: 'video', size: '4.8 MB', createdAt: new Date().toISOString() },
];

interface LocalDb {
  projects: Project[];
  categories: Category[];
  media: MediaAsset[];
  contactsCount: number;
}

function loadSourceData(): LocalDb {
  const dbPath = path.join(process.cwd(), "data", "db.json");
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.projects)) {
        console.log(`Using data/db.json as migration source (${parsed.projects.length} projects, ${parsed.categories?.length ?? 0} categories).`);
        return {
          projects: parsed.projects,
          categories: parsed.categories ?? INITIAL_CATEGORIES,
          media: parsed.media ?? INITIAL_MEDIA,
          contactsCount: typeof parsed.contactsCount === "number" ? parsed.contactsCount : 14,
        };
      }
    } catch (err) {
      console.warn("Could not parse data/db.json, falling back to seed data:", err);
    }
  }
  console.log("No usable data/db.json found — using built-in seed data instead.");
  return {
    projects: INITIAL_WORKS,
    categories: INITIAL_CATEGORIES,
    media: INITIAL_MEDIA,
    contactsCount: 14,
  };
}

function projectRow(p: Project, sortOrder: number) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description ?? "",
    long_description: p.longDescription ?? "",
    client: p.client ?? null,
    year: p.year ?? null,
    role: p.role ?? null,
    preview_image: p.previewImage ?? null,
    preview_video: p.previewVideo ?? null,
    hero_image: p.heroImage ?? null,
    hero_video: p.heroVideo ?? null,
    gallery: p.gallery ?? [],
    status: p.status ?? "draft",
    is_featured: !!p.isFeatured,
    views: p.views ?? 0,
    seo_title: p.seoTitle ?? null,
    seo_description: p.seoDescription ?? null,
    seo_keywords: p.seoKeywords ?? null,
    seo_og_image: p.seoOgImage ?? null,
    sections: p.sections ?? [],
    sort_order: sortOrder,
    created_at: p.createdAt ?? new Date().toISOString(),
  };
}

async function main() {
  const source = loadSourceData();

  console.log(`\nMigrating ${source.categories.length} categories...`);
  for (const cat of source.categories) {
    const { error } = await supabase.from("categories").upsert({ id: cat.id, name: cat.name, slug: cat.slug });
    if (error) console.error(`  ✗ category ${cat.name}:`, error.message);
    else console.log(`  ✓ ${cat.name}`);
  }

  console.log(`\nMigrating ${source.projects.length} projects...`);
  for (let i = 0; i < source.projects.length; i++) {
    const p = source.projects[i];
    const { error } = await supabase.from("projects").upsert(projectRow(p, i));
    if (error) console.error(`  ✗ project "${p.name}" (id ${p.id}):`, error.message);
    else console.log(`  ✓ ${p.name}`);
  }

  console.log(`\nMigrating ${source.media.length} media assets...`);
  for (const m of source.media) {
    const { error } = await supabase.from("media").upsert({
      id: m.id,
      url: m.url,
      name: m.name,
      type: m.type,
      size: m.size ?? null,
      created_at: m.createdAt ?? new Date().toISOString(),
    });
    if (error) console.error(`  ✗ media "${m.name}":`, error.message);
    else console.log(`  ✓ ${m.name}`);
  }

  console.log(`\nSetting contacts_count to ${source.contactsCount}...`);
  const { error: settingsErr } = await supabase
    .from("app_settings")
    .upsert({ key: "contacts_count", value: source.contactsCount });
  if (settingsErr) console.error("  ✗ contacts_count:", settingsErr.message);
  else console.log("  ✓ done");

  console.log("\nMigration complete. Verify in the Supabase table editor, then you can delete data/db.json.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
