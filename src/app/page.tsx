'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  VocabCard, Language, Tag, ALL_TAGS, AppStats, AnkiRating,
  LANGUAGE_META, LANGUAGES,
} from '../types';
import { SEED_CARDS } from '../seed-data';
import { v4 as uuidv4 } from 'uuid';

// ─── Storage ────────────────────────────────────────────────
const LEGACY_KEY = 'vocab-keeper-cards';
const LEGACY_STATS = 'vocab-keeper-stats';
const CARD_KEY = (l: Language) => `vocab-keeper-cards-${l}`;
const STAT_KEY = (l: Language) => `vocab-keeper-stats-${l}`;

function migrateIfNeeded() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('vocab-keeper-migrated-v2')) return;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (raw) {
    try {
      const old = JSON.parse(raw) as Record<string, unknown>[];
      const migrated: VocabCard[] = old.map(c => ({
        ...(c as unknown as VocabCard),
        language: 'hungarian' as Language,
        targetWord: (c.hungarian as string) ?? (c.targetWord as string) ?? '',
        nativeWord: (c.english as string) ?? (c.nativeWord as string) ?? '',
        interval: (c.mastery as number) > 70 ? 7 : (c.mastery as number) > 40 ? 3 : 1,
        dueDate: (c.reviewCount as number) > 0 ? new Date().toISOString() : undefined,
      }));
      localStorage.setItem(CARD_KEY('hungarian'), JSON.stringify(migrated));
      const statsRaw = localStorage.getItem(LEGACY_STATS);
      if (statsRaw) localStorage.setItem(STAT_KEY('hungarian'), statsRaw);
    } catch { /* silent — will fall back to seed */ }
  }
  localStorage.setItem('vocab-keeper-migrated-v2', '1');
}

function loadCards(lang: Language): VocabCard[] {
  if (typeof window === 'undefined') return [];
  const seedCards = SEED_CARDS.filter(c => c.language === lang);
  const raw = localStorage.getItem(CARD_KEY(lang));
  if (!raw) {
    localStorage.setItem(CARD_KEY(lang), JSON.stringify(seedCards));
    return seedCards;
  }
  const stored: VocabCard[] = JSON.parse(raw);
  const storedWords = new Set(stored.map(c => c.targetWord));
  const newCards = seedCards.filter(c => !storedWords.has(c.targetWord));
  if (newCards.length === 0) return stored;
  const merged = [...stored, ...newCards];
  localStorage.setItem(CARD_KEY(lang), JSON.stringify(merged));
  return merged;
}

function saveCards(lang: Language, cards: VocabCard[]) {
  localStorage.setItem(CARD_KEY(lang), JSON.stringify(cards));
}

function loadStats(lang: Language): AppStats {
  if (typeof window === 'undefined') return defaultStats();
  const raw = localStorage.getItem(STAT_KEY(lang));
  return raw ? JSON.parse(raw) : defaultStats();
}

function saveStats(lang: Language, stats: AppStats) {
  localStorage.setItem(STAT_KEY(lang), JSON.stringify(stats));
}

function defaultStats(): AppStats {
  return {
    totalCards: 0, totalReviews: 0, totalCorrect: 0,
    sessionsCompleted: 0, currentStreak: 0, masteredCards: 0, reviewHistory: [],
  };
}

