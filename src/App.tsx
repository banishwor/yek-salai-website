/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from "react";
import { 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  BookOpen, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Moon, 
  Sun, 
  Info, 
  HelpCircle, 
  HeartCrack,
  Check,
  CalendarDays,
  FileCheck2,
  Users2,
  Share2
} from "lucide-react";
import { YumnakSelect } from "./components/YumnakSelect";
import { evaluateMarriageEligibility } from "./rule-engine";
import { MarriageCheckInput, EvaluationResult, YekSalai } from "./types";
import { yumnakDatabase } from "./data/yumnakDatabase";
import { ReportCardCanvas } from "./components/ReportCardCanvas";

interface PersonState {
  surname: string;
  yek: string;
}

export default function App() {
  // Theme management: Default dark mode / light mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Stepper state: 0 (Welcome), 1 (Boy), 2 (Boy's Mother), 3 (Girl), 4 (Girl's Mother), 5 (Questions), 6 (Results)
  const [step, setStep] = useState<number>(0);

  // Couple details state
  const [boy, setBoy] = useState<PersonState>({ surname: "", yek: "" });
  const [boyMother, setBoyMother] = useState<PersonState>({ surname: "", yek: "" });
  const [girl, setGirl] = useState<PersonState>({ surname: "", yek: "" });
  const [girlMother, setGirlMother] = useState<PersonState>({ surname: "", yek: "" });

  // Traditional questionnaire answers
  const [pendinnaba, setPendinnaba] = useState<"yes" | "no" | "dont_know">("no");
  const [sharedGrandmother, setSharedGrandmother] = useState<"yes" | "no" | "dont_know">("no");
  const [boyMoirangAriba, setBoyMoirangAriba] = useState<"yes" | "no" | "dont_know">("no");
  const [girlMoirangAriba, setGirlMoirangAriba] = useState<"yes" | "no" | "dont_know">("no");

  // Error handling for each step transition
  const [validationError, setValidationError] = useState<string | null>(null);

  // Results computed on entering step 6
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [showSharePreview, setShowSharePreview] = useState<boolean>(false);

  const getShareText = () => {
    if (!evaluation) return "";
    const rulesSummary = evaluation.results
      .map(r => {
        let prefix = "✓";
        if (r.severity === "reject") prefix = "❌";
        else if (r.severity === "warning") prefix = "⚠️";
        return `${prefix} ${r.title}\n  ${r.message.replace(/\s+/g, ' ')}`;
      })
      .join("\n\n");

    const statusEmoji = evaluation.status === "ELIGIBLE BASED ON AVAILABLE DATA" 
      ? "✅" 
      : evaluation.status === "MANUAL VERIFICATION REQUIRED"
      ? "⚠️"
      : "❌";

    const customAppUrl = typeof window !== "undefined" ? window.location.href : "https://meitei-yek-salai-checker.app";

    return `🌌 MEITEI YEK SALAI MARRIAGE ELIGIBILITY REPORT
--------------------------------------------------------------
${statusEmoji} STATUS: ${evaluation.status}

COUPLE INFORMATION:
• Bridegroom (Boy): ${boy.surname} (${boy.yek}) ${boy.yek === "Moirang" ? `[Moirang Ariba Trace: ${boyMoirangAriba === "yes" ? "Yes" : "No"}]` : ""}
• Bride (Girl): ${customAppUrl.includes("chanu") || girl.surname ? girl.surname : "Bride"} (${girl.yek}) ${girl.yek === "Moirang" ? `[Moirang Ariba Trace: ${girlMoirangAriba === "yes" ? "Yes" : "No"}]` : ""}

MATERNAL CLANS:
• Groom's Mother: ${boyMother.surname} (${boyMother.yek})
• Bride's Mother: ${girlMother.surname} (${girlMother.yek})

RULE ENGINE AUDIT LOG:
${rulesSummary}

TRADITIONAL SCREENERS:
• Pendinnaba Check: ${pendinnaba === "yes" ? "Yes" : pendinnaba === "no" ? "No" : "Unverified"}
• Shared biological grandmother: ${sharedGrandmother === "yes" ? "Yes" : sharedGrandmother === "no" ? "No" : "Unverified"}

--------------------------------------------------------------
* Verified online at: ${customAppUrl}
* Non-authoritative decision-support tool. Final eligibility must be checked with senior family elders & Maichous.`;
  };

  const handleCopyText = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const resetChecker = () => {
    setBoy({ surname: "", yek: "" });
    setBoyMother({ surname: "", yek: "" });
    setGirl({ surname: "", yek: "" });
    setGirlMother({ surname: "", yek: "" });
    setPendinnaba("no");
    setSharedGrandmother("no");
    setBoyMoirangAriba("no");
    setGirlMoirangAriba("no");
    setStep(0);
    setEvaluation(null);
    setValidationError(null);
  };

  const getStepValidation = (): boolean => {
    switch (step) {
      case 1:
        if (!boy.surname.trim()) {
          setValidationError("Please enter the Boy's surname.");
          return false;
        }
        if (!boy.yek) {
          setValidationError("Please resolve or select the Boy's Yek Salai (clan) before proceeding.");
          return false;
        }
        break;
      case 2:
        if (!boyMother.surname.trim()) {
          setValidationError("Please enter the Boy's Mother's surname.");
          return false;
        }
        if (!boyMother.yek) {
          setValidationError("Please resolve or select the Boy's Mother's Yek Salai (clan).");
          return false;
        }
        break;
      case 3:
        if (!girl.surname.trim()) {
          setValidationError("Please enter the Girl's surname.");
          return false;
        }
        if (!girl.yek) {
          setValidationError("Please resolve or select the Girl's Yek Salai (clan).");
          return false;
        }
        break;
      case 4:
        if (!girlMother.surname.trim()) {
          setValidationError("Please enter the Girl's Mother's surname.");
          return false;
        }
        if (!girlMother.yek) {
          setValidationError("Please resolve or select the Girl's Mother's Yek Salai (clan).");
          return false;
        }
        break;
      default:
        break;
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!getStepValidation()) return;

    if (step === 5) {
      // Prepare normalized input to Rule Engine
      const checkInput: MarriageCheckInput = {
        boy: {
          surname: boy.surname,
          yek: boy.yek as YekSalai,
          motherSurname: boyMother.surname,
          motherYek: boyMother.yek as YekSalai
        },
        girl: {
          surname: girl.surname,
          yek: girl.yek as YekSalai,
          motherSurname: girlMother.surname,
          motherYek: girlMother.yek as YekSalai
        },
        answers: {
          pendinnaba,
          sharedGrandmother,
          boyMoirangAriba,
          girlMoirangAriba
        }
      };

      const result = evaluateMarriageEligibility(checkInput);
      setEvaluation(result);
      setStep(6);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  /**
   * Helper to fetch color styles representing different eligibility statuses.
   */
  const getStatusAlertStyle = (status: string) => {
    switch (status) {
      case "NOT ELIGIBLE":
        return {
          bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50",
          text: "text-rose-800 dark:text-rose-200",
          accentText: "text-rose-600 dark:text-rose-400",
          icon: <HeartCrack className="w-14 h-14 text-rose-500" />,
          title: "Marriage Prohibited (Not Eligible)",
          desc: "A solid traditional restriction prevents this alliance based on Yek exogamy rules."
        };
      case "MANUAL VERIFICATION REQUIRED":
        return {
          bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50",
          text: "text-amber-800 dark:text-amber-200",
          accentText: "text-amber-600 dark:text-amber-400",
          icon: <AlertTriangle className="w-14 h-14 text-amber-500" />,
          title: "Manual Family Verification Advised",
          desc: "Primary exogamy passed, but maternal lineage overlaps or elder restrictions indicate possible consanguinity."
        };
      case "ELIGIBLE BASED ON AVAILABLE DATA":
      default:
        return {
          bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50",
          text: "text-emerald-800 dark:text-emerald-200",
          accentText: "text-emerald-600 dark:text-emerald-400",
          icon: <CheckCircle2 className="w-14 h-14 text-emerald-500" />,
          title: "Eligible Based on Input Data",
          desc: "No overlap or traditional restrictions detected in custom clan exogamy checks. Traditional family checks are recommended."
        };
    }
  };

  const currentStatusConfig = evaluation ? getStatusAlertStyle(evaluation.status) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col justify-between">
      
      {/* 1. TOP HEADER & THEME TOGGLE */}
      <header className="border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-800 dark:text-slate-100 leading-tight">Meitei Yek Salai</h1>
              <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium">Advanced Eligibility Checker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show traditional database indicator */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {Object.keys(yumnakDatabase).length} Yumnaks Pre-Loaded
            </span>

            {/* Dark Mode Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
              id="theme-toggler"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE / CARD STEPPER */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center">
        
        {/* PROGRESS STEP INDICATOR (Show in steps 1 to 5) */}
        {step >= 1 && step <= 5 && (
          <div className="mb-6 w-full max-w-xl mx-auto">
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2">
              <span>Step {step} of 5: {
                step === 1 ? "Boy's Details" :
                step === 2 ? "Boy's Mother" :
                step === 3 ? "Girl's Details" :
                step === 4 ? "Girl's Mother" :
                "Traditional Checks"
              }</span>
              <span>{Math.round((step / 5) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl p-6 md:p-8 transition-all">
          
          {/* STEP 0: LANDING & EDUCATIONAL SUMMARY */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">
                  Advanced Yek Salai Eligibility Checker
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Beyond same-Yek matching with maternal clan analysis and traditional family verification.
                </p>
              </div>

              {/* The Seven Salais List */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3 text-center">
                  Traditional Seven Salais
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Mangang",
                    "Luwang",
                    "Khuman",
                    "Angom",
                    "Moirang",
                    "Kha-Nganba",
                    "Chenglei"
                  ].map((salai) => (
                    <div 
                      key={salai}
                      className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 shadow-2xs text-center min-w-[100px] flex items-center justify-center"
                    >
                      {salai}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 group transition-all shrink-0 shadow-lg shadow-emerald-500/20 dark:shadow-none cursor-pointer text-sm"
                  id="btn-begin"
                >
                  Check Marriage Eligibility
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* WHY THIS IS BETTER SECTION */}
              <div className="p-5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  Why this checker is more advanced than basic tools:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    "Same Yek Detection",
                    "Multi-Yek Surname Resolution",
                    "Maternal Clan Relationship Analysis",
                    "Traditional Family Verification Questions",
                    "Shared Maternal Grandmother Assessment",
                    "Detailed Eligibility Reports"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                      <span className="p-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                        <Check size={10} className="stroke-[3.5]" />
                      </span>
                      <span className="font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMPORTANT CUSTOMARY STATS BOX representing design guidelines "No Tech-Larping" */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  <h4>Traditional Disclaimer & Scope of Tool</h4>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  This application acts solely as an educational, decision-support guide to help identify preliminary clan restrictions. It does <strong>not</strong> substitute nor represent a legal, religious, genealogical, or customary traditional authority.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-amber-500/10">
                  Complete eligibility requires detailed family verification of Sagei (lineage), Apokpa (house deity), and maternal elders' permission.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: BOY INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 1: Boy's Information</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Specify the Surname (Yumnak) of the prospective groom.</p>
                </div>
              </div>

              <YumnakSelect
                label="Boy's Surname"
                helperText="We will lookup his traditional Yek Salai from the Meitei genealogical dataset."
                value={boy}
                onChange={(val) => {
                  setBoy(val);
                  setValidationError(null);
                }}
              />

              {validationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold transition"
                  id="btn-back-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition ml-auto"
                  id="btn-next-1"
                >
                  Next Step: Mother
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BOY'S MOTHER INFORMATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 2: Boy's Mother's Information</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">To protect against maternal-lineage consanguinity warnings, provide the groom's mother's birth surname.</p>
                </div>
              </div>

              <YumnakSelect
                label="Boy's Mother's Surname (Birth Surname)"
                helperText="Maternal lineages are traditionally checked to identify prohibited familial overlaps."
                value={boyMother}
                onChange={(val) => {
                  setBoyMother(val);
                  setValidationError(null);
                }}
              />

              {validationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold transition"
                  id="btn-back-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  id="btn-next-2"
                >
                  Next Step: Girl
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GIRL INFORMATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 3: Girl's Information</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Specify the Surname (Yumnak) of the prospective bride.</p>
                </div>
              </div>

              <YumnakSelect
                label="Girl's Surname"
                helperText="We will lookup her traditional Yek Salai from the Meitei genealogical dataset."
                value={girl}
                onChange={(val) => {
                  setGirl(val);
                  setValidationError(null);
                }}
              />

              {validationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold transition"
                  id="btn-back-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  id="btn-next-3"
                >
                  Next Step: Mother
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: GIRL'S MOTHER INFORMATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 4: Girl's Mother's Information</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-semibold">Specify the birth surname of the bride's mother.</p>
                </div>
              </div>

              <YumnakSelect
                label="Girl's Mother's Surname (Birth Surname)"
                helperText="Maternal clan lineage matches generate warnings preventing sibling-equivalent marriages."
                value={girlMother}
                onChange={(val) => {
                  setGirlMother(val);
                  setValidationError(null);
                }}
              />

              {validationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold transition"
                  id="btn-back-4"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  id="btn-next-4"
                >
                  Next: Traditional Checks
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TRADITIONAL FAMILY VERIFICATION QUESTIONNAIRE */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Traditional Family Verification</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Automatic checks cannot determine all family relationships. Please answer based on your family knowledge.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Question 1: Pendinnaba */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Q1. Have family elders identified the boy and girl as Pendinnaba?</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Pendinnaba refers to a traditionally prohibited maternal relationship recognized through family genealogy or elder knowledge.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {[
                      { id: "yes", label: "Yes, Prohibited" },
                      { id: "no", label: "No, Free of Prohibitions" },
                      { id: "dont_know", label: "Don't Know / Unverified" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPendinnaba(opt.id as any)}
                        className={`px-4 py-2.5 text-xs font-semibold rounded-lg border text-left sm:text-center transition-all flex-1 ${
                          pendinnaba === opt.id
                            ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-300"
                            : "bg-white border-slate-250 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                        id={`btn-pendinnaba-${opt.id}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Shared Grandmother */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Q2. Do the boy and girl share the same maternal grandmother?</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      This means both persons' mothers are biological daughters of the same woman.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {[
                      { id: "yes", label: "Yes, Shared" },
                      { id: "no", label: "No" },
                      { id: "dont_know", label: "Don't Know / Unverified" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSharedGrandmother(opt.id as any)}
                        className={`px-4 py-2.5 text-xs font-semibold rounded-lg border text-left sm:text-center transition-all flex-1 ${
                          sharedGrandmother === opt.id
                            ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/35 dark:border-rose-700 dark:text-rose-300"
                            : "bg-white border-slate-250 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                        id={`btn-sharedgrandmother-${opt.id}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Dynamic Moirang Ariba for Groom */}
                {boy.yek === "Moirang" && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-indigo-100 dark:border-indigo-950 rounded-xl space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded uppercase">Groom Checklist</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Is Groom ({boy.surname}) of the ancient Moirang Ariba Lineage?</h4>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Moirang Ariba refers/traces descent to the traditional lineage founded by Ngangningsing. Select &ldquo;No&rdquo; or &ldquo;Don't Know&rdquo; to skip.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {[
                        { id: "yes", label: "Yes (Moirang Ariba)" },
                        { id: "no", label: "No (Moirang Anouba)" },
                        { id: "dont_know", label: "Don't Know" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBoyMoirangAriba(opt.id as any)}
                          className={`px-4 py-2.5 text-xs font-semibold rounded-lg border text-left sm:text-center transition-all flex-1 ${
                            boyMoirangAriba === opt.id
                              ? "bg-indigo-50 border-indigo-500 text-indigo-750 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-200"
                              : "bg-white border-slate-250 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                          id={`btn-boymoirangariba-${opt.id}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question 4: Dynamic Moirang Ariba for Bride */}
                {girl.yek === "Moirang" && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-pink-100 dark:border-pink-950 rounded-xl space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-300 rounded uppercase">Bride Checklist</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Is Bride ({girl.surname}) of the ancient Moirang Ariba Lineage?</h4>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Moirang Ariba refers/traces descent to the traditional lineage founded by Ngangningsing. Select &ldquo;No&rdquo; or &ldquo;Don't Know&rdquo; to skip.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {[
                        { id: "yes", label: "Yes (Moirang Ariba)" },
                        { id: "no", label: "No (Moirang Anouba)" },
                        { id: "dont_know", label: "Don't Know" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setGirlMoirangAriba(opt.id as any)}
                          className={`px-4 py-2.5 text-xs font-semibold rounded-lg border text-left sm:text-center transition-all flex-1 ${
                            girlMoirangAriba === opt.id
                              ? "bg-pink-50 border-pink-500 text-pink-750 dark:bg-pink-950/40 dark:border-pink-600 dark:text-pink-200"
                              : "bg-white border-slate-250 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                          id={`btn-girlmoirangariba-${opt.id}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold transition"
                  id="btn-back-5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-505 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  id="btn-calculate"
                >
                  Calculate Eligibility
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: COMPLEX COMPREHENSIVE RESULT PAGE */}
          {step === 6 && evaluation && currentStatusConfig && (
            <div className="space-y-6">
              
              {/* Outcome Header Banner */}
              <div className={`p-6 border rounded-2xl flex flex-col items-center text-center space-y-3 ${currentStatusConfig.bg}`}>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
                  {currentStatusConfig.icon}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {currentStatusConfig.title}
                  </h3>
                  <p className="text-xs font-semibold opacity-80 mt-1 max-w-md mx-auto">
                    {currentStatusConfig.desc}
                  </p>
                </div>
              </div>

              {/* Clan Comparison Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3 bg-blue-50/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-505 bg-indigo-500"></span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Groom (Boy Lineage)</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                      <span>Surname:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{boy.surname}</strong>
                    </li>
                    <li className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                      <span>Yek Salai (Clan):</span>
                      <strong className="text-slate-800 dark:text-slate-100 text-indigo-600 dark:text-indigo-400">{boy.yek}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Mother's Clan:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{boyMother.yek} ({boyMother.surname})</strong>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3 bg-pink-50/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Bride (Girl Lineage)</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                      <span>Surname:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{girl.surname}</strong>
                    </li>
                    <li className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                      <span>Yek Salai (Clan):</span>
                      <strong className="text-slate-800 dark:text-slate-100 text-pink-600 dark:text-pink-400">{girl.yek}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Mother's Clan:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{girlMother.yek} ({girlMother.surname})</strong>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sub-checks list performed with results details */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-850 pb-2">
                  Completed Rules Engine Audit
                </h4>

                <div className="space-y-2">
                  {evaluation.results.map((res) => {
                    let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    let borderClass = "border-slate-100 dark:border-slate-800 bg-slate-50/30";
                    let textTitleClass = "text-slate-800 dark:text-slate-200";

                    if (res.severity === "reject") {
                      icon = <ShieldAlert className="w-5 h-5 text-rose-500" />;
                      borderClass = "border-rose-200 dark:border-rose-900 bg-rose-50/20";
                      textTitleClass = "text-rose-900 dark:text-rose-200";
                    } else if (res.severity === "warning") {
                      icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
                      borderClass = "border-amber-200 dark:border-amber-900 bg-amber-50/20";
                      textTitleClass = "text-amber-900 dark:text-amber-200";
                    } else if (res.severity === "info" && res.id.includes("same_surname")) {
                      icon = <Info className="w-5 h-5 text-indigo-500" />;
                      borderClass = "border-indigo-200 dark:border-indigo-900 bg-indigo-50/20";
                      textTitleClass = "text-indigo-950 dark:text-indigo-200";
                    }

                    return (
                      <div key={res.id} className={`p-4 border rounded-xl flex items-start gap-3.5 ${borderClass}`}>
                        <div className="shrink-0 mt-0.5">{icon}</div>
                        <div>
                          <h5 className={`font-bold text-xs ${textTitleClass}`}>{res.title}</h5>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                            {res.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Traditional Questionnaire answers output */}
              <div className="p-4 border border-slate-150 dark:border-slate-800/80 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Customary Questionnaire Verification Log:
                </h5>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-5">
                  <li>
                    Boy and Girl identified as Pendinnaba by elders:{" "}
                    <strong className="text-slate-750 dark:text-slate-300 font-semibold">
                      {pendinnaba === "yes" ? "Yes" : pendinnaba === "no" ? "No" : "Don't Know"}
                    </strong>
                  </li>
                  <li>
                    Shared biological maternal grandmother:{" "}
                    <strong className="text-slate-755 dark:text-slate-300 font-semibold">
                      {sharedGrandmother === "yes" ? "Yes" : sharedGrandmother === "no" ? "No" : "Don't Know"}
                    </strong>
                  </li>
                </ul>
              </div>

              {/* Share and Save Result Passport (Instant Share Icon Button) */}
              <div className="pt-2">
                <ReportCardCanvas
                  boy={boy}
                  boyMother={boyMother}
                  girl={girl}
                  girlMother={girlMother}
                  status={evaluation.status}
                  results={evaluation.results}
                />
              </div>

              {/* Reset action button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetChecker}
                  className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all text-sm cursor-pointer"
                  id="btn-restart"
                >
                  <RotateCcw className="w-4 h-4" />
                  Check Another Couple
                </button>
              </div>

              {/* Disclaimer Bottom block */}
              <div className="p-4 border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 rounded-xl flex gap-3 text-slate-400 dark:text-slate-500 text-xxs leading-relaxed">
                <Info size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Disclaimer Notice</p>
                  <p>
                    Verification results generated are based strictly on traditional Yek rules as entered. They do not comprise formal religious, ancestral, genealogical lineage declarations. Always verified with senior family elders and traditional scholars (Maichous/Lallup) before finalized.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3. PERSISTENT DISCLAIMER FOOTER */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/40 text-center text-xxs text-slate-400 dark:text-slate-600 space-y-2 mt-auto">
        <p className="font-medium text-slate-500 dark:text-slate-400">
          &copy; 2026 ‧{" "}
          <a
            href="https://baniat.blogspot.com//"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            Bani — Voices of Meitei Heritage
          </a>{" "}
          ‧ All rights reserved.
        </p>
        <p className="max-w-xl mx-auto px-4 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
          Traditional Salais: Mangang, Luwang, Khuman, Angom, Moirang, Kha-Nganba, Chenglei. Prohibited unions represent sibling boundaries. This interface is non-authoritative.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          If this tool helped you,{" "}
          <a
            href="https://banishwor.github.io/aboutme/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            support the creator
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
