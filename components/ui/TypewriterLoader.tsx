"use client";

import React from 'react';
import styles from './TypewriterLoader.module.css';

/**
 * TypewriterLoader - A premium, purely CSS-based loader themed for official paperwork.
 * Used primarily in the Content Lab during document generation.
 */
const TypewriterLoader = () => {
  return (
    <div className={styles.typewriter}>
      <div className={styles.slide}><i></i></div>
      <div className={styles.paper}></div>
      <div className={styles.keyboard}></div>
    </div>
  );
};

export default TypewriterLoader;
