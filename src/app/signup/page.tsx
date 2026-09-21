'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccessibility, PersonaType, AccessibilityPreferences } from '@/context/AccessibilityContext';
import {
  Navigation,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Sliders,
  Accessibility,
  Footprints,
  Eye,
  Heart,
  CheckCircle2,
  Check,
  AlertCircle,
  Volume2,
  SlidersHorizontal,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const {
    user,
    accessibilityPreferences,
    registerUser,
    saveAccessibilityProfile,
    speakText,
  } = useAccessibility();

  // Step 1 = Reg form, Step 2 = Accessibility Questionnaire, Step 3 = Success
  const [step, setStep] = useState<number>(user.isLoggedIn ? 2 : 1);

  // Reg state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Questionnaire state
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(
    accessibilityPreferences.primaryPersona || 'wheelchair'
  );
  const [mobilityType, setMobilityType] = useState<string>(
    accessibilityPreferences.mobilityType || 'electric-wheelchair'
  );
  const [requireStepFree, setRequireStepFree] = useState<boolean>(
    accessibilityPreferences.requireStepFree ?? true
  );
  const [maxSlopePercent, setMaxSlopePercent] = useState<number>(
    accessibilityPreferences.maxSlopePercent || 5
  );
  const [preferLowerSlopes, setPreferLowerSlopes] = useState<boolean>(
    accessibilityPreferences.preferLowerSlopes ?? true
  );
  const [preferReducedDistance, setPreferReducedDistance] = useState<boolean>(
    accessibilityPreferences.preferReducedDistance ?? true
  );
  const [preferSaferCrossings, setPreferSaferCrossings] = useState<boolean>(
    accessibilityPreferences.preferSaferCrossings ?? true
  );
  const [avoidStairs, setAvoidStairs] = useState<boolean>(
    accessibilityPreferences.avoidStairs ?? true
  );
  const [needTactilePaving, setNeedTactilePaving] = useState<boolean>(
    accessibilityPreferences.needTactilePaving ?? false
  );
  const [needAudioPrompts, setNeedAudioPrompts] = useState<boolean>(
    accessibilityPreferences.needAudioPrompts ?? true
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const regUser = await registerUser(name, email, password);
      speakText(`Account created for ${regUser.name}. Let's configure your accessibility preferences.`);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updatedProfile: Partial<AccessibilityPreferences> = {
        primaryPersona: selectedPersona,
        mobilityType,
        requireStepFree,
        maxSlopePercent,
        preferLowerSlopes,
        preferReducedDistance,
        preferSaferCrossings,
        avoidStairs,
        needTactilePaving,
        needAudioPrompts,
      };

      await saveAccessibilityProfile(updatedProfile);
      speakText('Accessibility profile saved to database. Opening your personalized dashboard.');

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save accessibility preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      {/* Brand Header */}
      <Link href="/landing" className="flex items-center gap-3 mb-6 group">
        <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Navigation className="w-6 h-6 text-white fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-on-surface tracking-tight">
            PathFinder Access
          </span>
          <span className="text-[10px] text-on-surface-variant font-extrabold uppercase tracking-wider">
            Barrier-Free Navigation Core
          </span>
        </div>
      </Link>

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xl overflow-hidden my-4">
        
        {/* Step Progress Banner */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Onboarding & Accessibility Profile</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <span className={`px-2.5 py-0.5 rounded-full ${step === 1 ? 'bg-primary text-on-primary font-black' : 'bg-surface-container'}`}>1. Account</span>
            <span>→</span>
            <span className={`px-2.5 py-0.5 rounded-full ${step === 2 ? 'bg-primary text-on-primary font-black' : 'bg-surface-container'}`}>2. Profile Setup</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 1: REGISTRATION FORM
        ───────────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleRegister} className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black text-on-surface tracking-tight">
                Create Your Pathfinder Account
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                Register to save your personalized mobility parameters to the database.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-error/10 text-error text-xs font-bold border border-error/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-xs font-extrabold text-on-surface">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs font-extrabold text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="e.g. alex.rivera@community.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-xs font-extrabold text-on-surface">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                <input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl bg-primary text-on-primary font-black text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register & Continue to Profile Setup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-on-surface-variant font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-extrabold hover:underline">
                Log In
              </Link>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 2: ACCESSIBILITY QUESTIONNAIRE
        ───────────────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSaveProfile} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-outline-variant/20 pb-4">
              <h1 className="text-2xl font-black text-on-surface tracking-tight">
                Accessibility Profile Questionnaire
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                Configure your physical requirements to calibrate all route calculations.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-error/10 text-error text-xs font-bold border border-error/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Persona Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-on-surface uppercase tracking-wider">
                1. Mobility Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'wheelchair', label: 'Wheelchair', icon: Accessibility, desc: 'Ramps & Lifts' },
                  { id: 'older-adult', label: 'Older Adult', icon: Footprints, desc: 'Low Slopes' },
                  { id: 'low-vision', label: 'Low Vision', icon: Eye, desc: 'Audio Alerts' },
                  { id: 'caregiver', label: 'Caregiver', icon: Heart, desc: 'Stroller Paths' },
                ].map(p => {
                  const Icon = p.icon;
                  const isSelected = selectedPersona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPersona(p.id as PersonaType)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-container/20 border-primary text-on-surface shadow-xs ring-2 ring-primary/40'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary fill-primary text-white" />}
                      </div>
                      <span className="text-xs font-extrabold">{p.label}</span>
                      <span className="text-[10px] font-medium opacity-80">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobility Device Sub-Type */}
            <div className="flex flex-col gap-2">
              <label htmlFor="mobility-type-select" className="text-xs font-black text-on-surface uppercase tracking-wider">
                2. Mobility Device / Assistance Type
              </label>
              <select
                id="mobility-type-select"
                value={mobilityType}
                onChange={e => setMobilityType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="electric-wheelchair">Power / Electric Wheelchair</option>
                <option value="manual-wheelchair">Manual Wheelchair</option>
                <option value="walker-crutches">Walker / Crutches Support</option>
                <option value="visually-impaired">Visually Impaired / White Cane</option>
                <option value="stroller">Stroller / Pram Access</option>
                <option value="walking">Unassisted Walking (Gentle Pace)</option>
              </select>
            </div>

            {/* Route Preferences Checkboxes */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-on-surface uppercase tracking-wider">
                3. Detailed Route Requirements
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={requireStepFree}
                    onChange={e => setRequireStepFree(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Step-Free Routes Only</span>
                    <span className="text-[11px] text-on-surface-variant">Strictly avoid stairs, unramped steps & high curbs.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={avoidStairs}
                    onChange={e => setAvoidStairs(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Avoid Flight of Stairs</span>
                    <span className="text-[11px] text-on-surface-variant">Require elevators or escalators for level changes.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={preferLowerSlopes}
                    onChange={e => setPreferLowerSlopes(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Prefer Gentle Incline Slopes</span>
                    <span className="text-[11px] text-on-surface-variant">Reroute away from steep hills & intense ramps.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={preferSaferCrossings}
                    onChange={e => setPreferSaferCrossings(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Safer Signalized Crossings</span>
                    <span className="text-[11px] text-on-surface-variant">Prioritize intersections with audible/visual traffic signals.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={preferReducedDistance}
                    onChange={e => setPreferReducedDistance(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Reduced Physical Distance</span>
                    <span className="text-[11px] text-on-surface-variant">Optimize for shortest physical distance to conserve energy.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={needAudioPrompts}
                    onChange={e => setNeedAudioPrompts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface">Voice Spoken Guidance</span>
                    <span className="text-[11px] text-on-surface-variant">Enable audio turn alerts & obstacle warnings.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Incline Slider */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <label htmlFor="slope-slider-signup" className="text-xs font-extrabold text-on-surface">
                  Maximum Incline Slope Tolerance
                </label>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {maxSlopePercent}% max grade
                </span>
              </div>
              <input
                id="slope-slider-signup"
                type="range"
                min="3"
                max="15"
                step="1"
                value={maxSlopePercent}
                onChange={e => setMaxSlopePercent(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl bg-primary text-on-primary font-black text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 mt-2"
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? 'Saving Profile to Database...' : 'Save Profile & Redirect to Dashboard'}</span>
            </button>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 3: SUCCESS & REDIRECT
        ───────────────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-8 md:p-10 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-black text-on-surface tracking-tight">
                Profile Saved to Database!
              </h1>
              <p className="text-xs text-on-surface-variant font-medium max-w-md">
                Your personalized accessibility rule set is stored in your user profile. Redirecting to your dashboard...
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full max-w-sm h-13 rounded-2xl bg-primary text-on-primary font-black text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity cursor-pointer"
            >
              <span>Go to Main Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
