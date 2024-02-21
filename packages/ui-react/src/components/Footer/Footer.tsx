import React from 'react';
import classNames from 'classnames';
import { IS_DEVELOPMENT_BUILD } from '@jwp/ott-common/src/utils/common';

import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './Footer.module.scss';

const MARKDOWN_LINK_REGEX = /\[([^[]+)]\(((https?:\/\/|www\.)?[^)]+)\)/gi;

type Props = {
  text: string;
};

const Footer: React.FC<Props> = ({ text }) => {
  const linkMatches = text.match(MARKDOWN_LINK_REGEX)?.length || 0;
  const chunks = text.split('|');

  return (
    // The extra style below is just to fix the footer on mobile when the dev selector is shown
    <footer className={classNames(styles.footer, { [styles.testFixMargin]: IS_DEVELOPMENT_BUILD })}>
      {(() => {
        const footerContent = chunks.map((value, index) => (
          <MarkdownComponent key={index} markdownString={value} inline tag={chunks.length > 1 ? 'li' : 'div'} />
        ));

        if (linkMatches > 0) {
          return <nav>{chunks.length > 1 ? <ul className={styles.list}>{footerContent}</ul> : footerContent}</nav>;
        } else if (chunks.length > 1) {
          return <ul className={styles.list}>{footerContent}</ul>;
        } else {
          return footerContent;
        }
      })()}
    </footer>
  );
};

export default Footer;
