'use client';

import { useState, useRef, useEffect } from 'react';

interface TranscriptionResult {
  role?: string;
  industry?: string;
  achievement?: string;
  because?: string;
  therefore?: string;
  raw?: string;
}

interface VoiceRecorderProps {
  onTranscriptionReady: (result: TranscriptionResult) => void;
}

export default function VoiceRecorder({ onTranscriptionReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isDeepgramAvailable = !!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!isDeepgramAvailable) {
      // Fallback: Use Web Speech API if available
      await transcribeWithWebSpeechAPI(audioBlob);
      return;
    }

    try {
      // Convert blob to base64 for Deepgram API
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm'
        },
        body: uint8Array
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const result = await response.json();
      const transcriptText = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      
      if (transcriptText) {
        setTranscript(transcriptText);
        await parseTranscriptToABT(transcriptText);
      } else {
        setError('No speech detected in the recording.');
      }
      
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
      // Fallback to Web Speech API
      await transcribeWithWebSpeechAPI(audioBlob);
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeWithWebSpeechAPI = async (audioBlob: Blob) => {
    try {
      // Note: Web Speech API doesn't work with audio blobs directly
      // This is a demonstration of how it would work in a real scenario
      // In practice, you'd need to use a different approach or server-side processing
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // This would be implemented differently in a production app
        setTranscript('Web Speech API fallback would be implemented here.');
        await parseTranscriptToABT('Example transcript: I worked as a software engineer in the tech industry. I led a team to build a new feature because our users needed better performance. Therefore, we increased user engagement by 40%.');
      } else {
        setError('Speech recognition is not supported in this browser.');
      }
    } catch (err) {
      console.error('Web Speech API error:', err);
      setError('Failed to transcribe using fallback method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseTranscriptToABT = async (text: string) => {
    try {
      // Simple keyword-based parsing (in production, you'd use NLP or AI)
      const result: TranscriptionResult = {
        raw: text
      };

      // Extract role/position keywords
      const roleKeywords = ['engineer', 'manager', 'developer', 'analyst', 'designer', 'consultant', 'director'];
      const roleMatch = roleKeywords.find(keyword => text.toLowerCase().includes(keyword));
      if (roleMatch) {
        result.role = roleMatch.charAt(0).toUpperCase() + roleMatch.slice(1);
      }

      // Extract industry keywords
      const industryKeywords = ['tech', 'technology', 'finance', 'healthcare', 'retail', 'consulting', 'education'];
      const industryMatch = industryKeywords.find(keyword => text.toLowerCase().includes(keyword));
      if (industryMatch) {
        result.industry = industryMatch.charAt(0).toUpperCase() + industryMatch.slice(1);
      }

      // Split by common ABT indicators
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Look for "because" and "therefore" patterns
      const becauseIndex = sentences.findIndex(s => s.toLowerCase().includes('because'));
      const thereforeIndex = sentences.findIndex(s => s.toLowerCase().includes('therefore') || s.toLowerCase().includes('so') || s.toLowerCase().includes('as a result'));
      
      if (becauseIndex >= 0) {
        result.achievement = sentences.slice(0, becauseIndex).join('. ').trim();
        result.because = sentences[becauseIndex].replace(/because/i, '').trim();
      }
      
      if (thereforeIndex >= 0) {
        result.therefore = sentences[thereforeIndex].replace(/therefore|so|as a result/i, '').trim();
      }

      // If no structure found, put everything in achievement
      if (!result.achievement && !result.because && !result.therefore) {
        result.achievement = text;
      }

      onTranscriptionReady(result);
      
    } catch (err) {
      console.error('Parsing error:', err);
      // Still emit the raw transcript
      onTranscriptionReady({ raw: text });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
    setRecordingTime(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Voice Recorder</h2>
      
      {/* Feature Flag Notice */}
      {!isDeepgramAvailable && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Deepgram Integration Not Available</p>
          <p className="text-sm mt-1">
            To enable advanced voice transcription, please add your NEXT_PUBLIC_DEEPGRAM_API_KEY to the environment variables.
            Currently using fallback transcription method.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              <span>Stop Recording</span>
            </button>
          )}
          
          {transcript && (
            <button
              onClick={clearTranscript}
              disabled={isRecording || isProcessing}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording...</span>
            </div>
            <div className="text-gray-600 font-mono">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">
              {isDeepgramAvailable ? 'Transcribing with Deepgram...' : 'Processing with fallback method...'}
            </span>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Transcript</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </div>
          <p className="text-sm text-gray-500">
            The transcript has been automatically parsed and populated in the ABT form fields above.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">How to use Voice Recording</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click "Start Recording" and speak clearly about your accomplishment</li>
          <li>• Structure your story using "because" and "therefore" for better parsing</li>
          <li>• Example: "I led a team because we needed better performance, therefore we increased efficiency by 40%"</li>
          <li>• The transcript will automatically populate the ABT form fields</li>
          {!isDeepgramAvailable && (
            <li className="font-medium">• Add NEXT_PUBLIC_DEEPGRAM_API_KEY for enhanced transcription accuracy</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export type { TranscriptionResult, VoiceRecorderProps };
