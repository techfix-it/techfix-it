'use client';

import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className={styles.pageHeader}>
      <div className={styles.overlay}></div>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
