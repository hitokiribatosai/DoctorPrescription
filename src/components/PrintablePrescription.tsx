import React from 'react';
import { DoctorProfile, Patient, PrescriptionItem, PrescriptionType } from '../types';
import { Stethoscope } from 'lucide-react';

interface PrintablePrescriptionProps {
  doctor: DoctorProfile;
  patient: Partial<Patient> & { firstName: string; lastName: string; age?: number; weight?: number; nss?: string };
  items: PrescriptionItem[];
  type: PrescriptionType;
  dateStr: string;
  notes?: string;
  pageSize?: 'A4' | 'A5';
  scale?: number;
}

export const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({
  doctor,
  patient,
  items,
  type,
  dateStr,
  notes,
  pageSize = 'A4',
  scale = 1,
}) => {
  return (
    <div
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div
        id="printable-prescription-document"
        className={`prescription-sheet ${pageSize.toLowerCase()} bg-white text-slate-900 mx-auto flex flex-col justify-between`}
        style={{
          boxSizing: 'border-box',
          fontFamily: 'Inter, sans-serif',
        }}
      >
      {/* 1. EN-TÊTE SUPÉRIEUR BILINGUE (FR / AR) */}
      {doctor.printWithHeader && (
        <header className="border-b-2 border-teal-800 pb-3 mb-4">
          <div className="flex justify-between items-start">
            {/* Côté Gauche : Français */}
            <div className="w-[48%] text-left">
              <h1 className="text-lg sm:text-xl font-extrabold text-teal-900 tracking-tight leading-tight">
                {doctor.fullNameFr}
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {doctor.titleFr}
              </p>
              <p className="text-[11px] text-teal-700 font-medium">
                {doctor.specialtyFr}
              </p>
              {doctor.qualificationsFr && (
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  {doctor.qualificationsFr}
                </p>
              )}

              {/* Identifiants Légaux Algériens */}
              <div className="mt-2 text-[10px] space-y-0.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 inline-block w-full">
                {doctor.orderNumber && (
                  <div>
                    <span className="font-semibold text-slate-800">N° d'Ordre :</span> {doctor.orderNumber}
                  </div>
                )}
                {doctor.agreementNumber && (
                  <div>
                    <span className="font-semibold text-slate-800">N° Agrément :</span> {doctor.agreementNumber}
                  </div>
                )}
                {doctor.cnasCode && (
                  <div>
                    <span className="font-semibold text-teal-800">Code CNAS/Chifa :</span> {doctor.cnasCode}
                  </div>
                )}
              </div>
            </div>

            {/* Symbole Central : Caducée */}
            <div className="w-[4%] flex justify-center items-center pt-1 text-teal-700">
              <Stethoscope className="w-6 h-6 opacity-80" />
            </div>

            {/* Côté Droit : Arabe */}
            <div className="w-[48%] text-right font-arabic" dir="rtl">
              <h1 className="text-xl sm:text-2xl font-extrabold text-teal-900 leading-tight">
                {doctor.fullNameAr}
              </h1>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {doctor.titleAr}
              </p>
              <p className="text-xs text-teal-800 font-medium">
                {doctor.specialtyAr}
              </p>
              {doctor.qualificationsAr && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {doctor.qualificationsAr}
                </p>
              )}

              <div className="mt-2 text-[11px] space-y-0.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 inline-block w-full text-right">
                <div><span className="font-semibold text-slate-800">طبيب معتمد من طرف الدولة ومصالح الضمان الاجتماعي</span></div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 2. ZONE DATE & IDENTITÉ DU PATIENT */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-2 mb-3">
          <div>
            <span className="font-semibold text-slate-600 uppercase tracking-wide text-[11px]">
              Ordonnance Médicale
            </span>
            {type === 'chronique' && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px] border border-amber-300">
                AFFECTION CHRONIQUE (CARTE CHIFA - QSP 3 MOIS)
              </span>
            )}
          </div>
          <div className="font-semibold text-slate-800">
            Alger, le : <span className="font-bold text-teal-950">{dateStr}</span>
          </div>
        </div>

        {/* Coordonnées Patient */}
        <div className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100 flex flex-wrap justify-between items-center text-slate-800 text-[11px]">
          <div>
            <span className="text-slate-500 font-medium">Patient : </span>
            <span className="font-bold text-slate-950 text-sm uppercase">
              {patient.lastName} {patient.firstName}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {patient.age !== undefined && patient.age > 0 && (
              <div>
                <span className="text-slate-500 font-medium">Âge : </span>
                <span className="font-semibold text-slate-900">{patient.age} ans</span>
              </div>
            )}
            {patient.weight !== undefined && patient.weight > 0 && (
              <div>
                <span className="text-slate-500 font-medium">Poids : </span>
                <span className="font-semibold text-slate-900">{patient.weight} kg</span>
              </div>
            )}
            {patient.nss && (
              <div>
                <span className="text-slate-500 font-medium">N° Chifa/NSS : </span>
                <span className="font-semibold text-teal-900">{patient.nss}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. CORPS DE LA PRESCRIPTION (LISTE DES MÉDICAMENTS & DISPOSITIFS) */}
      <div className="flex-1 my-2">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic text-xs">
            Aucun médicament ou dispositif n'a encore été ajouté à cette ordonnance.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="pb-2.5 border-b border-slate-100 last:border-b-0 pl-1"
              >
                {/* Ligne 1 : Nom Commercial, Dosage, Forme + Alternative autorisée */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline flex-wrap gap-x-2">
                    <span className="font-extrabold text-teal-900 text-sm">
                      {index + 1}. {item.tradeName}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {item.dosage}
                    </span>
                    <span className="text-[11px] text-slate-500 italic">
                      ({item.form})
                    </span>

                    {/* Alternative Thérapeutique autorisée */}
                    {item.alternativeMedicine && (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        / ou {item.alternativeMedicine}
                      </span>
                    )}

                    {item.nonSubstitutable && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        NON SUBSTITUABLE ({item.nsReason || 'MTE'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Posologie en Français */}
                <div className="text-xs text-slate-800 font-medium mt-1 pl-4 flex items-center justify-between">
                  <span>
                    👉 {item.posology} {item.durationText ? `— ${item.durationText}` : ''}
                  </span>

                  {/* Nombre de boîtes calculé */}
                  <span className="text-[11px] font-bold text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.calculatedBoxes > 0
                      ? `${item.calculatedBoxes} ${item.calculatedBoxes > 1 ? 'boîtes' : 'boîte'}`
                      : '1 unité'}
                  </span>
                </div>

                {/* Ligne 3 : Instructions en Arabe (تعليمات بالعربية للمريض) */}
                {item.arabicInstructions && (
                  <div
                    className="text-xs font-semibold text-slate-800 font-arabic mt-1 pr-2 text-right bg-slate-50/70 p-1 rounded border-r-2 border-teal-600"
                    dir="rtl"
                  >
                    💡 {item.arabicInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recommandations / Conseils hygiéno-diététiques éventuels */}
        {notes && (
          <div className="mt-4 p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Conseils & Recommandations : </span>
            {notes}
          </div>
        )}
      </div>

      {/* 4. CACHET / GRIFFE DU MÉDECIN & SIGNATURE (BAS À DROITE) */}
      <div className="flex justify-end my-3 pr-4">
        <div className="text-center min-w-[200px]">
          <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
            Signature & Griffe du Médecin
          </div>

          {doctor.stampType === 'uploaded' && doctor.stampImageUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={doctor.stampImageUrl}
                alt="Griffe du Médecin"
                className="max-h-20 object-contain mix-blend-multiply"
              />
            </div>
          ) : (
            /* Cachet Officiel Médical Généré */
            <div
              className={`medical-stamp-box ${
                doctor.stampShape === 'oval' ? 'oval' : ''
              } ${
                doctor.stampInkColor === 'black'
                  ? 'black-ink'
                  : doctor.stampInkColor === 'purple'
                  ? 'purple-ink'
                  : ''
              }`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider">
                RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
              </div>
              <div className="text-xs font-extrabold uppercase mt-0.5 tracking-tight">
                {doctor.fullNameFr}
              </div>
              <div className="text-[10px] font-semibold font-arabic" dir="rtl">
                {doctor.fullNameAr}
              </div>
              <div className="text-[10px] font-semibold">
                {doctor.titleFr}
              </div>
              <div className="text-[9px] mt-0.5 font-mono">
                Agrément : {doctor.agreementNumber || '8492-2018'}
              </div>
              <div className="text-[9px] font-mono">
                N° Ordre : {doctor.orderNumber || 'CROM-16/4820'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. PIED DE PAGE : ADRESSE BILINGUE, TÉLÉPHONES & HORAIRES (EN BAS DE PAGE) */}
      {doctor.printWithFooter && (
        <footer className="border-t-2 border-teal-800 pt-2 mt-auto text-[10px] text-slate-600">
          <div className="flex justify-between items-center gap-2">
            {/* Adresse en Français */}
            <div className="w-[48%] text-left">
              <p className="font-semibold text-slate-900 leading-tight">
                📍 {doctor.cabinetAddressFr}
              </p>
              <p className="text-[9.5px] text-slate-600 mt-0.5">
                📞 Tél Fixe : <span className="font-bold text-slate-800">{doctor.phoneFixe}</span> | Mob : <span className="font-bold text-slate-800">{doctor.phoneMobile}</span>
              </p>
              <p className="text-[9px] text-teal-800 font-medium">
                🕒 {doctor.consultationHoursFr}
              </p>
            </div>

            <div className="w-[4%] flex justify-center text-slate-300">|</div>

            {/* Adresse en Arabe */}
            <div className="w-[48%] text-right font-arabic" dir="rtl">
              <p className="font-semibold text-slate-900 leading-tight">
                📍 {doctor.cabinetAddressAr}
              </p>
              {doctor.phoneEmergency && (
                <p className="text-[9.5px] text-red-700 font-bold mt-0.5">
                  🚨 {doctor.phoneEmergency}
                </p>
              )}
              <p className="text-[9.5px] text-teal-900 font-medium">
                🕒 {doctor.consultationHoursAr}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
    </div>
  );
};
