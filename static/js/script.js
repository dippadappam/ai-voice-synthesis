document.addEventListener('DOMContentLoaded', function() {
    // Basic Elements
    const textInput = document.getElementById('text-input');
    const emotionSelect = document.getElementById('emotion');
    const generateBtn = document.getElementById('generate-btn');
    const audioPlayer = document.getElementById('audio-player');
    const loadingDiv = document.getElementById('loading');
    
    // Custom audio controls
    const playbackControl = document.querySelector('.playback-control');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const skipBackward = document.getElementById('skip-backward');
    const skipForward = document.getElementById('skip-forward');
    const downloadBtn = document.getElementById('download-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    
    // Text utilities
    const wordCounter = document.getElementById('word-counter');
    
    let currentAudioFile = null;
    let isDragging = false;

    // Word Counter Function
    function updateWordCount() {
        const text = textInput.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        wordCounter.textContent = `${wordCount} words`;
    }

    textInput.addEventListener('input', updateWordCount);
    updateWordCount();

    // Format time in seconds to MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Play/Pause Control
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Skip Controls
    skipBackward.addEventListener('click', () => {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
    });

    skipForward.addEventListener('click', () => {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
    });

    // Progress bar interaction
    progressBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateProgress(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgress(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function updateProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
        progress.style.width = percent * 100 + '%';
        audioPlayer.currentTime = percent * audioPlayer.duration;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }

    // Audio event listeners
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = percent + '%';
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', () => {
        progress.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        generateBtn.disabled = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    audioPlayer.addEventListener('play', () => {
        generateBtn.disabled = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    audioPlayer.addEventListener('pause', () => {
        generateBtn.disabled = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    function updateButtonStates(isGenerating) {
        generateBtn.disabled = isGenerating;
        generateBtn.innerHTML = isGenerating ? 
            '<i class="fas fa-spinner fa-spin"></i> Generating...' : 
            '<i class="fas fa-microphone"></i> Generate';
        loadingDiv.style.display = isGenerating ? 'block' : 'none';
    }

    function handleError(error) {
        console.error('Error:', error);
        alert('Error generating speech: ' + error);
        updateButtonStates(false);
    }

    function updateEmotionStyle(emotion) {
        const colors = {
            'youngwoman': '#FFD700',
            'oldman': '#4169E1',
            'youngmale': '#4CAF50'
        };
        generateBtn.style.backgroundColor = colors[emotion] || '#808080';
        if (emotion === 'youngwoman') {
            generateBtn.classList.add('pulse-animation');
        } else {
            generateBtn.classList.remove('pulse-animation');
        }
    }

    generateBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text');
            return;
        }

        updateButtonStates(true);
        playbackControl.style.display = 'none';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    emotion: emotionSelect.value,
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if (data.success) {
                if (currentAudioFile) {
                    URL.revokeObjectURL(currentAudioFile);
                }

                const audioUrl = '/' + data.audio_file;
                audioPlayer.src = audioUrl;
                currentAudioFile = audioUrl;
                
                // Show playback controls and reset UI
                playbackControl.style.display = 'flex';
                progress.style.width = '0%';
                currentTimeEl.textContent = '0:00';
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

                updateEmotionStyle(data.emotion);
                
                // Setup download functionality
                downloadBtn.onclick = function() {
                    const a = document.createElement('a');
                    a.href = audioUrl;
                    a.download = `${data.emotion}_speech_${Date.now()}.wav`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };

                audioPlayer.play();
            } else {
                handleError(data.error);
            }
        } catch (error) {
            handleError(error);
        } finally {
            updateButtonStates(false);
        }
    });

    emotionSelect.addEventListener('change', function() {
        updateEmotionStyle(this.value);
    });

    // Initial emotion style setup
    updateEmotionStyle(emotionSelect.value);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent shortcut actions if the user is typing in an input or editable element
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        // Ctrl/Cmd + Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!generateBtn.disabled) {
                generateBtn.click();
            }
            e.preventDefault();
        }
        
        // Spacebar to play/pause when audio exists
        if (e.code === 'Space' && currentAudioFile) {
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
            e.preventDefault();
        }

        // Left/Right arrow keys for seeking
        if (currentAudioFile && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            const seekAmount = e.key === 'ArrowLeft' ? -5 : 5;
            audioPlayer.currentTime = Math.max(0, Math.min(audioPlayer.duration, audioPlayer.currentTime + seekAmount));
            e.preventDefault();
        }
    });
});
