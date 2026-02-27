import styles from './SplashLoader.module.css';

export default function SplashLoader() {
  return (
    <div className={styles.splash}>
      <div className={styles.spines}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={styles.spine}
            style={{ '--i': i } as React.CSSProperties}
          />
        ))}
      </div>
      <p className={styles.wordmark}>Third Shelf</p>
    </div>
  );
}
