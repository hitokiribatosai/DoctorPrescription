import React from 'react';
import { 
  FileText, 
  Users, 
  BookOpen, 
  Award, 
  Settings, 
  Download, 
  Stethoscope,
  Star
} from 'lucide-react';
import { DoctorProfile } from '../types';
import { storageService } from '../services/storageService';

interface NavbarProps {
  activeTab: 'prescription' | 'history' | 'library' | 'certificates' | 'settings';
  setActiveTab: (tab: 'prescription' | 'history' | 'library' | 'certificates' | 'settings') => void;
  doctorProfile: DoctorProfile;
  patientCount: number;
  favoriteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  doctorProfile,
  patientCount,
  favoriteCount,
}) => {
  const handleExportAll = () => {
    if (confirm('Voulez-vous télécharger une copie de sauvegarde complète de l\'historique des patients et du cabinet ?')) {
      storageService.exportAllHistory();
    }
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Titre */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                  Ordo<span className="text-teal-600">Med</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Algérie 🇩🇿
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Prescription & Dossier Patient Cabinet</p>
            </div>
          </div>

          {/* Navigation Onglets */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('prescription')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'prescription'
                  ? 'bg-teal-50 text-teal-800 shadow-xs font-semibold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Ordonnance</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'bg-teal-50 text-teal-800 shadow-xs font-semibold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Historique Patients</span>
              {patientCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  {patientCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-teal-50 text-teal-800 shadow-xs font-semibold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Bibliothèque</span>
              {favoriteCount > 0 && (
                <span className="flex items-center text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                  {favoriteCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'certificates'
                  ? 'bg-teal-50 text-teal-800 shadow-xs font-semibold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Certificats & Bilans</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-teal-50 text-teal-800 shadow-xs font-semibold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Paramètres & Griffe</span>
            </button>
          </nav>

          {/* Profil Médecin & Actions Rapides */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportAll}
              title="Exporter une sauvegarde complète de l'historique cabinet"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center space-x-1"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline font-medium">Sauvegarder</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {doctorProfile.fullNameFr}
              </div>
              <div className="text-[10px] text-teal-700 font-medium font-arabic" dir="rtl">
                {doctorProfile.fullNameAr}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
