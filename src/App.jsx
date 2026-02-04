import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Avatar from './components/Avatar';
import { speechText } from './speech';

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [voices, setVoices] = useState([]);
  const lastSpokenRef = useRef("");

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Always use French logic now as requested
    // Prioritize French
    let preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("fr")) ||
      voices.find(v => v.lang.startsWith("fr"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = 'fr-FR';
    }

    utterance.rate = 1;

    // Set speaking state immediately
    setIsSpeaking(true);

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsSpeaking(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak when speechText changes, but only after interaction
  useEffect(() => {
    if (hasInteracted && speechText !== lastSpokenRef.current) {
      lastSpokenRef.current = speechText;
      // Small delay to ensure voices are loaded if it's a fresh reload
      setTimeout(() => handleSpeak(speechText), 500);
    }
  }, [hasInteracted, speechText, voices]);

  const onInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Speak immediately on first interaction if there is text
      handleSpeak(speechText);
      lastSpokenRef.current = speechText;
    }
  };

  return (
    <div
      onClick={onInteract}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={['#101015']} />
        <group position={[0, -0.5, 0]}>
          <Avatar isSpeaking={isSpeaking} />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </group>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />
      </Canvas>

      {!hasInteracted && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          fontSize: '24px',
          zIndex: 10,
          cursor: 'pointer'
        }}>
          Cliquez n'importe où pour commencer
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSpeak(speechText);
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'white',
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 20px',
          borderRadius: '30px',
          zIndex: 20,
          pointerEvents: 'auto',
          border: '1px solid rgba(255,255,255,0.3)',
          fontSize: '14px',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.3s',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
        onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
        onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
      >
        ⟳ Recommencer
      </button>

      <a
        href="http://bs8oskcggc008gowk0008sc4.158.69.220.59.sslip.io"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'white',
          textDecoration: 'none',
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 20px',
          borderRadius: '30px',
          zIndex: 20,
          pointerEvents: 'auto',
          border: '1px solid rgba(255,255,255,0.3)',
          fontSize: '14px',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.3s',
          maxWidth: '40%',
          textAlign: 'center',
          lineHeight: '1.2'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
        onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
      >
        Visiter le site du Centre d'Affaires
      </a>
    </div>
  );
}

export default App;
