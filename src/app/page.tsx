'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VocabCard, Tag, ALL_TAGS, AppStats, ReviewSession } from '../types';
import { SEED_CARDS } from '../seed-data';
import { v4 as uuidv4 } from 'uuid';

// ─── Storage helpers ────────────────────────────────────────
const STORAGE_KEY = 'vocab-keeper-cards';
const STATS_KEY = 'vocab-keeper-stats';

function loadCards(): VocabCard[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CARDS));
    return SEED_CARDS;
  }
  return JSON.parse(raw);
}

function saveCards(cards: VocabCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function loadStats(): AppStats {
  if (typeof window === 'undefined') return defaultStats();
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) return defaultStats();
  return JSON.parse(raw);
}

function saveStats(stats: AppStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): AppStats {
  return {
    totalCards: 0, totalReviews: 0, totalCorrect: 0,
    sessionsCompleted: 0, currentStreak: 0, masteredCards: 0, reviewHistory: [],
  };
}

// ─── Tag pill styles ────────────────────────────────────────
const TAG_STYLES: Record<Tag, { bg: string; text: string }> = {
  verb: { bg: '#FDF3E7', text: '#92602C' },
  noun: { bg: '#EBF2FC', text: '#3B6CB5' },
  adjective: { bg: '#F3EEFA', text: '#7048A6' },
  phrase: { bg: '#ECF7F2', text: '#2E7D5E' },
  idiom: { bg: '#FCEDED', text: '#B03A3A' },
  adverb: { bg: '#E8F6F8', text: '#1A7A8A' },
  conjunction: { bg: '#F0F0F0', text: '#6B6B6B' },
  vonzat: { bg: '#FAEEF5', text: '#A0306B' },
};

function TagBadge({ tag }: { tag: Tag }) {
  const s = TAG_STYLES[tag];
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium">
      {tag}
    </span>
  );
}

