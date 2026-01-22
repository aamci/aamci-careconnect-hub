/**
 * Sélecteur de catégorie de document avec recherche filtrée
 * Hiérarchie complète : catégorie > sous-catégorie
 */

import { useState, useMemo } from 'react';
import { Check, Search } from 'lucide-react';
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
import { DOCUMENT_CATEGORIES } from '@/constants/documentCategories';
import { DocumentCategory } from '@/types/document';

interface DocumentCategoryPickerProps {
  value?: {
    category: DocumentCategory | '';
    subcategory: string;
  };
  onChange: (value: { category: DocumentCategory; subcategory: string }) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function DocumentCategoryPicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Sélectionner une catégorie',
  required = false
}: DocumentCategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLabel = useMemo(() => {
    if (!value?.category || !value?.subcategory) return placeholder;

    const category = Object.values(DOCUMENT_CATEGORIES).find(
      cat => cat.id === value.category
    );

    if (!category) return placeholder;

    const subcategory = category.subcategories.find(
      sub => sub.id === value.subcategory
    );

    return subcategory
      ? `${category.icon} ${category.label} > ${subcategory.label}`
      : placeholder;
  }, [value, placeholder]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return Object.values(DOCUMENT_CATEGORIES);
    }

    return Object.values(DOCUMENT_CATEGORIES)
      .map(category => {
        const matchesCategory = category.label.toLowerCase().includes(query);

        const matchingSubcategories = category.subcategories.filter(sub =>
          sub.label.toLowerCase().includes(query)
        );

        if (matchesCategory || matchingSubcategories.length > 0) {
          return {
            ...category,
            subcategories: matchesCategory
              ? category.subcategories
              : matchingSubcategories
          };
        }

        return null;
      })
      .filter(Boolean) as typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES][];
  }, [searchQuery]);

  const handleSelect = (categoryId: string, subcategoryId: string) => {
    onChange({
      category: categoryId as DocumentCategory,
      subcategory: subcategoryId
    });
    setOpen(false);
    setSearchQuery('');
  };

  const isSelected = (categoryId: string, subcategoryId: string) => {
    return value?.category === categoryId && value?.subcategory === subcategoryId;
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
            !value?.category && 'text-muted-foreground'
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          <CommandList className="max-h-[400px]">
            <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>

            {filteredCategories.map(category => (
              <CommandGroup
                key={category.id}
                heading={`${category.icon} ${category.label}`}
              >
                {category.subcategories.map(subcategory => (
                  <CommandItem
                    key={subcategory.id}
                    value={`${category.id}-${subcategory.id}`}
                    onSelect={() => handleSelect(category.id, subcategory.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected(category.id, subcategory.id)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span>{subcategory.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
