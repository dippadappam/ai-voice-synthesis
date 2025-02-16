DEMO AND WALKTHROUGH

  https://drive.google.com/file/d/1R_bR_TxExDeaaM0l-Cn8eJL4iS2EO2S1/view
  
  https://drive.google.com/file/d/1ilj4OkYjcxuFbQr_MAlLjSc5_t5-egnr/view?usp=drive_link
  
  https://drive.google.com/file/d/1ilj4OkYjcxuFbQr_MAlLjSc5_t5-egnr/view?usp=drive_link

ALGORTIHM AND MATHEMATICAL FORMULATION:
# Text-to-Speech Transformation Algorithm and Mathematical Analysis

## Core Algorithm

### Input
- Text sequence T = {t₁, t₂, ..., tₙ}
- Emotion configuration E = {speed, pitch_shift, energy, top_db}

### Output 
- Processed audio signal y(t)

### Algorithm Steps

1. Text-to-Speech Generation
   ```
   x(t) = TTS(T) where x(t) is raw audio signal
   ```

2. Silence Trimming
   For signal x(t) with amplitude envelope e(t):
   ```
   e(t) = |x(t)|
   y(t) = x(t) * H(e(t) - top_db)
   ```
   where H(x) is Heaviside step function

3. Speed Adjustment (Time Stretching)
   Using Phase Vocoder algorithm:
   ```
   X(ω,t) = STFT(x(t))
   φ'(t,ω) = φ(t,ω) + ωΔt
   y(t) = ISTFT(|X(ω,t)|∠φ'(t,ω))
   ```
   where:
   - STFT is Short-time Fourier Transform
   - ISTFT is Inverse STFT
   - φ(t,ω) is instantaneous phase
   - Δt = 1/speed_ratio

4. Pitch Shifting
   For n semitones:
   ```
   y(t) = x(t * β)
   where β = 2^(n/12)
   ```

5. Energy Adjustment
   ```
   y(t) = α * x(t)
   where α is energy coefficient
   ```

6. Compression and Normalization
   ```
   y(t) = sign(x(t)) * |x(t)|^γ
   y(t) = y(t)/(max(|y(t)|) + ε)
   ```
   where:
   - γ = 0.8 (compression coefficient)
   - ε = 10⁻⁶ (normalization stability factor)

## Mathematical Formulation

### Complete Transform Function
The complete audio transformation can be expressed as:

F(x(t), E) = N(C(E(P(S(T(x(t)))))))

where:
- T: Trimming operator
- S: Speed adjustment operator
- P: Pitch shift operator
- E: Energy adjustment operator
- C: Compression operator
- N: Normalization operator

### Emotion-Specific Parameters
For each emotion e ∈ {youngwoman, oldman, youngmale}:

```
E_e = {
    speed: β_e,
    pitch_shift: n_e,
    energy: α_e,
    top_db: δ_e
}
```

### Final Output Signal
The final output signal y(t) for emotion e is:

y(t) = F(x(t), E_e)

## Implementation Constraints

1. Sampling Rate Preservation:
   ```
   sr_out = sr_in
   ```

2. Amplitude Bounds:
   ```
   -1 ≤ y(t) ≤ 1
   ```

3. Duration Constraint:
   ```
   T_out = T_in * (1/speed_ratio)
   ```

## Error Bounds

For numerical stability:
```
ε_norm = 10⁻⁶  // Normalization epsilon
ε_proc = 10⁻⁸  // Processing epsilon
```

# ai-voice-synthesis
=======
# Voice Studio: AI Voice Synthesis

Voice Studio is an innovative AI-powered text-to-speech (TTS) web application designed to address the limitations of existing TTS solutions. By focusing on a streamlined, single-view interface, multi-voice architecture, and intuitive audio controls, Voice Studio makes advanced voice synthesis accessible and efficient for a wide range of users—from content creators to individuals needing assistive technology.

## Problem Statement

Current text-to-speech solutions often suffer from:
- **Cluttered Interfaces:** Complex menus that reduce productivity.
- **Limited Voice Options:** Restrictive choices that do not cater to diverse user needs.
- **Inadequate Audio Controls:** Poor management of playback and review, hindering seamless content consumption.

## Key Features

- **Streamlined Interface:**  
  A single-view workspace that minimizes distractions, allowing users to focus on content creation and editing.

- **Multi-Voice Architecture:**  
  Supports multiple distinct voice profiles (e.g., Young Male, Young Woman, Old Man) to offer personalized and expressive voice synthesis.

- **Intuitive Audio Controls:**  
  Integrated play/pause, skip, and visual progress tracking ensure smooth and efficient audio review.

- **Robust Backend Infrastructure:**  
  Built using Flask with RESTful API endpoints, file management via UUID tracking, and automated resource cleanup to ensure reliable performance.

- **Advanced Audio Processing Pipeline:**  
  Utilizes the VITS model for high-quality voice synthesis, enhanced by emotion-specific configurations and audio processing libraries such as Librosa and SoundFile.

## Technical Architecture

- **Frontend:**  
  Developed with HTML, CSS, and JavaScript to deliver a responsive and user-friendly interface. Custom audio controls are implemented to provide play/pause, skip functionality, and real-time progress tracking.

- **Backend:**  
  A Flask-based server handles RESTful communication, TTS generation, and file management. The integration of TTS API and VITS model allows dynamic synthesis of audio from input text.

- **Audio Processing:**  
  The generated audio is processed using libraries like Librosa for time stretching, pitch shifting, and energy adjustments before being served to the client.

  

