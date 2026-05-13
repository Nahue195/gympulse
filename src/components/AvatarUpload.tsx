import { useState, useRef } from 'react';
import { X, Camera, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface AvatarUploadProps {
  onClose: () => void;
  onUpdated: () => void;
}

export function AvatarUpload({ onClose, onUpdated }: AvatarUploadProps) {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldPath = user.avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      await updateProfile({ avatarUrl: urlData.publicUrl });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir la imagen: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!user?.avatarUrl) return;

    try {
      setUploading(true);

      // Delete from storage
      const path = user.avatarUrl.split('/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }

      // Update profile
      await updateProfile({ avatarUrl: null });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      alert('Error al eliminar la imagen');
    } finally {
      setUploading(false);
    }
  }

  const currentAvatar = preview || user?.avatarUrl;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Foto de perfil</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold text-white overflow-hidden border-4 border-slate-700">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors shadow-lg"
              >
                <Camera size={20} />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-sm text-slate-400 mt-4 text-center">
              Formatos: JPG, PNG, GIF. Maximo 5MB.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={18} />
              Seleccionar imagen
            </Button>

            {selectedFile && (
              <Button
                fullWidth
                onClick={handleUpload}
                disabled={uploading}
                loading={uploading}
              >
                Guardar foto
              </Button>
            )}

            {user?.avatarUrl && !selectedFile && (
              <Button
                variant="danger"
                fullWidth
                onClick={handleRemoveAvatar}
                disabled={uploading}
              >
                <Trash2 size={18} />
                Eliminar foto actual
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
