import fs from "fs";
import path from "path";
import { sanitizeInputText } from "../server/security";

export interface SiteReviewItem {
  id: string;
  authorName: string;
  role: string;
  institution: string;
  rating: number; // 1 to 5
  aspect: string;
  tags: string[];
  comment: string;
  createdAt: string; // ISO string
  helpfulCount: number;
  verified: boolean;
  adminReply?: {
    text: string;
    repliedBy: string;
    repliedAt: string;
  };
}

export interface SiteReviewStats {
  averageRating: number;
  totalReviews: number;
  recommendationRate: number;
  starCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewsStoreData {
  version: number;
  lastUpdated: string;
  reviews: SiteReviewItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "reviews_store.json");

// Real-time only: starts empty with zero dummy/pre-filled reviews
let memoryStore: ReviewsStoreData = {
  version: 2,
  lastUpdated: new Date().toISOString(),
  reviews: []
};

let initialized = false;

export function initReviewsEngine(): void {
  if (initialized) return;
  initialized = true;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as ReviewsStoreData;
      if (parsed && parsed.version === 2 && Array.isArray(parsed.reviews)) {
        memoryStore = parsed;
        return;
      }
    }
    saveReviewsStore();
  } catch (err) {
    console.warn("[ReviewsEngine] Using in-memory store fallback:", err);
  }
}

function saveReviewsStore(): void {
  try {
    memoryStore.lastUpdated = new Date().toISOString();
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    // Non-fatal in read-only environments
  }
}

export function computeReviewStats(reviews: SiteReviewItem[]): SiteReviewStats {
  const starCounts: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      recommendationRate: 0,
      starCounts
    };
  }

  let sum = 0;
  let positiveCount = 0;

  for (const r of reviews) {
    const clamped = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))) as 1 | 2 | 3 | 4 | 5;
    starCounts[clamped] = (starCounts[clamped] || 0) + 1;
    sum += clamped;
    if (clamped >= 4) positiveCount++;
  }

  const totalReviews = reviews.length;
  const averageRating = Number((sum / totalReviews).toFixed(2));
  const recommendationRate = Math.round((positiveCount / totalReviews) * 100);

  return {
    averageRating,
    totalReviews,
    recommendationRate,
    starCounts
  };
}

export function getReviewsData(): { reviews: SiteReviewItem[]; stats: SiteReviewStats } {
  initReviewsEngine();
  const sorted = [...memoryStore.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return {
    reviews: sorted,
    stats: computeReviewStats(sorted)
  };
}

export function addSiteReview(input: {
  authorName?: string;
  role?: string;
  institution?: string;
  rating?: number;
  aspect?: string;
  tags?: string[];
  comment?: string;
}): { review: SiteReviewItem; stats: SiteReviewStats } {
  initReviewsEngine();

  const rawRating = Number(input.rating);
  const rating = isNaN(rawRating) ? 5 : Math.max(1, Math.min(5, Math.round(rawRating)));

  const authorName = sanitizeInputText(input.authorName, 80);
  if (!authorName || authorName.length < 2) {
    throw new Error("Nama Lengkap / Panggilan wajib diisi (penilaian anonim tidak diizinkan).");
  }

  const role = sanitizeInputText(input.role, 60) || "Tenaga Kesehatan";
  const institution = sanitizeInputText(input.institution, 100) || "Kota Palembang";
  const aspect = sanitizeInputText(input.aspect, 80) || "Keseluruhan Situs PIOBARI";
  const comment = sanitizeInputText(input.comment, 1200);

  if (!comment || comment.length < 3) {
    throw new Error("Komentar ulasan terlalu singkat. Silakan tulis pengalaman atau masukan Anda.");
  }

  const cleanTags = Array.isArray(input.tags)
    ? input.tags
        .map((t) => sanitizeInputText(t, 50))
        .filter((t): t is string => Boolean(t && t.length > 0))
        .slice(0, 5)
    : [];

  const newReview: SiteReviewItem = {
    id: "rev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
    authorName,
    role,
    institution,
    rating,
    aspect,
    tags: cleanTags,
    comment,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    verified: true
  };

  memoryStore.reviews.unshift(newReview);
  if (memoryStore.reviews.length > 300) {
    memoryStore.reviews = memoryStore.reviews.slice(0, 300);
  }

  saveReviewsStore();

  return {
    review: newReview,
    stats: computeReviewStats(memoryStore.reviews)
  };
}

export function markReviewHelpful(reviewId: string): { review: SiteReviewItem | null; stats: SiteReviewStats } {
  initReviewsEngine();
  const target = memoryStore.reviews.find((r) => r.id === reviewId);
  if (target) {
    target.helpfulCount = (target.helpfulCount || 0) + 1;
    saveReviewsStore();
  }
  return {
    review: target || null,
    stats: computeReviewStats(memoryStore.reviews)
  };
}

export function addAdminReplyToReview(
  reviewId: string,
  replyText: string
): { review: SiteReviewItem | null; stats: SiteReviewStats } {
  initReviewsEngine();
  const cleanReply = sanitizeInputText(replyText, 1000);
  if (!cleanReply) {
    throw new Error("Isi balasan admin tidak boleh kosong.");
  }
  const target = memoryStore.reviews.find((r) => r.id === reviewId);
  if (!target) {
    throw new Error("Ulasan tidak ditemukan.");
  }
  target.adminReply = {
    text: cleanReply,
    repliedBy: "Tim Farmasi Klinis • RSUD Palembang BARI",
    repliedAt: new Date().toISOString()
  };
  saveReviewsStore();
  return {
    review: target,
    stats: computeReviewStats(memoryStore.reviews)
  };
}

export function deleteSiteReview(reviewId: string): { deleted: boolean; stats: SiteReviewStats } {
  initReviewsEngine();
  const beforeLen = memoryStore.reviews.length;
  memoryStore.reviews = memoryStore.reviews.filter((r) => r.id !== reviewId);
  const deleted = memoryStore.reviews.length < beforeLen;
  if (deleted) {
    saveReviewsStore();
  }
  return {
    deleted,
    stats: computeReviewStats(memoryStore.reviews)
  };
}
