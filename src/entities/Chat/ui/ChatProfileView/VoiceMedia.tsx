import { useState, useRef, useEffect } from 'react';
import s from './ChatProfileView.module.scss';
import { VoiceIcon } from './ui/icons/VoiceIcon';

interface VoiceMediaProps {
	uid: string;
	url: string;
	name: string;
	createdAt: string;
	className?: string;
}

export const VoiceMedia = ({
	uid, // на будущее
	url,
	name,
	createdAt,
	className = ''
}: VoiceMediaProps) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentDuration, setCurrentDuration] = useState(0);

	const formatDuration = (seconds: number): string => {
		const min = Math.floor(seconds / 60);
		const sec = Math.floor(seconds % 60);
		return `${min}:${sec.toString().padStart(2, '0')}`;
	};

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
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
			if (audio.duration && isFinite(audio.duration)) {
				setCurrentDuration(Math.floor(audio.duration));
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
	}, []);

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
					<p className={s.name}>{name}</p>
					<p className={s.meta}>
						{formatDuration(currentDuration)} • {createdAt}
					</p>
				</div>
			</div>

			<audio ref={audioRef} src={url} preload='metadata' />
		</div>
	);
};
