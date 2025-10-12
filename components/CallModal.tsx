import React, { useEffect, useRef } from 'react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswer: () => void;
  onReject: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isReceivingCall: boolean;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, onAnswer, onReject, localStream, remoteStream, isReceivingCall }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isReceivingCall ? 'Incoming Call' : 'Calling...'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">You</h3>
            <video ref={localVideoRef} autoPlay muted className="w-full h-48 bg-gray-800 rounded-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Remote</h3>
            <video ref={remoteVideoRef} autoPlay className="w-full h-48 bg-gray-800 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          {isReceivingCall ? (
            <>
              <button onClick={onAnswer} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-500">Answer</button>
              <button onClick={onReject} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500">Reject</button>
            </>
          ) : (
            <button onClick={onClose} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500">End Call</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;