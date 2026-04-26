import type { FieldOption } from "./types";

export interface MappingValidation {
  valid: boolean;
  missingRequired: string[];
}

export function validateColumnMappings(mappings: Record<number, FieldOption>): MappingValidation {
  const values = Object.values(mappings).map(m => m.label);
  
  // REQUIRED_FIELDS in ImportWizard are Nome* and Turma*
  const required = ["Nome*", "Turma*"];
  const missingRequired = required.filter(req => !values.includes(req));

  return {
    valid: missingRequired.length === 0,
    missingRequired
  };
}
