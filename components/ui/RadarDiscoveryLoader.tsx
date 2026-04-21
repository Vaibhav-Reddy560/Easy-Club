"use client";

import React from 'react';
import styles from './RadarDiscoveryLoader.module.css';

interface RadarDiscoveryLoaderProps {
  label?: string;
  className?: string;
}

const RadarDiscoveryLoader = ({ label = "Initializing discovery sequence", className = "" }: RadarDiscoveryLoaderProps) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.loader}>
        {/* Static concentric rings */}
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.ring3} />

        {/* Single rotating wrapper — contains BOTH the sweep tail AND the line. They rotate together, perfectly aligned. */}
        <div className={styles.rotator}>
          {/* Atmospheric sweep tail (conic gradient) */}
          <div className={styles.sweepTail} />
          {/* The single sharp line — child of rotator, always at the same angle as the tail's leading edge */}
          <div className={styles.sweepLine} />
        </div>

        {/* Central hub */}
        <div className={styles.hub} />

        {/* Discovery dots */}
        <div className={`${styles.dot} ${styles.dot1}`} />
        <div className={`${styles.dot} ${styles.dot2}`} />
        <div className={`${styles.dot} ${styles.dot3}`} />
        <div className={`${styles.dot} ${styles.dot4}`} />
        <div className={`${styles.dot} ${styles.dot5}`} />
      </div>
      {label && <p className={styles.statusText}>{label}</p>}
    </div>
  );
}

export default RadarDiscoveryLoader;
