import { Medicine, Patient, Prescription, DoctorProfile, PrescriptionItem, PrescriptionType } from '../types';
import { DEFAULT_MEDICINES, DEFAULT_DOCTOR_PROFILE, INITIAL_PATIENTS } from '../data/defaultData';
import { formatPrescriptionDate } from './boxCalculator';

const STORAGE_KEYS = {
  MEDICINES: 'ordomed_dz_medicines_v4',
  PATIENTS: 'ordomed_dz_patients_v2',
  PRESCRIPTIONS: 'ordomed_dz_prescriptions_history_v2',
  DOCTOR_PROFILE: 'ordomed_dz_doctor_profile_v2',
};

// Initialisation des ordonnances de test pour démonstration de l'historique
const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'ord-hist-1',
    reference: 'ORD-2026-09-0018',
    patientId: 'pat-1',
    patientSnapshot: INITIAL_PATIENTS[0],
    type: 'chronique',
    date: '2026-09-12',
    dateFormatted: '12 Septembre 2026',
    savedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    printCount: 1,
    notes: 'Régime pauvre en sucres rapides et en sel. Marche 30 min par jour.',
    items: [
      {
        id: 'item-1',
        medicineId: 'med-15',
        tradeName: 'GLUCOPHAGE / METFORMINE SAIDAL',
        dci: 'Metformine chlorhydrate',
        form: 'Comprimé pelliculé',
        dosage: '850 mg',
        unitsPerBox: 30,
        unitLabel: 'comprimés',
        posology: '1 comprimé 2 fois par jour à la fin des repas (Matin et Soir)',
        dailyDose: 2,
        durationDays: 90,
        totalUnitsNeeded: 180,
        calculatedBoxes: 6,
        arabicInstructions: 'قرص واحد في نهاية الفطور وقرص في نهاية العشاء لتفادي اضطرابات الهضم',
        alternativeMedicine: 'ou METFORMINE BIOPHARM 850mg',
        isChronicChifa: true,
      },
      {
        id: 'item-2',
        medicineId: 'med-13',
        tradeName: 'AMLOC / AMLODIPINE MERINAL',
        dci: 'Amlodipine',
        form: 'Comprimé',
        dosage: '5 mg',
        unitsPerBox: 30,
        unitLabel: 'comprimés',
        posology: '1 comprimé le matin au petit-déjeuner',
        dailyDose: 1,
        durationDays: 90,
        totalUnitsNeeded: 90,
        calculatedBoxes: 3,
        arabicInstructions: 'قرص واحد (01) صباحاً كل يوم بانتظام في نفس الوقت',
        alternativeMedicine: 'ou AMLODIPINE SAIDAL 5mg',
        isChronicChifa: true,
      },
      {
        id: 'item-3',
        medicineId: 'dev-5',
        tradeName: 'BANDELETTES RÉACTIVES POUR GLYCÉMIE',
        dci: 'Bandelettes de dosage de glucose sanguin',
        form: 'Flacon de bandelettes compatibles',
        dosage: 'Boîte de 50 bandelettes',
        unitsPerBox: 50,
        unitLabel: 'bandelettes / boîte',
        isDevice: true,
        posology: '1 mesure à jeun + 1 mesure 2h après repas (selon carnet)',
        dailyDose: 2,
        durationDays: 90,
        totalUnitsNeeded: 180,
        calculatedBoxes: 4,
        arabicInstructions: 'علبة شرائط قياس السكر (50 شريط): تستعمل مع جهاز قياس السكر الخاص بك',
        isChronicChifa: true,
      }
    ],
  },
  {
    id: 'ord-hist-2',
    reference: 'ORD-2026-09-0012',
    patientId: 'pat-3',
    patientSnapshot: INITIAL_PATIENTS[2],
    type: 'aigue',
    date: '2026-09-05',
    dateFormatted: '05 Septembre 2026',
    savedAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    printCount: 2,
    notes: 'Bien hydrater l\'enfant. Consulter si persistance de la fièvre au-delà de 48h.',
    items: [
      {
        id: 'item-4',
        medicineId: 'med-1',
        tradeName: 'PARACÉTAMOL SAIDAL',
        dci: 'Paracétamol',
        form: 'Comprimé',
        dosage: '500 mg',
        unitsPerBox: 20,
        unitLabel: 'comprimés',
        posology: '1/2 comprimé 3 fois par jour si fièvre > 38.5°C',
        dailyDose: 1.5,
        durationDays: 5,
        totalUnitsNeeded: 8,
        calculatedBoxes: 1,
        arabicInstructions: 'نصف قرص (1/2) 3 مرات في اليوم في حالة الحمى أو الألم',
        alternativeMedicine: 'ou DOLIPRANE 500mg sirop',
      },
      {
        id: 'item-5',
        medicineId: 'dev-1',
        tradeName: 'THERMOMÈTRE DIGITAL CLINIQUE',
        dci: 'Dispositif médical de mesure thermique',
        form: 'Appareil électronique avec embout étanche',
        dosage: 'Précision ±0.1°C',
        unitsPerBox: 1,
        unitLabel: 'appareil',
        isDevice: true,
        posology: 'Prise de température axillaire matin et soir',
        dailyDose: 1,
        durationDays: 1,
        totalUnitsNeeded: 1,
        calculatedBoxes: 1,
        arabicInstructions: 'محرار رقمي: قياس درجة الحرارة مرتين في اليوم صباحاً ومساءً وتسجيلها',
      }
    ],
  }
];

