export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  teachingStyle: string;
  activityPreferences: string[];
  emphasisAreas: string[];
  customInstructions: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePreferences {
  teachingStyle: string;
  activityPreferences: string[];
  emphasisAreas: string[];
  customInstructions: string;
  tone: string;
}
