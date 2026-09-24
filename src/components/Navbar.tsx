import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Download,
  FilePlus2,
  History,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
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

const navigation = [
  { id: 'prescription', label: 'Nouvelle ordonnance', short: 'Ordo', icon: FilePlus2, section: 'ACTIVITÉ' },
  { id: 'history', label: 'Patients', short: 'Patients', icon: Users, section: 'ACTIVITÉ' },
  { id: 'library', label: 'Médicaments', short: 'Médic.', icon: BookOpen, section: 'OUTILS' },
  { id: 'certificates', label: 'Certificats & bilans', short: 'Bilans', icon: Award, section: 'OUTILS' },
  { id: 'settings', label: 'Réglages du cabinet', short: 'Réglages', icon: Settings, section: 'CABINET' },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  doctorProfile,
  patientCount,
  favoriteCount,
}) => {
  const handleExportAll = () => {
    if (confirm('Voulez-vous télécharger une copie de sauvegarde complète de l’historique des patients et du cabinet ?')) {
      storageService.exportAllHistory();
    }
  };

  return (
    <aside className="app-sidebar no-print" aria-label="Navigation principale">
      <div className="sidebar-brand">
        <div className="brand-mark"><Stethoscope size={21} strokeWidth={2.2} /></div>
        <div className="brand-copy">
          <span className="brand-name">Ordo<span>Med</span></span>
          <span className="brand-caption">CABINET MÉDICAL</span>
        </div>
      </div>

      <div className="sidebar-rule" />

      <nav className="sidebar-nav">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const showSection = index === 0 || navigation[index - 1].section !== item.section;
          const count = item.id === 'history' ? patientCount : item.id === 'library' ? favoriteCount : 0;

          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section-label">{item.section}</div>}
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`nav-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                title={item.id === 'history' ? 'Patients & historique' : item.label}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                <span className="nav-link-label">{item.label}</span>
                <span className="nav-link-short">{item.short}</span>
                {count > 0 && <span className={`nav-count${item.id === 'library' ? ' is-favorite' : ''}`}>{count}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-assurance">
        <ShieldCheck size={16} />
        <span>Données enregistrées sur cet appareil</span>
      </div>

      <button type="button" className="sidebar-backup" onClick={handleExportAll}>
        <Download size={16} />
        <span>Sauvegarder les données</span>
      </button>

      <div className="sidebar-doctor">
        <div className="doctor-avatar"><Activity size={17} /></div>
        <div className="doctor-copy">
          <span className="doctor-name">{doctorProfile.fullNameFr || 'Votre cabinet'}</span>
          <span className="doctor-role">{doctorProfile.specialtyFr || 'Profil praticien'}</span>
        </div>
        <History size={15} className="doctor-presence" aria-hidden="true" />
      </div>
    </aside>
  );
};