function MasteryBar({ value }: { value: number }) {
  const color = value >= 80 ? 'var(--success)' : value >= 40 ? 'var(--accent)' : 'var(--border-hover)';
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

// ─── Views ──────────────────────────────────────────────────
type View = 'browse' | 'add' | 'review' | 'stats';

export default function Home() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [stats, setStatsState] = useState<AppStats>(defaultStats());
  const [view, setView] = useState<View>('browse');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCards(loadCards());
    setStatsState(loadStats());
    setLoaded(true);
  }, []);

  const updateCards = useCallback((fn: (prev: VocabCard[]) => VocabCard[]) => {
    setCards(prev => { const next = fn(prev); saveCards(next); return next; });
  }, []);

  const updateStats = useCallback((fn: (prev: AppStats) => AppStats) => {
    setStatsState(prev => { const next = fn(prev); saveStats(next); return next; });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Szókincs</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
              {cards.length}
            </span>
          </div>
          <nav className="flex gap-1">
            {(['browse', 'add', 'review', 'stats'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
                style={{
                  background: view === v ? 'var(--accent-light)' : 'transparent',
                  color: view === v ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                {v === 'add' ? '+ Add' : v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === 'browse' && <BrowseView cards={cards} updateCards={updateCards} />}
        {view === 'add' && <AddView updateCards={updateCards} />}
        {view === 'review' && <ReviewView cards={cards} updateCards={updateCards} updateStats={updateStats} />}
        {view === 'stats' && <StatsView cards={cards} stats={stats} updateCards={updateCards} />}
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// BROWSE
// ═════════════════════════════════════════════════════════════
function BrowseView({ cards, updateCards }: {
  cards: VocabCard[];
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
      r = r.filter(c => c.hungarian.toLowerCase().includes(q) || c.english.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q));
    }
    if (tagFilter) r = r.filter(c => c.tags.includes(tagFilter));
    switch (sortBy) {
      case 'newest': r.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'mastery-asc': r.sort((a, b) => a.mastery - b.mastery); break;
      case 'mastery-desc': r.sort((a, b) => b.mastery - a.mastery); break;
      case 'alpha': r.sort((a, b) => a.hungarian.localeCompare(b.hungarian, 'hu')); break;
    }
    return r;
  }, [cards, search, tagFilter, sortBy]);

  const deleteCard = (id: string) => {
    if (confirm('Delete this card?')) updateCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)}
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
        {filtered.length} card{filtered.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-2">
        {filtered.map(card =>
          editingId === card.id ? (
            <EditCard key={card.id} card={card}
              onSave={u => { updateCards(prev => prev.map(c => c.id === u.id ? u : c)); setEditingId(null); }}
              onCancel={() => setEditingId(null)} />
          ) : (
            <CardRow key={card.id} card={card}
              onEdit={() => setEditingId(card.id)}
              onDelete={() => deleteCard(card.id)} />
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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{card.hungarian}</span>
            {card.tags.map(t => <TagBadge key={t} tag={t} />)}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.english}</p>
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
              <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>„{card.example}"</p>
              {card.exampleTranslation && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{card.exampleTranslation}</p>
              )}
            </div>
          )}
          {card.notes && <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Note: {card.notes}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Reviewed {card.reviewCount}× · Streak {card.streak}
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

// ─── Edit inline ────────────────────────────────────────────
function EditCard({ card, onSave, onCancel }: {
  card: VocabCard; onSave: (c: VocabCard) => void; onCancel: () => void;
}) {
  const [hu, setHu] = useState(card.hungarian);
  const [en, setEn] = useState(card.english);
  const [ex, setEx] = useState(card.example || '');
  const [exT, setExT] = useState(card.exampleTranslation || '');
  const [notes, setNotes] = useState(card.notes || '');
  const [tags, setTags] = useState<Tag[]>(card.tags);

  const toggle = (t: Tag) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const inp = { background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
      <div className="space-y-2">
        <input value={hu} onChange={e => setHu(e.target.value)} placeholder="Hungarian"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={en} onChange={e => setEn(e.target.value)} placeholder="English"
          className="w-full px-3 py-2 rounded-lg border text-sm" style={inp} />
        <input value={ex} onChange={e => setEx(e.target.value)} placeholder="Example"
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
          <button onClick={() => onSave({ ...card, hungarian: hu, english: en,
            example: ex || undefined, exampleTranslation: exT || undefined, notes: notes || undefined, tags })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>Save</button>
          <button onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ADD VIEW
// ═════════════════════════════════════════════════════════════
function AddView({ updateCards }: {
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const [hu, setHu] = useState('');
  const [en, setEn] = useState('');
  const [ex, setEx] = useState('');
  const [exT, setExT] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [added, setAdded] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  const toggle = (t: Tag) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const handleAdd = () => {
    if (!hu.trim() || !en.trim()) return;
    updateCards(prev => [{
      id: uuidv4(), hungarian: hu.trim(), english: en.trim(),
      example: ex.trim() || undefined, exampleTranslation: exT.trim() || undefined,
      notes: notes.trim() || undefined, tags,
      createdAt: new Date().toISOString(), reviewCount: 0, correctCount: 0, streak: 0, mastery: 0,
    }, ...prev]);
    setHu(''); setEn(''); setEx(''); setExT(''); setNotes(''); setTags([]);
    setAdded(a => a + 1);
    ref.current?.focus();
  };

  const inp = { background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Card</h2>
      <div className="space-y-3">
        <Field label="Hungarian *">
          <input ref={ref} value={hu} onChange={e => setHu(e.target.value)}
            placeholder="e.g. meghatároz vmire" className="w-full px-3 py-2 rounded-lg border text-sm"
            style={inp} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </Field>
        <Field label="English *">
          <input value={en} onChange={e => setEn(e.target.value)}
            placeholder="e.g. to determine for sth" className="w-full px-3 py-2 rounded-lg border text-sm"
            style={inp} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </Field>
        <Field label="Example sentence">
          <input value={ex} onChange={e => setEx(e.target.value)} placeholder="Hungarian example"
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
          <button onClick={handleAdd} disabled={!hu.trim() || !en.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>Add Card</button>
          {added > 0 && (
            <span className="text-xs" style={{ color: 'var(--success)' }}>
              {added} card{added > 1 ? 's' : ''} added
            </span>
          )}
        </div>
      </div>
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

// ═════════════════════════════════════════════════════════════
// REVIEW
// ═════════════════════════════════════════════════════════════
function ReviewView({ cards, updateCards, updateStats }: {
  cards: VocabCard[];
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

  const start = () => {
    let pool = [...cards];
    if (tagFilter) pool = pool.filter(c => c.tags.includes(tagFilter));
    pool.sort((a, b) => a.mastery - b.mastery + (Math.random() - 0.5) * 20);
    const sel = pool.slice(0, sessionSize);
    if (!sel.length) return;
    setSession(sel); setIdx(0); setShow(false); setResults([]); setDone(false);
  };

  const answer = (correct: boolean) => {
    if (!session) return;
    const card = session[idx];

    updateCards(prev => prev.map(c => {
      if (c.id !== card.id) return c;
      const newMastery = Math.min(100, Math.max(0,
        correct ? c.mastery + Math.max(5, 20 - c.mastery * 0.15)
                : c.mastery - Math.max(10, c.mastery * 0.25)));
      return { ...c,
        reviewCount: c.reviewCount + 1,
        correctCount: c.correctCount + (correct ? 1 : 0),
        streak: correct ? c.streak + 1 : 0,
        mastery: Math.round(newMastery),
        lastReviewed: new Date().toISOString(),
      };
    }));

    const nr = [...results, correct];
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
      setIdx(idx + 1); setShow(false);
    }
  };

  // Setup screen
  if (!session) {
    const avail = tagFilter ? cards.filter(c => c.tags.includes(tagFilter)).length : cards.length;
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Start Review</h2>
        <div className="space-y-4 mb-6">
          <Field label="Filter by tag">
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value as Tag | '')}
              className="px-3 py-2 rounded-lg border text-sm w-full max-w-xs mx-auto block"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <option value="">All tags ({cards.length})</option>
              {ALL_TAGS.map(t => {
                const n = cards.filter(c => c.tags.includes(t)).length;
                return <option key={t} value={t}>{t} ({n})</option>;
              })}
            </select>
          </Field>
          <Field label="Cards per session">
            <select value={sessionSize} onChange={e => setSessionSize(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border text-sm w-full max-w-xs mx-auto block"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>{avail} available · weakest first</p>
        <button onClick={start} disabled={avail === 0}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--accent)' }}>Begin</button>
      </div>
    );
  }

  // Done screen
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

  // Active card
  const card = session[idx];
  return (
    <div className="max-w-lg mx-auto py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{idx + 1} / {session.length}</span>
        <div className="flex gap-1">
          {results.map((r, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: r ? 'var(--success)' : 'var(--danger)' }} />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>
      </div>

      <div className="rounded-xl border p-6 text-center mb-4 min-h-[240px] flex flex-col justify-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-center gap-1 mb-3">
          {card.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{card.hungarian}</p>

        {show ? (
          <div>
            <p className="text-base mb-3" style={{ color: 'var(--accent)' }}>{card.english}</p>
            {card.example && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>„{card.example}"</p>
                {card.exampleTranslation && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{card.exampleTranslation}</p>
                )}
              </div>
            )}
            {card.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>{card.notes}</p>}
          </div>
        ) : (
          <button onClick={() => setShow(true)}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-medium mx-auto"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Show Answer</button>
        )}
      </div>

      {show && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => answer(false)}
            className="flex-1 max-w-[140px] px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Didn&apos;t know</button>
          <button onClick={() => answer(true)}
            className="flex-1 max-w-[140px] px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Knew it</button>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════
function StatsView({ cards, stats, updateCards }: {
  cards: VocabCard[]; stats: AppStats;
  updateCards: (fn: (prev: VocabCard[]) => VocabCard[]) => void;
}) {
  const mastered = cards.filter(c => c.mastery >= 80).length;
  const learning = cards.filter(c => c.mastery > 0 && c.mastery < 80).length;
  const unseen = cards.filter(c => c.reviewCount === 0).length;
  const avgM = cards.length ? Math.round(cards.reduce((s, c) => s + c.mastery, 0) / cards.length) : 0;
  const acc = stats.totalReviews ? Math.round((stats.totalCorrect / stats.totalReviews) * 100) : 0;

  // Custom: Heritage Speaker Progress Score
  const breadth = cards.length ? (cards.filter(c => c.reviewCount > 0).length / cards.length) * 100 : 0;
  const progress = Math.round(avgM * 0.4 + acc * 0.3 + breadth * 0.2 + Math.min(stats.currentStreak * 5, 50) * 0.1);

  const tagStats = ALL_TAGS.map(tag => {
    const tc = cards.filter(c => c.tags.includes(tag));
    return { tag, count: tc.length, avg: tc.length ? Math.round(tc.reduce((s, c) => s + c.mastery, 0) / tc.length) : 0 };
  }).filter(t => t.count > 0);

  const recent = [...stats.reviewHistory].reverse().slice(0, 10);

  const exportAnki = () => {
    const lines = cards.map(c => {
      let back = c.english;
      if (c.example) back += `<br><br><i>„${c.example}"</i>`;
      if (c.exampleTranslation) back += `<br><small>${c.exampleTranslation}</small>`;
      if (c.notes) back += `<br><br><small>Note: ${c.notes}</small>`;
      return `${c.hungarian}\t${back}\t${c.tags.join(' ')}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'hungarian-vocab-anki.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Progress</h2>

      {/* Custom Progress Score */}
      <div className="rounded-xl border p-5 mb-4 text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>
          Heritage Speaker Progress
        </p>
        <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{progress}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          mastery 40% · accuracy 30% · breadth 20% · streak 10%
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: 'Total Cards', v: cards.length }, { l: 'Avg Mastery', v: `${avgM}%` },
          { l: 'Mastered (≥80%)', v: mastered }, { l: 'Learning', v: learning },
          { l: 'Unseen', v: unseen }, { l: 'Sessions', v: stats.sessionsCompleted },
          { l: 'Accuracy', v: `${acc}%` }, { l: 'Day Streak', v: stats.currentStreak },
        ].map(s => (
          <div key={s.l} className="rounded-lg border p-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.l}</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="rounded-xl border p-4 mb-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>By Tag</h3>
        <div className="space-y-2">
          {tagStats.sort((a, b) => b.count - a.count).map(t => (
            <div key={t.tag} className="flex items-center gap-2">
              <div className="w-20 shrink-0"><TagBadge tag={t.tag} /></div>
              <div className="flex-1"><MasteryBar value={t.avg} /></div>
              <span className="text-xs w-16 text-right" style={{ color: 'var(--text-tertiary)' }}>
                {t.avg}% · {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div className="rounded-xl border p-4 mb-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
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

      {/* Export + Reset */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={exportAnki} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Export for Anki</button>
        <button onClick={() => {
          if (confirm('Reset all review progress? Cards will be kept.')) {
            updateCards(prev => prev.map(c => ({ ...c, reviewCount: 0, correctCount: 0, streak: 0, mastery: 0, lastReviewed: undefined })));
            saveStats(defaultStats());
            window.location.reload();
          }
        }} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Reset Progress</button>
      </div>
    </div>
  );
}
