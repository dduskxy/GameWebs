import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Sparkles, Scroll, Heart } from 'lucide-react';

export interface StoryIntroProps {
  onComplete: () => void;
  title?: string;
}

// Cinematic Story intro text for Syama Jataka
const FULL_STORY_TEXT = `กาลครั้งหนึ่งนานมาแล้ว... ณ ป่าหิมพานต์อันลึกลับ... ชายหนุ่มนามว่า สุวรรณสาม ผู้เปี่ยมไปด้วยความกตัญญู...

เขาอุทิศตนดูแลบิดามารดาผู้ตาบอดทั้งสองอย่างใกล้ชิด ด้วยหัวใจที่บริสุทธิ์ เมตตาธรรมของเขาเจิดจรัสตตลอดทั่วทั้งผืนป่า แม้กระทั่งเหล่าสัตว์ป่าดุร้ายก็ยังกลายเป็นมิตรสนิทสนม...

ทว่า วันหนึ่งเมื่อพระราชาเสด็จประพาสป่า... เหตุการณ์ไม่คาดฝันก็เกิดขึ้น! ศรแห่งชะตากรรมถูกยิงออกไป...

ร่วมเดินทางสัมผัสพลังแห่ง "ความกตัญญู" ที่สะเทือนถึงสรวงสวรรค์ และปาฏิหาริย์ที่จะเปลี่ยนชีวิตของเขากับครอบครัวไปตลอดกาล...`;

