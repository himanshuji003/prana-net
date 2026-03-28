import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Phone, PhoneOff, Volume2, AlertCircle } from "lucide-react";

export interface VoiceCallUIProps {
  isOpen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript?: string;
  currentSpeech?: string;
  error?: string | null;
  onClose: () => void;
}

export function VoiceCallUI({
  isOpen,
  isListening,
  isSpeaking,
  currentTranscript,
  currentSpeech,
  error,
  onClose,
}: VoiceCallUIProps) {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    if (currentTranscript) {
      setTranscript((prev) => [...prev, `You: ${currentTranscript}`]);
      setScrollKey((k) => k + 1);
    }
  }, [currentTranscript]);

  useEffect(() => {
    if (currentSpeech) {
      setTranscript((prev) => [...prev, `Agent: ${currentSpeech}`]);
      setScrollKey((k) => k + 1);
    }
  }, [currentSpeech]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-gradient-to-b from-forest-secondary to-forest-primary border border-border-forest-light rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header - Call Status */}
            <div className="bg-gradient-to-r from-accent-teal via-accent-gold to-health-green p-6 sm:p-8 text-center relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-forest-primary" />
                  </motion.div>
                  <h2 className="font-display text-lg sm:text-xl text-forest-primary font-bold">
                    Voice Assistant
                  </h2>
                </div>
                <p className="font-sans text-sm text-forest-primary/90">
                  {error ? "Error" : isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Status Indicator */}
              {error ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 bg-health-red/10 border border-health-red/30 rounded-lg p-4"
                >
                  <AlertCircle className="h-5 w-5 text-health-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-xs font-semibold text-health-red uppercase mb-1">Error</p>
                    <p className="font-sans text-sm text-health-red/90">{error}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`status-${isListening}-${isSpeaking}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-center gap-3 rounded-lg p-4 ${
                    isListening
                      ? "bg-accent-gold/10 border border-accent-gold/30"
                      : isSpeaking
                        ? "bg-accent-teal/10 border border-accent-teal/30"
                        : "bg-forest-elevated border border-border-forest-light"
                  }`}
                >
                  {isListening && (
                    <>
                      <Mic className="h-4 w-4 text-accent-gold animate-pulse" />
                      <span className="font-sans text-sm font-semibold text-accent-gold">
                        Listening to your voice...
                      </span>
                    </>
                  )}
                  {isSpeaking && !isListening && (
                    <>
                      <Volume2 className="h-4 w-4 text-accent-teal animate-pulse" />
                      <span className="font-sans text-sm font-semibold text-accent-teal">
                        Processing response...
                      </span>
                    </>
                  )}
                  {!isListening && !isSpeaking && !error && (
                    <p className="font-sans text-xs text-muted text-center">
                      {transcript.length === 0 ? "Waiting to start..." : "Conversation complete"}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Waveform Animation */}
              {(isListening || isSpeaking) && (
                <motion.div className="flex items-center justify-center gap-1 h-12 py-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full ${
                        isListening ? "bg-accent-gold" : "bg-accent-teal"
                      }`}
                      animate={
                        isListening
                          ? { height: ["12px", "32px", "12px"] }
                          : { height: ["12px", "28px", "12px"] }
                      }
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Transcript Display */}
              <div
                key={scrollKey}
                className="bg-forest-primary border border-border-forest-light rounded-lg p-4 h-40 sm:h-48 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-border-forest scrollbar-track-transparent"
              >
                {transcript.length === 0 && !isListening && !isSpeaking ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="font-sans text-xs text-muted text-center px-2">
                      Your conversation will appear here...
                    </p>
                  </div>
                ) : (
                  transcript.map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`font-sans text-xs sm:text-sm p-3 rounded-lg border ${
                        line.startsWith("You:")
                          ? "bg-accent-teal/15 border-accent-teal/30 text-lime ml-4 text-right"
                          : "bg-accent-gold/15 border-accent-gold/30 text-cream mr-4"
                      }`}
                    >
                      <p className="break-words">{line.replace(/^(You:|Agent:)\s*/, "")}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 sm:py-4 rounded-lg font-sans font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-health-red to-health-red/80 text-white hover:brightness-110 shadow-lg hover:shadow-xl active:shadow-md"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </motion.button>
            </div>

            {/* Footer */}
            <div className="bg-forest-card px-4 sm:px-6 py-3 border-t border-border-forest-light">
              <p className="font-data text-[10px] text-muted text-center">
                Speech powered by browser • Encrypted conversation
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
