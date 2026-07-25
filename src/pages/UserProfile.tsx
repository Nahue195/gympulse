import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Dumbbell, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { User, Workout, PostWithUser } from '../types';
import { Button, Card } from '../components';
import { FollowButton } from '../components/FollowButton';
import { FollowersModal } from '../components/FollowersModal';
import { PostCard } from '../components/PostCard';

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workouts' | 'posts'>('workouts');
  const [showFollowersModal, setShowFollowersModal] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  async function loadUserProfile() {
    if (!username) return;

    try {
      setLoading(true);

      // Load user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        navigate('/comunidad');
        return;
      }

      const userRecord = userData;
      const user: User = {
        id: userRecord.id,
        displayName: userRecord.display_name,
        username: userRecord.username,
        avatarUrl: userRecord.avatar_url,
        gymGoal: userRecord.gym_goal as User['gymGoal'],
        experienceLevel: userRecord.experience_level as User['experienceLevel'],
        followersCount: userRecord.followers_count ?? 0,
        followingCount: userRecord.following_count ?? 0,
        createdAt: userRecord.created_at
      };

      setProfileUser(user);

      // Load user's public workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userRecord.id)
        .eq('visibility', 'PUBLIC')
        .order('date', { ascending: false })
        .limit(10);

      if (workoutsData) {
        setWorkouts(workoutsData.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          date: w.date,
          routineName: w.routine_name,
          workoutType: w.workout_type,
          durationMinutes: w.duration_minutes,
          notes: w.notes,
          visibility: w.visibility,
          createdAt: w.created_at
        })));
      }

      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userRecord.id)
        .eq('visibility', 'PUBLIC')
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsData) {
        const postsWithUser: PostWithUser[] = postsData.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          contentText: p.content_text,
          imageUrls: p.image_urls,
          postType: p.post_type,
          sharedWorkoutId: p.shared_workout_id,
          visibility: p.visibility,
          likesCount: p.likes_count,
          commentsCount: p.comments_count,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          user: user
        }));
        setPosts(postsWithUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStartConversation() {
    if (profileUser) {
      navigate(`/mensajes?to=${profileUser.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400">Usuario no encontrado</p>
        <Button variant="secondary" onClick={() => navigate('/comunidad')} className="mt-4">
          Volver a Comunidad
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-4xl font-bold text-white overflow-hidden flex-shrink-0">
            {profileUser.avatarUrl ? (
              <img src={profileUser.avatarUrl} alt={profileUser.displayName} className="w-full h-full object-cover" />
            ) : (
              profileUser.displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profileUser.displayName}</h1>
            <p className="text-slate-400">@{profileUser.username}</p>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <button
                onClick={() => setShowFollowersModal('followers')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="font-bold text-white">{profileUser.followersCount}</span> seguidores
              </button>
              <button
                onClick={() => setShowFollowersModal('following')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="font-bold text-white">{profileUser.followingCount}</span> siguiendo
              </button>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex items-center gap-2">
              <FollowButton
                targetUserId={profileUser.id}
                onFollowChange={() => loadUserProfile()}
              />
              <Button variant="secondary" onClick={handleStartConversation}>
                <MessageCircle size={18} />
                Mensaje
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{workouts.length}</p>
            <p className="text-sm text-slate-400">Entrenamientos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{posts.length}</p>
            <p className="text-sm text-slate-400">Publicaciones</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'workouts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Entrenamientos
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Publicaciones
        </button>
      </div>

      {/* Content */}
      {activeTab === 'workouts' ? (
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400">No hay entrenamientos publicos</p>
              </div>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{workout.routineName}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(workout.date).toLocaleDateString('es-ES')}
                      </span>
                      {workout.durationMinutes && (
                        <>
                          <span>•</span>
                          <span>{workout.durationMinutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-bold">
                    {workout.workoutType}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400">No hay publicaciones</p>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={loadUserProfile} />
            ))
          )}
        </div>
      )}

      {/* Followers/Following Modal */}
      {showFollowersModal && (
        <FollowersModal
          userId={profileUser.id}
          type={showFollowersModal}
          onClose={() => setShowFollowersModal(null)}
        />
      )}
    </div>
  );
}
