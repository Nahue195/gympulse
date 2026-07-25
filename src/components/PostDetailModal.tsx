import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Heart, MessageCircle, Share2, Dumbbell, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PostWithUser, PostCommentWithUser } from '../types';

interface PostDetailModalProps {
  post: PostWithUser;
  onClose: () => void;
  onUpdate: () => void;
  // Sync state from parent
  currentIsLiked: boolean;
  currentLikesCount: number;
  currentCommentsCount: number;
  onLikeChange: (isLiked: boolean, likesCount: number) => void;
  onCommentsCountChange: (count: number) => void;
}

export function PostDetailModal({
  post,
  onClose,
  onUpdate,
  currentIsLiked,
  currentLikesCount,
  onLikeChange,
  onCommentsCountChange
}: PostDetailModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<PostCommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(currentIsLiked);
  const [likesCount, setLikesCount] = useState(currentLikesCount);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with parent state
  useEffect(() => {
    setIsLiked(currentIsLiked);
    setLikesCount(currentLikesCount);
  }, [currentIsLiked, currentLikesCount]);

  const isOwner = user?.id === post.userId;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es
  });

  useEffect(() => {
    loadComments();
  }, [post.id]);

  async function loadComments() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:users(id, display_name, username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const commentsData: PostCommentWithUser[] = data.map((comment: any) => ({
          id: comment.id,
          postId: comment.post_id,
          userId: comment.user_id,
          commentText: comment.comment_text,
          createdAt: comment.created_at,
          user: {
            id: comment.user.id,
            displayName: comment.user.display_name,
            username: comment.user.username,
            avatarUrl: comment.user.avatar_url,
            createdAt: comment.user.created_at || new Date().toISOString()
          }
        }));

        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleUserClick() {
    onClose();
    navigate(`/usuario/${post.user.username}`);
  }

  async function handleLike() {
    if (!user) return;

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // Update local state
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    // Update parent state immediately
    onLikeChange(newIsLiked, newLikesCount);

    try {
      if (newIsLiked) {
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: user.id
        });
        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: newLikesCount })
          .eq('id', post.id);
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, newLikesCount) })
          .eq('id', post.id);
      }
    } catch (error) {
      // Revert both local and parent state on error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      onLikeChange(!newIsLiked, likesCount);
      console.error('Error toggling like:', error);
    }
  }

  async function handleDelete() {
    if (!isOwner || !confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      setIsDeleting(true);

      if (post.imageUrls && post.imageUrls.length > 0) {
        const filePaths = post.imageUrls.map(url => {
          const urlObj = new URL(url);
          return urlObj.pathname.split('/').pop() || '';
        });

        await supabase.storage
          .from('post-images')
          .remove(filePaths);
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !newComment.trim()) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        user_id: user.id,
        comment_text: newComment.trim()
      });

      if (error) throw error;

      setNewComment('');
      await loadComments();

      // Update parent comments count
      onCommentsCountChange(comments.length + 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al enviar el comentario');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await loadComments();

      // Update parent comments count
      onCommentsCountChange(comments.length - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4"
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-xl sm:rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ height: '90vh', maxHeight: '90vh', animation: 'slideUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-white">Publicación</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Content + Comments */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Post */}
          <div className="border-b border-slate-700">
            {/* Post Header */}
            <div className="p-3 sm:p-4 flex justify-between items-start gap-2 sm:gap-3">
              <div className="flex gap-2 sm:gap-3 items-center flex-1">
                <button
                  onClick={handleUserClick}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all"
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
                    className="font-semibold text-white hover:text-blue-400 transition-colors text-left text-sm sm:text-base"
                  >
                    {post.user.displayName}
                  </button>
                  <p className="text-xs sm:text-sm text-slate-400">
                    <button onClick={handleUserClick} className="hover:text-blue-400 transition-colors">
                      @{post.user.username}
                    </button>
                    {' '} · {timeAgo}
                  </p>
                </div>
              </div>

              {isOwner && (
                <button
                  className="text-slate-400 p-1.5 rounded-md transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Eliminar publicación"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Post Content */}
            <div className="px-3 sm:px-4 pb-3">
              {post.contentText && (
                <p className="whitespace-pre-wrap break-words leading-relaxed mb-3 text-sm sm:text-base">{post.contentText}</p>
              )}

              {/* Images */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className={`grid gap-2 rounded-md overflow-hidden mb-3 ${
                  post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {post.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover max-h-64 sm:max-h-80 rounded-md"
                    />
                  ))}
                </div>
              )}

              {/* Shared Workout */}
              {post.postType === 'WORKOUT_SHARE' && post.sharedWorkout && (
                <div className="bg-emerald-500/10 border border-emerald-500 rounded-md p-3 mt-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold mb-2 text-emerald-500">
                    <Dumbbell size={16} />
                    <span>Rutina compartida</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold mb-2">{post.sharedWorkout.routineName}</h4>
                  <div className="flex gap-2 text-xs sm:text-sm text-slate-400 mb-3">
                    <span>{post.sharedWorkout.workoutType}</span>
                    {post.sharedWorkout.durationMinutes && (
                      <>
                        <span>·</span>
                        <span>{post.sharedWorkout.durationMinutes} min</span>
                      </>
                    )}
                  </div>
                  {post.sharedWorkout.entries && post.sharedWorkout.entries.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm mb-2 text-slate-400">Top ejercicios:</p>
                      <ul className="list-none m-0 p-0">
                        {post.sharedWorkout.entries.slice(0, 3).map((entry: any) => (
                          <li key={entry.id} className="text-xs sm:text-sm text-white mb-1 pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-emerald-500 before:font-bold">
                            {entry.exercise_name} - {entry.sets} sets
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="py-2 sm:py-3 px-3 sm:px-4 border-t border-slate-700 flex gap-4">
              <button
                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-md transition-all text-xs sm:text-sm font-medium hover:bg-white/5 ${
                  isLiked ? 'text-red-600' : 'text-slate-400 hover:text-white'
                }`}
                onClick={handleLike}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 text-slate-400 text-xs sm:text-sm font-medium">
                <MessageCircle size={18} />
                <span>{comments.length}</span>
              </div>

              <button
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-md transition-all text-xs sm:text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                onClick={() => alert('Compartir próximamente')}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-3 sm:p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-400">Comentarios</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">Todavía no hay comentarios</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {comment.user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-xs sm:text-sm">{comment.user.displayName}</span>
                          <span className="text-[10px] sm:text-xs text-slate-500">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <button
                            className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm whitespace-pre-wrap break-words">
                        {comment.commentText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmitComment}
          className="px-3 sm:px-4 py-3 border-t border-slate-700 flex-shrink-0"
        >
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={280}
              disabled={submitting}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              disabled={!newComment.trim() || submitting}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
