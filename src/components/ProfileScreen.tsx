import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Layers,
  ShieldCheck,
  LogOut,
  Edit3,
  Camera,
  Trash2,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toBengali } from './CreditScoreGauge';
import { AuthUserData } from './AuthScreens';
import { BD_DISTRICTS } from '../services/weatherService';
import { updateFarmerProfileInFirestore } from '../lib/firebase';

interface Props {
  onBack: () => void;
  onLogout: () => void;
  onOpenAdvisor: () => void;
  user: AuthUserData | null;
  onUpdateUser?: (updatedUser: AuthUserData) => void;
}

export const ProfileScreen: React.FC<Props> = ({
  onBack,
  onLogout,
  onOpenAdvisor,
  user,
  onUpdateUser,
}) => {
  const [farmer, setFarmer] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi_farmer_land_info');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return {
      bighaTotal: 6,
      landDetails: [
        { size: '৪ বিঘা', soil: 'পলি-দোআঁশ মাটি', crop: 'আমন ধান (ব্রি ২৮)' },
        { size: '২ বিঘা', soil: 'দোআঁশ মাটি', crop: 'সবজি ও আলু' },
      ],
    };
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'মোঃ রাকিবুল ইসলাম');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'ঢাকা');
  const [editUpazila, setEditUpazila] = useState(user?.upazila || '');
  const [editLandBigha, setEditLandBigha] = useState(farmer.bighaTotal);
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | undefined>(user?.photoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.name || editName;
  const displayPhone = user?.phone || editPhone || '০১XXXXXXXXX';
  const displayDistrict = user?.district || editDistrict;
  const displayUpazila = user?.upazila || editUpazila;
  const displayLocation = displayUpazila
    ? `${displayUpazila}, ${displayDistrict}`
    : `${displayDistrict}, বাংলাদেশ`;
  const currentPhoto = user?.photoUrl || editPhotoUrl;

  // Compress and resize uploaded image in client
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Direct avatar file change from card
  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resizedBase64 = await processImageFile(file);
      setEditPhotoUrl(resizedBase64);

      if (user) {
        const updated: AuthUserData = {
          ...user,
          photoUrl: resizedBase64,
        };
        if (onUpdateUser) {
          onUpdateUser(updated);
        }
        // Save to Firestore
        if (user.phone) {
          updateFarmerProfileInFirestore(user.phone, { photoUrl: resizedBase64 }).catch((err) =>
            console.warn('Firestore photo update note:', err)
          );
        }
      }
      setSaveSuccessMsg('প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Photo processing failed:', err);
    }
  };

  // Upload photo inside modal
  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resizedBase64 = await processImageFile(file);
      setEditPhotoUrl(resizedBase64);
    } catch (err) {
      console.error('Photo processing failed:', err);
    }
  };

  const handleRemovePhoto = () => {
    setEditPhotoUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (modalFileInputRef.current) modalFileInputRef.current.value = '';
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditDistrict(user?.district || 'ঢাকা');
    setEditUpazila(user?.upazila || '');
    setEditLandBigha(farmer.bighaTotal);
    setEditPhotoUrl(user?.photoUrl);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSaving(true);
    try {
      const updatedUser: AuthUserData = {
        name: editName.trim(),
        phone: editPhone.trim() || (user?.phone ?? ''),
        district: editDistrict,
        upazila: editUpazila.trim(),
        photoUrl: editPhotoUrl,
      };

      // Update parent state and localStorage
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      // Update farmer land state
      const updatedFarmer = {
        ...farmer,
        bighaTotal: Number(editLandBigha) || farmer.bighaTotal,
      };
      setFarmer(updatedFarmer);
      try {
        localStorage.setItem('krishi_farmer_land_info', JSON.stringify(updatedFarmer));
      } catch (_) {}

      // Update Firestore
      if (updatedUser.phone) {
        await updateFarmerProfileInFirestore(updatedUser.phone, {
          name: updatedUser.name,
          district: updatedUser.district,
          upazila: updatedUser.upazila,
          photoUrl: updatedUser.photoUrl,
        });
      }

      setIsEditModalOpen(false);
      setSaveSuccessMsg('প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="farmer-profile-screen" className="space-y-4 pb-8 relative">
      {/* Hidden file input for direct photo upload from avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleQuickPhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-600 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-profile-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
          title="ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">কৃষক প্রোফাইল</h1>
        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-colors"
          title="লগআউট করুন"
        >
          <LogOut className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 shadow-sm text-center relative overflow-hidden">
        {/* Avatar with Photo Upload Camera Badge */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 mx-auto mb-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md overflow-hidden border-2 border-emerald-300 cursor-pointer group hover:opacity-90 transition-opacity"
            title="ছবি আপলোড করতে ট্যাপ করুন"
          >
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>

          {/* Camera upload icon overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center border-2 border-white shadow-md transition-colors cursor-pointer"
            title="নিজের ছবি আপলোড করুন"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-lg font-black text-stone-900">{displayName}</h2>
        <div className="flex items-center justify-center gap-3 text-xs text-stone-600 mt-1 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{displayLocation}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{displayPhone}</span>
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>যাচাইকৃত স্মার্ট কৃষক কার্ডধারী</span>
        </div>

        {/* Profile Edit Action Button */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            id="btn-edit-profile-open"
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>প্রোফাইল এডিট করুন</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ছবি পরিবর্তন</span>
          </button>
        </div>
      </div>

      {/* Farm Overview: জমির তথ্য */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>আমার জমি ও মাটি (মোট {toBengali(farmer.bighaTotal)} বিঘা)</span>
          </h3>
          <button
            onClick={onOpenAdvisor}
            className="text-[11px] text-emerald-700 font-bold hover:underline"
          >
            ফলন বিশ্লেষণ
          </button>
        </div>

        <div className="space-y-2">
          {farmer.landDetails.map((land: any, idx: number) => (
            <div
              key={idx}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-stone-900 block">{land.size}</span>
                <span className="text-[11px] text-stone-600">{land.soil}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {land.crop}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active AI Advisory Report Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900">সর্বশেষ AI পরামর্শ রিপোর্ট</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
            স্কোর: ৮৪/১০০
          </span>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed">
          আমন ধান ব্রি ২৮ এর সম্ভাব্য ফলন ৪.৩ টন/একর। ব্লাস্ট রোগ নিয়ন্ত্রণে ট্রাইসাইক্লাজল প্রয়োগের পরামর্শ দেওয়া হয়েছে।
        </p>
        <button
          onClick={onOpenAdvisor}
          className="w-full mt-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors text-center"
        >
          পূর্ণাঙ্গ রিপোর্ট দেখুন
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2 border border-red-200 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4 text-red-600" />
        <span>অ্যাকাউন্ট থেকে লগআউট করুন</span>
      </button>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">কৃষক প্রোফাইল সম্পাদনা</h3>
                  <p className="text-[10px] text-emerald-100">আপনার তথ্য ও ছবি পরিবর্তন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Photo upload section in modal */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-center space-y-2.5">
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md overflow-hidden border-2 border-white">
                    {editPhotoUrl ? (
                      <img
                        src={editPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center border border-white shadow-sm"
                    title="ছবি পরিবর্তন"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{editPhotoUrl ? 'নতুন ছবি বেছে নিন' : 'নিজের ছবি আপলোড করুন'}</span>
                  </button>

                  {editPhotoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
                      title="ছবি মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-stone-500">
                  মোবাইল গ্যালারি অথবা সরাসরি ক্যামেরা দিয়ে ছবি তুলতে পারবেন
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  কৃষকের পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="যেমন: মোঃ রাকিবুল ইসলাম"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="যেমন: ০১XXXXXXXXX"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 font-mono"
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">জেলা</label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                >
                  {BD_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.nameBn}>
                      {dist.nameBn} ({dist.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  উপজেলা / গ্রাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={editUpazila}
                  onChange={(e) => setEditUpazila(e.target.value)}
                  placeholder="যেমন: শেরপুর, বগুড়া"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                />
              </div>

              {/* Land Amount (Bigha) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  মোট কৃষিজমি (বিঘা)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editLandBigha}
                  onChange={(e) => setEditLandBigha(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 font-mono"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
