import React, { useState, useEffect } from 'react';
import { 
    login, 
    register, 
    checkUsername,
    getSecurityQuestion,
    submitSecurityAnswer,
    SECURITY_QUESTIONS 
} from '../api.js';

const AuthScreen = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login');
  
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
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-300">
      <div className="w-full max-w-md mx-auto p-4">
        <div className="flex flex-col items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-200 mt-4 tracking-wider">VAJRALINK HQ</h1>
            <p className="text-teal-400 mt-1">Command & Control</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

// --- Login View ---
const LoginView = ({ onSwitchView, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        const result = await login(username, password, 'admin');
        if (result.success) {
            setStatus('success');
            setTimeout(onLoginSuccess, 500);
        } else {
            setStatus('error');
            setError(result.error || 'An unknown error occurred.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">HQ Secure Sign In</h2>
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
                New administrator? <button onClick={() => onSwitchView('register')} className="font-medium text-teal-500 hover:text-teal-400">Request access</button>
            </div>
        </div>
    );
};

// --- Register View ---
const RegisterView = ({onSwitchView}) => {
    const [step, setStep] = useState(1);
    
    const nextStep = () => setStep(s => s + 1);

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-1">Access Request</h2>
            <p className="text-sm text-gray-400 text-center mb-6">Follow the steps for secure enrollment.</p>
            {step === 1 && <Step1 onComplete={nextStep} />}
            {step === 2 && <Step2 onComplete={nextStep} />}
            {step === 3 && <Step3 onComplete={() => onSwitchView('login')} />}
            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account? <button onClick={() => onSwitchView('login')} className="font-medium text-teal-500 hover:text-teal-400">Sign In</button>
            </div>
        </div>
    );
};

const Step1 = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [passwordValidations, setPasswordValidations] = useState({ length: false, uppercase: false, lowercase: false, number: false, special: false });

    useEffect(() => {
        setPasswordValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        });
    }, [password]);

    const allValid = Object.values(passwordValidations).every(v => v);
    const isValid = allValid && username.trim() && password && password === confirm;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        const { isTaken } = await checkUsername(username);
        if (isTaken) {
            alert('Username is already taken.');
        } else {
            onComplete();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 1: Credentials</h3>
            <InputField label="Username" type="text" value={username} onChange={setUsername} />
            <InputField label="Password" type="password" value={password} onChange={setPassword} />
            {password && (
                <ul className="text-xs space-y-1 p-3 bg-gray-800 rounded-md">
                    {Object.entries({
                        "At least 8 characters": passwordValidations.length,
                        "Contains an uppercase letter": passwordValidations.uppercase,
                        "Contains a lowercase letter": passwordValidations.lowercase,
                        "Contains a number": passwordValidations.number,
                        "Contains a special character": passwordValidations.special,
                    }).map(([label, valid]) => (
                        <li key={label} className={`flex items-center ${valid ? 'text-green-400' : 'text-red-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">{valid ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}</svg>
                            {label}
                        </li>
                    ))}
                </ul>
            )}
            <InputField label="Confirm Password" type="password" value={confirm} onChange={setConfirm} />
            {password && confirm && password !== confirm && <p className="text-xs text-red-400 text-center">Passwords do not match.</p>}
            <AuthButton text="Next" status={isValid ? 'idle' : 'error'} />
        </form>
    );
};


const Step2 = ({onComplete}) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (question && answer.trim()) onComplete(); };
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 2: Security Question</h3>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select a Question</label>
                <select value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="" disabled>-- Select a question --</option>
                    {SECURITY_QUESTIONS.map((q, i) => <option key={i} value={i}>{q}</option>)}
                </select>
            </div>
            <InputField label="Your Answer" type="text" value={answer} onChange={setAnswer} />
            <AuthButton text="Submit Request" status={(question && answer) ? 'idle' : 'error'} />
        </form>
    )
};

const Step3 = ({onComplete}) => {
    const [status, setStatus] = useState('loading');
    
    useEffect(() => {
        const performRegistration = async () => {
            await register({}); // Pass user data here in a real app
            setStatus('success');
            setTimeout(onComplete, 2000);
        };
        performRegistration();
    }, [onComplete]);

    return (
        <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-300">Final Step: HQ Approval</h3>
            <div className="flex justify-center h-8 w-8 mx-auto">{status === 'loading' ? <Spinner /> : <SuccessIcon />}</div>
            <p className="text-sm text-gray-400">{status === 'loading' ? "Sending enrollment request to HQ for verification..." : "Request sent! You will be notified upon approval. Redirecting to login."}</p>
        </div>
    );
};

// --- Forgot Password View ---
const ForgotPasswordView = ({ onSwitchView }) => {
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

const ForgotStep1 = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (username.trim()) onComplete(username); }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 1: Identify User</h3>
            <InputField label="Username" type="text" value={username} onChange={setUsername} />
            <AuthButton text="Next" />
        </form>
    );
};

const ForgotStep2 = ({ username, onComplete }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuestion = async () => {
            const result = await getSecurityQuestion(username);
            if(result.success) setQuestion(result.question || '');
            else setError('User not found or no security question set.');
        };
        fetchQuestion();
    }, [username]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await submitSecurityAnswer(username, answer);
        if (result.success) onComplete();
        else setError(result.error || 'Incorrect answer.');
    }

    if (error && !question) return <p className="text-red-500 text-sm text-center">{error}</p>

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-center text-gray-300">Step 2: Security Question</h3>
            <p className="text-sm text-gray-300 text-center bg-gray-800 p-3 rounded-md">{question || 'Loading question...'}</p>
            <InputField label="Your Answer" type="text" value={answer} onChange={setAnswer} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <AuthButton text="Next" />
        </form>
    );
};

const ForgotStep3 = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-300">Final Step: Verification</h3>
            <div className="flex justify-center h-8 w-8 mx-auto"><SuccessIcon /></div>
            <p className="text-sm text-gray-400">Identity confirmed. A password reset request has been logged. An administrator will contact you via secure channels to complete the process.</p>
        </div>
    );
};


// --- Reusable UI Components ---
const InputField = ({ label, type, value, onChange, autoComplete }) => (
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

const AuthButton = ({ text, loadingText, status='idle', onClick }) => (
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
