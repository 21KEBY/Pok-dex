import './MovesList.css'

const MovesList = ({ moves, pokemonName }) => {
  if (!moves || moves.length === 0) {
    return (
      <div className="moves-section">
        <h3>Capacités</h3>
        <p className="no-moves">Aucune capacité disponible</p>
      </div>
    )
  }

  return (
    <div className="moves-section">
      <h3>Capacités ({moves.length})</h3>
      <div className="moves-grid">
        {moves.map((move, index) => (
          <div key={index} className="move-card">
            <div className="move-name">
              {move.move?.name?.replace(/-/g, ' ') || 'Capacité inconnue'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovesList
