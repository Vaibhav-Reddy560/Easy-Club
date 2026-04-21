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
 * Features harmonic concentric pulses and dual outward energy ripples.
 */
const PremiumLoader = ({ size = 'md', className = '', dotCount = 5 }: PremiumLoaderProps) => {
  return (
    <div className={`${styles.loaderContainer} ${styles[size]} ${className}`}>
      {[...Array(dotCount)].map((_, i) => (
        <div key={i} className={styles.circle}>
          <div className={styles.dot} />
          {/* Dual ripples for depth and separation from the core circles */}
          <div className={`${styles.ripple} ${styles.ripple1}`} />
          <div className={`${styles.ripple} ${styles.ripple2}`} />
        </div>
      ))}
    </div>
  );
};

export default PremiumLoader;
