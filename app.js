/**
 * Happy Birthday Celebration Application Logic
 * Features:
 * 1. Golden Sparklers (Phuljhadi cursor/touch trail) & Fireworks Canvas
 * 2. Floating Balloons with realistic pop sounds & celebratory toasts
 * 3. 5-6 Photos Gallery with batch upload, individual replace & Lightbox
 * 4. Custom Music Hub (Upload MP3 + Web Audio Synthesizer fallback)
 * 5. Interactive 3D Cake Ceremony (Blow candles with smoke + Knife slice)
 * 6. Birthday Wishes Card & Envelope with strict 200-word limit validation & presets
 * 7. Surprise Mystery Gift Box & Personalization
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. STATE & STORAGE
    // =========================================================================
    const DEFAULT_PHOTOS = [
        {
            id: 1,
            title: 'Radiant Smile',
            caption: 'A smile that lights up the world and brings warmth to every heart.',
            date: 'Precious Memory #1',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 2,
            title: 'Pure Joy & Laughter',
            caption: 'Unfiltered happiness, endless giggles, and moments to treasure forever.',
            date: 'Precious Memory #2',
            url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 3,
            title: 'Dream Big & Shine',
            caption: 'Always aiming high and spreading positive energy wherever you go.',
            date: 'Precious Memory #3',
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 4,
            title: 'Golden Celebrations',
            caption: 'Sparkling lights, sweet treats, and memories woven with golden threads.',
            date: 'Precious Memory #4',
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 5,
            title: 'True Friendship',
            caption: 'Blessed to have a soul as genuine, caring, and loving as you.',
            date: 'Precious Memory #5',
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 6,
            title: 'Magical Moments',
            caption: 'Here is to another incredible year filled with peace, love, and wonder!',
            date: 'Precious Memory #6',
            url: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=600&q=80'
        }
    ];

    const DEFAULT_WISH = `On this truly blessed day, I wish you a universe filled with infinite happiness, radiant smiles, good health, and glorious success!

ख्वाहिशों के समंदर के सब मोती तेरे नसीब हों,
तेरे अपने हमेशा तेरे करीब हों,
कुछ यूँ मिले जले ये साल तुम्हारा,
कि हर दुआ तुम्हारी उसी वक्त मंजूर हो।

May every path you walk lead to beautiful adventures, true friendships, and profound peace of mind. Keep shining bright like the star you are! Happy Birthday! 🎂✨💖`;

    const appState = {
        name: localStorage.getItem('bday_name') || 'Priya',
        ageTag: localStorage.getItem('bday_tag') || "Today's Special Celebration!",
        mainPhotoUrl: localStorage.getItem('bday_main_photo') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        senderName: localStorage.getItem('bday_sender') || 'Forever Your Best Friend ❤️',
        wishText: localStorage.getItem('bday_wish_text') || DEFAULT_WISH,
        photos: JSON.parse(localStorage.getItem('bday_photos')) || DEFAULT_PHOTOS,
        
        // Active feature toggles
        fireworksActive: true,
        sparklerActive: true,
        discoActive: false,
        isPlayingMusic: false,
        currentTrackType: 'synthesizer', // 'synthesizer', 'upbeat', 'party', 'custom'
        customAudioUrl: null,
        
        // Ceremony state
        cakeSliced: false,
        poppedBalloonsCount: 0,
        activeLightboxIndex: 0,
        isEnvelopeOpen: false
    };

    // =========================================================================
    // 2. WEB AUDIO API & SOUND FX GENERATOR
    // =========================================================================
    let audioCtx = null;
    let audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    let synthTimer = null;
    let analyser = null;

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, duration, type = 'sine', gainVal = 0.3) {
        try {
            initAudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log("Audio not allowed yet:", e);
        }
    }

    // Balloon Pop Sound FX
    function playPopSound() {
        try {
            initAudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(280, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.09);
            gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.09);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.09);
        } catch (e) {}
    }

    // Candle Blow Out Sound (Air whoosh)
    function playBlowSound() {
        try {
            initAudioContext();
            const bufferSize = audioCtx.sampleRate * 0.45;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const whiteNoise = audioCtx.createBufferSource();
            whiteNoise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, audioCtx.currentTime);
            filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.45);
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            whiteNoise.start();
        } catch (e) {}
    }

    // Fanfare / Celebration Trumpet Sound
    function playFanfareSound() {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                playTone(freq, 0.45, 'triangle', 0.4);
            }, idx * 110);
        });
    }

    // Happy Birthday Synthesizer Melody
    const birthdayMelodyNotes = [
        { note: 261.63, duration: 0.35 }, { note: 261.63, duration: 0.25 },
        { note: 293.66, duration: 0.6 },  { note: 261.63, duration: 0.6 },
        { note: 349.23, duration: 0.6 },  { note: 329.63, duration: 1.0 },

        { note: 261.63, duration: 0.35 }, { note: 261.63, duration: 0.25 },
        { note: 293.66, duration: 0.6 },  { note: 261.63, duration: 0.6 },
        { note: 392.00, duration: 0.6 },  { note: 349.23, duration: 1.0 },

        { note: 261.63, duration: 0.35 }, { note: 261.63, duration: 0.25 },
        { note: 523.25, duration: 0.6 },  { note: 440.00, duration: 0.6 },
        { note: 349.23, duration: 0.6 },  { note: 329.63, duration: 0.6 },
        { note: 293.66, duration: 0.8 },

        { note: 466.16, duration: 0.35 }, { note: 466.16, duration: 0.25 },
        { note: 440.00, duration: 0.6 },  { note: 349.23, duration: 0.6 },
        { note: 392.00, duration: 0.6 },  { note: 349.23, duration: 1.2 }
    ];

    let synthNoteIdx = 0;
    function startMelodySynthesizer() {
        stopAudioTrack();
        initAudioContext();
        appState.isPlayingMusic = true;
        updatePlayerUI('Birthday Synthesizer Melody', 'Built-in Joyful Audio');

        function playNextSynthNote() {
            if (!appState.isPlayingMusic) return;
            const current = birthdayMelodyNotes[synthNoteIdx];
            playTone(current.note, current.duration, 'sine', 0.35);
            synthNoteIdx = (synthNoteIdx + 1) % birthdayMelodyNotes.length;
            synthTimer = setTimeout(playNextSynthNote, current.duration * 750);
        }
        playNextSynthNote();
    }

    function stopSynthMelody() {
        if (synthTimer) {
            clearTimeout(synthTimer);
            synthTimer = null;
        }
    }

    function stopAudioTrack() {
        stopSynthMelody();
        audioElement.pause();
        audioElement.currentTime = 0;
        appState.isPlayingMusic = false;
        document.getElementById('playPauseBtn').textContent = '▶️';
        document.getElementById('trackDisk').classList.remove('spinning');
    }

    function togglePlayPause() {
        initAudioContext();
        if (appState.isPlayingMusic) {
            stopAudioTrack();
        } else {
            if (appState.currentTrackType === 'synthesizer') {
                startMelodySynthesizer();
            } else if (audioElement.src) {
                audioElement.play().then(() => {
                    appState.isPlayingMusic = true;
                    document.getElementById('playPauseBtn').textContent = '⏸️';
                    document.getElementById('trackDisk').classList.add('spinning');
                }).catch(() => startMelodySynthesizer());
            } else {
                startMelodySynthesizer();
            }
        }
    }

    function updatePlayerUI(title, artist) {
        document.getElementById('currentTrackTitle').textContent = title;
        document.getElementById('currentTrackArtist').textContent = artist;
        document.getElementById('playPauseBtn').textContent = appState.isPlayingMusic ? '⏸️' : '▶️';
        if (appState.isPlayingMusic) {
            document.getElementById('trackDisk').classList.add('spinning');
        } else {
            document.getElementById('trackDisk').classList.remove('spinning');
        }
    }

    // Music Player Event Listeners
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const customAudioInput = document.getElementById('customAudioInput');
    const presetSongSelect = document.getElementById('presetSongSelect');
    const seekSlider = document.getElementById('seekSlider');

    playPauseBtn.addEventListener('click', togglePlayPause);
    volumeSlider.addEventListener('input', (e) => {
        audioElement.volume = e.target.value;
    });

    // Custom MP3 Upload Handler ("apni choice se song add karske")
    customAudioInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            initAudioContext();
            const objectUrl = URL.createObjectURL(file);
            appState.customAudioUrl = objectUrl;
            audioElement.src = objectUrl;
            appState.currentTrackType = 'custom';

            const customOpt = presetSongSelect.querySelector('option[value="custom"]');
            customOpt.disabled = false;
            customOpt.textContent = `📁 ${file.name}`;
            presetSongSelect.value = 'custom';

            stopSynthMelody();
            audioElement.play().then(() => {
                appState.isPlayingMusic = true;
                updatePlayerUI(file.name, 'Uploaded Custom Audio');
                showToast(`🎵 Now playing: ${file.name}`);
            }).catch(err => {
                console.log(err);
                showToast(`Loaded: ${file.name}. Hit Play!`);
            });
        }
    });

    presetSongSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        appState.currentTrackType = val;
        if (val === 'synthesizer') {
            startMelodySynthesizer();
        } else if (val === 'upbeat') {
            stopSynthMelody();
            audioElement.src = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8d8bfa4.mp3?filename=happy-birthday-111003.mp3';
            audioElement.play().then(() => {
                appState.isPlayingMusic = true;
                updatePlayerUI('Upbeat Birthday Tune', 'Pixabay Music');
            }).catch(() => startMelodySynthesizer());
        } else if (val === 'party') {
            stopSynthMelody();
            audioElement.src = 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_65db39f60f.mp3?filename=celebration-15243.mp3';
            audioElement.play().then(() => {
                appState.isPlayingMusic = true;
                updatePlayerUI('Rocking Party Anthem', 'Celebration Music');
            }).catch(() => startMelodySynthesizer());
        } else if (val === 'custom' && appState.customAudioUrl) {
            stopSynthMelody();
            audioElement.src = appState.customAudioUrl;
            audioElement.play().then(() => {
                appState.isPlayingMusic = true;
                updatePlayerUI('Custom Song Track', 'User MP3');
            });
        }
    });

    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const pct = (audioElement.currentTime / audioElement.duration) * 100;
            seekSlider.value = pct;
            document.getElementById('currentTime').textContent = formatTime(audioElement.currentTime);
            document.getElementById('totalDuration').textContent = formatTime(audioElement.duration);
        }
    });

    seekSlider.addEventListener('input', (e) => {
        if (audioElement.duration) {
            audioElement.currentTime = (e.target.value / 100) * audioElement.duration;
        }
    });

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // =========================================================================
    // 3. GOLDEN SPARKLER (PHULJHADI) CURSOR/TOUCH CANVAS SYSTEM
    // =========================================================================
    const sparklerCanvas = document.getElementById('sparklerCanvas');
    const spCtx = sparklerCanvas.getContext('2d');
    let sparklerParticles = [];

    class SparklerEmber {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.5 + 1.2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 2.8 + 1.2;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.02;
            this.color = Math.random() < 0.7 ? '#ffd700' : (Math.random() < 0.5 ? '#fff' : '#ff9900');
            this.gravity = 0.08;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.alpha -= this.decay;
        }

        draw() {
            spCtx.save();
            spCtx.globalAlpha = Math.max(0, this.alpha);
            spCtx.fillStyle = this.color;
            spCtx.shadowColor = '#ffd700';
            spCtx.shadowBlur = 10;
            spCtx.beginPath();
            spCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            spCtx.fill();
            spCtx.restore();
        }
    }

    function spawnSparklerEmbers(x, y, count = 5) {
        if (!appState.sparklerActive) return;
        for (let i = 0; i < count; i++) {
            sparklerParticles.push(new SparklerEmber(x, y));
        }
    }

    window.addEventListener('mousemove', (e) => {
        spawnSparklerEmbers(e.clientX, e.clientY, 4);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            spawnSparklerEmbers(e.touches[0].clientX, e.touches[0].clientY, 5);
        }
    }, { passive: true });

    function renderSparklers() {
        spCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);
        for (let i = sparklerParticles.length - 1; i >= 0; i--) {
            const p = sparklerParticles[i];
            p.update();
            p.draw();
            if (p.alpha <= 0) {
                sparklerParticles.splice(i, 1);
            }
        }
        requestAnimationFrame(renderSparklers);
    }
    renderSparklers();

    const toggleSparklerBtn = document.getElementById('toggleSparklerBtn');
    const sparklerStatusText = document.getElementById('sparklerStatusText');
    toggleSparklerBtn.addEventListener('click', () => {
        appState.sparklerActive = !appState.sparklerActive;
        sparklerStatusText.textContent = `✨ Sparkler: ${appState.sparklerActive ? 'ON' : 'OFF'}`;
        showToast(appState.sparklerActive ? '✨ Golden Sparklers Enabled!' : 'Sparklers Paused');
    });

    // =========================================================================
    // 4. FIREWORKS CANVAS SYSTEM
    // =========================================================================
    const fireworksCanvas = document.getElementById('fireworksCanvas');
    const fwCtx = fireworksCanvas.getContext('2d');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confCtx = confettiCanvas.getContext('2d');
    const audioVisualizerCanvas = document.getElementById('audioVisualizerCanvas');
    const visCtx = audioVisualizerCanvas.getContext('2d');

    let fwParticles = [];
    let fwRockets = [];
    let confettiPieces = [];
    const celebrationColors = ['#ff007f', '#00f0ff', '#ffd700', '#9d4edd', '#ff4d4d', '#00ff88', '#ffffff', '#ff9900'];

    function resizeCanvases() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        sparklerCanvas.width = window.innerWidth;
        sparklerCanvas.height = window.innerHeight;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        audioVisualizerCanvas.width = window.innerWidth;
        audioVisualizerCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    class Rocket {
        constructor(x, y, targetY, color) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.color = color;
            this.speed = 9 + Math.random() * 4;
            this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.exploded = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.vy < 0 && this.y <= this.targetY) {
                this.exploded = true;
                createFireworksExplosion(this.x, this.y, this.color);
            }
        }

        draw() {
            fwCtx.save();
            fwCtx.strokeStyle = this.color;
            fwCtx.lineWidth = 3;
            fwCtx.beginPath();
            fwCtx.moveTo(this.x, this.y);
            fwCtx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
            fwCtx.stroke();
            fwCtx.restore();
        }
    }

    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6.5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.12;
            this.friction = 0.96;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.size = Math.random() * 3.5 + 1.5;
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            fwCtx.save();
            fwCtx.globalAlpha = Math.max(0, this.alpha);
            fwCtx.fillStyle = this.color;
            fwCtx.shadowBlur = 10;
            fwCtx.shadowColor = this.color;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fwCtx.fill();
            fwCtx.restore();
        }
    }

    function createFireworksExplosion(x, y, color) {
        const count = 70 + Math.floor(Math.random() * 50);
        for (let i = 0; i < count; i++) {
            fwParticles.push(new FireworkParticle(x, y, color || celebrationColors[Math.floor(Math.random() * celebrationColors.length)]));
        }
        playTone(150 + Math.random() * 100, 0.15, 'sawtooth', 0.12);
    }

    function launchRocket(x, y) {
        const startX = x || Math.random() * fireworksCanvas.width;
        const startY = fireworksCanvas.height;
        const targetY = y || Math.random() * (fireworksCanvas.height * 0.5) + 80;
        const color = celebrationColors[Math.floor(Math.random() * celebrationColors.length)];
        fwRockets.push(new Rocket(startX, startY, targetY, color));
    }

    // Auto Fireworks loop
    setInterval(() => {
        if (appState.fireworksActive && Math.random() < 0.6) {
            launchRocket();
        }
    }, 1200);

    // Launch firework on clicking fireworks canvas
    fireworksCanvas.addEventListener('click', (e) => {
        launchRocket(e.clientX, e.clientY);
    });

    function renderFireworks() {
        fwCtx.fillStyle = 'rgba(7, 6, 17, 0.28)';
        fwCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        for (let i = fwRockets.length - 1; i >= 0; i--) {
            fwRockets[i].update();
            fwRockets[i].draw();
            if (fwRockets[i].exploded) {
                fwRockets.splice(i, 1);
            }
        }

        for (let i = fwParticles.length - 1; i >= 0; i--) {
            fwParticles[i].update();
            fwParticles[i].draw();
            if (fwParticles[i].alpha <= 0) {
                fwParticles.splice(i, 1);
            }
        }

        requestAnimationFrame(renderFireworks);
    }
    renderFireworks();

    const toggleFireworksBtn = document.getElementById('toggleFireworksBtn');
    const fireworksStatusText = document.getElementById('fireworksStatusText');
    toggleFireworksBtn.addEventListener('click', () => {
        appState.fireworksActive = !appState.fireworksActive;
        fireworksStatusText.textContent = `🎆 Fireworks: ${appState.fireworksActive ? 'ON' : 'OFF'}`;
        showToast(appState.fireworksActive ? '🎆 Fireworks Show ON!' : 'Fireworks Paused');
    });

    // Confetti Explosion Engine
    function triggerConfettiBurst() {
        confettiPieces = [];
        for (let i = 0; i < 160; i++) {
            confettiPieces.push({
                x: Math.random() * confettiCanvas.width,
                y: -20,
                size: Math.random() * 11 + 6,
                color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 5 + 3.5,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12
            });
        }
    }

    function renderConfetti() {
        confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let i = confettiPieces.length - 1; i >= 0; i--) {
            const p = confettiPieces[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            confCtx.save();
            confCtx.translate(p.x, p.y);
            confCtx.rotate((p.rotation * Math.PI) / 180);
            confCtx.fillStyle = p.color;
            confCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            confCtx.restore();

            if (p.y > confettiCanvas.height) {
                confettiPieces.splice(i, 1);
            }
        }
        requestAnimationFrame(renderConfetti);
    }
    renderConfetti();

    // =========================================================================
    // 5. FLOATING BALLOONS SYSTEM & POP SOUNDS
    // =========================================================================
    const balloonsContainer = document.getElementById('balloonsContainer');
    const balloonColors = ['#ff007f', '#00f0ff', '#ffd700', '#9d4edd', '#ff4d4d', '#00ff88', '#ff9900'];
    const popMessages = [
        "You are amazing! 💖",
        "May all your dreams come true! ✨",
        "Lots of love & hugs! 🌸",
        "Best year ahead! 🥳",
        "Keep shining like a star! ⭐",
        "Infinite smiles today! 😊",
        "Sweetest soul ever! 🍰"
    ];

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon-el';
        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        balloon.style.backgroundColor = color;
        balloon.style.left = `${Math.random() * 90 + 5}vw`;
        const size = Math.random() * 22 + 55;
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.25}px`;
        balloon.style.animationDuration = `${Math.random() * 5 + 8}s`;

        const string = document.createElement('div');
        string.className = 'balloon-string';
        balloon.appendChild(string);

        balloon.addEventListener('click', (e) => {
            e.stopPropagation();
            playPopSound();
            createFireworksExplosion(e.clientX, e.clientY, color);
            appState.poppedBalloonsCount++;
            document.getElementById('popCountDisplay').textContent = `${appState.poppedBalloonsCount} Popped! 🎉`;
            
            const randomMsg = popMessages[Math.floor(Math.random() * popMessages.length)];
            showToast(`🎈 POP! ${randomMsg}`);
            balloon.remove();
        });

        balloonsContainer.appendChild(balloon);

        setTimeout(() => {
            if (balloon.parentNode) balloon.remove();
        }, 14000);
    }

    // Auto spawn loop
    setInterval(() => {
        if (balloonsContainer.children.length < 22) {
            createBalloon();
        }
    }, 1400);

    // Release batch of balloons
    const spawnBalloonsBtn = document.getElementById('spawnBalloonsBtn');
    spawnBalloonsBtn.addEventListener('click', () => {
        for (let i = 0; i < 20; i++) {
            setTimeout(createBalloon, i * 110);
        }
        showToast('🎈 Released 20 Balloons! Tap them to pop!');
    });

    // =========================================================================
    // 6. INTERACTIVE 3D CAKE CEREMONY
    // =========================================================================
    const candles = document.querySelectorAll('.candle');
    const flames = document.querySelectorAll('.flame');
    const statusText = document.getElementById('statusText');
    const cakeSliceCut = document.getElementById('cakeSliceCut');
    const knifeTool = document.getElementById('knifeTool');

    candles.forEach((candle) => {
        candle.addEventListener('click', () => {
            const flame = candle.querySelector('.flame');
            const smoke = candle.querySelector('.smoke-puff');
            const isLit = flame.classList.contains('lit');

            if (isLit) {
                flame.classList.remove('lit');
                smoke.classList.add('puffing');
                playBlowSound();
                setTimeout(() => smoke.classList.remove('puffing'), 1200);
            } else {
                flame.classList.add('lit');
                playTone(600, 0.2, 'sine', 0.2);
            }
            checkCandlesState();
        });
    });

    function checkCandlesState() {
        let litCount = 0;
        flames.forEach(f => { if (f.classList.contains('lit')) litCount++; });

        if (litCount === 5) {
            statusText.textContent = 'Step 1: Candles are glowing! Click "Blow Candles" to make your wish.';
        } else if (litCount === 0) {
            statusText.textContent = 'Step 2: Wishes made! Now click "Cut Cake Slice" to celebrate! 🔪';
        } else {
            statusText.textContent = `Keep going! (${litCount}/5 candles lit)`;
        }
    }

    document.getElementById('lightAllCandlesBtn').addEventListener('click', () => {
        flames.forEach(f => f.classList.add('lit'));
        playTone(650, 0.25, 'sine', 0.25);
        checkCandlesState();
    });

    document.getElementById('blowCandlesBtn').addEventListener('click', () => {
        playBlowSound();
        flames.forEach(f => {
            f.classList.remove('lit');
            const smoke = f.parentElement.querySelector('.smoke-puff');
            if (smoke) {
                smoke.classList.add('puffing');
                setTimeout(() => smoke.classList.remove('puffing'), 1200);
            }
        });
        checkCandlesState();
        showToast('💨 Candles blown! Make a silent wish! 🌟');
    });

    document.getElementById('cutSliceBtn').addEventListener('click', () => {
        if (appState.cakeSliced) return;
        appState.cakeSliced = true;
        knifeTool.classList.add('cutting');

        setTimeout(() => {
            cakeSliceCut.classList.add('sliced');
            playFanfareSound();
            triggerConfettiBurst();
            statusText.textContent = '🎉 Happy Birthday! Cake cut! Enjoy the sweetest celebration!';
            knifeTool.classList.remove('cutting');

            for (let i = 0; i < 10; i++) {
                setTimeout(() => launchRocket(), i * 180);
            }
            showToast('🍰 Cake is sliced! Happy Birthday!');
        }, 1200);
    });

    document.getElementById('resetCakeBtn').addEventListener('click', () => {
        appState.cakeSliced = false;
        cakeSliceCut.classList.remove('sliced');
        flames.forEach(f => f.classList.add('lit'));
        checkCandlesState();
    });

    document.getElementById('startCakeCeremonyBtn').addEventListener('click', () => {
        document.getElementById('cakeStageSection').scrollIntoView({ behavior: 'smooth' });
    });

    // =========================================================================
    // 7. PROPER 5-6 PHOTO GALLERY & LIGHTBOX
    // =========================================================================
    const polaroidGrid = document.getElementById('polaroidGrid');
    const photoLightboxModal = document.getElementById('photoLightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeLightboxBtn = document.getElementById('closeLightboxBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    const lightboxReplaceInput = document.getElementById('lightboxReplaceInput');
    const batchGalleryUpload = document.getElementById('batchGalleryUpload');
    const resetDefaultPhotosBtn = document.getElementById('resetDefaultPhotosBtn');

    function renderPhotoGallery() {
        polaroidGrid.innerHTML = '';
        appState.photos.forEach((photo, idx) => {
            const card = document.createElement('div');
            card.className = 'polaroid-card';
            card.innerHTML = `
                <div class="polaroid-photo-wrap">
                    <img src="${photo.url}" alt="${photo.title}">
                    <span class="polaroid-replace-badge">📷 Click to View / Edit</span>
                </div>
                <div class="polaroid-caption">
                    <div class="caption-title">${photo.title}</div>
                    <span class="caption-date">${photo.date}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                openLightbox(idx);
            });

            polaroidGrid.appendChild(card);
        });
    }

    function openLightbox(index) {
        appState.activeLightboxIndex = index;
        const current = appState.photos[index];
        lightboxImg.src = current.url;
        lightboxTitle.textContent = current.title;
        lightboxCaption.textContent = current.caption;
        photoLightboxModal.classList.add('active');
    }

    closeLightboxBtn.addEventListener('click', () => photoLightboxModal.classList.remove('active'));

    lightboxPrevBtn.addEventListener('click', () => {
        let prevIdx = appState.activeLightboxIndex - 1;
        if (prevIdx < 0) prevIdx = appState.photos.length - 1;
        openLightbox(prevIdx);
    });

    lightboxNextBtn.addEventListener('click', () => {
        let nextIdx = (appState.activeLightboxIndex + 1) % appState.photos.length;
        openLightbox(nextIdx);
    });

    // Replace photo inside Lightbox
    lightboxReplaceInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                appState.photos[appState.activeLightboxIndex].url = event.target.result;
                localStorage.setItem('bday_photos', JSON.stringify(appState.photos));
                lightboxImg.src = event.target.result;
                renderPhotoGallery();
                showToast(`📷 Photo #${appState.activeLightboxIndex + 1} updated!`);
            };
            reader.readAsDataURL(file);
        }
    });

    // Batch Upload 6 Photos at once ("proper 5-6 pic daal sake")
    batchGalleryUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).slice(0, 6);
        if (files.length === 0) return;

        let loadedCount = 0;
        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (appState.photos[idx]) {
                    appState.photos[idx].url = event.target.result;
                    appState.photos[idx].title = `Memory Photo #${idx + 1}`;
                }
                loadedCount++;
                if (loadedCount === files.length) {
                    localStorage.setItem('bday_photos', JSON.stringify(appState.photos));
                    renderPhotoGallery();
                    showToast(`✨ Successfully uploaded ${loadedCount} photos!`);
                    triggerConfettiBurst();
                }
            };
            reader.readAsDataURL(file);
        });
    });

    // Reset default photos
    resetDefaultPhotosBtn.addEventListener('click', () => {
        appState.photos = JSON.parse(JSON.stringify(DEFAULT_PHOTOS));
        localStorage.setItem('bday_photos', JSON.stringify(appState.photos));
        renderPhotoGallery();
        showToast('↺ Restored sample celebratory photos');
    });

    document.getElementById('jumpToGalleryBtn').addEventListener('click', () => {
        document.getElementById('gallerySection').scrollIntoView({ behavior: 'smooth' });
    });

    // =========================================================================
    // 8. BIRTHDAY WISHES CARD (ENVELOPE & STRICT 200 WORDS LIMIT ENFORCEMENT)
    // =========================================================================
    const envelopeBox = document.getElementById('envelopeBox');
    const waxSeal = document.getElementById('waxSeal');
    const letterBodyText = document.getElementById('letterBodyText');
    const displayWordCount = document.getElementById('displayWordCount');
    const letterRecipientName = document.getElementById('letterRecipientName');
    const letterSenderName = document.getElementById('letterSenderName');
    const replayLetterTypewriterBtn = document.getElementById('replayLetterTypewriterBtn');
    
    // Modal & Inputs
    const wishesEditorModal = document.getElementById('wishesEditorModal');
    const openEditWishesModalBtn = document.getElementById('openEditWishesModalBtn');
    const closeWishesEditorModal = document.getElementById('closeWishesEditorModal');
    const cancelWishEditorBtn = document.getElementById('cancelWishEditorBtn');
    const saveWishEditorBtn = document.getElementById('saveWishEditorBtn');
    const wishRecipientInput = document.getElementById('wishRecipientInput');
    const wishSenderInput = document.getElementById('wishSenderInput');
    const wishTextInput = document.getElementById('wishTextInput');
    const modalLiveWordCounter = document.getElementById('modalLiveWordCounter');
    const remainingWordsCount = document.getElementById('remainingWordsCount');
    const wordLimitWarningText = document.getElementById('wordLimitWarningText');

    // Word counter helper
    function countWords(str) {
        if (!str || str.trim().length === 0) return 0;
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    // Typewriter effect function
    let typewriterTimeout = null;
    function playTypewriterEffect(text) {
        if (typewriterTimeout) clearTimeout(typewriterTimeout);
        letterBodyText.textContent = '';
        let charIndex = 0;

        function typeNext() {
            if (charIndex < text.length) {
                letterBodyText.textContent += text.charAt(charIndex);
                charIndex++;
                typewriterTimeout = setTimeout(typeNext, 18);
            }
        }
        typeNext();
    }

    function updateWishUI(useTypewriter = false) {
        letterRecipientName.textContent = appState.name;
        letterSenderName.textContent = appState.senderName;
        const currentCount = countWords(appState.wishText);
        displayWordCount.textContent = currentCount;

        if (useTypewriter) {
            playTypewriterEffect(appState.wishText);
        } else {
            letterBodyText.textContent = appState.wishText;
        }
    }

    // Wax seal click toggles the envelope open/closed
    waxSeal.addEventListener('click', () => {
        appState.isEnvelopeOpen = !appState.isEnvelopeOpen;
        envelopeBox.classList.toggle('opened', appState.isEnvelopeOpen);
        if (appState.isEnvelopeOpen) {
            playTone(523.25, 0.3, 'triangle', 0.3);
            updateWishUI(true);
            showToast('💌 Envelope opened!');
        }
    });

    replayLetterTypewriterBtn.addEventListener('click', () => {
        updateWishUI(true);
    });

    document.getElementById('openWishCardBtn').addEventListener('click', () => {
        document.getElementById('wishesSection').scrollIntoView({ behavior: 'smooth' });
        if (!appState.isEnvelopeOpen) {
            appState.isEnvelopeOpen = true;
            envelopeBox.classList.add('opened');
            setTimeout(() => updateWishUI(true), 600);
        }
    });

    // Open Wishes Editor Modal
    openEditWishesModalBtn.addEventListener('click', () => {
        wishRecipientInput.value = appState.name;
        wishSenderInput.value = appState.senderName;
        wishTextInput.value = appState.wishText;
        validateWordCount();
        wishesEditorModal.classList.add('active');
    });

    closeWishesEditorModal.addEventListener('click', () => wishesEditorModal.classList.remove('active'));
    cancelWishEditorBtn.addEventListener('click', () => wishesEditorModal.classList.remove('active'));

    // Real-time word limit enforcement (Maximum 200 Words)
    function validateWordCount() {
        const text = wishTextInput.value;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        modalLiveWordCounter.textContent = `${wordCount} / 200 words`;

        if (wordCount > 200) {
            // Trim words strictly to 200
            const trimmedWords = words.slice(0, 200);
            wishTextInput.value = trimmedWords.join(' ');
            modalLiveWordCounter.textContent = `200 / 200 words`;
            modalLiveWordCounter.classList.add('limit-warning');
            remainingWordsCount.textContent = '0';
            wordLimitWarningText.innerHTML = `⚠️ <strong>Maximum limit reached!</strong> Only up to 200 words allowed.`;
            wordLimitWarningText.style.color = '#ff007f';
        } else {
            modalLiveWordCounter.classList.remove('limit-warning');
            const remaining = 200 - wordCount;
            remainingWordsCount.textContent = remaining;
            wordLimitWarningText.innerHTML = `✅ Maximum allowed: 200 words. (Remaining: <strong>${remaining}</strong> words)`;
            wordLimitWarningText.style.color = 'var(--text-muted)';
        }
    }

    wishTextInput.addEventListener('input', validateWordCount);

    // Preset Wishes
    document.getElementById('presetHindiEnglishBtn').addEventListener('click', () => {
        wishTextInput.value = DEFAULT_WISH;
        validateWordCount();
    });

    document.getElementById('presetEmotionalBtn').addEventListener('click', () => {
        wishTextInput.value = `Dear ${wishRecipientInput.value || 'Friend'},

Every year reminds me how lucky the world is to have you. You bring warmth, laughter, and calm everywhere you step.

खुदा से क्या मांगू तेरे वास्ते,
सदा खुशियों से भरे हों तेरे रास्ते,
हँसी तेरे चेहरे पर रहे इस तरह,
खुशबू फूलों का साथ निभाती है जिस तरह।

May God grant you unwavering peace, radiant health, and boundless opportunities to fulfill your highest potential. Keep being the extraordinary soul you are. Happy Birthday! ❤️✨`;
        validateWordCount();
    });

    document.getElementById('presetJoyfulBtn').addEventListener('click', () => {
        wishTextInput.value = `Happy Birthday to the most fun, energetic, and amazing rockstar! 🥳🎉

आज का दिन सिर्फ आपका है! 
खूब मस्ती, बड़ा सा केक, अनगिनत उपहार और ढेरों बधाइयाँ! 

May your year ahead be filled with grand adventures, promotions, travels to dream destinations, delicious food, and endless reasons to smile. Let us celebrate like never before! Cheers to you! 🥂🍰🎈`;
        validateWordCount();
    });

    saveWishEditorBtn.addEventListener('click', () => {
        validateWordCount();
        const newRecipient = wishRecipientInput.value.trim() || 'Priya';
        const newSender = wishSenderInput.value.trim() || 'Forever Your Best Friend ❤️';
        const newWish = wishTextInput.value.trim() || DEFAULT_WISH;

        appState.name = newRecipient;
        appState.senderName = newSender;
        appState.wishText = newWish;

        localStorage.setItem('bday_name', appState.name);
        localStorage.setItem('bday_sender', appState.senderName);
        localStorage.setItem('bday_wish_text', appState.wishText);

        updateMainUI();
        updateWishUI(true);
        wishesEditorModal.classList.remove('active');
        triggerConfettiBurst();
        showToast('💌 Birthday wishes saved & updated!');
    });

    // =========================================================================
    // 9. SURPRISE GIFT BOX
    // =========================================================================
    const mysteryGiftBox = document.getElementById('mysteryGiftBox');
    const openGiftBoxBtn = document.getElementById('openGiftBoxBtn');
    const giftModal = document.getElementById('giftModal');
    const closeGiftModal = document.getElementById('closeGiftModal');
    const triggerSurpriseFireworkBtn = document.getElementById('triggerSurpriseFireworkBtn');

    function openSurpriseGift() {
        playFanfareSound();
        triggerConfettiBurst();
        giftModal.classList.add('active');
    }

    mysteryGiftBox.addEventListener('click', openSurpriseGift);
    openGiftBoxBtn.addEventListener('click', openSurpriseGift);
    closeGiftModal.addEventListener('click', () => giftModal.classList.remove('active'));

    triggerSurpriseFireworkBtn.addEventListener('click', () => {
        giftModal.classList.remove('active');
        triggerConfettiBurst();
        for (let i = 0; i < 18; i++) {
            setTimeout(() => launchRocket(), i * 150);
        }
        showToast('🎆 Celebration Fireworks Blast!');
    });

    // =========================================================================
    // 10. PERSONALIZATION MODAL & MAIN UI
    // =========================================================================
    const customizeModal = document.getElementById('customizeModal');
    const openCustomizeBtn = document.getElementById('openCustomizeBtn');
    const closeCustomizeModal = document.getElementById('closeCustomizeModal');
    const cancelCustomizeBtn = document.getElementById('cancelCustomizeBtn');
    const customizeForm = document.getElementById('customizeForm');
    const quickProfileUpload = document.getElementById('quickProfileUpload');
    const toggleDiscoBtn = document.getElementById('toggleDiscoBtn');
    const discoLights = document.getElementById('discoLights');

    function updateMainUI() {
        document.getElementById('personNameDisplay').textContent = appState.name;
        document.getElementById('ageBadge').textContent = `🎂 ${appState.ageTag}`;
        document.getElementById('personPhoto').src = appState.mainPhotoUrl;
        document.getElementById('letterRecipientName').textContent = appState.name;
        document.getElementById('letterSenderName').textContent = appState.senderName;
    }

    openCustomizeBtn.addEventListener('click', () => {
        document.getElementById('inputName').value = appState.name;
        document.getElementById('inputAge').value = appState.ageTag;
        document.getElementById('inputPhotoUrl').value = appState.mainPhotoUrl;
        customizeModal.classList.add('active');
    });

    closeCustomizeModal.addEventListener('click', () => customizeModal.classList.remove('active'));
    cancelCustomizeBtn.addEventListener('click', () => customizeModal.classList.remove('active'));

    customizeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('inputName').value.trim();
        const newAge = document.getElementById('inputAge').value.trim();
        const newUrl = document.getElementById('inputPhotoUrl').value.trim();
        const file = document.getElementById('inputPhoto').files[0];

        if (newName) appState.name = newName;
        if (newAge) appState.ageTag = newAge;

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                appState.mainPhotoUrl = event.target.result;
                saveAndApplyMain();
            };
            reader.readAsDataURL(file);
        } else if (newUrl) {
            appState.mainPhotoUrl = newUrl;
            saveAndApplyMain();
        } else {
            saveAndApplyMain();
        }
    });

    function saveAndApplyMain() {
        localStorage.setItem('bday_name', appState.name);
        localStorage.setItem('bday_tag', appState.ageTag);
        localStorage.setItem('bday_main_photo', appState.mainPhotoUrl);
        updateMainUI();
        customizeModal.classList.remove('active');
        triggerConfettiBurst();
        showToast('✨ Birthday details updated successfully!');
    }

    // Quick hover photo upload on main profile
    quickProfileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                appState.mainPhotoUrl = event.target.result;
                localStorage.setItem('bday_main_photo', appState.mainPhotoUrl);
                document.getElementById('personPhoto').src = event.target.result;
                showToast('📷 Main photo updated!');
            };
            reader.readAsDataURL(file);
        }
    });

    // Party / Disco Lights Toggle
    toggleDiscoBtn.addEventListener('click', () => {
        appState.discoActive = !appState.discoActive;
        discoLights.classList.toggle('active', appState.discoActive);
        toggleDiscoBtn.textContent = `🪩 Party Lights: ${appState.discoActive ? 'ON' : 'OFF'}`;
        showToast(appState.discoActive ? '🪩 Party Disco Lights Active!' : 'Disco Lights Off');
    });

    // =========================================================================
    // 11. TOAST HELPER
    // =========================================================================
    const toastNotification = document.getElementById('toastNotification');
    let toastTimeout = null;
    function showToast(msg) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastNotification.textContent = msg;
        toastNotification.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 2800);
    }

    // Initial Boots
    renderPhotoGallery();
    updateMainUI();
    updateWishUI(false);
    checkCandlesState();
});
