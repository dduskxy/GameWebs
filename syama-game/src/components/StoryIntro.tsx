import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Sparkles, Scroll, Heart } from 'lucide-react';

export interface StoryIntroProps {
  onComplete: () => void;
  title?: string;
}

// Cinematic Story intro text for Syama Jataka
const FULL_STORY_TEXT = `กาลครั้งหนึ่งนานมาแล้ว... ณ ป่าหิมพานต์อันลึกลับ... ชายหนุ่มนามว่า สุวรรณสาม ผู้เปี่ยมไปด้วยความกตัญญู...

เขาอุทิศตนดูแลบิดามารดาผู้ตาบอดทั้งสองอย่างใกล้ชิด ด้วยหัวใจที่บริสุทธิ์ เมตตาธรรมของเขาเจิดจรัสตลอดทั่วทั้งผืนป่า แม้กระทั่งเหล่าสัตว์ป่าดุร้ายก็ยังกลายเป็นมิตรสนิทสนม...

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
          background: rgba(12, 10, 9, 0.88);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          font-family: 'Prompt', 'Kanit', sans-serif;
          user-select: none;
          animation: storyFadeIn 0.4s ease-out forwards;
        }

        @keyframes storyFadeIn {
          from { opacity: 0; transform: scale(0.96); }
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
          width: 6px;
          height: 6px;
          background: #fbbf24;
          border-radius: 50%;
          box-shadow: 0 0 10px #fbbf24;
          animation: floatParticle 8s infinite ease-in-out;
          opacity: 0.75;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.3; }
          50% { transform: translateY(-80px) scale(1.4); opacity: 0.9; }
        }

        .story-scroll-container {
          position: relative;
          width: 100%;
          max-width: 760px;
          background: linear-gradient(145deg, #fef9c3 0%, #fef08a 60%, #fde047 100%);
          border: 5px solid #78350f;
          border-radius: 28px;
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.6),
            inset 0 0 30px rgba(180, 83, 9, 0.2);
          padding: 2.2rem 2.2rem;
          color: #270e02;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          cursor: pointer;
          overflow: hidden;
        }

        .scroll-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #78350f;
          border-style: solid;
          pointer-events: none;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 4px 0 0 4px; border-top-left-radius: 8px; }
        .corner-tr { top: 12px; right: 12px; border-width: 4px 4px 0 0; border-top-right-radius: 8px; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 4px 4px; border-bottom-left-radius: 8px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 4px 4px 0; border-bottom-right-radius: 8px; }

        .story-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px dashed rgba(120, 53, 15, 0.4);
          padding-bottom: 0.85rem;
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
          padding: 0.35rem 0.85rem;
          background: #78350f;
          border: 2px solid #fbbf24;
          border-radius: 9999px;
          color: #fef08a;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .story-main-title {
          font-size: 1.85rem;
          font-weight: 900;
          color: #78350f;
          margin: 0;
        }

        .story-controls {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .icon-btn {
          background: #78350f;
          border: 2px solid #fbbf24;
          color: #fef08a;
          padding: 0.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          background: #b45309;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .skip-btn {
          background: #78350f;
          border: 2px solid #fbbf24;
          color: #fef08a;
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .skip-btn:hover {
          background: #b45309;
          color: #ffffff;
          transform: scale(1.04);
        }

        .story-body {
          min-height: 200px;
          line-height: 1.85;
          font-size: 1.45rem;
          font-weight: 700;
          color: #270e02;
          white-space: pre-line;
          position: relative;
        }

        .cursor {
          display: inline-block;
          width: 8px;
          height: 1.3rem;
          background-color: #d97706;
          margin-left: 4px;
          vertical-align: middle;
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
          border-top: 2px dashed rgba(120, 53, 15, 0.4);
          padding-top: 0.85rem;
        }

        .hint-text {
          font-size: 0.95rem;
          font-weight: 800;
          color: #78350f;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .start-btn {
          background: linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 1.25rem;
          padding: 0.75rem 2.2rem;
          border-radius: 9999px;
          border: 3px solid #fbbf24;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 6px 0 #451a03, 0 8px 16px rgba(0, 0, 0, 0.3);
          transition: all 0.15s ease;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 #451a03, 0 12px 20px rgba(0, 0, 0, 0.4);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
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
