import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PostWithUser, PostCommentWithUser } from '../types';

interface CommentsModalProps {
  post: PostWithUser;
  onClose: () => void;
  onUpdate: () => void;
}

export function CommentsModal({ post, onClose, onUpdate }: CommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostCommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !newComment.trim()) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        user_id: user.id,
        comment_text: newComment.trim()
      } as any);

      if (error) throw error;

      setNewComment('');
      await loadComments();
      onUpdate();
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
      onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ height: '80vh', maxHeight: '80vh', animation: 'slideUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Comentarios ({post.commentsCount})</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-lg">Cargando comentarios...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-slate-400 text-lg">Todavía no hay comentarios</p>
              <p className="text-slate-500 text-sm">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user.avatarUrl ? (
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {comment.user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{comment.user.displayName}</span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                    {user?.id === comment.userId && (
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all flex-shrink-0"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap break-words">
                    {comment.commentText}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmitComment}
          className="px-6 py-4 border-t border-slate-700 flex-shrink-0 space-y-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-base placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={280}
              disabled={submitting}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              disabled={!newComment.trim() || submitting}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-slate-500">
              {newComment.length}/280
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
