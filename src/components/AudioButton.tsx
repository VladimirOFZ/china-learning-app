import { Volume2, VolumeX } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface AudioButtonProps {
  text: string;
  lang?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function AudioButton({ text, lang = 'zh-CN', size = 'md', label }: AudioButtonProps) {
  const { speak, stop, isSpeaking, supported } = useSpeech();

  if (!supported) return null;

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        isSpeaking ? stop() : speak(text, lang);
      }}
      className={`${sizes[size]} ${isSpeaking ? 'bg-crimson-600 text-white animate-glow' : 'bg-gold-500 hover:bg-gold-600 text-ink-900'} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95`}
      title={label || 'Озвучить'}
      aria-label={label || 'Озвучить'}
    >
      {isSpeaking ? <VolumeX size={iconSizes[size]} /> : <Volume2 size={iconSizes[size]} />}
    </button>
  );
}
