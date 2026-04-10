'use client';

import { convertVoice } from '@/entities/Chat/api/convertVoice';
import { useRef, useState, useCallback } from 'react';

export const useVoiceRecorder = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioFile, setAudioFile] = useState<string | null>(null);
	const [audioName, setAudioName] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const streamRef = useRef<MediaStream | null>(null);
	const mimeType = 'audio/webm;codecs=opus';

	const startRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType,
				audioBitsPerSecond: 24000
			});

			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = e => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			mediaRecorder.start();
			setIsRecording(true);
		} catch (err) {
			console.error('Failed to start recording:', err);
			throw err;
		}
	}, []);

	const stopRecording = useCallback(() => {
		const mediaRecorder = mediaRecorderRef.current;
		const stream = streamRef.current;

		if (!mediaRecorder) {
			return;
		}

		mediaRecorder.onstop = async () => {
			const blob = new Blob(chunksRef.current, { type: mimeType });
			chunksRef.current = [];

			try {
				const result = await convertVoice(blob);
				setAudioFile(result.base64);
				setAudioName(result.filename);
			} catch (e) {
				console.error('Voice conversion error', e);
			}
		};

		mediaRecorder.stop();
		setIsRecording(false);

		// Останавливаем треки
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}
	}, []);

	const reset = useCallback(() => {
		setAudioFile(null);
		setAudioName(null);
	}, []);

	// Cleanup при анмаунте
	// useUnmount(() => {
	//   if (streamRef.current) {
	//     streamRef.current.getTracks().forEach(track => track.stop());
	//   }
	// });

	return {
		isRecording,
		audioFile,
		audioName,
		startRecording,
		stopRecording,
		reset
	};
};
