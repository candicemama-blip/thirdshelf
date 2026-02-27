import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBooks } from '../hooks/useBooks';
import { useVocab } from '../hooks/useVocab';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, signOut, updateDisplayName } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { books } = useBooks();
  const { vocab } = useVocab();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const finished = books.filter(b => b.status === 'Finished').length;

  const saveName = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      await updateDisplayName(name.trim());
      setEditingName(false);
    } catch {
      setSaveError('Could not save name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Profile</h1>

      <div className={styles.card}>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          {editingName ? (
            <>
              <div className={styles.editRow}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                  className={styles.nameInput}
                />
                <button className={styles.saveBtn} onClick={saveName} disabled={saving}>
                  {saving ? '…' : 'Save'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setEditingName(false)}>Cancel</button>
              </div>
              {saveError && <p className={styles.label} style={{ color: 'var(--accent)' }}>{saveError}</p>}
            </>
          ) : (
            <div className={styles.valueRow}>
              <span className={styles.value}>{user?.displayName || '—'}</span>
              <button className={styles.editBtn} onClick={() => setEditingName(true)}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <span className={styles.value}>{user?.email}</span>
        </div>

        <div className={styles.divider} />

        {/* Appearance */}
        <div className={styles.field}>
          <label className={styles.label}>Appearance</label>
          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>{theme === 'light' ? 'Light' : 'Dark'}</span>
            <button
              className={`${styles.toggle} ${theme === 'dark' ? styles.toggleOn : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsCard}>
        <h2 className={styles.statsHeading}>Your reading life</h2>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{books.length}</span>
            <span className={styles.statLbl}>Books on shelf</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{finished}</span>
            <span className={styles.statLbl}>Books finished</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{vocab.length}</span>
            <span className={styles.statLbl}>Words learned</span>
          </div>
        </div>
      </div>

      <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
    </div>
  );
}
