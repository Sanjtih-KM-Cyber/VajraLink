import React from 'react';
import { Threat, ThreatStatus } from '../../common/types';

interface ThreatDetailPanelProps {
  threat: Threat;
  onClose: () => void;
  onStatusChange: (id: number, newStatus: ThreatStatus) => void;
}

const ThreatDetailPanel: React.FC<ThreatDetailPanelProps> = ({ threat, onClose, onStatusChange }) => {
    
  const getStatusInfo = (status: ThreatStatus) => {
    switch (status) {
      case 'Pending': return { color: 'bg-red-500', text: 'Pending' };
      case 'Reviewing': return { color: 'bg-yellow-500', text: 'Reviewing' };
      case 'Mitigated': return { color: 'bg-green-500', text: 'Mitigated' };
      default: return { color: 'bg-gray-500', text: 'Unknown' };
    }
  };
  
  const statusInfo = getStatusInfo(threat.status);

  // FIX: Added optional `colSpan` prop to allow the component to span multiple grid columns, resolving a type error on usage.
  const InfoField: React.FC<{ label: string; value: string; valueClass?: string; colSpan?: number; }> = ({ label, value, valueClass, colSpan }) => (
      <div className={colSpan === 2 ? 'col-span-2' : ''}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
          <p className={`text-gray-200 mt-1 ${valueClass || ''}`}>{value}</p>
      </div>
  );

  const ContextualIntelligence: React.FC<{ threat: Threat }> = ({ threat }) => {
    const type = threat.type.toLowerCase();

    if (type.includes('duress')) {
        return (
            <div className="bg-gray-900 p-4 rounded-lg mt-4 border border-red-500/30">
                <h3 className="font-bold text-red-400 mb-3">Priority Intel: Duress Alert</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Last Known Coordinates" value="40.7128° N, 74.0060° W" />
                    <InfoField label="Confidence Radius" value="15 meters" />
                </div>
                <img src="https://storage.googleapis.com/aistudio-project-files/f1a5ba43-a67b-4835-961f-442b3112469d/map_nypd.png" alt="Map of last known location" className="rounded-md my-4 border-2 border-gray-700" />
                <h4 className="font-semibold text-gray-300 mb-2">Live Operative Vitals (Simulated)</h4>
                <div className="flex gap-4 text-sm">
                    <div className="flex-1 text-center bg-gray-800 p-2 rounded">
                        <span className="text-gray-400 block">Heart Rate</span>
                        <span className="font-bold text-lg text-red-400 animate-pulse-fast">135 BPM</span>
                    </div>
                     <div className="flex-1 text-center bg-gray-800 p-2 rounded">
                        <span className="text-gray-400 block">Stress Level</span>
                        <span className="font-bold text-lg text-red-400">CRITICAL</span>
                    </div>
                </div>
            </div>
        );
    }
    
    if (type.includes('phishing')) {
        return (
            <div className="bg-gray-900 p-4 rounded-lg mt-4 border border-yellow-500/30">
                <h3 className="font-bold text-yellow-400 mb-3">URL Analysis</h3>
                <InfoField label="Suspicious URL" value="http://vajralink-secure-auth.xyz/login" valueClass="font-mono text-sm break-all" />
                <div className="mt-4 p-3 bg-gray-800 rounded">
                    <h4 className="font-semibold text-gray-300 text-sm">Sandbox Detonation Report</h4>
                    <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
                        <li><span className="text-red-400">Malicious Script Detected:</span> `credential_harvester.js`</li>
                        <li><span className="text-yellow-400">Redirects To:</span> `192.168.1.10/capture.php`</li>
                        <li><span className="text-gray-300">Origin IP:</span> `104.21.5.192` (Cloudflare Proxy)</li>
                    </ul>
                </div>
            </div>
        )
    }

    if (type.includes('exfiltration')) {
        return (
            <div className="bg-gray-900 p-4 rounded-lg mt-4 border border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-3">Network Log Snippet</h3>
                <pre className="text-xs bg-black p-3 rounded-md text-gray-300 overflow-x-auto">
                    <code>
                        {`TIME: 2024-07-27 21:59:58\nSRC: 10.1.1.154 (op_device_7)\nDST: 203.0.113.25\nPROTO: TCP\nSPT: 54123 DPT: 443\nBYTES: 8452193\nACTION: FLAGGED (Unusual volume)`}
                    </code>
                </pre>
            </div>
        )
    }

    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-20"
        onClick={onClose}
      ></div>
      <div className="absolute top-0 right-0 h-full w-[450px] bg-gray-800 border-l-2 border-gray-700 z-30 shadow-2xl flex flex-col animate-slide-in">
        <header className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
                 <span className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${statusInfo.color}`}>{statusInfo.text}</span>
                 <p className="text-gray-400 text-sm">Threat ID: {threat.id}</p>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{threat.type}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Reported By" value={threat.reportedBy} valueClass="text-teal-400 font-semibold" />
            <InfoField label="Source" value={threat.source} />
            <InfoField label="Timestamp" value={threat.timestamp} colSpan={2}/>
          </div>
          <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h3>
              <p className="text-gray-300 bg-gray-900/50 p-3 mt-1 rounded-md text-sm border border-gray-700 whitespace-pre-wrap">{threat.details}</p>
          </div>

          <ContextualIntelligence threat={threat} />

        </main>
        
        <footer className="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
             <div className="flex justify-end space-x-3">
                {threat.status === 'Pending' && <button onClick={() => onStatusChange(threat.id, 'Reviewing')} className="px-4 py-2 text-sm font-semibold bg-yellow-600 hover:bg-yellow-500 rounded-md text-white">Acknowledge & Review</button>}
                {threat.status === 'Reviewing' && <button onClick={() => onStatusChange(threat.id, 'Mitigated')} className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-md text-white">Mark as Mitigated</button>}
                {threat.status === 'Mitigated' && <p className="text-sm text-green-400 font-semibold">Threat Mitigated</p>}
             </div>
        </footer>
      </div>
      <style>{`
        @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ThreatDetailPanel;
