import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Dumbbell, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PostWithUser } from '../types';
import { Card } from './Card';
import { PostDetailModal } from './PostDetailModal';

interface PostCardProps {
  post: PostWithUser;
  onUpdate: () => void;
  compact?: boolean;
}

export function PostCard({ post, onUpdate, compact = false }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with props when they change
  useEffect(() => {
    setIsLiked(post.hasLiked || false);
    setLikesCount(post.likesCount);
    setCommentsCount(post.commentsCount);
  }, [post.hasLiked, post.likesCount, post.commentsCount]);

  const isOwner = user?.id === post.userId;

  function handleUserClick() {
    navigate(`/usuario/${post.user.username}`);
  }

  async function handleLike() {
    if (!user) return;

    // Optimistic UI update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (newIsLiked) {
        // Add like
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: user.id
        });
        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);
      } else {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', post.id);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
      console.error('Error toggling like:', error);
    }
  }

  async function handleDelete() {
    if (!isOwner || !confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete images from storage if any
      if (post.imageUrls && post.imageUrls.length > 0) {
        const filePaths = post.imageUrls.map(url => {
          const urlObj = new URL(url);
          return urlObj.pathname.split('/').pop() || '';
        });

        await supabase.storage
          .from('post-images')
          .remove(filePaths);
      }

      // Delete post (cascade will delete likes and comments)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    } finally {
      setIsDeleting(false);
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es
  });

  function handleCardClick(e: React.MouseEvent) {
    // Don't open modal if clicking on a button or link
    if ((e.target as HTMLElement).closest('button, a')) return;
    setShowDetailModal(true);
  }

  return (
    <>
      <Card
        className="hover:shadow-lg overflow-hidden cursor-pointer hover:bg-slate-800/80 transition-colors"
        padding="none"
        onClick={handleCardClick}
      >
        {/* Post Header */}
        <div className={`${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} flex justify-between items-start gap-2 sm:gap-3`}>
          <div className="flex gap-2 sm:gap-3 items-center flex-1">
            <button
              onClick={handleUserClick}
              className={`${compact ? 'w-9 h-9' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm sm:text-lg flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all`}
            >
              {post.user.avatarUrl ? (
                <img src={post.user.avatarUrl} alt={post.user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{post.user.displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={handleUserClick}
                className={`font-semibold text-white hover:text-blue-400 transition-colors text-left ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
              >
                {post.user.displayName}
              </button>
              <p className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} text-slate-400`}>
                <button onClick={handleUserClick} className="hover:text-blue-400 transition-colors">
                  @{post.user.username}
                </button>
                {' '} · {timeAgo}
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              className="bg-transparent border-none text-slate-400 cursor-pointer p-1.5 sm:p-2 rounded-md transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Eliminar publicación"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className={`${compact ? 'px-2.5 sm:px-3 pb-2.5' : 'px-3 sm:px-4 pb-3 sm:pb-4'}`}>
          {post.contentText && (
            <p className={`whitespace-pre-wrap break-words leading-relaxed mb-2 sm:mb-3 ${compact ? 'text-xs sm:text-sm line-clamp-3' : 'text-sm sm:text-base'}`}>{post.contentText}</p>
          )}

          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className={`grid gap-1.5 sm:gap-2 rounded-md overflow-hidden mb-2 sm:mb-3 ${
              post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {post.imageUrls.slice(0, compact ? 2 : 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className={`w-full h-full object-cover rounded-md ${compact ? 'max-h-32' : 'max-h-48 sm:max-h-96'}`}
                />
              ))}
            </div>
          )}

          {/* Shared Workout */}
          {post.postType === 'WORKOUT_SHARE' && post.sharedWorkout && !compact && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-md p-3 sm:p-4 mt-2 sm:mt-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold mb-2 text-emerald-500">
                <Dumbbell size={16} />
                <span>Rutina compartida</span>
              </div>
              <h4 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">{post.sharedWorkout.routineName}</h4>
              <div className="flex gap-2 text-xs sm:text-sm text-slate-400">
                <span>{post.sharedWorkout.workoutType}</span>
                {post.sharedWorkout.durationMinutes && (
                  <>
                    <span>·</span>
                    <span>{post.sharedWorkout.durationMinutes} min</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Compact workout indicator */}
          {post.postType === 'WORKOUT_SHARE' && post.sharedWorkout && compact && (
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs">
              <Dumbbell size={14} />
              <span className="truncate">{post.sharedWorkout.routineName}</span>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className={`${compact ? 'py-2 px-2.5 sm:px-3' : 'py-2 sm:py-3 px-3 sm:px-4'} border-t border-slate-700 flex gap-3 sm:gap-4`}>
          <button
            className={`flex items-center gap-1 sm:gap-2 bg-transparent border-none cursor-pointer p-1 sm:p-2 rounded-md transition-all ${compact ? 'text-xs' : 'text-xs sm:text-sm'} font-medium hover:bg-white/5 hover:text-white ${
              isLiked ? 'text-red-600' : 'text-slate-400'
            }`}
            onClick={handleLike}
          >
            <Heart size={compact ? 16 : 18} className={isLiked ? 'fill-current' : ''} style={isLiked ? { animation: 'heartBeat 0.3s ease' } : {}} />
            <span>{likesCount}</span>
          </button>

          <button
            className={`flex items-center gap-1 sm:gap-2 bg-transparent border-none text-slate-400 cursor-pointer p-1 sm:p-2 rounded-md transition-all ${compact ? 'text-xs' : 'text-xs sm:text-sm'} font-medium hover:bg-white/5 hover:text-white`}
            onClick={() => setShowDetailModal(true)}
          >
            <MessageCircle size={compact ? 16 : 18} />
            <span>{commentsCount}</span>
          </button>

          <button
            className={`flex items-center gap-1 sm:gap-2 bg-transparent border-none text-slate-400 cursor-pointer p-1 sm:p-2 rounded-md transition-all ${compact ? 'text-xs' : 'text-xs sm:text-sm'} font-medium hover:bg-white/5 hover:text-white`}
            onClick={() => alert('Compartir próximamente')}
          >
            <Share2 size={compact ? 16 : 18} />
          </button>
        </div>
      </Card>

      {/* Post Detail Modal */}
      {showDetailModal && (
        <PostDetailModal
          post={post}
          onClose={() => setShowDetailModal(false)}
          onUpdate={onUpdate}
          currentIsLiked={isLiked}
          currentLikesCount={likesCount}
          currentCommentsCount={commentsCount}
          onLikeChange={(newIsLiked, newLikesCount) => {
            setIsLiked(newIsLiked);
            setLikesCount(newLikesCount);
          }}
          onCommentsCountChange={(count) => setCommentsCount(count)}
        />
      )}
    </>
  );
}
