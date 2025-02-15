from flask import Flask, render_template, request, jsonify, send_file
from TTS.api import TTS
import os
import uuid
import logging
import librosa
import librosa.effects
import soundfile as sf
from pathlib import Path
import numpy as np
import time

app = Flask(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Directory Setup
AUDIO_DIR = Path('static/audio')
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Enhanced Emotion Configuration
EMOTION_CONFIGS = {
    "youngwoman": {
        "voice": "p224",  # Young female voice, naturally higher pitched
        "speed": 1.04,
        "pitch_shift": 1.5,
        "energy": 1.35,
        "top_db": 25,  # More aggressive silence trimming
    },
    "oldman": {
        "voice": "p228",  # Female voice with softer qualities
        "speed": 0.82,
        "pitch_shift": -1.0,
        "energy": 0.9,
        "top_db": 20,
    },
    "youngmale": {
        "voice": "p229",  # Clear, professional female voice
        "speed": 0.98,
        "pitch_shift": 0,
        "energy": 1.0,
        "top_db": 23,
    }
}

# Model Initialization
try:
    tts = TTS("tts_models/en/vctk/vits", progress_bar=False)
    logger.info("Successfully loaded VITS model")
except Exception as e:
    logger.error(f"Model initialization failed: {e}")
    raise

# Get available speakers
try:
    if hasattr(tts, "speakers") and tts.speakers:
        AVAILABLE_SPEAKERS = tts.speakers
        DEFAULT_SPEAKER = AVAILABLE_SPEAKERS[0] if AVAILABLE_SPEAKERS else None
        logger.info(f"Available speakers: {AVAILABLE_SPEAKERS}")
        logger.info(f"Default speaker: {DEFAULT_SPEAKER}")
    else:
        AVAILABLE_SPEAKERS = []
        DEFAULT_SPEAKER = None
        logger.info("No speaker list available in model")
except Exception as e:
    logger.error(f"Error checking speakers: {e}")
    AVAILABLE_SPEAKERS = []
    DEFAULT_SPEAKER = None


def cleanup_old_files(directory: Path, max_age_hours: int = 1):
    """Cleanup audio files older than max_age_hours."""
    try:
        current_time = time.time()
        for file in directory.glob("*.wav"):
            if file.stem.startswith(('temp_', 'speech_')):
                file_age = current_time - file.stat().st_mtime
                if file_age > max_age_hours * 3600:
                    file.unlink()
    except Exception as e:
        logger.warning(f"File cleanup error: {e}")

def process_audio(audio: np.ndarray, sr: int, emotion: str) -> np.ndarray:
    """Enhanced audio processing with emotion-specific effects."""
    try:
        config = EMOTION_CONFIGS[emotion]
        
        # Trim silence with emotion-specific threshold
        audio, _ = librosa.effects.trim(audio, top_db=config["top_db"])
        
        # Apply speed adjustment
        if config["speed"] != 1.0:
            audio = librosa.effects.time_stretch(audio, rate=config["speed"])
        
        # Apply pitch shift
        if config["pitch_shift"] != 0:
            audio = librosa.effects.pitch_shift(audio, sr=sr, n_steps=config["pitch_shift"])
        
        # Apply energy adjustment
        audio = audio * config["energy"]
        
        # Final normalization with slight compression
        audio = np.sign(audio) * (np.abs(audio) ** 0.8)
        audio = audio / (np.max(np.abs(audio)) + 1e-6)
        
        return audio
    except Exception as e:
        logger.error(f"Audio processing error: {e}")
        return audio


def generate_speech(text: str, emotion: str) -> str:
    """Generate speech using emotion-specific configurations."""
    temp_file = AUDIO_DIR / f"temp_{uuid.uuid4()}.wav"
    final_file = AUDIO_DIR / f"speech_{uuid.uuid4()}.wav"
    
    try:
        config = EMOTION_CONFIGS[emotion]
        voice = config["voice"]
        
        if not voice or voice not in AVAILABLE_SPEAKERS:
            logger.warning(f"Voice {voice} not available, using default")
            voice = DEFAULT_SPEAKER
        
        # Generate speech with the selected voice
        generation_kwargs = {
            "text": text,
            "file_path": str(temp_file),
            "speaker": voice
        }
        
        tts.tts_to_file(**generation_kwargs)
        
        # Process the audio according to emotion
        audio, sr = librosa.load(str(temp_file), sr=None)
        audio = process_audio(audio, sr, emotion)
        
        # Save the processed audio
        sf.write(str(final_file), audio, sr)
        
        return str(final_file)
    
    except Exception as e:
        logger.error(f"Speech generation error: {e}")
        raise
    
    finally:
        if temp_file.exists():
            temp_file.unlink()

@app.route('/')
def home():
    return render_template('index.html')



@app.route('/generate', methods=['POST'])
def generate_speech_route():
    try:
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Expected JSON data'}), 400
        
        text = request.json.get('text', '').strip()
        emotion = request.json.get('emotion', 'youngmale').lower()
        
        if not text:
            return jsonify({'success': False, 'error': 'Text is required'}), 400
        if emotion not in EMOTION_CONFIGS:
            return jsonify({'success': False, 'error': f'Invalid emotion: {emotion}'}), 400
        
        cleanup_old_files(AUDIO_DIR)
        logger.info(f"Generating {emotion} speech for: {text[:100]}...")
        output_file = generate_speech(text, emotion)
        
        audio, sr = librosa.load(output_file, sr=None)
        duration = len(audio) / sr
        
        return jsonify({
            'success': True,
            'audio_file': output_file,
            'emotion': emotion,
            'duration': duration,
            'voice': EMOTION_CONFIGS[emotion]["voice"],
            'config': {k: v for k, v in EMOTION_CONFIGS[emotion].items() if k != 'voice'}
        })
    
    except Exception as e:
        logger.error(f"Speech generation failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    try:
        return send_file(
            AUDIO_DIR / filename,
            mimetype="audio/wav",
            as_attachment=False
        )
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': str(e)}), 404

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': tts is not None,
        'model_type': tts.model_name if hasattr(tts, 'model_name') else 'unknown',
        'emotion_configs': {k: v["voice"] for k, v in EMOTION_CONFIGS.items()},
        'available_speakers': AVAILABLE_SPEAKERS
    })

if __name__ == '__main__':
    if not tts:
        raise RuntimeError("TTS model failed to initialize")
    app.run(host='0.0.0.0', port=5001, debug=False)