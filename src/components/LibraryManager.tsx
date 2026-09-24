import React, { useState, useMemo } from 'react';
import { Medicine } from '../types';
import { storageService } from '../services/storageService';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Star, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Activity, 
} from 'lucide-react';
import { ARABIC_INSTRUCTION_PRESETS } from '../data/defaultData';

interface LibraryManagerProps {
  medicines: Medicine[];
  onRefreshMedicines: () => void;
  catalogLoaded: boolean;
}

const MEDICINES_PER_PAGE = 60;

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  medicines,
  onRefreshMedicines,
  catalogLoaded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const [tradeName, setTradeName] = useState('');
  const [dci, setDci] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('Comprimé');
  const [unitsPerBox, setUnitsPerBox] = useState<number>(30);
  const [unitLabel, setUnitLabel] = useState('comprimés');
  const [defaultPosology, setDefaultPosology] = useState('');
  const [defaultArabicInstructions, setDefaultArabicInstructions] = useState('');
  const [category, setCategory] = useState('Médecine Générale');
  const [laboratory, setLaboratory] = useState('Saidal');
  const [isReimbursable, setIsReimbursable] = useState(true);
  const [isDevice, setIsDevice] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        m.tradeName.toLowerCase().includes(q) ||
        m.dci.toLowerCase().includes(q) ||
        m.laboratory.toLowerCase().includes(q) ||
        m.form.toLowerCase().includes(q) ||
        m.dosage.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.packageDetails || '').toLowerCase().includes(q);
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchFav = !showOnlyFavorites || m.isFavorite;
      return matchSearch && matchCat && matchFav;
    }).sort((a, b) => a.tradeName.localeCompare(b.tradeName, 'fr'));
  }, [medicines, searchQuery, selectedCategory, showOnlyFavorites]);

  const pageCount = Math.max(1, Math.ceil(filteredMedicines.length / MEDICINES_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount - 1);
  const visibleMedicines = filteredMedicines.slice(
    safePage * MEDICINES_PER_PAGE,
    (safePage + 1) * MEDICINES_PER_PAGE
  );

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.toggleFavorite(id);
    onRefreshMedicines();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer "${name}" de votre bibliothèque ?`)) {
      storageService.deleteMedicine(id);
      onRefreshMedicines();
    }
  };

  const openAddModal = (asDevice: boolean = false) => {
    setEditingMedicine(null);
    setTradeName('');
    setDci(asDevice ? 'Dispositif médical' : '');
    setDosage(asDevice ? '1 unité' : '500 mg');
    setForm(asDevice ? 'Appareil' : 'Comprimé');
    setUnitsPerBox(asDevice ? 1 : 20);
    setUnitLabel(asDevice ? 'unité' : 'comprimés');
    setDefaultPosology(asDevice ? 'Utilisation selon protocole' : '1 comprimé 3 fois par jour');
    setDefaultArabicInstructions('');
    setCategory(asDevice ? 'Dispositifs & Diagnostic' : 'Médecine Générale');
    setLaboratory(asDevice ? 'Officine' : 'Saidal');
    setIsReimbursable(true);
    setIsDevice(asDevice);
    setIsFavorite(false);
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setTradeName(med.tradeName);
    setDci(med.dci);
    setDosage(med.dosage);
    setForm(med.form);
    setUnitsPerBox(med.unitsPerBox);
    setUnitLabel(med.unitLabel);
    setDefaultPosology(med.defaultPosology);
    setDefaultArabicInstructions(med.defaultArabicInstructions || '');
    setCategory(med.category);
    setLaboratory(med.laboratory);
    setIsReimbursable(med.isReimbursable);
    setIsDevice(med.isDevice || false);
    setIsFavorite(med.isFavorite);
    setNotes(med.notes || '');
    setShowModal(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) {
      alert('Veuillez renseigner le nom du médicament.');
      return;
    }

    const payload = {
      tradeName: tradeName.trim().toUpperCase(),
      dci: dci.trim(),
      dosage: dosage.trim(),
      form: form.trim(),
      unitsPerBox: Number(unitsPerBox) || 1,
      unitLabel: unitLabel.trim() || 'comprimés',
      defaultPosology: defaultPosology.trim(),
      defaultArabicInstructions: defaultArabicInstructions.trim(),
      category: category.trim(),
      laboratory: laboratory.trim(),
      isReimbursable,
      isDevice,
      isFavorite,
      notes: notes.trim(),
    };

    if (editingMedicine) {
      storageService.updateMedicine({ ...editingMedicine, ...payload });
    } else {
      storageService.addMedicine(payload);
    }

    setShowModal(false);
    onRefreshMedicines();
  };

  // Export / Import
  const handleExportLibrary = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(medicines, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Thesaurus_Medicaments_Cabinet_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          storageService.saveMedicines(imported);
          onRefreshMedicines();
          alert(`✅ ${imported.length} médicaments importés avec succès !`);
        } else {
          alert('Fichier JSON invalide.');
        }
      } catch {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* En-tête Bibliothèque */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Thésaurus Médicamenteux & Dispositifs du Praticien
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {catalogLoaded
              ? `${medicines.length.toLocaleString('fr-DZ')} spécialités, classées par catégorie thérapeutique, avec leurs formes, dosages et laboratoires.`
              : 'Chargement du catalogue algérien des médicaments…'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAddModal(false)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Médicament</span>
          </button>

          <button
            onClick={() => openAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Outil Diagnostic / DM</span>
          </button>

          <button
            onClick={handleExportLibrary}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Exporter la bibliothèque en JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Importer une bibliothèque JSON"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportLibrary} className="hidden" />
          </label>
        </div>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, DCI, laboratoire (Saidal, Biopharm, Merinal)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Bouton Filtre Favoris */}
          <button
            onClick={() => {
              setShowOnlyFavorites(!showOnlyFavorites);
              setCurrentPage(0);
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
              showOnlyFavorites
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Favoris Seuls ({medicines.filter(m => m.isFavorite).length})</span>
          </button>

          {/* Filtre Catégorie */}
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentPage(0);
            }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des Médicaments */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>
          {filteredMedicines.length === 0
            ? 'Aucun médicament trouvé'
            : `Affichage ${safePage * MEDICINES_PER_PAGE + 1}–${Math.min((safePage + 1) * MEDICINES_PER_PAGE, filteredMedicines.length)} sur ${filteredMedicines.length.toLocaleString('fr-DZ')}`}
        </span>
        <span>{categories.length} catégories thérapeutiques</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleMedicines.map(med => (
          <div
            key={med.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">
                      {med.tradeName}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {med.form} • <span className="font-medium text-slate-700">{med.dci}</span>
                  </div>
                </div>

                {/* Bouton Favori ⭐ */}
                <button
                  onClick={e => handleToggleFavorite(med.id, e)}
                  className="p-1 rounded-lg hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-colors"
                  title={med.isFavorite ? 'Retirer des favoris' : 'Marquer comme favori (1-clic)'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      med.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              </div>

              {/* Badges & Conditionnement */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  📦 {med.unitsPerBox} {med.unitLabel}/boîte
                </span>
                <span className="px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-800">
                  🏢 {med.laboratory}
                </span>
                {med.isReimbursable && (
                  <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Chifa Remboursable
                  </span>
                )}
                {!med.isReimbursable && med.reimbursementStatus === 'unknown' && (
                  <span className="px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Remboursement à vérifier
                  </span>
                )}
                {med.isDevice && (
                  <span className="px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Outil Diagnostic
                  </span>
                )}
              </div>

              {med.packageDetails && (
                <div className="text-[10px] text-slate-500 mt-1">
                  Présentation catalogue : {med.packageDetails}
                </div>
              )}

              {/* Posologie usuelle */}
              <div className="text-[11px] text-slate-600 mt-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">Posologie : </span>
                {med.defaultPosology || 'À préciser par le prescripteur'}
              </div>

              {/* Explication Arabe si présente */}
              {med.defaultArabicInstructions && (
                <div
                  className="text-[11px] text-emerald-900 font-arabic font-semibold mt-1.5 p-1.5 rounded bg-emerald-50/60 border border-emerald-100 text-right"
                  dir="rtl"
                >
                  💡 {med.defaultArabicInstructions}
                </div>
              )}
            </div>

            {/* Actions Édition / Suppression */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-medium">
                {med.category}
                {med.catalogSource && (
                  <span className="block">Source : {med.catalogSource} · {med.catalogVersion} · {med.registrationStatus}</span>
                )}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(med)}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(med.id, med.tradeName)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 py-5 text-xs">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-slate-600">Page {safePage + 1} / {pageCount}</span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(pageCount - 1, safePage + 1))}
            disabled={safePage >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {/* MODAL AJOUT / ÉDITION MÉDICAMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingMedicine ? `Modifier "${editingMedicine.tradeName}"` : 'Ajouter un Médicament / Dispositif'}
            </h3>

            <form onSubmit={handleSaveMedicine} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nom Commercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DOLIPRANE, AMOXYPEN"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                    className="w-full uppercase font-bold p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    DCI / Substance active
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Paracétamol"
                    value={dci}
                    onChange={e => setDci(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 500 mg, 1g"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Forme galénique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Comprimé, Gélule"
                    value={form}
                    onChange={e => setForm(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Laboratoire
                  </label>
                  <input
                    type="text"
                    placeholder="Saidal, Biopharm..."
                    value={laboratory}
                    onChange={e => setLaboratory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CONDITIONNEMENT EN BOÎTE (CRUCIAL) */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                <span className="block text-[11px] font-bold text-emerald-950">
                  📦 Conditionnement (Unités par Boîte) — Utilisé pour le calcul automatique :
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">
                      Nombre d'unités par boîte :
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={unitsPerBox}
                      onChange={e => setUnitsPerBox(parseInt(e.target.value, 10) || 1)}
                      className="w-full font-bold p-1.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">
                      Libellé de l'unité :
                    </label>
                    <input
                      type="text"
                      placeholder="comprimés, gélules, unité"
                      value={unitLabel}
                      onChange={e => setUnitLabel(e.target.value)}
                      className="w-full p-1.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Posologie Usuelle par Défaut
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1 comprimé 3 fois par jour après les repas"
                  value={defaultPosology}
                  onChange={e => setDefaultPosology(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Explication Arabe par Défaut */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Consigne en Arabe pour le Patient (Optionnelle) :
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) setDefaultArabicInstructions(e.target.value);
                    }}
                    className="text-[10px] font-arabic border border-slate-200 rounded p-0.5 bg-slate-50"
                  >
                    <option value="">-- Suggestions arabes --</option>
                    {ARABIC_INSTRUCTION_PRESETS.map(p => (
                      <option key={p.id} value={p.text}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="قرص واحد صباحاً ومساءً وسط الأكل"
                  value={defaultArabicInstructions}
                  onChange={e => setDefaultArabicInstructions(e.target.value)}
                  className="w-full font-arabic p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catégorie Thérapeutique
                  </label>
                  <input
                    type="text"
                    placeholder="Antalgiques, Antibiotiques, Cardio..."
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={e => setIsFavorite(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Ajouter aux Favoris (⭐)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isReimbursable}
                      onChange={e => setIsReimbursable(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Remboursable Chifa</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {editingMedicine ? 'Mettre à jour' : 'Enregistrer dans la bibliothèque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
