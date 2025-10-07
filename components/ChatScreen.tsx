import React, { useState, useEffect, useRef } from 'react';
import { ChatInfo, DmChatInfo } from './Sidebar';
import { Message } from '../common/types';

// --- New "Weird" Encryption/Decryption ---
const CIPHER_CONFIG = {
  // Codeword (UI) : Internal Key (for algorithm)
  'STORMFRONT': 'AEGIS-7',
  'ECHO-NIGHT': 'PROMETHEUS',
  'VOID-WALKER': 'CYGNUS-X1',
  'ZERO-SHIFT': 'ENIGMA-IV'
};
const CIPHER_CODEWORDS = Object.keys(CIPHER_CONFIG);
const INTERNAL_CIPHER_KEYS = Object.values(CIPHER_CONFIG);

// A simple seedable PRNG for deterministic "randomness"
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const weirderEncrypt = (text: string, internalKey: string): string => {
  if (!text || !internalKey) return text;
  const seed = simpleHash(internalKey);
  // 1. Character code shift
  let shifted = '';
  for (let i = 0; i < text.length; i++) {
    const shift = (seed + i) % 15;
    shifted += String.fromCharCode(text.charCodeAt(i) + shift + 1); // +1 to avoid null chars
  }
  // 2. Inject symbols
  let withSymbols = '';
  const symbols = ['✧', '‡', '⬡', '⬢', '⬣', '⬙'];
  for (let i = 0; i < shifted.length; i++) {
    withSymbols += shifted[i];
    if ((seed + i) % 4 === 0) {
      withSymbols += symbols[(seed + i) % symbols.length];
    }
  }
  // 3. Base64 encode
  try {
    return btoa(encodeURIComponent(withSymbols));
  } catch (e) {
    console.error("Encryption failed:", e);
    return text;
  }
};

const isPrintable = (str: string) => /^[\x20-\x7E\n\r\t]+$/.test(str);

const weirderDecrypt = (encrypted: string): string => {
    // Attempt to decrypt with each known internal key
    for (const internalKey of INTERNAL_CIPHER_KEYS) {
        try {
            // 1. Base64 decode
            const decodedB64 = decodeURIComponent(atob(encrypted));
            // 2. Remove symbols
            const symbols = ['✧', '‡', '⬡', '⬢', '⬣', '⬙'];
            const symbolRegex = new RegExp(`[${symbols.join('')}]`, 'g');
            const withoutSymbols = decodedB64.replace(symbolRegex, '');
            // 3. Reverse character code shift
            const seed = simpleHash(internalKey);
            let originalText = '';
            for (let i = 0; i < withoutSymbols.length; i++) {
                const shift = (seed + i) % 15;
                originalText += String.fromCharCode(withoutSymbols.charCodeAt(i) - shift - 1);
            }
            // 4. Sanity check: if the result is printable, we likely found the right key
            if (isPrintable(originalText) || originalText.length === 0) {
              return originalText;
            }
        } catch (e) {
            // This key failed, continue to the next one
            continue;
        }
    }
    // If no key worked, fail
    return "DECRYPTION FAILED: DATA CORRUPTED OR UNKNOWN CIPHER";
};


const MOCK_MESSAGES: Record<string, Message[]> = {
  'alpha': [
    { id: 1, text: "All stations, comms check. How copy?", sender: 'other', timestamp: "10:30 AM" },
    { id: 2, text: "Solid copy. Ready for briefing on the project delivery.", sender: 'user', timestamp: "10:31 AM" },
  ],
  'family': [
    { id: 1, text: "Hi honey, don't forget to pick up milk on your way home!", sender: 'other', timestamp: "2:15 PM" },
    { id: 2, text: "Roger that. See you soon.", sender: 'user', timestamp: "2:16 PM" },
  ],
  'work': [
    { id: 1, text: "The new wireframes for Project Condor are ready for review.", sender: 'other', timestamp: "9:05 AM" },
    { id: 2, text: "VyNTVklUVVZKVERWJVNLVFMlQiVXVlZJJVVLJSVRViVSS1ZKJVUklVElVkolQislQyVRViVRSyVCJVVLJSVSSyVRViVVKiVRSyVSSyVCJVdLVkklQyUwMiVCJTNGJTEy", sender: 'user', timestamp: "11:56 PM" }
  ],
  'dm-sarah': [
    { id: 1, text: "Hey, are you free for a quick sync-up call at 3?", sender: 'other', timestamp: "1:30 PM" },
    { id: 2, text: "Yes, 3 works for me. Will send a calendar invite.", sender: 'user', timestamp: "1:32 PM" },
  ],
  'dm-mike': [
    { id: 1, text: "Lunch today?", sender: 'other', timestamp: "11:45 AM" },
  ]
};

