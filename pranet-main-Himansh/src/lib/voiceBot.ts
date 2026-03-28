/**
 * Voice AI Assistant (Call Bot)
 * Browser-based voice system for filing complaints and checking status
 * Uses Web Speech API (free, no Twilio needed)
 */

export interface VoiceBotCallbacks {
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onSpeaking?: (text: string) => void;
  onError?: (error: string) => void;
  onComplaintFiled?: (issueId: string, title: string) => void;
  onStatusChecked?: (issueId: string, status: string) => void;
  onTranscript?: (text: string) => void;
}

export interface VoiceBotConfig {
  lang?: string;
  callbacks?: VoiceBotCallbacks;
  userId?: string;
}

class VoiceBot {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private callbacks: VoiceBotCallbacks;
  private isListening = false;
  private config: VoiceBotConfig;
  private currentState: "idle" | "listening" | "processing" | "speaking" = "idle";

  constructor(config: VoiceBotConfig = {}) {
    this.config = { lang: "en-IN", ...config };
    this.callbacks = config.callbacks || {};
    this.synthesis = window.speechSynthesis;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Speech Recognition not supported in this browser");

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.lang;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.setupRecognitionListeners();
  }

  private setupRecognitionListeners() {
    this.recognition.onstart = () => {
      this.currentState = "listening";
      this.callbacks.onListeningStart?.();
    };
    this.recognition.onend = () => {
      this.currentState = "idle";
      this.callbacks.onListeningEnd?.();
    };
    this.recognition.onerror = (event: any) => {
      const error = `Speech recognition error: ${event.error}`;
      this.callbacks.onError?.(error);
    };
  }

  updateConfig(config: VoiceBotConfig) {
    this.config = { ...this.config, ...config };
    this.callbacks = config.callbacks || this.callbacks;
    this.recognition.lang = this.config.lang;
  }

