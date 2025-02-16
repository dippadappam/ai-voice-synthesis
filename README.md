DEMO AND WALKTHROUGH

  https://drive.google.com/file/d/1R_bR_TxExDeaaM0l-Cn8eJL4iS2EO2S1/view
  https://drive.google.com/file/d/1ilj4OkYjcxuFbQr_MAlLjSc5_t5-egnr/view?usp=drive_link
  https://drive.google.com/file/d/1ilj4OkYjcxuFbQr_MAlLjSc5_t5-egnr/view?usp=drive_link



<<<<<<< HEAD
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

  

