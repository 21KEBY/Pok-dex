/**
 * Utilitaires pour la traduction des éléments Pokémon
 */

// Traduction des types Pokémon
export const typeTranslations = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Électrik',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée'
}

// Traduction des statistiques
export const statTranslations = {
  'hp': 'PV',
  'attack': 'Attaque',
  'defense': 'Défense',
  'special-attack': 'Att. Spé.',
  'special-defense': 'Déf. Spé.',
  'speed': 'Vitesse'
}

/**
 * Traduit un type Pokémon en français
 * @param {string} type - Type en anglais
 * @returns {string} Type en français
 */
export const translateType = (type) => {
  return typeTranslations[type.toLowerCase()] || type
}

/**
 * Traduit une statistique en français
 * @param {string} stat - Stat en anglais
 * @returns {string} Stat en français
 */
export const translateStat = (stat) => {
  return statTranslations[stat.toLowerCase()] || stat
}

/**
 * Normalise une chaîne pour la recherche (retire accents, minuscule)
 * @param {string} str - Chaîne à normaliser
 * @returns {string} Chaîne normalisée
 */
export const normalizeForSearch = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
