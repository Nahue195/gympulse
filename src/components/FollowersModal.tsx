import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { FollowButton } from './FollowButton';

interface FollowersModalProps {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export function FollowersModal({ userId, type, onClose }: FollowersModalProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  async function loadUsers() {
    try {
      setLoading(true);

      let query;
      if (type === 'followers') {
        // Get users who follow this user
        query = supabase
          .from('follows')
          .select('follower_id, users!follows_follower_id_fkey(*)')
          .eq('following_id', userId);
      } else {
        // Get users this user follows
        query = supabase
          .from('follows')
          .select('following_id, users!follows_following_id_fkey(*)')
          .eq('follower_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const userList = data.map((item: any) => {
          const userData = type === 'followers' ? item.users : item.users;
          return {
            id: userData.id,
            displayName: userData.display_name,
            username: userData.username,
            avatarUrl: userData.avatar_url,
            createdAt: userData.created_at
          };
        });
        setUsers(userList);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleUserClick(username: string) {
    onClose();
    navigate(`/usuario/${username}`);
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Users size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400">
                {type === 'followers'
                  ? 'Todavia no tiene seguidores'
                  : 'Todavia no sigue a nadie'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        user.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-sm text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </button>
                  <FollowButton targetUserId={user.id} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
