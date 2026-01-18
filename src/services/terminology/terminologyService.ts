/**
 * Terminology Service - Smart Medical Suggestions
 * Supports CIM-10, CISP-2, CCAM, ATC coding systems with French medical terms
 */

import type {
  TerminologyConcept,
  TerminologySuggestion,
  TerminologySystem,
} from '@/types/medicalHistory';

// ============================================================================
// ABBREVIATIONS MAPPING (Common French Medical Abbreviations)
// ============================================================================

const ABBREVIATIONS: Record<string, string[]> = {
  // Cardiovascular
  'HTA': ['hypertension arterielle', 'hypertension'],
  'IDM': ['infarctus du myocarde', 'infarctus'],
  'AVC': ['accident vasculaire cerebral'],
  'IC': ['insuffisance cardiaque'],
  'FA': ['fibrillation auriculaire', 'fibrillation atriale'],
  'AOMI': ['arteriopathie obliterante des membres inferieurs'],
  'TVP': ['thrombose veineuse profonde'],
  'EP': ['embolie pulmonaire'],

  // Diabetes
  'DT1': ['diabete type 1', 'diabete insulino-dependant'],
  'DT2': ['diabete type 2', 'diabete non insulino-dependant'],
  'DID': ['diabete insulino-dependant', 'diabete type 1'],
  'DNID': ['diabete non insulino-dependant', 'diabete type 2'],

  // Respiratory
  'BPCO': ['bronchopneumopathie chronique obstructive'],
  'SAS': ['syndrome apnees du sommeil', 'apnee du sommeil'],
  'SAOS': ['syndrome apnees obstructives du sommeil'],

  // Psychiatric
  'SD': ['syndrome depressif', 'depression'],
  'TAG': ['trouble anxieux generalise'],
  'TOC': ['trouble obsessionnel compulsif'],

  // Cancer (K = Cancer in French medical shorthand)
  'K': ['cancer', 'carcinome', 'neoplasie maligne'],
  'K P': ['cancer du poumon', 'cancer pulmonaire'],
  'K PO': ['cancer du poumon'],
  'K SEIN': ['cancer du sein'],
  'K PROSTATE': ['cancer de la prostate'],
  'K COLON': ['cancer du colon', 'cancer colorectal'],

  // Renal
  'IRC': ['insuffisance renale chronique'],
  'IRA': ['insuffisance renale aigue'],
  'MRC': ['maladie renale chronique'],

  // Hepatic
  'IH': ['insuffisance hepatique'],
  'NASH': ['steatohepatite non alcoolique'],

  // Other common
  'PR': ['polyarthrite rhumatoide'],
  'LED': ['lupus erythemateux dissemine'],
  'SEP': ['sclerose en plaques'],
  'SPA': ['spondylarthrite ankylosante'],
  'RGO': ['reflux gastro-oesophagien'],
  'MICI': ['maladie inflammatoire chronique intestinale'],
  'VIH': ['virus immunodeficience humaine', 'sida'],
  'TB': ['tuberculose'],
  'POIL': ['allergie aux poils'],

  // Allergies
  'ATB': ['antibiotique'],
  'AINS': ['anti-inflammatoire non steroidien'],
};

// ============================================================================
// REFERENCE DATA - CIM-10 (Most common codes)
// ============================================================================

