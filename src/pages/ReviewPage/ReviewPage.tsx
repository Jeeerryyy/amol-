import React, { useState, useEffect, useRef, useCallback } from 'react';
import { REVIEW_CONFIG, ReviewOption } from '../../../review.config.js';
import { buildLocalDraft } from '../../../reviewTemplates.js';
import { siteConfig } from '../../siteConfig';
import {
  Star,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import './ReviewPage.css';

export const ReviewPage: React.FC = () => {
  const [stars, setStars] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState<string>('');
  const [userEdited, setUserEdited] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Dynamic config with safe bundled fallback
  const [reviewConfigData, setReviewConfigData] = useState<{
    googleReviewUrl: string;
    options: ReviewOption[];
  }>({
    googleReviewUrl: REVIEW_CONFIG.GOOGLE_REVIEW_URL,
    options: REVIEW_CONFIG.OPTIONS,
  });

  // Track if "started" event was sent this session
  const hasStartedRef = useRef<boolean>(false);

  // Fetch dynamic review config from API on mount
  useEffect(() => {
    fetch('/api/public/review-config')
      .then((res) => {
        if (!res.ok) throw new Error('API config unavailable');
        return res.json();
      })
      .then((data) => {
        if (data && data.options && data.options.length > 0) {
          setReviewConfigData({
            googleReviewUrl: data.googleReviewUrl || REVIEW_CONFIG.GOOGLE_REVIEW_URL,
            options: data.options,
          });
        }
      })
      .catch((err) => {
        console.warn('[Review] Using bundled config defaults:', err);
      });
  }, []);

  // References for debounce and streaming control
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstTokenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userEditedRef = useRef<boolean>(false);
  const previousReviewRef = useRef<string>('');

  // Keep userEditedRef in sync
  useEffect(() => {
    userEditedRef.current = userEdited;
  }, [userEdited]);

  // Page title & noindex meta tag
  useEffect(() => {
    const originalTitle = document.title;
    document.title = REVIEW_CONFIG.UI.pageTitle;

    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      metaRobots.content = 'noindex';
      document.head.appendChild(metaRobots);
      created = true;
    } else {
      metaRobots.setAttribute('content', 'noindex');
    }

    return () => {
      document.title = originalTitle;
      if (created && metaRobots?.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      }
    };
  }, []);

  // Cleanup abort controller and timers on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (firstTokenTimeoutRef.current) clearTimeout(firstTokenTimeoutRef.current);
      if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
    };
  }, []);

  // Helper to trigger AI Polish via streaming SSE
  const requestAIPolish = useCallback(
    (currentStars: number, currentIds: string[], currentSeed: number) => {
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (firstTokenTimeoutRef.current) clearTimeout(firstTokenTimeoutRef.current);
      if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsPolishing(true);

      let hasReceivedFirstToken = false;
      let accumulatedText = '';

      // First token timeout (3000ms): if no token arrives, abort silently
      firstTokenTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedFirstToken) {
          controller.abort();
          setIsPolishing(false);
        }
      }, REVIEW_CONFIG.FIRST_TOKEN_TIMEOUT_MS);

      // Hard timeout (6000ms): abort silently
      hardTimeoutRef.current = setTimeout(() => {
        controller.abort();
        setIsPolishing(false);
      }, REVIEW_CONFIG.HARD_TIMEOUT_MS);

      fetch(REVIEW_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: currentStars,
          selectedIds: currentIds,
          seed: currentSeed,
          previousReview: previousReviewRef.current || undefined,
        }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            // Silently fall back to local draft
            setIsPolishing(false);
            return;
          }

          const reader = res.body?.getReader();
          if (!reader) {
            setIsPolishing(false);
            return;
          }

          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') {
                  setIsPolishing(false);
                  return;
                }

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.fullText) {
                    if (!userEditedRef.current) {
                      setReviewText(parsed.fullText);
                    }
                  } else if (parsed.text || parsed.delta) {
                    const token = parsed.text || parsed.delta;
                    if (!hasReceivedFirstToken) {
                      hasReceivedFirstToken = true;
                      if (firstTokenTimeoutRef.current) {
                        clearTimeout(firstTokenTimeoutRef.current);
                      }
                    }

                    accumulatedText += token;

                    // Only update if user has NOT manually edited the review
                    if (!userEditedRef.current) {
                      setReviewText(accumulatedText);
                    }
                  }
                } catch {
                  // Ignore JSON parse errors in malformed stream lines
                }
              }
            }
          }

          setIsPolishing(false);
        })
        .catch((err) => {
          // If aborted or failed, silently fallback to local draft with zero customer error
          if (err.name !== 'AbortError') {
            // Silently ignore network/server errors
          }
          setIsPolishing(false);
        });
    },
    []
  );

  // Handle Star change
  const handleStarSelect = (rating: number) => {
    setStars(rating);

    // Send anonymous "started" event on first star tap of the session
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      fetch('/api/public/review-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'started', stars: rating }),
      }).catch(() => {});
    }

    // If rating is 1-3, filter out positiveOnly options (e.g. pureveg)
    let updatedIds = selectedIds;
    if (rating <= 3) {
      const allowed = new Set(
        reviewConfigData.options
          .filter((o: ReviewOption) => !o.positiveOnly)
          .map((o: ReviewOption) => o.id)
      );
      updatedIds = selectedIds.filter((id) => allowed.has(id));
      setSelectedIds(updatedIds);
    }

    // 0ms instant local draft update (if user hasn't typed their own edits)
    if (!userEdited) {
      const localDraft = buildLocalDraft(rating, updatedIds, seed, reviewConfigData.options);
      setReviewText(localDraft);
    }

    // Debounced AI polish (700ms)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      requestAIPolish(rating, updatedIds, seed);
    }, REVIEW_CONFIG.DEBOUNCE_MS);
  };

  // Handle Option Toggle
  const handleOptionToggle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId);
    const updated = isSelected
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    setSelectedIds(updated);

    // 0ms instant local draft update (if user hasn't edited)
    if (!userEdited) {
      const localDraft = buildLocalDraft(stars, updated, seed, reviewConfigData.options);
      setReviewText(localDraft);
    }

    // Debounced AI polish
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      requestAIPolish(stars, updated, seed);
    }, REVIEW_CONFIG.DEBOUNCE_MS);
  };

  // Handle Regenerate button click
  const handleRegenerate = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    setSeed(newSeed);

    // Keep current review as previousReview context for AI
    previousReviewRef.current = reviewText;

    // Reset userEdited flag so fresh text replaces textarea
    setUserEdited(false);
    userEditedRef.current = false;

    // Instantly generate fresh local draft with new seed
    const localDraft = buildLocalDraft(stars, selectedIds, newSeed, reviewConfigData.options);
    setReviewText(localDraft);

    // Immediately trigger AI Polish
    requestAIPolish(stars, selectedIds, newSeed);
  };

  // Textarea change
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
    setUserEdited(true);
    userEditedRef.current = true;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Submit button click
  const handleSubmit = async () => {
    const textToSubmit = reviewText.trim() || buildLocalDraft(stars, selectedIds, seed, reviewConfigData.options);

    // 1. Copy to clipboard
    await copyToClipboard(textToSubmit);

    // 2. Log anonymous "submitted" event via sendBeacon / keepalive fetch
    const eventPayload = JSON.stringify({
      type: 'submitted',
      stars,
      optionIds: selectedIds,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([eventPayload], { type: 'application/json' });
      navigator.sendBeacon('/api/public/review-events', blob);
    } else {
      fetch('/api/public/review-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: eventPayload,
        keepalive: true,
      }).catch(() => {});
    }

    // 3. Open Google Review URL in a new tab immediately
    window.open(reviewConfigData.googleReviewUrl, '_blank', 'noopener,noreferrer');

    // 4. Switch to submitted screen
    setIsSubmitted(true);
  };

  // Available options based on star band
  const availableOptions: ReviewOption[] =
    stars <= 3
      ? reviewConfigData.options.filter((opt: ReviewOption) => !opt.positiveOnly)
      : reviewConfigData.options;

  // Render Submitted State (Review Copied)
  if (isSubmitted) {
    return (
      <div className="review-page-root paper-bg">
        <header className="review-header">
          <div className="review-header-container">
            <a href="#/" className="review-brand-link">
              <img
                src={siteConfig.brand.logoPath}
                alt={siteConfig.brand.name}
                className="review-header-logo"
              />
              <div className="review-brand-text">
                <span className="review-brand-title">{siteConfig.brand.name}</span>
                <span className="review-brand-sub">
                  {REVIEW_CONFIG.AREA}, {REVIEW_CONFIG.CITY}
                </span>
              </div>
            </a>
            <a href="#/" className="review-back-btn">
              <ArrowLeft size={16} />
              <span>Back to Website</span>
            </a>
          </div>
        </header>

        <main className="review-main-content">
          <div className="review-card-container review-success-card">
            <div className="success-icon-badge" aria-hidden="true">
              <Check size={36} strokeWidth={2.5} />
            </div>

            <h1 className="success-heading">
              {REVIEW_CONFIG.UI.reviewCopiedState.heading}
            </h1>
            <p className="success-instructions">
              {REVIEW_CONFIG.UI.reviewCopiedState.instructions}
            </p>

            <div className="copied-review-preview">
              <div className="preview-header">
                <span className="preview-label">Your Review Text</span>
                <span className="preview-stars">
                  {'★'.repeat(stars)}
                  {'☆'.repeat(5 - stars)}
                </span>
              </div>
              <p className="preview-text">{reviewText}</p>
            </div>

            <div className="success-actions-group">
              <button
                type="button"
                className="btn-action-primary"
                onClick={() =>
                  window.open(reviewConfigData.googleReviewUrl, '_blank', 'noopener,noreferrer')
                }
              >
                <span>{REVIEW_CONFIG.UI.reviewCopiedState.openGoogleAgainText}</span>
                <ExternalLink size={16} />
              </button>

              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => copyToClipboard(reviewText)}
              >
                {copiedToast ? <Check size={16} color="#0D9926" /> : <Copy size={16} />}
                <span>
                  {copiedToast
                    ? REVIEW_CONFIG.UI.reviewCopiedState.copiedSuccessToast
                    : REVIEW_CONFIG.UI.reviewCopiedState.copyAgainText}
                </span>
              </button>
            </div>

            <div className="success-footer-links">
              <button
                type="button"
                className="link-plain-btn"
                onClick={() => setIsSubmitted(false)}
              >
                Edit review or try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="review-page-root paper-bg">
      {/* 1. Header with logo and back link */}
      <header className="review-header">
        <div className="review-header-container">
          <a href="#/" className="review-brand-link">
            <img
              src={siteConfig.brand.logoPath}
              alt={siteConfig.brand.name}
              className="review-header-logo"
            />
            <div className="review-brand-text">
              <span className="review-brand-title">{siteConfig.brand.name}</span>
              <span className="review-brand-sub">
                {REVIEW_CONFIG.AREA}, {REVIEW_CONFIG.CITY}
              </span>
            </div>
          </a>
          <a href="#/" className="review-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Website</span>
          </a>
        </div>
      </header>

      {/* 2. Main Progressive Review Form */}
      <main className="review-main-content">
        <div className="review-card-container">
          {/* STEP 1: Star Rating */}
          <section className="review-step step-rating">
            <h1 className="step-heading">{REVIEW_CONFIG.UI.ratingHeading}</h1>

            <div
              className="star-rating-group"
              role="radiogroup"
              aria-label="Star rating out of 5"
            >
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isActive = (hoveredStar || stars) >= starVal;
                const isSelected = stars === starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${starVal} star${starVal > 1 ? 's' : ''} - ${
                      REVIEW_CONFIG.STAR_LABELS[starVal - 1]
                    }`}
                    className={`star-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleStarSelect(starVal)}
                    onMouseEnter={() => setHoveredStar(starVal)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onFocus={() => setHoveredStar(starVal)}
                    onBlur={() => setHoveredStar(0)}
                  >
                    <Star
                      size={36}
                      className="star-icon"
                      fill={isActive ? 'var(--color-accent-orange)' : 'none'}
                      stroke={isActive ? 'var(--color-accent-orange)' : 'var(--color-border)'}
                    />
                  </button>
                );
              })}
            </div>

            <div className="star-feedback-label" aria-live="polite">
              {stars > 0 ? (
                <span className="star-label-badge">
                  {REVIEW_CONFIG.STAR_LABELS[stars - 1]}
                </span>
              ) : (
                <span className="star-label-hint">Select a star rating to begin</span>
              )}
            </div>
          </section>

          {/* STEP 2: Option Chips (Revealed when stars > 0) */}
          {stars > 0 && (
            <section className="review-step step-options animate-slide-in">
              <h2 className="step-subheading">
                {stars >= 4
                  ? REVIEW_CONFIG.UI.positiveAspectsHeading
                  : REVIEW_CONFIG.UI.improveAspectsHeading}
              </h2>

              <div className="option-chips-grid">
                {availableOptions.map((opt) => {
                  const isPressed = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="button"
                      aria-pressed={isPressed}
                      className={`option-chip ${isPressed ? 'chip-selected' : ''}`}
                      onClick={() => handleOptionToggle(opt.id)}
                    >
                      <span className="chip-indicator">
                        {isPressed ? <Check size={13} strokeWidth={3} /> : null}
                      </span>
                      <span className="chip-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 3: Review Box (Revealed when stars > 0) */}
          {stars > 0 && (
            <section className="review-step step-review-box animate-slide-in">
              <div className="review-box-header">
                <label htmlFor="review-textarea" className="review-box-label">
                  <MessageSquare size={16} className="label-icon" />
                  <span>{REVIEW_CONFIG.UI.reviewBoxLabel}</span>
                </label>

                <div className="review-box-actions">
                  {isPolishing && (
                    <div className="polishing-indicator" aria-live="polite">
                      <Sparkles size={14} className="sparkle-spin" />
                      <span>{REVIEW_CONFIG.UI.polishingIndicator}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-regenerate"
                    onClick={handleRegenerate}
                    title="Generate another variation"
                  >
                    <RotateCw size={13} className={isPolishing ? 'icon-spin' : ''} />
                    <span>{REVIEW_CONFIG.UI.regenerateButtonText}</span>
                  </button>
                </div>
              </div>

              <div className="textarea-wrapper">
                <textarea
                  id="review-textarea"
                  className="review-textarea"
                  value={reviewText}
                  onChange={handleTextareaChange}
                  placeholder={REVIEW_CONFIG.UI.reviewPlaceholder}
                  rows={4}
                />
                {userEdited && (
                  <span className="user-edited-hint">
                    Custom edit enabled (AI auto-updates paused)
                  </span>
                )}
              </div>
            </section>
          )}

          {/* STEP 4: Sticky Submit Button (Revealed when stars > 0) */}
          {stars > 0 && (
            <div className="sticky-submit-container animate-slide-in">
              <button
                type="button"
                className="btn-submit-review"
                onClick={handleSubmit}
              >
                <span>{REVIEW_CONFIG.UI.submitButtonText}</span>
                <ExternalLink size={18} />
              </button>
              <p className="submit-disclaimer">
                {REVIEW_CONFIG.UI.submitDisclaimer}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
