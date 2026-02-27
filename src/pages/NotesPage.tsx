import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, Plus, Search, Edit, Trash2, Clock, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  isPinned: boolean;
}

const initialNotes: Note[] = [
  { id: '1', title: 'Suivi patient M. Bernard', content: 'Revoir les resultats d\'analyse sanguine avant le prochain RDV. Glycemie a surveiller.', date: '2026-02-26', category: 'Suivi', isPinned: true },
  { id: '2', title: 'Commande materiel', content: 'Commander des aiguilles pour prise de sang et des compresses steriles.', date: '2026-02-25', category: 'Administratif', isPinned: false },
  { id: '3', title: 'Formation DPC', content: 'S\'inscrire a la formation continue sur les nouvelles recommandations HAS.', date: '2026-02-24', category: 'Formation', isPinned: false },
  { id: '4', title: 'Protocole vaccination', content: 'Mettre a jour le protocole de vaccination grippe pour la saison prochaine.', date: '2026-02-23', category: 'Clinique', isPinned: false },
  { id: '5', title: 'Reunion equipe', content: 'Preparer l\'ordre du jour pour la reunion mensuelle de l\'equipe medicale.', date: '2026-02-22', category: 'Administratif', isPinned: false },
];

const categories = ['Suivi', 'Administratif', 'Formation', 'Clinique'];

const categoryColors: Record<string, string> = {
  'Suivi': 'bg-blue-100 text-blue-800',
  'Administratif': 'bg-amber-100 text-amber-800',
  'Formation': 'bg-purple-100 text-purple-800',
  'Clinique': 'bg-emerald-100 text-emerald-800',
};

const NotesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState('notes');
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'Suivi' });

  const filtered = notes
    .filter((n) => {
      const matchesSearch = `${n.title} ${n.content}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Toutes' || n.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.date.localeCompare(a.date);
    });

  const openEditDialog = (note: Note) => {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content, category: note.category });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    const today = new Date().toISOString().split('T')[0];
    if (editingId) {
      setNotes((prev) => prev.map((n) => n.id === editingId ? { ...n, ...form, date: today } : n));
      toast({ title: 'Note modifiee' });
    } else {
      const note: Note = { id: `note-${Date.now()}`, ...form, date: today, isPinned: false };
      setNotes((prev) => [note, ...prev]);
      toast({ title: 'Note creee' });
    }
    setShowDialog(false);
    setEditingId(null);
    setForm({ title: '', content: '', category: 'Suivi' });
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: 'Note supprimee' });
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {notes.length} note{notes.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle note
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['Toutes', ...categories].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="h-7 text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} note{filtered.length > 1 ? 's' : ''} trouvee{filtered.length > 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Aucune note trouvee.</p>
              <p className="text-xs mt-1">Creez votre premiere note pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((note) => (
                <Card
                  key={note.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => openEditDialog(note)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {note.isPinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                          <p className="text-sm font-semibold text-foreground">{note.title}</p>
                          <Badge variant="outline" className={`text-xs ${categoryColors[note.category] || ''}`}>
                            {note.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{note.date}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEditDialog(note)}>
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                            <Pin className="h-3.5 w-3.5 mr-2" />
                            {note.isPinned ? 'Desepingler' : 'Epingler'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(note.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingId(null); setForm({ title: '', content: '', category: 'Suivi' }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier la note' : 'Nouvelle note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Titre de la note"
              />
            </div>
            <div>
              <Label>Contenu</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Contenu de la note..."
                rows={6}
              />
            </div>
            <div>
              <Label>Categorie</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={form.category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className="h-7 text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content}>
              {editingId ? 'Enregistrer' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default NotesPage;