const CIM10_CONCEPTS: TerminologyConcept[] = [
  // Cardiovascular
  {
    id: 'cim10-I10',
    system: 'CIM10',
    code: 'I10',
    display: 'Hypertension arterielle essentielle',
    synonyms: ['HTA', 'tension elevee', 'hypertension'],
    abbreviations: ['HTA'],
    normalizedForms: ['hypertension arterielle essentielle', 'hta'],
    isActive: true,
  },
  {
    id: 'cim10-I11',
    system: 'CIM10',
    code: 'I11',
    display: 'Cardiopathie hypertensive',
    synonyms: ['coeur hypertensif'],
    abbreviations: [],
    normalizedForms: ['cardiopathie hypertensive'],
    isActive: true,
  },
  {
    id: 'cim10-I21',
    system: 'CIM10',
    code: 'I21',
    display: 'Infarctus aigu du myocarde',
    synonyms: ['IDM', 'crise cardiaque', 'infarctus'],
    abbreviations: ['IDM'],
    normalizedForms: ['infarctus aigu du myocarde', 'idm'],
    isActive: true,
  },
  {
    id: 'cim10-I25',
    system: 'CIM10',
    code: 'I25',
    display: 'Cardiopathie ischemique chronique',
    synonyms: ['maladie coronarienne', 'coronaropathie'],
    abbreviations: [],
    normalizedForms: ['cardiopathie ischemique chronique'],
    isActive: true,
  },
  {
    id: 'cim10-I48',
    system: 'CIM10',
    code: 'I48',
    display: 'Fibrillation auriculaire',
    synonyms: ['FA', 'fibrillation atriale', 'arythmie'],
    abbreviations: ['FA'],
    normalizedForms: ['fibrillation auriculaire', 'fa'],
    isActive: true,
  },
  {
    id: 'cim10-I50',
    system: 'CIM10',
    code: 'I50',
    display: 'Insuffisance cardiaque',
    synonyms: ['IC', 'defaillance cardiaque'],
    abbreviations: ['IC'],
    normalizedForms: ['insuffisance cardiaque', 'ic'],
    isActive: true,
  },
  {
    id: 'cim10-I63',
    system: 'CIM10',
    code: 'I63',
    display: 'Accident vasculaire cerebral ischemique',
    synonyms: ['AVC', 'AIT', 'stroke'],
    abbreviations: ['AVC'],
    normalizedForms: ['accident vasculaire cerebral', 'avc'],
    isActive: true,
  },
  {
    id: 'cim10-I70',
    system: 'CIM10',
    code: 'I70',
    display: 'Atherosclerose',
    synonyms: ['arteriopathie', 'AOMI'],
    abbreviations: ['AOMI'],
    normalizedForms: ['atherosclerose'],
    isActive: true,
  },

  // Diabetes
  {
    id: 'cim10-E10',
    system: 'CIM10',
    code: 'E10',
    display: 'Diabete de type 1',
    synonyms: ['DT1', 'DID', 'diabete insulino-dependant', 'diabete juvenile'],
    abbreviations: ['DT1', 'DID'],
    normalizedForms: ['diabete type 1', 'diabete insulino-dependant'],
    isActive: true,
  },
  {
    id: 'cim10-E11',
    system: 'CIM10',
    code: 'E11',
    display: 'Diabete de type 2',
    synonyms: ['DT2', 'DNID', 'diabete non insulino-dependant', 'diabete gras'],
    abbreviations: ['DT2', 'DNID'],
    normalizedForms: ['diabete type 2', 'diabete non insulino-dependant'],
    isActive: true,
  },
  {
    id: 'cim10-E78',
    system: 'CIM10',
    code: 'E78',
    display: 'Dyslipidemie',
    synonyms: ['hypercholesterolemie', 'hypertriglyceridemie', 'cholesterol eleve'],
    abbreviations: [],
    normalizedForms: ['dyslipidemie', 'hypercholesterolemie'],
    isActive: true,
  },

  // Respiratory
  {
    id: 'cim10-J44',
    system: 'CIM10',
    code: 'J44',
    display: 'Bronchopneumopathie chronique obstructive',
    synonyms: ['BPCO', 'emphyseme', 'bronchite chronique'],
    abbreviations: ['BPCO'],
    normalizedForms: ['bpco', 'bronchopneumopathie chronique obstructive'],
    isActive: true,
  },
  {
    id: 'cim10-J45',
    system: 'CIM10',
    code: 'J45',
    display: 'Asthme',
    synonyms: ['asthme bronchique', 'crise asthme'],
    abbreviations: [],
    normalizedForms: ['asthme'],
    isActive: true,
  },
  {
    id: 'cim10-G47.3',
    system: 'CIM10',
    code: 'G47.3',
    display: 'Syndrome des apnees du sommeil',
    synonyms: ['SAS', 'SAOS', 'apnee du sommeil'],
    abbreviations: ['SAS', 'SAOS'],
    normalizedForms: ['apnee du sommeil', 'syndrome apnees'],
    isActive: true,
  },

  // Cancer
  {
    id: 'cim10-C34',
    system: 'CIM10',
    code: 'C34',
    display: 'Cancer du poumon',
    synonyms: ['K poumon', 'carcinome bronchique', 'cancer bronchique'],
    abbreviations: ['K PO', 'K P'],
    normalizedForms: ['cancer poumon', 'cancer pulmonaire'],
    isActive: true,
  },
  {
    id: 'cim10-C50',
    system: 'CIM10',
    code: 'C50',
    display: 'Cancer du sein',
    synonyms: ['K sein', 'carcinome mammaire'],
    abbreviations: ['K SEIN'],
    normalizedForms: ['cancer sein', 'tumeur sein'],
    isActive: true,
  },
  {
    id: 'cim10-C61',
    system: 'CIM10',
    code: 'C61',
    display: 'Cancer de la prostate',
    synonyms: ['K prostate', 'carcinome prostatique'],
    abbreviations: ['K PROSTATE'],
    normalizedForms: ['cancer prostate'],
    isActive: true,
  },
  {
    id: 'cim10-C18',
    system: 'CIM10',
    code: 'C18',
    display: 'Cancer du colon',
    synonyms: ['K colon', 'cancer colorectal', 'carcinome colique'],
    abbreviations: ['K COLON'],
    normalizedForms: ['cancer colon', 'cancer colorectal'],
    isActive: true,
  },
  {
    id: 'cim10-C64',
    system: 'CIM10',
    code: 'C64',
    display: 'Cancer du rein',
    synonyms: ['K rein', 'carcinome renal'],
    abbreviations: [],
    normalizedForms: ['cancer rein'],
    isActive: true,
  },
  {
    id: 'cim10-C73',
    system: 'CIM10',
    code: 'C73',
    display: 'Cancer de la thyroide',
    synonyms: ['K thyroide', 'carcinome thyroidien'],
    abbreviations: [],
    normalizedForms: ['cancer thyroide'],
    isActive: true,
  },

  // Psychiatric
  {
    id: 'cim10-F32',
    system: 'CIM10',
    code: 'F32',
    display: 'Episode depressif',
    synonyms: ['depression', 'syndrome depressif', 'SD'],
    abbreviations: ['SD'],
    normalizedForms: ['depression', 'episode depressif'],
    isActive: true,
  },
  {
    id: 'cim10-F33',
    system: 'CIM10',
    code: 'F33',
    display: 'Trouble depressif recurrent',
    synonyms: ['depression recurrente', 'depression chronique'],
    abbreviations: [],
    normalizedForms: ['trouble depressif recurrent'],
    isActive: true,
  },
  {
    id: 'cim10-F41',
    system: 'CIM10',
    code: 'F41',
    display: 'Trouble anxieux',
    synonyms: ['anxiete', 'TAG', 'trouble anxieux generalise'],
    abbreviations: ['TAG'],
    normalizedForms: ['trouble anxieux', 'anxiete'],
    isActive: true,
  },

  // Renal
  {
    id: 'cim10-N18',
    system: 'CIM10',
    code: 'N18',
    display: 'Insuffisance renale chronique',
    synonyms: ['IRC', 'MRC', 'maladie renale chronique'],
    abbreviations: ['IRC', 'MRC'],
    normalizedForms: ['insuffisance renale chronique', 'irc'],
    isActive: true,
  },

  // Rheumatology
  {
    id: 'cim10-M05',
    system: 'CIM10',
    code: 'M05',
    display: 'Polyarthrite rhumatoide',
    synonyms: ['PR', 'arthrite rhumatoide'],
    abbreviations: ['PR'],
    normalizedForms: ['polyarthrite rhumatoide', 'pr'],
    isActive: true,
  },
  {
    id: 'cim10-M45',
    system: 'CIM10',
    code: 'M45',
    display: 'Spondylarthrite ankylosante',
    synonyms: ['SPA', 'spondylite'],
    abbreviations: ['SPA'],
    normalizedForms: ['spondylarthrite ankylosante', 'spa'],
    isActive: true,
  },

  // Neurological
  {
    id: 'cim10-G35',
    system: 'CIM10',
    code: 'G35',
    display: 'Sclerose en plaques',
    synonyms: ['SEP', 'MS'],
    abbreviations: ['SEP'],
    normalizedForms: ['sclerose en plaques', 'sep'],
    isActive: true,
  },
  {
    id: 'cim10-G40',
    system: 'CIM10',
    code: 'G40',
    display: 'Epilepsie',
    synonyms: ['crises epileptiques', 'convulsions'],
    abbreviations: [],
    normalizedForms: ['epilepsie'],
    isActive: true,
  },

  // Digestive
  {
    id: 'cim10-K21',
    system: 'CIM10',
    code: 'K21',
    display: 'Reflux gastro-oesophagien',
    synonyms: ['RGO', 'reflux acide', 'brulures estomac'],
    abbreviations: ['RGO'],
    normalizedForms: ['reflux gastro-oesophagien', 'rgo'],
    isActive: true,
  },
  {
    id: 'cim10-K50',
    system: 'CIM10',
    code: 'K50',
    display: 'Maladie de Crohn',
    synonyms: ['crohn', 'MICI'],
    abbreviations: [],
    normalizedForms: ['maladie de crohn', 'crohn'],
    isActive: true,
  },
  {
    id: 'cim10-K51',
    system: 'CIM10',
    code: 'K51',
    display: 'Rectocolite hemorragique',
    synonyms: ['RCH', 'colite ulcereuse', 'MICI'],
    abbreviations: ['RCH'],
    normalizedForms: ['rectocolite hemorragique', 'rch'],
    isActive: true,
  },

  // Thyroid
  {
    id: 'cim10-E05',
    system: 'CIM10',
    code: 'E05',
    display: 'Hyperthyroidie',
    synonyms: ['thyrotoxicose', 'basedow'],
    abbreviations: [],
    normalizedForms: ['hyperthyroidie'],
    isActive: true,
  },
  {
    id: 'cim10-E03',
    system: 'CIM10',
    code: 'E03',
    display: 'Hypothyroidie',
    synonyms: ['insuffisance thyroidienne'],
    abbreviations: [],
    normalizedForms: ['hypothyroidie'],
    isActive: true,
  },

  // Infections
  {
    id: 'cim10-B20',
    system: 'CIM10',
    code: 'B20',
    display: 'Infection par le VIH',
    synonyms: ['VIH', 'SIDA', 'HIV'],
    abbreviations: ['VIH'],
    normalizedForms: ['vih', 'sida', 'infection vih'],
    isActive: true,
  },
  {
    id: 'cim10-A15',
    system: 'CIM10',
    code: 'A15',
    display: 'Tuberculose',
    synonyms: ['TB', 'tuberculose pulmonaire'],
    abbreviations: ['TB'],
    normalizedForms: ['tuberculose', 'tb'],
    isActive: true,
  },
];

