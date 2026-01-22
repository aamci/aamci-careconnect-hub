/**
 * Composant de sélection de patient avec recherche typeahead
 * Utilisé dans le drawer de classement de documents
 */

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PatientComboboxProps {
  value?: Patient;
  onChange: (patient: Patient) => void;
  patients?: Patient[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function PatientCombobox({
  value,
  onChange,
  patients = [],
  disabled = false,
  placeholder = 'Sélectionner un patient',
  required = false
}: PatientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return patients;

    return patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const phone = patient.phone?.toLowerCase() || '';
      const email = patient.email?.toLowerCase() || '';

      return (
        fullName.includes(query) ||
        phone.includes(query) ||
        email.includes(query)
      );
    });
  }, [patients, searchQuery]);

  const handleSelect = (patient: Patient) => {
    onChange(patient);
    setOpen(false);
    setSearchQuery('');
  };

  const formatPatientDisplay = (patient: Patient): string => {
    const age = patient.dateOfBirth
      ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
      : null;

    return age !== null
      ? `${patient.firstName} ${patient.lastName} (${age} ans)`
      : `${patient.firstName} ${patient.lastName}`;
  };

  const formatPatientSecondary = (patient: Patient): string => {
    const parts: string[] = [];

    if (patient.dateOfBirth) {
      parts.push(format(new Date(patient.dateOfBirth), 'dd/MM/yyyy', { locale: fr }));
    }

    if (patient.phone) {
      parts.push(patient.phone);
    }

    return parts.join(' • ');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0" />
              {formatPatientDisplay(value)}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          <CommandList className="max-h-[300px]">
            <CommandEmpty>Aucun patient trouvé.</CommandEmpty>

            <CommandGroup>
              {filteredPatients.map(patient => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => handleSelect(patient)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.id === patient.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">
                      {formatPatientDisplay(patient)}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {formatPatientSecondary(patient)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
