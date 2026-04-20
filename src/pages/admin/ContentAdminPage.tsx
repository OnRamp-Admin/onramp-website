import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Cloud,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogIn,
  RefreshCw,
  Sparkles,
  Upload,
  Volume2,
  Wand2,
  XCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types + helpers
// ---------------------------------------------------------------------------

interface Post {
  slug: string;
  title: string;
  date: string | null;
  isScheduled: boolean;
  image: string | null;
  description: string | null;
  descriptionLength: number;
  descriptionFlags: string[];
  briefAudioUrl: string | null;
  briefDurationSec: number | null;
  briefHasTranscript: boolean;
  podcastAudioUrl: string | null;
  podcastDurationSec: number | null;
  podcastHasTranscript: boolean;
  articleAudioUrl: string | null;
  articleDurationSec: number | null;
  articleHasTranscript: boolean;
}

interface Counts {
  total: number;
  coverOk: number;
  descriptionOk: number;
  briefOk: number;
  podcastOk: number;
  articleOk: number;
}

interface ApiList {
  posts: Post[];
  counts: Counts;
  auth: { valid: boolean; error?: string };
}

type FilterKey = 'all' | 'needs-work' | 'complete';

function postIsComplete(p: Post): boolean {
  return (
    !!p.image
    && p.descriptionFlags.length === 0
    && !!p.briefAudioUrl
    && !!p.podcastAudioUrl
    && !!p.articleAudioUrl
  );
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(sec: number | null | undefined): string {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Top-level page
// ---------------------------------------------------------------------------

export default function ContentAdminPage() {
  const [data, setData] = useState<ApiList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  // per-slug, per-action busy state (e.g., 'cover' | 'description' | 'brief' | 'podcast' | 'article' | 'transcript-brief' | 'transcript-podcast' | 'transcript-article')
  const [busy, setBusy] = useState<Record<string, string | null>>({});
  const [errs, setErrs] = useState<Record<string, string | null>>({});
  const [progress, setProgress] = useState<Record<string, string>>({});
  const authPollRef = useRef<number | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const r = await fetch('/api/content');
      if (!r.ok) throw new Error(`GET /api/content → ${r.status}`);
      const j = (await r.json()) as ApiList;
      setData(j);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Poll auth status when it's invalid — picks up successful re-auth.
  useEffect(() => {
    if (data?.auth.valid) {
      if (authPollRef.current) { window.clearInterval(authPollRef.current); authPollRef.current = null; }
      return;
    }
    if (authPollRef.current) return;
    authPollRef.current = window.setInterval(async () => {
      try {
        const r = await fetch('/api/auth/status');
        const j = await r.json();
        if (j.valid) fetchList();
      } catch { /* ignore */ }
    }, 3000);
    return () => {
      if (authPollRef.current) { window.clearInterval(authPollRef.current); authPollRef.current = null; }
    };
  }, [data?.auth.valid, fetchList]);

  const setActionBusy = (slug: string, action: string | null) => {
    setBusy((b) => ({ ...b, [slug]: action }));
  };
  const setActionError = (slug: string, msg: string | null) => {
    setErrs((e) => ({ ...e, [slug]: msg }));
  };
  const setActionProgress = (slug: string, text: string) => {
    setProgress((p) => ({ ...p, [slug]: text }));
  };

  // Generic wrapper for single-request actions (cover, description, transcripts).
  async function runAction(
    slug: string,
    action: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    setActionBusy(slug, action);
    setActionError(slug, null);
    setActionProgress(slug, '');
    try {
      await fn();
      await fetchList();
    } catch (err) {
      setActionError(slug, err instanceof Error ? err.message : String(err));
    } finally {
      setActionBusy(slug, null);
      setActionProgress(slug, '');
    }
  }

  async function regenerateDescription(slug: string) {
    await runAction(slug, 'description', async () => {
      setActionProgress(slug, 'Drafting new description…');
      const r = await fetch(`/api/content/${encodeURIComponent(slug)}/description/regenerate`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    });
  }

  async function regenerateCover(slug: string) {
    await runAction(slug, 'cover', async () => {
      setActionProgress(slug, 'Generating cover (Nano Banana) + processing WebP…');
      const r = await fetch(`/api/content/${encodeURIComponent(slug)}/cover/regenerate`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    });
  }

  async function uploadAudio(slug: string, kind: 'brief' | 'podcast', file: File) {
    await runAction(slug, kind, async () => {
      setActionProgress(slug, `Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB…`);
      const r = await fetch(`/api/content/${encodeURIComponent(slug)}/audio/${kind}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'audio/mp4',
          'X-Original-Filename': file.name,
        },
        body: file,
      });
      const j = await r.json();
      if (!r.ok && r.status !== 207) throw new Error(j.error || `HTTP ${r.status}`);
      if (r.status === 207 && j.transcriptError) {
        setActionError(slug, `Uploaded but transcription failed: ${j.transcriptError}`);
      }
    });
  }

  async function regenerateTranscript(slug: string, kind: 'brief' | 'podcast' | 'article') {
    await runAction(slug, `transcript-${kind}`, async () => {
      setActionProgress(slug, `Transcribing ${kind} audio…`);
      const r = await fetch(`/api/content/${encodeURIComponent(slug)}/transcript/${kind}`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    });
  }

  async function generateArticleAudio(slug: string) {
    setActionBusy(slug, 'article');
    setActionError(slug, null);
    setActionProgress(slug, 'Generating article audio…');
    try {
      const r = await fetch(`/api/content/${encodeURIComponent(slug)}/article-audio/generate`, {
        method: 'POST',
      });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);

      // Stream NDJSON progress events from the server.
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let failed: string | null = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          let evt: Record<string, unknown>;
          try { evt = JSON.parse(line); } catch { continue; }
          const stage = evt.stage as string | undefined;
          if (stage === 'start') setActionProgress(slug, `TTS payload: ${(evt.payloadChars as number)?.toLocaleString?.() ?? '?'} chars`);
          else if (stage === 'tts') setActionProgress(slug, `Gemini TTS (attempt ${evt.attempt}): ${Math.round(((evt.elapsedMs as number) || 0) / 1000)}s elapsed`);
          else if (stage === 'retry') setActionProgress(slug, `TTS transient failure, retrying in ${Math.round(((evt.delayMs as number) || 0) / 1000)}s`);
          else if (stage === 'synthesized') setActionProgress(slug, `Synthesized ${((evt.bytes as number) / 1024 / 1024).toFixed(1)} MB`);
          else if (stage === 'converting') setActionProgress(slug, 'Converting to m4a…');
          else if (stage === 'converted') setActionProgress(slug, `Duration ${formatDuration(evt.durationSec as number)} — uploading…`);
          else if (stage === 'uploading') setActionProgress(slug, 'Uploading to GCS…');
          else if (stage === 'done') setActionProgress(slug, 'Done');
          else if (stage === 'error') { failed = (evt.message as string) || 'TTS failed'; break; }
        }
        if (failed) break;
      }
      if (failed) throw new Error(failed);
      await fetchList();
    } catch (err) {
      setActionError(slug, err instanceof Error ? err.message : String(err));
    } finally {
      setActionBusy(slug, null);
      setActionProgress(slug, '');
    }
  }

  async function handleRelogin() {
    try {
      const r = await fetch('/api/auth/relogin', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Relogin failed');
      // Polling effect will fetch the new state once the token is valid.
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  const filteredPosts = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.posts;
    if (filter === 'needs-work') return data.posts.filter((p) => !postIsComplete(p));
    return data.posts.filter(postIsComplete);
  }, [data, filter]);

  const needsWorkCount = useMemo(() => data?.posts.filter((p) => !postIsComplete(p)).length ?? 0, [data]);
  const completeCount = useMemo(() => data?.posts.filter(postIsComplete).length ?? 0, [data]);

  return (
    <div className="min-h-screen bg-carbon-950 pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-carbon-200 hover:text-electric-400 transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Content Enrichment</h1>
            <p className="text-carbon-300 text-sm mt-1">
              Dev-only portal · one place to manage covers, descriptions, audio, and transcripts for every post.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchList}
              disabled={loading}
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-carbon-800 border border-carbon-700 text-carbon-200 hover:text-white"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* Auth status */}
        {data && (
          <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 mb-5 ${
            data.auth.valid
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="w-4 h-4" />
              {data.auth.valid ? (
                <span>Google Cloud ADC: <strong>Authenticated</strong></span>
              ) : (
                <span>Google Cloud ADC: <strong>Expired or missing</strong> — Vertex API calls will fail until you re-authenticate.</span>
              )}
            </div>
            {!data.auth.valid && (
              <button
                type="button"
                onClick={handleRelogin}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Re-authenticate
              </button>
            )}
          </div>
        )}

        {/* Summary + filter */}
        {data && (
          <div className="rounded-2xl bg-carbon-800/50 border border-carbon-700/50 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs mb-4">
              <StatusStat label="Covers" ok={data.counts.coverOk} total={data.counts.total} Icon={ImageIcon} />
              <StatusStat label="Descriptions" ok={data.counts.descriptionOk} total={data.counts.total} Icon={FileText} />
              <StatusStat label="Brief audio" ok={data.counts.briefOk} total={data.counts.total} Icon={Volume2} />
              <StatusStat label="Podcast" ok={data.counts.podcastOk} total={data.counts.total} Icon={Volume2} />
              <StatusStat label="Article audio" ok={data.counts.articleOk} total={data.counts.total} Icon={Wand2} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {([
                ['all', `All · ${data.counts.total}`],
                ['needs-work', `Needs work · ${needsWorkCount}`],
                ['complete', `Complete · ${completeCount}`],
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
          </div>
        )}

        {loadError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm mb-6">
            Failed to load: {loadError}
          </div>
        )}

        {loading && !data ? (
          <div className="text-carbon-300 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredPosts.map((p) => (
              <PostCard
                key={p.slug}
                post={p}
                busy={busy[p.slug] ?? null}
                error={errs[p.slug] ?? null}
                progress={progress[p.slug] ?? ''}
                onRegenerateCover={() => regenerateCover(p.slug)}
                onRegenerateDescription={() => regenerateDescription(p.slug)}
                onUploadBrief={(f) => uploadAudio(p.slug, 'brief', f)}
                onUploadPodcast={(f) => uploadAudio(p.slug, 'podcast', f)}
                onGenerateArticleAudio={() => generateArticleAudio(p.slug)}
                onRetranscribe={(kind) => regenerateTranscript(p.slug, kind)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusStat({
  label,
  ok,
  total,
  Icon,
}: { label: string; ok: number; total: number; Icon: typeof ImageIcon }) {
  const pct = total === 0 ? 0 : ok / total;
  const color = pct === 1 ? 'text-green-400' : pct >= 0.66 ? 'text-electric-400' : 'text-safety-400';
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <div className="text-carbon-400 uppercase tracking-wider text-[10px]">{label}</div>
        <div className={`font-mono font-semibold ${color}`}>{ok}/{total}</div>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  busy: string | null;
  error: string | null;
  progress: string;
  onRegenerateCover: () => void;
  onRegenerateDescription: () => void;
  onUploadBrief: (file: File) => void;
  onUploadPodcast: (file: File) => void;
  onGenerateArticleAudio: () => void;
  onRetranscribe: (kind: 'brief' | 'podcast' | 'article') => void;
}

function PostCard({
  post,
  busy,
  error,
  progress,
  onRegenerateCover,
  onRegenerateDescription,
  onUploadBrief,
  onUploadPodcast,
  onGenerateArticleAudio,
  onRetranscribe,
}: PostCardProps) {
  const complete = postIsComplete(post);
  const borderClass = complete
    ? 'border-carbon-700/50'
    : 'border-safety-500/40';

  return (
    <article className={`rounded-2xl bg-carbon-800/50 border ${borderClass} overflow-hidden flex flex-col`}>
      <div className="flex gap-4 p-4 border-b border-carbon-700/40">
        <div className="flex-shrink-0 w-28 aspect-[16/9] rounded-lg overflow-hidden bg-carbon-900">
          {post.image ? (
            <img src={post.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-carbon-500 text-[10px]">no cover</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm md:text-base font-semibold text-white leading-tight line-clamp-2 hover:text-electric-400 transition-colors"
          >
            {post.title}
          </a>
          <p className="text-[10px] text-carbon-500 mt-0.5 font-mono break-all line-clamp-1">{post.slug}</p>
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] text-carbon-300">
                <Calendar className="w-3 h-3" />
                {formatDate(post.date)}
              </span>
              {post.isScheduled && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-400 text-yellow-950">
                  Scheduled
                </span>
              )}
              {complete && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/40">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Complete
                </span>
              )}
            </div>
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-carbon-300 bg-carbon-800 border border-carbon-700 hover:text-electric-400 hover:border-electric-500/40 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View post
            </a>
          </div>
        </div>
      </div>

      <div className="divide-y divide-carbon-700/40">
        {/* Cover */}
        <EnrichmentRow
          icon={ImageIcon}
          label="Cover image"
          status={post.image ? 'ok' : 'missing'}
          detail={post.image ? 'uploaded (WebP)' : undefined}
        >
          <button
            type="button"
            onClick={onRegenerateCover}
            disabled={busy != null}
            className={actionBtn('electric')}
          >
            {busy === 'cover' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : post.image ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {post.image ? 'Regenerate' : 'Generate'}
          </button>
          {post.image && (
            <Link
              to={`/admin/cover-review`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-carbon-300 bg-carbon-800 border border-carbon-700 hover:text-white"
              title="Open the iterative cover editor"
            >
              Edit in editor
            </Link>
          )}
        </EnrichmentRow>

        {/* Description */}
        <EnrichmentRow
          icon={FileText}
          label="Description"
          status={
            !post.description
              ? 'missing'
              : post.descriptionFlags.length > 0
              ? 'warn'
              : 'ok'
          }
          detail={
            post.description
              ? `${post.descriptionLength} chars${post.descriptionFlags.length ? ` · ${post.descriptionFlags.join(', ')}` : ''}`
              : undefined
          }
        >
          <button
            type="button"
            onClick={onRegenerateDescription}
            disabled={busy != null}
            className={actionBtn('electric')}
          >
            {busy === 'description' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Regenerate
          </button>
        </EnrichmentRow>

        {/* Brief audio */}
        <AudioRow
          label="Brief audio"
          url={post.briefAudioUrl}
          durationSec={post.briefDurationSec}
          hasTranscript={post.briefHasTranscript}
          busy={busy === 'brief'}
          retranscribeBusy={busy === 'transcript-brief'}
          onUpload={onUploadBrief}
          onRetranscribe={() => onRetranscribe('brief')}
          disabled={busy != null}
        />

        {/* Podcast audio */}
        <AudioRow
          label="Podcast"
          url={post.podcastAudioUrl}
          durationSec={post.podcastDurationSec}
          hasTranscript={post.podcastHasTranscript}
          busy={busy === 'podcast'}
          retranscribeBusy={busy === 'transcript-podcast'}
          onUpload={onUploadPodcast}
          onRetranscribe={() => onRetranscribe('podcast')}
          disabled={busy != null}
        />

        {/* Article audio */}
        <EnrichmentRow
          icon={Wand2}
          label="Article audio (TTS)"
          status={post.articleAudioUrl ? 'ok' : 'missing'}
          detail={
            post.articleAudioUrl
              ? `${formatDuration(post.articleDurationSec)}${post.articleHasTranscript ? ' · transcript ✓' : ' · no transcript'}`
              : undefined
          }
        >
          <button
            type="button"
            onClick={onGenerateArticleAudio}
            disabled={busy != null}
            className={actionBtn('electric')}
          >
            {busy === 'article' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : post.articleAudioUrl ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {post.articleAudioUrl ? 'Regenerate TTS' : 'Generate TTS'}
          </button>
          {post.articleAudioUrl && (
            <button
              type="button"
              onClick={() => onRetranscribe('article')}
              disabled={busy != null}
              className={actionBtn('neutral')}
            >
              {busy === 'transcript-article' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Re-transcribe
            </button>
          )}
        </EnrichmentRow>
      </div>

      {(busy || error || progress) && (
        <div className="px-4 py-2 border-t border-carbon-700/40 text-[11px] font-mono">
          {progress && !error && (
            <div className="text-electric-400 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              {progress}
            </div>
          )}
          {error && (
            <div className="text-red-400 break-words">
              <XCircle className="w-3 h-3 inline-block mr-1" />
              {error}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function EnrichmentRow({
  icon: Icon,
  label,
  status,
  detail,
  children,
}: {
  icon: typeof ImageIcon;
  label: string;
  status: 'ok' | 'warn' | 'missing';
  detail?: string;
  children: React.ReactNode;
}) {
  const { chip, color } = (() => {
    if (status === 'ok') return { chip: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />, color: 'text-green-400' };
    if (status === 'warn') return { chip: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />, color: 'text-yellow-400' };
    return { chip: <CircleAlert className="w-3.5 h-3.5 text-red-400" />, color: 'text-red-400' };
  })();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {chip}
        <Icon className="w-3.5 h-3.5 text-carbon-400" />
        <span className="text-xs font-semibold text-white truncate">{label}</span>
        {detail && <span className={`text-[10px] font-mono ${color} truncate`}>{detail}</span>}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

function AudioRow({
  label,
  url,
  durationSec,
  hasTranscript,
  busy,
  retranscribeBusy,
  onUpload,
  onRetranscribe,
  disabled,
}: {
  label: string;
  url: string | null;
  durationSec: number | null;
  hasTranscript: boolean;
  busy: boolean;
  retranscribeBusy: boolean;
  onUpload: (file: File) => void;
  onRetranscribe: () => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const status = url ? 'ok' : 'missing';
  const detail = url
    ? `${formatDuration(durationSec)}${hasTranscript ? ' · transcript ✓' : ' · no transcript'}`
    : undefined;

  return (
    <EnrichmentRow icon={Volume2} label={label} status={status} detail={detail}>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = ''; // allow re-selecting the same file later
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={actionBtn('electric')}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {url ? 'Re-upload' : 'Upload'}
      </button>
      {url && (
        <button
          type="button"
          onClick={onRetranscribe}
          disabled={disabled}
          className={actionBtn('neutral')}
        >
          {retranscribeBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Transcribe
        </button>
      )}
    </EnrichmentRow>
  );
}

function actionBtn(variant: 'electric' | 'neutral') {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  if (variant === 'electric') {
    return `${base} bg-electric-500/20 border border-electric-500/50 text-electric-300 hover:bg-electric-500/30`;
  }
  return `${base} text-carbon-300 bg-carbon-800 border border-carbon-700 hover:text-white`;
}
