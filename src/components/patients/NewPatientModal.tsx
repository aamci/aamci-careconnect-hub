import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender } from '@/types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientFormData) => void;
}

interface PatientFormData {
  gender: Gender;
  lastName: string;
  usedLastName: string;
  firstName: string;
  usedFirstName: string;
  dateOfBirth: string;
  birthPlace: string;
  city: string;
  phone: string;
  email: string;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<PatientFormData>({
    gender: 'female',
    lastName: '',
    usedLastName: '',
    firstName: '',
    usedFirstName: '',
    dateOfBirth: '',
    birthPlace: 'france',
    city: '',
    phone: '',
    email: '',
  });

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold">Ajouter un nouveau patient</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Genre</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value as Gender)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="text-sm cursor-pointer">Homme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="text-sm cursor-pointer">Femme</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Names Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Nom utilisé</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={formData.usedLastName}
                      onChange={(e) => handleChange('usedLastName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">1er prénom de naissance</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={formData.usedFirstName}
                      onChange={(e) => handleChange('usedFirstName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Birth Names Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthLastName" className="text-sm">Nom de naissance</Label>
                    <Input
                      id="birthLastName"
                      placeholder="Nom de naissance"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Lieu de naissance</Label>
                    <Select
                      value={formData.birthPlace}
                      onValueChange={(value) => handleChange('birthPlace', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="france">Né(e) en France</SelectItem>
                        <SelectItem value="abroad">Né(e) à l'étranger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">Ville de naissance</Label>
                    <Input
                      id="city"
                      placeholder="Ville"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Adresse e-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.fr"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button type="button" variant="ghost" className="text-accent">
                    Plus d'options
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-accent hover:bg-accent-light text-accent-foreground px-6"
                  >
                    Ajouter le patient
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewPatientModal;
