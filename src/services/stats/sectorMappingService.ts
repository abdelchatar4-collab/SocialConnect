/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sector Mapping Service
Extracted from src/app/api/stats/users-by-sector/route.ts
*/

/**
 * Clean address to extract street and number
 */
export const cleanAddress = (addressString: string | null | undefined) => {
    if (!addressString) return { street: "", number: "" };

    if (addressString.toLowerCase().includes('sans adresse') ||
        addressString.toLowerCase().includes('sdf')) {
        return { street: "Sans Adresse", number: "" };
    }

    let street = addressString;
    let number = "";

    const numberMatch = addressString.match(/(\d+)(?:[\s\/]|$|\s*boîte|\s*B\d|\s*A\d|\s*étage)/);
    if (numberMatch) {
        number = numberMatch[1];
        const numberIndex = addressString.indexOf(number);
        if (numberIndex > 0) {
            street = addressString.substring(0, numberIndex).trim();
        }
    }

    street = street.replace(/\d+[\s\/].*$/, '').trim();

    if (street.match(/\d+-\d+/)) {
        street = street.replace(/\s+\d+-\d+.*$/, '').trim();
    }

    return { street, number };
};

/**
 * Configuration for sectors and their associated keywords
 */
export const SECTOR_CONFIG = {
    mappings: [
        {
            sector: 'Cureghem',
            keywords: [
                'clemenceau', 'poincare', 'mons 1-153', 'petite senne', 'equerre',
                'alphonse lemmens', 'bara', 'abbe cuylits', 'bisse', 'brogniez',
                'broyere', 'bougie', 'clinique', 'poterie', 'rosee', 'autonomie',
                'liverpool', 'materiaux', 'megissiers', 'docteur de meersman', 'chimiste',
                'compas', 'foppens', 'gheude', 'haberman', 'heyvaert', 'jules ruhl',
                'lambert crickx', 'leon delacroix', 'limnander', 'memling', 'moretus',
                'odon', 'otlet', 'plantin', 'ropsy chaudron', 'aviation', 'robert pequeur',
                'france', 'ancienne gare', 'flins', 'brasserie', 'revision', 'mons 155-451',
                'mudra', 'crickx', 'conseil', 'grisar', 'jorez', 'auguste gevaert',
                'bara', 'charles parente', 'chome-wyns', 'fiennes', 'ecole moderne',
                'electricite', 'instruction', 'bassins', 'deux gares', 'goujons',
                'marchandises', 'veterinaires', 'docteur kuborn', 'chapeau', 'collecteur',
                'constructeur', 'transvaal', 'eloy', 'emile carpentier', 'ernest blerot',
                'georges moreau', 'jorez', 'joseph dujardin', 'pasteur', 'previnaire',
                'raphael', 'robert bosch', 'rossini', 'ruysdael', 'sergent de bruyne',
                'van lint', 'albert ier', 'jules et edmond miesse', 'quai'
            ]
        },
        {
            sector: 'Industrie',
            keywords: [
                'hof ter biest', 'cerf', 'bollinckx', 'aa', 'dante', 'biestebroeck',
                'bienvenue', 'filature', 'manufacture', 'labeur', 'nieuwmolen', 'sel',
                'henri-joseph genesse', 'paepsem', 'poxcat', 'humanite', 'digue du canal',
                'quai', 'charroi', 'gouverneur nens', 'emile vandervelde', 'international',
                'petite-ile', 'developpement', 'ile sainte helene'
            ]
        },
        {
            sector: 'La Roue',
            keywords: [
                'orpins', 'cardamines', 'dauphinelles', 'edelweiss', 'immortelles',
                'millepertuis', 'pimprenelles', 'stellaires', 'soldat britannique',
                'michel de ghelderode', 'mons 1425-1447', 'asters', 'marguerites',
                'saponaires', 'soldanelles', 'chant oiseaux', 'linaigrettes', 'paul ooghe',
                'perseverance', 'societe nationale', 'saio', 'droits de homme', 'emile gryson',
                'eugene baie', 'guillaume melckmans', 'guillaume stassart', 'marc henri',
                'simone veil', 'venizelos', 'waxweiler', 'aristide briand', 'mons 861-1293',
                'etangs', 'marie kore', 'colombophiles', 'resedas', 'stadium', 'loups',
                'moulin', 'bizet', 'confort', 'ernest sjonghers', 'wauters', 'plaine',
                'loisirs', 'veeweyde', 'lennik', 'alexandre pierrard', 'arthur dehem',
                'claude debussy', 'clement de clety', 'daniel van damme', 'bethanie',
                'mecanique', 'promenade', 'solidarite', 'sympathie', 'tranquillite',
                'volonte', 'architecture', 'emancipation', 'energie', 'zuen', 'delwart',
                'alouettes', 'bateliers', 'citoyens', 'fraises', 'grives', 'huit heures',
                'plebeiens', 'resedas', 'trefles', 'docteur roux', 'bouquet', 'pre',
                'savoir', 'symbole', 'felicien rops', 'felix de cuyper', 'florimond de pauw',
                'frans hals', 'fridtjof nansen', 'hector genard', 'henri deleers', 'hoorickx',
                'jacques boon', 'james cook', 'jean note', 'pierre schlosser', 'raymond ebrant',
                'robert buyck', 'van winghen', 'walcourt', 'dreve', 'hof ter vleest'
            ]
        },
        {
            sector: 'Neerpede',
            keywords: [
                'recherche', 'coquelicots', 'glycines', 'iris', 'jacinthes', 'perce-neige',
                'pervenches', 'luizenmolen', 'auguste bourgeois', 'fecondite', 'salubrite',
                'chanterelles', 'hortensias', 'jonquilles', 'lilas', 'itterbeek', 'henri simonet',
                'temperance', 'josse leemans', 'cepes', 'morilles', 'pleurotes', 'bolet',
                'contournement', 'olympique', 'soetkin', 'tyl uylenspiegel', 'croix-rouge',
                'aurore', 'tulipes', 'severine', 'koeivijver', 'delivrance', 'dignite',
                'floraison', 'modestie', 'sante', 'enthousiasme', 'hygiene', 'scherdemael',
                'betteraves', 'lapins', 'papillons', 'poulets', 'quarantaines', 'bonheur',
                'chaudron', 'froment', 'lievre', 'pommier', 'edouard van muylders',
                'ferdinand craps', 'gaston coudyser', 'jean lagey', 'leon nicodeme',
                'meylemeersch', 'pierre van reymenant', 'scholle', 'vlasendael',
                'fraternelle', 'joseph wybran'
            ]
        },
        {
            sector: 'Parc',
            keywords: [
                'novateurs', 'herisson', 'albert de coster', 'camille vaneukem',
                'capitaine fossoul', 'chanoine roose', 'libre academie', 'roi soldat',
                'eugene ysaye', 'gounod', 'jean sibelius', 'joseph vanhellemont',
                'pierre beyst', 'theo verbeeck', 'theo lambert', 'agaves', 'astrid',
                'pierre de tollenaere', 'chopin', 'docteur huet', 'edgar tinel',
                'emile verse', 'guillaume lekeu', 'louis van beethoven', 'egide rombaux',
                'marie curie', 'clara clairbert', 'charles de tollenaere', 'claeterbosch',
                'docteur lemoine', 'marius renard', 'nellie melba', 'romain rolland',
                'joseph bracops', 'debussy', 'joseph lemaire', 'vives', 'martin luther king',
                'antoine nys', 'vigne', 'jean-baptiste', 'pierre longin', 'frans hals',
                'jean hayet', 'victor voets', 'rene henry', 'maurice careme', 'verdi'
            ]
        },
        {
            sector: 'Peterbos',
            keywords: [
                'charles plisnier', 'commandant vander meeren', 'poesie', 'crocus',
                'jean josee', 'rene berrewaerts', 'tolstoi', 'maria groeninckx',
                'shakespeare', 'sylvain dupuis', 'ninove 623-739', 'hof te ophem',
                'veld', 'effort', 'mercator', 'rabelais', 'sainte-adresse',
                'adolphe prins', 'adolphe willemyns', 'alphonse demunter', 'buffon',
                'corneille', 'cantilene', 'caravelle', 'competition', 'corvette',
                'prose', 'agrement', 'agronome', 'ode', 'sevigne', 'demosthene',
                'aubergines', 'fruits', 'maraichers', 'broeck', 'champion', 'corail',
                'gazouillis', 'pippenzijpe', 'potaerdenberg', 'roman', 'serment',
                'sillon', 'trophee', 'elskamp', 'emile hellebaut', 'fenelon', 'henri caron',
                'henri maes', 'homere', 'horace', 'jean morjau', 'joseph van boterdael',
                'karel vande woestijne', 'lamartine', 'maria tillmans', 'martin van lier',
                'maurice albert raskin', 'mercator', 'pierre vandevoorde', 'pol stoppelaere',
                'polydore moerman', 'rabelais', 'ronsard', 'van soust', 'virgile',
                'camille paulsen', 'jules algoet', 'grande ceinture', 'sainte-adresse',
                'tarentelle'
            ]
        },
        {
            sector: 'Scheut',
            keywords: [
                'eternite', 'menestrels', 'missionnaires', 'francois malherbe',
                'leon debatty', 'norbert gille', 'raymond vander bruggen', 'felix paulsen',
                'jules graindor', 'maurice herbette', 'prince de liege', 'ninove 279-505',
                'petit-obus', 'semence', 'beaute', 'droit', 'repos', 'henri de smet',
                'fernand demets', 'achille jonas', 'beeckman de crayloo', 'commandant charcot',
                'cyriel buysse', 'birmingham', 'dilbeek', 'glasgow', 'cavatine', 'cordialite',
                'courtoisie', 'laiterie', 'pastorale', 'sincerite', 'verite', 'agrafe',
                'aiguille', 'emulation', 'expansion', 'libre examen', 'obus', 'orphelinat',
                'sebastopol', 'denis verdonck', 'orchidees', 'parfums', 'tournesols',
                'bien-etre', 'bivouac', 'devoir', 'souvenir', 'edmond delcourt',
                'edmond rostand', 'general ruquoy', 'jacques manne', 'jakob smits',
                'james ensor', 'jean van lierde', 'joseph kelchtermans', 'joseph pavez',
                'jules broeren', 'kinet', 'leopold de swaef', 'louis mascre', 'puccini',
                'romanie van dyck', 'veld', 'sylvain denayer', 'thiernesse', 'van wambeke',
                'verheyden', 'atlas', 'veterans coloniaux', 'emile vander bruggen',
                'henri rey', 'louis mettewie'
            ]
        },
        {
            sector: 'Vaillance',
            keywords: [
                'villa romaine', 'auber', 'docteur zamenhof', 'frans van kalken', 'limbourg',
                'paul janson', 'victor et jules bertaux', 'victor olivier', 'saint guidon',
                'aurore', 'biestebroeck', 'central', 'busselenberg', 'resistance', 'quai',
                'meir', 'brune', 'aumale', 'douvres', 'formanoir', 'conciliation',
                'democratie', 'gaite', 'justice', 'procession', 'institut', 'veeweyde',
                'deportes anderlechtois', 'docteur jacobs', 'bronze', 'busselenberg',
                'chapitre', 'drapeau', 'greffe', 'pretoire', 'village', 'erasme',
                'francois gerard', 'francois janssens', 'francois ysewyn',
                'gustaaf vanden berghe', 'henri vieuxtemps', 'lieutenant liedel',
                'maurice xhoneux', 'pierre biddaer', 'pierre marchant', 'porselein',
                'professeur hendrickx', 'saint guidon', 'theodore bekaert', 'victor rauter',
                'wayez', 'elsa frison', 'aristide briand', 'mons 453-859', 'linde', 'chapelain'
            ]
        }
    ],

    directMappings: {
        "Sans Adresse": "Non spécifié",
        "Route de Lennik": "La Roue",
        "Rue Wayez": "Vaillance",
        "Chaussée de Mons 1-153": "Cureghem",
        "Chaussée de Mons 155-451": "Cureghem",
        "Chaussée de Mons 453-859": "Vaillance",
        "Chaussée de Mons 861-1293": "La Roue",
        "Chaussée de Mons 1425-1447": "La Roue",
        "Chaussée de Ninove 279-505": "Scheut",
        "Chaussée de Ninove 623-739": "Peterbos"
    },

    normalize: function (sector: string | null | undefined) {
        if (!sector) return "Non spécifié";
        const normalized = sector.trim();

        const specialCases: Record<string, string> = {
            'cureghem': 'Cureghem',
            'industrie': 'Industrie',
            'la roue': 'La Roue',
            'neerpede': 'Neerpede',
            'parc': 'Parc',
            'peterbos': 'Peterbos',
            'scheut': 'Scheut',
            'vaillance': 'Vaillance'
        };

        const lower = normalized.toLowerCase();
        if (specialCases[lower]) {
            return specialCases[lower];
        }

        return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    }
};

