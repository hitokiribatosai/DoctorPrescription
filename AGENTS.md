# Project continuity instructions

## Start of every session

1. Read `PROJECT_HANDOVER.md` before development.
2. Inspect the branch, working tree, recent commits, configured remote, and relevant source files. Verify the handover against current code; source and Git state take precedence over stale notes.
3. Identify the latest completed work and unfinished tasks. Briefly summarize status and recommend the next task.
4. Wait for the user's development instruction. Session recovery alone does not authorize new application changes; an instruction already supplied in the current request does.
5. Continue the existing implementation rather than rebuilding completed features. Respect its architecture, conventions, user-approved design, and technical decisions unless a change is justified.

## During development

- Keep track of features, fixes, decisions, checks, incomplete work, and remaining tasks.
- Make scoped changes. Preserve unrelated work and avoid unnecessary changes to working code.
- This is a React/TypeScript/Vite browser application, despite the package name `ordo-med-desktop`. Persistence is centralized in `src/services/storageService.ts`; there is no backend or desktop packaging.
- Preserve existing stored data and identifiers when changing persistence. Do not silently reset browser storage, patient history, favorites, or medicine overrides.
- Preserve the current prescription order: patient details, medicine search/category picker, favorites/devices, prescription lines.
- Keep French UI and French/Arabic document rendering usable. Verify print behavior separately when editing document markup or print styles.
- The medicine catalog is reference data, not verified prescribing guidance. Do not invent doses, strengths, package counts, reimbursement claims, clinical validation, or regulatory compliance.
- Use relevant checks. Current commands are `npm run lint` and `npm run build`; no automated test suite is configured. Do not claim build success proves browser, print, medical, or deployment correctness.
- Never record passwords, tokens, API keys, credentials, secrets, actual patient records, or private clinical data in documentation or commits.
- Never invent completed work, test results, source verification, remote synchronization, or project facts. Clearly label uncertainty and code-observed issues not reproduced at runtime.

## End of meaningful work

Update `PROJECT_HANDOVER.md` before ending the session. Record the verified current state, meaningful changes, important decisions and reasons, actual validation results, incomplete work, known issues, and recommended next steps. Keep it navigable and specific; replace stale statements instead of accumulating contradictory history. Record the branch and application commit when known; a document cannot contain its own eventual commit hash.

## When the user says "Prepare handover"

1. Review this session's work and inspect the current diff, branch, history, and working tree.
2. Update `PROJECT_HANDOVER.md` with completed and incomplete tasks, known issues, decisions, validation, and prioritized next steps.
3. Run relevant checks when practical and record actual results, including failures or limitations.
4. Inspect the changes for unrelated work and sensitive information. Stage explicit files; do not blindly stage everything.
5. Commit the documentation and appropriate authorized project changes. Preserve unrelated changes; leave them uncommitted when their inclusion is unclear and report them.
6. Push to the configured GitHub remote/appropriate branch if access is available. The user's handover request authorizes this commit/push procedure; do not force-push, overwrite others' changes, or rewrite published history.
7. Confirm the commit hash, branch, push outcome, and any remaining uncommitted or unpushed changes. If access or synchronization fails, preserve the files locally and explain the actual blocker.

## GitHub and recovery

- Expected repository: `https://github.com/hitokiribatosai/DoctorPrescription.git`, remote `origin`; verify rather than assuming the checkout/branch is unchanged.
- Keep `AGENTS.md` and `PROJECT_HANDOVER.md` tracked and maintained in Git so another account with repository access can recover context.
- Existing rollback tag: `design-checkpoint-2026-09-24`, pointing to `bfe1a17` before the redesign. Preserve it.
- A checkpoint is a recovery option, not permission to roll back. Restore only on user instruction, preferably with a new revert/restoration commit that preserves published history.
- Git commit dates are not exact GitHub push timestamps. A successful push also does not prove that Vercel deployed successfully.
