import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedLesson {
  id: string;
  session_id: string;
  title: string;
  topic: string;
  cefr_level: string;
  age_group: string | null;
  context: string | null;
  lesson_data: any;
  created_at: string;
  updated_at: string;
}

const SESSION_ID_KEY = 'esl_generator_session_id';

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const useSavedLessons = () => {
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedLessons = async () => {
    setIsLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const { data, error } = await supabase
        .from('saved_lessons')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedLessons(data || []);
    } catch (error) {
      console.error('Error fetching saved lessons:', error);
      toast.error('Failed to load saved lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLesson = async (
    title: string,
    topic: string,
    cefrLevel: string,
    ageGroup: string,
    context: string,
    lessonData: any
  ) => {
    try {
      const sessionId = getOrCreateSessionId();
      const { data, error } = await supabase
        .from('saved_lessons')
        .insert({
          session_id: sessionId,
          title,
          topic,
          cefr_level: cefrLevel,
          age_group: ageGroup,
          context,
          lesson_data: lessonData,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Lesson saved successfully!');
      await fetchSavedLessons();
      return data;
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
      return null;
    }
  };

  const updateLesson = async (id: string, updates: Partial<SavedLesson>) => {
    try {
      const { error } = await supabase
        .from('saved_lessons')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Lesson updated successfully!');
      await fetchSavedLessons();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Failed to update lesson');
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Lesson deleted successfully!');
      await fetchSavedLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  useEffect(() => {
    fetchSavedLessons();
  }, []);

  return {
    savedLessons,
    isLoading,
    saveLesson,
    updateLesson,
    deleteLesson,
    refreshLessons: fetchSavedLessons,
  };
};
