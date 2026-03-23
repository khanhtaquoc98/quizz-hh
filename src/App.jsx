import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { questionsData } from './data';

/* ============================================================
   UTILITIES
   ============================================================ */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/* ============================================================
   PARTICLE BACKGROUND
   ============================================================ */
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.7
          ? `rgba(220, 38, 38, ${this.opacity})`
          : `rgba(148, 163, 184, ${this.opacity * 0.5})`;
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
    }
    for (let i = 0; i < 60; i++) particles.push(new Particle());
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.05 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    }
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={canvasRef} className="particles-canvas" />;
}

/* ============================================================
   QUESTION SCREEN (fits 100vh)
   ============================================================ */
function QuestionScreen({ data, onSubmit, shuffledOptions }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="screen-wrapper">
      <div className="screen-content">
        <div className="question-header-mini">
          <div className="classified-badge">◈ TỐI MẬT ◈</div>
          <h2 className="app-title-mini">HỒ SƠ MẬT: BÍ ẨN PHENOL</h2>
        </div>
        <div className="question-box">
          <div className="question-title">{data.title}</div>
          <div className="question-text">{data.question}</div>

          {data.hasImage && (
            <div className="catechin-image-container">
              <img src={data.imageUrl} alt="Công thức cấu tạo" className="catechin-image" />
            </div>
          )}
          {data.questionSuffix && (
            <div className="question-text" style={{ marginTop: 5 }}>{data.questionSuffix}</div>
          )}

          <div className="options">
            {shuffledOptions.map((opt) => (
              <label
                key={opt.id}
                className={`option-label${opt.id === selected ? ' selected' : ''}`}
                onClick={() => setSelected(opt.id)}
              >
                <input
                  type="radio" className="option-radio" name={data.id}
                  value={opt.id} checked={selected === opt.id}
                  onChange={() => setSelected(opt.id)}
                />
                <span>{opt.letter}. {opt.text}</span>
              </label>
            ))}
          </div>

          <button
            className="btn"
            onClick={() => selected && onSubmit(selected)}
            disabled={!selected}
          >
            🔬 XÉT NGHIỆM BẰNG CHỨNG
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RESULT SCREEN (fits 100vh)
   ============================================================ */
function ResultScreen({ isCorrect, clue, onNext, nextLabel }) {
  return (
    <div className="screen-wrapper">
      <div className="screen-content screen-center">
        {isCorrect ? (
          <div className="result-card correct-card">
            <div className="result-icon">🔓</div>
            <h2 className="result-title">MANH MỐI ĐÃ ĐƯỢC MỞ KHÓA!</h2>
            <div className="result-clue">{clue}</div>
            <button className="btn" onClick={onNext}>
              📖 XEM GIẢI THÍCH KHOA HỌC
            </button>
          </div>
        ) : (
          <div className="result-card wrong-card">
            <div className="result-icon">🚫</div>
            <h2 className="result-title">BẰNG CHỨNG ĐÃ BỊ HỦY!</h2>
            <p className="result-desc">Manh mối bị mất vĩnh viễn. Tiếp tục điều tra...</p>
            <button className="btn btn-next visible" onClick={onNext}>
              {nextLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   EXPLANATION SCREEN (fits 100vh)
   ============================================================ */
function ExplanationScreen({ data, correctLetter, onNext, nextLabel }) {
  return (
    <div className="screen-wrapper">
      <div className="screen-content">
        <div className="explanation-box" style={{ margin: 0 }}>
          <div className="explanation-header">
            <span className="explanation-icon">🧪</span>
            GIẢI MÃ HỒ SƠ KHOA HỌC — {data.title}
          </div>
          {data.explanationImage && (
            <div className="explanation-image-container">
              <img src={data.explanationImage} alt="Giải thích" className="explanation-image" />
            </div>
          )}
          <div className="explanation-content" dangerouslySetInnerHTML={{ __html: data.explanation }} />
          <div className="explanation-correct-answer">
            ✅ Đáp án đúng: <strong>{correctLetter}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 15 }}>
          <button className="btn btn-next visible" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PASSWORD GATE SCREEN (fits 100vh)
   ============================================================ */
function PasswordGate({ title, hint, errorText, password, onSuccess, buttonText }) {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);
  const handleSubmit = () => {
    if (value.trim().toUpperCase() === password.toUpperCase()) {
      onSuccess();
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };
  return (
    <div className="screen-wrapper">
      <div className="screen-content screen-center">
        <div className="login-box">
          <h3>{title}</h3>
          {hint && <p className="hint-text" dangerouslySetInnerHTML={{ __html: hint }} />}
          <p className={`error-msg${showError ? ' visible' : ''}`}>{errorText}</p>
          <input
            type="text" className="input-field" placeholder="NHẬP MẬT MÃ..."
            value={value} onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <br />
          <button className="btn" onClick={handleSubmit}>{buttonText || 'XÁC NHẬN CHUYỂN KHU VỰC'}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  // screen: 'login' | 'part1' | 'part2' | 'final'
  const [screen, setScreen] = useState('intro');
  const [teamName, setTeamName] = useState('');
  const [showNameError, setShowNameError] = useState(false);

  // sub-phase for questions: 'question' | 'result' | 'explanation' | 'gate'
  const [phase, setPhase] = useState('question');

  const [p1Index, setP1Index] = useState(0);
  const [p1Results, setP1Results] = useState({});

  const [p2Index, setP2Index] = useState(0);
  const [p2Results, setP2Results] = useState({});

  const [clues, setClues] = useState([]);
  const [score, setScore] = useState(0);

  // Store last result for result/explanation screens
  const [lastResult, setLastResult] = useState(null);

  // Shuffled options - regenerate per question change
  const [shuffledP1, setShuffledP1] = useState({});
  const [shuffledP2, setShuffledP2] = useState({});

  const getShuffled = (part, index) => {
    const cache = part === 1 ? shuffledP1 : shuffledP2;
    if (cache[index]) return cache[index];
    const questions = part === 1 ? questionsData.part1 : questionsData.part2;
    const shuffled = shuffleArray(questions[index].options).map((opt, i) => ({
      ...opt,
      letter: LETTERS[i],
    }));
    if (part === 1) setShuffledP1((prev) => ({ ...prev, [index]: shuffled }));
    else setShuffledP2((prev) => ({ ...prev, [index]: shuffled }));
    return shuffled;
  };

  // Music refs
  const bgMusicRef = useRef(null);
  const dramaticMusicRef = useRef(null);

  useEffect(() => {
    bgMusicRef.current = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.4;
    dramaticMusicRef.current = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3');
    dramaticMusicRef.current.loop = true;
    dramaticMusicRef.current.volume = 0.4;
    return () => { bgMusicRef.current?.pause(); dramaticMusicRef.current?.pause(); };
  }, []);

  const stopAllMusic = useCallback(() => {
    if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; }
    if (dramaticMusicRef.current) { dramaticMusicRef.current.pause(); dramaticMusicRef.current.currentTime = 0; }
  }, []);
  const playBgMusic = useCallback(() => { stopAllMusic(); bgMusicRef.current?.play().catch(() => {}); }, [stopAllMusic]);
  const playDramaticMusic = useCallback(() => { stopAllMusic(); dramaticMusicRef.current?.play().catch(() => {}); }, [stopAllMusic]);

  useEffect(() => { if (phase === 'gate') stopAllMusic(); }, [phase, stopAllMusic]);

  /* ---------- Helpers ---------- */
  const currentPart = screen === 'part1' ? 1 : 2;
  const currentIndex = screen === 'part1' ? p1Index : p2Index;
  const currentQuestions = screen === 'part1' ? questionsData.part1 : questionsData.part2;
  const currentData = currentQuestions?.[currentIndex];

  const totalQuestions = questionsData.part1.length + questionsData.part2.length;
  const answeredCount = Object.keys(p1Results).length + Object.keys(p2Results).length;
  const progressPercent = screen === 'final' ? 100 : (answeredCount / totalQuestions) * 100;

  const isLastQuestion = currentIndex === (currentQuestions?.length ?? 1) - 1;

  const getNextLabel = () => {
    if (isLastQuestion) {
      return screen === 'part2' ? 'ĐI TỚI CỬA BẢO MẬT CHÍNH' : 'ĐI TỚI CỬA BẢO MẬT';
    }
    return 'CHUYỂN SANG HỒ SƠ TIẾP THEO';
  };

  /* ---------- Start game ---------- */
  const startGame = () => {
    if (!teamName.trim()) {
      setShowNameError(true);
      setTimeout(() => setShowNameError(false), 2000);
      return;
    }
    setScreen('part1');
    setPhase('question');
    playBgMusic();
  };

  /* ---------- Submit answer ---------- */
  const handleAnswerSubmit = (selectedId) => {
    const q = currentData;
    const isCorrect = selectedId === q.correctAnswerId;
    const result = { isCorrect, clue: isCorrect ? q.clue : null };

    if (currentPart === 1) setP1Results((prev) => ({ ...prev, [currentIndex]: result }));
    else setP2Results((prev) => ({ ...prev, [currentIndex]: result }));

    if (isCorrect) {
      setClues((prev) => [...prev, q.clue]);
      setScore((prev) => prev + 1);
    }
    setLastResult(result);
    setPhase('result');
  };

  /* ---------- Advance from result ---------- */
  const handleResultNext = () => {
    if (lastResult?.isCorrect) {
      setPhase('explanation'); // go to explanation screen
    } else {
      advanceToNext(); // skip explanation, go to next question
    }
  };

  /* ---------- Advance from explanation ---------- */
  const handleExplanationNext = () => {
    advanceToNext();
  };

  /* ---------- Advance to next question or gate ---------- */
  const advanceToNext = () => {
    if (isLastQuestion) {
      setPhase('gate');
    } else {
      if (currentPart === 1) setP1Index((prev) => prev + 1);
      else setP2Index((prev) => prev + 1);
      setPhase('question');
      setLastResult(null);
    }
  };

  /* ---------- Get correct letter for explanation ---------- */
  const getCorrectLetter = () => {
    if (!currentData) return '';
    const shuffled = getShuffled(currentPart, currentIndex);
    return shuffled.find((opt) => opt.id === currentData.correctAnswerId)?.letter || '';
  };

  /* ---------- Render ---------- */
  return (
    <>
      <ParticleBackground />
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />
      <div className="stamp-overlay">MẬT</div>

      <div className="app-container">

        {/* ====== INTRO ====== */}
        {screen === 'intro' && (
          <div className="screen-wrapper">
            <div className="screen-content screen-center">
              <header className="app-header">
                <div className="classified-badge">◈ TỐI MẬT ◈</div>
                <h1 className="app-title">HỒ SƠ MẬT: BÍ ẨN PHENOL</h1>
                <div className="detective-banner">
                  <img src="/detective_header.png" alt="Investigation" className="detective-banner-img" />
                </div>
                <div className="app-subtitle">
                  Các thám tử chú ý! Một nhân vật bí ẩn đang ẩn nấp ngay trong lớp học
                  của chúng ta. Để tìm ra nhân dạng, các nhóm phải giải mã hồ sơ tại các trạm.
                  <br /><br />
                  <span className="warning-text">
                    ⚠ CẢNH BÁO: Mỗi bằng chứng chỉ được xét nghiệm 1 lần. Trả lời sai, manh mối sẽ bị hủy vĩnh viễn!
                  </span>
                </div>
              </header>
              <button className="btn btn-start" onClick={() => setScreen('login')}>🕵️ BẮT ĐẦU ĐIỀU TRA</button>
            </div>
          </div>
        )}

        {/* ====== LOGIN ====== */}
        {screen === 'login' && (
          <div className="screen-wrapper">
            <div className="screen-content screen-center">
              <div className="login-box">
                <h3>🔐 ĐĂNG KÝ DANH TÍNH ĐỂ BẮT ĐẦU ĐIỀU TRA</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                  Nhập tên nhóm thám tử của bạn để truy cập hồ sơ mật
                </p>
                <p className={`error-msg${showNameError ? ' visible' : ''}`}>VUI LÒNG NHẬP TÊN NHÓM!</p>
                <input
                  type="text" className="input-field" placeholder="NHẬP TÊN NHÓM..."
                  value={teamName} onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startGame()}
                />
                <br />
                <button className="btn" onClick={startGame}>🔍 TIẾN HÀNH ĐIỀU TRA</button>
              </div>
            </div>
          </div>
        )}

        {/* ====== PART 1 & 2 ====== */}
        {(screen === 'part1' || screen === 'part2') && (
          <>
            {phase === 'question' && currentData && (
              <QuestionScreen
                data={currentData}
                shuffledOptions={getShuffled(currentPart, currentIndex)}
                onSubmit={handleAnswerSubmit}
              />
            )}

            {phase === 'result' && (
              <ResultScreen
                isCorrect={lastResult?.isCorrect}
                clue={lastResult?.clue}
                onNext={handleResultNext}
                nextLabel={isLastQuestion ? getNextLabel() : 'CHUYỂN HỒ SƠ TIẾP THEO'}
              />
            )}

            {phase === 'explanation' && currentData && (
              <ExplanationScreen
                data={currentData}
                correctLetter={getCorrectLetter()}
                onNext={handleExplanationNext}
                nextLabel={getNextLabel()}
              />
            )}

            {phase === 'gate' && screen === 'part1' && (
              <PasswordGate
                title="🔒 MẬT MÃ TRUY CẬP PHẦN 2 (LẤY DẤU VÂN TAY)"
                hint="Gợi ý: Tính chất đặc trưng của phenol khi so sánh với alcohol"
                errorText="MẬT MÃ KHÔNG CHÍNH XÁC!"
                password={questionsData.passwords.part1to2}
                onSuccess={() => { setScreen('part2'); setPhase('question'); setLastResult(null); playDramaticMusic(); }}
              />
            )}

            {phase === 'gate' && screen === 'part2' && (
              <PasswordGate
                title="🔒 LỆNH TỪ CHỈ HUY ĐỂ MỞ HỒ SƠ PHÁ ÁN"
                hint="Gợi ý: Tên gọi của hợp chất kết tủa khi cho phenol tác dụng với HNO₃ đặc/H₂SO₄ đặc"
                errorText="LỆNH TỪ CHỐI!"
                password={questionsData.passwords.part2toFinal}
                buttonText="KẾT ÁN"
                onSuccess={() => { setScreen('final'); setPhase('question'); playDramaticMusic(); }}
              />
            )}
          </>
        )}

        {/* ====== FINAL ====== */}
        {screen === 'final' && (
          <div className="screen-wrapper">
            <div className="screen-content screen-center">
              <h2 className="section-title" style={{ color: '#ff0000', borderColor: 'rgba(255,0,0,0.3)' }}>
                🚨 HỒ SƠ ĐÃ ĐÓNG: CHÂN TƯỚNG SỰ THẬT 🚨
              </h2>

              <div className="score-board">
                BÁO CÁO CỦA NHÓM: <span className="team-name">{teamName}</span>
                <br />
                THU THẬP ĐƯỢC: <span className="score-value">{score}/{totalQuestions}</span> MANH MỐI
              </div>

              <div className="final-clues">
                <p>🔍 Tổng hợp manh mối đã thu thập:</p>
                <ul>
                  {clues.length > 0 ? (
                    clues.map((clue, idx) => <li key={idx}>🔍 {clue}</li>)
                  ) : (
                    <li style={{ borderLeftColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                      Không có manh mối nào được thu thập!
                    </li>
                  )}
                </ul>
              </div>

              <div className="final-target">🎯 HUNG THỦ LÀ: BẠN [ĐIỀN TÊN HỌC SINH NỮ]</div>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button className="btn" onClick={() => window.location.reload()}>🔄 CHƠI LẠI TỪ ĐẦU</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
