import z from 'zod';

export interface FormInterface {
  formId: string;
  companyId: string;
  formName: string;
  fieldsAddress: string;
}

export interface FormUpdateInterface extends FormInterface{
  formId: string;
}

export interface FormDomainInterface extends FormInterface {
  formId: string;
  createdAt: string;
}

export interface FormPersistenceInterface extends FormInterface{
  PK: string;
  SK: string;
  formId: string;
  createdAt: string;
  fieldsAddress: string;
}

export const fieldTypeSchema = z.enum([
  'shortAnswer',
  'longAnswer',
  'radioSelection',
  'checkbox',
  'selectField',
]);

export const fieldOptionSchema = z.object({
  value: z.string(),
  index: z.string(),
  linkedToAnotherQuestion: z.object({
    fieldId: z.string(),
  }).optional(),
});

export const fieldAiAnalysisSchema = z.object({
  prompt: z.string().max(1000, { message: 'Prompt must be at most 1000 characters long.' }),
  shouldAnalyse: z.boolean(),
});

export const fieldSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  fieldType: fieldTypeSchema,
  fieldId: z.string(),
  options: z.array(fieldOptionSchema).optional(),
  aiAnalysis: fieldAiAnalysisSchema,
});

export const fieldsSchema = z.array(fieldSchema);

export type IField = z.infer<typeof fieldSchema>;
export type IFieldOption = z.infer<typeof fieldOptionSchema>;
export type IFieldAiAnalysis = z.infer<typeof fieldAiAnalysisSchema>;
export type IFieldType = z.infer<typeof fieldTypeSchema>;