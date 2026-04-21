"use client";

import React from 'react';
import styles from './PremiumLoader.module.css';

interface PremiumLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dotCount?: number; /* Matches screenshot reference (4 dots) */
}

/**
 * PremiumLoader - High-fidelity loader refined from visual references.
 * Features a speck-to-core growth cycle and large atmospheric ripples.
 */
const PremiumLoader = ({ size = 'md', className = '', dotCount = 4 }: PremiumLoaderProps) => {
  return (
    <div className={`${styles.loaderContainer} ${styles[size]} ${className}`}>
      {[...Array(dotCount)].map((_, i) => (
        <div key={i} className={styles.circle}>
          <div className={styles.dot} />
          <div className={styles.ripple} />
        </div>
      ))}
    </div>
  );
};

export default PremiumLoader;