// ============================================================================
// REFERENCE DATA - CISP-2 (Primary Care)
// ============================================================================

const CISP2_CONCEPTS: TerminologyConcept[] = [
  // Family history codes
  {
    id: 'cisp2-U75',
    system: 'CISP2',
    code: 'U75',
    display: 'Cancer du rein',
    synonyms: ['tumeur renale', 'neoplasie renale'],
    abbreviations: [],
    normalizedForms: ['cancer rein'],
    isActive: true,
  },
  {
    id: 'cisp2-D75',
    system: 'CISP2',
    code: 'D75',
    display: 'Cancer du colon/rectum',
    synonyms: ['cancer colorectal', 'tumeur colique'],
    abbreviations: [],
    normalizedForms: ['cancer colon', 'cancer rectum'],
    isActive: true,
  },
  {
    id: 'cisp2-R84',
    system: 'CISP2',
    code: 'R84',
    display: 'Cancer du poumon',
    synonyms: ['tumeur pulmonaire', 'cancer bronchique'],
    abbreviations: [],
    normalizedForms: ['cancer poumon'],
    isActive: true,
  },
  {
    id: 'cisp2-R85',
    system: 'CISP2',
    code: 'R85',
    display: 'Cancer du larynx',
    synonyms: ['tumeur larynx', 'cancer gorge'],
    abbreviations: [],
    normalizedForms: ['cancer larynx'],
    isActive: true,
  },
  {
    id: 'cisp2-X76',
    system: 'CISP2',
    code: 'X76',
    display: 'Cancer du sein chez la femme',
    synonyms: ['tumeur mammaire femme'],
    abbreviations: [],
    normalizedForms: ['cancer sein femme'],
    isActive: true,
  },
  {
    id: 'cisp2-Y78',
    system: 'CISP2',
    code: 'Y78',
    display: 'Cancer du sein chez homme',
    synonyms: ['tumeur mammaire homme'],
    abbreviations: [],
    normalizedForms: ['cancer sein homme'],
    isActive: true,
  },
  {
    id: 'cisp2-X26',
    system: 'CISP2',
    code: 'X26',
    display: 'Peur avoir un cancer du sein chez la femme',
    synonyms: ['anxiete cancer sein'],
    abbreviations: [],
    normalizedForms: ['peur cancer sein'],
    isActive: true,
  },
  {
    id: 'cisp2-K86',
    system: 'CISP2',
    code: 'K86',
    display: 'Hypertension arterielle sans complication',
    synonyms: ['HTA simple', 'tension arterielle elevee'],
    abbreviations: ['HTA'],
    normalizedForms: ['hypertension arterielle'],
    isActive: true,
  },
  {
    id: 'cisp2-T90',
    system: 'CISP2',
    code: 'T90',
    display: 'Diabete de type 2',
    synonyms: ['diabete non insulino-dependant'],
    abbreviations: ['DNID', 'DT2'],
    normalizedForms: ['diabete type 2'],
    isActive: true,
  },
  {
    id: 'cisp2-T89',
    system: 'CISP2',
    code: 'T89',
    display: 'Diabete de type 1',
    synonyms: ['diabete insulino-dependant'],
    abbreviations: ['DID', 'DT1'],
    normalizedForms: ['diabete type 1'],
    isActive: true,
  },
];