export const StoryIntro: React.FC<StoryIntroProps> = ({ onComplete, title = "สุวรรณสามชาดก" }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API for soft harp/chime typewriter sound effect
  const playTypewriterSound = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 + Math.random() * 180, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore browser autoplay restrictions
    }
  }, [isMuted]);

  const playScrollOpenSound = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore audio errors
    }
  }, [isMuted]);

  useEffect(() => {
    playScrollOpenSound();
  }, [playScrollOpenSound]);

  // Typewriter effect interval
  useEffect(() => {
    if (displayedLength < FULL_STORY_TEXT.length) {
      const char = FULL_STORY_TEXT[displayedLength];
      let delay = 40;
      if (char === '.' || char === '…') delay = 120;
      if (char === '\n') delay = 280;

      const timer = setTimeout(() => {
        setDisplayedLength((prev) => prev + 1);
        if (displayedLength % 2 === 0) {
          playTypewriterSound();
        }
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [displayedLength, playTypewriterSound]);

  // Fast forward / Instant complete on click
  const handleContainerClick = () => {
    if (!isFinished) {
      setDisplayedLength(FULL_STORY_TEXT.length);
      setIsFinished(true);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  const visibleText = FULL_STORY_TEXT.slice(0, displayedLength);

  return (
    <div 
      className="story-intro-overlay"
      onClick={handleContainerClick}
      aria-label="Story Intro Overlay"
    >
      <style>{`
        .story-intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(15, 10, 30, 0.92) 0%, rgba(5, 3, 10, 0.98) 100%);
          backdrop-filter: blur(8px);
          padding: 1.5rem;
          font-family: 'Sarabun', 'Prompt', system-ui, -apple-system, sans-serif;
          user-select: none;
          animation: storyFadeIn 0.6s ease-out forwards;
        }

        @keyframes storyFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .story-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .story-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #fbbf24;
          border-radius: 50%;
          box-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b;
          animation: floatParticle 8s infinite ease-in-out;
          opacity: 0.6;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-100px) translateX(30px) scale(1.4); opacity: 0.8; }
        }

        .story-scroll-container {
          position: relative;
          width: 100%;
          max-width: 720px;
          background: linear-gradient(145deg, #1c150c 0%, #2a1f10 50%, #171108 100%);
          border: 2px solid #d97706;
          border-radius: 1.5rem;
          box-shadow: 
            0 0 35px rgba(217, 119, 6, 0.25),
            0 20px 50px rgba(0, 0, 0, 0.8),
            inset 0 0 30px rgba(217, 119, 6, 0.15);
          padding: 2.5rem 2rem;
          color: #fef3c7;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          cursor: pointer;
          overflow: hidden;
        }

        .scroll-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #f59e0b;
          border-style: solid;
          pointer-events: none;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
        .corner-tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }

        .story-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(217, 119, 6, 0.3);
          padding-bottom: 1rem;
        }

        .story-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .story-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          background: rgba(217, 119, 6, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 9999px;
          color: #fbbf24;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .story-main-title {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fffbeb 0%, #fde047 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
          margin: 0;
        }

        .story-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .icon-btn {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(217, 119, 6, 0.3);
          color: #fef3c7;
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          background: rgba(217, 119, 6, 0.3);
          border-color: #f59e0b;
          color: #fff;
          transform: translateY(-1px);
        }

        .skip-btn {
          background: linear-gradient(135deg, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.5) 100%);
          border: 1px solid #f59e0b;
          color: #fef3c7;
          padding: 0.45rem 1rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .skip-btn:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          color: #ffffff;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.6);
          transform: scale(1.05);
        }

        .story-body {
          min-height: 200px;
          line-height: 1.8;
          font-size: 1.15rem;
          color: #fef9c3;
          white-space: pre-line;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          position: relative;
        }

        .cursor {
          display: inline-block;
          width: 8px;
          height: 1.15rem;
          background-color: #f59e0b;
          margin-left: 4px;
          vertical-align: middle;
          box-shadow: 0 0 8px #f59e0b;
          animation: blink 0.8s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .story-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(217, 119, 6, 0.2);
          padding-top: 1rem;
          margin-top: 0.5rem;
        }

        .hint-text {
          font-size: 0.85rem;
          color: #d97706;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .start-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          color: #1c150c;
          font-weight: 800;
          font-size: 1.1rem;
          padding: 0.75rem 2rem;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 
            0 0 20px rgba(245, 158, 11, 0.5),
            0 4px 10px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: pulseGlow 2s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.9); transform: scale(1.02); }
        }

        .start-btn:hover {
          transform: translateY(-2px) scale(1.06);
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
        }
      `}</style>

      {/* Background magical floating particles */}
      <div className="story-particles">
        <div className="story-particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
        <div className="story-particle" style={{ top: '60%', left: '80%', animationDelay: '2s' }} />
        <div className="story-particle" style={{ top: '75%', left: '25%', animationDelay: '4s' }} />
        <div className="story-particle" style={{ top: '30%', left: '70%', animationDelay: '1s' }} />
        <div className="story-particle" style={{ top: '85%', left: '60%', animationDelay: '5s' }} />
      </div>

      <div className="story-scroll-container">
        {/* Decorative Golden Scroll Corners */}
        <div className="scroll-corner corner-tl" />
        <div className="scroll-corner corner-tr" />
        <div className="scroll-corner corner-bl" />
        <div className="scroll-corner corner-br" />

        {/* Header section */}
        <div className="story-header">
          <div className="story-title-group">
            <span className="story-badge">
              <Scroll size={14} /> นิทานชาดก
            </span>
            <h2 className="story-main-title">{title}</h2>
          </div>

          <div className="story-controls">
            <button 
              className="icon-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button 
              className="skip-btn" 
              onClick={handleSkip}
              title="ข้ามคำเกริ่นนำ"
            >
              <span>ข้าม</span>
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        {/* Typewriter Text Body */}
        <div className="story-body">
          {visibleText}
          {!isFinished && <span className="cursor" />}
        </div>

        {/* Footer controls */}
        <div className="story-footer">
          <div className="hint-text">
            {!isFinished ? (
              <>
                <Sparkles size={14} />
                <span>คลิกที่ใดก็ได้ในกล่องเพื่อเร่งข้อความให้จบ</span>
              </>
            ) : (
              <>
                <Heart size={14} />
                <span>เรื่องราวทรงคุณค่าแห่งความกตัญญู</span>
              </>
            )}
          </div>

          {isFinished ? (
            <button 
              className="start-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              <span>เริ่มเรื่องราว</span>
              <Play size={20} fill="currentColor" />
            </button>
          ) : (
            <button 
              className="skip-btn"
              onClick={handleSkip}
            >
              <span>ข้าม ▶</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryIntro;
