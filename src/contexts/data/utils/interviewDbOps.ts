
import { supabase, AuditInterviewRow, selectAuditInterviews } from '@/integrations/supabase/client';
import { AuditInterview, InterviewParticipant } from '@/types';
import { formatInterviewForDB, isValidUUID, validateInterview } from './interviewUtils';

/**
 * Fetch interviews from the database by audit ID
 */
export const fetchInterviewsFromDB = async (auditId: string): Promise<AuditInterview[]> => {
  if (!auditId || !isValidUUID(auditId)) {
    console.log('Invalid audit ID provided for fetchInterviewsFromDB');
    return [];
  }
  
  try {
    const { data, error } = await selectAuditInterviews()
      .eq('audit_id', auditId)
      .order('start_time');
    
    if (error) {
      console.error('Error fetching audit interviews from DB:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(interview => ({
      id: interview.id,
      auditId: interview.audit_id,
      topicId: interview.topic_id,
      themeId: interview.theme_id || undefined,
      title: interview.title,
      description: interview.description,
      startTime: interview.start_time,
      durationMinutes: interview.duration_minutes,
      location: interview.location,
      meetingLink: interview.meeting_link,
      controlRefs: interview.control_refs || undefined
    }));
  } catch (error) {
    console.error('Error in fetchInterviewsFromDB:', error);
    return [];
  }
};

/**
 * Add a new interview to the database
 */
export const addInterviewToDB = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
  if (!validateInterview(interview)) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('audit_interviews')
      .insert([formatInterviewForDB(interview.auditId, interview)])
      .select();
    
    if (error) {
      console.error('Error adding audit interview:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after inserting interview');
      return null;
    }
    
    const insertedRecord = data[0] as AuditInterviewRow;
    
    return {
      id: insertedRecord.id,
      auditId: insertedRecord.audit_id,
      topicId: insertedRecord.topic_id,
      themeId: insertedRecord.theme_id || undefined,
      title: insertedRecord.title,
      description: insertedRecord.description,
      startTime: insertedRecord.start_time,
      durationMinutes: insertedRecord.duration_minutes,
      location: insertedRecord.location,
      meetingLink: insertedRecord.meeting_link,
      controlRefs: insertedRecord.control_refs || undefined
    };
  } catch (error) {
    console.error('Error adding audit interview:', error);
    return null;
  }
};

/**
 * Update an existing interview in the database
 */
export const updateInterviewInDB = async (
  id: string,
  updates: Partial<AuditInterview>
): Promise<AuditInterview | null> => {
  try {
    const updateData: any = {};
    
    if (updates.auditId) updateData.audit_id = updates.auditId;
    if (updates.topicId) updateData.topic_id = updates.topicId;
    if (updates.themeId !== undefined) updateData.theme_id = updates.themeId;
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.durationMinutes) updateData.duration_minutes = updates.durationMinutes;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
    if (updates.controlRefs !== undefined) updateData.control_refs = updates.controlRefs;
    
    const { data, error } = await supabase
      .from('audit_interviews')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating audit interview:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after updating interview');
      return null;
    }
    
    const updatedRecord = data[0] as AuditInterviewRow;
    
    return {
      id: updatedRecord.id,
      auditId: updatedRecord.audit_id,
      topicId: updatedRecord.topic_id,
      themeId: updatedRecord.theme_id || undefined,
      title: updatedRecord.title,
      description: updatedRecord.description,
      startTime: updatedRecord.start_time,
      durationMinutes: updatedRecord.duration_minutes,
      location: updatedRecord.location,
      meetingLink: updatedRecord.meeting_link,
      controlRefs: updatedRecord.control_refs || undefined
    };
  } catch (error) {
    console.error('Error updating audit interview:', error);
    return null;
  }
};

/**
 * Delete an interview from the database
 */
export const deleteInterviewFromDB = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('audit_interviews')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting audit interview:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting audit interview:', error);
    return false;
  }
};

/**
 * Add a participant to an interview
 */
export const addParticipantToDB = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('interview_participants')
      .insert([{
        interview_id: participant.interviewId,
        user_id: participant.userId,
        role: participant.role,
        notification_sent: false
      }]);
    
    if (error) {
      console.error('Error adding interview participant:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding interview participant:', error);
    return false;
  }
};

/**
 * Remove a participant from an interview
 */
export const removeParticipantFromDB = async (interviewId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('interview_participants')
      .delete()
      .eq('interview_id', interviewId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing interview participant:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing interview participant:', error);
    return false;
  }
};

/**
 * Get participants by interview ID
 */
export const getParticipantsByInterviewIdFromDB = async (interviewId: string): Promise<InterviewParticipant[]> => {
  try {
    const { data, error } = await supabase
      .from('interview_participants')
      .select('*')
      .eq('interview_id', interviewId);
    
    if (error) {
      console.error('Error getting participants by interview ID:', error);
      return [];
    }
    
    return data.map(p => ({
      interviewId: p.interview_id,
      userId: p.user_id,
      role: p.role,
      notificationSent: p.notification_sent
    }));
  } catch (error) {
    console.error('Error getting participants by interview ID:', error);
    return [];
  }
};

/**
 * Delete existing interviews for an audit
 */
export const deleteExistingInterviews = async (auditId: string): Promise<boolean> => {
  try {
    console.log(`Deleting existing interviews for audit: ${auditId}`);
    
    const { error } = await supabase
      .from('audit_interviews')
      .delete()
      .eq('audit_id', auditId);
    
    if (error) {
      console.error("Error deleting existing interviews:", error);
      return false;
    } else {
      console.log("Successfully deleted existing interviews");
      return true;
    }
  } catch (deleteError) {
    console.error('Error during deletion of existing interviews:', deleteError);
    return false;
  }
};

/**
 * Create multiple interviews in the database
 */
export const createInterviewsInDB = async (interviews: Array<{
  audit_id: string;
  topic_id?: string;
  theme_id?: string;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  control_refs?: string;
}>): Promise<boolean> => {
  try {
    console.log(`Inserting ${interviews.length} interviews into database`);
    
    // Ensure each interview has the required fields
    const validInterviews = interviews.filter(interview => 
      interview && 
      typeof interview === 'object' && 
      'title' in interview && 
      'start_time' in interview && 
      'duration_minutes' in interview &&
      interview.title && 
      interview.start_time && 
      interview.duration_minutes
    );
    
    if (validInterviews.length === 0) {
      console.error('No valid interviews to insert');
      return false;
    }
    
    // Using type assertion to ensure TypeScript understands this is valid
    const { data, error } = await supabase
      .from('audit_interviews')
      .insert(validInterviews as any[])
      .select();
      
    if (error) {
      console.error('Error creating audit interviews in DB:', error);
      return false;
    } else {
      console.log(`Successfully inserted ${data?.length || 0} interviews into DB`);
      return true;
    }
  } catch (error) {
    console.error('Error creating interviews in DB:', error);
    return false;
  }
};