// ============================================================================
// REFERENCE DATA - CCAM (Surgical Procedures)
// ============================================================================

const CCAM_CONCEPTS: TerminologyConcept[] = [
  {
    id: 'ccam-HB1',
    system: 'CCAM',
    code: 'HB1',
    display: 'Extraction des dents de sagesse',
    synonyms: ['avulsion dents sagesse', 'extraction troisieme molaire'],
    abbreviations: [],
    normalizedForms: ['extraction dents sagesse'],
    isActive: true,
  },
  {
    id: 'ccam-BFGA003',
    system: 'CCAM',
    code: 'BFGA003',
    display: 'Extraction extracapsulaire manuelle du cristallin, sans implantation de cristallin artificiel',
    synonyms: ['chirurgie cataracte simple'],
    abbreviations: [],
    normalizedForms: ['extraction cristallin'],
    isActive: true,
  },
  {
    id: 'ccam-BFGA008',
    system: 'CCAM',
    code: 'BFGA008',
    display: 'Extraction extracapsulaire du cristallin par phakoemulsification, sans implantation de cristallin artificiel',
    synonyms: ['phaco sans implant'],
    abbreviations: [],
    normalizedForms: ['phakoemulsification'],
    isActive: true,
  },
  {
    id: 'ccam-BFGA002',
    system: 'CCAM',
    code: 'BFGA002',
    display: 'Extraction extracapsulaire manuelle du cristallin, avec implantation de cristallin artificiel dans la chambre posterieure de loeil',
    synonyms: ['chirurgie cataracte avec implant'],
    abbreviations: [],
    normalizedForms: ['extraction cristallin implant'],
    isActive: true,
  },
  {
    id: 'ccam-HHFA016',
    system: 'CCAM',
    code: 'HHFA016',
    display: 'Appendicectomie',
    synonyms: ['ablation appendice'],
    abbreviations: [],
    normalizedForms: ['appendicectomie'],
    isActive: true,
  },
  {
    id: 'ccam-HLFA002',
    system: 'CCAM',
    code: 'HLFA002',
    display: 'Cholecystectomie',
    synonyms: ['ablation vesicule biliaire'],
    abbreviations: [],
    normalizedForms: ['cholecystectomie'],
    isActive: true,
  },
  {
    id: 'ccam-NFCA006',
    system: 'CCAM',
    code: 'NFCA006',
    display: 'Prothese totale de hanche',
    synonyms: ['PTH', 'arthroplastie hanche'],
    abbreviations: ['PTH'],
    normalizedForms: ['prothese hanche'],
    isActive: true,
  },
  {
    id: 'ccam-NFCA010',
    system: 'CCAM',
    code: 'NFCA010',
    display: 'Prothese totale de genou',
    synonyms: ['PTG', 'arthroplastie genou'],
    abbreviations: ['PTG'],
    normalizedForms: ['prothese genou'],
    isActive: true,
  },
  {
    id: 'ccam-DDFA001',
    system: 'CCAM',
    code: 'DDFA001',
    display: 'Pose de stent coronaire',
    synonyms: ['angioplastie coronaire', 'dilatation coronaire'],
    abbreviations: [],
    normalizedForms: ['stent coronaire'],
    isActive: true,
  },
  {
    id: 'ccam-DEPA003',
    system: 'CCAM',
    code: 'DEPA003',
    display: 'Implantation de pacemaker',
    synonyms: ['pose stimulateur cardiaque'],
    abbreviations: [],
    normalizedForms: ['pacemaker', 'stimulateur cardiaque'],
    isActive: true,
  },
];