// ─── SRS ────────────────────────────────────────────────────
function applyRating(card: VocabCard, rating: AnkiRating): Partial<VocabCard> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const curr = card.interval > 0 ? card.interval : 1;
  let newInterval: number;
  let masteryDelta: number;
  const isCorrect = rating >= 3;
  switch (rating) {
    case 1: newInterval = 1;                               masteryDelta = -Math.max(15, Math.round(card.mastery * 0.25)); break;
    case 2: newInterval = Math.max(1, Math.ceil(curr * 1.2)); masteryDelta = -Math.max(5,  Math.round(card.mastery * 0.1));  break;
    case 3: newInterval = curr <= 1 ? 3 : Math.ceil(curr * 2);  masteryDelta = Math.max(8,  Math.round(20 - card.mastery * 0.15)); break;
    case 4: newInterval = curr <= 1 ? 7 : Math.ceil(curr * 3);  masteryDelta = Math.max(12, Math.round(25 - card.mastery * 0.15)); break;
  }
  const due = new Date(today); due.setDate(due.getDate() + newInterval);
  return {
    interval: newInterval,
    dueDate: due.toISOString(),
    mastery: Math.min(100, Math.max(0, card.mastery + masteryDelta)),
    reviewCount: card.reviewCount + 1,
    correctCount: card.correctCount + (isCorrect ? 1 : 0),
    streak: isCorrect ? card.streak + 1 : 0,
    lastReviewed: new Date().toISOString(),
  };
}

function buildSession(cards: VocabCard[], size: number, tagFilter: Tag | ''): VocabCard[] {
  const now = new Date(); now.setHours(23, 59, 59, 999);
  let pool = [...cards];
  if (tagFilter) pool = pool.filter(c => c.tags.includes(tagFilter));
  const due = pool.filter(c => c.dueDate && new Date(c.dueDate) <= now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const newCards = pool.filter(c => c.reviewCount === 0).sort(() => Math.random() - 0.5);
  return [...due, ...newCards].slice(0, size);
}

// ─── Shared UI ──────────────────────────────────────────────
const TAG_STYLES: Record<Tag, { bg: string; text: string }> = {
  verb:        { bg: '#FDF3E7', text: '#92602C' },
  noun:        { bg: '#EBF2FC', text: '#3B6CB5' },
  adjective:   { bg: '#F3EEFA', text: '#7048A6' },
  phrase:      { bg: '#ECF7F2', text: '#2E7D5E' },
  idiom:       { bg: '#FCEDED', text: '#B03A3A' },
  adverb:      { bg: '#E8F6F8', text: '#1A7A8A' },
  conjunction: { bg: '#F0F0F0', text: '#6B6B6B' },
  vonzat:      { bg: '#FAEEF5', text: '#A0306B' },
};

function TagBadge({ tag }: { tag: Tag }) {
  const s = TAG_STYLES[tag];
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium">{tag}</span>
  );
}

