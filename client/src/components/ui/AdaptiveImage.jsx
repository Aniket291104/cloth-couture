import React from 'react';

const MODERN_IMAGE_REGEX = /\.(png|jpe?g)$/i;

const AdaptiveImage = ({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  onError,
}) => {
  const isLocalRasterAsset = typeof src === 'string' && src.startsWith('/images/') && MODERN_IMAGE_REGEX.test(src);
  const modernBase = isLocalRasterAsset ? src.replace(MODERN_IMAGE_REGEX, '') : null;

  const imageProps = {
    src,
    alt,
    className,
    width,
    height,
    sizes,
    loading,
    decoding,
    fetchPriority,
    onError,
  };

  if (!isLocalRasterAsset) {
    return <img {...imageProps} />;
  }

  return (
    <picture>
      <source srcSet={`${modernBase}.avif`} type="image/avif" sizes={sizes} />
      <source srcSet={`${modernBase}.webp`} type="image/webp" sizes={sizes} />
      <img {...imageProps} />
    </picture>
  );
};

export default AdaptiveImage;