class StorageService {
  // --- MEDICINES ---
  getMedicines(): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (!data) {
        this.saveMedicines(DEFAULT_MEDICINES);
        return DEFAULT_MEDICINES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MEDICINES;
    }
  }

  saveMedicines(medicines: Medicine[]): void {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  }

  toggleFavorite(id: string): Medicine[] {
    const list = this.getMedicines();
    const updated = list.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m);
    this.saveMedicines(updated);
    return updated;
  }

  addMedicine(medicine: Omit<Medicine, 'id'>): Medicine {
    const list = this.getMedicines();
    const newMed: Medicine = {
      ...medicine,
      id: 'med-' + Date.now(),
    };
    const updated = [newMed, ...list];
    this.saveMedicines(updated);
    return newMed;
  }

  updateMedicine(medicine: Medicine): void {
    const list = this.getMedicines();
    const updated = list.map(m => m.id === medicine.id ? medicine : m);
    this.saveMedicines(updated);
  }

  deleteMedicine(id: string): void {
    const list = this.getMedicines();
    const updated = list.filter(m => m.id !== id);
    this.saveMedicines(updated);
  }

  // --- PATIENTS ---
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!data) {
        this.savePatients(INITIAL_PATIENTS);
        return INITIAL_PATIENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PATIENTS;
    }
  }

  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  upsertPatient(patientData: Partial<Patient> & { firstName: string; lastName: string }): Patient {
    const patients = this.getPatients();
    const today = new Date().toISOString().split('T')[0];

    // Vérifier si le patient existe déjà par id ou par Nom+Prénom
    const existingIdx = patients.findIndex(p => 
      (patientData.id && p.id === patientData.id) ||
      (p.lastName.trim().toLowerCase() === patientData.lastName.trim().toLowerCase() &&
       p.firstName.trim().toLowerCase() === patientData.firstName.trim().toLowerCase())
    );

    if (existingIdx >= 0) {
      const existing = patients[existingIdx];
      const updated: Patient = {
        ...existing,
        ...patientData,
        lastVisit: today,
        totalPrescriptions: (existing.totalPrescriptions || 0) + 1,
      };
      patients[existingIdx] = updated;
      this.savePatients(patients);
      return updated;
    } else {
      const newPatient: Patient = {
        id: patientData.id || 'pat-' + Date.now(),
        firstName: patientData.firstName.trim(),
        lastName: patientData.lastName.trim().toUpperCase(),
        age: patientData.age || 30,
        gender: patientData.gender || 'M',
        birthDate: patientData.birthDate || '',
        weight: patientData.weight,
        phone: patientData.phone || '',
        nss: patientData.nss || '',
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        address: patientData.address || '',
        createdAt: today,
        lastVisit: today,
        totalPrescriptions: 1,
      };
      patients.unshift(newPatient);
      this.savePatients(patients);
      return newPatient;
    }
  }

  // --- HISTORIQUE PATIENTS / ORDONNANCES ---
  getPrescriptions(): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      if (!data) {
        this.savePrescriptions(INITIAL_PRESCRIPTIONS);
        return INITIAL_PRESCRIPTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRESCRIPTIONS;
    }
  }

  savePrescriptions(prescriptions: Prescription[]): void {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  }

  getPatientPrescriptions(patientId: string): Prescription[] {
    const all = this.getPrescriptions();
    return all.filter(p => p.patientId === patientId || p.patientSnapshot.id === patientId);
  }

  /**
   * RÈGLE CRUCIALE : Sauvegarde obligatoire de l'ordonnance dans l'Historique Patients avant toute impression !
   */
  autoSavePrescriptionBeforePrint(
    patientInput: Partial<Patient> & { firstName: string; lastName: string },
    items: PrescriptionItem[],
    type: PrescriptionType,
    notes?: string,
    existingPrescriptionId?: string
  ): { prescription: Prescription; patient: Patient } {
    // 1. Sauvegarder ou mettre à jour le patient
    const savedPatient = this.upsertPatient(patientInput);

    // 2. Générer une référence unique
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const refYear = now.getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `ORD-${refYear}-${randomSuffix}`;

    const prescriptions = this.getPrescriptions();

    // 3. Créer ou mettre à jour l'ordonnance
    let savedPrescription: Prescription;

    if (existingPrescriptionId) {
      const existingIdx = prescriptions.findIndex(p => p.id === existingPrescriptionId);
      if (existingIdx >= 0) {
        const existing = prescriptions[existingIdx];
        savedPrescription = {
          ...existing,
          patientSnapshot: savedPatient,
          items,
          type,
          notes: notes || '',
          savedAt: new Date().toISOString(),
          printCount: existing.printCount + 1,
        };
        prescriptions[existingIdx] = savedPrescription;
      } else {
        savedPrescription = {
          id: existingPrescriptionId,
          reference,
          patientId: savedPatient.id,
          patientSnapshot: savedPatient,
          items,
          type,
          date: dateStr,
          dateFormatted: formatPrescriptionDate(dateStr),
          notes: notes || '',
          savedAt: new Date().toISOString(),
          printCount: 1,
        };
        prescriptions.unshift(savedPrescription);
      }
    } else {
      savedPrescription = {
        id: 'ord-' + Date.now(),
        reference,
        patientId: savedPatient.id,
        patientSnapshot: savedPatient,
        items,
        type,
        date: dateStr,
        dateFormatted: formatPrescriptionDate(dateStr),
        notes: notes || '',
        savedAt: new Date().toISOString(),
        printCount: 1,
      };
      prescriptions.unshift(savedPrescription);
    }

    this.savePrescriptions(prescriptions);

    return {
      prescription: savedPrescription,
      patient: savedPatient,
    };
  }

  deletePrescription(id: string): void {
    const all = this.getPrescriptions();
    const filtered = all.filter(p => p.id !== id);
    this.savePrescriptions(filtered);
  }

  // --- DOCTOR PROFILE ---
  getDoctorProfile(): DoctorProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_PROFILE);
      if (!data) {
        this.saveDoctorProfile(DEFAULT_DOCTOR_PROFILE);
        return DEFAULT_DOCTOR_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_DOCTOR_PROFILE;
    }
  }

  saveDoctorProfile(profile: DoctorProfile): void {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(profile));
  }

  // --- EXPORT FICHIER HISTORIQUE DU PATIENT (JSON) ---
  exportPatientFile(patient: Patient): void {
    const allPrescriptions = this.getPatientPrescriptions(patient.id);
    const exportData = {
      dossier: 'Historique_Patients_Cabinet',
      exportDate: new Date().toISOString(),
      patient,
      prescriptions: allPrescriptions,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = `${patient.lastName}_${patient.firstName}`.replace(/[^a-zA-Z0-9_]/g, '_');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Dossier_Patient_${safeName}_Historique.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  exportAllHistory(): void {
    const exportData = {
      cabinet: this.getDoctorProfile().fullNameFr,
      exportDate: new Date().toISOString(),
      totalPatients: this.getPatients().length,
      patients: this.getPatients(),
      prescriptions: this.getPrescriptions(),
      medicinesCatalog: this.getMedicines(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sauvegarde_Cabinet_Historique_Patients_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

export const storageService = new StorageService();