const MOCK_DURESS_MESSAGES: Record<string, Message[]> = {
  'alpha': [
    { id: 1, text: "Morning team. Just confirming the 10am quarterly review is still on.", sender: 'other', timestamp: "8:30 AM" },
    { id: 2, text: "Yep, I'm all set. Dialing in shortly.", sender: 'user', timestamp: "8:31 AM" },
    { id: 3, text: "Traffic was bad, I'll be 5 minutes late.", sender: 'other', timestamp: "9:55 AM" },
  ],
  'family': [
    { id: 1, text: "The weather is looking nice this weekend.", sender: 'other', timestamp: "2:15 PM" },
    { id: 2, text: "Agreed. Let's plan on that barbecue.", sender: 'user', timestamp: "2:16 PM" },
  ],
  'work': [
    { id: 1, text: "Can you resend the agenda for the marketing sync?", sender: 'other', timestamp: "9:05 AM" },
    { id: 2, text: "Just forwarded it to you.", sender: 'user', timestamp: "9:06 AM" }
  ],
  'dm-sarah': [
    { id: 1, text: "Hey, just a reminder about the budget meeting at 2.", sender: 'other', timestamp: "1:30 PM" },
    { id: 2, text: "Thanks for the reminder! Almost forgot.", sender: 'user', timestamp: "1:32 PM" },
  ],
  'dm-mike': [
    { id: 1, text: "The forecast says rain tomorrow.", sender: 'other', timestamp: "11:45 AM" },
  ]
};