/**
 * Range configuration for specific streets
 */
export const streetRanges: Record<string, { min: number, max: number, sector: string }[]> = {
    "chaussée de mons": [
        { min: 1, max: 153, sector: "Cureghem" },
        { min: 155, max: 451, sector: "Cureghem" },
        { min: 453, max: 859, sector: "Vaillance" },
        { min: 861, max: 1293, sector: "La Roue" },
        { min: 1425, max: 1447, sector: "La Roue" }
    ],
    "chaussée de ninove": [
        { min: 279, max: 505, sector: "Scheut" },
        { min: 623, max: 739, sector: "Peterbos" }
    ]
};

/**
 * Get sector based on street number ranges
 */
export const getSectorFromRange = (street: string, number: string): string | null => {
    const normalizedStreet = street.toLowerCase().trim();
    const num = parseInt(number, 10);

    if (isNaN(num)) return null;

    const ranges = streetRanges[normalizedStreet];
    if (!ranges) return null;

    for (const range of ranges) {
        if (num >= range.min && num <= range.max) {
            return range.sector;
        }
    }

    return null;
};

/**
 * Normalize street name for matching
 */
export const normalizeStreet = (street: string | null | undefined): string => {
    if (!street) return '';

    let normalized = street.toLowerCase().trim();
    normalized = normalized
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    normalized = normalized
        .replace(/^(rue|r\.|avenue|av\.|boulevard|bd\.|bld\.|chaussée|ch\.|place|pl\.|square|sq\.)\s+/i, '')
        .replace(/^(de|du|des|de la|d'|van|van de|van den|van der)\s+/i, '');

    normalized = normalized
        .replace(/[0-9,.;:\-_'"/\\()\[\]{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized;
};

/**
 * Process a user's address to determine their sector
 */
export const processUserSector = (user: { secteur?: string | null, adresse?: { rue?: string | null } | null }): { finalSector: string, source: string, confidence: string, originalAddress?: string | null, matchedKeyword?: string } => {
    if (user.secteur) {
        return {
            finalSector: SECTOR_CONFIG.normalize(user.secteur),
            source: 'direct',
            confidence: 'high'
        };
    }

    if (user.adresse?.rue) {
        const { street, number } = cleanAddress(user.adresse.rue);

        // Priority: Ranges
        const sectorFromRange = getSectorFromRange(street, number);
        if (sectorFromRange) {
            return {
                finalSector: sectorFromRange,
                source: 'range',
                confidence: 'high',
                originalAddress: user.adresse.rue
            };
        }

        // Priority: Keyword matching
        const normalizedStreet = normalizeStreet(street);
        if (normalizedStreet) {
            for (const mapping of SECTOR_CONFIG.mappings) {
                for (const keyword of mapping.keywords) {
                    if (normalizedStreet.includes(keyword.toLowerCase())) {
                        return {
                            finalSector: SECTOR_CONFIG.normalize(mapping.sector),
                            source: 'keyword',
                            confidence: 'medium',
                            originalAddress: user.adresse.rue,
                            matchedKeyword: keyword
                        };
                    }
                }
            }
        }
    }

    return {
        finalSector: "Non spécifié",
        source: 'default',
        confidence: 'none'
    };
};
