"use client";
import React from 'react';
import styles from './DesignLoader.module.css';

interface DesignLoaderProps {
  className?: string;
}

/**
 * DesignLoader - A thematic "sketching" loader for the Design Studio.
 * Visualizes a pencil drawing a line, adapted to the signature gold aesthetic.
 */
export default function DesignLoader({ className = "" }: DesignLoaderProps) {
  return (
    <div className={`${styles.loaderContainer} ${className}`}>
      <div className={styles.loader} />
    </div>
  );
}