// ============================================================================
// REFERENCE DATA - ALLERGENS
// ============================================================================

const ALLERGEN_CONCEPTS: TerminologyConcept[] = [
  // Medications
  {
    id: 'allergen-penicillin',
    system: 'ATC',
    code: 'J01C',
    display: 'Penicillines',
    synonyms: ['amoxicilline', 'ampicilline', 'beta-lactamines'],
    abbreviations: [],
    normalizedForms: ['penicilline', 'amoxicilline'],
    isActive: true,
  },
  {
    id: 'allergen-nsaid',
    system: 'ATC',
    code: 'M01A',
    display: 'Anti-inflammatoires non steroidiens',
    synonyms: ['AINS', 'ibuprofene', 'aspirine', 'ketoprofene'],
    abbreviations: ['AINS'],
    normalizedForms: ['ains', 'anti-inflammatoire'],
    isActive: true,
  },
  {
    id: 'allergen-sulfa',
    system: 'ATC',
    code: 'J01E',
    display: 'Sulfamides',
    synonyms: ['bactrim', 'cotrimoxazole'],
    abbreviations: [],
    normalizedForms: ['sulfamide'],
    isActive: true,
  },

  // Foods
  {
    id: 'allergen-peanut',
    system: 'FREE_TEXT',
    code: 'FOOD-PEANUT',
    display: 'Arachides',
    synonyms: ['cacahuete', 'peanut'],
    abbreviations: [],
    normalizedForms: ['arachide', 'cacahuete'],
    isActive: true,
  },
  {
    id: 'allergen-gluten',
    system: 'FREE_TEXT',
    code: 'FOOD-GLUTEN',
    display: 'Gluten',
    synonyms: ['ble', 'cereales'],
    abbreviations: [],
    normalizedForms: ['gluten'],
    isActive: true,
  },
  {
    id: 'allergen-lactose',
    system: 'FREE_TEXT',
    code: 'FOOD-LACTOSE',
    display: 'Lactose',
    synonyms: ['lait', 'produits laitiers'],
    abbreviations: [],
    normalizedForms: ['lactose', 'lait'],
    isActive: true,
  },
  {
    id: 'allergen-shellfish',
    system: 'FREE_TEXT',
    code: 'FOOD-SHELLFISH',
    display: 'Fruits de mer',
    synonyms: ['crustaces', 'crevettes', 'homard'],
    abbreviations: [],
    normalizedForms: ['fruits de mer', 'crustace'],
    isActive: true,
  },

  // Environmental
  {
    id: 'allergen-pollen',
    system: 'FREE_TEXT',
    code: 'ENV-POLLEN',
    display: 'Pollens',
    synonyms: ['rhume des foins', 'allergie saisonniere'],
    abbreviations: [],
    normalizedForms: ['pollen'],
    isActive: true,
  },
  {
    id: 'allergen-dust',
    system: 'FREE_TEXT',
    code: 'ENV-DUST',
    display: 'Acariens',
    synonyms: ['poussiere', 'dust mites'],
    abbreviations: [],
    normalizedForms: ['acarien', 'poussiere'],
    isActive: true,
  },
  {
    id: 'allergen-cat',
    system: 'FREE_TEXT',
    code: 'ENV-CAT',
    display: 'Allergie aux poils de chat',
    synonyms: ['chat', 'poils chat', 'fel d1'],
    abbreviations: ['POIL'],
    normalizedForms: ['poils chat', 'allergie chat'],
    isActive: true,
  },
  {
    id: 'allergen-dog',
    system: 'FREE_TEXT',
    code: 'ENV-DOG',
    display: 'Allergie aux poils de chien',
    synonyms: ['chien', 'poils chien'],
    abbreviations: ['POIL'],
    normalizedForms: ['poils chien', 'allergie chien'],
    isActive: true,
  },
  {
    id: 'allergen-rabbit',
    system: 'FREE_TEXT',
    code: 'ENV-RABBIT',
    display: 'Allergie aux poils de lapin',
    synonyms: ['lapin', 'poils lapin'],
    abbreviations: ['POIL'],
    normalizedForms: ['poils lapin', 'allergie lapin'],
    isActive: true,
  },

  // Materials
  {
    id: 'allergen-latex',
    system: 'FREE_TEXT',
    code: 'MAT-LATEX',
    display: 'Latex',
    synonyms: ['caoutchouc'],
    abbreviations: [],
    normalizedForms: ['latex'],
    isActive: true,
  },
  {
    id: 'allergen-nickel',
    system: 'FREE_TEXT',
    code: 'MAT-NICKEL',
    display: 'Nickel',
    synonyms: ['bijoux', 'metal'],
    abbreviations: [],
    normalizedForms: ['nickel'],
    isActive: true,
  },

  // Contrast agents
  {
    id: 'allergen-iodine',
    system: 'FREE_TEXT',
    code: 'CONTRAST-IODINE',
    display: 'Produits de contraste iodes',
    synonyms: ['iode', 'scanner', 'PCI'],
    abbreviations: ['PCI'],
    normalizedForms: ['iode', 'produit contraste'],
    isActive: true,
  },
];

