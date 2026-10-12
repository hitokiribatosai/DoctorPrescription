# OrdoMed project handover

## Verified state and how to use this file

Last repository review: **2026-10-12**, using the user's Africa/Algiers date context. Application baseline: **`779e1b0` on `main`** (`ui: move medicine search above favorites`). `git fetch origin --tags` succeeded; local `main` matched `origin/main`, and the working tree was clean before this documentation setup. This initial setup adds only `AGENTS.md` and this file; its documentation commit follows that application baseline.

Code, configuration, catalog counts, and Git history below were inspected locally. Prior conversation supplies user preferences and historical work. External catalog acquisition/matching and prior visual checks are **historical reports**, not fresh verification performed on this review date. The live Vercel website, deployment logs, clinical accuracy, and legal compliance have **not** been verified in this session.

Read `AGENTS.md` for session recovery, ongoing documentation rules, and the **"Prepare handover"** procedure. Verify this document against current source and Git state before making changes.

## Project overview

**OrdoMed Algérie** is a browser application for doctors/practitioners in Algerian medical practices. It supports preparing prescriptions, maintaining local patient/prescription history, browsing a large medicine library, generating certificates/lab requests, and configuring bilingual practitioner details and printable documents.

The user's goals have been reliable Vercel deployment, a larger categorized Algerian medicine catalog, and a clearer interface. They approved the redesigned interface and specifically requested the medicine-add search above favorites. They also requested a GitHub checkpoint to restore the pre-redesign interface if needed.

The package name is `ordo-med-desktop`, but the repository contains **no Electron/Tauri desktop wrapper, installer, native database, or desktop build scripts**. It is a React web application. French is the main UI language; Arabic appears in patient instructions and practitioner/document fields.

## Technology and configuration

| Area | Current implementation |
| --- | --- |
| Languages | TypeScript, TSX/JSX, CSS, JSON |
| UI/runtime | React and React DOM `^19.2.8`; hooks and component-local state |
| Build | Vite `^8.3.0`, `@vitejs/plugin-react` `^6.1.1`, TypeScript `~6.0.2` |
| Icons | `lucide-react` `^1.46.0` |
| Lint | Oxlint `^1.81.0`, configured in `.oxlintrc.json` |
| Styling | Tailwind runtime CDN/config in `index.html`; custom `src/index.css` |
| Fonts | Google Fonts: Inter, Outfit, Cairo, Amiri; loaded in HTML and CSS |
| Persistence | Browser `localStorage`; static bundled JSON catalog; no server database |
| Hosting | `vercel.json`: framework `vite`, build `npm run build`, output `dist` |
| Environment | Node **24.x** required by `package.json`; npm lockfile committed |

There are no application environment variables or API credentials required by the inspected code, no backend API layer, authentication, server routing, or cross-device data synchronization. Catalog sources were used to generate committed static data; the deployed app does not query Pharm'Net or TibDZ live. Tailwind and fonts are external runtime dependencies, so the UI is not fully self-contained/offline.

## Architecture and file map

```text
index.html                     HTML entry, title/favicon, Tailwind CDN, font links
src/main.tsx                   React StrictMode mount; imports index.css
src/App.tsx                    Tab selection and shared doctor/patient/medicine state
src/components/
  Navbar.tsx                   Desktop sidebar, compact mobile nav, full-data export
  PrescriptionEditor.tsx       Patient fields, medicine search, favorites, items, preview/save
  PrintablePrescription.tsx    Shared French/Arabic prescription sheet and stamp/footer
  PatientHistoryView.tsx       Patient search, prescription history, renew/reprint/delete/export
  LibraryManager.tsx           Medicine search/filter/pagination, favorites, CRUD/import/export
  MedicalCertificatesView.tsx  Certificate and lab-request controls and printable content
  SettingsManager.tsx          Doctor/cabinet fields, stamp upload/generation, print preferences
src/services/
  storageService.ts            All local persistence, catalog merge, history and JSON exports
  boxCalculator.ts             Package quantity calculations and French date formatting
src/types/index.ts             Medicine, Patient, PrescriptionItem/Prescription, DoctorProfile,
                               certificate/lab-request models (not all models are persisted)
src/data/
  defaultData.ts               78 curated medicines/devices, demo patients/doctor, Arabic presets
  algeriaMedicineCatalog/      24 JSON chunks containing 5,387 imported product records
  medicineCatalogLoader.ts    Dynamic imports of all catalog chunks using Promise.all
  medicineCatalogSources.md   Source/version and category-correction notes
src/index.css                  Global/sheet/print CSS and screen-only workspace redesign
src/App.css, src/assets/       Template leftovers; App.css is not imported by main.tsx
public/                        Favicon and static icon asset
vite.config.ts                 React Vite plugin
tsconfig*.json                 TypeScript settings; JSON imports enabled
package.json/package-lock.json Scripts, dependency ranges and resolved lockfile
vercel.json                    Static Vite deployment settings
README.md                      Still the original React/Vite template README
AGENTS.md                      Instructions for future sessions and handover procedure
PROJECT_HANDOVER.md            This project memory
```

