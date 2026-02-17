import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GachaPage.css';

function GachaPage() {
  const navigate = useNavigate();
  const [selectedPack, setSelectedPack] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [pulledPokemon, setPulledPokemon] = useState(null);

  const packs = [
    {
      id: 'all',
      name: 'Pack Toutes Générations',
      description: 'Un Pokémon aléatoire parmi toutes les générations',
      icon: '🌟',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      ranges: { common: [1, 300], rare: [301, 600], epic: [601, 800], legendary: [801, 1025] }
    },
    {
      id: 'gen1',
      name: 'Pack Génération 1',
      description: 'Les légendaires Pokémons de Kanto',
      icon: '🔴',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      ranges: { common: [1, 50], rare: [51, 100], epic: [101, 140], legendary: [141, 151] }
    },
    {
      id: 'gen2',
      name: 'Pack Génération 2',
      description: 'Les mystérieux Pokémons de Johto',
      icon: '🟡',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      ranges: { common: [152, 180], rare: [181, 210], epic: [211, 240], legendary: [241, 251] }
    },
    {
      id: 'gen3',
      name: 'Pack Génération 3',
      description: 'Les puissants Pokémons de Hoenn',
      icon: '🟢',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      ranges: { common: [252, 290], rare: [291, 330], epic: [331, 370], legendary: [371, 386] }
    },
    {
      id: 'gen4',
      name: 'Pack Génération 4',
      description: 'Les extraordinaires Pokémons de Sinnoh',
      icon: '🔵',
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      ranges: { common: [387, 425], rare: [426, 465], epic: [466, 485], legendary: [486, 493] }
    },
  ];

  const handleOpenPack = async (pack) => {
    setSelectedPack(pack);
    setIsOpening(true);
    setPulledPokemon(null);
    setIsRevealing(false);

    setTimeout(async () => {
      setIsOpening(false);

      // Calcul de la rareté
      const random = Math.random() * 100;
      let rarity, range;

      if (random < 60) {
        rarity = 'COMMUN';
        range = pack.ranges.common;
      } else if (random < 85) {
        rarity = 'RARE';
        range = pack.ranges.rare;
      } else if (random < 95) {
        rarity = 'ÉPIQUE';
        range = pack.ranges.epic;
      } else {
        rarity = 'LÉGENDAIRE';
        range = pack.ranges.legendary;
      }

      // Sélection ID aléatoire
      const randomId = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

      try {
        const details = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const species = await axios.get(details.data.species.url);

        const frenchName =
          species.data.names.find((name) => name.language.name === "fr")?.name ||
          details.data.name;

        const gifUrl = `https://projectpokemon.org/images/normal-sprite/${details.data.name}.gif`;

        const pokemon = {
          id: details.data.id,
          name: frenchName,
          nameEn: details.data.name,
          image: gifUrl,
          fallbackImage: details.data.sprites.other["official-artwork"].front_default,
          types: details.data.types.map((type) => type.type.name),
          rarity,
        };

        setPulledPokemon(pokemon);
        setIsRevealing(true);
      } catch (error) {
        console.error("Erreur lors du tirage:", error);
        setIsOpening(false);
      }
    }, 2000);
  };

  const handleViewPokemon = () => {
    if (pulledPokemon) {
      navigate(`/pokemon/${pulledPokemon.id}`);
    }
  };

  const handleNewPull = () => {
    setIsRevealing(false);
    setPulledPokemon(null);
    setSelectedPack(null);
  };

  return (
    <div className="gacha-page">
      <div className="gacha-header">
        <h1 className="gacha-title">Boutique de Boosters</h1>
        <p className="gacha-subtitle">Choisis ton pack et tente ta chance !</p>
      </div>

      {!isOpening && !isRevealing && (
        <div className="gacha-packs">
          {packs.map((pack) => (
            <div key={pack.id} className="pack-card">
              <div className="pack-image">
                <div className="booster-pack-design" style={{
                  background: pack.color,
                }}>
                  <div className="pack-top"></div>
                  <div className="pack-main">
                    <div className="pokemon-logo">POKÉMON</div>
                    <div className="pack-edition">{pack.name}</div>
                    <div className="pack-count">1 POKÉMON</div>
                  </div>
                  <div className="pack-shine"></div>
                </div>
              </div>
              <h3>{pack.name}</h3>
              <div className="pack-rates">
                <div className="rate-item">
                  <span className="rate-dot common"></span>
                  <span>Commun: 60%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-dot uncommon"></span>
                  <span>Rare: 25%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-dot rare"></span>
                  <span>Épique: 10%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-dot legendary"></span>
                  <span>Légendaire: 5%</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenPack(pack)}
                className="open-pack-button"
              >
                Ouvrir le Pack
              </button>
            </div>
          ))}
        </div>
      )}

      {isOpening && (
        <div className="opening-animation">
          <div className="pack-opening">
            <div className="pack-shake">
              <div className="pack-visual" style={{ background: selectedPack.color }}>
                <div className="pack-icon-large">{selectedPack.icon}</div>
              </div>
            </div>
            <p className="opening-text">Ouverture du pack...</p>
          </div>
        </div>
      )}

      {isRevealing && pulledPokemon && (
        <div className="reveal-container">
          <div className={`reveal-card rarity-${pulledPokemon.rarity.toLowerCase()}`}>
            <div className="rarity-badge">{pulledPokemon.rarity}</div>
            <div className="reveal-image-wrapper">
              <img
                src={pulledPokemon.image}
                alt={pulledPokemon.name}
                className="reveal-image"
                onError={(e) => {
                  e.target.src = pulledPokemon.fallbackImage;
                }}
              />
            </div>
            <h2 className="reveal-name">{pulledPokemon.name}</h2>
            <div className="reveal-types">
              {pulledPokemon.types.map((type) => (
                <span key={type} className={`type-badge type-${type}`}>
                  {type}
                </span>
              ))}
            </div>
            <div className="reveal-actions">
              <button onClick={handleViewPokemon} className="view-button">
                📋 Voir les Détails
              </button>
              <button onClick={handleNewPull} className="new-pull-button">
                🎲 Nouveau Tirage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GachaPage;
