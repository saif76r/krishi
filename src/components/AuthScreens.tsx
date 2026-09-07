import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Lock,
  User,
  MapPin,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { KrishiLogo } from './KrishiLogo';
import { BD_DISTRICTS } from '../services/weatherService';
import { registerFarmerToFirestore, loginFarmerWithFirestore } from '../lib/firebase';

export interface AuthUserData {
  name: string;
  phone: string;
  district: string;
  photoUrl?: string;
  upazila?: string;
}

interface Props {
  onLoginSuccess: (user: AuthUserData) => void;
}

interface StoredAccount extends AuthUserData {
  password: string;
}

const DEFAULT_DEMO_ACCOUNT: StoredAccount = {
  name: 'মোঃ রাকিবুল ইসলাম',
  phone: '01700000000',
  district: 'ঢাকা',
  password: '123456',
};

export const AuthScreens: React.FC<Props> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'splash' | 'login' | 'register'>('splash');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('ঢাকা');

  // Initialize stored accounts list in localStorage if not present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('krishi_registered_accounts');
      if (!stored) {
        localStorage.setItem('krishi_registered_accounts', JSON.stringify([DEFAULT_DEMO_ACCOUNT]));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const stored = localStorage.getItem('krishi_registered_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
    return [DEFAULT_DEMO_ACCOUNT];
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নাম্বার এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. First try verifying against Firebase Cloud Firestore
      const firestoreResult = await loginFarmerWithFirestore(cleanPhone, cleanPass);

      if (firestoreResult.success && firestoreResult.user) {
        const userData: AuthUserData = {
          name: firestoreResult.user.name,
          phone: firestoreResult.user.phone,
          district: firestoreResult.user.district,
        };
        const targetDistrict = BD_DISTRICTS.find(
          (d) => d.nameBn === userData.district || d.nameEn.toLowerCase() === userData.district.toLowerCase() || d.id === userData.district
        );
        const distId = targetDistrict ? targetDistrict.id : 'dhaka';
        localStorage.setItem('krishi_current_user', JSON.stringify(userData));
        localStorage.setItem('krishi_farmer_district', distId);
        onLoginSuccess(userData);
        return;
      }

      // If Firebase specifically said password was wrong
      if (firestoreResult.message && firestoreResult.message.includes('পাসওয়ার্ড সঠিক নয়')) {
        setErrorMessage(firestoreResult.message);
        setIsSubmitting(false);
        return;
      }

      // 2. Check local storage fallback (for offline or local accounts)
      const accounts = getRegisteredAccounts();
      const matched = accounts.find((acc) => acc.phone === cleanPhone && acc.password === cleanPass);

      if (matched) {
        const userData: AuthUserData = {
          name: matched.name,
          phone: matched.phone,
          district: matched.district,
        };
        const targetDistrict = BD_DISTRICTS.find(
          (d) => d.nameBn === matched.district || d.nameEn.toLowerCase() === matched.district.toLowerCase() || d.id === matched.district
        );
        const distId = targetDistrict ? targetDistrict.id : 'dhaka';
        localStorage.setItem('krishi_current_user', JSON.stringify(userData));
        localStorage.setItem('krishi_farmer_district', distId);

        // Async sync back to Firebase in background
        registerFarmerToFirestore({
          name: matched.name,
          phone: matched.phone,
          password: cleanPass,
          district: matched.district,
        }).catch(() => {});

        onLoginSuccess(userData);
        return;
      }

      setErrorMessage(
        firestoreResult.message ||
          'মোবাইল নাম্বার অথবা পাসওয়ার্ড সঠিক নয়। আপনি কি নতুন একাউন্ট খুলতে চান?'
      );
    } catch (err: any) {
      setErrorMessage('লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanName) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ ডিজিট বা অক্ষরের হতে হবে।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save directly to Firebase Firestore
      const firestoreResult = await registerFarmerToFirestore({
        name: cleanName,
        phone: cleanPhone,
        password: cleanPass,
        district: district || 'ঢাকা',
      });

      if (!firestoreResult.success) {
        setErrorMessage(firestoreResult.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      // 2. Also keep local session cache
      const newUser: AuthUserData = {
        name: cleanName,
        phone: cleanPhone,
        district: district || 'ঢাকা',
      };

      const accounts = getRegisteredAccounts();
      const updated = [...accounts.filter((a) => a.phone !== cleanPhone), { ...newUser, password: cleanPass }];
      localStorage.setItem('krishi_registered_accounts', JSON.stringify(updated));

      // Save active session and login immediately
      const targetDistrict = BD_DISTRICTS.find(
        (d) => d.nameBn === district || d.nameEn.toLowerCase() === district.toLowerCase() || d.id === district
      );
      const distId = targetDistrict ? targetDistrict.id : 'dhaka';
      localStorage.setItem('krishi_current_user', JSON.stringify(newUser));
      localStorage.setItem('krishi_farmer_district', distId);

      onLoginSuccess(newUser);
    } catch (err: any) {
      setErrorMessage('নিবন্ধনে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="auth-flow-container" className="min-h-screen bg-stone-50 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between h-10">
        {authMode !== 'splash' ? (
          <button
            onClick={() => {
              setErrorMessage(null);
              setAuthMode('splash');
            }}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow-xs transition-colors"
            title="পেছনে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9"></div>
        )}

        <div className="w-9"></div>
      </div>

      {/* 1. SPLASH / WELCOME SCREEN */}
      {authMode === 'splash' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto w-full py-4">
          <div className="scale-110 mb-2">
            <KrishiLogo size="lg" showText={true} />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">কৃষি গাইড</h1>
            <p className="text-xs text-stone-500 font-medium">কৃষকের নির্ভরযোগ্য ডিজিটাল সহকারী</p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-2">
            <button
              onClick={() => {
                setErrorMessage(null);
                setAuthMode('login');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>লগইন করুন</span>
            </button>
            <button
              onClick={() => {
                setErrorMessage(null);
                setAuthMode('register');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-emerald-900 border border-emerald-300 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>নতুন অ্যাকাউন্ট তৈরি করুন (নিবন্ধন)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. LOGIN SCREEN */}
      {authMode === 'login' && (
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4 space-y-4">
          <div className="text-center">
            <KrishiLogo size="sm" showText={true} />
            <h2 className="text-xl font-bold text-stone-900 mt-3">লগইন করুন</h2>
            <p className="text-xs text-stone-500 mt-1">অ্যাপে প্রবেশ করতে আপনার মোবাইল ও পাসওয়ার্ড দিন</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">মোবাইল নাম্বার</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <span>লগইন করুন ও অ্যাপে প্রবেশ করুন</span>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-stone-600 pt-2">
            একাউন্ট নেই?{' '}
            <button
              onClick={() => {
                setErrorMessage(null);
                setAuthMode('register');
              }}
              className="font-bold text-emerald-700 hover:underline"
            >
              নতুন একাউন্ট নিবন্ধন করুন
            </button>
          </div>
        </div>
      )}

      {/* 3. REGISTER SCREEN */}
      {authMode === 'register' && (
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4 space-y-4">
          <div className="text-center">
            <KrishiLogo size="sm" showText={true} />
            <h2 className="text-xl font-bold text-stone-900 mt-2">নতুন কৃষক নিবন্ধন</h2>
            <p className="text-xs text-stone-500 mt-1">আপনার সঠিক তথ্য দিয়ে একাউন্ট তৈরি করুন</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">আপনার পূর্ণ নাম</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোঃ রাকিবুল ইসলাম"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">মোবাইল নাম্বার</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">জেলা নির্বাচন করুন</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameBn}>
                      {d.nameBn} ({d.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">গোপন পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড"
                  minLength={6}
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>নিবন্ধন সম্পন্ন করুন ও প্রবেশ করুন</span>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-stone-600 pt-1">
            ইতিমধ্যে একাউন্ট আছে?{' '}
            <button
              onClick={() => {
                setErrorMessage(null);
                setAuthMode('login');
              }}
              className="font-bold text-emerald-700 hover:underline"
            >
              লগইন করুন
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Assurance */}
      <div className="text-center py-2 text-[11px] text-stone-500">
        কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও আধুনিক AI নির্দেশিকা অনুসরণে তৈরি
      </div>
    </div>
  );
};

