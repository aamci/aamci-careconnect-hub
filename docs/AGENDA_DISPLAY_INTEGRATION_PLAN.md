# Plan d'Intégration : Affichage de l'Agenda

## Vue d'ensemble

Migration progressive du système de préférences d'affichage agenda de localStorage vers Supabase, avec ajout des fonctionnalités Doctolib-level.

## Phase 1 : Infrastructure (COMPLETED)

### 1.1 Base de données
- [x] Table `user_calendar_preferences`
- [x] Table `user_calendar_preferences_audit`
- [x] Triggers d'audit automatiques
- [x] RLS policies
- [x] Fonction `get_or_create_calendar_preferences`

### 1.2 Types TypeScript
- [x] `src/types/calendar-preferences.ts`
- [x] ZoomLevel, SidebarGrouping, StatsMode enums
- [x] ZOOM_CONFIG mapping
- [x] Helper functions (minutesToTime, timeToMinutes)

### 1.3 Service API
- [x] `src/services/supabase/calendarPreferencesService.ts`
- [x] fetch, update, reset, fetchAuditLog
- [x] Optimistic locking via version
- [x] Validation côté client

### 1.4 Hooks React Query
- [x] `src/hooks/data/useCalendarPreferences.ts`
- [x] Cache localStorage + sync serveur
- [x] Optimistic updates
- [x] CSS variables injection

### 1.5 Algorithmes
- [x] `src/lib/calendar-algorithms.ts`
- [x] Positionnement (minuteToY, yToMinute)
- [x] Clipping (clipEventToRange)
- [x] Collision detection (assignEventColumns)
- [x] Out-of-range indicators

## Phase 2 : Composants UI (IN PROGRESS)

### 2.1 Modal Settings
- [x] `AgendaDisplaySettingsModal.tsx`
- [ ] Intégrer dans toolbar Planning

### 2.2 Mise à jour grilles existantes
- [ ] `WeekGrid.tsx` - utiliser useCalendarPreferences
- [ ] `DayGrid.tsx` - utiliser useCalendarPreferences
- [ ] `TimeAxis.tsx` - respecter time range
- [ ] `EventCard.tsx` - adapter au zoom

### 2.3 Indicateurs hors-plage
- [ ] Composant `OutOfRangeIndicator.tsx`
- [ ] Intégration WeekGrid/DayGrid

## Phase 3 : Migration (TODO)

### 3.1 Migration localStorage → Supabase
```typescript
// Script de migration à exécuter au login
async function migrateLocalPreferences() {
  const localKey = 'agenda_display_preferences_v6';
  const local = localStorage.getItem(localKey);

  if (local) {
    const parsed = JSON.parse(local);
    const { data } = await supabase
      .from('user_calendar_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!data) {
      // Migrer vers Supabase
      await calendarPreferencesService.update(mapOldToNew(parsed));
    }

    // Supprimer l'ancien cache
    localStorage.removeItem(localKey);
  }
}
```

### 3.2 Suppression ancien hook
- [ ] Deprecate `useAgendaPreferences.ts`
- [ ] Remplacer tous les imports

## Phase 4 : Tests & QA

### 4.1 Tests unitaires
- [x] `calendar-algorithms.test.ts`
- [ ] Exécuter : `npm run test`

### 4.2 Tests E2E
- [x] `agenda-display-settings.spec.ts`
- [ ] Exécuter : `npm run e2e`

### 4.3 Tests visuels
- [ ] Snapshots Chromatic/Percy

### 4.4 Tests de performance
- [ ] Lighthouse score
- [ ] React DevTools profiler

## Fichiers créés/modifiés

### Nouveaux fichiers
```
supabase/migrations/20260118_user_calendar_preferences.sql
src/types/calendar-preferences.ts
src/services/supabase/calendarPreferencesService.ts
src/hooks/data/useCalendarPreferences.ts
src/components/calendar/Settings/AgendaDisplaySettingsModal.tsx
src/lib/calendar-algorithms.ts
src/lib/__tests__/calendar-algorithms.test.ts
e2e/agenda-display-settings.spec.ts
docs/AGENDA_DISPLAY_INTEGRATION_PLAN.md
```

### Fichiers à modifier
```
src/components/calendar/grid/WeekGrid.tsx        → intégrer useCalendarPreferences
src/components/calendar/grid/DayGrid.tsx         → intégrer useCalendarPreferences
src/components/calendar/grid/TimeAxis.tsx        → respecter time range
src/pages/Planning/PlanningPage.tsx              → ajouter bouton modal
```

## Commandes d'exécution

```bash
# Migration DB (déjà exécutée)
node scripts/complete-migration.js

# Tests unitaires
npm run test -- src/lib/__tests__/calendar-algorithms.test.ts

# Tests E2E
npm run e2e -- e2e/agenda-display-settings.spec.ts

# Build vérification
npm run build
```

## Rollback

En cas de problème :
1. Les préférences serveur ne cassent pas l'existant (fallback localStorage)
2. Le hook `useAgendaPreferences` original reste fonctionnel
3. La migration est incrémentale, pas de big-bang

## Métriques de succès

- [ ] Temps de chargement grille < 200ms
- [ ] Pas de layout shift visible
- [ ] Préférences synchronisées multi-device
- [ ] Audit trail complet
- [ ] Score accessibilité > 90
