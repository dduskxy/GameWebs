import React, { useEffect } from 'react';
import { Play, Sparkles, MessageSquareQuote } from 'lucide-react';
import './StoryCutscene.css';

export interface StoryCutsceneProps {
  title: string;
  description: string;
  image: string;
  highlights?: string[];
  quote?: string;
  onNext: () => void;
}

export const StoryCutscene: React.FC<StoryCutsceneProps> = ({
  title,
  description,
  image,
  highlights = [],
  quote,
  onNext
}) => {
  // Allow advancing cutscene via keyboard Enter or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div
      className="cutscene-overlay fade-in-cinematic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cutscene-title-heading"
    >
      <div className="cutscene-modal">

        {/* ── FULL-BLEED IMAGE LAYER ── */}
        <div className="cutscene-image-container">
          {/* Blurred ambient backdrop */}
          <img src={image} alt="" className="cutscene-blur-bg" aria-hidden="true" />
          {/* Main full image — uncropped, contained */}
          <img src={image} alt={title} className="cutscene-contain-img" />
          {/* Floating particles */}
          <div className="cutscene-ambient-particles">
            <span className="cutscene-p p1">✨</span>
            <span className="cutscene-p p2">🌸</span>
            <span className="cutscene-p p3">🌿</span>
            <span className="cutscene-p p4">✨</span>
          </div>
        </div>

        {/* ── CINEMATIC BADGE (top-left, z above image) ── */}
        <div className="cutscene-badge">
          <Sparkles size={14} color="#FFD700" />
          <span>ฉากเนื้อเรื่องชาดก</span>
        </div>

        {/* ── GRADIENT SCRIM ── */}
        <div className="cutscene-vignette" />

        {/* ── OVERLAID TEXT CONTENT (bottom) ── */}
        <div className="cutscene-content">

          <h2 id="cutscene-title-heading" className="cutscene-title">{title}</h2>

          {/* HIGHLIGHT PILLS */}
          {highlights.length > 0 && (
            <div className="story-highlights-pills">
              {highlights.map((h, index) => (
                <span key={index} className="story-pill">{h}</span>
              ))}
            </div>
          )}

          {/* CHARACTER QUOTE */}
          {quote && (
            <div className="story-quote-box">
              <MessageSquareQuote size={20} className="quote-icon" color="#f59e0b" />
              <blockquote className="quote-text">"{quote}"</blockquote>
            </div>
          )}

          {/* DESCRIPTION */}
          <p className="cutscene-description">{description}</p>

          <button className="btn-continue pulse-glow" onClick={onNext} autoFocus>
            <span>ดำเนินเนื้อเรื่องต่อ</span>
            <Play fill="currentColor" size={22} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default StoryCutscene;
