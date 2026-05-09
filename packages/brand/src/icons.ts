/**
 * NovaBash custom icon set.
 *
 * Rules:
 *   - 24x24 viewBox
 *   - 1.5px stroke, butt linecap, miter linejoin
 *   - currentColor stroke, no fills except status dots
 *   - Only 0/45/90/135/180/225/270/315 deg angles where geometry permits
 *   - Credential icons carry a 1-step key-tooth notch matching the brand mark
 *
 * Each entry is the inner SVG markup. The Icon component wraps with the
 * outer <svg> tag, viewBox, and stroke defaults.
 */

export const iconPaths = {
  // ── nav ────────────────────────────────────────────────────
  overview: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="5"/><rect x="13" y="10" width="8" height="11"/><rect x="3" y="13" width="8" height="8"/>',
  stacks: '<rect x="3" y="4" width="18" height="4"/><rect x="3" y="10" width="18" height="4"/><rect x="3" y="16" width="18" height="4"/>',
  workspace: '<rect x="3" y="3" width="14" height="14"/><rect x="7" y="7" width="14" height="14"/>',
  vault: '<rect x="4" y="4" width="16" height="16"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="13" y1="11" x2="13" y2="13"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  services: '<rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="6"/><rect x="19" y="3" width="2" height="6"/><rect x="3" y="11" width="6" height="6"/><rect x="11" y="11" width="6" height="6"/><rect x="19" y="11" width="2" height="6"/><rect x="3" y="19" width="6" height="2"/><rect x="11" y="19" width="6" height="2"/>',
  community: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><line x1="7" y1="7" x2="11" y2="17"/><line x1="17" y1="7" x2="13" y2="17"/>',
  billing: '<path d="M5 3 L19 3 L19 21 L17 19 L15 21 L13 19 L11 21 L9 19 L7 21 L5 19 Z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/>',
  settings: '<polygon points="12,2 15,4 18,4 18,7 21,9 21,12 21,15 18,17 18,20 15,20 12,22 9,20 6,20 6,17 3,15 3,12 3,9 6,7 6,4 9,4"/><circle cx="12" cy="12" r="3"/>',

  // ── status ────────────────────────────────────────────────
  ok: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>',
  validating: '<circle cx="12" cy="12" r="6" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  rotating: '<path d="M18 12 A6 6 0 1 0 12 18"/><polyline points="18 8 18 12 14 12"/><line x1="11" y1="12" x2="13" y2="12"/>',
  idle: '<circle cx="12" cy="12" r="6"/>',
  error: '<rect x="5" y="5" width="14" height="14"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',

  // ── action ────────────────────────────────────────────────
  downloadEnv: '<rect x="4" y="4" width="16" height="11"/><polyline points="9 18 12 21 15 18"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="7" y1="8" x2="11" y2="8"/><line x1="7" y1="11" x2="14" y2="11"/>',
  copy: '<rect x="4" y="4" width="12" height="12"/><polyline points="8 8 8 20 20 20 20 8"/>',
  rotate: '<path d="M19 12 A7 7 0 1 1 12 5"/><polyline points="19 5 19 12 12 12"/><line x1="11" y1="12" x2="13" y2="12"/>',
  validate: '<rect x="4" y="4" width="16" height="16"/><polyline points="8 12 11 15 17 9"/>',
  regenerate: '<path d="M5 12 A7 7 0 1 1 12 19"/><polyline points="5 19 5 12 12 12"/>',
  fork: '<line x1="6" y1="3" x2="6" y2="13"/><line x1="18" y1="3" x2="18" y2="9"/><circle cx="6" cy="16" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 13 Q6 17 12 17 Q18 17 18 14"/>',
  star: '<polygon points="12 3 15 9 21 10 17 14 18 21 12 18 6 21 7 14 3 10 9 9"/>',
  share: '<rect x="4" y="11" width="16" height="10"/><polyline points="9 7 12 4 15 7"/><line x1="12" y1="4" x2="12" y2="14"/>',
  trash: '<rect x="6" y="6" width="12" height="14"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="3" x2="14" y2="3"/><line x1="10" y1="10" x2="10" y2="16"/><line x1="14" y1="10" x2="14" y2="16"/>',
  expand: '<polyline points="4 9 4 4 9 4"/><polyline points="20 9 20 4 15 4"/><polyline points="4 15 4 20 9 20"/><polyline points="20 15 20 20 15 20"/>',
  search: '<circle cx="11" cy="11" r="6"/><line x1="15" y1="15" x2="20" y2="20"/>',

  // ── data primitives ──────────────────────────────────────
  database: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6 L5 18 Q5 20.5 12 20.5 Q19 20.5 19 18 L19 6"/><path d="M5 12 Q5 14.5 12 14.5 Q19 14.5 19 12"/>',
  function: '<rect x="3" y="6" width="18" height="12"/><path d="M8 9 Q8 12 11 12 Q8 12 8 15"/><line x1="13" y1="10" x2="17" y2="10"/><line x1="13" y1="14" x2="16" y2="14"/>',
  queue: '<rect x="3" y="9" width="4" height="6"/><rect x="9" y="9" width="4" height="6"/><rect x="15" y="9" width="4" height="6"/><line x1="7" y1="12" x2="9" y2="12"/><line x1="13" y1="12" x2="15" y2="12"/>',
  email: '<rect x="3" y="6" width="18" height="12"/><polyline points="3 8 12 14 21 8"/>',
  payment: '<rect x="3" y="6" width="18" height="13"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>',
  model: '<polygon points="12 3 21 8 21 16 12 21 3 16 3 8"/><polyline points="3 8 12 13 21 8"/><line x1="12" y1="13" x2="12" y2="21"/>',
  edge: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3 Q6 12 12 21"/><path d="M12 3 Q18 12 12 21"/>',
  storage: '<rect x="3" y="5" width="18" height="5"/><rect x="3" y="13" width="18" height="5"/><line x1="7" y1="7.5" x2="9" y2="7.5"/><line x1="7" y1="15.5" x2="9" y2="15.5"/>',
  log: '<rect x="3" y="4" width="18" height="16"/><line x1="6" y1="8" x2="11" y2="8"/><line x1="6" y1="12" x2="14" y2="12"/><line x1="6" y1="16" x2="9" y2="16"/>',
} as const;

export type IconName = keyof typeof iconPaths;
