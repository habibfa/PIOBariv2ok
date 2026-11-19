import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Send,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Search,
  Trash2,
  Reply,
  ShieldCheck,
  Building2,
  UserCheck,
  X,
  LogIn,
  LogOut
} from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp
} from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  db,
  auth,
  ADMIN_CLOUD_EMAIL,
  OperationType,
  handleFirestoreError,
  ensureGoogleAdminSignedIn,
  isVerifiedCloudAdmin,
  signOutFirebase
} from "../firebase";
import { trackCustomEvent } from "../services/analyticsService";

export interface SiteReviewItem {
  id: string;
  authorName: string;
  role: string;
  institution: string;
  rating: number;
  aspect: string;
  tags: string[];
  comment: string;
  createdAt: string;
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

interface SiteRatingReviewsProps {
  isAdmin?: boolean;
  onStatsUpdated?: (stats: SiteReviewStats) => void;
}

const RATING_LABELS: Record<number, { title: string; subtitle: string; color: string }> = {
  5: {
    title: "Luar Biasa / Sangat Membantu (5/5)",
    subtitle: "Situs sangat responsif, akurat, dan mempermudah pelayanan klinis sehari-hari.",
    color: "text-amber-600"
  },
  4: {
    title: "Sangat Baik (4/5)",
    subtitle: "Fitur lengkap dan bermanfaat, hanya perlu sedikit pengembangan tambahan.",
    color: "text-teal-700"
  },
  3: {
    title: "Cukup Baik (3/5)",
    subtitle: "Sudah cukup membantu namun ada beberapa bagian yang bisa ditingkatkan.",
    color: "text-sky-700"
  },
  2: {
    title: "Kurang Memuaskan (2/5)",
    subtitle: "Beberapa fitur belum bekerja sesuai harapan saya.",
    color: "text-orange-600"
  },
  1: {
    title: "Perlu Perbaikan (1/5)",
    subtitle: "Saya mengalami kendala saat menggunakan situs ini.",
    color: "text-rose-600"
  }
};

const ROLE_OPTIONS = [
  "Apoteker Klinis",
  "Dokter / DPJP",
  "Tenaga Teknis Kefarmasian (TTK)",
  "Perawat / Bidan",
  "Mahasiswa Kesehatan",
  "Pasien / Masyarakat Umum"
];

const ASPECT_OPTIONS = [
  "Keseluruhan Situs PIOBARI",
  "Katalog & Dosis Obat",
  "Skrining Interaksi Obat (DDI)",
  "Kalkulator Medis & Ginjal",
  "Kompatibilitas Injeksi IV",
  "Clinical SOAP & Asisten AI",
  "Peta Faskes Palembang"
];

const QUICK_TAGS = [
  "Data Klinis Akurat",
  "Loading Cepat & Responsif",
  "Mudah Digunakan Saat Visite",
  "Skrining DDI Sangat Membantu",
  "Peta Faskes Akurat",
  "Tampilan Modern & Bersih"
];

const COLLECTION_NAME = "site_reviews";
const OLD_CACHE_KEY = "piobari_site_reviews_cache_v1";
const LOCAL_CACHE_KEY = "piobari_site_reviews_firestore_cache_v3";
const HELPFUL_VOTED_KEY = "piobari_helpful_voted_ids_v3";

function toIsoDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof (value as any)?.toDate === "function") {
    try {
      return (value as any).toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function computeLocalStats(list: SiteReviewItem[]): SiteReviewStats {
  const starCounts: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  if (!list || list.length === 0) {
    return { averageRating: 0, totalReviews: 0, recommendationRate: 0, starCounts };
  }
  let sum = 0;
  let pos = 0;
  for (const r of list) {
    const k = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))) as 1 | 2 | 3 | 4 | 5;
    starCounts[k] = (starCounts[k] || 0) + 1;
    sum += k;
    if (k >= 4) pos++;
  }
  return {
    averageRating: Number((sum / list.length).toFixed(2)),
    totalReviews: list.length,
    recommendationRate: Math.round((pos / list.length) * 100),
    starCounts
  };
}

