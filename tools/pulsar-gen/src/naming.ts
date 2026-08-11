// Identifier + naming helpers (portable — no Node APIs).

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Reserved words that would collide as a preset member across our target languages. */
const RESERVED = new Set<string>([
  // shared / cross-language hazards
  'class', 'enum', 'struct', 'object', 'val', 'var', 'let', 'const', 'func', 'fun', 'def',
  'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'when', 'case', 'default', 'break',
  'continue', 'import', 'export', 'public', 'private', 'internal', 'protected', 'static', 'final',
  'init', 'self', 'this', 'super', 'null', 'nil', 'true', 'false', 'void', 'new', 'delete',
  'try', 'catch', 'throw', 'throws', 'async', 'await', 'extends', 'implements', 'interface',
  'typealias', 'typeof', 'in', 'is', 'as', 'operator', 'where',
  // Bundle surface members a preset id must not shadow
  'presets', 'id', 'revision', 'contentHash', 'dispose', 'get',
]);

export function isValidPresetId(id: string): boolean {
  return IDENT_RE.test(id) && !RESERVED.has(id);
}

export function assertValidPresetId(id: string): void {
  if (!IDENT_RE.test(id)) {
    throw new Error(
      `Invalid preset id "${id}": must match ${IDENT_RE} (letters, digits, _ or $; not starting with a digit).`,
    );
  }
  if (RESERVED.has(id)) {
    throw new Error(`Invalid preset id "${id}": reserved word / conflicts with a Bundle member.`);
  }
}

/** "Acme Pack" | "acme-pack" | "acme_pack" -> "AcmePack". */
export function pascalCase(input: string): string {
  const parts = input.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const pascal = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return /^[A-Za-z_$]/.test(pascal) ? pascal : `Bundle${pascal}`;
}

/** "AcmePack" -> "acmePack". */
export function lowerCamel(input: string): string {
  const p = pascalCase(input);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

/** "Acme Pack" -> "acme_pack" (for Dart file names). */
export function snakeCase(input: string): string {
  return input
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .join('_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}
