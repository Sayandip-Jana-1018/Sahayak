'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Check, AlertCircle } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';

const SENTENCES: Record<string, { sentences: string[]; translations: string[] }> = {
  hi: {
    sentences: [
      'मेरा नाम {name} है और मैं सहायक उपयोग करता हूँ',
      'दवाई याद दिलाओ कल सुबह आठ बजे',
      'बेटे को फोन लगाओ',
    ],
    translations: [
      'My name is {name} and I use Sahayak',
      'Remind me about medicine tomorrow morning at eight',
      'Call my son',
    ],
  },
  ta: {
    sentences: [
      'என் பெயர் {name} மற்றும் நான் சஹாயக் பயன்படுத்துகிறேன்',
      'நாளை காலை எட்டு மணிக்கு மருந்து நினைவூட்டல் அமை',
      'மகனை அழை',
    ],
    translations: [
      'My name is {name} and I use Sahayak',
      'Set medicine reminder for tomorrow morning at eight',
      'Call my son',
    ],
  },
  bn: {
    sentences: [
      'আমার নাম {name} এবং আমি সহায়ক ব্যবহার করি',
      'কাল সকাল আটটায় ওষুধের কথা মনে করিয়ো',
      'ছেলেকে ফোন করো',
    ],
    translations: [
      'My name is {name} and I use Sahayak',
      'Remind about medicine tomorrow at eight',
      'Call my son',
    ],
  },
  en: {
    sentences: [
      'My name is {name} and I use Sahayak',
      'Remind me to take medicine tomorrow at eight AM',
      'Call my son',
    ],
    translations: [
      'My name is {name} and I use Sahayak',
      'Remind me to take medicine tomorrow at eight AM',
      'Call my son',
    ],
  },
};

// Default fallback for languages not yet listed
const getPrompts = (lang: string, name: string) => {
  const data = SENTENCES[lang] || SENTENCES['hi'];
  return {
    sentences: data.sentences.map((s) => s.replace('{name}', name)),
    translations: data.translations.map((s) => s.replace('{name}', name)),
  };
};