`App` switches tabs with React state rather than a routing library. It initializes data from `storageService`, then asynchronously loads the imported catalog and refreshes medicines. Components call the storage service for mutations and notify `App` through callbacks where needed. The prescription editor manages a draft in component state and sends snapshots/items to the storage service before printing. `PrintablePrescription` is shared with history reprinting; certificates/lab sheets have separate markup.

### Persistence details

- Medicine overrides/custom entries: `ordomed_dz_medicines_v4`; deleted built-in IDs: `ordomed_dz_medicines_meta_v1`.
- Patients: `ordomed_dz_patients_v2`; prescription history: `ordomed_dz_prescriptions_history_v2`; practitioner profile: `ordomed_dz_doctor_profile_v2`.
- `getMedicines()` merges curated defaults, loaded catalog, saved overrides/custom entries, and deletion markers. `saveMedicines()` stores changes rather than serializing the entire catalog on each favorite edit.
- Empty/new storage seeds demo patients, demo prescription history, and a sample practitioner profile. These are demonstration records, not validated real patient/practitioner data.
- `autoSavePrescriptionBeforePrint()` upserts the patient and stores a prescription with a patient snapshot. Its optional existing-prescription ID supports updating, but the editor currently calls it without that ID.
- Full-data export contains patients, prescriptions, medicines, and the practitioner's name; it does **not** contain the entire practitioner profile. Library import is separate. No full-cabinet backup restore flow exists.
- Data belongs to a browser profile and origin. Clearing storage, switching domains/browsers, or changing account/session does not carry application data with the Git repository. Never copy actual patient records into handover documents.

## Completed features and historical fixes

- **Prescriptions:** existing/new patient entry, acute/chronic mode, medicine/DCI/lab search and category filter; search displays at most 50 matches. Favorites/devices add directly to a draft. Item editing covers posology, duration, box quantity, alternatives and Arabic instructions/presets; notes are supported.
- **Current editor order:** patient details → **Ajouter un médicament** search/category panel → favorites/devices → prescription lines. Favorites shortcuts show the first 10 favorites and first 3 diagnostic-device entries. The editor opens in split mode with preview zoom at 85%.
- **Saving/printing:** validates patient first/last name, nonempty items, and nonempty item posology; the application's Print action saves to history before calling browser printing. The Save action also writes history. This is not continuous draft autosave.
- **Documents:** French/Arabic prescription header/footer, identifiers, generated/uploaded stamp, acute/chronic notation, and A4/A5 sheet settings are implemented in source. Actual printer output needs separate validation.
- **Patient history:** search by name/phone/NSS, patient details, stored prescriptions, renewal, reprint, deletion, individual JSON export.
- **Library:** broad search, category/favorites filters, alphabetical sorting, 60 records/page, star toggle, custom medicine/device create/edit/delete, JSON library import/export, source/presentation/reimbursement metadata display.
- **Certificates/labs:** selectable work-leave, good-health, return-to-work and prenuptial certificates; grouped lab tests and clinical context; browser print. Their drafts are component-local and are not archived in storage.
- **Settings:** bilingual profile/contact details, generated stamp color/shape or image upload, header/footer and A4/A5 preferences.
- **Redesign:** sage/neutral palette, desktop sidebar and compact mobile navigation, clearer labels, larger form controls and responsive medicine-card grid. Workspace design overrides are inside `@media screen`; existing print rules remain separate.
- **Deployment/build work:** `1d4159b` added explicit Vercel config and Node 24 engine and fixed React hook conditionality/unused imports. Earlier commits fixed JSX expression wrapping and duplicate medicine-data parsing errors. Build now succeeds locally; historical deployment complaints are not proof of the current hosted status.

