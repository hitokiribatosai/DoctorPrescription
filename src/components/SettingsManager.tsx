import React, { useState } from 'react';
import { DoctorProfile } from '../types';
import { storageService } from '../services/storageService';
import { 
  Settings, 
  Save, 
  CheckCircle, 
  MapPin, 
  Award, 
  Printer,
} from 'lucide-react';

interface SettingsManagerProps {
  doctorProfile: DoctorProfile;
  onUpdateDoctorProfile: (profile: DoctorProfile) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  doctorProfile,
  onUpdateDoctorProfile,
}) => {
  const [profile, setProfile] = useState<DoctorProfile>(doctorProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof DoctorProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveDoctorProfile(profile);
    onUpdateDoctorProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Upload image tampon scanné
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleChange('stampImageUrl', dataUrl);
      handleChange('stampType', 'uploaded');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {savedSuccess && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-xl border border-emerald-600 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-300" />
          <span>Paramètres du médecin et coordonnées enregistrés !</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Paramètres du Praticien & Coordonnées du Cabinet
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurez vos mentions légales algériennes, vos coordonnées bilingues de pied de page et votre griffe officielle.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-md shadow-teal-700/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les Modifications</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. INFORMATIONS DU MÉDECIN (BILINGUE FR / AR) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Award className="w-4 h-4 text-teal-700" />
            <span>Identité & Spécialité du Praticien (Français / Arabe)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Colonne Français */}
            <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block text-[11px]">En Français :</span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nom & Prénom (avec Dr.)
                </label>
                <input
                  type="text"
                  value={profile.fullNameFr}
                  onChange={e => handleChange('fullNameFr', e.target.value)}
                  className="w-full font-bold p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Titre & Fonction
                </label>
                <input
                  type="text"
                  value={profile.titleFr}
                  onChange={e => handleChange('titleFr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Spécialité
                </label>
                <input
                  type="text"
                  value={profile.specialtyFr}
                  onChange={e => handleChange('specialtyFr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diplômes & Titres Universitaires
                </label>
                <input
                  type="text"
                  value={profile.qualificationsFr}
                  onChange={e => handleChange('qualificationsFr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Colonne Arabe */}
            <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 font-arabic" dir="rtl">
              <span className="font-bold text-slate-800 block text-xs">باللغة العربية :</span>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  الاسم واللقب (مع د.)
                </label>
                <input
                  type="text"
                  value={profile.fullNameAr}
                  onChange={e => handleChange('fullNameAr', e.target.value)}
                  className="w-full font-bold p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  الصفة واللقب العلمي
                </label>
                <input
                  type="text"
                  value={profile.titleAr}
                  onChange={e => handleChange('titleAr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  التخصص الطبي
                </label>
                <input
                  type="text"
                  value={profile.specialtyAr}
                  onChange={e => handleChange('specialtyAr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  المؤهلات والشهادات
                </label>
                <input
                  type="text"
                  value={profile.qualificationsAr}
                  onChange={e => handleChange('qualificationsAr', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* Identifiants Légaux Algériens */}
          <div className="pt-2">
            <span className="font-bold text-slate-800 block text-xs mb-2">
              Identifiants Réglementaires (Affichés sur l'en-tête & le cachet) :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  N° Ordre des Médecins (CROM)
                </label>
                <input
                  type="text"
                  value={profile.orderNumber}
                  onChange={e => handleChange('orderNumber', e.target.value)}
                  className="w-full font-mono p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  N° Décision d'Agrément (Ministère)
                </label>
                <input
                  type="text"
                  value={profile.agreementNumber}
                  onChange={e => handleChange('agreementNumber', e.target.value)}
                  className="w-full font-mono p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Code Conventionné CNAS / CASNOS
                </label>
                <input
                  type="text"
                  value={profile.cnasCode}
                  onChange={e => handleChange('cnasCode', e.target.value)}
                  className="w-full font-mono p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. COORDONNÉES DU CABINET & PIED DE PAGE (EN BAS DE L'ORDONNANCE) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-teal-700" />
            <span>Pied de Page de l'Ordonnance (Adresse Bilingue, Téléphones & Horaires)</span>
          </h2>

          <p className="text-xs text-slate-500">
            Ces coordonnées s'impriment systématiquement tout en bas de vos ordonnances pour libérer le corps médical.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                📍 Adresse du Cabinet en Français
              </label>
              <input
                type="text"
                value={profile.cabinetAddressFr}
                onChange={e => handleChange('cabinetAddressFr', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              />
            </div>

            <div className="font-arabic" dir="rtl">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                📍 عنوان العيادة باللغة العربية
              </label>
              <input
                type="text"
                value={profile.cabinetAddressAr}
                onChange={e => handleChange('cabinetAddressAr', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                📞 Téléphone Fixe du Cabinet
              </label>
              <input
                type="text"
                value={profile.phoneFixe}
                onChange={e => handleChange('phoneFixe', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                📱 Numéros Mobiles
              </label>
              <input
                type="text"
                value={profile.phoneMobile}
                onChange={e => handleChange('phoneMobile', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                🚨 Numéro d'Urgences (Optionnel)
              </label>
              <input
                type="text"
                value={profile.phoneEmergency || ''}
                onChange={e => handleChange('phoneEmergency', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-red-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                🕒 Horaires de Consultation (FR)
              </label>
              <input
                type="text"
                value={profile.consultationHoursFr}
                onChange={e => handleChange('consultationHoursFr', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 font-arabic" dir="rtl">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                🕒 مواعيد وساعات الفحص بالعربية
              </label>
              <input
                type="text"
                value={profile.consultationHoursAr}
                onChange={e => handleChange('consultationHoursAr', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-right"
              />
            </div>
          </div>
        </div>

        {/* 3. TAMPON / GRIFFE DU MÉDECIN & OPTIONS D'IMPRESSION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Printer className="w-4 h-4 text-teal-700" />
            <span>Cachet / Griffe Officielle du Médecin & Impression</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Configuration du cachet */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Type de Griffe :
                </label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleChange('stampType', 'generated')}
                    className={`flex-1 py-2 text-xs font-bold ${
                      profile.stampType === 'generated'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Générateur Automatique
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('stampType', 'uploaded')}
                    className={`flex-1 py-2 text-xs font-bold ${
                      profile.stampType === 'uploaded'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Image Scannée / Signature
                  </button>
                </div>
              </div>

              {profile.stampType === 'generated' ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Forme du Cachet :
                    </label>
                    <select
                      value={profile.stampShape}
                      onChange={e => handleChange('stampShape', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="rectangular">Rectangulaire (Standard)</option>
                      <option value="oval">Ovale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Couleur de l'encre :
                    </label>
                    <select
                      value={profile.stampInkColor}
                      onChange={e => handleChange('stampInkColor', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="blue">Bleu Médical Officiel</option>
                      <option value="black">Noir Profond</option>
                      <option value="purple">Violet d'Officine</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Télécharger l'image de votre tampon ou signature (PNG/JPG) :
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    className="text-xs p-1 border border-slate-200 rounded-lg w-full"
                  />
                </div>
              )}

              {/* Format & Options d'impression */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.printWithHeader}
                      onChange={e => handleChange('printWithHeader', e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Imprimer avec l'en-tête (papier blanc)</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <span className="font-semibold text-slate-700">Format d'Ordonnance :</span>
                  <button
                    type="button"
                    onClick={() => handleChange('pageSize', 'A4')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      profile.pageSize === 'A4'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Format A4 Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('pageSize', 'A5')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      profile.pageSize === 'A5'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Format A5 (Ordonnancier)
                  </button>
                </div>
              </div>
            </div>

            {/* Aperçu Visuel du Cachet */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center min-h-[160px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase mb-3">
                Aperçu Visuel de votre Cachet :
              </span>

              {profile.stampType === 'uploaded' && profile.stampImageUrl ? (
                <img
                  src={profile.stampImageUrl}
                  alt="Aperçu Griffe"
                  className="max-h-24 object-contain mix-blend-multiply"
                />
              ) : (
                <div
                  className={`medical-stamp-box ${
                    profile.stampShape === 'oval' ? 'oval' : ''
                  } ${
                    profile.stampInkColor === 'black'
                      ? 'black-ink'
                      : profile.stampInkColor === 'purple'
                      ? 'purple-ink'
                      : ''
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider">
                    RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
                  </div>
                  <div className="text-xs font-extrabold uppercase mt-0.5 tracking-tight">
                    {profile.fullNameFr}
                  </div>
                  <div className="text-[10px] font-semibold font-arabic" dir="rtl">
                    {profile.fullNameAr}
                  </div>
                  <div className="text-[10px] font-semibold">
                    {profile.titleFr}
                  </div>
                  <div className="text-[9px] mt-0.5 font-mono">
                    Agrément : {profile.agreementNumber}
                  </div>
                  <div className="text-[9px] font-mono">
                    N° Ordre : {profile.orderNumber}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-md shadow-teal-700/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Informations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