export function Step3VoiceProfile() {
  const { formData, updateFormData, nextStep } = useOnboardingStore();
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { sentences, translations } = getPrompts(formData.primaryLanguage, formData.elderlyName);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 40;
      const barWidth = canvas.width / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const barHeight = (value / 255) * canvas.height * 0.85;
        const x = i * barWidth + barWidth * 0.15;
        const y = canvas.height - barHeight;

        ctx.fillStyle = '#FF6B2C';
        ctx.globalAlpha = 0.6 + (value / 255) * 0.4;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth * 0.7, barHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    draw();
  }, []);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        audioContext.close();

        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Mark as completed (in production: upload to backend)
        const newCompleted = [...completed];
        newCompleted[currentSentence] = true;
        setCompleted(newCompleted);

        if (currentSentence < 2) {
          setCurrentSentence(currentSentence + 1);
        }
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      drawWaveform();

      // Auto-stop after 4 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 4000);
    } catch (err) {
      setError('Microphone access denied. Please allow access and try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const allDone = completed.every(Boolean);

  useEffect(() => {
    if (allDone) {
      updateFormData({ voiceProfileComplete: true });
    }
  }, [allDone, updateFormData]);

  return (
    <div className="step3">
      <h2 className="step3__title">Voice Profile Setup</h2>
      <p className="step3__subtitle">
        Read 3 sentences aloud to help Sahayak recognize {formData.userType === 'self' ? 'your' : "their"} voice
      </p>

      {/* Info Notice */}
      <div className="step3__info-box">
        <div className="step3__info-icon">💡</div>
        <div className="step3__info-text">
          <strong>Why is this needed?</strong><br/>
          Recording your voice helps Sahayak recognize you securely and ignore background noise like the TV or other people talking. If you skip this, voice features will still work, but may be slightly less accurate.
        </div>
      </div>

      {/* Progress */}
      <div className="step3__progress">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`step3__progress-item ${completed[i] ? 'step3__progress-item--done' : currentSentence === i ? 'step3__progress-item--active' : ''}`}>
            {completed[i] ? <Check size={14} /> : `${i + 1}`}
            <span>Sentence {i + 1}</span>
          </div>
        ))}
      </div>

      {/* Current sentence */}
      {!allDone && (
        <div className="step3__card">
          <p className="step3__sentence">{sentences[currentSentence]}</p>
          <p className="step3__translation">{translations[currentSentence]}</p>

          {/* Mic button */}
          <div className="step3__mic-area">
            <button
              className={`step3__mic-btn ${isRecording ? 'step3__mic-btn--recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <div className="step3__mic-dot" />
              ) : completed[currentSentence] ? (
                <Check size={32} />
              ) : (
                <Mic size={32} />
              )}
            </button>
            {!isRecording && !completed[currentSentence] && (
              <p className="step3__mic-hint">Tap to record</p>
            )}
            {isRecording && <p className="step3__mic-hint step3__mic-hint--recording">Listening...</p>}
          </div>

          {/* Waveform */}
          <canvas
            ref={canvasRef}
            width={320}
            height={60}
            className="step3__waveform"
            style={{ opacity: isRecording ? 1 : 0.2 }}
          />

          {error && (
            <div className="step3__error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      )}

      {allDone && (
        <div className="step3__success">
          <div className="step3__success-icon">
            <Check size={32} />
          </div>
          <p>Voice profile recorded successfully!</p>
        </div>
      )}

      {/* Skip link */}
      {!allDone && (
        <button
          className="step3__skip"
          onClick={() => {
            updateFormData({ voiceProfileComplete: false });
            nextStep();
          }}
        >
          Skip for now (Set up later in settings)
        </button>
      )}

      <style jsx>{`
        .step3 {
          text-align: center;
        }

        .step3__title {
          font-family: var(--font-display);
          font-size: 32px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .step3__subtitle {
          color: var(--text-secondary);
          font-size: 15px;
          margin-bottom: 24px;
        }

        .step3__info-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-radius: 16px;
          background: rgba(45, 106, 79, 0.08);
          border: 1px solid rgba(45, 106, 79, 0.2);
          text-align: center;
          max-width: 580px;
          margin: 0 auto 32px;
        }

        :global(.light) .step3__info-box,
        :global([data-theme="light"]) .step3__info-box {
          background: rgba(45, 106, 79, 0.05);
        }

        .step3__info-icon {
          font-size: 24px;
        }

        .step3__info-text {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .step3__info-text strong {
          color: #2D6A4F;
          font-size: 14px;
        }

        .step3__progress {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .step3__progress-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
          padding: 6px 14px;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
        }

        .step3__progress-item--active {
          border-color: #FF6B2C;
          color: #FF6B2C;
          background: rgba(255, 107, 44, 0.05);
        }

        .step3__progress-item--done {
          background: rgba(45, 106, 79, 0.1);
          border-color: #2D6A4F;
          color: #2D6A4F;
        }

        .step3__card {
          padding: 32px 24px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          max-width: 580px;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.light) .step3__card,
        :global([data-theme="light"]) .step3__card {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(27, 42, 74, 0.08);
          box-shadow: 0 12px 40px rgba(27, 42, 74, 0.05);
        }

        .step3__sentence {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 6px;
          width: 100%;
        }

        .step3__translation {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 20px;
          font-style: italic;
        }

        .step3__mic-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .step3__mic-btn {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        :global(.light) .step3__mic-btn,
        :global([data-theme="light"]) .step3__mic-btn {
          border-color: rgba(27,42,74,0.15);
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(27,42,74,0.06);
        }

        .step3__mic-btn:hover {
          border-color: #FF6B2C;
          background: rgba(255, 107, 44, 0.05);
          box-shadow: 0 12px 40px rgba(255, 107, 44, 0.2);
          transform: scale(1.05);
        }

        .step3__mic-btn--recording {
          background: rgba(230, 57, 70, 0.15) !important;
          border-color: #E63946 !important;
          animation: mic-pulse 1.5s infinite;
        }

        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.3); }
          50% { box-shadow: 0 0 0 16px rgba(230, 57, 70, 0); }
        }

        .step3__mic-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #E63946;
          animation: dot-pulse 0.8s infinite;
        }

        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .step3__mic-hint {
          font-size: 13px;
          color: var(--text-muted);
        }

        .step3__mic-hint--recording {
          color: #E63946;
          font-weight: 500;
        }

        .step3__waveform {
          display: block;
          margin: 0 auto;
          transition: opacity 0.3s;
        }

        .step3__error {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          color: #E63946;
          font-size: 13px;
          margin-top: 12px;
        }

        .step3__success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px;
        }

        .step3__success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(45, 106, 79, 0.15);
          color: #2D6A4F;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step3__success p {
          font-size: 16px;
          color: #2D6A4F;
          font-weight: 500;
        }

        .step3__skip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-body);
          margin-top: 8px;
          padding: 8px 20px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        :global(.light) .step3__skip,
        :global([data-theme="light"]) .step3__skip {
          background: rgba(27,42,74,0.04);
          border-color: rgba(27,42,74,0.1);
        }

        .step3__skip:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.08);
        }

        :global(.light) .step3__skip:hover,
        :global([data-theme="light"]) .step3__skip:hover {
          background: rgba(27,42,74,0.08);
        }
      `}</style>
    </div>
  );
}
