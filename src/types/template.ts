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

export interface TemplateAnalytics {
  id: string;
  name: string;
  teaching_style: string;
  tone: string;
  total_uses: number;
  total_ratings: number;
  average_rating: number;
  avg_image_quality: number;
  last_used_at: string;
  satisfaction_rate: number;
}

export interface LessonFeedback {
  rating: number;
  feedback?: string;
  imageQualityScore?: number;
}
