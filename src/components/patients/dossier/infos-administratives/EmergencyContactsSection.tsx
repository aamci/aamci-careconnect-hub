/**
 * EmergencyContactsSection - Gestion des contacts d'urgence patient
 *
 * P0-008: Section structurée pour les contacts d'urgence
 *
 * Fonctionnalités:
 * - Personne de confiance (obligatoire si hospitalisé)
 * - Contacts d'urgence avec relation et priorité
 * - Tuteur légal si applicable
 * - Médecin traitant comme contact médical d'urgence
 */

import React, { useState } from 'react';
import {
  Phone,
  User,
  UserCheck,
  Shield,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Edit2,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
export interface EmergencyContact {
  id: string;
  firstName: string;
  lastName: string;
  relationship: ContactRelationship;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  isTrustedPerson: boolean; // Personne de confiance
  isLegalGuardian: boolean; // Tuteur légal
  priority: number; // 1 = primary contact
  notes?: string;
}

export type ContactRelationship =
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'friend'
  | 'neighbor'
  | 'colleague'
  | 'legal_guardian'
  | 'other';

const RELATIONSHIP_LABELS: Record<ContactRelationship, string> = {
  spouse: 'Conjoint(e)',
  parent: 'Parent',
  child: 'Enfant',
  sibling: 'Frère/Sœur',
  grandparent: 'Grand-parent',
  grandchild: 'Petit-enfant',
  friend: 'Ami(e)',
  neighbor: 'Voisin(e)',
  colleague: 'Collègue',
  legal_guardian: 'Tuteur légal',
  other: 'Autre',
};

interface EmergencyContactsSectionProps {
  patientId?: string;
  contacts?: EmergencyContact[];
  onChange?: (contacts: EmergencyContact[]) => void;
  readOnly?: boolean;
}

const EmergencyContactsSection: React.FC<EmergencyContactsSectionProps> = ({
  patientId,
  contacts: initialContacts = [],
  onChange,
  readOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get trusted person
  const trustedPerson = contacts.find((c) => c.isTrustedPerson);
  const legalGuardian = contacts.find((c) => c.isLegalGuardian);
  const primaryContact = contacts.find((c) => c.priority === 1);

  // Open dialog for new or edit
  const handleAddContact = () => {
    setEditingContact({
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      relationship: 'other',
      phone: '',
      isTrustedPerson: false,
      isLegalGuardian: false,
      priority: contacts.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact({ ...contact });
    setIsDialogOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    const newContacts = contacts.filter((c) => c.id !== contactId);
    // Reorder priorities
    const reordered = newContacts.map((c, idx) => ({ ...c, priority: idx + 1 }));
    setContacts(reordered);
    onChange?.(reordered);
    toast.success('Contact supprimé');
  };

  const handleSaveContact = () => {
    if (!editingContact) return;

    // Validation
    if (!editingContact.firstName.trim() || !editingContact.lastName.trim()) {
      toast.error('Nom et prénom requis');
      return;
    }
    if (!editingContact.phone.trim()) {
      toast.error('Numéro de téléphone requis');
      return;
    }

    const isNew = !contacts.find((c) => c.id === editingContact.id);
    let newContacts: EmergencyContact[];

    if (isNew) {
      newContacts = [...contacts, editingContact];
    } else {
      newContacts = contacts.map((c) =>
        c.id === editingContact.id ? editingContact : c
      );
    }

    // If setting as trusted person, unset others
    if (editingContact.isTrustedPerson) {
      newContacts = newContacts.map((c) => ({
        ...c,
        isTrustedPerson: c.id === editingContact.id,
      }));
    }

    // If setting as legal guardian, unset others
    if (editingContact.isLegalGuardian) {
      newContacts = newContacts.map((c) => ({
        ...c,
        isLegalGuardian: c.id === editingContact.id,
      }));
    }

    setContacts(newContacts);
    onChange?.(newContacts);
    setIsDialogOpen(false);
    setEditingContact(null);
    toast.success(isNew ? 'Contact ajouté' : 'Contact modifié');
  };

  const handleSetPrimary = (contactId: string) => {
    const newContacts = contacts.map((c) => ({
      ...c,
      priority: c.id === contactId ? 1 : c.priority + 1,
    }));
    setContacts(newContacts);
    onChange?.(newContacts);
    toast.success('Contact principal défini');
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Contacts d'urgence
                </h3>
                <p className="text-xs text-muted-foreground">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''} enregistré{contacts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!trustedPerson && contacts.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Personne de confiance non définie
                </Badge>
              )}
              {contacts.length === 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Aucun contact
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <div className="p-4 space-y-3">
            {/* Contact List */}
            {contacts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun contact d'urgence enregistré</p>
                <p className="text-xs">Ajoutez au moins un contact pour les situations d'urgence</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      isPrimary={contact.priority === 1}
                      onEdit={() => handleEditContact(contact)}
                      onDelete={() => handleDeleteContact(contact.id)}
                      onSetPrimary={() => handleSetPrimary(contact.id)}
                      readOnly={readOnly}
                    />
                  ))}
              </div>
            )}

            {/* Add Button */}
            {!readOnly && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddContact}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un contact d'urgence
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact && contacts.find((c) => c.id === editingContact.id)
                ? 'Modifier le contact'
                : 'Ajouter un contact d\'urgence'}
            </DialogTitle>
            <DialogDescription>
              Les contacts d'urgence seront prévenus en cas de besoin médical.
            </DialogDescription>
          </DialogHeader>

          {editingContact && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={editingContact.firstName}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, firstName: e.target.value })
                    }
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={editingContact.lastName}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, lastName: e.target.value })
                    }
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relationship">Relation</Label>
                <Select
                  value={editingContact.relationship}
                  onValueChange={(val) =>
                    setEditingContact({
                      ...editingContact,
                      relationship: val as ContactRelationship,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={editingContact.phone}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, phone: e.target.value })
                    }
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneSecondary">Tél. secondaire</Label>
                  <Input
                    id="phoneSecondary"
                    value={editingContact.phoneSecondary || ''}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, phoneSecondary: e.target.value })
                    }
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingContact.email || ''}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, email: e.target.value })
                  }
                  placeholder="email@exemple.com"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTrustedPerson"
                    checked={editingContact.isTrustedPerson}
                    onCheckedChange={(checked) =>
                      setEditingContact({
                        ...editingContact,
                        isTrustedPerson: checked === true,
                      })
                    }
                  />
                  <div>
                    <Label htmlFor="isTrustedPerson" className="cursor-pointer">
                      Personne de confiance
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Sera consultée pour les décisions médicales importantes
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLegalGuardian"
                    checked={editingContact.isLegalGuardian}
                    onCheckedChange={(checked) =>
                      setEditingContact({
                        ...editingContact,
                        isLegalGuardian: checked === true,
                      })
                    }
                  />
                  <div>
                    <Label htmlFor="isLegalGuardian" className="cursor-pointer">
                      Tuteur légal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Responsable légal du patient (mineur ou sous tutelle)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveContact}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Contact Card Component
interface ContactCardProps {
  contact: EmergencyContact;
  isPrimary: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
  readOnly: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isPrimary,
  onEdit,
  onDelete,
  onSetPrimary,
  readOnly,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        isPrimary
          ? 'bg-primary/5 border-primary/20'
          : 'bg-muted/30 border-border'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
            contact.isTrustedPerson
              ? 'bg-green-100 text-green-700'
              : contact.isLegalGuardian
                ? 'bg-purple-100 text-purple-700'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {contact.isTrustedPerson ? (
            <UserCheck className="h-5 w-5" />
          ) : contact.isLegalGuardian ? (
            <Shield className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {contact.firstName} {contact.lastName}
            </span>
            {isPrimary && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                Principal
              </Badge>
            )}
            {contact.isTrustedPerson && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200">
                Confiance
              </Badge>
            )}
            {contact.isLegalGuardian && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
                Tuteur
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {RELATIONSHIP_LABELS[contact.relationship]}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`tel:${contact.phone}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              {contact.phone}
            </a>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {!isPrimary && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onSetPrimary}
              title="Définir comme contact principal"
            >
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsSection;
