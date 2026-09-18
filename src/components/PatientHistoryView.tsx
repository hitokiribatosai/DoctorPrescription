import React, { useState, useMemo } from 'react';
import { Patient, Prescription, DoctorProfile } from '../types';
import { storageService } from '../services/storageService';
import { 
  Users, 
  Search, 
  Calendar, 
  FileText, 
  Repeat, 
  Printer, 
  Download, 
  Trash2, 
  AlertCircle, 
  Phone, 
  CreditCard, 
  Clock, 
  ChevronRight,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { PrintablePrescription } from './PrintablePrescription';

interface PatientHistoryViewProps {
  patients: Patient[];
  doctorProfile: DoctorProfile;
  onRefreshPatients: () => void;
  onRenewPrescription: (prescription: Prescription) => void;
  preselectedPatientId?: string;
}

export const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({
  patients,
  doctorProfile,
  onRefreshPatients,
  onRenewPrescription,
  preselectedPatientId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || (patients.length > 0 ? patients[0].id : '')
  );
  const [printingPrescription, setPrintingPrescription] = useState<Prescription | null>(null);

  // Recherche patient
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchName =
        p.lastName.toLowerCase().includes(q) ||
        p.firstName.toLowerCase().includes(q);
      const matchPhone = p.phone ? p.phone.includes(q) : false;
      const matchNss = p.nss ? p.nss.includes(q) : false;
      return matchName || matchPhone || matchNss;
    });
  }, [patients, searchQuery]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || (filteredPatients.length > 0 ? filteredPatients[0] : null);
  }, [patients, selectedPatientId, filteredPatients]);

  // Liste de toutes les ordonnances du patient sélectionné
  const patientPrescriptions = useMemo(() => {
    if (!activePatient) return [];
    return storageService.getPatientPrescriptions(activePatient.id);
  }, [activePatient]);

  // Télécharger le fichier patient individuel (.json)
  const handleExportPatientFile = (patient: Patient) => {
    storageService.exportPatientFile(patient);
  };

  // Réimprimer une ancienne ordonnance
  const handleReprint = (presc: Prescription) => {
    setPrintingPrescription(presc);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Supprimer une ordonnance de l'historique
  const handleDeletePrescription = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance de l\'historique ?')) {
      storageService.deletePrescription(id);
      onRefreshPatients();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* En-tête de section */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Dossier & Historique des Patients du Cabinet
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Toutes les ordonnances délivrées sont archivées automatiquement avec le nom du patient et peuvent être renouvelées en 1 clic.
          </p>
        </div>

        {activePatient && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExportPatientFile(activePatient)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Télécharger le fichier complet des ordonnances de ce patient (.json)"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exporter Dossier ({activePatient.lastName})</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE : LISTE DES PATIENTS AVEC RECHERCHE */}
        <div className="no-print lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, NSS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mb-2 font-semibold">
              <span>Patients ({filteredPatients.length})</span>
              <span>Dernière Visite</span>
            </div>

            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Aucun patient trouvé.
                </div>
              ) : (
                filteredPatients.map(patient => {
                  const isSelected = activePatient?.id === patient.id;
                  const prescs = storageService.getPatientPrescriptions(patient.id);

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 shadow-xs text-blue-950'
                          : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-xs uppercase tracking-tight">
                          {patient.lastName} {patient.firstName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {patient.lastVisit || patient.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                        <span>
                          {patient.age} ans • {patient.gender === 'M' ? 'Homme' : 'Femme'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {prescs.length} ordonnance(s)
                        </span>
                      </div>

                      {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {patient.chronicConditions.map((cond, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : DOSSIER DÉTAILLÉ & CHRONOLOGIE DES ANCIENNES ORDONNANCES */}
        <div className="lg:col-span-8 space-y-6">
          {activePatient ? (
            <>
              {/* 1. FICHE RÉCAPITULATIVE DU PATIENT */}
              <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-lg shadow-inner">
                      {activePatient.lastName.charAt(0)}{activePatient.firstName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 uppercase">
                        {activePatient.lastName} {activePatient.firstName}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {activePatient.age} ans • Sexe: {activePatient.gender === 'M' ? 'Masculin' : 'Féminin'}
                        {activePatient.weight ? ` • Poids: ${activePatient.weight} kg` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dossier Actif</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                      Téléphone
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{activePatient.phone || 'Non renseigné'}</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                      Carte Chifa / NSS
                    </span>
                    <span className="font-mono font-semibold text-slate-800 flex items-center space-x-1 text-[11px]">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span>{activePatient.nss || 'Non renseigné'}</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                      Première Visite
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{activePatient.createdAt}</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                      Total Ordonnances
                    </span>
                    <span className="font-bold text-blue-700 text-sm">
                      {patientPrescriptions.length} ordonnance(s)
                    </span>
                  </div>
                </div>

                {/* Allergies & Antécédents */}
                {activePatient.allergies && activePatient.allergies.length > 0 && (
                  <div className="mt-3 p-2.5 bg-red-50/70 border border-red-200 rounded-xl text-xs flex items-center space-x-2 text-red-900">
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="font-bold">Allergies Connues :</span>
                    <span>{activePatient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* 2. CHRONOLOGIE DES ANCIENNES ORDONNANCES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Historique des Ordonnances Prescrites ({patientPrescriptions.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Cliquez sur "Renouveler" pour recharger l'ordonnance complète dans l'éditeur
                  </span>
                </div>

                {patientPrescriptions.length === 0 ? (
                  <div className="no-print bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                    Aucune ordonnance n'a encore été enregistrée pour ce patient.
                  </div>
                ) : (
                  patientPrescriptions.map(presc => (
                    <div
                      key={presc.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                    >
                      {/* Ligne Titre Ordonnance */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {presc.reference}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {presc.dateFormatted || presc.date}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              presc.type === 'chronique'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {presc.type === 'chronique' ? 'Chronique Chifa (3 mois)' : 'Aiguë (Ordinaire)'}
                          </span>
                          {presc.printCount > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Imprimée {presc.printCount}x)
                            </span>
                          )}
                        </div>

                        {/* Actions : RENOUVELER / RÉIMPRIMER / SUPPRIMER */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onRenewPrescription(presc)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-all"
                            title="Réinjecter tous les médicaments et posologies dans l'éditeur d'ordonnance"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span>Renouveler cette Ordonnance</span>
                          </button>

                          <button
                            onClick={() => handleReprint(presc)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="Réimprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePrescription(presc.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Médicaments prescrits */}
                      <div className="space-y-2">
                        {presc.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs space-y-1"
                          >
                            <div className="flex items-baseline justify-between">
                              <div className="font-extrabold text-slate-900 flex items-center space-x-2">
                                <span>{idx + 1}. {item.tradeName}</span>
                                <span className="text-teal-700 text-[11px] font-semibold">{item.dosage}</span>
                                <span className="text-slate-400 font-normal text-[10px]">({item.form})</span>

                                {item.alternativeMedicine && (
                                  <span className="text-blue-700 text-[10px] font-semibold bg-blue-50 px-1 rounded border border-blue-200">
                                    / {item.alternativeMedicine}
                                  </span>
                                )}
                              </div>

                              <span className="font-bold text-teal-900 text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.calculatedBoxes} boîte(s)
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-700 pl-3">
                              👉 {item.posology} {item.durationText ? `(${item.durationText})` : ''}
                            </div>

                            {item.arabicInstructions && (
                              <div
                                className="text-[11px] font-semibold text-slate-800 font-arabic text-right pr-3"
                                dir="rtl"
                              >
                                💡 {item.arabicInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {presc.notes && (
                        <div className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-200/50">
                          <span className="font-semibold text-amber-900">Conseils : </span>
                          {presc.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              Sélectionnez un patient dans la colonne de gauche pour consulter son historique complet.
            </div>
          )}
        </div>
      </div>

      {/* Impression Invisible / Déclenchée lors du clic sur Réimprimer */}
      {printingPrescription && (
        <div className="hidden print:block print-only-container">
          <PrintablePrescription
            doctor={doctorProfile}
            patient={printingPrescription.patientSnapshot}
            items={printingPrescription.items}
            type={printingPrescription.type}
            dateStr={printingPrescription.dateFormatted || printingPrescription.date}
            notes={printingPrescription.notes}
            pageSize={doctorProfile.pageSize}
          />
        </div>
      )}
    </div>
  );
};
