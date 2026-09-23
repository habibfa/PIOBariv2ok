import React, { useState } from "react";
import { Search, Activity, Stethoscope, AlertCircle, BookOpen } from "lucide-react";
import Markdown from "react-markdown";
import { generateClinicalDiseaseFallback } from "./utils/clinicalAssistantFallback";

export function DiseasesConditions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleContent, setArticleContent] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setArticleContent(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY;
      if (clientApiKey) {
        headers["x-api-key"] = clientApiKey;
      }

      const response = await fetch("/api/disease-info", {
        method: "POST",
        headers,
        body: JSON.stringify({ diseaseName: query }),
      });

      if (!response.ok) {
        let serverText = "";
        try {
          const errData = await response.json();
          if (errData && errData.text) serverText = errData.text;
        } catch (_) {}

        setArticleContent(serverText || generateClinicalDiseaseFallback(query));
        return;
      }

      const data = await response.json();
      if (data.text) {
        setArticleContent(data.text);
      } else {
        setArticleContent(generateClinicalDiseaseFallback(query));
      }
    } catch (err: any) {
      console.warn("Disease fetch failed, using clinical fallback engine:", err);
      setArticleContent(generateClinicalDiseaseFallback(query));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-2">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            Penyakit & Kondisi (Diseases & Conditions)
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Pencarian literatur klinis berbasis AI untuk mendapatkan informasi mendalam mengenai etiologi, presentasi klinis, dan pedoman pengobatan berbagai kondisi medis. (Terinspirasi oleh ensiklopedia klinis modern)
          </p>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Cari nama penyakit, kondisi, atau keluhan (misal: Dengue Hemorrhagic Fever, Hipertensi, Asma...)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 shadow-sm text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Cari"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {!articleContent && !loading && !error && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-500 shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
              <p className="font-semibold text-lg text-slate-700 mb-2">Mulai Pencarian Klinis</p>
              <p className="max-w-md text-sm text-slate-500 leading-relaxed">
                Ketikkan kondisi medis pada bilah pencarian di atas untuk menghasilkan laporan klinis terstruktur yang mencakup patofisiologi, gejala, diagnosis, dan tata laksana.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 shadow-sm">
              <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-600 font-medium animate-pulse">Menghimpun informasi medis dari literatur klinis...</p>
            </div>
          )}

          {articleContent && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-h2:text-emerald-700 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-slate-800 prose-a:text-emerald-600 prose-strong:text-slate-900 markdown-body text-justify">
                <Markdown>{articleContent}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
