
'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import type { PhotoUploadProps } from '@/lib/clients/types';

/**
 * Photo Upload Component
 * Allows uploading and managing client profile photos
 */
export default function PhotoUpload({
  currentPhotoUrl,
  onUpload,
  isLoading = false,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    try {
      setUploading(true);

      // Create FormData for file upload
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      const uploadResponse = await fetch('/api/clients/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir la foto');
      }

      const data = await uploadResponse.json();
      
      if (data.success && data.data?.url) {
        await onUpload(data.data.url);
        setPreview(null);
        toast.success('Foto actualizada correctamente');
      } else {
        throw new Error(data.error || 'Error al subir la foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      await onUpload('');
      setPreview(null);
      toast.success('Foto eliminada correctamente');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Error al eliminar la foto');
    } finally {
      setUploading(false);
    }
  };

  const displayPhoto = preview || currentPhotoUrl;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Photo Preview */}
          <Avatar className="h-32 w-32">
            {displayPhoto ? (
              <AvatarImage src={displayPhoto} alt="Perfil" />
            ) : (
              <AvatarFallback className="bg-gray-100">
                <Camera className="h-12 w-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Upload Controls */}
          {!preview ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentPhotoUrl ? 'Cambiar foto' : 'Subir foto'}
              </Button>

              {currentPhotoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isLoading || uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center">
            Formatos: JPG, PNG. Tamaño máximo: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
