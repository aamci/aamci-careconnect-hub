import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Inbox,
  Send as SendIcon,
  FileEdit,
  Archive,
  Trash2,
  Star,
  Paperclip,
  Search,
  MailPlus,
  Reply,
  ReplyAll,
  Forward,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCheck,
  Clock,
  MoreVertical,
  RefreshCcw,
  GripVertical,
  X,
  Bold,
  Italic,
  List,
  Link2,
  Pin,
  PinOff,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EmailFolder, EmailThread, EmailMessage, MessageAttachment } from '@/types/messaging';
import { mockEmailThreads, mockEmailFolders, currentUser, allParticipants } from '@/data/messagingMockData';
import { useToast } from '@/hooks/use-toast';

// ── Types ────────────────────────────────────────

type InlineReplyMode = 'reply' | 'reply-all' | 'forward' | null;

interface InlineReplyState {
  mode: InlineReplyMode;
  messageId: string;
  to: string;
  subject: string;
  quotedBody: string;
  body: string;
  attachments: MessageAttachment[];
}

// ── Folder Icon Map ──────────────────────────────

const folderIcons: Record<EmailFolder, React.ElementType> = {
  inbox: Inbox,
  sent: SendIcon,
  drafts: FileEdit,
  archive: Archive,
  trash: Trash2,
};

// ── Props ────────────────────────────────────────

interface EmailModeProps {
  patientId?: string;
  className?: string;
}

// ── Main Component ───────────────────────────────

