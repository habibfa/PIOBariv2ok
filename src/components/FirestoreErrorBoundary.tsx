import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class FirestoreErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || "Terjadi kesalahan saat menghubungkan ke database ulasan."
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[FirestoreErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Gagal Memuat Modul Penilaian Situs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terjadi kendala koneksi ke database cloud. Silakan muat ulang modul ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Muat Ulang</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
