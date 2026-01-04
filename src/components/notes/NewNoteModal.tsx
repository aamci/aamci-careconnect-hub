import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Patient } from '@/types';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: NoteFormData) => void;
  patient?: Patient | null;
  date?: Date;
}

interface NoteFormData {
  content: string;
  patientId?: string;
  sendToSecretariat: boolean;
  isUrgent: boolean;
}

const NewNoteModal: React.FC<NewNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patient,
  date = new Date(),
}) => {
  const [formData, setFormData] = React.useState<NoteFormData>({
    content: '',
    patientId: patient?.id,
    sendToSecretariat: false,
    isUrgent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim()) {
      onSave(formData);
      setFormData({
        content: '',
        patientId: patient?.id,
        sendToSecretariat: false,
        isUrgent: false,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-card rounded-2xl shadow-lg w-full max-w-lg border border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light">
                    <span className="text-lg">◄</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light">
                    <span className="text-lg">►</span>
                  </Button>
                  <h2 className="text-lg font-semibold ml-2">
                    Nouvelle note pour le {format(date, 'EEE. dd MMMM yyyy', { locale: fr })}
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Note Content */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Saisissez votre note ici..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Les notes sont visibles par l'équipe
                    </span>
                  </p>
                </div>

                {/* Patient Selection */}
                {patient && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Concernant le patient</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {patient.gender === 'female' ? 'Mme' : 'M.'} {patient.lastName.toUpperCase()} {patient.firstName}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            · {patient.phone}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-accent border-accent hover:bg-accent/10">
                        Voir la fiche
                      </Button>
                    </div>
                    <Button variant="link" className="text-accent p-0 h-auto text-sm">
                      Changer
                    </Button>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-4">
                  {/* Send to Secretariat */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Envoi au télésecrétariat ?</Label>
                    <RadioGroup
                      value={formData.sendToSecretariat ? 'yes' : 'no'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sendToSecretariat: value === 'yes' }))}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="text-sm cursor-pointer">Non</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="text-sm cursor-pointer">Oui</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Urgent Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="urgent" className="text-sm font-medium">Note urgente</Label>
                    <Switch
                      id="urgent"
                      checked={formData.isUrgent}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked }))}
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  type="submit"
                  disabled={!formData.content.trim()}
                  className="w-full bg-warning hover:bg-warning-light text-warning-foreground h-11 text-base font-medium"
                >
                  Enregistrer la note
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewNoteModal;
