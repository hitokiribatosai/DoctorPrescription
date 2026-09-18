import { Medicine } from '../types';

export interface CalculationResult {
  dailyDose: number;
  durationDays: number;
  totalUnitsNeeded: number;
  calculatedBoxes: number;
  displayText: string;
}

/**
 * Calcule le nombre exact de boîtes nécessaires en fonction de la posologie journalière,
 * de la durée prescrite et du conditionnement du médicament.
 */
export function calculateBoxes(
  medicine: Medicine,
  dailyDose: number,
  durationDays: number
): CalculationResult {
  // Pour les dispositifs médicaux unitaires (ex: thermomètre, tensiomètre, kit lecteur)
  if (medicine.isDevice && medicine.unitsPerBox === 1) {
    const qty = Math.max(1, Math.round(dailyDose || 1));
    return {
      dailyDose: qty,
      durationDays: durationDays || 1,
      totalUnitsNeeded: qty,
      calculatedBoxes: qty,
      displayText: `${qty} ${medicine.unitLabel || 'unité(s)'}`,
    };
  }

  // Pour les bandelettes ou consommables (ex: 50 bandelettes)
  const safeDailyDose = Math.max(0.25, dailyDose || 1);
  const safeDuration = Math.max(1, durationDays || 1);
  const totalUnitsNeeded = Math.ceil(safeDailyDose * safeDuration);
  const unitsPerBox = medicine.unitsPerBox > 0 ? medicine.unitsPerBox : 1;
  
  const calculatedBoxes = Math.ceil(totalUnitsNeeded / unitsPerBox);

  let qspText = '';
  if (safeDuration >= 80 && safeDuration <= 100) {
    qspText = 'QSP 3 mois (Chifa)';
  } else if (safeDuration >= 28 && safeDuration <= 35) {
    qspText = 'QSP 1 mois';
  } else {
    qspText = `QSP ${safeDuration} jours`;
  }

  const boxLabel = calculatedBoxes > 1 ? 'boîtes' : 'boîte';
  const displayText = `${calculatedBoxes} ${boxLabel} (${unitsPerBox} ${medicine.unitLabel}/bte) — ${qspText}`;

  return {
    dailyDose: safeDailyDose,
    durationDays: safeDuration,
    totalUnitsNeeded,
    calculatedBoxes,
    displayText,
  };
}

/**
 * Formate la date au standard français / algérien
 */
export function formatPrescriptionDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${months[monthIdx]} ${year}`;
}