const OPSEC_CHECKS = [
  {
    type: 'keywords',
    patterns: [
      // Classification & Security
      'classified', 'secret', 'top secret', 'opsec', 'compromised', 'burn notice', 'clearance',
      // Operations & Tactics
      'mission', 'operation', 'extraction', 'exfil', 'infiltration', 'infil', 'stealth',
      'surveillance', 'counter-surveillance', 'neutralize', 'target', 'rendezvous', 'asset',
      // Locations
      'safe house', 'dead drop', 'command post', 'cp', 'hq', 'headquarters', 'battalion',
      'grid reference', 'coordinates', 'location', 'rendezvous point',
      // People & Roles
      'agent', 'operative', 'handler', 'case officer', 'callsign', 'sniper', 'enemy', 'hostile',
      'asset name',
      // Intel & Comms
      'intel', 'sitrep', 'humint', 'sigint', 'intel report', 'cipher', 'encryption key',
      'password', 'passphrase', 'frequency', 'comms', 'mission start time',
      // Equipment
      'weapon', 'explosive', 'bomb', 'ied', 'device'
    ],
    getMessage: (match: string) => `DANGER: Direct mention of operational term "${match}". Rephrase immediately or use encryption.`
  },
  {
    type: 'regex',
    patterns: [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    getMessage: (match: string) => `Potential PII detected: Email address ("${match}"). Avoid sending personal contact information.`
  },
  {
    type: 'regex',
    patterns: [/\b(?:\+?1[ -]?)?\(?\d{3}\)?[ -.]?\d{3}[ -.]?\d{4}\b/],
    getMessage: (match:string) => `Potential PII detected: Phone number ("${match}"). Avoid sending personal contact information.`
  },
  {
    type: 'regex',
    patterns: [/\b\d{1,2}[A-Z]{3}\s?\d{4,10}\b/i],
    getMessage: (match: string) => `CRITICAL: Military Grid Reference ("${match}") detected. Use secure methods for coordinate sharing.`
  }
];

const analyzeDraft = (draft: string): string | null => {
  for (const check of OPSEC_CHECKS) {
    if (check.type === 'keywords') {
      const lowerCaseDraft = draft.toLowerCase();
      for (const keyword of check.patterns as string[]) {
        if (lowerCaseDraft.includes(keyword)) {
          return check.getMessage(keyword);
        }
      }
    } else if (check.type === 'regex') {
      for (const pattern of check.patterns as RegExp[]) {
        const match = draft.match(pattern);
        if (match) {
          return check.getMessage(match[0]);
        }
      }
    }
  }
  return null;
};

interface ChatScreenProps {
  chatInfo: ChatInfo | DmChatInfo;
  onHeaderClick: () => void;
  onReportFiled: () => void;
}

const EMOJIS = ['😀', '😂', '👍', '🔥', '❤️', '🙏', '🎉', '🚀', '👀', '💯'];

type BotStep = 'initial' | 'analyzing' | 'result' | 'reporting' | 'reported';

const OpsecBotScreen: React.FC<{chatInfo: ChatInfo; onReportFiled: () => void;}> = ({ chatInfo, onReportFiled }) => {
    const [step, setStep] = useState<BotStep>('initial');
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ status: 'Suspicious' | 'Safe'; reason: string; } | null>(null);
    const [reportSource, setReportSource] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) { setFileInput(event.target.files[0]); }
    };
    
    const handleAnalyze = () => {
        if (!textInput && !fileInput) return;
        setStep('analyzing');
        setAnalysisResult(null);
        setTimeout(() => {
            const lowerCaseText = textInput.toLowerCase();
            const suspiciousKeywords = ['password', 'urgent', 'verify your account', 'login now', 'ssn', 'bank of america'];
            const suspiciousPatterns = [/http:\/\/.*\.xyz/, /bit\.ly/, /tinyurl\.com/];
            let reason = "This content appears to be safe. No common phishing indicators or suspicious patterns were detected.";
            let status: 'Suspicious' | 'Safe' = 'Safe';
            if (suspiciousKeywords.some(keyword => lowerCaseText.includes(keyword)) || suspiciousPatterns.some(p => p.test(lowerCaseText))) {
                status = 'Suspicious';
                reason = "Potential phishing attempt detected. The content contains keywords and link patterns commonly used in malicious attacks. Do not click any links or provide personal information.";
            }
            if (fileInput) { reason += " Screenshot analysis is a good practice for links you don't want to click."; }
            setAnalysisResult({ status, reason });
            setStep('result');
        }, 2000);
    };

    const handleReportSubmit = () => {
        if(!reportSource) return;
        onReportFiled();
        setStep('reported');
    }

    const handleReset = () => {
        setTextInput('');
        setFileInput(null);
        setAnalysisResult(null);
        setReportSource('');
        setStep('initial');
    }

    const ResultCard = () => {
        if (!analysisResult) return null;
        const isSuspicious = analysisResult.status === 'Suspicious';
        const cardColor = isSuspicious ? 'red' : 'green';
        const cardBg = `dark:bg-gray-800 bg-gray-200`;
        const borderColor = isSuspicious ? 'border-red-500' : 'border-green-500';
        const iconBg = isSuspicious ? 'bg-red-500/20' : 'bg-green-500/20';
        const iconColor = isSuspicious ? 'text-red-400' : 'text-green-400';
        const titleColor = isSuspicious ? 'dark:text-red-300 text-red-600' : 'dark:text-green-300 text-green-600';
        const textColor = `dark:text-gray-300 text-gray-700`;

        return (
            <div className={`mt-6 border-l-4 ${borderColor} ${cardBg} p-4 rounded-r-lg shadow-lg`}>
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-2 ${iconBg} rounded-full`}>
                        {isSuspicious ? 
                            <svg className={`h-6 w-6 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> :
                            <svg className={`h-6 w-6 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        }
                    </div>
                    <div className="ml-4">
                        <h3 className={`text-lg font-bold ${titleColor}`}>{analysisResult.status.toUpperCase()}</h3>
                        <p className={`text-sm ${textColor} mt-1`}>{analysisResult.reason}</p>
                    </div>
                </div>
            </div>
        )
    };
    
    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
            <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 h-[73px]">
                <div className="flex items-center">
                    {/* FIX: Pass props as the second argument to React.cloneElement */}
                    {React.cloneElement(chatInfo.icon, { className: "h-8 w-8 text-teal-400 mr-3" })}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{chatInfo.name}</h1>
                        <p className="text-sm text-green-500 dark:text-green-400">Security Analysis Bot</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-2xl mx-auto">
                    {step === 'initial' && (
                        <div>
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analyze Suspicious Content</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Paste text or upload a screenshot of a message, email, or link to check for threats.</p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-3 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-teal-500 resize-none transition-colors" rows={8} placeholder="Paste email body, message text, or suspicious links here..." aria-label="Suspicious content input"/>
                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="w-full">
                                        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden"/>
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                            {fileInput ? <span className="truncate">{fileInput.name}</span> : 'Upload Screenshot'}
                                        </button>
                                    </div>
                                    <button onClick={handleAnalyze} disabled={!textInput && !fileInput} className={`w-full sm:w-auto px-6 py-2 rounded-md text-sm font-semibold text-white transition-colors flex items-center justify-center ${(!textInput && !fileInput) ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'}`}>Analyze</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 'analyzing' && (<div className="text-center py-4 text-teal-500 dark:text-teal-400 flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Running analysis through secure channels...</div>)}
                    {(step === 'result' || step === 'reporting' || step === 'reported') && <ResultCard />}
                    {step === 'result' && analysisResult?.status === 'Suspicious' && (
                        <div className="mt-6">
                            <button onClick={() => setStep('reporting')} className="w-full px-6 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-500">Report this to HQ</button>
                            <button onClick={handleReset} className="w-full mt-2 px-6 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Analyze Another</button>
                        </div>
                    )}
                    {step === 'result' && analysisResult?.status === 'Safe' && (
                        <div className="mt-6"><button onClick={handleReset} className="w-full px-6 py-2 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500">Analyze Another</button></div>
                    )}
                    {step === 'reporting' && (
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
                            <label htmlFor="report-source" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Where did you receive this message?</label>
                            <select id="report-source" value={reportSource} onChange={e => setReportSource(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-teal-500">
                                <option value="" disabled>Select a source...</option>
                                <option value="Personal Email">Personal Email</option>
                                <option value="Work Email">Work Email</option>
                                <option value="SMS Text Message">SMS Text Message</option>
                                <option value="Another Platform">Another Platform (e.g., social media)</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                            <button onClick={handleReportSubmit} disabled={!reportSource} className="w-full mt-4 px-6 py-2 rounded-md text-sm font-semibold text-white transition-colors flex items-center justify-center ${!reportSource ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}">Lodge Complaint with HQ</button>
                        </div>
                    )}
                    {step === 'reported' && (
                         <div className="mt-6 text-center bg-teal-600/10 dark:bg-teal-900/50 border border-teal-500/30 p-4 rounded-lg">
                            <h3 className="font-bold text-teal-700 dark:text-teal-300">Complaint Lodged</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Thank you. HQ has been notified and will investigate this threat.</p>
                            <button onClick={handleReset} className="mt-4 px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500">Done</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const VoiceNotePlayer: React.FC<{ blobUrl: string }> = ({ blobUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(blobUrl);
        const audio = audioRef.current;
        
        const handleMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('loadedmetadata', handleMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleMetadata);
            audio.removeEventListener('ended', handleEnded);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [blobUrl]);

    const updateProgress = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };
    
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
            audioRef.current.play();
            intervalRef.current = window.setInterval(updateProgress, 100);
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 w-48">
            <button onClick={togglePlay} className="text-teal-200">
                {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
            </button>
            <div className="w-full bg-black/30 rounded-full h-1.5">
                <div className="bg-teal-300 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs text-teal-200/80">{formatTime(duration)}</span>
        </div>
    );
};

const FileAttachment: React.FC<{ fileName: string, fileSize: string }> = ({ fileName, fileSize }) => {
  return (
    <div className="flex items-center gap-3 bg-black/10 dark:bg-black/20 p-3 rounded-lg mt-2">
      <div className="flex-shrink-0 p-2 bg-teal-600/50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{fileName}</p>
        <p className="text-xs opacity-80">{fileSize}</p>
      </div>
      <button className="p-2 rounded-full hover:bg-black/20" aria-label="Download file" onClick={() => alert('File download is disabled in this simulation.')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
};

const CallScreen: React.FC<{ user: ChatInfo | DmChatInfo; type: 'video' | 'voice'; onEnd: () => void; }> = ({ user, type, onEnd }) => {
    const [timer, setTimer] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(type === 'voice');
    
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const callTimer = setInterval(() => setTimer(t => t + 1), 1000);

        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: type === 'video',
                    audio: true,
                });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream; // Loopback for simulation
            } catch (err) {
                console.error("Error accessing media devices.", err);
                alert("Could not access camera or microphone. Please check permissions.");
                onEnd();
            }
        };
        startMedia();

        return () => {
            clearInterval(callTimer);
            localStreamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [type, onEnd]);

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };
    
    const toggleCamera = () => {
        if (type === 'voice') return;
        localStreamRef.current?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsCameraOff(!track.enabled);
        });
    };

    return (
        <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-between text-white overflow-hidden">
            {/* Remote Video (main view) */}
            <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 ${isCameraOff ? 'opacity-0' : 'opacity-100'}`}></video>
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Local Video (PiP) */}
            <video ref={localVideoRef} autoPlay muted playsInline className={`w-48 h-32 object-cover absolute top-8 right-8 rounded-lg shadow-2xl border-2 border-white/20 transition-opacity duration-300 ${isCameraOff ? 'opacity-0' : 'opacity-100'}`}></video>
            
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full p-8">
                <div className="text-center mt-16">
                    <div className="h-24 w-24 rounded-full bg-teal-500 flex items-center justify-center text-4xl font-bold mx-auto ring-4 ring-white/20">
                        {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
                    <p className="text-lg text-gray-300 mt-1">{type === 'video' ? 'Encrypted Video Call' : 'Encrypted Voice Call'}</p>
                    <p className="text-2xl font-mono mt-4">{formatTime(timer)}</p>
                </div>

                <div className="flex items-center space-x-6">
                    <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                     {type === 'video' && (
                        <button onClick={toggleCamera} className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                     )}
                    <button onClick={onEnd} className="p-5 bg-red-600 rounded-full hover:bg-red-500 shadow-lg scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2 2m-2-2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2z" /></svg>
                    </button>
                    <button className="p-4 bg-white/10 rounded-full hover:bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg></button>
                </div>
            </div>
        </div>
    );
};


const ChatScreen: React.FC<ChatScreenProps> = ({ chatInfo, onHeaderClick, onReportFiled }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [opsecWarning, setOpsecWarning] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [callInfo, setCallInfo] = useState<{type: 'voice' | 'video' } | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<{id: number, text: string} | null>(null);
  const [uploadingFile, setUploadingFile] = useState<{ name: string; progress: number; size: string } | null>(null);
  
  const [selectedCipher, setSelectedCipher] = useState<string | null>(null);
  const [showCipherPicker, setShowCipherPicker] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<number | null>(null);
  const cipherPickerRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Duress Protocol Check
    const isDuress = sessionStorage.getItem('duressMode') === 'true';
    const messageSource = isDuress ? MOCK_DURESS_MESSAGES : MOCK_MESSAGES;
    setMessages(messageSource[chatInfo.id] || []);
  }, [chatInfo.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (cipherPickerRef.current && !cipherPickerRef.current.contains(event.target as Node)) {
        setShowCipherPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setOpsecWarning(analyzeDraft(inputText)); }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (opsecWarning && !selectedCipher) return;

    let textToSend = inputText;
    if (selectedCipher) {
        const internalKey = CIPHER_CONFIG[selectedCipher];
        if (internalKey) {
            textToSend = weirderEncrypt(inputText, internalKey);
        }
    }

    const newMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      replyingTo: replyingTo || undefined
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setReplyingTo(null);
    setSelectedCipher(null); // Reset cipher after sending
  };

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const duration = recordingTime;

            const newMessage: Message = {
              id: Date.now(), text: '', sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              attachment: { type: 'voicenote', blobUrl: audioUrl, duration }
            };
            setMessages(prev => [...prev, newMessage]);
            
            // Clean up stream
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required to record voice notes.");
    }
  };

  const handleCancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSendVoiceNote = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };
  
    const cancelUpload = () => {
        if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current);
            uploadIntervalRef.current = null;
        }
        setUploadingFile(null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      cancelUpload(); // Cancel any existing upload

      const simulatedSize = (Math.random() * 5 + 1).toFixed(2); // 1-6 MB
      setUploadingFile({ name: file.name, progress: 0, size: `${simulatedSize} MB` });

      const interval = window.setInterval(() => {
        setUploadingFile(prev => {
          if (!prev) {
            clearInterval(interval);
            return null;
          }
          const newProgress = prev.progress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            uploadIntervalRef.current = null;
            
            const newMessage: Message = {
              id: Date.now(),
              text: '',
              sender: 'user',
              timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              attachment: {
                type: 'file',
                fileName: prev.name,
                fileSize: prev.size,
              }
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);

            return null;
          }
          return { ...prev, progress: newProgress };
        });
      }, 300);
      uploadIntervalRef.current = interval;

      if (event.target) {
        event.target.value = '';
      }
    };
  
  const handleReply = (message: Message) => setReplyingTo(message);
  const handleDelete = (messageId: number) => {
    setMessages(messages.filter(m => m.id !== messageId));
    setPinnedMessages(pinnedMessages.filter(m => m.id !== messageId));
  };
  const handlePin = (message: Message) => {
    if (!pinnedMessages.find(p => p.id === message.id)) {
        setPinnedMessages([...pinnedMessages, message]);
    }
  };
  const handleUnpin = (messageId: number) => setPinnedMessages(pinnedMessages.filter(p => p.id !== messageId));
  const handleEmojiSelect = (emoji: string) => setInputText(inputText + emoji);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  
    const handleDecrypt = (message: Message) => {
        if (!message.text) return;
        const decryptedText = weirderDecrypt(message.text);
        
        setDecryptedMessage({ id: message.id, text: decryptedText });
        
        const displayTime = Math.max(5000, decryptedText.length * 100);
        setTimeout(() => setDecryptedMessage(null), displayTime);
    };

  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();
  const filteredMessages = messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));

  if (chatInfo.id.startsWith('bot-')) {
    return <OpsecBotScreen chatInfo={chatInfo} onReportFiled={onReportFiled} />;
  }

  const MessageActions = ({ msg }: { msg: Message }) => (
    <div className={`absolute top-0 -mt-4 flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10 ${msg.sender === 'user' ? 'right-0' : 'left-0'}`}>
      <button onClick={() => handlePin(msg)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Pin message"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5.058l1.768 1.768a1 1 0 11-1.414 1.414L10 10.414l-1.354 1.354a1 1 0 11-1.414-1.414L8.943 9.058V4a1 1 0 011-1z" clipRule="evenodd" /><path d="M6.21 13.527a1 1 0 010-1.414L8.257 10.07l-1.414-1.414a1 1 0 111.414-1.414l1.414 1.414 2.121-2.121a1 1 0 011.414 1.414l-2.121 2.121 1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414-2.036 2.036a1 1 0 01-1.414 0z" /></svg></button>
      <button onClick={() => handleReply(msg)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Reply to message"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
      <button onClick={() => handleDecrypt(msg)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Decrypt message"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l1-1 1-1-1.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2zM6 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg></button>
      <button onClick={() => handleDelete(msg.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500" aria-label="Delete message"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
    </div>
  );
  
  const SendButton = () => {
    const isSendDisabled = !inputText.trim() || (!!opsecWarning && !selectedCipher);
    const isEncryptAction = !!selectedCipher || !!opsecWarning;

    const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
    const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;

    let text = 'Send';
    let icon = <SendIcon />;
    let className = 'bg-teal-600 hover:bg-teal-500';
    let aria = 'Send message';
    
    if (isEncryptAction) {
        text = 'Encrypt & Send';
        aria = 'Encrypt and send message';
    }
    if (opsecWarning) {
        icon = <LockIcon />;
        if (selectedCipher) {
            className = 'bg-yellow-600 hover:bg-yellow-500';
        } else {
            text = 'Select Cipher to Send';
        }
    }
    if (isSendDisabled) {
        className = 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed';
        aria = opsecWarning ? 'Select a cipher to enable sending' : 'Type a message to send';
    }

    return (
        <button onClick={handleSend} disabled={isSendDisabled} className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors flex items-center ${className}`} aria-label={aria}>
          {icon}
          {text}
        </button>
    );
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white relative">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 h-[73px]">
        <button onClick={onHeaderClick} disabled={chatInfo.type.includes('Bot')} className={`flex items-center text-left ${!chatInfo.type.includes('Bot') ? 'cursor-pointer' : 'cursor-default'}`}>
            {/* FIX: Pass props as the second argument to React.cloneElement */}
            {React.cloneElement(chatInfo.icon, { className: "h-8 w-8 text-teal-400 mr-3" })}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{chatInfo.name}</h1>
              <p className="text-sm text-green-500 dark:text-green-400">{chatInfo.type}</p>
            </div>
        </button>
        <div className="flex items-center space-x-2">
            <button onClick={() => setCallInfo({type: 'voice'})} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></button>
            <button onClick={() => setCallInfo({type: 'video'})} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg></button>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></span>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-200 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" aria-label="Search messages" />
            </div>
        </div>
      </header>

      {pinnedMessages.length > 0 && (
        <div className="p-2 bg-gray-200/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-4 overflow-x-auto">
                 {pinnedMessages.map(msg => (
                    <div key={msg.id} className="bg-gray-300 dark:bg-gray-700 p-2 rounded-md text-xs flex-shrink-0 flex items-center text-gray-800 dark:text-white max-w-xs">
                        <p className="truncate flex-1">{msg.text || 'Attachment'}</p>
                        <button onClick={() => handleUnpin(msg.id)} className="ml-2 p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Unpin message">&times;</button>
                    </div>
                 ))}
            </div>
        </div>
      )}

      <main className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="relative" onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)}>
                {hoveredMessageId === msg.id && <MessageActions msg={msg} />}
                <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-teal-700 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'} shadow relative break-all`} style={{ userSelect: 'none' }} onContextMenu={preventContextMenu}>
                  {msg.replyingTo && (
                    <div className="p-2 mb-2 border-l-2 border-teal-400 bg-black/10 dark:bg-black/20 rounded">
                      <p className={`font-bold text-xs ${msg.sender === 'user' ? 'text-teal-100' : 'text-teal-600 dark:text-teal-300'}`}>{msg.replyingTo.sender === 'user' ? 'You' : chatInfo.name}</p>
                      <p className="text-sm opacity-80 truncate">{msg.replyingTo.text || 'Attachment'}</p>
                    </div>
                  )}
                  {msg.attachment?.type === 'image' && msg.attachment.url && <img src={msg.attachment.url} alt="attachment" className="rounded-lg max-w-xs mb-2" />}
                  {msg.attachment?.type === 'voicenote' && msg.attachment.blobUrl && <VoiceNotePlayer blobUrl={msg.attachment.blobUrl} />}
                  {msg.attachment?.type === 'file' && <FileAttachment fileName={msg.attachment.fileName!} fileSize={msg.attachment.fileSize!} />}
                  
                  {decryptedMessage && decryptedMessage.id === msg.id ? (
                      <div className="text-left">
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${msg.sender === 'user' ? 'text-teal-200' : 'text-teal-500'}`}>Decrypted Message</p>
                          <p className="text-sm whitespace-pre-wrap font-medium">{decryptedMessage.text}</p>
                          <p className="text-sm whitespace-pre-wrap opacity-50 mt-1">{msg.text}</p>
                      </div>
                  ) : (
                      msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}

                  <div className={`flex items-center justify-end mt-1 opacity-80 text-xs ${msg.sender === 'user' ? 'text-teal-200' : 'text-gray-400 dark:text-gray-400'}`}>
                      <span className="mr-2">{msg.timestamp}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        {uploadingFile && (
            <div className="p-2 mb-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-3">
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[200px] sm:max-w-xs">{uploadingFile.name}</span>
                        <span>{uploadingFile.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${uploadingFile.progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
                    </div>
                </div>
                <button onClick={cancelUpload} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-xl">&times;</button>
            </div>
        )}
        {replyingTo && (
          <div className="p-2 mb-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex justify-between items-center text-sm">
            <div>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-300">Replying to {replyingTo.sender === 'user' ? 'yourself' : chatInfo.name}</p>
              <p className="text-gray-800 dark:text-white truncate">{replyingTo.text || 'Attachment'}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-xl">&times;</button>
          </div>
        )}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            {isRecording ? (
                <div className="flex items-center justify-between h-[68px]">
                    <button onClick={handleCancelRecording} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" aria-label="Cancel recording">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="flex items-center text-red-500 flex-1 justify-center">
                        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                        <span className="ml-3 font-mono text-lg text-gray-800 dark:text-white">{formatTime(recordingTime)}</span>
                    </div>
                    <button onClick={handleSendVoiceNote} className="p-2 bg-teal-600 rounded-full text-white" aria-label="Send voice note">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            ) : (
                <>
                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-transparent text-gray-800 dark:text-white p-2 text-sm border-0 focus:ring-0 resize-none" rows={2} placeholder="Type an encrypted message..." aria-label="Encrypted message input" />
                {opsecWarning && (
                    <div className="p-3 my-2 bg-yellow-500/10 dark:bg-yellow-900/50 border-l-4 border-yellow-500 rounded-r-lg" role="alert"><div className="flex"><div className="flex-shrink-0"><svg className="h-5 w-5 text-yellow-500 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3.5a1 1 0 01-2 0V5z" clipRule="evenodd" /></svg></div><div className="ml-3"><h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">OPSEC Alert</h3><div className="mt-1 text-sm text-yellow-700 dark:text-yellow-200"><p>{opsecWarning}</p></div></div></div></div>
                )}
                </>
            )}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <div className="relative">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" aria-label="Add emoji">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg>
                </button>
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full mb-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 grid grid-cols-5 gap-2 w-48 shadow-lg z-10">
                        {EMOJIS.map(emoji => <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="text-xl p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">{emoji}</button>)}
                    </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" aria-label="Attach file">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 10-6 0v4a1 1 0 102 0V7a1 1 0 112 0v4a3 3 0 11-6 0V7a5 5 0 0110 0v4a5 5 0 01-10 0V7a3 3 0 00-3-3z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={handleStartRecording} className="p-2 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" aria-label="Record voice note"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg></button>
              
               <div className="relative">
                <button onClick={() => setShowCipherPicker(!showCipherPicker)} className="p-2 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" aria-label="Select Cipher Key">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.946l.362.241a1 1 0 01.488 1.308l-.732 1.268a1 1 0 01-1.308.488l-.241-.362V8a1 1 0 01-2 0V5.889l-.241.362a1 1 0 01-1.308-.488l-.732-1.268a1 1 0 01.488-1.308L8 3.946V2a1 1 0 01.7-1.046A4.992 4.992 0 0110 0c.343 0 .682.035 1.01.103.095.013.188.03.28.05.01.002.02.004.03.006.02.004.04.008.06.012.01.002.02.004.03.006.095.02.188.043.28.068zM5 11.3a1 1 0 01-1.046-.7A4.992 4.992 0 014 10c0-.343.035-.682.103-1.01a1 1 0 011.046-.7l1.946.259.241-.362a1 1 0 011.308.488l.732 1.268a1 1 0 01-.488 1.308l-.362.241H8a1 1 0 010 2h1.111l.362.241a1 1 0 01.488 1.308l-.732 1.268a1 1 0 01-1.308.488l-.241-.362-1.946.259A1 1 0 015 11.3zm13.954-.3A1 1 0 0118 12v-1.946l.362-.241a1 1 0 01.488-1.308l-.732-1.268a1 1 0 01-1.308-.488l-.241.362V5a1 1 0 01-2 0v1.111l-.241-.362a1 1 0 01-1.308.488l-.732 1.268a1 1 0 01.488 1.308l.362.241H12a1 1 0 010 2h1.111l.362.241a1 1 0 01.488 1.308l-.732 1.268a1 1 0 01-1.308.488l-.241-.362-.259 1.946a1 1 0 01-1.046.7c.068.328.103.667.103 1.01 0 .343-.035.682-.103 1.01.013.095.03.188.05.28.002.01.004.02.006.03.004.02.008.04.012.06.002.01.004.02.006.03.02.095.043.188.068.28.093.284.19.562.29.832.092.25.19.492.296.728.02.04.04.08.06.12.04.08.08.16.12.24.04.08.09.15.13.23.04.07.09.14.13.21.05.07.1.14.15.21.05.06.1.12.15.18.05.06.1.12.15.18.05.06.1.12.16.17l.16.16a5.002 5.002 0 003.536-1.464 5 5 0 001.464-3.536l-.16-.16z" clipRule="evenodd" /></svg>
                </button>
                {showCipherPicker && (
                    <div ref={cipherPickerRef} className="absolute bottom-full mb-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 w-48 shadow-lg z-10">
                        <p className="text-xs font-semibold text-gray-400 px-2 pb-1 uppercase">Select Cipher Codeword</p>
                        {CIPHER_CODEWORDS.map(key => <button key={key} onClick={() => { setSelectedCipher(key); setShowCipherPicker(false); }} className={`w-full text-left text-sm p-2 rounded ${selectedCipher === key ? 'bg-teal-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{key}</button>)}
                    </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
                {selectedCipher && <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{selectedCipher}</span>}
                <SendButton />
            </div>
          </div>
        </div>
      </footer>
      {callInfo && <CallScreen user={chatInfo} type={callInfo.type} onEnd={() => setCallInfo(null)} />}
    </div>
  );
};

export default ChatScreen;