import React, { useEffect, useState } from 'react';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { logDev } from '@jwp/ott-common/src/utils/common';

import styles from './Image.module.scss';

type Props = {
  className?: string;
  image?: string;
  onLoad?: () => void;
  alt?: string;
  width?: number;
};

const setWidth = (url: string, width: number) => {
  return createURL(url, { width });
};

const imageCache = new Map();

const Image = ({ className, image, onLoad, alt = '', width = 640 }: Props) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!image) return;

    const cachedSrc = imageCache.get(image);
    if (cachedSrc) {
      setSrc(cachedSrc);
      onLoad?.();
      return;
    }

    const loadImage = async () => {
      try {
        const response = await fetch(setWidth(image, width));
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        imageCache.set(image, objectURL);
        setSrc(objectURL);
        onLoad?.();
      } catch (error) {
        logDev('Failed to load image:', error);
      }
    };

    loadImage();
  }, [image, width, onLoad]);

  if (!src) return null;

  return <img className={`${className} ${styles.image}`} src={src} alt={alt} />;
};

export default React.memo(Image);
