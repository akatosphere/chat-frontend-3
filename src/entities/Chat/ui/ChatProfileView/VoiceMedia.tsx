import { useState, useRef, useEffect } from 'react';
import s from './ChatProfileView.module.scss';
import { VoiceIcon } from './ui/icons/VoiceIcon';

interface VoiceMediaProps {
	url: string;
	createdAt: string;
	duration?: number;
	className?: string;
}

export const VoiceMedia = ({
	url,
	createdAt,
	duration: propsDuration,
	className = ''
}: VoiceMediaProps) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(propsDuration || 0);

	const formatDuration = (sec: number): string => {
		const min = Math.floor(sec / 60);
		const secStr = Math.floor(sec % 60);
		return `${min}:${secStr.toString().padStart(2, '0')}`;
	};

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play().catch(err => {
				console.error('Failed to play audio:', err);
			});
		}
	};

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => setIsPlaying(false);

		const handleLoadedMetadata = () => {
			if (!propsDuration && audio.duration && isFinite(audio.duration)) {
				setDuration(Math.floor(audio.duration));
			}
		};

		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);

		return () => {
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
		};
	}, [propsDuration]);

	return (
		<div className={`${s.voiceMedia} ${className}`}>
			<div className={s.content}>
				<button
					className={s.iconButton}
					onClick={togglePlay}
					aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
				>
					<VoiceIcon playing={isPlaying} />
				</button>

				<div className={s.info}>
					<p className={s.name}>Голосовое сообщение</p>
					<p className={s.meta}>
						{formatDuration(duration)} • {createdAt}
					</p>
				</div>
			</div>

			<audio ref={audioRef} src={url} preload='metadata' />
		</div>
	);
};
