import { useState } from 'react';
import { AuditTopic } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useAuditTopics = () => {
  const [topics, setTopics] = useState<AuditTopic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async (): Promise<AuditTopic[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_topics')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching audit topics:', error);
        return [];
      }
      
      setTopics(data as AuditTopic[]);
      return data as AuditTopic[];
    } catch (error) {
      console.error('Error fetching audit topics:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTopic = async (topic: Omit<AuditTopic, 'id'>): Promise<AuditTopic | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_topics')
        .insert([topic])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding audit topic:', error);
        return null;
      }
      
      setTopics((prev) => [...prev, data as AuditTopic]);
      return data as AuditTopic;
    } catch (error) {
      console.error('Error adding audit topic:', error);
      return null;
    }
  };

  const updateTopic = async (id: string, updates: Partial<AuditTopic>): Promise<AuditTopic | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating audit topic:', error);
        return null;
      }
      
      setTopics((prev) =>
        prev.map((topic) => (topic.id === id ? { ...topic, ...updates } : topic))
      );
      
      return data as AuditTopic;
    } catch (error) {
      console.error('Error updating audit topic:', error);
      return null;
    }
  };

  const deleteTopic = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_topics')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit topic:', error);
        return false;
      }
      
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit topic:', error);
      return false;
    }
  };

  const associateControlsWithTopic = async (
    topicId: string,
    controlIds: string[]
  ): Promise<boolean> => {
    try {
      const topicControls = controlIds.map((controlId) => ({
        topic_id: topicId,
        control_id: controlId,
      }));

      const { error } = await supabase
        .from('topic_controls')
        .insert(topicControls);
      
      if (error) {
        console.error('Error associating controls with topic:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error associating controls with topic:', error);
      return false;
    }
  };

  const getControlsByTopicId = async (topicId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('topic_controls')
        .select('control_id')
        .eq('topic_id', topicId);
      
      if (error) {
        console.error('Error getting controls by topic ID:', error);
        return [];
      }
      
      return data.map((item) => item.control_id);
    } catch (error) {
      console.error('Error getting controls by topic ID:', error);
      return [];
    }
  };

  return {
    topics,
    loading,
    fetchTopics,
    addTopic,
    updateTopic,
    deleteTopic,
    associateControlsWithTopic,
    getControlsByTopicId,
  };
};
