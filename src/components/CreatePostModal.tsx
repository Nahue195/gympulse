import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Dumbbell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Workout, PostType } from '../types';
import { Button } from './';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth();
  const [contentText, setContentText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  async function loadRecentWorkouts() {
    if (!user) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString())
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setRecentWorkouts(data.map((w: any) => ({
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
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      alert('Máximo 3 imágenes por publicación');
      return;
    }

    const newImages = files.slice(0, 3 - images.length);
    setImages([...images, ...newImages]);

    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  }

  function removeImage(index: number) {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;
    if (!contentText.trim() && images.length === 0 && !selectedWorkoutId) {
      alert('Agrega contenido, imágenes o un entrenamiento para publicar');
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      // Upload images to Supabase Storage
      const imageUrls: string[] = [];

      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, image, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        }
      }

      setUploading(false);

      // Determine post type
      let postType: PostType = 'TEXT';
      if (selectedWorkoutId) {
        postType = 'WORKOUT_SHARE';
      } else if (images.length > 0) {
        postType = 'IMAGE';
      }

      // Create post
      const { error: postError } = await supabase.from('posts').insert({
        user_id: user.id,
        content_text: contentText.trim() || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        post_type: postType,
        shared_workout_id: selectedWorkoutId,
        visibility: 'PUBLIC'
      } as any);

      if (postError) throw postError;

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear la publicación');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  const canPublish = (contentText.trim() || images.length > 0 || selectedWorkoutId) && !loading;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ maxHeight: '90vh', animation: 'slideUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Crear publicación</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {/* Textarea */}
            <textarea
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-base placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="¿Qué entrenaste hoy? Comparte tu progreso..."
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={4}
              maxLength={1000}
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border-2 border-slate-700">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-black transition-all"
                      onClick={() => removeImage(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Workout Selection */}
            {recentWorkouts.length > 0 && (
              <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-slate-700">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Dumbbell size={18} />
                  Adjuntar entreno (opcional)
                </label>
                <select
                  value={selectedWorkoutId || ''}
                  onChange={(e) => setSelectedWorkoutId(e.target.value || null)}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Sin adjuntar</option>
                  {recentWorkouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.routineName} ({new Date(workout.date).toLocaleDateString('es')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 3}
              title="Agregar imágenes (máx. 3)"
            >
              <ImageIcon size={20} />
              <span className="text-sm">{images.length}/3 imágenes</span>
            </button>

            <div className="flex items-center gap-3">
              {uploading && (
                <span className="text-sm text-slate-400">Subiendo imágenes...</span>
              )}
              <Button
                type="submit"
                disabled={!canPublish}
                loading={loading}
              >
                {uploading ? 'Subiendo...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
