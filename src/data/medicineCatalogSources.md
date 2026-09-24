# Medicine catalog sources

The built-in Algerian catalog contains products whose Pharm'Net register status is `ENREGISTRE` (5,387 products in the July 2026 snapshot). The product DCI, class code, therapeutic-class label, laboratory, dosage, form, and package presentation come from its public medicine register. Catalog records do not include prescribing schedules or verified CNAS/CASNOS reimbursement for this app; those fields remain blank or marked for verification.

Therapeutic categories are based on Pharm'Net's 28 `classes_therapeutiques` labels, joined through DCI class codes. A quality review found systematic mislabeling of oncology products as anti-infectives, antiparasitics as antineoplastics, and oral/throat medicines as toxicology products; these groups and a small number of clear immunology, antiemetic, endocrine, diagnostic, and ophthalmology cases are reassigned to the matching source category. The unmodified source DCI and product data are retained. The catalog was compared with the 5,337-product April 2026 directory at TibDZ using commercial name, dosage, and form. All TibDZ entries matched a registered Pharm'Net entry, so no additional product records were needed from that snapshot.

- [Pharm'Net Algerian medicine register](https://pharmnet-dz.com/recherche-en-pharmacie)
- [TibDZ Algerian medicines directory](https://tibdz.com/medicines?lang=fr)
- [Algerian Ministry of Pharmaceutical Industry: national nomenclature](https://www.miph.gov.dz/fr/nomenclature-nationale-des-produits-pharmaceutiques/)
