import React, { useEffect, useState } from 'react';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';

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

const cache = new Map();

const resolveImageURL = async (imgUrl: string, width: number) => {
  const requestUrl = setWidth(imgUrl, width);
  let url = requestUrl;

  if (cache.has(requestUrl)) {
    return cache.get(requestUrl);
  }

  const response = await fetch(requestUrl);

  // if redirected, cache and return resolved URL
  if (response.redirected) {
    url = response.url.replace('-1920', `-${width}`);
  }

  cache.set(requestUrl, url);

  return url;
};

const Image = ({ className, image, onLoad, alt = '', width = 640 }: Props) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;

    const loadImage = async () => {
      const resolvedImage = await resolveImageURL(image, width);

      setSrc(resolvedImage);
      onLoad?.();
    };

    loadImage();
  }, [image, width, onLoad]);

  if (!src) return null;

  return <img className={`${className} ${styles.image}`} src={src} alt={alt} />;
};

export default React.memo(Image);
