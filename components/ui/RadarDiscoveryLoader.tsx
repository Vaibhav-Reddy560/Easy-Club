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
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.sweep} />
        <div id={styles["dot-1"]} className={styles.dot} />
        <div id={styles["dot-2"]} className={styles.dot} />
        <div id={styles["dot-3"]} className={styles.dot} />
        <div id={styles["dot-4"]} className={styles.dot} />
        <div id={styles["dot-5"]} className={styles.dot} />
      </div>
      {label && <p className={styles.statusText}>{label}</p>}
    </div>
  );
}

export default RadarDiscoveryLoader;