### Catalog status and provenance

Verified committed data: **5,387 unique imported IDs across 24 nonempty therapeutic category chunks**, all labeled Pharm'Net / July 2026. These are combined with **78 curated defaults**, making **5,465 records** before user changes. This is a record count, not a claim that every real-world specialty is unique across the two catalogs. Source and legacy curated category labels overlap and differ; the UI can show more than 24 distinct categories.

All imported records have blank default posology and unknown reimbursement status. There are **19 blank strengths** and **1 blank form**, retained rather than invented. Package counts/unit labels and category corrections were generated/interpreted during the earlier import and require review; a present numeric field is not proof of clinical accuracy. Curated defaults and custom-entry forms can contain dose/reimbursement defaults, unlike the imported records.

Historical conversation/source notes report comparison with **5,337 TibDZ April 2026 entries**, normalized by commercial name, strength, and form, with no unmatched additions. That comparison was not rerun in this handover session. The Ministry nomenclature page was consulted historically, but its spreadsheet download was blocked; do not claim direct Ministry ingestion or official clinical approval. Source links are in `src/data/medicineCatalogSources.md`.

The initial source class mappings contained inconsistent assignments; imported categories were adjusted. The final correction/matching scripts and raw acquisition files are **not tracked**. The catalog is a historical snapshot with no automatic refresh, and corrections are not backed by a maintained ATC/clinical validation pipeline.

## Git milestones and user-approved decisions

| Commit/tag | Meaning |
| --- | --- |
| `1d4159b` | Vercel/build setup fixes |
| `bfe1a17` | Expanded catalog, async chunks, library/search/persistence changes |
| `design-checkpoint-2026-09-24` | Published tag pointing to `bfe1a17`, before the redesign |
| `ed39458` | Workspace/sidebar and responsive design refresh; user approved it |
| `779e1b0` | Search/category panel moved above favorites; latest application work |

Expected remote: `origin` → `https://github.com/hitokiribatosai/DoctorPrescription.git`, branch `main`. All listed application commits and the checkpoint were pushed historically; the fetch on this review confirmed the current baseline. Preserve the tag. If rollback is requested, use a new revert/restoration commit instead of force-pushing or resetting shared history. Reverting `ed39458` alone after later UI changes requires reviewing dependencies/conflicts.

Design/data decisions to preserve unless justified: local persistence through the service; static catalog with dynamic category chunks to keep the initial bundle modest; imported records without invented prescribing schedules; medicine search before favorites; bilingual documents; responsive sidebar/mobile tabs. Introducing a backend, desktop wrapper, new hosting provider or fresh redesign is a separate feature request, not a handover prerequisite.

## Development commands and validation

