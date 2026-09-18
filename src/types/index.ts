// Types pour l'application OrdoMed Algérie

export interface Medicine {
  id: string;
  tradeName: string;            // Ex: "DOLIPRANE", "AMOXYPEN", "MOPRAL"
  dci: string;                  // Ex: "Paracétamol", "Amoxicilline", "Oméprazole"
  form: string;                 // Ex: "Comprimé", "Gélule", "Sirop", "Sachet", "Ampoule"
  dosage: string;               // Ex: "1000 mg", "500 mg", "20 mg"
  unitsPerBox: number;          // Nombre d'unités par boîte (ex: 20, 24, 30, 8, 1)
  unitLabel: string;            // "comprimés", "gélules", "sachets", "flacon", "unité"
  defaultPosology: string;      // Ex: "1 comprimé 3 fois par jour après les repas"
  defaultArabicInstructions?: string; // Ex: "قرص واحد 3 مرات في اليوم بعد الأكل"
  category: string;             // Ex: "Antalgiques", "Antibiotiques", "Cardiologie", "Dispositifs & Diagnostic"
  laboratory: string;           // Ex: "Saidal", "Biopharm", "Merinal", "Inpha-Médis", "Sanofi", etc.
  isReimbursable: boolean;      // Remboursable CNAS / CASNOS (Carte Chifa)
  isDevice?: boolean;           // Dispositif médical / Outil de diagnostic clinique (ex: thermomètre, test grossesse)
  isFavorite: boolean;          // Favori pour accès rapide en 1-clic ⭐
  notes?: string;               // Précautions particulières
}

export interface Patient {
  id: string;
  firstName: string;            // Prénom
  lastName: string;             // Nom
  birthDate?: string;           // Date de naissance (YYYY-MM-DD)
  age: number;                  // Âge calculé ou saisi
  gender: 'M' | 'F';            // Sexe
  weight?: number;              // Poids en kg (essentiel en pédiatrie)
  phone?: string;               // N° de téléphone
  nss?: string;                 // N° de Sécurité Sociale (Carte Chifa)
  address?: string;             // Adresse du patient
  allergies?: string[];         // Ex: ["Pénicilline", "AINS"]
  chronicConditions?: string[]; // Ex: ["HTA", "Diabète Type 2", "Asthme"]
  createdAt: string;            // Date d'enregistrement
  lastVisit: string;            // Date de dernière consultation
  totalPrescriptions?: number;  // Nombre d'ordonnances délivrées
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  tradeName: string;
  dci: string;
  form: string;
  dosage: string;
  unitsPerBox: number;
  unitLabel: string;
  isDevice?: boolean;
  
  // Posologie & Durée
  posology: string;             // Ex: "1 comprimé matin et soir"
  dailyDose: number;            // Quantité prise par jour (pour le calcul de boîtes)
  durationDays: number;         // Durée en jours (ex: 7, 15, 30, 90)
  durationText?: string;        // Ex: "Pendant 10 jours", "Pendant 1 mois"
  
  // Calculateur de boîtes
  totalUnitsNeeded: number;     // Ex: 20
  calculatedBoxes: number;      // Ex: 2 boîtes
  
  // Nouveautés Algérie
  arabicInstructions?: string;  // Ex: "قرص واحد صباحاً ومساءً وسط الأكل"
  alternativeMedicine?: string; // Ex: "ou CLAMOXYL 500mg" / "ou équivalent générique"
  nonSubstitutable?: boolean;   // Mention Non Substituable
  nsReason?: string;            // MTE, EFG, CPG
  isChronicChifa?: boolean;     // Mention QSP 3 mois (Chifa)
}

export type PrescriptionType = 'aigue' | 'chronique';

export interface Prescription {
  id: string;
  reference: string;            // Ex: "ORD-2026-09-0012"
  patientId: string;
  patientSnapshot: Patient;     // Copie de l'état du patient au moment de l'ordonnance
  items: PrescriptionItem[];
  type: PrescriptionType;       // Aiguë ou Chronique (Chifa)
  date: string;                 // Date de l'ordonnance (format YYYY-MM-DD)
  dateFormatted?: string;       // Format lisible "16 Septembre 2026"
  notes?: string;               // Recommandations hygiéno-diététiques
  savedAt: string;              // Horodatage de sauvegarde
  printCount: number;           // Nombre d'impressions
}

export interface DoctorProfile {
  fullNameFr: string;           // Ex: "Dr. Amina BENALI"
  fullNameAr: string;           // Ex: "د. أمينة بن علي"
  titleFr: string;              // Ex: "Spécialiste en Médecine Générale"
  titleAr: string;              // Ex: "أخصائية في الطب العام"
  specialtyFr: string;          // Ex: "Médecine Générale & Suivi des Maladies Chroniques"
  specialtyAr: string;          // Ex: "طب عام ومتابعة الأمراض المزمنة"
  qualificationsFr: string;     // Ex: "Ancienne interne des Hôpitaux d'Alger"
  qualificationsAr: string;     // Ex: "طبيبة داخلية سابقة بمستشفيات الجزائر"
  
  // Identifiants réglementaires Algérie
  orderNumber: string;          // N° d'Ordre des Médecins (CROM)
  agreementNumber: string;      // N° d'Agrément / Décision d'installation (MSPRH)
  cnasCode: string;             // N° de Convention CNAS / CASNOS (Chifa)
  
  // Pied de page (Coordonnées du cabinet en bas de l'ordonnance)
  cabinetAddressFr: string;     // Ex: "14, Rue Didouche Mourad, Alger Centre"
  cabinetAddressAr: string;     // Ex: "14، شارع ديدوش مراد، الجزائر الوسطى"
  phoneFixe: string;            // Ex: "021 63 XX XX"
  phoneMobile: string;          // Ex: "0550 XX XX XX / 0770 XX XX XX"
  phoneEmergency?: string;      // Ex: "Urgences : 0661 XX XX XX"
  consultationHoursFr: string;  // Ex: "Samedi au Mercredi : 8h30 - 16h30 | Jeudi : 8h30 - 13h00"
  consultationHoursAr: string;  // Ex: "السبت إلى الأربعاء: 8:30 - 16:30 | الخميس: 8:30 - 13:00"
  
  // Tampon & Cachet
  stampType: 'generated' | 'uploaded';
  stampInkColor: 'blue' | 'black' | 'purple';
  stampShape: 'rectangular' | 'oval';
  stampImageUrl?: string;       // Data URL ou chemin de l'image du cachet scanné
  signatureImageUrl?: string;   // Image de signature
  
  // Options d'impression
  printWithHeader: boolean;     // true = papier blanc avec en-tête / false = papier pré-imprimé
  printWithFooter: boolean;     // true = imprimer le pied de page
  pageSize: 'A4' | 'A5';        // Format A4 ou A5 (très courant en Algérie)
}

export interface MedicalCertificate {
  id: string;
  reference: string;
  patientId: string;
  patientSnapshot: Patient;
  type: 'bonne_sante' | 'arret_travail' | 'reprise_travail' | 'prenuptial' | 'aptitude_sport';
  daysOff?: number;
  startDate?: string;
  endDate?: string;
  sportName?: string;
  notes?: string;
  date: string;
  savedAt: string;
}

export interface LabTestItem {
  id: string;
  name: string;
  category: string;
  isChecked: boolean;
}

export interface LabTestRequest {
  id: string;
  reference: string;
  patientId: string;
  patientSnapshot: Patient;
  tests: string[];
  clinicalContext?: string;
  urgent: boolean;
  date: string;
  savedAt: string;
}
