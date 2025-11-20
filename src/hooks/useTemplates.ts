import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/types/template';

const TEMPLATES_KEY = 'esl-lesson-templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplate = (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...templates, newTemplate];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    setTemplates(updated);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<PromptTemplate>) => {
    const updated = templates.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    );
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    setTemplates(updated);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    setTemplates(updated);
  };

  return {
    templates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
