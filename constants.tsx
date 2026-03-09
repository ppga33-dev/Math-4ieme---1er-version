
import { MathTopic } from './types';

export const MATH_TOPICS: MathTopic[] = [
  // Nombres et Calculs
  {
    id: 'relatifs',
    title: 'Nombres Relatifs',
    category: 'Nombres et Calculs',
    description: 'Maîtriser les 4 opérations sur les nombres positifs et négatifs, règles des signes.',
    icon: '➕',
    progress: 0,
    cheatSheet: {
      formulas: ['(+a) + (+b) = +(a+b)', '(-a) + (-b) = -(a+b)', 'a - b = a + (-b)'],
      definitions: ['Un nombre relatif est composé d\'un signe (+ ou -) et d\'une distance à zéro.', 'La somme de deux nombres opposés est égale à zéro.']
    },
    realWorldApplications: [
      { title: 'Températures', description: 'Mesurer le froid (-10°C) et le chaud (+30°C).', icon: '🌡️' },
      { title: 'Banque', description: 'Gérer un découvert (-50€) ou une épargne (+100€).', icon: '💰' },
      { title: 'Altitude', description: 'Niveau de la mer (0), montagne (+4810m) ou fosse marine (-11000m).', icon: '🏔️' }
    ],
    gameConfig: {
      type: 'mental-math',
      title: 'Signe Rapide',
      description: 'Calcule le résultat le plus vite possible en respectant la règle des signes !'
    }
  },
  {
    id: 'fractions',
    title: 'Fractions',
    category: 'Nombres et Calculs',
    description: 'Somme, différence, produit et quotient de fractions. Simplification de calculs.',
    icon: '➗',
    progress: 0,
    cheatSheet: {
      formulas: ['a/b + c/b = (a+c)/b', 'a/b * c/d = (ac)/(bd)', 'a/b : c/d = a/b * d/c'],
      definitions: ['Pour additionner deux fractions, elles doivent avoir le même dénominateur.', 'Diviser par un nombre revient à multiplier par son inverse.']
    },
    realWorldApplications: [
      { title: 'Cuisine', description: 'Partager une pizza ou suivre une recette (1/2 litre de lait).', icon: '🍕' },
      { title: 'Horloge', description: 'Lire l\'heure : un quart d\'heure (1/4), une demi-heure (1/2).', icon: '⏰' },
      { title: 'Soldes', description: 'Calculer une réduction (un tiers de remise).', icon: '🏷️' }
    ],
    gameConfig: {
      type: 'fraction-match',
      title: 'Puzzle de Fractions',
      description: 'Associe les fractions équivalentes pour vider le plateau.'
    }
  },
  {
    id: 'puissances',
    title: 'Puissances',
    category: 'Nombres et Calculs',
    description: 'Puissances de 10, notation scientifique et règles de calcul des puissances.',
    icon: '🔟',
    progress: 0,
    cheatSheet: {
      formulas: ['10^n = 1 suivi de n zéros', '10^-n = 0,0...01 (n zéros au total)', 'a^n * a^m = a^(n+m)'],
      definitions: ['La notation scientifique est de la forme a * 10^n avec 1 ≤ a < 10.', 'Un exposant négatif indique l\'inverse d\'une puissance.']
    },
    realWorldApplications: [
      { title: 'Astronomie', description: 'Calculer des distances immenses (1,5 * 10^8 km pour Terre-Soleil).', icon: '🚀' },
      { title: 'Informatique', description: 'Capacité de stockage (Giga = 10^9 octets).', icon: '💾' },
      { title: 'Biologie', description: 'Taille des cellules ou des virus (micromètres = 10^-6 m).', icon: '🔬' }
    ]
  },
  {
    id: 'calcul-litteral',
    title: 'Calcul Littéral & Équations',
    category: 'Nombres et Calculs',
    description: 'Développement (distributivité simple), réduction et résolution d\'équations du premier degré.',
    icon: 'x²',
    progress: 0,
    cheatSheet: {
      formulas: ['k(a + b) = ka + kb', '(a + b)(c + d) = ac + ad + bc + bd', 'ax + b = c => ax = c - b'],
      definitions: ['Développer, c\'est transformer un produit en une somme.', 'Réduire, c\'est regrouper les termes de même nature.']
    },
    realWorldApplications: [
      { title: 'Architecture', description: 'Calculer des surfaces variables (x + 2) * (y + 3).', icon: '🏛️' },
      { title: 'Économie', description: 'Modéliser des coûts de production avec des variables.', icon: '📊' },
      { title: 'Ingénierie', description: 'Résoudre des problèmes complexes en isolant l\'inconnue.', icon: '⚙️' }
    ],
    gameConfig: {
      type: 'equation-balance',
      title: 'Équilibre l\'Équation',
      description: 'Trouve la valeur de x pour équilibrer la balance.'
    }
  },
  // Espace et Géométrie
  {
    id: 'pythagore',
    title: 'Théorème de Pythagore',
    category: 'Espace et Géométrie',
    description: 'Calculer une longueur et utiliser la réciproque pour prouver qu\'un triangle est rectangle.',
    icon: '📐',
    progress: 0,
    cheatSheet: {
      formulas: ['a² + b² = c² (c est l\'hypoténuse)', 'c = √(a² + b²)'],
      definitions: ['L\'hypoténuse est le côté le plus long d\'un triangle rectangle, opposé à l\'angle droit.', 'La réciproque sert à prouver qu\'un triangle est rectangle.']
    },
    realWorldApplications: [
      { title: 'Construction', description: 'Vérifier qu\'un mur est bien perpendiculaire au sol.', icon: '🏗️' },
      { title: 'Navigation', description: 'Calculer la distance la plus courte entre deux points.', icon: '⛵' },
      { title: 'Écrans', description: 'Calculer la diagonale d\'un téléviseur (pouces).', icon: '📺' }
    ]
  },
  {
    id: 'thales',
    title: 'Théorème de Thalès',
    category: 'Espace et Géométrie',
    description: 'Introduction à la proportionnalité dans les triangles (configurations de base).',
    icon: '🔺',
    progress: 0,
    cheatSheet: {
      formulas: ['Si (AB) // (CD), alors OA/OC = OB/OD = AB/CD'],
      definitions: ['Le théorème de Thalès permet de calculer des longueurs dans des triangles emboîtés ou en "papillon".', 'Les droites doivent être parallèles pour appliquer le théorème.']
    },
    realWorldApplications: [
      { title: 'Topographie', description: 'Mesurer la hauteur d\'un arbre ou d\'une pyramide avec son ombre.', icon: '🌳' },
      { title: 'Photographie', description: 'Comprendre l\'agrandissement et la mise au point.', icon: '📸' },
      { title: 'Design', description: 'Créer des logos avec des proportions parfaites.', icon: '🎨' }
    ]
  },
  {
    id: 'trigo',
    title: 'Trigonométrie : Cosinus',
    category: 'Espace et Géométrie',
    description: 'Utiliser le cosinus pour calculer des angles ou des longueurs dans le triangle rectangle.',
    icon: '∡',
    progress: 0,
    cheatSheet: {
      formulas: [
        'cos(Angle) = Côté Adjacent / Hypoténuse',
        'Côté Adjacent = Hypoténuse × cos(Angle)',
        'Hypoténuse = Côté Adjacent / cos(Angle)'
      ],
      definitions: [
        'L\'hypoténuse est le côté le plus long du triangle rectangle, situé face à l\'angle droit.',
        'Le côté adjacent à un angle aigu est le côté qui forme cet angle avec l\'hypoténuse.',
        'Le cosinus est un nombre toujours compris entre 0 et 1 (pour un angle aigu).'
      ]
    },
    realWorldApplications: [
      { title: 'Navigation', description: 'Calculer des angles de cap ou de déviation.', icon: '🧭' },
      { title: 'Ingénierie', description: 'Déterminer des inclinaisons ou des pentes.', icon: '📐' },
      { title: 'Architecture', description: 'Calculer des hauteurs ou des distances inaccessibles.', icon: '🏗️' }
    ]
  },
  {
    id: 'espace',
    title: 'Espace : Pyramides et Cônes',
    category: 'Espace et Géométrie',
    description: 'Représentation en perspective, patrons et calcul de volumes.',
    icon: '🧊',
    progress: 0,
    cheatSheet: {
      formulas: [
        'Volume Pyramide = (1/3) × Aire de la base × Hauteur',
        'Volume Cône = (1/3) × π × r² × h',
        'Volume Cylindre = π × r² × h'
      ],
      definitions: [
        'Une pyramide est un solide dont la base est un polygone et les faces latérales sont des triangles.',
        'Un cône de révolution est un solide obtenu en faisant tourner un triangle rectangle autour d\'un de ses côtés.',
        'La hauteur est le segment perpendiculaire à la base passant par le sommet.'
      ]
    },
    realWorldApplications: [
      { title: 'Architecture', description: 'Calculer le volume d\'une pièce ou d\'un bâtiment.', icon: '🏛️' },
      { title: 'Logistique', description: 'Optimiser le remplissage de conteneurs ou de silos.', icon: '📦' },
      { title: 'Design', description: 'Création de packagings ou d\'objets 3D.', icon: '🎨' }
    ]
  },
  // Organisation de données
  {
    id: 'proportionalite',
    title: 'Proportionnalité',
    category: 'Données et Fonctions',
    description: 'Vitesse moyenne, pourcentages, agrandissement et réduction.',
    icon: '📈',
    progress: 0,
    cheatSheet: {
      formulas: [
        'Vitesse moyenne (v) = Distance (d) / Temps (t)',
        'Produit en croix : Si a/b = c/d alors a × d = b × c',
        'Échelle = Distance sur la carte / Distance réelle'
      ],
      definitions: [
        'Deux grandeurs sont proportionnelles si on passe de l\'une à l\'autre en multipliant par un nombre fixe (coefficient).',
        'Un pourcentage est une fraction dont le dénominateur est 100.',
        'Agrandir ou réduire une figure conserve les mesures d\'angles mais multiplie les longueurs par un rapport k.'
      ]
    },
    realWorldApplications: [
      { title: 'Vitesse', description: 'Calculer le temps de trajet pour un voyage (v = d/t).', icon: '🚗' },
      { title: 'Économies', description: 'Calculer des remises ou des intérêts bancaires.', icon: '💸' },
      { title: 'Cartographie', description: 'Utiliser les échelles sur une carte (1 cm = 10 km).', icon: '🗺️' }
    ]
  },
  {
    id: 'stats-probas',
    title: 'Stats et Probabilités',
    category: 'Données et Fonctions',
    description: 'Moyenne, fréquence, étendue et initiation aux expériences aléatoires.',
    icon: '📊',
    progress: 0,
    cheatSheet: {
      formulas: [
        'Moyenne = Somme des valeurs / Effectif total',
        'Fréquence = Effectif / Effectif total',
        'Probabilité = Cas favorables / Cas possibles'
      ],
      definitions: [
        'L\'étendue est la différence entre la plus grande et la plus petite valeur d\'une série.',
        'Une expérience aléatoire est une expérience dont on connaît les issues sans pouvoir prévoir laquelle se produira.',
        'Un événement est un ensemble d\'issues.'
      ]
    },
    realWorldApplications: [
      { title: 'Sondages', description: 'Analyser les opinions d\'une population.', icon: '🗳️' },
      { title: 'Jeux', description: 'Calculer ses chances de gagner au loto ou aux dés.', icon: '🎲' },
      { title: 'Météo', description: 'Prédire la probabilité de pluie.', icon: '🌧️' }
    ]
  },
  // Algorithmique
  {
    id: 'algorithmique',
    title: 'Algorithmique & Scratch',
    category: 'Algorithmique',
    description: 'Boucles, variables et conditions pour créer des programmes simples.',
    icon: '💻',
    progress: 0,
    gameConfig: {
      type: 'logic-puzzle',
      title: 'Code Master',
      description: 'Complète les séquences logiques pour faire avancer le robot.'
    },
    cheatSheet: {
      formulas: [
        'Si [Condition] Alors [Action] Sinon [Autre Action]',
        'Répéter [Nombre] fois [Actions]',
        'Variable ← Valeur (Affectation)'
      ],
      definitions: [
        'Un algorithme est une suite finie et ordonnée d\'instructions.',
        'Une boucle permet de répéter un bloc d\'instructions tant qu\'une condition est vraie.',
        'Un événement (comme "quand le drapeau est cliqué") déclenche l\'exécution d\'un script.'
      ]
    }
  }
];

export const APP_THEME = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  background: '#f8fafc',
  text: '#1e293b'
};