function MasteryBar({ value }: { value: number }) {
  const color = value >= 80 ? 'var(--success)' : value >= 40 ? 'var(--accent)' : 'var(--border-hover)';
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────
type View = 'browse' | 'add' | 'review' | 'stats';
type AllCards = Record<Language, VocabCard[]>;
type AllStats = Record<Language, AppStats>;

// ═════════════════════════════════════════════════════════════
// HOME
// ═════════════════════════════════════════════════════════════
export default function Home() {
  const [allCards, setAllCards] = useState<AllCards>(() => {
    migrateIfNeeded();
    return { hungarian: loadCards('hungarian'), french: loadCards('french'), italian: loadCards('italian') };
  });
  const [allStats, setAllStats] = useState<AllStats>(() => ({
    hungarian: loadStats('hungarian'), french: loadStats('french'), italian: loadStats('italian'),
  }));
  const [language, setLanguage] = useState<Language>('hungarian');
  const [view, setView] = useState<View>('review');

  const updateCards = useCallback((lang: Language, fn: (prev: VocabCard[]) => VocabCard[]) => {
    setAllCards(prev => {
      const next = { ...prev, [lang]: fn(prev[lang]) };
      saveCards(lang, next[lang]);
      return next;
    });
  }, []);

  const updateStats = useCallback((lang: Language, fn: (prev: AppStats) => AppStats) => {
    setAllStats(prev => {
      const next = { ...prev, [lang]: fn(prev[lang]) };
      saveStats(lang, next[lang]);
      return next;
    });
  }, []);

  const cards = allCards[language];
  const totalAll = LANGUAGES.reduce((s, l) => s + allCards[l].length, 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-0">
          {/* Row 1: Title + view nav */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Vocab Keeper</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{totalAll}</span>
            </div>
            <nav className="flex gap-0.5">
              {(['browse', 'add', 'review', 'stats'] as View[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize"
                  style={{
                    background: view === v ? 'var(--accent-light)' : 'transparent',
                    color: view === v ? 'var(--accent)' : 'var(--text-secondary)',
                  }}>{v === 'add' ? '+ Add' : v}</button>
              ))}
            </nav>
          </div>
          {/* Row 2: Language selector */}
          <div className="flex gap-1 pb-0">
            {LANGUAGES.map(l => {
              const m = LANGUAGE_META[l];
              const active = l === language;
              return (
                <button key={l} onClick={() => setLanguage(l)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-all"
                  style={{
                    borderBottomColor: active ? m.color : 'transparent',
                    color: active ? m.color : 'var(--text-tertiary)',
                    background: active ? 'var(--bg-card)' : 'transparent',
                  }}>
                  <span>{m.flag}</span>
                  <span>{m.label}</span>
                  <span className="opacity-60">{allCards[l].length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === 'browse' && (
          <BrowseView cards={cards} language={language}
            updateCards={fn => updateCards(language, fn)} />
        )}
        {view === 'add' && (
          <AddView language={language}
            updateCards={fn => updateCards(language, fn)} />
        )}
        {view === 'review' && (
          <ReviewView cards={cards} language={language}
            updateCards={fn => updateCards(language, fn)}
            updateStats={fn => updateStats(language, fn)} />
        )}
        {view === 'stats' && (
          <StatsView allCards={allCards} allStats={allStats}
            updateCards={updateCards} />
        )}
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// BROWSE
// ═════════════════════════════════════════════════════════════
function BrowseView({ cards, language, updateCards }: {
  cards: VocabCard[]; language: Language;
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<Tag | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'mastery-asc' | 'mastery-desc' | 'alpha'>('newest');

  const filtered = useMemo(() => {
    let r = [...cards];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c => c.targetWord.toLowerCase().includes(q) || c.nativeWord.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q));
    }
    if (tagFilter) r = r.filter(c => c.tags.includes(tagFilter));
    switch (sortBy) {
      case 'newest':      r.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'mastery-asc': r.sort((a, b) => a.mastery - b.mastery); break;
      case 'mastery-desc':r.sort((a, b) => b.mastery - a.mastery); break;
      case 'alpha':       r.sort((a, b) => a.targetWord.localeCompare(b.targetWord)); break;
    }
    return r;
  }, [cards, search, tagFilter, sortBy]);

  const deleteCard = (id: string) => {
    if (confirm('Delete this card?')) updateCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value as Tag | '')}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <option value="">All tags</option>
          {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <option value="newest">Newest</option>
          <option value="alpha">A–Z</option>
          <option value="mastery-asc">Weakest</option>
          <option value="mastery-desc">Strongest</option>
        </select>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {filtered.length} card{filtered.length !== 1 ? 's' : ''} · {LANGUAGE_META[language].flag} {LANGUAGE_META[language].label}
      </p>
      <div className="space-y-2">
        {filtered.map(card =>
          editingId === card.id ? (
            <EditCard key={card.id} card={card}
              onSave={u => { updateCards(prev => prev.map(c => c.id === u.id ? u : c)); setEditingId(null); }}
              onCancel={() => setEditingId(null)} />
          ) : (
            <CardRow key={card.id} card={card} onEdit={() => setEditingId(card.id)} onDelete={() => deleteCard(card.id)} />
          )
        )}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-lg mb-1">No cards found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

function CardRow({ card, onEdit, onDelete }: { card: VocabCard; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-4 cursor-pointer"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{card.targetWord}</span>
            {card.tags.map(t => <TagBadge key={t} tag={t} />)}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.nativeWord}</p>
        </div>
        <div className="w-16 shrink-0">
          <MasteryBar value={card.mastery} />
          <p className="text-[10px] text-center mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{card.mastery}%</p>
        </div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {card.example && (
            <div className="mb-2">
              <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>{'„'}{card.example}{'"'}</p>
              {card.exampleTranslation && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{card.exampleTranslation}</p>
              )}
            </div>
          )}
          {card.notes && <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Note: {card.notes}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Reviewed {card.reviewCount}× · Streak {card.streak} · Interval {card.interval}d
            </span>
            <div className="flex gap-1">
              <button onClick={e => { e.stopPropagation(); onEdit(); }}
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Edit</button>
              <button onClick={e => { e.stopPropagation(); onDelete(); }}
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditCard({ card, onSave, onCancel }: { card: VocabCard; onSave: (c: VocabCard) => void; onCancel: () => void }) {
  const [target, setTarget] = useState(card.targetWord);
  const [native, setNative] = useState(card.nativeWord);
  const [ex, setEx] = useState(card.example || '');
  const [exT, setExT] = useState(card.exampleTranslation || '');
  const [notes, setNotes] = useState(card.notes || '');
  const [tags, setTags] = useState<Tag[]>(card.tags);
  const toggle = (t: Tag) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const inp = { background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' };
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
      <div className="space-y-2">
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target word"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={native} onChange={e => setNative(e.target.value)} placeholder="English"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={ex} onChange={e => setEx(e.target.value)} placeholder="Example sentence"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={exT} onChange={e => setExT(e.target.value)} placeholder="Example translation"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <div className="flex flex-wrap gap-1">
          {ALL_TAGS.map(t => (
            <button key={t} onClick={() => toggle(t)}
              className="px-2 py-0.5 rounded-full text-xs font-medium border"
              style={{
                background: tags.includes(t) ? TAG_STYLES[t].bg : 'transparent',
                color: tags.includes(t) ? TAG_STYLES[t].text : 'var(--text-tertiary)',
                borderColor: tags.includes(t) ? TAG_STYLES[t].text + '40' : 'var(--border)',
              }}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onSave({ ...card, targetWord: target, nativeWord: native,
            example: ex || undefined, exampleTranslation: exT || undefined, notes: notes || undefined, tags })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>Save</button>
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ADD
// ═════════════════════════════════════════════════════════════
function AddView({ language, updateCards }: {
  language: Language;
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const [target, setTarget] = useState('');
  const [native, setNative] = useState('');
  const [ex, setEx] = useState('');
  const [exT, setExT] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [added, setAdded] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const toggle = (t: Tag) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const meta = LANGUAGE_META[language];

  const handleAdd = () => {
    if (!target.trim() || !native.trim()) return;
    updateCards(prev => [{
      id: uuidv4(), language, targetWord: target.trim(), nativeWord: native.trim(),
      example: ex.trim() || undefined, exampleTranslation: exT.trim() || undefined,
      notes: notes.trim() || undefined, tags,
      createdAt: new Date().toISOString(), reviewCount: 0, correctCount: 0, streak: 0, mastery: 0, interval: 0,
    }, ...prev]);
    setTarget(''); setNative(''); setEx(''); setExT(''); setNotes(''); setTags([]);
    setAdded(a => a + 1);
    ref.current?.focus();
  };

  const inp = { background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' };
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Add New Card</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>{meta.flag} {meta.label}</p>
      <div className="space-y-3">
        <Field label={`${meta.label} word / phrase *`}>
          <input ref={ref} value={target} onChange={e => setTarget(e.target.value)}
            placeholder={language === 'hungarian' ? 'e.g. meghatároz vmire' : language === 'french' ? 'e.g. se souvenir de' : 'e.g. mi piace'}
            className="w-full px-3 py-2 rounded-lg border text-sm" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </Field>
        <Field label="English *">
          <input value={native} onChange={e => setNative(e.target.value)} placeholder="English meaning"
            className="w-full px-3 py-2 rounded-lg border text-sm" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </Field>
        <Field label="Example sentence">
          <input value={ex} onChange={e => setEx(e.target.value)} placeholder="Example in target language"
            className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        </Field>
        <Field label="Example translation">
          <input value={exT} onChange={e => setExT(e.target.value)} placeholder="English translation"
            className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        </Field>
        <Field label="Notes">
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes"
            className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        </Field>
        <Field label="Tags">
          <div className="flex flex-wrap gap-1">
            {ALL_TAGS.map(t => (
              <button key={t} onClick={() => toggle(t)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: tags.includes(t) ? TAG_STYLES[t].bg : 'transparent',
                  color: tags.includes(t) ? TAG_STYLES[t].text : 'var(--text-tertiary)',
                  borderColor: tags.includes(t) ? TAG_STYLES[t].text + '40' : 'var(--border)',
                }}>{t}</button>
            ))}
          </div>
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleAdd} disabled={!target.trim() || !native.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>Add Card</button>
          {added > 0 && (
            <span className="text-xs" style={{ color: 'var(--success)' }}>{added} card{added > 1 ? 's' : ''} added</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// REVIEW
// ═════════════════════════════════════════════════════════════
const ANKI_BUTTONS: { rating: AnkiRating; label: string; key: string; bg: string; color: string }[] = [
  { rating: 1, label: 'Again', key: '1', bg: '#FDF0EF', color: '#C44B3F' },
  { rating: 2, label: 'Hard',  key: '2', bg: '#FEF3E7', color: '#C07020' },
  { rating: 3, label: 'Good',  key: '3', bg: '#EDF7F1', color: '#3D8B5F' },
  { rating: 4, label: 'Easy',  key: '4', bg: '#EBF2FC', color: '#2563EB' },
];

function ReviewView({ cards, language, updateCards, updateStats }: {
  cards: VocabCard[]; language: Language;
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
  updateStats: (fn: (prev: AppStats) => AppStats) => void;
}) {
  const [tagFilter, setTagFilter] = useState<Tag | ''>('');
  const [sessionSize, setSessionSize] = useState(10);
  const [session, setSession] = useState<VocabCard[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const meta = LANGUAGE_META[language];

  const start = useCallback(() => {
    const sel = buildSession(cards, sessionSize, tagFilter);
    if (!sel.length) return;
    setSession(sel); setIdx(0); setShow(false); setResults([]); setDone(false);
  }, [cards, sessionSize, tagFilter]);

  const answer = useCallback((rating: AnkiRating) => {
    if (!session || done) return;
    const card = session[idx];
    const updates = applyRating(card, rating);
    updateCards(prev => prev.map(c => c.id === card.id ? { ...c, ...updates } : c));
    const isCorrect = rating >= 3;
    const nr = [...results, isCorrect];
    setResults(nr);
    if (idx + 1 >= session.length) {
      const cc = nr.filter(Boolean).length;
      updateStats(prev => {
        const today = new Date().toDateString();
        const last = prev.lastSessionDate ? new Date(prev.lastSessionDate).toDateString() : '';
        const yest = new Date(Date.now() - 86400000).toDateString();
        let streak = prev.currentStreak;
        if (last !== today) streak = last === yest ? streak + 1 : 1;
        return { ...prev,
          totalReviews: prev.totalReviews + session.length,
          totalCorrect: prev.totalCorrect + cc,
          sessionsCompleted: prev.sessionsCompleted + 1,
          currentStreak: streak,
          lastSessionDate: new Date().toISOString(),
          reviewHistory: [...prev.reviewHistory, {
            date: new Date().toISOString(), total: session.length, correct: cc,
            cards: session.map(c => c.id),
          }].slice(-100),
        };
      });
      setDone(true);
    } else {
      setIdx(i => i + 1); setShow(false);
    }
  }, [session, idx, done, results, updateCards, updateStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!session || done) return;
      if (e.key === ' ') { e.preventDefault(); if (!show) setShow(true); return; }
      if (show) {
        if (e.key === '1') answer(1);
        else if (e.key === '2') answer(2);
        else if (e.key === '3') answer(3);
        else if (e.key === '4') answer(4);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [session, show, done, answer]);

  // Reset session when language changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSession(null); setDone(false); }, [language]);

  // ── Setup ──
  if (!session) {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const pool = tagFilter ? cards.filter(c => c.tags.includes(tagFilter)) : cards;
    const dueCount = pool.filter(c => c.dueDate && new Date(c.dueDate) <= now).length;
    const newCount = pool.filter(c => c.reviewCount === 0).length;
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="text-2xl mb-1">{meta.flag}</div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Review {meta.label}</h2>
        <div className="flex justify-center gap-4 mb-6">
          <span className="text-sm" style={{ color: 'var(--danger)' }}>{dueCount} due</span>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span className="text-sm" style={{ color: 'var(--accent)' }}>{newCount} new</span>
        </div>
        <div className="space-y-4 mb-6">
          <Field label="Filter by tag">
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value as Tag | '')}
              className="px-3 py-2 rounded-lg border text-sm w-full max-w-xs mx-auto block"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <option value="">All tags ({cards.length})</option>
              {ALL_TAGS.map(t => {
                const n = cards.filter(c => c.tags.includes(t)).length;
                return n > 0 ? <option key={t} value={t}>{t} ({n})</option> : null;
              })}
            </select>
          </Field>
          <Field label="Cards per session">
            <select value={sessionSize} onChange={e => setSessionSize(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border text-sm w-full max-w-xs mx-auto block"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {[5, 10, 15, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Due cards first · then new cards · Space to flip · 1–4 to rate
        </div>
        <button onClick={start} disabled={pool.length === 0}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--accent)' }}>Begin</button>
      </div>
    );
  }

  // ── Done ──
  if (done) {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Session Complete</h2>
        <p className="text-4xl font-bold mb-1" style={{ color: pct >= 70 ? 'var(--success)' : 'var(--accent)' }}>{pct}%</p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{correct} / {results.length}</p>
        <div className="flex justify-center gap-1 mb-6">
          {results.map((r, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ background: r ? 'var(--success)' : 'var(--danger)' }} />
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={start} className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>Again</button>
          <button onClick={() => setSession(null)} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Settings</button>
        </div>
      </div>
    );
  }

  // ── Active card ──
  const card = session[idx];
  return (
    <div className="max-w-lg mx-auto py-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{idx + 1} / {session.length}</span>
        <div className="flex gap-1">
          {results.map((r, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: r ? 'var(--success)' : 'var(--danger)' }} />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border p-8 text-center mb-4 min-h-[260px] flex flex-col justify-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-center gap-1 mb-4">
          {card.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>

        {/* Prompt: English */}
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>Translate to {meta.label}</p>
        <p className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{card.nativeWord}</p>

        {/* Answer */}
        {show ? (
          <div>
            <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xl font-semibold mb-2" style={{ color: meta.color }}>{card.targetWord}</p>
              {card.example && (
                <div className="mt-2">
                  <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>{'„'}{card.example}{'"'}</p>
                  {card.exampleTranslation && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{card.exampleTranslation}</p>
                  )}
                </div>
              )}
              {card.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>💡 {card.notes}</p>}
            </div>
          </div>
        ) : (
          <button onClick={() => setShow(true)}
            className="mt-2 px-5 py-2 rounded-lg text-sm font-medium mx-auto block"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Show answer <span className="opacity-50 ml-1 text-xs">[Space]</span>
          </button>
        )}
      </div>

      {/* Rating buttons */}
      {show && (
        <div>
          <div className="flex gap-2 mb-2">
            {ANKI_BUTTONS.map(({ rating, label, key, bg, color }) => (
              <button key={rating} onClick={() => answer(rating)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ background: bg, color, borderColor: color + '30' }}>
                <span className="block text-xs opacity-60 mb-0.5">[{key}]</span>
                {label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            1 Again · 2 Hard · 3 Good · 4 Easy
          </p>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════
type StatsScope = Language | 'all';

function StatsView({ allCards, allStats, updateCards }: {
  allCards: AllCards; allStats: AllStats;
  updateCards: (lang: Language, fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const [scope, setScope] = useState<StatsScope>('all');

  return (
    <div className="max-w-lg mx-auto">
      {/* Scope selector */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        {(['all', ...LANGUAGES] as StatsScope[]).map(s => {
          const label = s === 'all' ? '🌍 All' : `${LANGUAGE_META[s].flag} ${LANGUAGE_META[s].label}`;
          return (
            <button key={s} onClick={() => setScope(s)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: scope === s ? 'var(--bg-card)' : 'transparent',
                color: scope === s ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: scope === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>{label}</button>
          );
        })}
      </div>

      {scope === 'all'
        ? <AllStatsView allCards={allCards} allStats={allStats} updateCards={updateCards} />
        : <LangStatsView lang={scope} cards={allCards[scope]} stats={allStats[scope]}
            updateCards={fn => updateCards(scope, fn)} />
      }
    </div>
  );
}

function AllStatsView({ allCards, allStats, updateCards }: {
  allCards: AllCards; allStats: AllStats;
  updateCards: (lang: Language, fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const allCardsList = LANGUAGES.flatMap(l => allCards[l]);
  const totalCards = allCardsList.length;
  const totalReviews = LANGUAGES.reduce((s, l) => s + allStats[l].totalReviews, 0);
  const totalCorrect = LANGUAGES.reduce((s, l) => s + allStats[l].totalCorrect, 0);
  const sessions = LANGUAGES.reduce((s, l) => s + allStats[l].sessionsCompleted, 0);
  const mastered = allCardsList.filter(c => c.mastery >= 80).length;
  const avgM = totalCards ? Math.round(allCardsList.reduce((s, c) => s + c.mastery, 0) / totalCards) : 0;
  const acc = totalReviews ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  const polyglot = Math.round(avgM * 0.4 + acc * 0.3 + (mastered / Math.max(totalCards, 1) * 100) * 0.2 + sessions * 0.1);

  return (
    <div>
      {/* Polyglot score */}
      <div className="rounded-xl border p-5 mb-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Polyglot Score</p>
        <p className="text-5xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{polyglot}</p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>across {totalCards} cards in 3 languages</p>
      </div>

      {/* Per-language breakdown */}
      <div className="rounded-xl border p-4 mb-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>By Language</h3>
        <div className="space-y-3">
          {LANGUAGES.map(l => {
            const lCards = allCards[l];
            const lStats = allStats[l];
            const lAvg = lCards.length ? Math.round(lCards.reduce((s, c) => s + c.mastery, 0) / lCards.length) : 0;
            const lAcc = lStats.totalReviews ? Math.round((lStats.totalCorrect / lStats.totalReviews) * 100) : 0;
            const lMastered = lCards.filter(c => c.mastery >= 80).length;
            const m = LANGUAGE_META[l];
            return (
              <div key={l}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.flag} {m.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {lCards.length} cards · {lAvg}% avg · {lAcc}% acc · {lMastered} mastered
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${lAvg}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined totals */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: 'Total Cards', v: totalCards }, { l: 'Avg Mastery', v: `${avgM}%` },
          { l: 'Mastered (≥80%)', v: mastered }, { l: 'Sessions', v: sessions },
          { l: 'Total Reviews', v: totalReviews }, { l: 'Accuracy', v: `${acc}%` },
        ].map(s => (
          <div key={s.l} className="rounded-lg border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.l}</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Reset all */}
      <div className="flex gap-2 flex-wrap">
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => {
            if (confirm(`Reset ${LANGUAGE_META[l].label} progress? Cards will be kept.`)) {
              updateCards(l, prev => prev.map(c => ({ ...c, reviewCount: 0, correctCount: 0, streak: 0, mastery: 0, interval: 0, dueDate: undefined, lastReviewed: undefined })));
              saveStats(l, defaultStats());
              window.location.reload();
            }
          }} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            Reset {LANGUAGE_META[l].flag}
          </button>
        ))}
      </div>
    </div>
  );
}

function LangStatsView({ lang, cards, stats, updateCards }: {
  lang: Language; cards: VocabCard[]; stats: AppStats;
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const mastered = cards.filter(c => c.mastery >= 80).length;
  const learning = cards.filter(c => c.mastery > 0 && c.mastery < 80).length;
  const unseen   = cards.filter(c => c.reviewCount === 0).length;
  const avgM = cards.length ? Math.round(cards.reduce((s, c) => s + c.mastery, 0) / cards.length) : 0;
  const acc  = stats.totalReviews ? Math.round((stats.totalCorrect / stats.totalReviews) * 100) : 0;
  const breadth = cards.length ? (cards.filter(c => c.reviewCount > 0).length / cards.length) * 100 : 0;
  const progress = Math.round(avgM * 0.4 + acc * 0.3 + breadth * 0.2 + Math.min(stats.currentStreak * 5, 50) * 0.1);
  const meta = LANGUAGE_META[lang];

  const tagStats = ALL_TAGS.map(tag => {
    const tc = cards.filter(c => c.tags.includes(tag));
    return { tag, count: tc.length, avg: tc.length ? Math.round(tc.reduce((s, c) => s + c.mastery, 0) / tc.length) : 0 };
  }).filter(t => t.count > 0);

  const recent = [...stats.reviewHistory].reverse().slice(0, 10);

  const exportAnki = () => {
    const lines = cards.map(c => {
      let back = c.nativeWord;
      if (c.example) back += `<br><br><i>„${c.example}"</i>`;
      if (c.exampleTranslation) back += `<br><small>${c.exampleTranslation}</small>`;
      if (c.notes) back += `<br><br><small>Note: ${c.notes}</small>`;
      return `${c.targetWord}\t${back}\t${c.tags.join(' ')}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${lang}-vocab-anki.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Progress score */}
      <div className="rounded-xl border p-5 mb-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>
          {meta.flag} {meta.label} Progress
        </p>
        <p className="text-5xl font-bold mb-1" style={{ color: meta.color }}>{progress}</p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>mastery 40% · accuracy 30% · breadth 20% · streak 10%</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: 'Total Cards', v: cards.length },   { l: 'Avg Mastery', v: `${avgM}%` },
          { l: 'Mastered (≥80%)', v: mastered },   { l: 'Learning', v: learning },
          { l: 'Unseen', v: unseen },               { l: 'Sessions', v: stats.sessionsCompleted },
          { l: 'Accuracy', v: `${acc}%` },          { l: 'Day Streak', v: stats.currentStreak },
        ].map(s => (
          <div key={s.l} className="rounded-lg border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.l}</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* By tag */}
      {tagStats.length > 0 && (
        <div className="rounded-xl border p-4 mb-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>By Tag</h3>
          <div className="space-y-2">
            {tagStats.sort((a, b) => b.count - a.count).map(t => (
              <div key={t.tag} className="flex items-center gap-2">
                <div className="w-20 shrink-0"><TagBadge tag={t.tag} /></div>
                <div className="flex-1"><MasteryBar value={t.avg} /></div>
                <span className="text-xs w-16 text-right" style={{ color: 'var(--text-tertiary)' }}>{t.avg}% · {t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recent.length > 0 && (
        <div className="rounded-xl border p-4 mb-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Recent Sessions</h3>
          <div className="space-y-1.5">
            {recent.map((s, i) => {
              const p = Math.round((s.correct / s.total) * 100);
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-tertiary)' }}>{new Date(s.date).toLocaleDateString()}</span>
                  <span style={{ color: p >= 70 ? 'var(--success)' : 'var(--accent)' }}>{s.correct}/{s.total} ({p}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={exportAnki} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Export for Anki</button>
        <button onClick={() => {
          if (confirm(`Reset ${meta.label} review progress? Cards will be kept.`)) {
            updateCards(prev => prev.map(c => ({ ...c, reviewCount: 0, correctCount: 0, streak: 0, mastery: 0, interval: 0, dueDate: undefined, lastReviewed: undefined })));
            saveStats(lang, defaultStats());
            window.location.reload();
          }
        }} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Reset Progress</button>
      </div>
    </div>
  );
}
