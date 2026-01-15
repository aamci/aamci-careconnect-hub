// Types for Patient Administrative Info Form

export type BirthPlaceType = 'france' | 'abroad' | 'unknown';
export type CivilityType = 'M.' | 'Mme' | 'Inconnu';
export type SexType = 'Homme' | 'Femme' | null;
export type InsuranceType = 
  | '' 
  | 'pas_assurance' 
  | 'cmu' 
  | 'ame' 
  | 'securite_sociale' 
  | 'mutuelle' 
  | 'acs' 
  | 'accident_travail';

export type IdentityDocType = 
  | ''
  | 'cni'
  | 'acte_naissance'
  | 'livret_famille'
  | 'passeport'
  | 'titre_sejour'
  | 'expediteur_confiance'
  | 'sync_externe';

export interface PatientAdminInfo {
  // INS
  insNumber: string;
  oid: string;
  
  // Identity
  civility: CivilityType;
  sex: SexType;
  birthName: string;
  usedName: string;
  birthFirstname: string;
  usedFirstname: string;
  birthFirstnames: string;
  
  // Birth
  birthDate: string;
  birthPlaceType: BirthPlaceType;
  birthCity: string;
  birthCityId: string;
  birthCountry: string;
  birthCountryCode: string;
  
  // Contact
  phoneMobile: string;
  phoneLandline: string;
  email: string;
  
  // Address
  address: string;
  postalCode: string;
  city: string;
  country: string;
  countryCode: string;
  digicode: string;
  
  // Insurance
  insuranceType: InsuranceType;
  
  // Other info
  remark: string;
  provenance: string;
  profession: string;
  gpName: string;
  gpCity: string;
  
  // Notifications
  notificationsEnabled: boolean;
  
  // Identity validation
  identityDocType: IdentityDocType;
}

export const DEFAULT_ADMIN_INFO: PatientAdminInfo = {
  insNumber: '',
  oid: '',
  civility: 'Inconnu',
  sex: null,
  birthName: '',
  usedName: '',
  birthFirstname: '',
  usedFirstname: '',
  birthFirstnames: '',
  birthDate: '',
  birthPlaceType: 'france',
  birthCity: '',
  birthCityId: '',
  birthCountry: '',
  birthCountryCode: '',
  phoneMobile: '',
  phoneLandline: '',
  email: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  countryCode: '',
  digicode: '',
  insuranceType: '',
  remark: '',
  provenance: '',
  profession: '',
  gpName: '',
  gpCity: '',
  notificationsEnabled: true,
  identityDocType: '',
};

export interface FrenchCity {
  id: string;
  name: string;
  department: string;
  label: string;
}

export interface Country {
  code: string;
  name: string;
}

export const INSURANCE_OPTIONS: { value: InsuranceType; label: string }[] = [
  { value: '', label: 'Assurance' },
  { value: 'pas_assurance', label: "Pas d'assurance" },
  { value: 'cmu', label: 'CMU' },
  { value: 'ame', label: 'AME' },
  { value: 'securite_sociale', label: 'Sécurité Sociale' },
  { value: 'mutuelle', label: 'Mutuelle' },
  { value: 'acs', label: 'ACS' },
  { value: 'accident_travail', label: 'Accident du travail' },
];

export const IDENTITY_DOC_OPTIONS: { value: IdentityDocType; label: string; level: string }[] = [
  { value: 'cni', label: "Carte nationale d'identité", level: 'Haut' },
  { value: 'acte_naissance', label: "Extrait d'acte de naissance", level: 'Haut' },
  { value: 'livret_famille', label: 'Livret de famille', level: 'Haut' },
  { value: 'passeport', label: 'Passeport', level: 'Haut' },
  { value: 'titre_sejour', label: 'Titre de séjour', level: 'Haut' },
  { value: 'expediteur_confiance', label: 'Expéditeur de confiance', level: 'Haut' },
  { value: 'sync_externe', label: 'Synchronisation externe', level: 'Haut' },
];

