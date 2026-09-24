import React, { useEffect, useState } from 'react';
import { Medicine, Patient, Prescription, DoctorProfile, PrescriptionType, PrescriptionItem } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { PrescriptionEditor } from './components/PrescriptionEditor';
import { PatientHistoryView } from './components/PatientHistoryView';
import { LibraryManager } from './components/LibraryManager';
import { SettingsManager } from './components/SettingsManager';
import { MedicalCertificatesView } from './components/MedicalCertificatesView';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'prescription' | 'history' | 'library' | 'certificates' | 'settings'
  >('prescription');

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(
    storageService.getDoctorProfile()
  );
  const [patients, setPatients] = useState<Patient[]>(storageService.getPatients());
  const [medicines, setMedicines] = useState<Medicine[]>(storageService.getMedicines());
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void storageService.loadAlgerianCatalog()
      .then(loadedMedicines => {
        if (!active) return;
        setMedicines(loadedMedicines);
        setCatalogLoaded(true);
      })
      .catch(error => {
        console.error('Unable to load the Algerian medicine catalog.', error);
      });

    return () => {
      active = false;
    };
  }, []);

  // État de reconduction d'une ordonnance depuis l'historique
  const [prescriptionToDuplicate, setPrescriptionToDuplicate] = useState<{
    patient: Patient;
    items: PrescriptionItem[];
    type: PrescriptionType;
    notes?: string;
  } | null>(null);

  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>();

  const refreshPatients = () => {
    setPatients(storageService.getPatients());
  };

  const refreshMedicines = () => {
    setMedicines(storageService.getMedicines());
  };

  const handleUpdateDoctorProfile = (updated: DoctorProfile) => {
    setDoctorProfile(updated);
  };

  // RECONDUCTION 1-CLIC D'UNE ANCIENNE ORDONNANCE DEPUIS L'HISTORIQUE PATIENTS
  const handleRenewPrescription = (presc: Prescription) => {
    setPrescriptionToDuplicate({
      patient: presc.patientSnapshot,
      items: presc.items.map(item => ({
        ...item,
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      })),
      type: presc.type,
      notes: presc.notes,
    });
    setActiveTab('prescription');
  };

  const handleSwitchToHistory = (patientId?: string) => {
    setPreselectedPatientId(patientId);
    setActiveTab('history');
  };

  const favoriteCount = medicines.filter(m => m.isFavorite).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
      {/* Navigation Principale */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'history') setPreselectedPatientId(undefined);
          setActiveTab(tab);
        }}
        doctorProfile={doctorProfile}
        patientCount={patients.length}
        favoriteCount={favoriteCount}
      />

      {/* Contenu de la Vue Active */}
      <main className="flex-1">
        {activeTab === 'prescription' && (
          <PrescriptionEditor
            medicines={medicines}
            patients={patients}
            doctorProfile={doctorProfile}
            onRefreshPatients={refreshPatients}
            onSwitchToHistory={handleSwitchToHistory}
            initialPrescriptionToDuplicate={prescriptionToDuplicate}
          />
        )}

        {activeTab === 'history' && (
          <PatientHistoryView
            patients={patients}
            doctorProfile={doctorProfile}
            onRefreshPatients={refreshPatients}
            onRenewPrescription={handleRenewPrescription}
            preselectedPatientId={preselectedPatientId}
          />
        )}

        {activeTab === 'library' && (
          <LibraryManager
            medicines={medicines}
            onRefreshMedicines={refreshMedicines}
            catalogLoaded={catalogLoaded}
          />
        )}

        {activeTab === 'certificates' && (
          <MedicalCertificatesView
            doctorProfile={doctorProfile}
            patients={patients}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            doctorProfile={doctorProfile}
            onUpdateDoctorProfile={handleUpdateDoctorProfile}
          />
        )}
      </main>
    </div>
  );
}

export default App;
