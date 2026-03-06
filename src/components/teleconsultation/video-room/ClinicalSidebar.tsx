import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Stethoscope,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  Download,
  Image,
  FileIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Calendar,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import {
  useTeleconsultationNotes,
  useCreateNote,
  useDeleteNote,
  useTeleconsultationDocuments,
  useShareDocument,
  useMarkDocumentAsViewed,
} from '@/hooks/data/useTeleconsultation';
import { supabase } from '@/integrations/supabase/client';
import { TeleconsultationConsultationPanel } from './TeleconsultationConsultationPanel';
import type { TeleconsultationWithRelations, ParticipantType, TeleconsultationDocument } from '@/types/teleconsultation';

export type SidebarMode = 'compact' | 'consultation';

interface ClinicalSidebarProps {
  teleconsultationId: string;
  teleconsultation: TeleconsultationWithRelations;
  participantType: ParticipantType;
  isOpen: boolean;
  onToggle: () => void;
  sidebarMode: SidebarMode;
  onToggleMode: () => void;
}

export function ClinicalSidebar({
  teleconsultationId,
  teleconsultation: tc,
  participantType,
  isOpen,
  onToggle,
  sidebarMode,
  onToggleMode,
}: ClinicalSidebarProps) {
  const [noteContent, setNoteContent] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const isPractitioner = participantType === 'practitioner';

  // Notes hooks
  const { data: notes = [] } = useTeleconsultationNotes(teleconsultationId);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();

  // Documents hooks
  const { data: documents = [] } = useTeleconsultationDocuments(teleconsultationId);
  const shareDocumentMutation = useShareDocument();
  const markAsViewedMutation = useMarkDocumentAsViewed();

  const patientAge = tc.patient?.dateOfBirth
    ? differenceInYears(new Date(), new Date(tc.patient.dateOfBirth))
    : null;

  // Note handlers
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await createNoteMutation.mutateAsync({
        teleconsultation_id: teleconsultationId,
        content: noteContent.trim(),
        note_type: 'consultation',
        is_private: true,
      });
      setNoteContent('');
    } catch {
      toast.error('Erreur lors de l\'ajout de la note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Document upload - works with or without Supabase auth
  const handleFilesSelected = async (files: File[]) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || 'demo-user';

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 10MB)`);
        continue;
      }

      setUploadingFiles((prev) => new Set(prev).add(file.name));

      try {
        let documentId = `doc_local_${Date.now()}`;
        let documentUrl = URL.createObjectURL(file);

        // Try Supabase storage upload first
        try {
          const fileName = `${teleconsultationId}/${Date.now()}-${file.name}`;
          const filePath = `teleconsultations/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filePath);

            const { data: documentData, error: docError } = await supabase
              .from('documents')
              .insert({
                title: file.name,
                file_path: filePath,
                file_type: file.type,
                file_size: file.size,
                url: urlData.publicUrl,
                patient_id: null,
                category: 'teleconsultation',
                uploaded_by: userId,
              })
              .select('id')
              .single();

            if (!docError && documentData) {
              documentId = documentData.id;
              documentUrl = urlData.publicUrl;
            }
          }
        } catch (storageError) {
          console.warn('[ClinicalSidebar] Supabase storage unavailable, using local fallback:', storageError);
        }

        // Share the document (service handles mock fallback automatically)
        await shareDocumentMutation.mutateAsync({
          teleconsultation_id: teleconsultationId,
          document_id: documentId,
          shared_by: participantType,
          shared_by_id: userId,
          share_type: 'during_consultation',
        });

        toast.success(`${file.name} partage`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Erreur: ${file.name}`);
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesSelected,
    disabled: !isPractitioner,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const getDocumentIcon = (doc: TeleconsultationDocument) => {
    const type = doc.document?.file_type || '';
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return FileIcon;
  };

  return (
    <div className="relative flex-shrink-0 h-full">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-gray-700 hover:bg-gray-600 text-white rounded-l-md flex items-center justify-center transition-colors"
        title={isOpen ? 'Fermer le panneau clinique' : 'Ouvrir le panneau clinique'}
      >
        {isOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>

      <div
        className={cn(
          'h-full border-l border-gray-700 bg-gray-800 flex flex-col transition-all duration-300 overflow-hidden',
          !isOpen ? 'w-0' : sidebarMode === 'consultation' ? 'w-[700px]' : 'w-[380px]'
        )}
      >
        {/* Mode toggle button for practitioner */}
        {isPractitioner && isOpen && (
          <div className="flex-shrink-0 border-b border-gray-700 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              {sidebarMode === 'consultation' ? 'Mode consultation' : 'Panneau clinique'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] gap-1 text-gray-400 hover:text-white px-2"
              onClick={onToggleMode}
            >
              {sidebarMode === 'consultation' ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  Compact
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  Consultation
                </>
              )}
            </Button>
          </div>
        )}

        {/* Consultation mode: show full consultation panel */}
        {sidebarMode === 'consultation' && isPractitioner ? (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Consultation panel (flexible width) */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 border-r border-gray-700">
              <TeleconsultationConsultationPanel
                teleconsultation={tc}
                teleconsultationId={teleconsultationId}
              />
            </div>

            {/* Right: Notes & Documents (320px) */}
            <div className="w-[320px] flex flex-col overflow-hidden min-h-0">
              <Tabs defaultValue="notes" className="flex flex-col h-full">
                <div className="flex-shrink-0 border-b border-gray-700 px-2 pt-1.5">
                  <TabsList className="w-full bg-gray-700/50 h-7">
                    <TabsTrigger value="notes" className="flex-1 text-[11px] text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-5">
                      Notes ({notes.length})
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="flex-1 text-[11px] text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-5">
                      Docs ({documents.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Notes tab (reuse existing notes content) */}
                <TabsContent value="notes" className="flex-1 flex flex-col mt-0 overflow-hidden">
                  {isPractitioner && (
                    <div className="flex-shrink-0 p-2 border-b border-gray-700">
                      <Textarea
                        placeholder="Ajouter une note..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="h-16 resize-none text-xs bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote();
                        }}
                      />
                      <div className="flex items-center justify-end mt-1">
                        <Button
                          size="sm"
                          className="h-6 text-[11px] gap-1"
                          onClick={handleAddNote}
                          disabled={!noteContent.trim() || createNoteMutation.isPending}
                        >
                          {createNoteMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  )}
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1.5">
                      {notes.length === 0 ? (
                        <div className="text-center py-6">
                          <FileText className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                          <p className="text-[11px] text-gray-500">Aucune note</p>
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="bg-gray-700/50 rounded p-2 group">
                            <p className="text-xs text-gray-200 whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-gray-500">
                                {format(new Date(note.created_at), 'HH:mm', { locale: fr })}
                              </span>
                              {isPractitioner && (
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Documents tab (compact version) */}
                <TabsContent value="docs" className="flex-1 overflow-hidden mt-0">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1.5">
                      {documents.length === 0 ? (
                        <div className="text-center py-6">
                          <FolderOpen className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                          <p className="text-[11px] text-gray-500">Aucun document</p>
                        </div>
                      ) : (
                        documents.map((doc) => {
                          if (!doc.document) return null;
                          const DocIcon = getDocumentIcon(doc);
                          return (
                            <div key={doc.id} className="bg-gray-700/50 rounded p-2 flex items-center gap-2">
                              <DocIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-200 truncate flex-1">{doc.document.title}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
        /* Compact mode: original 3-tab layout */
        <Tabs defaultValue="dossier" className="flex-1 flex flex-col min-h-0">
          {/* Tab headers */}
          <div className="flex-shrink-0 border-b border-gray-700 px-3 pt-2">
            <TabsList className="w-full bg-gray-700/50 h-8">
              <TabsTrigger value="dossier" className="flex-1 text-xs text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-6">
                Dossier
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 text-xs text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-6">
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex-1 text-xs text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-6">
                Documents ({documents.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Dossier patient */}
          <TabsContent value="dossier" className="flex-1 overflow-y-auto mt-0 p-4">
            <div className="space-y-4">
              {/* Patient identity */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {(tc.patient?.firstName?.[0] || '') + (tc.patient?.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {tc.patient?.firstName} {tc.patient?.lastName}
                    </p>
                    {patientAge !== null && (
                      <p className="text-xs text-gray-400">{patientAge} ans</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {tc.patient?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm text-gray-300">{tc.patient.phone}</span>
                    </div>
                  )}
                  {tc.patient?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm text-gray-400 truncate">{tc.patient.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Clinical context */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Contexte clinique
                </h4>
                {tc.consultation_reason && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Stethoscope className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500">Motif</span>
                    </div>
                    <p className="text-sm text-gray-200 pl-5">{tc.consultation_reason}</p>
                  </div>
                )}
                {tc.chief_complaint && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <FileText className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500">Plainte principale</span>
                    </div>
                    <p className="text-sm text-gray-200 pl-5">{tc.chief_complaint}</p>
                  </div>
                )}
                {!tc.consultation_reason && !tc.chief_complaint && (
                  <p className="text-sm text-gray-500 italic">Aucun contexte renseigne</p>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Session info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Session
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {format(new Date(tc.scheduled_start), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                  {tc.patient && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open(`/patients/${tc.patient_id}`, '_blank')}
                    >
                      Ouvrir le dossier complet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Notes */}
          <TabsContent value="notes" className="flex-1 flex flex-col mt-0 overflow-hidden">
            {/* Note input */}
            {isPractitioner && (
              <div className="flex-shrink-0 p-3 border-b border-gray-700">
                <Textarea
                  placeholder="Ajouter une note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="h-20 resize-none text-sm bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleAddNote();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-500">Ctrl+Enter pour ajouter</span>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || createNoteMutation.isPending}
                  >
                    {createNoteMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Ajouter
                  </Button>
                </div>
              </div>
            )}

            {/* Notes list */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Aucune note</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-700/50 rounded-md p-2.5 group"
                    >
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-gray-500">
                          {format(new Date(note.created_at), 'HH:mm', { locale: fr })}
                        </span>
                        {isPractitioner && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab: Documents */}
          <TabsContent value="documents" className="flex-1 flex flex-col mt-0 overflow-hidden">
            {/* Upload zone */}
            {isPractitioner && (
              <div className="flex-shrink-0 p-3 border-b border-gray-700">
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-600 hover:border-gray-500'
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 mx-auto mb-1.5 text-gray-500" />
                  <p className="text-xs font-medium text-gray-300">
                    {isDragActive ? 'Deposez ici' : 'Glissez ou cliquez'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">PDF, Images, Word (max 10MB)</p>
                </div>

                {uploadingFiles.size > 0 && (
                  <div className="mt-2 space-y-1">
                    {Array.from(uploadingFiles).map((fileName) => (
                      <div key={fileName} className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="truncate">{fileName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents list */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Aucun document</p>
                  </div>
                ) : (
                  documents.map((doc) => {
                    if (!doc.document) return null;
                    const DocIcon = getDocumentIcon(doc);
                    const isViewedByMe =
                      (isPractitioner && doc.viewed_by_practitioner) ||
                      (!isPractitioner && doc.viewed_by_patient);

                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          'bg-gray-700/50 rounded-md p-2.5 cursor-pointer hover:bg-gray-700 transition-colors',
                          !isViewedByMe && 'border border-primary/40'
                        )}
                        onClick={() => {
                          if (!isViewedByMe) {
                            markAsViewedMutation.mutate({
                              documentShareId: doc.id,
                              viewedBy: participantType,
                            });
                          }
                          if (doc.document?.url) {
                            window.open(doc.document.url, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <DocIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 truncate">{doc.document.title}</p>
                            <p className="text-[10px] text-gray-500">
                              {(doc.document.file_size / 1024).toFixed(0)} KB
                              {' - '}
                              {format(new Date(doc.shared_at), 'HH:mm', { locale: fr })}
                            </p>
                          </div>
                          <Download className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}
