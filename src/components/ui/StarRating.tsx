import { useState, useRef } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

function formatRating(r: number): string {
  if (r === 0) return '—';
  const whole = Math.floor(r);
  const frac = r - whole;
  const fracMap: Record<string, string> = {
    '0.33': '⅓', '0.34': '⅓',
    '0.5': '½',
    '0.67': '⅔', '0.66': '⅔',
  };
  const fracStr = fracMap[frac.toFixed(2)] || (frac > 0 ? `.${Math.round(frac * 100)}` : '');
  return whole > 0 ? `${whole}${fracStr}` : fracStr;
}

export default function StarRating({ value, onChange, readonly = false, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getValueFromPosition = (clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const starWidth = rect.width / 5;
    const starIndex = Math.floor(x / starWidth);
    const posInStar = (x - starIndex * starWidth) / starWidth;

    let frac = 0;
    if (posInStar < 0.33) frac = 0.33;
    else if (posInStar < 0.67) frac = 0.5;
    else frac = 1;

    const rating = Math.min(5, Math.max(0, starIndex + frac));
    return Math.round(rating * 100) / 100;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readonly) return;
    setHover(getValueFromPosition(e.clientX));
  };

  const handleClick = (e: React.MouseEvent) => {
    if (readonly || !onChange) return;
    onChange(getValueFromPosition(e.clientX));
  };

  const displayValue = hover !== null ? hover : value;

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={`${styles.stars} ${readonly ? styles.readonly : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
        onClick={handleClick}
        style={{ '--star-size': `${size}px` } as React.CSSProperties}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(1, displayValue - (star - 1)));
          return (
            <span key={star} className={styles.star}>
              {/* Background (empty) star */}
              <svg width={size} height={size} viewBox="0 0 24 24" className={styles.starEmpty}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Filled star (clipped) */}
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={styles.starFill}
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          );
        })}
      </div>
      {!readonly && (
        <span className={styles.value}>{formatRating(displayValue)}</span>
      )}
    </div>
  );
}
