/** JSON Schema uniqueItems compares whole objects, not the required format key. */
export function validateOverlayDefinitionUniqueness(
  definitions: readonly { type: string; mediaType: string }[],
): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const [index, definition] of definitions.entries()) {
    const key = JSON.stringify([definition.type, definition.mediaType]);
    if (seen.has(key)) {
      errors.push(`definitions[${index}] duplicates type and mediaType ${key}`);
    }
    seen.add(key);
  }
  return errors;
}