function formatRelativeTimeID(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} hari lalu`;
    return new Date(isoDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Hari ini";
  }
}

export default function SiteRatingReviews({ isAdmin = false, onStatsUpdated }: SiteRatingReviewsProps) {
  const [reviews, setReviews] = useState<SiteReviewItem[]>(() => {
    try {
      localStorage.removeItem(OLD_CACHE_KEY);
      localStorage.removeItem("piobari_site_reviews_cache_v2");
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [adminActionError, setAdminActionError] = useState<string>("");
  const [adminActionSuccess, setAdminActionSuccess] = useState<string>("");

  // Firebase Auth state for Cloud Admin Moderation
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isSigningInAdmin, setIsSigningInAdmin] = useState<boolean>(false);
  const [isSavingReply, setIsSavingReply] = useState<boolean>(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isCloudAdminConnected = isVerifiedCloudAdmin(firebaseUser);

  // Form state (Non-anonymous: authorName is mandatory)
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>("");
  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]);
  const [institution, setInstitution] = useState<string>("RSUD Palembang BARI");
  const [aspect, setAspect] = useState<string>(ASPECT_OPTIONS[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Data Klinis Akurat",
    "Loading Cepat & Responsif"
  ]);
  const [comment, setComment] = useState<string>("");

  // Filter & Sort state
  const [filterStar, setFilterStar] = useState<"all" | "5" | "4" | "3" | "low">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "highest">("newest");

  // Helpful votes tracked per browser
  const [votedIds, setVotedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HELPFUL_VOTED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Admin Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>("");

  const stats = useMemo(() => computeLocalStats(reviews), [reviews]);

  useEffect(() => {
    if (onStatsUpdated) {
      onStatsUpdated(stats);
    }
  }, [stats, onStatsUpdated]);

  // Listen to Firebase Auth state for admin cloud moderation
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Cloud Firestore listener for persistent reviews across all sessions & devices
  useEffect(() => {
    const reviewsRef = collection(db, COLLECTION_NAME);
    const reviewsQuery = query(
      reviewsRef,
      where("isPublic", "==", true),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loaded: SiteReviewItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const hasReply =
            typeof data.adminReplyText === "string" && data.adminReplyText.trim().length > 0;
          return {
            id: docSnap.id,
            authorName: String(data.authorName || "Pengguna PIOBARI"),
            role: String(data.role || "Tenaga Kesehatan"),
            institution: String(data.institution || "Kota Palembang"),
            rating: Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5))),
            aspect: String(data.aspect || "Keseluruhan Situs PIOBARI"),
            tags: Array.isArray(data.tags) ? data.tags.map(String).slice(0, 5) : [],
            comment: String(data.comment || ""),
            createdAt: toIsoDate(data.createdAt),
            helpfulCount: Number(data.helpfulCount) || 0,
            verified: Boolean(data.verified ?? true),
            ...(hasReply
              ? {
                  adminReply: {
                    text: String(data.adminReplyText),
                    repliedBy: String(
                      data.adminRepliedBy || "Tim Farmasi Klinis • RSUD Palembang BARI"
                    ),
                    repliedAt: toIsoDate(data.adminRepliedAt)
                  }
                }
              : {})
          };
        });

        loaded.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setReviews(loaded);
        setIsLoading(false);

        try {
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(loaded));
        } catch {
          // ignore storage quota errors
        }
      },
      (error) => {
        setIsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        } catch {
          // Logged via handleFirestoreError; keep cached reviews visible
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Strict defensive payload validation synchronized with firebase-blueprint.json & firestore.rules
    const cleanName = authorName.trim().slice(0, 80);
    if (cleanName.length < 2) {
      setSubmitError("Mohon isi Nama Lengkap / Panggilan minimal 2 karakter.");
      return;
    }

    const cleanComment = comment.trim().slice(0, 1200);
    if (cleanComment.length < 3) {
      setSubmitError("Mohon tuliskan komentar atau masukan Anda minimal 3 karakter.");
      return;
    }

    const cleanRole = (role.trim() || "Tenaga Kesehatan").slice(0, 60);
    const cleanInstitution = (institution.trim() || "Kota Palembang").slice(0, 100);
    const cleanAspect = (aspect.trim() || "Keseluruhan Situs PIOBARI").slice(0, 80);
    const cleanRating = Math.max(1, Math.min(5, Math.round(Number(selectedRating) || 5)));
    const cleanTags = selectedTags
      .map((t) => t.trim().slice(0, 50))
      .filter((t) => t.length > 0)
      .slice(0, 5);

    setIsSubmitting(true);

    const reviewId = `rev_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8)}`;

    const docPath = `${COLLECTION_NAME}/${reviewId}`;

    try {
      await setDoc(doc(db, COLLECTION_NAME, reviewId), {
        authorName: cleanName,
        role: cleanRole,
        institution: cleanInstitution,
        rating: cleanRating,
        aspect: cleanAspect,
        tags: cleanTags,
        comment: cleanComment,
        createdAt: serverTimestamp(),
        helpfulCount: 0,
        verified: true,
        isPublic: true
      });

      trackCustomEvent("submit_site_review", {
        category: "conversion",
        label: `Penilaian Situs ${cleanRating} Bintang (${cleanAspect}) oleh ${cleanName}`,
        metadata: {
          rating: cleanRating,
          role: cleanRole,
          aspect: cleanAspect,
          authorName: cleanName
        }
      });

      setComment("");
      setSubmitSuccess(
        `Terima kasih, ${cleanName}! Penilaian ${cleanRating} bintang dan komentar Anda sudah tersimpan permanen di database cloud secara real-time.`
      );
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      } catch {
        // Structured error logged
      }
      setSubmitError(
        "Gagal menyimpan komentar ke database cloud. Pastikan koneksi internet aktif lalu coba kirim kembali."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (votedIds.includes(reviewId)) return;

    const nextVoted = [...votedIds, reviewId];
    setVotedIds(nextVoted);
    try {
      localStorage.setItem(HELPFUL_VOTED_KEY, JSON.stringify(nextVoted));
    } catch {
      // ignore
    }

    const docPath = `${COLLECTION_NAME}/${reviewId}`;
    try {
      await updateDoc(doc(db, COLLECTION_NAME, reviewId), {
        helpfulCount: increment(1)
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  };

  const formatGoogleAdminAuthError = (err: any): string => {
    const code = String(err?.code || "");
    const message = String(err?.message || "");
    if (code === "auth/wrong-admin-account" || message.startsWith("WRONG_ADMIN_ACCOUNT:")) {
      const wrongEmail = message.replace("WRONG_ADMIN_ACCOUNT:", "") || "akun lain";
      return `Akun Google yang dipilih (${wrongEmail}) bukan Administrator terdaftar. Silakan masuk menggunakan akun ${ADMIN_CLOUD_EMAIL}.`;
    }
    if (code === "auth/popup-blocked") {
      return `Popup login Google diblokir oleh browser Anda. Mohon izinkan popup untuk situs ini lalu klik tombol 'Hubungkan Google Admin' kembali.`;
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return `Jendela login Google ditutup sebelum selesai. Klik 'Hubungkan Google Admin' atau 'Simpan Tanggapan' lagi untuk masuk dengan ${ADMIN_CLOUD_EMAIL}.`;
    }
    if (code === "auth/unauthorized-domain") {
      const host = typeof window !== "undefined" ? window.location.hostname : "domain ini";
      return `Domain '${host}' belum terdaftar di Authorized Domains Firebase Auth. Tambahkan '${host}' di Firebase Console → Authentication → Settings → Authorized domains, atau moderasi langsung melalui URL aplikasi AI Studio.`;
    }
    return `Gagal menghubungkan akun Google Admin (${code || "koneksi terputus"}). Pastikan popup browser diizinkan dan pilih akun ${ADMIN_CLOUD_EMAIL}.`;
  };

  const handleConnectGoogleAdmin = async () => {
    setAdminActionError("");
    setAdminActionSuccess("");
    setIsSigningInAdmin(true);
    try {
      const user = await ensureGoogleAdminSignedIn();
      setFirebaseUser(user);
      setAdminActionSuccess(
        `Akun Google Admin (${user.email}) berhasil terhubung! Anda sekarang dapat langsung menyimpan balasan dan menghapus ulasan secara permanen di cloud.`
      );
    } catch (err: any) {
      setAdminActionError(formatGoogleAdminAuthError(err));
    } finally {
      setIsSigningInAdmin(false);
    }
  };

  const handleAdminReplySubmit = async (reviewId: string) => {
    setAdminActionError("");
    setAdminActionSuccess("");
    const trimmed = adminReplyText.trim().slice(0, 1000);
    if (!trimmed) {
      setAdminActionError("Mohon tuliskan isi tanggapan Admin terlebih dahulu.");
      return;
    }

    setIsSavingReply(true);
    try {
      // Automatically connect Google Admin in one seamless click if not yet connected
      if (!isVerifiedCloudAdmin(auth.currentUser)) {
        setIsSigningInAdmin(true);
        try {
          const connectedUser = await ensureGoogleAdminSignedIn();
          setFirebaseUser(connectedUser);
        } finally {
          setIsSigningInAdmin(false);
        }
      }

      const docPath = `${COLLECTION_NAME}/${reviewId}`;
      try {
        await updateDoc(doc(db, COLLECTION_NAME, reviewId), {
          adminReplyText: trimmed,
          adminRepliedBy: "Tim Farmasi Klinis • RSUD Palembang BARI",
          adminRepliedAt: serverTimestamp()
        });
        setReplyingToId(null);
        setAdminReplyText("");
        setAdminActionSuccess("Tanggapan resmi Admin berhasil disimpan permanen di database cloud!");
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        } catch {
          // Logged via handleFirestoreError
        }
        setAdminActionError(
          `Akses Firestore ditolak: Pastikan Anda masuk dengan akun Google Administrator terdaftar (${ADMIN_CLOUD_EMAIL}).`
        );
      }
    } catch (authErr: any) {
      setAdminActionError(formatGoogleAdminAuthError(authErr));
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setAdminActionError("");
    setAdminActionSuccess("");
    setDeletingReviewId(reviewId);
    try {
      // Automatically connect Google Admin in one seamless click if not yet connected
      if (!isVerifiedCloudAdmin(auth.currentUser)) {
        setIsSigningInAdmin(true);
        try {
          const connectedUser = await ensureGoogleAdminSignedIn();
          setFirebaseUser(connectedUser);
        } finally {
          setIsSigningInAdmin(false);
        }
      }

      const docPath = `${COLLECTION_NAME}/${reviewId}`;
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, reviewId));
        setConfirmDeleteId(null);
        setAdminActionSuccess("Ulasan berhasil dihapus secara permanen dari database cloud.");
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Logged via handleFirestoreError
        }
        setAdminActionError(
          `Akses ditolak saat menghapus ulasan. Pastikan akun Google Administrator terdaftar (${ADMIN_CLOUD_EMAIL}).`
        );
      }
    } catch (authErr: any) {
      setAdminActionError(formatGoogleAdminAuthError(authErr));
    } finally {
      setDeletingReviewId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filterStar === "5" && r.rating !== 5) return false;
        if (filterStar === "4" && r.rating !== 4) return false;
        if (filterStar === "3" && r.rating !== 3) return false;
        if (filterStar === "low" && r.rating > 2) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText =
            r.authorName.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            r.institution.toLowerCase().includes(q) ||
            r.aspect.toLowerCase().includes(q) ||
            r.comment.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchText) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "helpful") {
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        }
        if (sortBy === "highest") {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [reviews, filterStar, searchQuery, sortBy]);

  const activeStarValue = hoverRating || selectedRating;
  const activeRatingMeta = RATING_LABELS[activeStarValue] || RATING_LABELS[5];

  return (
    <div className="w-full space-y-6">
      {/* Top Executive Summary Banner */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: Overall Score & Star Display */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-5 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 lg:pr-8">
            <div className="flex flex-col items-center justify-center bg-amber-50/80 border border-amber-200/80 rounded-2xl px-6 py-5 min-w-[140px] text-center shrink-0">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "0.0"}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5 font-mono tabular-nums">
                {stats.totalReviews > 0 ? "dari 5.0 Bintang" : "Belum Ada Rating"}
              </div>
              <div className="flex items-center gap-1 mt-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      stats.totalReviews > 0 && star <= Math.round(stats.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-teal-700">
                Indeks Kepuasan Pengguna Real-Time
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Penilaian & Komentar Situs
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seluruh bintang dan komentar tersimpan permanen secara{" "}
                <span className="font-bold text-slate-800">real-time</span> di database cloud{" "}
                <span className="font-bold text-slate-800">PIOBARI RSUD Palembang BARI</span>.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {stats.totalReviews} Ulasan Tersimpan
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums font-bold text-emerald-700">
                  {stats.totalReviews > 0
                    ? `${stats.recommendationRate}% Merekomendasikan`
                    : "Menunggu Penilaian Pertama"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: 5-Star Distribution Bars */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Distribusi Penilaian Bintang (Real-Time)</span>
              <span className="text-slate-500 font-normal">Klik baris bintang untuk memfilter</span>
            </div>
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = stats.starCounts[star] || 0;
              const pct =
                stats.totalReviews > 0
                  ? Math.round((count / stats.totalReviews) * 100)
                  : 0;
              const isSelectedFilter =
                (filterStar === "5" && star === 5) ||
                (filterStar === "4" && star === 4) ||
                (filterStar === "3" && star === 3) ||
                (filterStar === "low" && star <= 2);

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    if (star === 5) setFilterStar(filterStar === "5" ? "all" : "5");
                    else if (star === 4) setFilterStar(filterStar === "4" ? "all" : "4");
                    else if (star === 3) setFilterStar(filterStar === "3" ? "all" : "3");
                    else setFilterStar(filterStar === "low" ? "all" : "low");
                  }}
                  className={`w-full flex items-center gap-3 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                    isSelectedFilter ? "bg-amber-50/90" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1 w-16 shrink-0 text-xs font-bold text-slate-700 font-mono tabular-nums">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        star >= 4
                          ? "bg-amber-400"
                          : star === 3
                          ? "bg-teal-500"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-xs font-mono tabular-nums text-slate-600 shrink-0">
                    <span className="font-bold text-slate-800">{count}</span>{" "}
                    <span className="text-slate-400">({pct}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cloud Admin Moderation Bar (only visible when Admin is logged in) */}
      {isAdmin && (
        <div
          className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            isCloudAdminConnected
              ? "bg-emerald-50/70 border-emerald-200/90"
              : "bg-teal-50/70 border-teal-200/90"
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck
                className={`w-4 h-4 ${isCloudAdminConnected ? "text-emerald-600" : "text-teal-600"}`}
              />
              <span>Moderasi Ulasan Cloud (Mode Admin)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {isCloudAdminConnected
                ? `Terhubung sebagai ${firebaseUser?.email} — Balasan resmi dan penghapusan ulasan langsung tersimpan permanen di cloud.`
                : `Hubungkan akun Google Administrator (${ADMIN_CLOUD_EMAIL}) — atau langsung klik 'Hubungkan Google & Simpan' saat membalas ulasan di bawah.`}
            </p>
          </div>
          {isCloudAdminConnected ? (
            <button
              type="button"
              onClick={() => {
                setAdminActionSuccess("");
                setAdminActionError("");
                signOutFirebase();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan Google Admin</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSigningInAdmin}
              onClick={handleConnectGoogleAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSigningInAdmin ? "Menghubungkan..." : "Hubungkan Google Admin"}</span>
            </button>
          )}
        </div>
      )}

      {adminActionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminActionSuccess}</span>
          </span>
          <button
            type="button"
            onClick={() => setAdminActionSuccess("")}
            className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {adminActionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{adminActionError}</span>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && !isCloudAdminConnected && (
              <button
                type="button"
                disabled={isSigningInAdmin}
                onClick={handleConnectGoogleAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSigningInAdmin ? "Menghubungkan..." : "Hubungkan Google Admin"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAdminActionError("")}
              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid: Left = Rate & Comment Form, Right = Live Reviews Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Star Rating & Comment Form */}
        <div className="lg:col-span-5 bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Beri Bintang & Tulis Komentar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagikan pengalaman Anda menggunakan fitur-fitur klinis di situs PIOBARI.
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* 1. Interactive 5-Star Selector */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-center space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                1. Pilih Bintang Penilaian Anda
              </label>
              <div
                className="flex items-center justify-center gap-2 py-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeStarValue;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1.5 rounded-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      title={`Beri ${star} Bintang`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                            : "text-slate-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="space-y-0.5">
                <div className={`text-xs font-extrabold ${activeRatingMeta.color}`}>
                  {activeRatingMeta.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  {activeRatingMeta.subtitle}
                </div>
              </div>
            </div>

            {/* 2. Name Input (Required, No Anonymous Option) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  2. Nama Lengkap / Panggilan <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Wajib diisi</span>
              </div>
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Masukkan nama Anda (cth: apt. Andi Pratama, S.Farm / dr. Rina)"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
            </div>

            {/* 3. Role & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Peran / Profesi
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Unit Kerja / Domisili
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Cth: RSUD Palembang BARI / Palembang"
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* 4. Assessed Aspect / Module */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                3. Modul / Fitur yang Dinilai
              </label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
              >
                {ASPECT_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Quick Evaluation Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                4. Hal yang Paling Anda Sukai (Opsional, maks. 5)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        active
                          ? "bg-teal-600 text-white border-teal-700 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  5. Komentar & Masukan Tentang Situs Ini <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {comment.length}/1200
                </span>
              </div>
              <textarea
                rows={4}
                required
                minLength={3}
                maxLength={1200}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tuliskan pendapat, komentar, atau saran pengembangan untuk situs PIOBARI RSUD Palembang BARI..."
                className="w-full px-3.5 py-3 text-xs sm:text-sm font-medium bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Menyimpan ke Database Cloud..."
                  : `Kirim Penilaian (${selectedRating} Bintang) & Komentar`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Filterable & Sortable User Comments Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Segmented Star Filter Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: `Semua (${stats.totalReviews})` },
                  { id: "5", label: `5 ★ (${stats.starCounts[5]})` },
                  { id: "4", label: `4 ★ (${stats.starCounts[4]})` },
                  { id: "3", label: `3 ★ (${stats.starCounts[3]})` },
                  {
                    id: "low",
                    label: `1-2 ★ (${stats.starCounts[2] + stats.starCounts[1]})`
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterStar(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono tabular-nums ${
                      filterStar === tab.id
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-teal-600"
                >
                  <option value="newest">Terbaru</option>
                  <option value="helpful">Paling Membantu</option>
                  <option value="highest">Bintang Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Search Input inside Reviews */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari komentar berdasarkan nama, profesi, atau modul..."
                className="w-full pl-9 pr-9 py-2 text-xs font-medium bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse space-y-3"
                >
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                  <div className="h-14 w-full bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  {reviews.length === 0
                    ? "Belum Ada Penilaian & Komentar"
                    : "Belum Ada Komentar pada Filter Ini"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {reviews.length === 0
                    ? "Penilaian berjalan secara real-time dan tersimpan permanen di database cloud. Silakan isi nama, pilih bintang, dan kirimkan komentar pertama Anda pada formulir di samping."
                    : "Silakan ubah filter bintang atau kata kunci pencarian untuk melihat ulasan lainnya."}
                </p>
              </div>
              {filterStar !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilterStar("all")}
                  className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tampilkan Semua Ulasan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredReviews.map((item) => {
                const hasVoted = votedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5 transition-all hover:border-slate-300"
                  >
                    {/* Header: Reviewer Info & Star Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {item.authorName}
                          </h3>
                          {item.verified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Tersimpan Cloud</span>
                            </span>
                          )}
                        </div>
                        {/* Clean unboxed metadata with typographic separators */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{item.role}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {item.institution}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {formatRelativeTimeID(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Star Rating Display */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 font-mono tabular-nums">
                          {item.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Assessed Module & Aspect */}
                    <div className="text-xs text-slate-500">
                      <span>Modul yang dinilai: </span>
                      <span className="font-bold text-teal-800">{item.aspect}</span>
                      {item.tags && item.tags.length > 0 && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-slate-600 font-medium">
                            {item.tags.join(" · ")}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Review Comment Prose */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {item.comment}
                    </p>

                    {/* Official Admin / Pharmacy Team Reply if present */}
                    {item.adminReply && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-teal-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                            {item.adminReply.repliedBy}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {formatRelativeTimeID(item.adminReply.repliedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.adminReply.text}
                        </p>
                      </div>
                    )}

                    {/* Admin Reply Input Box */}
                    {isAdmin && replyingToId === item.id && (
                      <div className="bg-slate-50 border border-teal-200 rounded-xl p-3 space-y-2.5">
                        <textarea
                          rows={2}
                          maxLength={1000}
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Tulis tanggapan resmi Tim Farmasi Klinis RSUD Palembang BARI..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-500">
                            {isCloudAdminConnected
                              ? `Terhubung Cloud: ${firebaseUser?.email}`
                              : `Klik simpan untuk langsung menghubungkan Google Admin (${ADMIN_CLOUD_EMAIL})`}
                          </span>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isSavingReply}
                              onClick={() => {
                                setReplyingToId(null);
                                setAdminReplyText("");
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={isSavingReply}
                              onClick={() => handleAdminReplySubmit(item.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg cursor-pointer"
                            >
                              {!isCloudAdminConnected && <LogIn className="w-3.5 h-3.5" />}
                              <span>
                                {isSavingReply
                                  ? isSigningInAdmin
                                    ? "Menghubungkan Google..."
                                    : "Menyimpan ke Cloud..."
                                  : isCloudAdminConnected
                                  ? "Simpan Tanggapan"
                                  : "Hubungkan Google & Simpan"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inline Delete Confirmation for Admin */}
                    {isAdmin && confirmDeleteId === item.id && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-rose-800">
                          Hapus ulasan ini secara permanen dari database cloud?
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={deletingReviewId === item.id}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={deletingReviewId === item.id}
                            onClick={() => handleDeleteReview(item.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-lg cursor-pointer"
                          >
                            {deletingReviewId === item.id
                              ? "Menghapus..."
                              : isCloudAdminConnected
                              ? "Ya, Hapus Permanen"
                              : "Hubungkan Google & Hapus"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions: Helpful Upvote & Admin Moderation */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkHelpful(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          hasVoted
                            ? "bg-teal-50 text-teal-700 border border-teal-200/80"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${hasVoted ? "fill-teal-600 text-teal-600" : ""}`}
                        />
                        <span>Membantu</span>
                        <span className="font-mono tabular-nums font-bold">
                          ({item.helpfulCount || 0})
                        </span>
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              setReplyingToId(item.id);
                              setAdminReplyText(item.adminReply?.text || "");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Balas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setConfirmDeleteId(item.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
