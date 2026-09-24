import React, { useState, useMemo } from 'react';
import { 
  Medicine, 
  Patient, 
  PrescriptionItem, 
  PrescriptionType, 
  DoctorProfile,
  Prescription
} from '../types';
import { ARABIC_INSTRUCTION_PRESETS } from '../data/defaultData';
import { calculateBoxes, formatPrescriptionDate } from '../services/boxCalculator';
import { storageService } from '../services/storageService';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Star, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Activity,
  Repeat,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Columns,
  History,
  FileText,
  User,
  Sliders,
  Sparkles,
  Phone,
  CreditCard
} from 'lucide-react';
import { PrintablePrescription } from './PrintablePrescription';

interface PrescriptionEditorProps {
  medicines: Medicine[];
  patients: Patient[];
  doctorProfile: DoctorProfile;
  onRefreshPatients: () => void;
  onSwitchToHistory: (patientId?: string) => void;
  initialPrescriptionToDuplicate?: {
    patient: Patient;
    items: PrescriptionItem[];
    type: PrescriptionType;
    notes?: string;
  } | null;
}

type ViewMode = 'editor' | 'preview' | 'split' | 'patient_history';

export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({
  medicines,
  patients,
  doctorProfile,
  onRefreshPatients,
  onSwitchToHistory,
  initialPrescriptionToDuplicate,
}) => {
  // Mode de Vue (Saisie, Aperçu Plein Écran, Vue Scindée, Historique Patient)
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Patient State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPrescriptionToDuplicate?.patient.id || (patients.length > 0 ? patients[0].id : '')
  );

  const initialPatient = initialPrescriptionToDuplicate?.patient || (patients.length > 0 ? patients[0] : null);

  const [patientLastName, setPatientLastName] = useState<string>(
    initialPatient?.lastName || ''
  );
  const [patientFirstName, setPatientFirstName] = useState<string>(
    initialPatient?.firstName || ''
  );
  const [patientAge, setPatientAge] = useState<number>(
    initialPatient?.age || 35
  );
  const [patientGender, setPatientGender] = useState<'M' | 'F'>(
    initialPatient?.gender || 'M'
  );
  const [patientWeight, setPatientWeight] = useState<number | undefined>(
    initialPatient?.weight || undefined
  );
  const [patientNss, setPatientNss] = useState<string>(
    initialPatient?.nss || ''
  );
  const [patientPhone, setPatientPhone] = useState<string>(
    initialPatient?.phone || ''
  );

  // Prescription State
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>(
    initialPrescriptionToDuplicate?.type || 'aigue'
  );
  const [prescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(
    initialPrescriptionToDuplicate?.notes || ''
  );
  const [items, setItems] = useState<PrescriptionItem[]>(
    initialPrescriptionToDuplicate?.items || []
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Historique des ordonnances du patient actuellement sélectionné
  const currentPatientHistory = useMemo(() => {
    if (!selectedPatientId) return [];
    return storageService.getPatientPrescriptions(selectedPatientId);
  }, [selectedPatientId]);

  // Synchronisation lors de la sélection d'un patient existant
  const handleSelectExistingPatient = (pId: string) => {
    setSelectedPatientId(pId);
    if (!pId) return;

    const found = patients.find(p => p.id === pId);
    if (found) {
      setPatientLastName(found.lastName);
      setPatientFirstName(found.firstName);
      setPatientAge(found.age);
      setPatientGender(found.gender);
      setPatientWeight(found.weight);
      setPatientNss(found.nss || '');
      setPatientPhone(found.phone || '');
    }
  };

  // RECONDUCTION IMMÉDIATE D'UNE ANCIENNE ORDONNANCE (DIRECTEMENT DANS L'ÉCRAN DE PRESCRIPTION)
  const handleRenewHistoricalPrescription = (presc: Prescription) => {
    setItems(
      presc.items.map(item => ({
        ...item,
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      }))
    );
    setPrescriptionType(presc.type);
    if (presc.notes) setNotes(presc.notes);
    setViewMode('split');
    showToast('success', `✅ Ordonnance du ${presc.dateFormatted || presc.date} rechargée avec succès !`);
  };

  // Liste des favoris pour la barre d'accès rapide en 1-clic ⭐
  const favoriteMedicines = useMemo(() => {
    return medicines.filter(m => m.isFavorite);
  }, [medicines]);

  // Dispositifs médicaux de diagnostic
  const diagnosticDevices = useMemo(() => {
    return medicines.filter(m => m.isDevice);
  }, [medicines]);

  // Catégories
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  // Médicaments filtrés
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch =
        m.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dci.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.laboratory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || m.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Ajouter un médicament à l'ordonnance
  const handleAddMedicine = (med: Medicine) => {
    const isChronique = prescriptionType === 'chronique';
    const defaultDuration = med.isDevice ? 1 : isChronique ? 90 : 7;
    const defaultDailyDose = med.isDevice ? 1 : 2;

    const calc = calculateBoxes(med, defaultDailyDose, defaultDuration);

    const newItem: PrescriptionItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      medicineId: med.id,
      tradeName: med.tradeName,
      dci: med.dci,
      form: med.form,
      dosage: med.dosage,
      unitsPerBox: med.unitsPerBox,
      unitLabel: med.unitLabel,
      isDevice: med.isDevice,
      posology: med.defaultPosology,
      dailyDose: defaultDailyDose,
      durationDays: defaultDuration,
      durationText: isChronique ? 'Pendant 3 mois (Chifa)' : `Pendant ${defaultDuration} jours`,
      totalUnitsNeeded: calc.totalUnitsNeeded,
      calculatedBoxes: calc.calculatedBoxes,
      arabicInstructions: med.defaultArabicInstructions || '',
      alternativeMedicine: '',
      isChronicChifa: isChronique,
    };

    setItems(prev => [...prev, newItem]);
    setSearchQuery('');
    showToast('success', `${med.tradeName} ajouté`);
  };

  // Mettre à jour une ligne
  const handleUpdateItem = (id: string, updates: Partial<PrescriptionItem>) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, ...updates };

        if ('dailyDose' in updates || 'durationDays' in updates) {
          const med = medicines.find(m => m.id === updatedItem.medicineId) || {
            id: updatedItem.medicineId,
            tradeName: updatedItem.tradeName,
            dci: updatedItem.dci,
            form: updatedItem.form,
            dosage: updatedItem.dosage,
            unitsPerBox: updatedItem.unitsPerBox,
            unitLabel: updatedItem.unitLabel,
            isDevice: updatedItem.isDevice,
          } as Medicine;

          const calc = calculateBoxes(med, updatedItem.dailyDose, updatedItem.durationDays);
          updatedItem.totalUnitsNeeded = calc.totalUnitsNeeded;
          updatedItem.calculatedBoxes = calc.calculatedBoxes;
        }

        return updatedItem;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const validate = (): boolean => {
    if (!patientLastName.trim() || !patientFirstName.trim()) {
      showToast('error', 'Veuillez saisir le Nom et Prénom du patient.');
      return false;
    }
    if (items.length === 0) {
      showToast('error', 'L\'ordonnance est vide. Ajoutez au moins un médicament.');
      return false;
    }
    return true;
  };

  // Sauvegarde systématique dans Historique Patients
  const handleSaveToHistory = (): { prescriptionId: string; patientId: string } | null => {
    if (!validate()) return null;

    const patientInput: Partial<Patient> & { firstName: string; lastName: string } = {
      id: selectedPatientId || undefined,
      firstName: patientFirstName.trim(),
      lastName: patientLastName.trim().toUpperCase(),
      age: Number(patientAge) || 30,
      gender: patientGender,
      weight: patientWeight ? Number(patientWeight) : undefined,
      phone: patientPhone.trim(),
      nss: patientNss.trim(),
    };

    const { prescription, patient } = storageService.autoSavePrescriptionBeforePrint(
      patientInput,
      items,
      prescriptionType,
      notes
    );

    setSelectedPatientId(patient.id);
    onRefreshPatients();

    showToast(
      'success',
      `✅ Ordonnance N° ${prescription.reference} enregistrée dans l'Historique de ${patient.lastName} ${patient.firstName} !`
    );

    return { prescriptionId: prescription.id, patientId: patient.id };
  };

  // Action Imprimer
  const handlePrintAndSave = () => {
    const res = handleSaveToHistory();
    if (!res) return;

    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Navigation gauche/droite (Swipe / Next View)
  const handleNextView = () => {
    if (viewMode === 'editor') setViewMode('split');
    else if (viewMode === 'split') setViewMode('preview');
    else if (viewMode === 'preview') setViewMode('patient_history');
    else setViewMode('editor');
  };

  const handlePrevView = () => {
    if (viewMode === 'patient_history') setViewMode('preview');
    else if (viewMode === 'preview') setViewMode('split');
    else if (viewMode === 'split') setViewMode('editor');
    else setViewMode('patient_history');
  };

  const currentPatientSnapshot = {
    firstName: patientFirstName,
    lastName: patientLastName,
    age: patientAge,
    gender: patientGender,
    weight: patientWeight,
    nss: patientNss,
    phone: patientPhone,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`no-print fixed top-20 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-600'
              : 'bg-red-800 text-white border border-red-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. BARRE DE COMMANDE SUPÉRIEURE UNIFIÉE & SWIPER D'AFFICHAGE */}
      <div className="no-print mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Titre & Statut */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevView}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Vue précédente (Swipe Gauche)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Prescription Médicale
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {prescriptionType === 'chronique' ? 'Chronique Chifa 3M' : 'Aiguë Ordinaire'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Espace unifié du cabinet • Sauvegarde automatique systématique
            </p>
          </div>

          <button
            onClick={handleNextView}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Vue suivante (Swipe Droite)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SWIPER / SEGMENTED TABS TOGGLE */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'editor'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mode Saisie</span>
            <span className="md:hidden">Saisie</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('split');
              setZoomScale(0.85);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vue Côte-à-Côte</span>
            <span className="md:hidden">Split</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('preview');
              setZoomScale(1.0);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ordonnance A4</span>
            <span className="md:hidden">A4</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('patient_history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'patient_history'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dossier Patient</span>
            {currentPatientHistory.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
                {currentPatientHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Boutons d'Action Principaux */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveToHistory}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Save className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>

          <button
            onClick={handlePrintAndSave}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 shadow-md shadow-teal-700/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* 2. CONTENU PRINCIPAL SELON LE MODE CHOISI (AVEC SUPPORT SWIPE & ZOOM) */}
      <div className="space-y-4">
        {/* BANNIÈRE DE RECONDUCTION RAPIDE DIRECTE (HISTORIQUE PATIENT DANS LA PRESCRIPTION) */}
        {selectedPatientId && currentPatientHistory.length > 0 && viewMode !== 'patient_history' && (
          <div className="no-print bg-gradient-to-r from-blue-50/90 via-teal-50/70 to-emerald-50/60 p-3 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-extrabold text-blue-950">
                Dernière ordonnance ({currentPatientHistory[0].dateFormatted || currentPatientHistory[0].date}) :
              </span>
              <span className="text-xs text-slate-700 hidden sm:inline">
                {currentPatientHistory[0].items.map(i => i.tradeName).slice(0, 3).join(', ')}
                {currentPatientHistory[0].items.length > 3 ? '...' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRenewHistoricalPrescription(currentPatientHistory[0])}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-teal-700 hover:bg-teal-800 shadow-xs transition-all"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>⭐ Reconduire cette ordonnance (1-clic)</span>
              </button>

              <button
                onClick={() => setViewMode('patient_history')}
                className="text-xs text-blue-700 hover:underline font-bold px-2 py-1"
              >
                Voir tout l'historique ({currentPatientHistory.length}) →
              </button>
            </div>
          </div>
        )}

        {/* VUE 1 : HISTORIQUE COMPLET DU PATIENT ACTIF */}
        {viewMode === 'patient_history' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                  {patientLastName.charAt(0)}{patientFirstName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase">
                    Dossier Médical : {patientLastName} {patientFirstName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {patientAge} ans • N° Chifa: {patientNss || 'Non renseigné'} • Tél: {patientPhone || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewMode('split')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                ← Revenir à l'Ordonnance
              </button>
            </div>

            <div className="space-y-3">
              {currentPatientHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Aucune ordonnance passée pour ce patient. Rédigez sa première ordonnance ci-dessous.
                </div>
              ) : (
                currentPatientHistory.map(presc => (
                  <div
                    key={presc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {presc.reference}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {presc.dateFormatted || presc.date}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {presc.type === 'chronique' ? 'Chronique 3M' : 'Aiguë'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 mt-1.5 pl-1">
                        {presc.items.map((i, idx) => (
                          <span key={idx} className="mr-2">
                            • <strong>{i.tradeName}</strong> ({i.dosage}) — {i.calculatedBoxes} bte(s)
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRenewHistoricalPrescription(presc)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Reconduire cette ordonnance</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VUE 2 : GRILLE SPLIT OU PLEIN ÉCRAN */}
        {viewMode !== 'patient_history' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* PANNEAU DE GAUCHE : FORMULAIRE DE SAISIE */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
                {/* A. IDENTITÉ DU PATIENT */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Patient du Cabinet</span>
                    </span>

                    {/* Sélecteur patient rapide */}
                    <div className="w-56">
                      <select
                        value={selectedPatientId}
                        onChange={e => handleSelectExistingPatient(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-1 bg-slate-50 focus:bg-white"
                      >
                        <option value="">-- Patient au cabinet --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.lastName} {p.firstName} ({p.age} ans)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={patientLastName}
                        onChange={e => setPatientLastName(e.target.value)}
                        className="w-full font-bold uppercase p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={patientFirstName}
                        onChange={e => setPatientFirstName(e.target.value)}
                        className="w-full font-semibold p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Âge
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={patientAge}
                        onChange={e => setPatientAge(parseInt(e.target.value, 10) || 0)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Sexe
                      </label>
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => setPatientGender('M')}
                          className={`flex-1 py-1 font-bold ${patientGender === 'M' ? 'bg-teal-600 text-white' : 'bg-slate-50'}`}
                        >
                          H
                        </button>
                        <button
                          type="button"
                          onClick={() => setPatientGender('F')}
                          className={`flex-1 py-1 font-bold ${patientGender === 'F' ? 'bg-teal-600 text-white' : 'bg-slate-50'}`}
                        >
                          F
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Poids (kg)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 70"
                        value={patientWeight || ''}
                        onChange={e => setPatientWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        NSS / Chifa
                      </label>
                      <input
                        type="text"
                        placeholder="Carte Chifa"
                        value={patientNss}
                        onChange={e => setPatientNss(e.target.value)}
                        className="w-full font-mono text-[11px] p-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        placeholder="0550..."
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Type d'Ordo
                      </label>
                      <select
                        value={prescriptionType}
                        onChange={e => setPrescriptionType(e.target.value as PrescriptionType)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-teal-800"
                      >
                        <option value="aigue">Aiguë (Ordinaire)</option>
                        <option value="chronique">Chronique (3 mois Chifa)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* B. FAVORIS (⭐) & DISPOSITIFS DE DIAGNOSTIC 1-CLIC */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Favoris (⭐) & Outils de Diagnostic (1-Clic) :</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {favoriteMedicines.slice(0, 10).map(med => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleAddMedicine(med)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-amber-100 hover:text-amber-950 border border-slate-200 transition-all flex items-center space-x-1"
                      >
                        <span>{med.tradeName}</span>
                        <span className="text-[10px] text-slate-400">({med.dosage})</span>
                      </button>
                    ))}

                    {/* Dispositifs médicaux rapides */}
                    {diagnosticDevices.slice(0, 3).map(dev => (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => handleAddMedicine(dev)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 transition-all flex items-center space-x-1"
                      >
                        <Activity className="w-3 h-3 text-purple-600" />
                        <span>{dev.tradeName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section C (Recherche Globale) supprimée pour être intégrée dans les lignes de prescription (Section D) afin de simuler la frappe directe */}

                {/* D. LISTE DES MÉDICAMENTS PRESCRITS & AJOUT PAR AUTOCOMPLÉTION */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                     <span className="text-xs font-extrabold text-slate-900 uppercase flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Lignes de Prescription ({items.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Boîtes calculées automatiquement
                    </span>
                  </div>

                  {items.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      Aucun médicament. Commencez à taper ci-dessous ou sélectionnez un favori.
                    </div>
                  )}
                    items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-extrabold text-teal-800 text-xs">{index + 1}.</span>
                            <span className="font-extrabold text-slate-900 text-sm">{item.tradeName}</span>
                            <span className="font-semibold text-teal-700 text-xs">{item.dosage}</span>
                            <span className="text-[10px] text-slate-500">({item.form})</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Alternative autorisée */}
                        <div className="flex items-center space-x-2 pl-3">
                          <label className="text-[10px] font-bold text-blue-700 whitespace-nowrap">
                            Alternative :
                          </label>
                          <input
                            type="text"
                            placeholder="ou CLAMOXYL / ou autre médicament"
                            value={item.alternativeMedicine || ''}
                            onChange={e => handleUpdateItem(item.id, { alternativeMedicine: e.target.value })}
                            className="w-full text-xs p-1 bg-blue-50/40 border border-blue-200 rounded-md"
                          />
                        </div>

                        {/* Posologie & Boîtes */}
                        <div className="grid grid-cols-12 gap-2 pl-3">
                          <div className="col-span-7">
                            <label className="block text-[9px] font-semibold text-slate-500">Posologie</label>
                            <input
                              type="text"
                              value={item.posology}
                              onChange={e => handleUpdateItem(item.id, { posology: e.target.value })}
                              className="w-full p-1 border border-slate-200 rounded-md text-xs"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[9px] font-semibold text-slate-500">Jours</label>
                            <input
                              type="number"
                              min="1"
                              value={item.durationDays}
                              onChange={e => {
                                const val = parseInt(e.target.value, 10) || 1;
                                handleUpdateItem(item.id, { durationDays: val, durationText: `Pendant ${val} jours` });
                              }}
                              className="w-full p-1 border border-slate-200 rounded-md text-xs font-bold"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[9px] font-semibold text-teal-800">Boîtes</label>
                            <input
                              type="number"
                              min="1"
                              value={item.calculatedBoxes}
                              onChange={e => handleUpdateItem(item.id, { calculatedBoxes: parseInt(e.target.value, 10) || 1 })}
                              className="w-full p-1 border border-teal-300 bg-teal-50 text-teal-950 font-extrabold rounded-md text-xs text-center"
                            />
                          </div>
                        </div>

                        {/* Consigne en Arabe */}
                        <div className="pl-3 pt-1 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-bold text-emerald-800">تعليمات للمريض بالعربية :</span>
                            <select
                              onChange={e => {
                                if (e.target.value) handleUpdateItem(item.id, { arabicInstructions: e.target.value });
                              }}
                              className="text-[9px] font-arabic border border-emerald-200 rounded bg-emerald-50 text-emerald-900 p-0.5"
                            >
                              <option value="">-- عبارات سريعة --</option>
                              {ARABIC_INSTRUCTION_PRESETS.map(p => (
                                <option key={p.id} value={p.text}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="قرص واحد صباحاً ومساءً وسط الأكل"
                            value={item.arabicInstructions || ''}
                            onChange={e => handleUpdateItem(item.id, { arabicInstructions: e.target.value })}
                            className="w-full font-arabic text-xs p-1 bg-emerald-50/40 border border-emerald-200 rounded-md font-semibold text-slate-800"
                          />
                        </div>
                        </div>
                      </div>
                    ))}
                    
                  {/* LIGNE D'AJOUT AUTOCOMPLÉTION (Simule la frappe directe) */}
                  <div className="pt-2 border-t-2 border-dashed border-teal-100 mt-2 relative">
                    <div className="flex items-center">
                      <span className="font-extrabold text-teal-600 text-xs w-6">{items.length + 1}.</span>
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un médicament à ajouter..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 bg-teal-50/30 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {searchQuery.trim().length > 0 && (
                      <div className="absolute z-10 w-full left-0 ml-6 max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl mt-1 bg-white shadow-xl">
                        {filteredMedicines.length === 0 ? (
                           <div className="p-3 text-center text-xs text-slate-500">
                             Aucun médicament trouvé.
                           </div>
                        ) : (
                          filteredMedicines.map(med => (
                            <div
                              key={med.id}
                              onClick={() => handleAddMedicine(med)}
                              className="p-2.5 hover:bg-teal-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{med.tradeName}</span>{' '}
                                <span className="text-teal-700 font-semibold text-[11px]">{med.dosage}</span>{' '}
                                <span className="text-slate-400 text-[10px]">({med.laboratory})</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">{med.dci}</div>
                              </div>
                              <button className="text-teal-700 bg-teal-100 hover:bg-teal-200 px-2 py-1 rounded text-[10px] font-bold">
                                + Ajouter
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Conseils hygiéno-diététiques (ex: bien s'hydrater, repos au lit...)"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PANNEAU DE DROITE : APERÇU HAUTE FIDÉLITÉ (AVEC CONTRÔLE DE ZOOM & ADAPTATION LARGEUR) */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
                <div className="sticky top-20 space-y-2">
                  {/* CONTRÔLES DE ZOOM ET AJUSTEMENT */}
                  <div className="no-print bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center space-x-1.5">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Aperçu Réel A4</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.1))}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                        title="Zoom -"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <span className="font-mono font-bold text-slate-700 text-xs w-12 text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>

                      <button
                        type="button"
                        onClick={() => setZoomScale(prev => Math.min(1.3, prev + 0.1))}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                        title="Zoom +"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setZoomScale(viewMode === 'split' ? 0.72 : 1.0)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700"
                        title="Ajuster à la largeur de l'écran"
                      >
                        Ajuster
                      </button>
                    </div>
                  </div>

                  {/* CONTENEUR DE FEUILLE AVEC DÉFILEMENT FLUIDE */}
                  <div className="border border-slate-300 rounded-2xl overflow-x-auto overflow-y-auto shadow-sm bg-slate-100/90 p-3 max-h-[80vh] flex justify-center">
                    <PrintablePrescription
                      doctor={doctorProfile}
                      patient={currentPatientSnapshot}
                      items={items}
                      type={prescriptionType}
                      dateStr={formatPrescriptionDate(prescriptionDate)}
                      notes={notes}
                      pageSize={doctorProfile.pageSize}
                      scale={zoomScale}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
