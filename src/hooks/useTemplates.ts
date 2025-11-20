import { useState, useEffect } from 'react';
import { PromptTemplate, TemplateAnalytics } from '@/types/template';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TEMPLATES_KEY = 'esl-lesson-templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
    loadAnalytics();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates from database:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          teachingStyle: t.teaching_style,
          activityPreferences: t.activity_preferences || [],
          emphasisAreas: t.emphasis_areas || [],
          customInstructions: t.custom_instructions || '',
          tone: t.tone,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));
        setTemplates(formatted);
      } else {
        // Try to migrate from localStorage if database is empty
        migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  };

  const migrateFromLocalStorage = async () => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        const localTemplates = JSON.parse(stored);
        for (const template of localTemplates) {
          await saveTemplate(template);
        }
        toast.success('Templates migrated to database');
      }
    } catch (error) {
      console.error('Failed to migrate templates:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('template_analytics')
        .select('*')
        .order('total_uses', { ascending: false });

      if (error) {
        console.error('Error loading analytics:', error);
        return;
      }

      setAnalytics(data || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const saveTemplate = async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: template.name,
          description: template.description,
          teaching_style: template.teachingStyle,
          activity_preferences: template.activityPreferences,
          emphasis_areas: template.emphasisAreas,
          custom_instructions: template.customInstructions,
          tone: template.tone,
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate: PromptTemplate = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        teachingStyle: data.teaching_style,
        activityPreferences: data.activity_preferences || [],
        emphasisAreas: data.emphasis_areas || [],
        customInstructions: data.custom_instructions || '',
        tone: data.tone,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<PromptTemplate>) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({
          name: updates.name,
          description: updates.description,
          teaching_style: updates.teachingStyle,
          activity_preferences: updates.activityPreferences,
          emphasis_areas: updates.emphasisAreas,
          custom_instructions: updates.customInstructions,
          tone: updates.tone,
        })
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => 
        prev.map(t => 
          t.id === id 
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        )
      );

      await loadAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      await loadAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
      throw error;
    }
  };

  const getTemplateAnalytics = (templateId: string): TemplateAnalytics | undefined => {
    return analytics.find(a => a.id === templateId);
  };

  return {
    templates,
    analytics,
    isLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateAnalytics,
    refreshAnalytics: loadAnalytics,
  };
};
