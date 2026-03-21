'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const DEMO_RESPONSES: Record<string, { response: string; intent: string }> = {
  'default': { response: 'बस बोलो, सहायक सुन रहा है! Try saying something in Hindi.', intent: 'general' },
  'dawai': { response: '💊 आपकी दवाई का रिमाइंडर सेट कर दिया गया है — सुबह 8 बजे और शाम 8 बजे।', intent: 'medicine' },
  'bachao': { response: '🚨 SOS भेज दिया गया! आपके बेटे राहुल और पड़ोसी शर्मा जी को अलर्ट भेजा गया। मदद आ रही है!', intent: 'emergency' },
  'paisa': { response: '💸 ₹500 राहुल को भेज दिए गए हैं। UPI से पेमेंट सफल!', intent: 'payment' },
  'akela': { response: '🤗 मैं हूं ना आपके साथ! चलिए आज कोई अच्छी कहानी सुनते हैं। क्या आपको पंचतंत्र पसंद है?', intent: 'companion' },
};

function matchResponse(text: string): { response: string; intent: string } {
  const lower = text.toLowerCase();
  if (/dawa|dawai|medicine|tablet|goli|याद/i.test(lower)) return DEMO_RESPONSES.dawai;
  if (/bachao|help|emergency|madad|sos|ambulance/i.test(lower)) return DEMO_RESPONSES.bachao;
  if (/paisa|paise|rupee|money|bhej|send|pay|₹/i.test(lower)) return DEMO_RESPONSES.paisa;
  if (/akela|bored|lonely|udas|sad|kahani|story|baat/i.test(lower)) return DEMO_RESPONSES.akela;
  return { response: `सहायक: "${text}" — मैंने सुन लिया! मैं इस पर काम कर रहा हूँ।`, intent: 'general' };
}

export function VoiceDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResponse('Voice input is not supported in this browser. Try Chrome on desktop.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setTranscript('');
    setResponse('');

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        setIsListening(false);
        const match = matchResponse(text);
        setTimeout(() => setResponse(match.response), 500);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setResponse('कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।');
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, []);

  const SUGGESTIONS = [
    '"दवाई याद दिलाओ"',
    '"बचाओ, मदद चाहिए"',
    '"राहुल को 500 रुपये भेजो"',
    '"बात करो, अकेला लग रहा है"',
  ];

  return (
    <section
      ref={sectionRef}
      id="voice-demo"
      style={{
        padding: 'clamp(80px, 10vw, 160px) 24px',
        maxWidth: 800,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 48 }}
      >
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, background: 'rgba(255,158,44,0.1)', color: 'var(--sah-accent-1)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          Try It Live
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.2 }}>
          Speak to <span style={{ color: 'var(--sah-accent-1)' }}>सहायक</span>
        </h2>
        <p style={{ fontSize: 16, opacity: 0.6, marginTop: 12 }}>
          Click the mic and say something in Hindi. Try these:
        </p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
      >
        {SUGGESTIONS.map((s) => (
          <span key={s} style={{ padding: '6px 14px', borderRadius: 9999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, opacity: 0.7 }}>
            {s}
          </span>
        ))}
      </motion.div>

      {/* Mic button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        onClick={startListening}
        disabled={isListening}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: 'none',
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #f97316)'
            : 'linear-gradient(135deg, #ff9e2c, #f97316)',
          color: '#fff',
          fontSize: 40,
          cursor: isListening ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: isListening
            ? '0 0 40px rgba(239,68,68,0.4)'
            : '0 4px 30px rgba(255,158,44,0.3)',
          transition: 'box-shadow 0.3s',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
        }}
        aria-label={isListening ? 'Listening...' : 'Start voice input'}
      >
        {isListening ? '⏸' : '🎤'}
      </motion.button>

      {/* Transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>You said:</p>
            <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response */}
      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(255,158,44,0.06)',
              border: '1px solid rgba(255,158,44,0.15)',
            }}
          >
            <p style={{ fontSize: 12, opacity: 0.4, marginBottom: 8, color: 'var(--sah-accent-1)' }}>सहायक says:</p>
            <p style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 500 }}>{response}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSupported && (
        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.5, color: '#ef4444' }}>
          ⚠ Web Speech API not supported. Please use Chrome on desktop.
        </p>
      )}
    </section>
  );
}
