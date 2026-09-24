import React, { useState } from 'react';
import { DoctorProfile, Patient } from '../types';
import { formatPrescriptionDate } from '../services/boxCalculator';
import { 
  Award, 
  Printer, 
  CheckSquare, 
  Square,
} from 'lucide-react';

interface MedicalCertificatesViewProps {
  doctorProfile: DoctorProfile;
  patients: Patient[];
}

export const MedicalCertificatesView: React.FC<MedicalCertificatesViewProps> = ({
  doctorProfile,
  patients,
}) => {
  const [docMode, setDocMode] = useState<'certificat' | 'bilan'>('certificat');

  // Patient sélectionné
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients.length > 0 ? patients[0].id : ''
  );
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // État Certificat
  const [certType, setCertType] = useState<'bonne_sante' | 'arret_travail' | 'reprise_travail' | 'prenuptial'>(
    'arret_travail'
  );
  const [daysOff, setDaysOff] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [customCertNotes, setCustomCertNotes] = useState<string>('');

  // État Bilan Biologique
  const [selectedTests, setSelectedTests] = useState<string[]>([
    'FNS (Formule Numération Sanguine)',
    'Glycémie à jeun',
    'Créatinine sanguine',
    'Bilan Lipidique complet (Cholestérol, Triglycérides, HDL, LDL)',
  ]);
  const [clinicalContext, setClinicalContext] = useState<string>(
    'Bilan de contrôle systématique / suivi annuel'
  );

  const LAB_TEST_GROUPS = [
    {
      name: 'Hématologie & Inflammation',
      tests: [
        'FNS (Formule Numération Sanguine)',
        'Vitesse de Sédimentation (VS)',
        'CRP (Protéine C-Réactive)',
        'TP / INR',
      ],
    },
    {
      name: 'Biochimie & Métabolisme',
      tests: [
        'Glycémie à jeun',
        'HbA1c (Hémoglobine glyquée)',
        'Urée sanguine',
        'Créatinine sanguine + Clairance',
        'Acide Urique',
      ],
    },
    {
      name: 'Bilan Lipidique',
      tests: [
        'Cholestérol Total',
        'Triglycérides',
        'HDL-Cholestérol',
        'LDL-Cholestérol',
        'Bilan Lipidique complet (Cholestérol, Triglycérides, HDL, LDL)',
      ],
    },
    {
      name: 'Bilan Hépatique & Thyroïdien',
      tests: [
        'Transaminases (ASAT, ALAT)',
        'Phosphatases Alcalines (PAL)',
        'Bilirubine (Totale et Directe)',
        'TSH ultrasensible',
        'FT4 libre',
      ],
    },
    {
      name: 'Urines & Sérologie',
      tests: [
        'ECBU (Examen Cytobactériologique des Urines)',
        'Microalbuminurie des 24h',
        'Sérologie COVID / CRP',
        'Bilan Prénuptial Réglementaire',
      ],
    },
  ];

  const toggleTest = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Barre supérieure */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Certificats Médicaux & Demandes d'Analyses
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Émission instantanée de documents cliniques conformes pour vos patients.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-0.5">
            <button
              onClick={() => setDocMode('certificat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                docMode === 'certificat' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Certificat Médical
            </button>
            <button
              onClick={() => setDocMode('bilan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                docMode === 'bilan' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Demande de Bilan / Analyses
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-md shadow-indigo-700/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Document</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE : OPTIONS DE RÉDACTION */}
        <div className="no-print lg:col-span-5 space-y-4">
          {/* Sélection du patient */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Patient Concerné :
            </label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.lastName} {p.firstName} ({p.age} ans)
                </option>
              ))}
            </select>
          </div>

          {docMode === 'certificat' ? (
            /* OPTIONS DU CERTIFICAT */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Type de Certificat :
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'arret_travail', label: 'Certificat d\'Arrêt de Travail / Repos Médical' },
                    { id: 'bonne_sante', label: 'Certificat de Bonne Santé / Aptitude Physique' },
                    { id: 'reprise_travail', label: 'Certificat de Reprise de Travail' },
                    { id: 'prenuptial', label: 'Certificat Médical Prénuptial' },
                  ].map(t => (
                    <label
                      key={t.id}
                      className={`flex items-center space-x-2 p-2 rounded-xl border cursor-pointer ${
                        certType === t.id
                          ? 'bg-indigo-50/70 border-indigo-300 font-bold text-indigo-950'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="certType"
                        checked={certType === t.id}
                        onChange={() => setCertType(t.id as any)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {certType === 'arret_travail' && (
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Nombre de jours de repos :
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={daysOff}
                        onChange={e => setDaysOff(parseInt(e.target.value, 10) || 1)}
                        className="w-full font-bold p-1.5 border border-indigo-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        À compter du :
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full font-semibold p-1.5 border border-indigo-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mentions complémentaires (Optionnelles) :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sauf complications ultérieures. Pour servir et valoir ce que de droit."
                  value={customCertNotes}
                  onChange={e => setCustomCertNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* OPTIONS DU BILAN D'ANALYSES */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Renseignement Clinique / Contexte :
                </label>
                <input
                  type="text"
                  value={clinicalContext}
                  onChange={e => setClinicalContext(e.target.value)}
                  placeholder="Ex: Bilan pré-opératoire, suivi diabétique..."
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {LAB_TEST_GROUPS.map((group, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block text-[11px] mb-1.5">
                      {group.name}
                    </span>
                    <div className="space-y-1">
                      {group.tests.map(test => {
                        const isChecked = selectedTests.includes(test);
                        return (
                          <div
                            key={test}
                            onClick={() => toggleTest(test)}
                            className="flex items-center space-x-2 cursor-pointer py-0.5 hover:text-indigo-700"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                            <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>
                              {test}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : APERÇU HAUTE FIDÉLITÉ (IMPRESSION) */}
        <div className="lg:col-span-7">
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-md bg-slate-200/50 p-3 max-h-[85vh] overflow-y-auto">
            <div
              id="printable-certificate-document"
              className="prescription-sheet a4 bg-white text-slate-900 mx-auto flex flex-col justify-between"
              style={{ minHeight: '270mm', padding: '16mm 20mm' }}
            >
              {/* EN-TÊTE MÉDICAL BILINGUE */}
              <header className="border-b-2 border-teal-800 pb-3 mb-6">
                <div className="flex justify-between items-start">
                  <div className="w-[48%] text-left">
                    <h1 className="text-xl font-extrabold text-teal-900 tracking-tight leading-tight">
                      {doctorProfile.fullNameFr}
                    </h1>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {doctorProfile.titleFr}
                    </p>
                    <p className="text-[11px] text-teal-700 font-medium">
                      {doctorProfile.specialtyFr}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-600 font-mono">
                      N° Ordre : {doctorProfile.orderNumber} • Agrément : {doctorProfile.agreementNumber}
                    </div>
                  </div>

                  <div className="w-[48%] text-right font-arabic" dir="rtl">
                    <h1 className="text-2xl font-extrabold text-teal-900 leading-tight">
                      {doctorProfile.fullNameAr}
                    </h1>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {doctorProfile.titleAr}
                    </p>
                    <p className="text-xs text-teal-800 font-medium">
                      {doctorProfile.specialtyAr}
                    </p>
                  </div>
                </div>
              </header>

              {/* DATE & VILLE */}
              <div className="flex justify-between items-center text-xs mb-8">
                <div>
                  <span className="font-bold text-slate-700 uppercase">Document Médical Officiel</span>
                </div>
                <div className="font-semibold text-slate-800">
                  Alger, le : <span className="font-bold">{formatPrescriptionDate(new Date().toISOString().split('T')[0])}</span>
                </div>
              </div>

              {/* CORPS DU DOCUMENT */}
              <div className="flex-1 my-4">
                {docMode === 'certificat' ? (
                  /* RENDU CERTIFICAT */
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-wider uppercase border-b-2 border-slate-900 inline-block pb-1">
                        {certType === 'arret_travail'
                          ? 'CERTIFICAT D\'ARRÊT DE TRAVAIL'
                          : certType === 'bonne_sante'
                          ? 'CERTIFICAT MÉDICAL DE BONNE SANTÉ'
                          : certType === 'reprise_travail'
                          ? 'CERTIFICAT DE REPRISE DE TRAVAIL'
                          : 'CERTIFICAT MÉDICAL PRÉNUPTIAL'}
                      </h2>
                    </div>

                    <div className="text-sm text-slate-800 leading-relaxed space-y-4 pt-4">
                      <p>
                        Je soussigné, <span className="font-bold">{doctorProfile.fullNameFr}</span>, certifie avoir examiné ce jour le/la patient(e) :
                      </p>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold space-y-1">
                        <p>Nom et Prénom : <span className="font-bold text-base uppercase text-teal-950">{currentPatient?.lastName} {currentPatient?.firstName}</span></p>
                        <p>Âge : <span className="font-normal">{currentPatient?.age} ans</span> — Sexe : <span className="font-normal">{currentPatient?.gender === 'M' ? 'Masculin' : 'Féminin'}</span></p>
                        {currentPatient?.nss && <p>N° Sécurité Sociale (NSS) : <span className="font-mono text-slate-700">{currentPatient?.nss}</span></p>}
                      </div>

                      {certType === 'arret_travail' && (
                        <p className="pt-2">
                          Et certifie que son état de santé nécessite un <span className="font-bold underline">repos médical de {daysOff} jour(s)</span>, à compter du <span className="font-bold">{formatPrescriptionDate(startDate)}</span>, sauf complications.
                        </p>
                      )}

                      {certType === 'bonne_sante' && (
                        <p className="pt-2">
                          Et certifie qu'à ce jour, l'examen clinique ne révèle aucune anomalie physique ou contre-indication apparente à la pratique des activités courantes ou sportives.
                        </p>
                      )}

                      {certType === 'reprise_travail' && (
                        <p className="pt-2">
                          Et certifie qu'après examen, l'état de santé du patient lui permet de reprendre son activité professionnelle normale à compter de ce jour.
                        </p>
                      )}

                      {certType === 'prenuptial' && (
                        <p className="pt-2">
                          Et certifie avoir procédé à l'examen médical prénuptial prévu par la réglementation en vigueur, et avoir informé l'intéressé(e) des résultats des examens cliniques et sérologiques.
                        </p>
                      )}

                      <p className="italic text-xs text-slate-500 pt-4">
                        Certificat délivré à l'intéressé(e) en mains propres pour servir et valoir ce que de droit.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* RENDU BILAN D'ANALYSES */
                  <div className="space-y-5">
                    <div className="text-center">
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-wider uppercase border-b-2 border-slate-900 inline-block pb-1">
                        DEMANDE D'ANALYSES BIOLOGIQUES
                      </h2>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        Patient : <span className="font-bold text-sm uppercase text-teal-950">{currentPatient?.lastName} {currentPatient?.firstName}</span> ({currentPatient?.age} ans)
                      </div>
                      {clinicalContext && (
                        <div className="text-slate-600 italic">
                          Indication : {clinicalContext}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-800 mb-3">
                        Prière de réaliser au laboratoire les examens suivants :
                      </p>

                      <div className="space-y-2.5 pl-4">
                        {selectedTests.map((t, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm text-slate-900">
                            <span className="w-2 h-2 rounded-full bg-indigo-700"></span>
                            <span className="font-semibold">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CACHET & GRIFFE */}
              <div className="flex justify-end my-6 pr-6">
                <div className="text-center min-w-[200px]">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                    Signature & Griffe du Médecin
                  </div>
                  <div
                    className={`medical-stamp-box ${
                      doctorProfile.stampShape === 'oval' ? 'oval' : ''
                    } ${
                      doctorProfile.stampInkColor === 'black'
                        ? 'black-ink'
                        : doctorProfile.stampInkColor === 'purple'
                        ? 'purple-ink'
                        : ''
                    }`}
                  >
                    <div className="text-[9px] font-bold uppercase">
                      RÉPUBLIQUE ALGÉRIENNE
                    </div>
                    <div className="text-xs font-extrabold uppercase mt-0.5">
                      {doctorProfile.fullNameFr}
                    </div>
                    <div className="text-[10px] font-semibold font-arabic" dir="rtl">
                      {doctorProfile.fullNameAr}
                    </div>
                    <div className="text-[9px] mt-0.5 font-mono">
                      Agrément : {doctorProfile.agreementNumber}
                    </div>
                    <div className="text-[9px] font-mono">
                      N° Ordre : {doctorProfile.orderNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* PIED DE PAGE BILINGUE */}
              <footer className="border-t-2 border-teal-800 pt-2 mt-auto text-[10px] text-slate-600">
                <div className="flex justify-between items-center">
                  <div className="w-[48%] text-left">
                    <p className="font-semibold text-slate-900">📍 {doctorProfile.cabinetAddressFr}</p>
                    <p className="text-[9.5px]">📞 Tél : {doctorProfile.phoneFixe} | Mob : {doctorProfile.phoneMobile}</p>
                    <p className="text-[9px] text-teal-800">🕒 {doctorProfile.consultationHoursFr}</p>
                  </div>
                  <div className="w-[48%] text-right font-arabic" dir="rtl">
                    <p className="font-semibold text-slate-900">📍 {doctorProfile.cabinetAddressAr}</p>
                    {doctorProfile.phoneEmergency && <p className="text-[9.5px] text-red-700 font-bold">🚨 {doctorProfile.phoneEmergency}</p>}
                    <p className="text-[9.5px] text-teal-900">🕒 {doctorProfile.consultationHoursAr}</p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
