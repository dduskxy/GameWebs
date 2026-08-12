import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, RefreshCcw, CheckCircle, XCircle, Crown, Heart, Sun, ShieldCheck, Award } from 'lucide-react';
import StoryCutscene from './components/StoryCutscene';
import StoryIntro from './components/StoryIntro';
import useGameAudio from './hooks/useGameAudio';
import MagicCursor from './components/MagicCursor';
import GroundEnergy from './components/GroundEnergy';
import './App.css';
import './classroom.css';

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface DisplayChoice extends Choice {
  displayLetter: string;
  colorClass: string;
}

interface Question {
  id: number;
  question: string;
  choices: Choice[];
  storyCutscene: {
    title: string;
    description: string;
    image: string;
    highlights?: string[];
    quote?: string;
  };
}

const GAME_DATA: Question[] = [
  {
    id: 1,
    question: "เมื่อพ่อแม่ประสบอุบัติเหตุจนตาบอด สุวรรณสามทำอย่างไร?",
    choices: [
      { id: "1a", text: "ดูแลพ่อแม่ด้วยความรักและความกตัญญู", isCorrect: true },
      { id: "1b", text: "ทิ้งพ่อแม่ไว้ในป่าแล้วหนีไป", isCorrect: false },
      { id: "1c", text: "ขอให้คนป่ามาช่วยดูแลแทน", isCorrect: false },
    ],
    storyCutscene: {
      title: "การดูแลด้วยความกตัญญู",
      description: "เมื่อบิดามารดาผู้เป็นฤๅษีประสบอุบัติเหตุจากพิษอสรพิษจนดวงตามืดบอด สุวรรณสามผู้เป็นลูกด้วยจิตอันเปี่ยมด้วยรักและความกตัญญูบริสุทธิ์ ได้คอยปรนนิบัติจัดหาอาหาร ตักน้ำ และสร้างอาศรมให้ออบอุ่นอยู่เสมอ",
      image: "/scene_1_parents.jpg",
      highlights: ["การปรนนิบัติด้วยรักอันบริสุทธิ์", "อาศรมกลางป่าเต็มไปด้วยความอบอุ่น"],
      quote: "ลูกจะคอยเป็นดวงตาและปรนนิบัติดูแลพ่อแม่ตลอดไป..."
    }
  },
  {
    id: 2,
    question: "กิจวัตรประจำวันของสุวรรณสามคืออะไร?",
    choices: [
      { id: "2a", text: "ออกไปหาผลไม้และตักน้ำมาให้พ่อแม่ทุกวัน", isCorrect: true },
      { id: "2b", text: "ออกไปล่าสัตว์ป่ามาทำอาหาร", isCorrect: false },
      { id: "2c", text: "นอนพักผ่อนและให้พ่อแม่หาอาหาร", isCorrect: false },
    ],
    storyCutscene: {
      title: "มิตรภาพและจิตอันเป็นเมตตาธรรม",
      description: "ด้วยจิตใจอันเปี่ยมด้วยความเมตตาปรานีต่อสรรพสัตว์ เมื่อสุวรรณสามเดินไปตักน้ำ ณ ลำธารมิรเมธา ฝูงกวางป่า นกน้อย และเหล่าสัตว์ป่าทั้งหลายต่างนำทางและเดินตามด้วยความไว้วางใจ ไร้ความเกรงกลัว",
      image: "/scene_2_water_deer.jpg",
      highlights: ["ฝูงกวางป่านำทางด้วยความไว้ใจ", "น้ำจากลำธารมิรเมธาบริสุทธิ์"],
      quote: "จิตที่เปี่ยมด้วยเมตตาบริสุทธิ์ ย่อมนำมาซึ่งมิตรภาพจากทุกมวลชีวิต..."
    }
  },
  {
    id: 3,
    question: "เกิดอะไรขึ้นเมื่อพระราชาเสด็จล่าสัตว์ในป่า?",
    choices: [
      { id: "3a", text: "เข้าใจผิดคิดว่าสุวรรณสามเป็นสัตว์ป่าจึงยิงธนูใส่", isCorrect: true },
      { id: "3b", text: "พระราชาหลงป่าและมาขอความช่วยเหลือ", isCorrect: false },
      { id: "3c", text: "พระราชามอบรางวัลให้สุวรรณสามที่ดูแลป่า", isCorrect: false },
    ],
    storyCutscene: {
      title: "เหตุการณ์ไม่คาดฝัน ณ ลำธาร",
      description: "พระราชาปิลยักขราชแห่งเมืองพาราณสี เสด็จมาล่าสัตว์ในป่า เมื่อทรงเห็นกวางป่าห้อมล้อมชายหนุ่ม จึงทรงเข้าใจผิดคิดว่าเป็นสัตว์ป่าลึกลับ และทรงยิงธนูพิษใส่สุวรรณสามโดยไม่ได้ตั้งใจ...",
      image: "/scene_3_arrow.jpg",
      highlights: ["ศรพิษอันไม่คาดฝัน", "ความเข้าใจผิดกลางป่าใหญ่"],
      quote: "ข้าแต่ท่าน... ข้าพเจ้ามิได้ทำร้ายใคร เหตุใดท่านจึงยิงธนูใส่ข้าพเจ้า?"
    }
  },
  {
    id: 4,
    question: "เมื่อพระราชารู้ความจริงว่าสุวรรณสามเป็นคนกตัญญู พระราชารู้สึกอย่างไร?",
    choices: [
      { id: "4a", text: "เสียใจมากที่ยิงชายหนุ่มผู้กตัญญู", isCorrect: true },
      { id: "4b", text: "โกรธที่สุวรรณสามมาขวางทางล่าสัตว์", isCorrect: false },
      { id: "4c", text: "ดีใจที่ล่าสัตว์ได้สำเร็จ", isCorrect: false },
    ],
    storyCutscene: {
      title: "ความสำนึกผิดของพระราชา",
      description: "เมื่อพระราชาทราบว่าชายหนุ่มที่ทรงยิงธนูใส่คือผู้กตัญญูที่คอยดูแลพ่อแม่ตาบอด พระราชารู้สึกเสียใจและกราบขอโทษ ทรุดลงอธิษฐาน และทรงตั้งสัจจะวาจาว่าจะนำน้ำไปให้พ่อแม่และจะคอยดูแลแทนสุวรรณสาม",
      image: "/scene_4_king_remorse.jpg",
      highlights: ["น้ำตาแห่งความสำนึกผิด", "คำตั้งสัตย์สัญญาดูแลบิดามารดา"],
      quote: "เราเสียใจยิ่งนัก... สุวรรณสามเอ๋ย เราขอตั้งสัจจะดูแลบิดามารดาของท่านแทนเอง!"
    }
  },
  {
    id: 5,
    question: "ปาฏิหาริย์ที่เกิดขึ้นจาก 'พลังแห่งความกตัญญู' คืออะไร?",
    choices: [
      { id: "5a", text: "สุวรรณสามฟื้นคืนสติ และพ่อแม่กลับมามองเห็น", isCorrect: true },
      { id: "5b", text: "สุวรรณสามกลายเป็นเทวดาบนสวรรค์", isCorrect: false },
      { id: "5c", text: "พระราชามอบสมบัติให้มากมาย", isCorrect: false },
    ],
    storyCutscene: {
      title: "ปาฏิหาริย์แห่งสัจจะกิริยา!",
      description: "ด้วยอานุภาพแห่งคำตั้งสัจจะกิริยาของบิดามารดาและนางมณีเมขลา เทวทูตผู้คุ้มครอง อานุภาพความกตัญญูอันบริสุทธิ์ส่งผลให้พิษร้ายสลายไป สุวรรณสามฟื้นคืนชีพ และดวงตาของพ่อแม่กลับมามองเห็นสว่างไสวอีกครั้ง!",
      image: "/scene_5_miracle.jpg",
      highlights: ["พิษร้ายสลายด้วยสัจจะกิริยา", "ดวงตาพ่อแม่กลับมามองเห็นสว่างไสว"],
      quote: "ด้วยอำนาจแห่งความกตัญญูและสัจจะกิริยา ขอให้พิษร้ายจงสลายไป สุวรรณสามจงฟื้นคืนชีพ!"
    }
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

type GameState = 'intro' | 'start' | 'playing' | 'win' | 'gameover';
type FadeState = 'visible' | 'fading-out' | 'fading-in';

const CHOICE_COLORS = ['choice-red', 'choice-blue', 'choice-yellow'];
const CHOICE_LETTERS = ['ก', 'ข', 'ค'];

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [currentChoices, setCurrentChoices] = useState<DisplayChoice[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showCutscene, setShowCutscene] = useState(false);
  
  const [fadeState, setFadeState] = useState<FadeState>('visible');
  const audio = useGameAudio();

  const handleStartClicked = () => {
    try {
      if (audio && audio.playHover) audio.playHover();
    } catch {}
    startGame();
  };

  const startGame = () => {
    setGameState('playing');
    setFadeState('visible');
    setCurrentQIndex(0);
    setLives(3);
    loadQuestion(0);
  };

  const loadQuestion = (index: number) => {
    const shuffled = shuffleArray(GAME_DATA[index].choices).map((choice, i) => ({
      ...choice,
      displayLetter: CHOICE_LETTERS[i],
      colorClass: CHOICE_COLORS[i]
    }));
    
    setCurrentChoices(shuffled);
    setSelectedChoiceId(null);
    setWrongAttempt(null);
    setShowCutscene(false);
  };

  const handleChoiceClick = useCallback((choice: DisplayChoice) => {
    if (selectedChoiceId || showCutscene) return;
    
    setSelectedChoiceId(choice.id);

    if (choice.isCorrect) {
      // Correct choice
      try {
        if (audio && audio.playCorrect) audio.playCorrect();
      } catch {}
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#32CD32', '#00E5FF']
      });

      // Show Story Cutscene
      setTimeout(() => {
        setShowCutscene(true);
      }, 600);

    } else {
      // Wrong choice
      setWrongAttempt(choice.id);
      const newLives = lives - 1;
      setLives(newLives);
      
      try {
        if (audio && audio.playWrong) audio.playWrong();
      } catch {}

      if (newLives <= 0) {
        setTimeout(() => setGameState('gameover'), 1000);
      } else {
        setTimeout(() => {
          setWrongAttempt(null);
          setSelectedChoiceId(null);
        }, 1000);
      }
    }
  }, [selectedChoiceId, showCutscene, lives, audio]);

  const handleNextFromCutscene = () => {
    setShowCutscene(false);
    setFadeState('fading-out');
    
    setTimeout(() => {
      if (currentQIndex + 1 < GAME_DATA.length) {
        setCurrentQIndex(prev => prev + 1);
        loadQuestion(currentQIndex + 1);
        setFadeState('fading-in');
        
        setTimeout(() => {
          setFadeState('visible');
        }, 50);
      } else {
        setFadeState('visible');
        triggerWin();
      }
    }, 400);
  };

  const triggerWin = () => {
    try {
      if (audio && audio.playWin) audio.playWin();
    } catch {}
    
    confetti({
      particleCount: 400,
      spread: 160,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FF8C00', '#FF69B4', '#00BFFF', '#32CD32']
    });
    setGameState('win');
  };

  const currentQuestion = GAME_DATA[currentQIndex];

  return (
    <div className="game-wrapper">
      <MagicCursor />
      <GroundEnergy />

      {/* CINEMATIC STORY INTRO — shown first before start screen */}
      {gameState === 'intro' && (
        <StoryIntro
          onComplete={() => setGameState('start')}
          title="สุวรรณสามชาดก"
        />
      )}

      {/* CLEAN ESSENTIAL STATS HUD */}
      {gameState === 'playing' && (
        <>
          <header className="hud">
            <div className="hud-left"></div>

            <div className="hud-center">
              <div className="hud-title">
                บทที่ {currentQIndex + 1} / {GAME_DATA.length}
              </div>
            </div>

            <div className="hud-right">
              <div className="hud-stat lives-board">
                {[...Array(3)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`heart-icon ${i >= lives ? 'lost-heart' : 'active-heart'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </header>
          {/* PROGRESS TRACK */}
          <div className="hud-progress-bar-wrapper">
            <div 
              className="hud-progress-bar-fill"
              style={{ width: `${((currentQIndex) / GAME_DATA.length) * 100}%` }}
            />
          </div>
        </>
      )}

      {/* START SCREEN — GRAND CINEMATIC */}
      {gameState === 'start' && (
        <div className="screen-container start-screen">

          {/* ── DECORATIVE TOP ORNAMENT ── */}
          <div className="start-ornament-top">
            <span className="orn-line" />
            <span className="orn-diamond">✦</span>
            <span className="orn-lotus">🪷</span>
            <span className="orn-diamond">✦</span>
            <span className="orn-line" />
          </div>

          {/* ── MAIN TITLE SHRINE ── */}
          <div className="logo-container">
            <span className="logo-corner tl">❧</span>
            <span className="logo-corner tr">❧</span>
            <span className="logo-corner bl">❧</span>
            <span className="logo-corner br">❧</span>

            <div className="start-episode-tag">
              ชาดกเรื่องที่ ๑๖ แห่งทศชาติ
            </div>

            <h1 className="game-title">สุวรรณสามชาดก</h1>
            <div className="title-divider">
              <span className="divider-gem">◆</span>
              <span className="divider-line" />
              <span className="divider-gem">◆</span>
            </div>
            <h2 className="game-subtitle">ตอน: พลังแห่งความกตัญญู</h2>
          </div>

          {/* ── VIRTUE BADGES ROW ── */}
          <div className="start-virtue-row">
            <div className="start-virtue-badge">กตัญญูกตเวที</div>
            <div className="start-virtue-badge">เมตตาธรรม</div>
            <div className="start-virtue-badge">สัจจะวาจา</div>
          </div>

          {/* ── INSTRUCTION CARD ── */}
          <div className="instructions-card">
            <div className="instructions-icon">👨‍👩‍👧‍👦</div>
            <div className="instructions-text">
              <strong>ครูและเด็กๆ ช่วยกันคิดและเลือกคำตอบ!</strong>
              <span>คลิกที่การ์ดคำตอบที่ถูกต้องด้วยกัน เพื่อเรียนรู้เรื่องราวปาฏิหาริย์แห่งความกตัญญู</span>
            </div>
          </div>

          {/* ── START BUTTON ── */}
          <button className="btn-grand-start pulse-anim" onClick={handleStartClicked}>
            <Play fill="currentColor" size={28} />
            <span>เริ่มเรียนรู้เรื่องราว</span>
          </button>

          {/* ── DECORATIVE BOTTOM ORNAMENT ── */}
          <div className="start-ornament-bottom">
            <span className="orn-line" />
            <span className="orn-diamond">✦</span>
            <span className="orn-line" />
          </div>

        </div>
      )}

      {/* PLAYING SCREEN - PERFECT 100VH MOUSE-ONLY CHOICES */}
      {gameState === 'playing' && (
        <div className={`gameplay-area transition-layer ${fadeState}`}>
          
          <div className="board-and-dropzone-wrapper">
            <div className="question-board">
              <h3>คำถามประจำบท:</h3>
              <p>{currentQuestion.question}</p>
            </div>
          </div>

          <div className="choices-pool click-choices-mode">
            {currentChoices.map((choice: DisplayChoice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isWrong = wrongAttempt === choice.id;
              
              let cardStateClass = '';
              if (isSelected && choice.isCorrect) cardStateClass = 'choice-correct-selected';
              if (isWrong) cardStateClass = 'wrong-shake';

              return (
                <button
                  key={choice.id}
                  className={`card choice-interactive-btn ${choice.colorClass} ${cardStateClass}`}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={selectedChoiceId !== null}
                >
                  <div className="card-trim-corner top-left"></div>
                  <div className="card-trim-corner top-right"></div>
                  <div className="card-trim-corner bottom-left"></div>
                  <div className="card-trim-corner bottom-right"></div>
                  <div className="choice-card-content">
                    <div className="single-choice-badge">{choice.displayLetter}</div>
                    <span className="choice-text">{choice.text}</span>
                    {isSelected && choice.isCorrect && (
                      <CheckCircle color="#32CD32" size={32} className="status-icon-badge" />
                    )}
                    {isWrong && (
                      <XCircle color="#FF5252" size={32} className="status-icon-badge" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* CINEMATIC STORY CUTSCENE OVERLAY */}
      {showCutscene && (
        <StoryCutscene
          title={currentQuestion.storyCutscene.title}
          description={currentQuestion.storyCutscene.description}
          image={currentQuestion.storyCutscene.image}
          highlights={currentQuestion.storyCutscene.highlights}
          quote={currentQuestion.storyCutscene.quote}
          onNext={handleNextFromCutscene}
        />
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <div className="result-modal-overlay">
          <div className="screen-container gameover-screen bounce-in">
            <div className="result-icon-badge gameover-badge">💔</div>
            <h2>พลังชีวิตหมดลงแล้ว</h2>
            <p>ไม่เป็นไรนะเด็กๆ! ความพยายามคือจุดเริ่มต้นของความสำเร็จ มาเริ่มเรียนรู้เรื่องราวอีกครั้งกันนะ!</p>
            <button className="btn-primary" onClick={() => {
              if (audio && audio.playHover) audio.playHover();
              setGameState('start');
            }}>
              <RefreshCcw size={28} /> เริ่มเล่นใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* GRAND ROYAL VICTORY SHRINE WIN SCREEN */}
      {gameState === 'win' && (
        <div className="result-modal-overlay grand-win-overlay">
          <div className="grand-win-shrine bounce-in">
            
            {/* ROYAL BACKDROP SUNBURST & FLOATING PARTICLES */}
            <div className="royal-sunburst-rays"></div>
            <div className="floating-starlight-particles">
              <span className="star-p p1">✨</span>
              <span className="star-p p2">🌟</span>
              <span className="star-p p3">⭐</span>
              <span className="star-p p4">✨</span>
            </div>

            {/* SACRED CROWN & HEADER */}
            <div className="shrine-header">
              <div className="crown-aura-wrapper">
                <div className="crown-glow-ring"></div>
                <Crown size={52} className="royal-crown-icon" color="#FFD700" fill="#F59E0B" />
              </div>
              <h1 className="shrine-main-title">ปาฏิหาริย์แห่งสัจจะกิริยา</h1>
              <p className="shrine-subtitle">สุวรรณสามฟื้นคืนชีพ ด้วยพลังความกตัญญูอันบริสุทธิ์ยิ่ง</p>
            </div>

            {/* 4 GRAND 3D GOLDEN MEDALLIONS OF VIRTUE */}
            <div className="medallions-section">
              <h3 className="medallions-section-title">✦ ๔ ตราอัครคุณธรรมอันสูงส่ง ✦</h3>
              
              <div className="medallions-grid">
                <div className="medallion-card med-gold">
                  <div className="medallion-seal">
                    <Heart size={30} color="#78350F" fill="#F59E0B" />
                  </div>
                  <h4>กตัญญูกตเวที</h4>
                  <p>ปรนนิบัติบิดามารดา ด้วยหัวใจอันบริสุทธิ์</p>
                </div>

                <div className="medallion-card med-emerald">
                  <div className="medallion-seal">
                    <Sun size={30} color="#064E3B" fill="#10B981" />
                  </div>
                  <h4>เมตตาธรรม</h4>
                  <p>เปี่ยมด้วยความรักมุ่งหวังให้ มวลชีวิตเป็นสุข</p>
                </div>

                <div className="medallion-card med-ruby">
                  <div className="medallion-seal">
                    <ShieldCheck size={30} color="#7F1D1D" fill="#EF4444" />
                  </div>
                  <h4>สัจจะวาจา</h4>
                  <p>ตั้งมั่นในความจริง ข้ามพ้นอุปสรรคทั้งปวง</p>
                </div>

                <div className="medallion-card med-sapphire">
                  <div className="medallion-seal">
                    <Award size={30} color="#1E3A8A" fill="#3B82F6" />
                  </div>
                  <h4>ขันติธรรม</h4>
                  <p>อดทนเข้มแข็ง เผชิญความทุกข์ด้วยใจสงบ</p>
                </div>
              </div>
            </div>

            {/* GRAND GOLD REPLAY BUTTON */}
            <div className="shrine-action-area">
              <button 
                className="btn-grand-replay pulse-anim"
                onClick={() => {
                  if (audio && audio.playHover) audio.playHover();
                  setGameState('start');
                }}
              >
                <RefreshCcw size={28} />
                <span>เล่นใหม่อีกครั้ง</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
