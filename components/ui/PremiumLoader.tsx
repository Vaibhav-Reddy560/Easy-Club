"use client";

import React from 'react';
import styles from './PremiumLoader.module.css';

interface PremiumLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dotCount?: number;
}

/**
 * PremiumLoader - A high-fidelity, Gold-themed multi-dot loader.
 * Replaces standard loading spinners across the app for a premium feel.
 */
const PremiumLoader = ({ size = 'md', className = '', dotCount = 5 }: PremiumLoaderProps) => {
  return (
    <div className={`${styles.loaderContainer} ${styles[size]} ${className}`}>
      {[...Array(dotCount)].map((_, i) => (
        <div key={i} className={styles.circle}>
          <div className={styles.dot} />
          <div className={styles.outline} />
        </div>
      ))}
    </div>
  );
};

export default PremiumLoader;
