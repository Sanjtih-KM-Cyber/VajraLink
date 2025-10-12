import React, { useState, FormEvent, useEffect } from 'react';
import { 
    login, 
    register, 
    checkUsername,
    getSecurityQuestion,
    submitSecurityAnswer,
    SECURITY_QUESTIONS,
    triggerDuressAlert
} from '../hq/api';


import { useAuth } from '../contexts/AuthContext';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

type AuthView = 'login' | 'register' | 'forgotPassword';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  
  const renderView = () => {
    switch(view) {
      case 'login':
        return <LoginView onSwitchView={setView} onLoginSuccess={onLoginSuccess} />;
      case 'register':
        return <RegisterView onSwitchView={setView} />;
      case 'forgotPassword':
        return <ForgotPasswordView onSwitchView={setView} />;
      default:
        return <LoginView onSwitchView={setView} onLoginSuccess={onLoginSuccess} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-200 mt-4 tracking-wider">VAJRALINK</h1>
            <p className="text-teal-400 mt-1">Operative Messenger</p>
        </div>
        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

const FirstLoginInfoView: React.FC<{ duressPassword: string; onContinue: () => void; }> = ({ duressPassword, onContinue }) => {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, Operative</h2>
            <p className="text-gray-400 mb-6">Your account has been approved. For your security, please record the following information.</p>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4 text-left">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Standard Login</label>
                    <p className="text-gray-300">Use your standard username and password for normal operations.</p>
                </div>
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
                    <label className="text-xs font-semibold text-red-400 uppercase">Duress Password</label>
                    <p className="text-lg font-mono tracking-widest text-white my-2 bg-gray-800 p-2 rounded text-center">{duressPassword}</p>
                    <p className="text-sm text-red-300/80">
                        Memorize this password. Use it <span className="font-bold">ONLY</span> if you are compromised or being forced to log in. This will silently alert HQ.
                    </p>
                </div>
            </div>

            <button
                onClick={onContinue}
                className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-500"
            >
                I have recorded my duress password. Continue.
            </button>
        </div>
    );
};

// --- Login View ---
const LoginView: React.FC<{onSwitchView: (v: AuthView) => void; onLoginSuccess: () => void;}> = ({ onSwitchView, onLoginSuccess }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<LoadingState>('idle');
    const [error, setError] = useState('');
    const [showFirstLoginInfo, setShowFirstLoginInfo] = useState(false);
    const [newDuressPassword, setNewDuressPassword] = useState('');

    const handleDuressLogin = (user: string) => {
        console.warn('DURESS PROTOCOL ACTIVATED FOR:', user);
        sessionStorage.setItem('duressMode', 'true');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await triggerDuressAlert(user, { lat: latitude, lon: longitude });
                },
                async (error: GeolocationPositionError) => {
                    console.error(`Geolocation error: ${error.message} (code: ${error.code})`);
                    await triggerDuressAlert(user, null);
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            triggerDuressAlert(user, null);
        }
        
        // Appear to log in successfully
        setStatus('success');
        setTimeout(onLoginSuccess, 500);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        const result = await login(username, password, 'operative');
        
        if (result.success) {
            if (result.duress) {
                handleDuressLogin(username);
            } else if (result.firstLogin && result.duressPassword) {
                setNewDuressPassword(result.duressPassword);
                setShowFirstLoginInfo(true);
            } else {
                sessionStorage.removeItem('duressMode');
                setStatus('success');
                login(username);
                setTimeout(onLoginSuccess, 500);
            }
        } else {
            setStatus('error');
            setError(result.error || 'An unknown error occurred.');
        }
    };

    if (showFirstLoginInfo) {
        return <FirstLoginInfoView duressPassword={newDuressPassword} onContinue={onLoginSuccess} />;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Secure Sign In</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Username" type="text" value={username} onChange={setUsername} autoComplete="username" />
                <InputField label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <AuthButton text="Sign In" loadingText="Authenticating..." status={status} />
                <div className="text-sm text-center">
                    <button type="button" onClick={() => onSwitchView('forgotPassword')} className="font-medium text-teal-500 hover:text-teal-400">Forgot password?</button>
                </div>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
                New operative? <button onClick={() => onSwitchView('register')} className="font-medium text-teal-500 hover:text-teal-400">Request access</button>
            </div>
        </div>
    );
};

