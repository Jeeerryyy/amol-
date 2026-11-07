import React, { useRef, useEffect, useState, useCallback } from 'react';
import { siteConfig } from '../../siteConfig';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './Hero.css';

const TOTAL_FRAMES = 240;

const getFramePath = (index: number): string => {
  const padded = String(index + 1).padStart(3, '0');
  return `/hero-frames/ezgif-frame-${padded}.jpg`;
};

export const Hero: React.FC = () => {
  const { hero } = siteConfig;
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cached HTMLImageElement pool
  const imagesMapRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState<boolean>(false);

  // Helper to draw an image centered with "cover" aspect ratio onto canvas
  const drawCover = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;
    const imgRatio = imgW / imgH;
    const canvasRatio = width / height;

    let drawW = width;
    let drawH = height;
    let startX = 0;
    let startY = 0;

    if (canvasRatio > imgRatio) {
      drawH = width / imgRatio;
      startY = (height - drawH) / 2;
    } else {
      drawW = height * imgRatio;
      startX = (width - drawW) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, startX, startY, drawW, drawH);
  }, []);

  // Find the exact loaded frame or the nearest loaded frame fallback
  const renderFrame = useCallback((targetIndex: number) => {
    const images = imagesMapRef.current;
    let imgToDraw = images.get(targetIndex);

    if (!imgToDraw || !imgToDraw.complete) {
      // Find nearest loaded frame
      let closestDiff = Infinity;
      let closestFrame: HTMLImageElement | null = null;
      for (const [idx, img] of images.entries()) {
        if (img.complete && img.naturalWidth > 0) {
          const diff = Math.abs(idx - targetIndex);
          if (diff < closestDiff) {
            closestDiff = diff;
            closestFrame = img;
          }
        }
      }
      imgToDraw = closestFrame || undefined;
    }

    if (imgToDraw) {
      drawCover(imgToDraw);
      currentFrameRef.current = targetIndex;
    }
  }, [drawCover]);

  // Handle canvas sizing on resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // Re-render current frame after resize
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Progressive image preloading pipeline
  useEffect(() => {
    let isCancelled = false;

    const loadImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (imagesMapRef.current.has(index)) {
          const existing = imagesMapRef.current.get(index)!;
          if (existing.complete) return resolve(existing);
        }

        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (!isCancelled) {
            imagesMapRef.current.set(index, img);
          }
          resolve(img);
        };
        img.onerror = reject;
      });
    };

    // Priority 1: First frame (immediate initial paint)
    loadImage(0)
      .then((firstImg) => {
        if (!isCancelled) {
          setIsFirstFrameLoaded(true);
          drawCover(firstImg);
        }
      })
      .catch(() => {});

    // Priority 2: Initial scroll buffer (first 20 frames)
    const initialBuffer = Array.from({ length: 20 }, (_, i) => i + 1);
    Promise.allSettled(initialBuffer.map((i) => loadImage(i))).then(() => {
      if (isCancelled) return;

      // Priority 3: Strategic keyframes throughout sequence (every 8th frame)
      const keyframes: number[] = [];
      for (let i = 24; i < TOTAL_FRAMES; i += 8) {
        keyframes.push(i);
      }
      Promise.allSettled(keyframes.map((i) => loadImage(i))).then(() => {
        if (isCancelled) return;

        // Priority 4: Background fill remaining frames in small idle batches
        const remaining: number[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!imagesMapRef.current.has(i)) {
            remaining.push(i);
          }
        }

        const batchSize = 6;
        let batchIdx = 0;

        const loadNextBatch = () => {
          if (isCancelled || batchIdx >= remaining.length) return;
          const slice = remaining.slice(batchIdx, batchIdx + batchSize);
          batchIdx += batchSize;

          Promise.allSettled(slice.map((idx) => loadImage(idx))).then(() => {
            if (!isCancelled && batchIdx < remaining.length) {
              if ('requestIdleCallback' in window) {
                (window as Window).requestIdleCallback(loadNextBatch);
              } else {
                setTimeout(loadNextBatch, 30);
              }
            }
          });
        };

        if ('requestIdleCallback' in window) {
          (window as Window).requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 50);
        }
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [drawCover]);

  // Scroll listener mapped to frame index
  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const track = trackRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const scrollDistance = rect.height - window.innerHeight;

        if (scrollDistance <= 0) return;

        // Calculate progress 0.0 to 1.0 through the hero track
        const rawProgress = -rect.top / scrollDistance;
        const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
        setScrollProgress(clampedProgress);

        const targetFrame = Math.min(
          Math.floor(clampedProgress * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );

        if (targetFrame !== currentFrameRef.current) {
          renderFrame(targetFrame);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Initial resize & frame check
    resizeCanvas();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [renderFrame, resizeCanvas]);

  // Opacity & translation for content as user reveals feast
  const contentOpacity =
    scrollProgress < 0.65 ? 1 : Math.max(0, 1 - (scrollProgress - 0.65) / 0.28);
  const contentTranslateY =
    scrollProgress < 0.65 ? 0 : -((scrollProgress - 0.65) / 0.28) * 36;

  return (
    <section className="hero-scroll-track" id="hero" ref={trackRef}>
      {/* Canonical accessible H1 for FAANG-standard SEO & accessibility */}
      <h1 className="sr-only">Amol Veg Resto — Best Pure Veg Restaurant in Solapur</h1>

      {/* Sticky Viewport Container */}
      <div className="hero-sticky-frame">
        {/* Canvas Background Layer */}
        <div className="hero-canvas-container" aria-hidden="true">
          {/* Static fallback poster image for instantaneous LCP before JS executes */}
          <img
            src="/hero-frames/ezgif-frame-001.jpg"
            alt=""
            className={`hero-canvas-poster ${isFirstFrameLoaded ? 'fade-out' : ''}`}
            fetchPriority="high"
            loading="eager"
          />
          <canvas ref={canvasRef} className="hero-scroll-canvas" />
          <div className="hero-canvas-overlay" />
        </div>

        {/* Content Wrapper with graceful fade on scroll */}
        <div
          className="hero-content-wrapper"
          style={{
            opacity: contentOpacity,
            transform: `translate3d(0, ${contentTranslateY}px, 0)`,
            pointerEvents: contentOpacity < 0.1 ? 'none' : 'auto',
          }}
        >
          {/* DESKTOP VIEW (>900px) */}
          <div className="hero-desktop-content">
            <div className="container hero-container">
              {/* Left Content: Authentic Flavours Feel Like Home */}
              <div className="hero-col hero-col-left">
                <span className="hero-eyebrow">{hero.leftEyebrow}</span>
                <div className="hero-title" aria-hidden="true">
                  <span className="hero-title-line">{hero.heading.line1}</span>
                  <span className="hero-title-line text-orange">{hero.heading.line2}</span>
                  <span className="hero-title-line">{hero.heading.line3}</span>
                </div>
                <span className="hero-subtag">{hero.subtag}</span>
              </div>

              {/* Right Content: Good Food Brings People Together */}
              <div className="hero-col hero-col-right">
                <span className="hero-eyebrow right-eyebrow">{hero.rightEyebrow}</span>

                <h2 className="hero-right-heading">
                  {hero.rightHeadingLines.map((line, i) => (
                    <span key={i} className="hero-right-line">{line}</span>
                  ))}
                </h2>

                <div className="hero-orange-rule" aria-hidden="true" />

                <span className="hero-heritage">{hero.rightHeritage}</span>

                <a href={hero.exploreMenuButton.href} className="hero-explore-btn">
                  <span className="explore-text">{hero.exploreMenuButton.text}</span>
                  <span className="explore-icon-circle">
                    <ArrowRight size={16} strokeWidth={2.4} className="explore-arrow-icon" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* MOBILE & TABLET VIEW (<=900px) */}
          <div className="hero-mobile-content">
            <div className="hero-mobile-card">
              {/* Eyebrow flanked by rules */}
              <div className="hero-mobile-eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                <span className="eyebrow-text">{hero.leftEyebrow || "PURE VEG. PURE TASTE."}</span>
                <span className="eyebrow-line" aria-hidden="true" />
              </div>

              {/* Main Title */}
              <div className="hero-mobile-title" aria-hidden="true">
                <span className="hero-mobile-title-row">
                  {hero.heading.line1}{' '}
                  <span className="hero-mobile-highlight">{hero.heading.line2}</span>
                </span>
                <span className="hero-mobile-title-row">
                  <span>{hero.heading.line3}</span>
                </span>
              </div>

              {/* Subtag */}
              <p className="hero-mobile-subtag">{hero.subtag || "ALWAYS AMOL."}</p>

              {/* Single Focused CTA to Menu */}
              <a href={hero.exploreMenuButton.href || "/menu/"} className="hero-mobile-cta-btn">
                <span>EXPLORE FULL MENU</span>
                <ArrowRight size={17} strokeWidth={2.6} />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll To Reveal Feast Prompt Indicator */}
        <div
          className={`hero-scroll-prompt ${scrollProgress > 0.08 ? 'faded' : ''}`}
          aria-hidden="true"
        >
          <span className="hero-prompt-text">SCROLL TO REVEAL FEAST</span>
          <span className="hero-prompt-icon">
            <ChevronDown size={18} strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
