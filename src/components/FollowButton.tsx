import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '../hooks/useFollow';
import { useAuth } from '../contexts/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({ targetUserId, onFollowChange, size = 'md' }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, loading, toggleFollow } = useFollow(targetUserId);

  // Don't show button if it's the current user
  if (!user || user.id === targetUserId) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggleFollow();
      // Small delay to let the database trigger update the counts
      await new Promise(resolve => setTimeout(resolve, 300));
      onFollowChange?.(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  if (loading) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-lg font-medium flex items-center gap-2 bg-slate-700 text-slate-400`}
      >
        <Loader2 size={iconSize} className="animate-spin" />
      </button>
    );
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-lg font-medium flex items-center gap-2 bg-slate-700 text-white hover:bg-red-600/20 hover:text-red-400 transition-all`}
      >
        <UserMinus size={iconSize} />
        Siguiendo
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-lg font-medium flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-all`}
    >
      <UserPlus size={iconSize} />
      Seguir
    </button>
  );
}