// --- Register View ---
const RegisterView: React.FC<{onSwitchView: (v: AuthView) => void}> = ({ onSwitchView }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        serviceId: '',
        rank: '',
        unit: '',
        enlistmentDate: '',
        verifyingOfficer: '',
        securityQuestionIndex: '',
        securityQuestionAnswer: '',
    });
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);
    const updateForm = (data: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...data }));


    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-1">Access Request</h2>
            <p className="text-sm text-gray-400 text-center mb-6">Follow the steps for secure enrollment.</p>
            {step === 1 && <CredentialsStep onComplete={nextStep} updateForm={updateForm} data={formData} />}
            {step === 2 && <PersonnelDetailsStep onComplete={nextStep} onBack={prevStep} updateForm={updateForm} data={formData} />}
            {step === 3 && <SecurityQuestionStep onComplete={nextStep} onBack={prevStep} updateForm={updateForm} data={formData} />}
            {step === 4 && <BiometricStep onComplete={nextStep} onBack={prevStep} />}
            {step === 5 && <ApprovalStep onComplete={() => onSwitchView('login')} data={formData} />}
            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account? <button onClick={() => onSwitchView('login')} className="font-medium text-teal-500 hover:text-teal-400">Sign In</button>
            </div>
        </div>
    );
};

const CredentialsStep: React.FC<{onComplete: () => void, updateForm: (d: any) => void, data: any}> = ({ onComplete, updateForm, data }) => {
    const [confirm, setConfirm] = useState('');
    const [passwordValidations, setPasswordValidations] = useState({
        length: false, uppercase: false, lowercase: false, number: false, special: false,
    });

    useEffect(() => {
        const { password } = data;
        setPasswordValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        });
    }, [data.password]);

    const allValid = Object.values(passwordValidations).every(v => v);
    const isValid = allValid && data.username.trim().length > 0 && data.password !== '' && data.password === confirm;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        const { isTaken } = await checkUsername(data.username);
        if (isTaken) {
            alert('Username is already taken.');
        } else {
            onComplete();
        }
    };
    
    const ValidationItem: React.FC<{label: string; valid: boolean}> = ({ label, valid }) => (
        <li className={`flex items-center ${valid ? 'text-green-400' : 'text-red-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                {valid ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
            </svg>
            {label}
        </li>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 1 of 5: Credentials</h3>
            <InputField label="Username" type="text" value={data.username} onChange={(v) => updateForm({ username: v})} />
            <InputField label="Password" type="password" value={data.password} onChange={(v) => updateForm({ password: v})} />
            {data.password && (
                <ul className="text-xs space-y-1 p-3 bg-gray-900 rounded-md">
                    <ValidationItem valid={passwordValidations.length} label="At least 8 characters" />
                    <ValidationItem valid={passwordValidations.uppercase} label="Contains an uppercase letter" />
                    <ValidationItem valid={passwordValidations.lowercase} label="Contains a lowercase letter" />
                    <ValidationItem valid={passwordValidations.number} label="Contains a number" />
                    <ValidationItem valid={passwordValidations.special} label="Contains a special character" />
                </ul>
            )}
            <InputField label="Confirm Password" type="password" value={confirm} onChange={setConfirm} />
            {data.password && confirm && data.password !== confirm && (
                 <p className="text-xs text-red-400 text-center">Passwords do not match.</p>
            )}
            <AuthButton text="Next" status={isValid ? 'idle' : 'error'} />
        </form>
    );
};


const PersonnelDetailsStep: React.FC<{onComplete: () => void, onBack: () => void, updateForm: (d: any) => void, data: any}> = ({ onComplete, onBack, updateForm, data }) => {
    const isValid = data.serviceId && data.rank && data.unit && data.enlistmentDate && data.verifyingOfficer;
    const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (isValid) onComplete(); };

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 2 of 5: Personnel Details</h3>
            <InputField label="Service ID" type="text" value={data.serviceId} onChange={v => updateForm({ serviceId: v })} />
            <InputField label="Rank" type="text" value={data.rank} onChange={v => updateForm({ rank: v })} />
            <InputField label="Unit / Battalion" type="text" value={data.unit} onChange={v => updateForm({ unit: v })} />
            <InputField label="Enlistment Date" type="date" value={data.enlistmentDate} onChange={v => updateForm({ enlistmentDate: v })} />
            <InputField label="Verifying Officer" type="text" value={data.verifyingOfficer} onChange={v => updateForm({ verifyingOfficer: v })} />
            <div className="flex gap-4">
                <button type="button" onClick={onBack} className="w-full text-center py-3 px-4 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">Back</button>
                <AuthButton text="Next" status={isValid ? 'idle' : 'error'} />
            </div>
        </form>
    )
};

const SecurityQuestionStep: React.FC<{onComplete: () => void, onBack: () => void, updateForm: (d: any) => void, data: any}> = ({ onComplete, onBack, updateForm, data }) => {
    const isValid = data.securityQuestionIndex && data.securityQuestionAnswer;
    const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (isValid) onComplete(); };
    
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 3 of 5: Security Question</h3>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select a Question</label>
                <select value={data.securityQuestionIndex} onChange={(e) => updateForm({ securityQuestionIndex: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="" disabled>-- Select a question --</option>
                    {SECURITY_QUESTIONS.map((q, i) => <option key={i} value={i}>{q}</option>)}
                </select>
            </div>
            <InputField label="Your Answer" type="text" value={data.securityQuestionAnswer} onChange={(v) => updateForm({ securityQuestionAnswer: v })} />
            <div className="flex gap-4">
                <button type="button" onClick={onBack} className="w-full text-center py-3 px-4 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">Back</button>
                <AuthButton text="Next" status={isValid ? 'idle' : 'error'} />
            </div>
        </form>
    )
};

const BiometricStep: React.FC<{onComplete: () => void, onBack: () => void}> = ({ onComplete, onBack }) => {
    const [scanStatus, setScanStatus] = useState<'idle' | 'standard' | 'duress'>('idle');
    const [enrolled, setEnrolled] = useState<{standard: boolean, duress: boolean}>({ standard: false, duress: false });

    const handleScan = (type: 'standard' | 'duress') => {
        setScanStatus(type);
        setTimeout(() => {
            setEnrolled(prev => ({ ...prev, [type]: true }));
            setScanStatus('idle');
        }, 2000);
    };

    const bothEnrolled = enrolled.standard && enrolled.duress;

    return (
        <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-300">Step 4 of 5: Biometric Enrollment</h3>
            <p className="text-sm text-gray-400">Enroll both a standard and a duress biometric signature. This is a critical security step.</p>
            
            <div className="flex justify-center my-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-20 w-20 transition-colors ${scanStatus !== 'idle' && 'animate-pulse'} ${scanStatus === 'standard' && 'text-teal-400'} ${scanStatus === 'duress' && 'text-red-500'} ${(bothEnrolled && scanStatus === 'idle') ? 'text-green-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM8.5 6.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V6.25zM11.5 6.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V7a.75.75 0 01.75-.75zM10 8.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V8.5zM6.5 7a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V7.75A.75.75 0 016.5 7zM13.5 8.5a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8.001 8.001 0 0113.14-6.313.75.75 0 01.912.264l1.25 2.5a.75.75 0 01-.13 1.01l-2.5 2.5a.75.75 0 01-1.012-.132A5.502 5.502 0 005.5 10a.75.75 0 01-1.5 0c0-1.859.923-3.52 2.365-4.524a.75.75 0 01.554-1.293A8.001 8.001 0 012 10z" clipRule="evenodd" />
                </svg>
            </div>

            <div className="w-full flex gap-4">
                 <button type="button" onClick={() => handleScan('standard')} disabled={scanStatus !== 'idle' || enrolled.standard} className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white bg-gray-800 border border-gray-700 hover:border-teal-500">
                    {enrolled.standard ? 'Standard Enrolled' : scanStatus === 'standard' ? 'Scanning...' : 'Enroll Standard'}
                 </button>
                 <button type="button" onClick={() => handleScan('duress')} disabled={scanStatus !== 'idle' || enrolled.duress} className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white bg-gray-800 border border-gray-700 hover:border-red-500">
                    {enrolled.duress ? 'Duress Enrolled' : scanStatus === 'duress' ? 'Scanning...' : 'Enroll Duress'}
                 </button>
            </div>
             <div className="flex gap-4">
                <button type="button" onClick={onBack} className="w-full text-center py-3 px-4 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">Back</button>
                <AuthButton text="Next" status={bothEnrolled ? 'idle' : 'error'} onClick={onComplete} />
            </div>
        </div>
    );
};
const ApprovalStep: React.FC<{onComplete: () => void, data: any}> = ({ onComplete, data }) => {
    const [status, setStatus] = useState<LoadingState>('loading');
    
    useEffect(() => {
        const performRegistration = async () => {
            await register(data);
            setStatus('success');
            setTimeout(onComplete, 3000);
        };
        performRegistration();
    }, [onComplete, data]);

    return (
        <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-300">Step 5 of 5: HQ Approval</h3>
            <div className="flex justify-center">
                 {status === 'loading' ? <Spinner /> : <SuccessIcon />}
            </div>
            <p className="text-sm text-gray-400">{status === 'loading' ? "Sending enrollment request to HQ for verification..." : "Request Sent! You will be notified via official channels upon approval. Redirecting to login."}</p>
        </div>
    );
};

// --- Forgot Password View ---
const ForgotPasswordView: React.FC<{onSwitchView: (v: AuthView) => void}> = ({ onSwitchView }) => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    
    return (
        <div>
             <h2 className="text-2xl font-bold text-center text-white mb-1">Recover Access</h2>
             <p className="text-sm text-gray-400 text-center mb-6">Follow the steps for identity verification.</p>
             {step === 1 && <ForgotStep1 onComplete={(user) => { setUsername(user); setStep(2); }} />}
             {step === 2 && <ForgotStep2 username={username} onComplete={() => setStep(3)} />}
             {step === 3 && <ForgotStep3 onComplete={() => onSwitchView('login')} />}
             <div className="mt-6 text-center text-sm text-gray-400">
                Remember your password? <button onClick={() => onSwitchView('login')} className="font-medium text-teal-500 hover:text-teal-400">Sign In</button>
            </div>
        </div>
    );
};

const ForgotStep1: React.FC<{ onComplete: (username: string) => void }> = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (username) onComplete(username); }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 1: Identify User</h3>
            <InputField label="Username" type="text" value={username} onChange={setUsername} />
            <AuthButton text="Next" />
        </form>
    );
};

const ForgotStep2: React.FC<{ username: string, onComplete: () => void }> = ({ username, onComplete }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<LoadingState>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuestion = async () => {
            const result = await getSecurityQuestion(username);
            if(result.success) setQuestion(result.question || '');
            else setError('User not found or no security question set.');
        };
        fetchQuestion();
    }, [username]);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        const result = await submitSecurityAnswer(username, answer);
        if (result.success) {
            setStatus('success');
            onComplete();
        } else {
            setStatus('error');
            setError(result.error || 'Incorrect answer.');
        }
    }

    if (error && !question) return <p className="text-red-500 text-sm text-center">{error}</p>

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 2: Security Question</h3>
            <p className="text-sm text-gray-300 text-center bg-gray-800 p-3 rounded-md">{question || 'Loading question...'}</p>
            <InputField label="Your Answer" type="text" value={answer} onChange={setAnswer} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <AuthButton text="Next" status={status} loadingText="Verifying..." />
        </form>
    );
};

const ForgotStep3: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-300">Final Step: Verification</h3>
            <div className="flex justify-center">
                 <SuccessIcon />
            </div>
            <p className="text-sm text-gray-400">Identity confirmed. A password reset request has been logged with HQ. They will contact you to complete the process.</p>
        </div>
    );
};

// --- Reusable UI Components ---
const InputField: React.FC<{label: string; type: string; value: string; onChange: (v: string) => void, autoComplete?: string}> = ({ label, type, value, onChange, autoComplete }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            required 
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
    </div>
);

const AuthButton: React.FC<{text: string; loadingText?: string; status?: LoadingState; onClick?: () => void}> = ({ text, loadingText, status='idle', onClick }) => (
     <button 
        type={onClick ? "button" : "submit"}
        onClick={onClick}
        disabled={status === 'loading' || status === 'error'}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
    >
        {status === 'loading' && <Spinner />}
        {status === 'loading' ? (loadingText || 'Loading...') : text}
    </button>
);

const Spinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


export default AuthScreen;