// ============================================================================
// COMBINED CONCEPTS DATABASE
// ============================================================================

const ALL_CONCEPTS: TerminologyConcept[] = [
  ...CIM10_CONCEPTS,
  ...CISP2_CONCEPTS,
  ...CCAM_CONCEPTS,
  ...ALLERGEN_CONCEPTS,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateMatchScore(
  query: string,
  concept: TerminologyConcept
): { score: number; matchType: TerminologySuggestion['matchType'] } {
  const normalizedQuery = normalizeText(query);
  const queryUpper = query.toUpperCase().trim();

  // Exact code match (highest priority)
  if (concept.code.toUpperCase() === queryUpper) {
    return { score: 100, matchType: 'exact' };
  }

  // Abbreviation match
  if (concept.abbreviations.some((abbr) => abbr.toUpperCase() === queryUpper)) {
    return { score: 95, matchType: 'abbreviation' };
  }

  // Check global abbreviations
  const expandedTerms = ABBREVIATIONS[queryUpper];
  if (expandedTerms) {
    for (const expanded of expandedTerms) {
      const normalizedExpanded = normalizeText(expanded);
      if (
        concept.normalizedForms.some((form) => form.includes(normalizedExpanded)) ||
        normalizeText(concept.display).includes(normalizedExpanded)
      ) {
        return { score: 90, matchType: 'abbreviation' };
      }
    }
  }

  // Exact display match
  if (normalizeText(concept.display) === normalizedQuery) {
    return { score: 88, matchType: 'exact' };
  }

  // Prefix match on display
  if (normalizeText(concept.display).startsWith(normalizedQuery)) {
    return { score: 80, matchType: 'prefix' };
  }

  // Prefix match on normalized forms
  for (const form of concept.normalizedForms) {
    if (form.startsWith(normalizedQuery)) {
      return { score: 75, matchType: 'prefix' };
    }
  }

  // Synonym match
  for (const synonym of concept.synonyms) {
    const normalizedSynonym = normalizeText(synonym);
    if (normalizedSynonym === normalizedQuery) {
      return { score: 70, matchType: 'synonym' };
    }
    if (normalizedSynonym.startsWith(normalizedQuery)) {
      return { score: 65, matchType: 'synonym' };
    }
    if (normalizedSynonym.includes(normalizedQuery)) {
      return { score: 55, matchType: 'synonym' };
    }
  }

  // Contains match on display
  if (normalizeText(concept.display).includes(normalizedQuery)) {
    return { score: 50, matchType: 'fuzzy' };
  }

  // Contains match on normalized forms
  for (const form of concept.normalizedForms) {
    if (form.includes(normalizedQuery)) {
      return { score: 45, matchType: 'fuzzy' };
    }
  }

  return { score: 0, matchType: 'fuzzy' };
}

function getHighlightRanges(
  text: string,
  query: string
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  let startIndex = 0;

  while (true) {
    const index = normalizedText.indexOf(normalizedQuery, startIndex);
    if (index === -1) break;
    ranges.push({ start: index, end: index + normalizedQuery.length });
    startIndex = index + 1;
  }

  return ranges;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export interface TerminologySearchOptions {
  systems?: TerminologySystem[];
  limit?: number;
  minScore?: number;
}

export async function searchTerminology(
  query: string,
  options: TerminologySearchOptions = {}
): Promise<TerminologySuggestion[]> {
  const { systems, limit = 10, minScore = 30 } = options;

  if (!query || query.length < 1) {
    return [];
  }

  // Simulate async delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 50));

  let concepts = ALL_CONCEPTS;

  // Filter by system if specified
  if (systems && systems.length > 0) {
    concepts = concepts.filter((c) => systems.includes(c.system));
  }

  // Calculate scores and filter
  const suggestions: TerminologySuggestion[] = concepts
    .map((concept) => {
      const { score, matchType } = calculateMatchScore(query, concept);
      return {
        concept,
        score,
        matchType,
        highlightRanges: getHighlightRanges(concept.display, query),
      };
    })
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return suggestions;
}

export async function searchConditions(query: string, limit = 10): Promise<TerminologySuggestion[]> {
  return searchTerminology(query, {
    systems: ['CIM10', 'CISP2'],
    limit,
  });
}

export async function searchProcedures(query: string, limit = 10): Promise<TerminologySuggestion[]> {
  return searchTerminology(query, {
    systems: ['CCAM'],
    limit,
  });
}

export async function searchAllergens(query: string, limit = 10): Promise<TerminologySuggestion[]> {
  return searchTerminology(query, {
    systems: ['ATC', 'FREE_TEXT'],
    limit,
  });
}

export function getConceptByCode(
  system: TerminologySystem,
  code: string
): TerminologyConcept | undefined {
  return ALL_CONCEPTS.find(
    (c) => c.system === system && c.code.toUpperCase() === code.toUpperCase()
  );
}

export function getConceptById(id: string): TerminologyConcept | undefined {
  return ALL_CONCEPTS.find((c) => c.id === id);
}

// Export constants for external use
export { ABBREVIATIONS, CIM10_CONCEPTS, CISP2_CONCEPTS, CCAM_CONCEPTS, ALLERGEN_CONCEPTS };
