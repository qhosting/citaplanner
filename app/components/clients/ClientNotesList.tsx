'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, FileText, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ClientNotesListProps, ClientNote } from '@/lib/clients/types';

/**
 * Client Notes List Component
 * Displays and manages client notes
 */
export default function ClientNotesList({ clientId, userId }: ClientNotesListProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'GENERAL' as 'GENERAL' | 'MEDICAL' | 'PREFERENCE' | 'APPOINTMENT' | 'FEEDBACK',
    content: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/notes?clientId=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las notas');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotes(data.data || []);
      } else {
        throw new Error(data.error || 'Error al cargar las notas');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast.error('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('El contenido de la nota es requerido');
      return;
    }

    try {
      setSubmitting(true);

      if (editingNote) {
        // Update existing note
        const response = await fetch(`/api/clients/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            content: formData.content,
            isPrivate: formData.isPrivate,
          }),
        });

        if (!response.ok) throw new Error('Error al actualizar la nota');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al actualizar la nota');

        toast.success('Nota actualizada correctamente');
      } else {
        // Create new note
        const response = await fetch('/api/clients/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            userId,
            type: formData.type,
            content: formData.content,
            isPrivate: formData.isPrivate,
          }),
        });

        if (!response.ok) throw new Error('Error al crear la nota');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al crear la nota');

        toast.success('Nota creada correctamente');
      }

      // Reset form and refresh notes
      setFormData({ type: 'GENERAL', content: '', isPrivate: false });
      setIsAdding(false);
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar la nota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note: ClientNote) => {
    setEditingNote(note);
    setFormData({
      type: note.type,
      content: note.content,
      isPrivate: note.isPrivate,
    });
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/clients/notes/${deletingNoteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar la nota');

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar la nota');

      toast.success('Nota eliminada correctamente');
      setDeletingNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Error al eliminar la nota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingNote(null);
    setFormData({ type: 'GENERAL', content: '', isPrivate: false });
  };

  const getNoteTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      GENERAL: 'General',
      MEDICAL: 'Médica',
      PREFERENCE: 'Preferencia',
      APPOINTMENT: 'Cita',
      FEEDBACK: 'Comentario',
    };
    return types[type] || type;
  };

  const getNoteTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: 'bg-gray-100 text-gray-800',
      MEDICAL: 'bg-red-100 text-red-800',
      PREFERENCE: 'bg-blue-100 text-blue-800',
      APPOINTMENT: 'bg-green-100 text-green-800',
      FEEDBACK: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Cargando notas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas del Cliente
          </CardTitle>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Nota
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Nota</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="MEDICAL">Médica</SelectItem>
                    <SelectItem value="PREFERENCE">Preferencia</SelectItem>
                    <SelectItem value="APPOINTMENT">Cita</SelectItem>
                    <SelectItem value="FEEDBACK">Comentario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Nota Privada
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contenido</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe tu nota aquí..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>{editingNote ? 'Actualizar' : 'Crear'} Nota</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay notas registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getNoteTypeBadgeColor(note.type)}>
                      {getNoteTypeLabel(note.type)}
                    </Badge>
                    {note.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privada
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingNoteId(note.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t">
                  <span>
                    Por: {note.user?.firstName} {note.user?.lastName}
                  </span>
                  <span>•</span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La nota será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
