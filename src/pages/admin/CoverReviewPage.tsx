import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Maximize2, RefreshCw, Sparkles, Trash2, Upload, X } from 'lucide-react';
import BlogCoverFallback from '../../components/blog/BlogCoverFallback';

interface PostRow {
  slug: string;
  title: string;
  description?: string;
  currentImage: string | null;
  candidateExists: boolean;
  candidateUpdatedAt: number | null;
}

type Status = 'missing' | 'candidate' | 'published';
type FilterKey = 'all' | Status;

function getStatus(p: PostRow): Status {
  if (p.candidateExists) return 'candidate';
  if (p.currentImage) return 'published';
  return 'missing';
}

const REVISION_STORAGE_KEY = 'cover-review:revisions';

function loadRevisions(): Record<string, string> {
  try {
    const raw = localStorage.getItem(REVISION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRevisions(map: Record<string, string>) {
  try {
    localStorage.setItem(REVISION_STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

export default function CoverReviewPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Record<string, string>>(() => loadRevisions());
  const [busyBySlug, setBusyBySlug] = useState<Record<string, 'generate' | 'approve' | 'discard' | null>>({});
  const [errorBySlug, setErrorBySlug] = useState<Record<string, string | null>>({});
  const [lastResultBySlug, setLastResultBySlug] = useState<Record<string, { elapsedMs: number; bytes: number; identicalToInput?: boolean } | null>>({});
  const [filter, setFilter] = useState<FilterKey>('all');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [enlarged, setEnlarged] = useState<{ src: string; title: string } | null>(null);

  // Esc closes the enlarged preview.
  useEffect(() => {
    if (!enlarged) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEnlarged(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enlarged]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const r = await fetch('/api/covers');
      if (!r.ok) throw new Error(`GET /api/covers → ${r.status}`);
      const j = await r.json();
      setPosts(j.posts);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const setBusy = (slug: string, op: 'generate' | 'approve' | 'discard' | null) => {
    setBusyBySlug((b) => ({ ...b, [slug]: op }));
  };
  const setError = (slug: string, msg: string | null) => {
    setErrorBySlug((e) => ({ ...e, [slug]: msg }));
  };

  const updateRevision = (slug: string, text: string) => {
    setRevisions((r) => {
      const next = { ...r, [slug]: text };
      saveRevisions(next);
      return next;
    });
  };

  const handleGenerate = async (slug: string, opts: { fresh?: boolean } = {}) => {
    setBusy(slug, 'generate');
    setError(slug, null);
    try {
      const body = {
        revisionPrompt: revisions[slug] || '',
        fresh: opts.fresh === true,
      };
      const r = await fetch(`/api/covers/${encodeURIComponent(slug)}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setLastResultBySlug((m) => ({
        ...m,
        [slug]: {
          elapsedMs: j.elapsedMs,
          bytes: j.bytes,
          identicalToInput: !!j.identicalToInput,
        },
      }));
      // Refetch just this post's row — simplest.
      await fetchPosts();
    } catch (err) {
      setError(slug, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(slug, null);
    }
  };

  const handleApprove = async (slug: string) => {
    setBusy(slug, 'approve');
    setError(slug, null);
    try {
      const r = await fetch(`/api/covers/${encodeURIComponent(slug)}/approve`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      updateRevision(slug, '');
      await fetchPosts();
    } catch (err) {
      setError(slug, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(slug, null);
    }
  };

  const handleDiscard = async (slug: string) => {
    setBusy(slug, 'discard');
    setError(slug, null);
    try {
      const r = await fetch(`/api/covers/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await fetchPosts();
    } catch (err) {
      setError(slug, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(slug, null);
    }
  };

  const handleGenerateAllMissing = async () => {
    setBulkRunning(true);
    const targets = posts.filter((p) => getStatus(p) === 'missing');
    // Pace bulk generation: Vertex image-gen is ~60 req/min. Each call
    // already takes ~15s, so a 3s gap is enough breathing room to stay
    // under the per-minute quota while still finishing ~24 posts in ~8min.
    const GAP_MS = 3000;
    for (let i = 0; i < targets.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await handleGenerate(targets[i].slug, { fresh: true });
      if (i < targets.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, GAP_MS));
      }
    }
    setBulkRunning(false);
  };

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => getStatus(p) === filter);
  }, [posts, filter]);

  const counts = useMemo(() => {
    const c = { all: posts.length, missing: 0, candidate: 0, published: 0 };
    for (const p of posts) c[getStatus(p)]++;
    return c;
  }, [posts]);

  return (
    <div className="min-h-screen bg-carbon-950 pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-carbon-200 hover:text-electric-400 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Cover Review</h1>
            <p className="text-carbon-300 text-sm mt-1">
              Dev-only tool · generates blog covers via Nano Banana and uploads approved ones to GCS.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchPosts}
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-carbon-800 border border-carbon-700 text-carbon-200 hover:text-white"
              disabled={loading}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleGenerateAllMissing}
              disabled={bulkRunning || counts.missing === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-electric-500 to-safety-500 text-white font-semibold text-sm shadow-lg shadow-electric-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate all missing ({counts.missing})
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            ['all', `All · ${counts.all}`],
            ['missing', `No cover · ${counts.missing}`],
            ['candidate', `Pending review · ${counts.candidate}`],
            ['published', `Published · ${counts.published}`],
          ] as [FilterKey, string][]).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === k
                  ? 'bg-electric-500/20 border-electric-500/50 text-electric-400'
                  : 'bg-carbon-800 border-carbon-700 text-carbon-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loadError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm mb-6">
            Failed to load posts: {loadError}
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="text-carbon-300 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((p) => (
              <CoverCard
                key={p.slug}
                post={p}
                revisionText={revisions[p.slug] || ''}
                onRevisionChange={(t) => updateRevision(p.slug, t)}
                busy={busyBySlug[p.slug] ?? null}
                error={errorBySlug[p.slug] ?? null}
                onGenerate={() => handleGenerate(p.slug)}
                onRegenerateFresh={() => handleGenerate(p.slug, { fresh: true })}
                onApprove={() => handleApprove(p.slug)}
                onDiscard={() => handleDiscard(p.slug)}
                onEnlarge={(src) => setEnlarged({ src, title: p.title })}
                lastResult={lastResultBySlug[p.slug] ?? null}
              />
            ))}
          </div>
        )}
      </div>

      {enlarged && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${enlarged.title}`}
          onClick={() => setEnlarged(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl"
          >
            {/* 16:9 frame mimicking how the cover appears on the blog post
                page (which centers the hero above a max-w-3xl reading column).
                The max-w-4xl outer gives a little more breathing room for review. */}
            <img
              src={enlarged.src}
              alt=""
              className="w-full aspect-[16/9] object-cover rounded-2xl shadow-2xl shadow-black/60"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-carbon-300">
              <span className="truncate">{enlarged.title}</span>
              <span className="text-carbon-500">Esc to close</span>
            </div>
            <button
              type="button"
              onClick={() => setEnlarged(null)}
              aria-label="Close preview"
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-carbon-900 border border-carbon-700 text-white flex items-center justify-center shadow-lg hover:bg-carbon-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CoverCardProps {
  post: PostRow;
  revisionText: string;
  onRevisionChange: (text: string) => void;
  busy: 'generate' | 'approve' | 'discard' | null;
  error: string | null;
  onGenerate: () => void;
  onRegenerateFresh: () => void;
  onApprove: () => void;
  onDiscard: () => void;
  onEnlarge: (src: string) => void;
  lastResult: { elapsedMs: number; bytes: number; identicalToInput?: boolean } | null;
}

function CoverCard({
  post,
  revisionText,
  onRevisionChange,
  busy,
  error,
  onGenerate,
  onRegenerateFresh,
  onApprove,
  onDiscard,
  onEnlarge,
  lastResult,
}: CoverCardProps) {
  const status = getStatus(post);

  // Candidate image URL pulls from our API endpoint and includes the
  // candidate's mtime so a fresh regeneration always busts the browser cache.
  const candidateSrc = post.candidateExists
    ? `/api/covers/${encodeURIComponent(post.slug)}/image?v=${post.candidateUpdatedAt ?? Date.now()}`
    : null;

  const previewSrc = candidateSrc ?? post.currentImage ?? null;

  const statusChip = {
    missing: { label: 'No cover', classes: 'bg-carbon-800 text-carbon-300 border-carbon-700' },
    candidate: { label: 'Candidate pending', classes: 'bg-safety-500/15 text-safety-300 border-safety-500/40' },
    published: { label: 'Published', classes: 'bg-green-500/15 text-green-400 border-green-500/40' },
  }[status];

  return (
    <div className="rounded-2xl bg-carbon-800/50 border border-carbon-700/50 overflow-hidden flex flex-col">
      <div className="relative group">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className="w-full aspect-[16/9] object-cover"
          />
        ) : (
          <BlogCoverFallback title={post.title} variant="card" />
        )}
        {previewSrc && (
          <button
            type="button"
            onClick={() => onEnlarge(previewSrc)}
            aria-label="View larger"
            title="View larger"
            className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/80 transition-opacity"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
        <span
          className={`absolute top-3 right-3 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusChip.classes}`}
        >
          {statusChip.label}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-base font-semibold text-white leading-tight">{post.title}</h3>
          {post.description && (
            <p className="text-xs text-carbon-300 mt-1 line-clamp-2">{post.description}</p>
          )}
        </div>

        <textarea
          value={revisionText}
          onChange={(e) => onRevisionChange(e.target.value)}
          placeholder={
            status === 'candidate'
              ? 'Revision feedback (e.g. "make the helmet more angular, add more glow")'
              : 'Optional direction for the first generation'
          }
          rows={2}
          className="w-full text-xs rounded-lg bg-carbon-900 border border-carbon-700 p-2 text-carbon-100 placeholder:text-carbon-500 focus:outline-none focus:border-electric-500/50 resize-none"
          disabled={busy != null}
        />

        {error && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1.5 break-words">
            {error}
          </div>
        )}

        {lastResult && !error && (
          <div
            className={`text-[11px] px-2 py-1 rounded-md border ${
              lastResult.identicalToInput
                ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                : 'text-carbon-400 bg-carbon-900 border-carbon-700'
            }`}
          >
            Last generation: {(lastResult.elapsedMs / 1000).toFixed(1)}s · {(lastResult.bytes / 1024).toFixed(0)} KB
            {lastResult.identicalToInput && ' — ⚠ model returned the input unchanged (try more specific feedback)'}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-auto">
          {status === 'candidate' ? (
            <>
              <button
                type="button"
                onClick={onGenerate}
                disabled={busy != null}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric-500/20 border border-electric-500/50 text-electric-300 text-xs font-medium hover:bg-electric-500/30 disabled:opacity-50"
              >
                {busy === 'generate' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Regenerate with feedback
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={busy != null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-medium hover:bg-green-500/30 disabled:opacity-50"
              >
                {busy === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Approve & publish
              </button>
              <button
                type="button"
                onClick={onDiscard}
                disabled={busy != null}
                title="Discard candidate"
                className="inline-flex items-center justify-center p-2 rounded-lg bg-carbon-800 border border-carbon-700 text-carbon-400 hover:text-red-400 disabled:opacity-50"
              >
                {busy === 'discard' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onRegenerateFresh}
                disabled={busy != null}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-br from-electric-500 to-safety-500 text-white text-xs font-semibold shadow-md shadow-electric-500/30 disabled:opacity-50"
              >
                {busy === 'generate' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : status === 'published' ? (
                  <RefreshCw className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {status === 'published' ? 'Regenerate cover' : 'Generate cover'}
              </button>
              {status === 'published' && (
                <span className="text-[11px] text-carbon-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  Live
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
