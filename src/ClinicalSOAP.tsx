import React, { useState } from 'react';
import { Stethoscope, Send, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateClinicalSoapFallback } from './utils/clinicalAssistantFallback';

const ClinicalSOAP: React.FC = () => {
  const [patientData, setPatientData] = useState('');
  const [soapNote, setSoapNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSOAP = async () => {
    if (!patientData.trim()) {
      setError('Silakan masukkan data pasien terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSoapNote('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY;
      if (clientApiKey) {
        headers['x-api-key'] = clientApiKey;
      }

      const response = await fetch('/api/soap-ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({ patientData }),
      });

      if (!response.ok) {
        let serverErrorReply = '';
        try {
          const errJson = await response.json();
          if (errJson && errJson.text) {
            serverErrorReply = errJson.text;
          }
        } catch (_) {}

        const finalNote = serverErrorReply || generateClinicalSoapFallback(patientData);
        setSoapNote(finalNote);
        return;
      }

      const data = await response.json();
      
      if (data.text) {
        setSoapNote(data.text);
      } else {
        setSoapNote(generateClinicalSoapFallback(patientData));
      }
    } catch (err: any) {
      console.warn("SOAP AI fetch failed, activating clinical fallback engine:", err);
      const fallbackNote = generateClinicalSoapFallback(patientData);
      setSoapNote(fallbackNote);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPatientData('');
    setSoapNote('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Clinical SOAP Generator</h2>
              <p className="text-sm text-emerald-600 font-medium">Asisten Apoteker Klinis AI</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Masukkan data pasien (keluhan, riwayat penyakit, daftar obat, hasil lab, tanda vital) untuk menghasilkan catatan SOAP terstruktur dengan fokus pada penilaian farmakoterapi dan Drug Related Problems (DRP).
          </p>

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="patientData" className="block text-sm font-semibold text-slate-700 mb-2">
                Data Pasien Mentah
              </label>
              <textarea
                id="patientData"
                value={patientData}
                onChange={(e) => setPatientData(e.target.value)}
                placeholder="Contoh: Pasien Tn. A, 65 tahun, keluhan sesak napas. Riwayat HT, DM tipe 2. Obat saat ini: Amlodipin 10mg, Metformin 500mg 3x1. Lab: Cr 1.5, GDS 250. TD 150/90..."
                className="w-full h-48 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all resize-none shadow-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateSOAP}
                disabled={isLoading || !patientData.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menghasilkan SOAP...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Buat Catatan SOAP
                  </>
                )}
              </button>
              
              <button
                onClick={handleClear}
                disabled={isLoading || (!patientData && !soapNote && !error)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {soapNote && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Hasil Catatan SOAP</h3>
          </div>
          
          <div className="p-6">
            <div className="prose prose-slate prose-sm max-w-none 
              prose-headings:text-slate-800 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-headings:uppercase
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-justify
              prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-600 prose-li:my-1 prose-li:text-justify
              prose-strong:text-slate-800 text-justify
              bg-slate-50 p-6 rounded-lg border border-slate-100"
            >
              <ReactMarkdown>{soapNote}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalSOAP;
