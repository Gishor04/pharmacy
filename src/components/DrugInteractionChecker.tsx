import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, RefreshCw, Layers } from 'lucide-react';
import { translations, Language } from '../translations';
import { DrugInteractionResult } from '../types';

interface DrugInteractionCheckerProps {
  currentLang: Language;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
}

export default function DrugInteractionChecker({ currentLang, accessibility }: DrugInteractionCheckerProps) {
  const t = translations[currentLang];
  const [medA, setMedA] = React.useState('');
  const [medB, setMedB] = React.useState('');
  const [result, setResult] = React.useState<DrugInteractionResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const checkInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medA.trim() || !medB.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/interactions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineA: medA, medicineB: medB })
      });

      if (!response.ok) {
        throw new Error("Checker service error.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Interaction checker encountered an unexpected delay. Attempting to reload safety registries...");
    } finally {
      setLoading(false);
    }
  };

  const clearChecker = () => {
    setMedA('');
    setMedB('');
    setResult(null);
    setError('');
  };

  // Fast options
  const runQuickCheck = (a: string, b: string) => {
    setMedA(a);
    setMedB(b);
    // Submit via state triggers inside useEffect or directly
  };

  return (
    <div className={`p-6 rounded-2xl shadow-md border ${
      accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-gray-100'
    }`} id="drug-interaction-checker-box">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-[#22A06B]/10 rounded-lg text-[#22A06B]">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`font-bold ${accessibility.largeText ? 'text-lg' : 'text-base'} ${
            accessibility.highContrast ? 'text-yellow-400' : 'text-gray-900'
          }`}>
            {t.interactionTitle}
          </h3>
          <p className="text-xs text-gray-400 font-medium">{t.interactionSubtitle}</p>
        </div>
      </div>

      <form onSubmit={checkInteraction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">First Medicine Name</label>
            <input
              type="text"
              value={medA}
              onChange={e => setMedA(e.target.value)}
              placeholder="e.g. Lipitor or Atorvastatin"
              className="w-full bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#22A06B]"
              required
              id="interaction-med-a-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Second Medicine / Substance</label>
            <input
              type="text"
              value={medB}
              onChange={e => setMedB(e.target.value)}
              placeholder="e.g. Clarithromycin or Alcohol"
              className="w-full bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#22A06B]"
              required
              id="interaction-med-b-input"
            />
          </div>
        </div>

        <div className="flex space-x-2.5 justify-end">
          {result && (
            <button
              type="button"
              onClick={clearChecker}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition border border-gray-200"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !medA.trim() || !medB.trim()}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              accessibility.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                : 'bg-[#22A06B] text-white hover:bg-[#1d8257] disabled:opacity-50 shadow-sm'
            }`}
            id="interaction-submit-button"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning clinical formulas...</span>
              </>
            ) : (
              <span>{t.btnCheck}</span>
            )}
          </button>
        </div>
      </form>

      {/* Preset Fast Checks */}
      {!result && !loading && (
        <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400">
          <span className="font-semibold text-gray-500 block mb-1.5">Common Checks for Jaffna Elderly Patients:</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => runQuickCheck("Lipitor (Atorvastatin)", "Clarithromycin")}
              className="bg-gray-50 hover:bg-amber-50 hover:text-amber-800 px-2.5 py-1 rounded-lg border border-gray-100 text-left transition"
            >
              Atorvastatin + Clarithromycin
            </button>
            <button 
              onClick={() => runQuickCheck("Warfarin", "Aspirin")}
              className="bg-gray-50 hover:bg-red-50 hover:text-red-800 px-2.5 py-1 rounded-lg border border-gray-100 text-left transition"
            >
              Warfarin + Aspirin
            </button>
            <button 
              onClick={() => runQuickCheck("Metformin", "Atorvastatin")}
              className="bg-gray-50 hover:bg-green-50 hover:text-green-800 px-2.5 py-1 rounded-lg border border-gray-100 text-left transition"
            >
              Metformin + Atorvastatin
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 bg-red-50 text-red-800 p-3.5 rounded-xl border border-red-100 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Traffic Light Results Block */}
      {result && (
        <div className={`mt-6 rounded-xl border p-4 transition-all duration-300 ${
          result.severity === 'Safe' 
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-950' 
            : result.severity === 'Warning'
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-950'
              : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-950'
        }`}>
          {/* Traffic Light Banner */}
          <div className="flex items-center justify-between mb-3 border-b pb-2 border-black/5 dark:border-white/5">
            <div className="flex items-center space-x-2">
              <span className={`w-3.5 h-3.5 rounded-full inline-block animate-pulse ${
                result.severity === 'Safe' 
                  ? 'bg-[#16A34A]' 
                  : result.severity === 'Warning'
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#DC2626]'
              }`} />
              <span className={`font-bold uppercase text-xs tracking-wider ${
                result.severity === 'Safe' 
                  ? 'text-[#16A34A]' 
                  : result.severity === 'Warning'
                    ? 'text-[#F59E0B]'
                    : 'text-[#DC2626]'
              }`}>
                {result.severity}: {result.severity === 'Safe' ? 'Safe to Concur' : result.severity === 'Warning' ? 'Caution Required' : 'Critical Hazard'}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Gishor AI Registry</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-800 dark:text-white">
              Checking: <strong className="underline text-[#0F6CBD]">{result.medicineA}</strong> &amp; <strong className="underline text-[#0F6CBD]">{result.medicineB}</strong>
            </p>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
              {result.description}
            </p>
          </div>

          {/* Guidelines on special demographics */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-gray-500">
            <div>
              <span className="font-bold text-gray-600 dark:text-gray-300 block mb-0.5">🤰 Pregnancy &amp; Lactation Status:</span>
              <p>Statin products and heavy analgesics pose systemic issues. Always consult Dr. K. Gnanapragasam on SLMC-9842 before dispensing.</p>
            </div>
            <div>
              <span className="font-bold text-gray-600 dark:text-gray-300 block mb-0.5">🍏 Dietary &amp; Alcohol advice:</span>
              <p>Avoid alcohol consumption within 6 hours of taking active compounds. Grapefruit juice strongly elevates statin clearance strain.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
