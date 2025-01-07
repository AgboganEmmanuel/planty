import { supabase } from '../lib/supabase';

export type NotificationType = 
  'watering' | 
  'upcoming_watering' | 
  'new_identification' | 
  'plant_deletion';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  plantId?: string;
  message: string;
}

export async function createNotification({
  userId, 
  type, 
  plantId, 
  message
}: CreateNotificationParams) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        plant_id: plantId,
        message,
        is_read: false
      });

    if (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Erreur inattendue lors de la création de la notification:', err);
    return null;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erreur inattendue lors de la mise à jour de la notification:', err);
    return false;
  }
}