const EmailMode: React.FC<EmailModeProps> = ({ patientId, className }) => {
  const { toast } = useToast();

  // Data state
  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [threads, setThreads] = useState(mockEmailThreads);
  const [folders] = useState(mockEmailFolders);

  // Inline reply state (replaces ComposeDialog modal)
  const [inlineReply, setInlineReply] = useState<InlineReplyState | null>(null);

  // Compose new message state
  const [showNewCompose, setShowNewCompose] = useState(false);
  const [newComposeTo, setNewComposeTo] = useState('');
  const [newComposeSubject, setNewComposeSubject] = useState('');
  const [newComposeBody, setNewComposeBody] = useState('');

  // Folder sidebar collapse + pin
  const [folderCollapsed, setFolderCollapsed] = useState(false);
  const [folderPinned, setFolderPinned] = useState(false);

  // Resizable column widths
  const [folderWidth, setFolderWidth] = useState(200);
  const [listWidth, setListWidth] = useState(360);
  const resizingRef = useRef<'folder' | 'list' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Refs
  const readingPaneRef = useRef<HTMLDivElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Resize Handlers ──────────────────────────────

  const handleResizeStart = useCallback(
    (column: 'folder' | 'list', e: React.MouseEvent) => {
      e.preventDefault();
      resizingRef.current = column;
      startXRef.current = e.clientX;
      startWidthRef.current = column === 'folder' ? folderWidth : listWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizingRef.current) return;
        const delta = ev.clientX - startXRef.current;
        const newWidth = Math.max(
          resizingRef.current === 'folder' ? 140 : 260,
          Math.min(
            resizingRef.current === 'folder' ? 320 : 520,
            startWidthRef.current + delta
          )
        );
        if (resizingRef.current === 'folder') setFolderWidth(newWidth);
        else setListWidth(newWidth);
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [folderWidth, listWidth]
  );

  // ── Filtered Threads ─────────────────────────────

  const filteredThreads = useMemo(() => {
    return threads
      .filter((t) => {
        const inFolder =
          activeFolder === 'inbox'
            ? t.folder === 'inbox'
            : t.folder === activeFolder || t.messages.some((m) => m.folder === activeFolder);
        const matchesSearch = searchQuery
          ? `${t.subject} ${t.participants.map((p) => p.name).join(' ')}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
        return inFolder && matchesSearch;
      })
      .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
  }, [threads, activeFolder, searchQuery]);

  const selectedThread = selectedThreadId
    ? threads.find((t) => t.id === selectedThreadId)
    : null;

  // ── Thread Actions ───────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStar = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isStarred: !t.isStarred } : t))
    );
  };

  const handleMarkRead = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, isRead: true })) }
          : t
      )
    );
  };

  const handleArchive = useCallback(
    (threadId: string) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, folder: 'archive' as EmailFolder } : t))
      );
      toast({ title: 'Message archive' });
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setInlineReply(null);
      }
    },
    [selectedThreadId, toast]
  );

  const handleDelete = useCallback(
    (threadId: string) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, folder: 'trash' as EmailFolder } : t))
      );
      toast({ title: 'Message supprime' });
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setInlineReply(null);
      }
    },
    [selectedThreadId, toast]
  );

  const handleRestore = useCallback(
    (threadId: string) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, folder: 'inbox' as EmailFolder } : t))
      );
      toast({ title: 'Message restaure dans la boite de reception' });
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setInlineReply(null);
      }
    },
    [selectedThreadId, toast]
  );

  const handleBulkAction = (action: 'archive' | 'delete' | 'read' | 'restore') => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      if (action === 'archive') handleArchive(id);
      else if (action === 'delete') handleDelete(id);
      else if (action === 'read') handleMarkRead(id);
      else if (action === 'restore') handleRestore(id);
    });
    setSelectedIds([]);
  };

  // ── Contact Suggestions ────────────────────────────

  const [focusedToField, setFocusedToField] = useState<'new' | 'reply' | null>(null);

  const availableContacts = useMemo(
    () => allParticipants.filter((p) => p.id !== currentUser.id),
    []
  );

  const getContactSuggestions = useCallback(
    (query: string) => {
      const lastPart = query.split(',').pop()?.trim().toLowerCase() || '';
      if (lastPart.length < 1) return [];
      return availableContacts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(lastPart) ||
            p.email.toLowerCase().includes(lastPart)
        )
        .slice(0, 6);
    },
    [availableContacts]
  );

  // ── Inline Reply Actions ─────────────────────────

  const handleInlineReply = useCallback(
    (msg: EmailMessage, mode: 'reply' | 'reply-all' | 'forward') => {
      const sender = msg.from.id === currentUser.id ? msg.to[0] : msg.from;
      const quotedBody = `\n\n---\nLe ${new Date(msg.date).toLocaleDateString('fr-FR')}, ${sender.name} a ecrit :\n> ${msg.body
        .split('\n')
        .join('\n> ')}`;

      let to = '';
      let subject = msg.subject;

      if (mode === 'reply') {
        to = sender.email;
        subject = msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`;
      } else if (mode === 'reply-all') {
        const allRecipients = [
          sender,
          ...msg.to.filter((p) => p.id !== currentUser.id),
          ...(msg.cc || []).filter((p) => p.id !== currentUser.id),
        ];
        to = allRecipients.map((p) => p.email).join(', ');
        subject = msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`;
      } else {
        to = '';
        subject = msg.subject.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject}`;
      }

      setInlineReply({
        mode,
        messageId: msg.id,
        to,
        subject,
        quotedBody,
        body: '',
        attachments: mode === 'forward' ? [...msg.attachments] : [],
      });

      // Focus the textarea after render
      setTimeout(() => {
        replyTextareaRef.current?.focus();
        // Scroll reading pane to bottom
        if (readingPaneRef.current) {
          readingPaneRef.current.scrollTop = readingPaneRef.current.scrollHeight;
        }
      }, 100);
    },
    []
  );

  const handleSendInlineReply = useCallback(() => {
    if (!inlineReply || !inlineReply.to || !inlineReply.body.trim()) {
      toast({ title: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }
    toast({ title: 'Message envoye', description: `A : ${inlineReply.to}` });
    setInlineReply(null);
  }, [inlineReply, toast]);

  const handleDiscardInlineReply = useCallback(() => {
    setInlineReply(null);
  }, []);

  // ── New Compose (inline at top of reading pane) ──

  const handleSendNewCompose = useCallback(() => {
    if (!newComposeTo || !newComposeSubject || !newComposeBody.trim()) {
      toast({ title: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }
    toast({ title: 'Message envoye', description: `A : ${newComposeTo}` });
    setShowNewCompose(false);
    setNewComposeTo('');
    setNewComposeSubject('');
    setNewComposeBody('');
  }, [newComposeTo, newComposeSubject, newComposeBody, toast]);

  // ── Keyboard Shortcuts ───────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (!selectedThread) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const lastMsg = selectedThread.messages[selectedThread.messages.length - 1];
        handleInlineReply(lastMsg, e.shiftKey ? 'reply-all' : 'reply');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const lastMsg = selectedThread.messages[selectedThread.messages.length - 1];
        handleInlineReply(lastMsg, 'forward');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleArchive(selectedThread.id);
      } else if (e.key === 'Delete') {
        e.preventDefault();
        handleDelete(selectedThread.id);
      } else if (e.key === 'Escape' && inlineReply) {
        e.preventDefault();
        handleDiscardInlineReply();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedThread, inlineReply, handleInlineReply, handleArchive, handleDelete, handleDiscardInlineReply]);

  // ── Date Formatting ──────────────────────────────

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday)
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThreadSender = (thread: EmailThread) => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    return lastMsg.from.id === currentUser.id
      ? thread.participants.find((p) => p.id !== currentUser.id)!
      : lastMsg.from;
  };

  // ── Render ───────────────────────────────────────

  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      {/* ─── Column 1: Folder Sidebar (collapsible + pinnable) ─── */}
      <div
        className={cn(
          'border-r border-border flex flex-col bg-muted/20 flex-shrink-0 overflow-hidden',
          'transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          selectedThreadId ? 'hidden lg:flex' : 'hidden md:flex'
        )}
        style={{ width: folderCollapsed ? 52 : folderWidth }}
      >
        {folderCollapsed ? (
          /* ── Collapsed: icon-only strip with expand button ── */
          <div className="flex flex-col items-center py-2 gap-1 h-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary hover:bg-primary/10"
              onClick={() => setFolderCollapsed(false)}
              title="Deployer le volet"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setSelectedThreadId(null);
                setInlineReply(null);
                setShowNewCompose(true);
                setFolderCollapsed(false);
              }}
              title="Nouveau message"
            >
              <MailPlus className="h-4 w-4" />
            </Button>
            <div className="w-8 h-px bg-border my-1" />
            <nav className="flex-1 flex flex-col items-center gap-0.5 overflow-y-auto w-full px-1.5">
              {folders.map((folder) => {
                const Icon = folderIcons[folder.id];
                const isActive = activeFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveFolder(folder.id);
                      setSelectedThreadId(null);
                      setSelectedIds([]);
                      setInlineReply(null);
                      setShowNewCompose(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-center p-2.5 rounded-lg transition-colors relative',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                    title={folder.label}
                  >
                    <Icon className="h-4 w-4" />
                    {folder.unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ) : (
          /* ── Expanded: full sidebar with Rabattre + Pin ── */
          <div className="flex flex-col h-full" style={{ minWidth: folderWidth }}>
            {/* Toolbar: Rabattre + Epingler */}
            <div className="flex items-center justify-between px-2 pt-2 pb-1">
              {!folderPinned ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setFolderCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Rabattre
                </Button>
              ) : (
                <span className="text-[10px] text-primary font-medium px-2 flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  Epingle
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 transition-colors',
                  folderPinned
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => setFolderPinned(!folderPinned)}
                title={folderPinned ? 'Detacher (permettre de rabattre)' : 'Epingler le volet ouvert'}
              >
                {folderPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </Button>
            </div>
            {/* New message */}
            <div className="px-3 pb-2">
              <Button
                onClick={() => {
                  setSelectedThreadId(null);
                  setInlineReply(null);
                  setShowNewCompose(true);
                }}
                className="w-full gap-2"
              >
                <MailPlus className="h-4 w-4" />
                Nouveau message
              </Button>
            </div>
            {/* Folders */}
            <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
              {folders.map((folder) => {
                const Icon = folderIcons[folder.id];
                const isActive = activeFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveFolder(folder.id);
                      setSelectedThreadId(null);
                      setSelectedIds([]);
                      setInlineReply(null);
                      setShowNewCompose(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{folder.label}</span>
                    {folder.unreadCount > 0 && (
                      <Badge className="h-5 min-w-[20px] justify-center text-xs">
                        {folder.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            {/* Keyboard shortcuts hint */}
            <div className="p-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-nowrap">
                R Repondre | Shift+R Tous | F Transferer | A Archiver | Suppr
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Resize Handle: Folder | List (only when expanded) ─── */}
      {!folderCollapsed && (
        <div
          className="w-1 flex-shrink-0 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors hidden md:flex items-center justify-center"
          onMouseDown={(e) => handleResizeStart('folder', e)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        </div>
      )}

      {/* ─── Column 2: Thread List (resizable) ─── */}
      <div
        className={cn(
          'border-r border-border flex flex-col flex-shrink-0',
          selectedThreadId ? 'hidden md:flex' : 'flex flex-1 md:flex-none'
        )}
        style={{ width: listWidth }}
      >
        {/* Search + bulk actions */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toast({ title: 'Actualise' })}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-2">
                {selectedIds.length} sel.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleBulkAction('read')}
              >
                Lu
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleBulkAction('archive')}
              >
                Archiver
              </Button>
              {activeFolder === 'trash' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() => handleBulkAction('restore')}
                >
                  Restaurer
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => handleBulkAction('delete')}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Mobile folder selector */}
        <div className="md:hidden flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
          {folders.map((f) => (
            <Button
              key={f.id}
              variant={activeFolder === f.id ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs flex-shrink-0"
              onClick={() => {
                setActiveFolder(f.id);
                setSelectedIds([]);
              }}
            >
              {f.label}
              {f.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {f.unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Thread items */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun message dans ce dossier.</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const sender = getThreadSender(thread);
              const isSelected = selectedThreadId === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setSelectedThreadId(thread.id);
                    handleMarkRead(thread.id);
                    setInlineReply(null);
                    setShowNewCompose(false);
                  }}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors',
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/40',
                    thread.unreadCount > 0 && !isSelected && 'bg-blue-50/50'
                  )}
                >
                  <Checkbox
                    checked={selectedIds.includes(thread.id)}
                    onCheckedChange={() => toggleSelect(thread.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStar(thread.id);
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        thread.isStarred
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/40 hover:text-amber-400'
                      )}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          'text-sm truncate',
                          thread.unreadCount > 0 ? 'font-semibold' : 'font-medium'
                        )}
                      >
                        {sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDate(thread.lastMessageDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {lastMsg.priority === 'high' && (
                        <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                      )}
                      <p
                        className={cn(
                          'text-sm truncate',
                          thread.unreadCount > 0
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {thread.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {lastMsg.body.split('\n')[0].substring(0, 80)}
                      </p>
                      {thread.hasAttachments && (
                        <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                      {thread.messages.length > 1 && (
                        <Badge variant="outline" className="text-xs h-4 px-1 flex-shrink-0">
                          {thread.messages.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Resize Handle: List | Reading Pane ─── */}
      <div
        className="w-1 flex-shrink-0 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors hidden md:flex items-center justify-center"
        onMouseDown={(e) => handleResizeStart('list', e)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      </div>

      {/* ─── Column 3: Reading Pane ─── */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !selectedThreadId && !showNewCompose ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* New compose (inline, not modal) */}
        {showNewCompose && !selectedThread ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setShowNewCompose(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-semibold">Nouveau message</h2>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewCompose(false);
                  setNewComposeTo('');
                  setNewComposeSubject('');
                  setNewComposeBody('');
                }}
              >
                Annuler
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-muted-foreground">A</label>
                <Input
                  value={newComposeTo}
                  onChange={(e) => setNewComposeTo(e.target.value)}
                  placeholder="Nom ou email du destinataire..."
                  className="h-8 text-sm"
                  onFocus={() => setFocusedToField('new')}
                  onBlur={() => setTimeout(() => setFocusedToField(null), 150)}
                />
                {focusedToField === 'new' && getContactSuggestions(newComposeTo).length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {getContactSuggestions(newComposeTo).map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setNewComposeTo(contact.email);
                          setFocusedToField(null);
                        }}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={cn('text-[10px]', contact.avatarColor || 'bg-primary/10 text-primary')}>
                            {contact.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Objet</label>
                <Input
                  value={newComposeSubject}
                  onChange={(e) => setNewComposeSubject(e.target.value)}
                  placeholder="Objet du message"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 border border-border rounded-t-lg px-2 py-1.5 bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Link2 className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Paperclip className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea
                value={newComposeBody}
                onChange={(e) => setNewComposeBody(e.target.value)}
                placeholder="Redigez votre message..."
                rows={12}
                className="rounded-t-none -mt-3 min-h-[200px] resize-y"
              />
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground italic whitespace-pre-line">
                  {'Dr Martin Dupont\nMedecine Generale\nCareConnect Hub - Centre Medical\nTel: 01 23 45 67 89'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast({ title: 'Brouillon enregistre' });
                  setShowNewCompose(false);
                }}
              >
                Brouillon
              </Button>
              <Button size="sm" onClick={handleSendNewCompose} disabled={!newComposeTo || !newComposeSubject}>
                <SendIcon className="h-3.5 w-3.5 mr-1.5" />
                Envoyer
              </Button>
            </div>
          </div>
        ) : selectedThread ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => {
                  setSelectedThreadId(null);
                  setInlineReply(null);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold truncate">{selectedThread.subject}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedThread.messages.length} message
                  {selectedThread.messages.length > 1 ? 's' : ''} -{' '}
                  {selectedThread.participants
                    .filter((p) => p.id !== currentUser.id)
                    .map((p) => p.name)
                    .join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {selectedThread.folder === 'trash' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
                    onClick={() => handleRestore(selectedThread.id)}
                    title="Restaurer dans la boite de reception"
                  >
                    <Undo2 className="h-4 w-4" />
                    Restaurer
                  </Button>
                )}
                {selectedThread.folder !== 'trash' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleArchive(selectedThread.id)}
                    title="Archiver (A)"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(selectedThread.id)}
                  title={selectedThread.folder === 'trash' ? 'Supprimer definitivement' : 'Supprimer (Suppr)'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStar(selectedThread.id)}>
                      {selectedThread.isStarred
                        ? 'Retirer des favoris'
                        : 'Marquer comme favori'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkRead(selectedThread.id)}>
                      Marquer comme lu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {selectedThread.folder === 'trash' ? (
                      <DropdownMenuItem onClick={() => handleRestore(selectedThread.id)}>
                        Restaurer
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleArchive(selectedThread.id)}>
                        Archiver
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages + inline reply */}
            <div ref={readingPaneRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map((msg, idx) => (
                <div key={msg.id} className="border border-border rounded-lg">
                  {/* Message header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border rounded-t-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={cn(
                          'text-xs font-medium',
                          msg.from.avatarColor || 'bg-primary/10 text-primary'
                        )}
                      >
                        {msg.from.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.from.name}</span>
                        {msg.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs h-4">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A : {msg.to.map((p) => p.name).join(', ')}
                        {msg.cc &&
                          msg.cc.length > 0 &&
                          ` | Cc : ${msg.cc.map((p) => p.name).join(', ')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {msg.hasReadReceipt && msg.readAt && (
                        <span
                          className="text-xs text-muted-foreground flex items-center gap-1"
                          title={`Lu le ${formatFullDate(msg.readAt)}`}
                        >
                          <CheckCheck className="h-3 w-3 text-primary" />
                        </span>
                      )}
                      {msg.hasReadReceipt && !msg.readAt && (
                        <span
                          className="text-xs text-muted-foreground flex items-center gap-1"
                          title="Non lu"
                        >
                          <Clock className="h-3 w-3" />
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatFullDate(msg.date)}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="px-4 py-4">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </div>
                    {/* Attachments */}
                    {msg.attachments.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {msg.attachments.length} piece
                          {msg.attachments.length > 1 ? 's' : ''} jointe
                          {msg.attachments.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.attachments.map((att) => (
                            <button
                              key={att.id}
                              className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                              onClick={() =>
                                toast({
                                  title: 'Telechargement lance',
                                  description: att.name,
                                })
                              }
                            >
                              <Paperclip className="h-3.5 w-3.5 text-primary" />
                              <div className="text-left">
                                <p className="text-xs font-medium">{att.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(att.size / 1024).toFixed(0)} Ko
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Per-message action buttons (reply/forward) */}
                  <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => handleInlineReply(msg, 'reply')}
                      title="Repondre (R)"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Repondre
                    </Button>
                    {msg.to.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => handleInlineReply(msg, 'reply-all')}
                        title="Repondre a tous (Shift+R)"
                      >
                        <ReplyAll className="h-3.5 w-3.5" />
                        Tous
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => handleInlineReply(msg, 'forward')}
                      title="Transferer (F)"
                    >
                      <Forward className="h-3.5 w-3.5" />
                      Transferer
                    </Button>
                  </div>
                </div>
              ))}

              {/* ─── Inline Reply Panel (appears below messages) ─── */}
              {inlineReply && (
                <div className="border-2 border-primary/30 rounded-lg bg-card">
                  {/* Reply header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-primary/5 rounded-t-lg">
                    {inlineReply.mode === 'reply' && (
                      <Reply className="h-4 w-4 text-primary" />
                    )}
                    {inlineReply.mode === 'reply-all' && (
                      <ReplyAll className="h-4 w-4 text-primary" />
                    )}
                    {inlineReply.mode === 'forward' && (
                      <Forward className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-primary">
                      {inlineReply.mode === 'reply'
                        ? 'Repondre'
                        : inlineReply.mode === 'reply-all'
                        ? 'Repondre a tous'
                        : 'Transferer'}
                    </span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleDiscardInlineReply}
                      title="Annuler (Echap)"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* To field */}
                    <div className="flex items-center gap-2 relative">
                      <label className="text-xs font-medium text-muted-foreground w-8">A</label>
                      <div className="flex-1 relative">
                        <Input
                          value={inlineReply.to}
                          onChange={(e) =>
                            setInlineReply((prev) => (prev ? { ...prev, to: e.target.value } : prev))
                          }
                          className="h-8 text-sm"
                          placeholder={inlineReply.mode === 'forward' ? 'Nom ou email du destinataire...' : ''}
                          onFocus={() => setFocusedToField('reply')}
                          onBlur={() => setTimeout(() => setFocusedToField(null), 150)}
                        />
                        {focusedToField === 'reply' && getContactSuggestions(inlineReply.to).length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                            {getContactSuggestions(inlineReply.to).map((contact) => (
                              <button
                                key={contact.id}
                                type="button"
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setInlineReply((prev) => prev ? { ...prev, to: contact.email } : prev);
                                  setFocusedToField(null);
                                }}
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className={cn('text-[10px]', contact.avatarColor || 'bg-primary/10 text-primary')}>
                                    {contact.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{contact.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject (read-only for reply, editable for forward) */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground w-8">Obj</label>
                      <Input
                        value={inlineReply.subject}
                        onChange={(e) =>
                          setInlineReply((prev) => (prev ? { ...prev, subject: e.target.value } : prev))
                        }
                        className="h-8 text-sm flex-1"
                        readOnly={inlineReply.mode !== 'forward'}
                      />
                    </div>

                    {/* Formatting toolbar */}
                    <div className="flex items-center gap-1 border border-border rounded-t-lg px-2 py-1.5 bg-muted/30">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <List className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="h-4 w-px bg-border mx-1" />
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Body */}
                    <Textarea
                      ref={replyTextareaRef}
                      value={inlineReply.body}
                      onChange={(e) =>
                        setInlineReply((prev) => (prev ? { ...prev, body: e.target.value } : prev))
                      }
                      placeholder="Redigez votre reponse..."
                      rows={6}
                      className="rounded-t-none -mt-3 min-h-[120px] resize-y"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSendInlineReply();
                        }
                      }}
                    />

                    {/* Quoted text preview */}
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Message original
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap bg-muted/30 rounded p-2 text-xs leading-relaxed max-h-32 overflow-y-auto">
                        {inlineReply.quotedBody}
                      </pre>
                    </details>

                    {/* Forwarded attachments */}
                    {inlineReply.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {inlineReply.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5"
                          >
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium truncate max-w-[150px]">
                              {att.name}
                            </span>
                            <button
                              onClick={() =>
                                setInlineReply((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        attachments: prev.attachments.filter(
                                          (a) => a.id !== att.id
                                        ),
                                      }
                                    : prev
                                )
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Send / Discard */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button variant="ghost" size="sm" onClick={handleDiscardInlineReply}>
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendInlineReply}
                        disabled={!inlineReply.to || !inlineReply.body.trim()}
                      >
                        <SendIcon className="h-3.5 w-3.5 mr-1.5" />
                        Envoyer
                        <span className="ml-1.5 text-[10px] opacity-70">Ctrl+Entree</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Selectionnez un message</p>
              <p className="text-xs mt-1">
                Choisissez un message dans la liste pour le lire.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMode;
