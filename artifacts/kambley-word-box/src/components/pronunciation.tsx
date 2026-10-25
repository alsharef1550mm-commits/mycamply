import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";

export function Pronunciation({
  word,
  example,
}: {
  word: string;
  example: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    setPlaying(false);
    setMessage("");
    return () => {
      if (active.current && supported) {
        active.current.onend = null;
        active.current.onerror = null;
        active.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [word, example, supported]);

  const speak = (text: string, rate: number) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (active.current) {
      active.current.onend = null;
      active.current.onerror = null;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    active.current = utterance;
    utterance.lang = "en-US";
    utterance.rate = rate;
    // Query at each tap: mobile voices may arrive after the initial render.
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => /^en[-_]US$/i.test(v.lang)) ??
      voices.find((v) => /^en([-_]|$)/i.test(v.lang));
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      active.current = null;
      setPlaying(false);
    };
    utterance.onerror = (event) => {
      active.current = null;
      setPlaying(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setMessage(
          "Audio could not play. Check your volume and English voice settings, then tap again.",
        );
      }
    };
    setMessage("");
    setPlaying(true);
    // Keep speak synchronous with the tap for mobile browser activation rules.
    try {
      synth.speak(utterance);
    } catch {
      active.current = null;
      setPlaying(false);
      setMessage(
        "Audio is unavailable in this browser. Try your phone's main browser.",
      );
    }
  };

  return (
    <div className="pronunciation" aria-label={`Pronunciation for ${word}`}>
      <div className="pronunciation-actions">
        <button
          type="button"
          className="button button-ghost"
          disabled={!supported}
          onClick={() => speak(word, 0.9)}
        >
          <Volume2 size={18} aria-hidden="true" /> Hear word
        </button>
        <button
          type="button"
          className="button button-ghost"
          disabled={!supported}
          onClick={() => speak(word, 0.65)}
        >
          <Volume2 size={18} aria-hidden="true" /> Hear slowly
        </button>
        <button
          type="button"
          className="button button-ghost"
          disabled={!supported}
          onClick={() => speak(example, 0.9)}
        >
          <Volume2 size={18} aria-hidden="true" /> Hear example
        </button>
        {playing && (
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              if (active.current) {
                active.current.onend = null;
                active.current.onerror = null;
              }
              active.current = null;
              window.speechSynthesis.cancel();
              setPlaying(false);
            }}
          >
            <Square size={16} aria-hidden="true" /> Stop
          </button>
        )}
      </div>
      <p className="pronunciation-note" role="status">
        {!supported
          ? "Audio pronunciation is not supported in this browser. Try Safari, Chrome, or Edge."
          : message ||
            (playing
              ? "Playing English pronunciation…"
              : "Tap to listen, then repeat aloud. Check your media volume if you cannot hear it.")}
      </p>
    </div>
  );
}
