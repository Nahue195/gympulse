import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle } from 'lucide-react';
import { Button } from '../components';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import type { PostWithUser, ConversationWithUser } from '../types';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { SearchUsers } from '../components/SearchUsers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'workouts' | 'images' | 'text'>('all');
  const { conversations, loading: loadingConversations } = useConversations();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  async function loadPosts() {
    try {
      setLoading(true);

      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(id, display_name, username, avatar_url)
        `)
        .eq('visibility', 'PUBLIC')
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply filters
      if (filter === 'workouts') {
        query = query.eq('post_type', 'WORKOUT_SHARE');
      } else if (filter === 'images') {
        query = query.eq('post_type', 'IMAGE');
      } else if (filter === 'text') {
        query = query.eq('post_type', 'TEXT');
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const postsData: PostWithUser[] = await Promise.all(
          data.map(async (post: any) => {
            // Check if user has liked this post
            let hasLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle();

              hasLiked = !!likeData;
            }

            // Load shared workout if exists
            let sharedWorkout = null;
            if (post.shared_workout_id) {
              const { data: workoutData } = await supabase
                .from('workouts')
                .select(`
                  *,
                  entries:workout_entries(*)
                `)
                .eq('id', post.shared_workout_id)
                .single();

              if (workoutData) {
                sharedWorkout = {
                  ...(workoutData as any),
                  entries: (workoutData as any).entries || []
                };
              }
            }

            return {
              id: post.id,
              userId: post.user_id,
              contentText: post.content_text,
              imageUrls: post.image_urls,
              postType: post.post_type,
              sharedWorkoutId: post.shared_workout_id,
              visibility: post.visibility,
              likesCount: post.likes_count,
              commentsCount: post.comments_count,
              createdAt: post.created_at,
              updatedAt: post.updated_at,
              user: {
                id: post.user.id,
                displayName: post.user.display_name,
                username: post.user.username,
                avatarUrl: post.user.avatar_url,
                createdAt: post.user.created_at || new Date().toISOString()
              },
              sharedWorkout,
              hasLiked
            };
          })
        );

        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePostCreated() {
    setShowCreateModal(false);
    loadPosts();
  }

  function handleConversationClick(conversation: ConversationWithUser) {
    navigate(`/mensajes?conversation=${conversation.id}`);
  }

  const conversationList = conversations as ConversationWithUser[];
  const totalUnread = conversationList.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6">
      {/* Twitter-like layout: Feed center, Messages right */}
      <div className="flex gap-4 lg:gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Social</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5 hidden sm:block">Comparte tu progreso</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="text-sm px-3 py-2">
                <Plus size={18} />
                <span className="hidden sm:inline ml-1">Publicar</span>
              </Button>
            </div>
            <SearchUsers />
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => setFilter('all')}
            >
              Todos
            </button>
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                filter === 'workouts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => setFilter('workouts')}
            >
              Entrenos
            </button>
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                filter === 'images'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => setFilter('images')}
            >
              Fotos
            </button>
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                filter === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => setFilter('text')}
            >
              Texto
            </button>
          </div>

          {/* Feed */}
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Sin publicaciones</h3>
                  <p className="text-slate-400 text-sm">
                    Sé el primero en compartir tu entreno
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} className="text-sm">
                    Crear publicación
                  </Button>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={loadPosts}
                />
              ))
            )}
          </div>
        </div>

        {/* Messages Sidebar - Desktop only */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Mensajes</h2>
                  {totalUnread > 0 && (
                    <span className="min-w-[20px] h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate('/mensajes')}
                  className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
                >
                  Ver todos
                </button>
              </div>

              {/* Conversation List */}
              <div className="max-h-[400px] overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : conversationList.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <MessageCircle size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Sin mensajes</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {conversationList.slice(0, 5).map((conversation) => {
                      const hasUnread = (conversation.unreadCount ?? 0) > 0;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => handleConversationClick(conversation)}
                          className="w-full flex items-center gap-2.5 p-3 text-left transition-colors hover:bg-slate-700/50"
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                              {conversation.otherUser.avatarUrl ? (
                                <img
                                  src={conversation.otherUser.avatarUrl}
                                  alt={conversation.otherUser.displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                conversation.otherUser.displayName.charAt(0).toUpperCase()
                              )}
                            </div>
                            {hasUnread && (
                              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-slate-800"></span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-sm font-medium truncate ${hasUnread ? 'text-white' : 'text-slate-300'}`}>
                                {conversation.otherUser.displayName}
                              </p>
                              {conversation.lastMessage && (
                                <span className="text-[10px] text-slate-500 flex-shrink-0">
                                  {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                    addSuffix: false,
                                    locale: es
                                  })}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className={`text-xs truncate ${hasUnread ? 'text-slate-300' : 'text-slate-500'}`}>
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View all link */}
              {conversationList.length > 5 && (
                <div className="p-3 border-t border-slate-700">
                  <button
                    onClick={() => navigate('/mensajes')}
                    className="w-full text-center text-blue-400 text-sm hover:text-blue-300 transition-colors"
                  >
                    Ver {conversationList.length - 5} más
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