Use Node **24.x** and the committed lockfile:

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
git diff --check
```

Development normally uses Vite's port 5173; production preview normally uses 4173. `npm run build` runs `tsc -b && vite build` and generates ignored `dist/`. Vercel should build from the repository root with the checked-in config. No `.env` file is required by the current source. Do not infer the Vercel project linkage, production URL, deployment health, or logged-in account from this repository.

**Actual checks on 2026-10-12:** Node `v24.17.0`, npm `11.13.0`; `npm run lint` exited successfully; `npm run build` exited successfully. Main JS was about **384.58 kB** raw (**108.17 kB** gzip); largest category chunk about **440.63 kB**; no large-chunk warning. These are baseline build figures, not browser performance measurements. No automated test command, test files, or CI workflow were found. No browser/printer/Vercel validation was run in this documentation session. Earlier sessions reported visual inspection at mobile/tablet/desktop sizes; that was not rerun here.

## Known limitations and code-observed issues

These are scoped observations from code review, not an exhaustive audit or a claim that all have been reproduced in a browser:

1. **Print correctness:** `@media print` globally hides `header`, including the practitioner `<header>` in `PrintablePrescription`. `@page` is fixed to A4 although A5 is selectable. The editor mounts the sheet only in split/preview modes, while Print is available in editor/history modes; form panels lack comprehensive print hiding and preview scale/scroll containers are not fully reset. Reproduce these paths in print preview before making fixes.
2. **Box calculations:** `dailyDose` is initialized numerically and used by the calculator but has no dedicated editable control in the current item form. Editing free-text posology does not update that numeric value. Unknown imported package counts may be represented as 1; liquid volume is not converted into doses. Calculated quantities need review.
3. **Patient/draft behavior:** choosing the blank/new-patient option does not clear the prior patient's fields. Zero age falls through `||` defaults. Drafts are not persisted across navigation/reload. `prescriptionToDuplicate` remains in `App` after renewal, so later editor remounts can reinitialize an old renewal; verify before changing.
4. **History refresh/counts:** history memoization depends on patient identity rather than a prescription revision. Deleting a prescription refreshes patients but may leave the memoized list stale. Save and Print can create separate records for the same draft; `printCount` starts at 1 even for save-only operations, and reprint does not increment it. Patient matching by name can merge namesakes; random short references are not guaranteed unique.
5. **Catalog reliability:** legacy/source entries can duplicate specialties and categories. Classification/package parsing needs an auditable refresh pipeline and clinical review. Imported diagnostic products are flagged `isDevice` by class, so verify that handling before treating them as unitary devices. Dose/reimbursement defaults in curated/custom-entry forms are not independently validated.
6. **Catalog loading/import:** load failures only log to the console; the UI can remain in a loading state and the cached rejected promise has no retry reset. Library import checks only for a nonempty array, with no item schema validation or merge/replace preview; importing a subset can mark absent built-ins deleted. Malformed imports can break consumers assuming string fields.
7. **Storage/backup:** no authentication, encryption, multi-user controls, cloud sync or full restore workflow. `localStorage` writes can fail on quota/access issues. Full export omits most practitioner-profile fields. Certificates/lab requests have types but no persistence/archive implementation.
8. **Accessibility/offline/tooling:** autocomplete uses clickable rows rather than complete keyboard/listbox behavior; several fields rely on visual rather than associated labels. Tailwind CDN/remote fonts require network; fonts are requested in both HTML and CSS. README/template assets need cleanup. TypeScript unused-code checks are relaxed, and there is no automated test/CI setup.

## Pending tasks and recommended continuation

No application feature is actively half-edited at the reviewed baseline; the user's last requested application change was completed. The following backlog comes from verified limitations and review recommendations, **not** an approved mandate to implement everything:

1. **Validate and fix prescription printing:** use throwaway/demo data to check editor/split/preview/history paths, header/footer visibility, scales, multi-page output, and A4/A5. Recommended first development task once authorized.
2. **Make dose/package calculation explicit:** editable numeric daily dose, validated package units/volume handling, visible unknowns, and consistent recalculation. Add focused calculation tests when implementing this behavior.
3. **Fix patient/draft/history state:** clean new-patient flow, preserve valid zero ages, explicit renewal consumption, intentional draft persistence, reliable list refresh, and accurate save/reprint semantics.
4. **Audit and maintain the catalog:** track reproducible acquisition/matching/classification rules, review specialty duplication/legacy category mapping, preserve source IDs, validate fields, and label uncertain values. Do not silently update clinical data from a new scrape.
5. **Add validated backup/restore and imports:** full profile export, schema/version checks, preview/merge choices, safe recovery for malformed data and storage errors.
6. **Production readiness:** local Tailwind build instead of runtime CDN, font strategy, accessible autocomplete/labels, relevant regression coverage and CI, project README, demo-data policy. Verify the actual Vercel deployment if the user reports a hosting issue.
7. **Separate product scope if requested:** backend/authentication/sync, certificate/lab history, PWA/offline or desktop packaging. None is currently implemented or specifically approved for this handover setup.

## Session handover record: initial setup

Requested system: permanent project memory in GitHub across Codex accounts/sessions. Inspected source/configuration/history, fetched `origin` and tags, verified catalog counts, and reran lint/build. Created the root `AGENTS.md` and `PROJECT_HANDOVER.md`; documentation whitespace/core file references were also checked. No application code or dependencies were changed. The documentation setup commit is identifiable with `git log -1 -- AGENTS.md PROJECT_HANDOVER.md`; its final hash and push outcome are reported after synchronization, not invented inside the commit itself. Future sessions should update this record with their actual work/checks/state and verify the remote during recovery.
