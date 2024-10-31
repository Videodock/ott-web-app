import React, { type PropsWithChildren } from 'react';

import Image from '../Image/Image';

import styles from './Hero.module.scss';

type Props = PropsWithChildren<{
  image?: string;
}>;

const Hero = ({ image, children }: Props) => {
  const alt = ''; // intentionally empty for a11y, because adjacent text alternative

  return (
    <div className={styles.hero}>
      <Image className={styles.poster} image={image} width={1280} alt={alt} />
      <div className={styles.posterFade} />
      <div className={styles.info}>{children}</div>
    </div>
  );
};

export default Hero;