  /** Text-to-Speech */
  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.synthesis.cancel();
      this.currentState = "speaking";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.lang || "en-IN";
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onend = () => { this.currentState = "idle"; resolve(); };
      utterance.onerror = () => { this.currentState = "idle"; resolve(); };
      this.callbacks.onSpeaking?.(text);
      this.synthesis.speak(utterance);
    });
  }

  stopListening() {
    if (this.isListening) { this.recognition.stop(); this.isListening = false; }
  }

  cancelSpeech() {
    this.synthesis.cancel();
    this.currentState = "idle";
  }

  /** Listen for a single voice input */
  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.isListening = true;
      let finalTranscript = "";
      const prev = {
        onresult: this.recognition.onresult,
        onend: this.recognition.onend,
        onerror: this.recognition.onerror,
      };
      const cleanup = () => {
        this.recognition.onresult = prev.onresult;
        this.recognition.onend = prev.onend;
        this.recognition.onerror = prev.onerror;
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        }
      };
      this.recognition.onend = () => {
        this.currentState = "idle";
        this.isListening = false;
        this.callbacks.onListeningEnd?.();
        const text = finalTranscript.trim().toLowerCase();
        cleanup();
        if (!text) { reject(new Error("No speech detected. Please try again.")); return; }
        this.callbacks.onTranscript?.(text);
        resolve(text);
      };
      this.recognition.onerror = (event: any) => {
        this.currentState = "idle";
        this.isListening = false;
        this.callbacks.onError?.(`Speech error: ${event.error}`);
        cleanup();
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      try { this.recognition.start(); } catch (err) { cleanup(); reject(err); }
    });
  }

  /** Extract complaint category from text */
  private extractCategory(text: string): string {
    const map: Record<string, string> = {
      garbage: "Garbage Dumping",
      waste: "Waste Burning",
      water: "Water Pollution",
      smoke: "Industrial Smoke",
      dust: "Construction Dust",
      pollution: "General Pollution",
      air: "Air Pollution",
      noise: "Noise Pollution",
      road: "Road Damage",
      pothole: "Pothole",
      construction: "Construction Dust",
      fire: "Waste Burning",
      dump: "Garbage Dumping",
      smell: "General Pollution",
      foul: "General Pollution",
      contamination: "Water Pollution",
      flood: "Waterlogging",
      waterlog: "Waterlogging",
      drain: "Drainage Issue",
      sewer: "Sewage Overflow",
    };
    for (const [keyword, category] of Object.entries(map)) {
      if (text.includes(keyword)) return category;
    }
    return "General Pollution";
  }

  /** Extract location from text */
  private extractLocation(text: string): { city: string; address: string } {
    const cities = ["delhi", "bangalore", "mumbai", "hyderabad", "pune", "noida", "gurgaon"];
    let city = "Delhi";
    for (const c of cities) {
      if (text.includes(c)) { city = c.charAt(0).toUpperCase() + c.slice(1); break; }
    }
    return { city, address: text.length > 10 ? text.slice(0, 80) : "Auto-detected location" };
  }

  /** File a complaint via the API */
  async handleFileComplaint(
    transcript: string,
    userId: string,
    preCategory?: string,
    preLocation?: { city: string; address: string }
  ): Promise<string | null> {
    try {
      await this.speak("Processing your complaint. Please wait a moment...");
      const category = preCategory ?? this.extractCategory(transcript);
      const location = preLocation ?? this.extractLocation(transcript);

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${category} reported`,
          description: transcript,
          category,
          department: "environment",
          priority: "medium",
          location: { address: location.address, city: location.city, pincode: "110001" },
          createdBy: userId,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const issueId = data._id;
      const token = `TKN-${issueId.slice(-6).toUpperCase()}`;
      await this.speak(
        `Your complaint has been registered. Your ticket number is ${token}. An officer will contact you within 5 minutes. You can track this in the app.`
      );
      this.callbacks.onComplaintFiled?.(issueId, category);
      return issueId;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      await this.speak("Sorry, I could not file your complaint right now. Please use the web form.");
      this.callbacks.onError?.(error);
      return null;
    }
  }

  /** Check complaint status */
  async handleCheckStatus(issueId: string): Promise<string | null> {
    try {
      await this.speak("Fetching your complaint status...");
      const response = await fetch(`/api/issues/${issueId}`);
      if (!response.ok) {
        await this.speak("Sorry, I could not find that complaint. Please check your ticket number.");
        return null;
      }
      const data = await response.json();
      const status = data.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const category = data.category || "Your complaint";
      const city = data.location?.city || "your area";
      await this.speak(
        `${category} in ${city}. Status: ${status}. ${data.assignedTo ? "An officer is working on it." : "Awaiting assignment."}`
      );
      this.callbacks.onStatusChecked?.(issueId, data.status);
      return data.status;
    } catch (err) {
      await this.speak("Sorry, I could not fetch your complaint status. Please try again.");
      this.callbacks.onError?.(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }

  /**
   * Main conversation flow (multi-turn):
   * 1. Ask: file or check?
   * 2. If file: ask category → ask description → ask location → file
   * 3. If check: ask ticket number → fetch status
   */
  async startConversation(userId: string): Promise<void> {
    await this.speak(
      "Hello! I'm PRANA-NET, your pollution reporting assistant. Would you like to file a new complaint, or check the status of an existing one?"
    );

    try {
      const intentInput = await this.startListening();

      const isFilingIntent =
        intentInput.includes("file") ||
        intentInput.includes("new") ||
        intentInput.includes("report") ||
        intentInput.includes("complaint") ||
        intentInput.includes("problem") ||
        intentInput.includes("register") ||
        intentInput.includes("issue");

      const isCheckIntent =
        intentInput.includes("status") ||
        intentInput.includes("check") ||
        intentInput.includes("track") ||
        intentInput.includes("update") ||
        intentInput.includes("existing");

      if (isFilingIntent) {
        // ── Step 1: Ask what type of problem ──
        await this.speak(
          "I'll help you file a complaint. What type of problem are you reporting? For example: air pollution, garbage, waterlogging, noise, or road damage."
        );
        const categoryInput = await this.startListening();
        const category = this.extractCategory(categoryInput);

        // ── Step 2: Ask for description ──
        await this.speak(
          `Understood — ${category}. Can you describe what you observed? Please mention any details like the source, smell, or visible signs of the problem.`
        );
        const descriptionInput = await this.startListening();

        // ── Step 3: Ask for location ──
        await this.speak(
          "Thank you. Finally, what is the location? Please say the area, block, or nearest landmark."
        );
        const locationInput = await this.startListening();
        const location = this.extractLocation(locationInput);

        // ── File complaint ──
        const fullDescription = `${descriptionInput}. Location: ${locationInput}`;
        await this.handleFileComplaint(
          `${categoryInput}. ${fullDescription}`,
          userId,
          category,
          location
        );

      } else if (isCheckIntent) {
        await this.speak(
          "Sure! Please say your complaint ticket number. It starts with T-K-N followed by numbers."
        );
        const ticketInput = await this.startListening();
        const normalized = ticketInput.toUpperCase().replace(/\s+/g, "");
        const tokenMatch = normalized.match(/TKN([A-Z0-9]{4,})/);
        const fallback = normalized.match(/([A-Z0-9]{4,})$/);
        const ref = tokenMatch?.[1] || fallback?.[1];

        if (ref) {
          await this.handleCheckStatus(ref);
        } else {
          await this.speak(
            "Sorry, I could not understand the ticket number. Please open the app and check your Complaints section."
          );
        }

      } else {
        await this.speak(
          "I didn't quite catch that. Please say 'file a complaint' to report a new problem, or 'check status' to track an existing one."
        );
      }
    } catch (err) {
      await this.speak(
        "An error occurred. Please try again or use the web form to file your complaint."
      );
      this.callbacks.onError?.(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /** Officer verification flow */
  async startVerifyConversation(): Promise<void> {
    await this.speak("Welcome! Please tell me the complaint ticket number to verify.");
    try {
      const transcript = await this.startListening();
      const match = transcript.match(/[a-z0-9]+/i);
      if (!match) { await this.speak("Could not understand the ticket number. Please try again."); return; }
      const complaintId = match[0];
      const response = await fetch("/api/issues");
      if (!response.ok) { await this.speak("Could not fetch complaint details."); return; }
      const issues = await response.json();
      const issue = issues.find(
        (i: any) => i._id.includes(complaintId) || i._id.slice(-6) === complaintId.toUpperCase()
      );
      if (issue) {
        const status = issue.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        await this.speak(
          `Complaint found. ${issue.category || "Complaint"} in ${issue.location?.city || "Unknown"}. Status: ${status}. Priority: ${issue.priority}. ${issue.description || ""}`
        );
      } else {
        await this.speak("Complaint not found. Please verify the ticket number.");
      }
    } catch (err) {
      await this.speak("An error occurred while verifying. Please try again.");
      this.callbacks.onError?.(err instanceof Error ? err.message : "Unknown error");
    }
  }

  getState(): string { return this.currentState; }
  isCurrentlyListening(): boolean { return this.isListening; }
}

// Singleton
let botInstance: VoiceBot | null = null;

export function initializeVoiceBot(config: VoiceBotConfig): VoiceBot {
  if (!botInstance) botInstance = new VoiceBot(config);
  else botInstance.updateConfig(config);
  return botInstance;
}

export function getVoiceBot(): VoiceBot {
  if (!botInstance) botInstance = new VoiceBot();
  return botInstance;
}

export default VoiceBot;
