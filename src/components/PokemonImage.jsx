import { useState } from 'react'

const PokemonImage = ({ src, fallbackSrc, alt, className }) => {
  const [imgError, setImgError] = useState(false)

  const handleError = () => {
    setImgError(true)
  }

  return (
    <img 
      src={imgError ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  )
}

export default PokemonImage
