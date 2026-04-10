'use client';

import { Microphone, MicrophoneFilled } from '@icons/index';
import { useCallback, useEffect } from 'react';
import { useVoiceRecorder } from '@/entities/Chat/model/lib/hooks/useVoiceRecorder/useVoiceRecorder';
import { VoiceFile } from '@/entities/Chat/model/types/chat.types/chat.types';

import cls from './VoiceRecorder.module.scss';

type Props = {
	onSendVoice: (file: VoiceFile) => void;
	disabled?: boolean;
};

export function VoiceRecorder({ onSendVoice, disabled }: Props) {
	const { startRecording, stopRecording, isRecording, audioFile, audioName } =
		useVoiceRecorder();

	const handlePointerDown = useCallback(() => {
		if (!disabled) {
			startRecording();
		}
	}, [disabled, startRecording]);

	useEffect(() => {
		if (!isRecording) {
			return;
		}

		const handlePointerUp = () => stopRecording();
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);

		return () => {
			window.removeEventListener('pointerup', handlePointerUp);
			window.removeEventListener('pointercancel', handlePointerUp);
		};
	}, [isRecording, stopRecording]);

	useEffect(() => {
		if (!audioFile || !audioName) {
			return;
		}
		onSendVoice({ data: audioFile, filename: audioName });
	}, [audioFile, audioName, onSendVoice]);

	return (
		<button
			type='button'
			onPointerDown={handlePointerDown}
			className={cls.button}
			aria-label='Начать запись голосового сообщения'
			disabled={disabled}
		>
			{isRecording ? (
				<MicrophoneFilled className={cls.icon} />
			) : (
				<Microphone className={cls.icon} />
			)}
		</button>
	);
}
