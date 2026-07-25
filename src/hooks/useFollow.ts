import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseFollowResult {
  isFollowing: boolean;
  loading: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  toggleFollow: () => Promise<void>;
}

export function useFollow(targetUserId: string | undefined): UseFollowResult {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFollowStatus = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const follow = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;
      setIsFollowing(true);
    } catch (error: any) {
      console.error('Error following user:', error);
      if (error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    if (!user || !targetUserId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  };

  return {
    isFollowing,
    loading,
    follow,
    unfollow,
    toggleFollow
  };
}