// Sample French cities for autocomplete
export const FRENCH_CITIES: FrenchCity[] = [
  { id: 'paris-75', name: 'Paris', department: '75', label: 'Paris (75)' },
  { id: 'paris-10-75', name: 'Paris 10e Arrondissement', department: '75', label: 'Paris 10e Arrondissement (75)' },
  { id: 'paris-11-75', name: 'Paris 11e Arrondissement', department: '75', label: 'Paris 11e Arrondissement (75)' },
  { id: 'paris-12-75', name: 'Paris 12e Arrondissement', department: '75', label: 'Paris 12e Arrondissement (75)' },
  { id: 'paris-13-75', name: 'Paris 13e Arrondissement', department: '75', label: 'Paris 13e Arrondissement (75)' },
  { id: 'paris-14-75', name: 'Paris 14e Arrondissement', department: '75', label: 'Paris 14e Arrondissement (75)' },
  { id: 'paris-15-75', name: 'Paris 15e Arrondissement', department: '75', label: 'Paris 15e Arrondissement (75)' },
  { id: 'paris-16-75', name: 'Paris 16e Arrondissement', department: '75', label: 'Paris 16e Arrondissement (75)' },
  { id: 'paris-17-75', name: 'Paris 17e Arrondissement', department: '75', label: 'Paris 17e Arrondissement (75)' },
  { id: 'paris-18-75', name: 'Paris 18e Arrondissement', department: '75', label: 'Paris 18e Arrondissement (75)' },
  { id: 'paris-19-75', name: 'Paris 19e Arrondissement', department: '75', label: 'Paris 19e Arrondissement (75)' },
  { id: 'paris-20-75', name: 'Paris 20e Arrondissement', department: '75', label: 'Paris 20e Arrondissement (75)' },
  { id: 'lyon-69', name: 'Lyon', department: '69', label: 'Lyon (69)' },
  { id: 'marseille-13', name: 'Marseille', department: '13', label: 'Marseille (13)' },
  { id: 'toulouse-31', name: 'Toulouse', department: '31', label: 'Toulouse (31)' },
  { id: 'nice-06', name: 'Nice', department: '06', label: 'Nice (06)' },
  { id: 'nantes-44', name: 'Nantes', department: '44', label: 'Nantes (44)' },
  { id: 'bordeaux-33', name: 'Bordeaux', department: '33', label: 'Bordeaux (33)' },
  { id: 'lille-59', name: 'Lille', department: '59', label: 'Lille (59)' },
  { id: 'strasbourg-67', name: 'Strasbourg', department: '67', label: 'Strasbourg (67)' },
];

// Countries list (ISO 3166)
export const COUNTRIES: Country[] = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'ZA', name: 'Afrique Du Sud' },
  { code: 'AL', name: 'Albanie' },
  { code: 'DZ', name: 'Algerie' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'AD', name: 'Andorre' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AR', name: 'Argentine' },
  { code: 'AM', name: 'Armenie' },
  { code: 'AU', name: 'Australie' },
  { code: 'AT', name: 'Autriche' },
  { code: 'BE', name: 'Belgique' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BQ', name: 'Bonaire, Saint Eustache Et Saba' },
  { code: 'BR', name: 'Bresil' },
  { code: 'KH', name: 'Cambodge' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CA', name: 'Canada' },
  { code: 'KY', name: 'Caimanes (Iles)' },
  { code: 'CN', name: 'Chine' },
  { code: 'CY', name: 'Chypre' },
  { code: 'CO', name: 'Colombie' },
  { code: 'KR', name: 'Coree Du Sud' },
  { code: 'HR', name: 'Croatie' },
  { code: 'DK', name: 'Danemark' },
  { code: 'EG', name: 'Egypte' },
  { code: 'AE', name: 'Emirats Arabes Unis' },
  { code: 'ES', name: 'Espagne' },
  { code: 'US', name: 'Etats-Unis' },
  { code: 'FI', name: 'Finlande' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'Grande-Bretagne' },
  { code: 'GR', name: 'Grece' },
  { code: 'HU', name: 'Hongrie' },
  { code: 'IN', name: 'Inde' },
  { code: 'ID', name: 'Indonesie' },
  { code: 'IE', name: 'Irlande' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italie' },
  { code: 'JP', name: 'Japon' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'PT', name: 'Açores, Madere' },
  { code: 'MA', name: 'Maroc' },
  { code: 'MX', name: 'Mexique' },
  { code: 'MC', name: 'Monaco' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'PL', name: 'Pologne' },
  { code: 'RO', name: 'Roumanie' },
  { code: 'RU', name: 'Russie' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SE', name: 'Suede' },
  { code: 'CH', name: 'Suisse' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'TR', name: 'Turquie' },
  { code: 'VN', name: 'Vietnam' },
];
