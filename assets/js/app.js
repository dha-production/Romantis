/**
 * app.js - Main Romantic Application Logic
 * Interactive Envelope Unfolding, Personalized Love Letters,
 * Fleeing "Tidak" Button, Proposal Celebration, and Love Counter.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        recipient: 'Dinda Sayang',
        sender: 'Kanda Tercinta',
        title: 'Surat Cinta Abadi',
        startDate: '2023-01-01',
        isLetterOpen: false,
        theme: 'candlelight',
        isTyping: false
    };

    // DOM Elements
    const stageEnvelope = document.getElementById('stage-envelope');
    const stageLetter = document.getElementById('stage-letter');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const waxSealBtn = document.getElementById('wax-seal-btn');

    // Text Display Elements
    const displayRecipientTag = document.getElementById('display-recipient-tag');
    const displayRecipientHeader = document.getElementById('display-recipient-header');
    const displaySenderSign = document.getElementById('display-sender-sign');
    const displayLetterTitle = document.getElementById('display-letter-title');
    const displayCurrentDate = document.getElementById('display-current-date');

    // Proposal Elements
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const proposalCelebration = document.getElementById('proposal-celebration');
    const proposalActionArea = document.getElementById('proposal-action-area');

    // Secret Message
    const secretCardCover = document.getElementById('secret-card-cover');

    // Floating Music Widget Elements
    const musicWidget = document.getElementById('floating-music-widget');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicPlayIcon = document.getElementById('music-play-icon');
    const musicVolume = document.getElementById('music-volume');
    const musicTrackName = document.getElementById('music-track-name');
    const vizBars = document.querySelectorAll('.viz-bar');

    // Modal Elements
    const modalSettings = document.getElementById('modal-settings');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnCopyShare = document.getElementById('btn-copy-share');
    const inputRecipient = document.getElementById('input-recipient');
    const inputSender = document.getElementById('input-sender');
    const inputStartDate = document.getElementById('input-start-date');
    const audioModeSelect = document.getElementById('audio-mode-select');
    const customAudioFile = document.getElementById('custom-audio-file');
    const customAudioGroup = document.getElementById('custom-audio-group');

    // Other Buttons
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const btnPrintLetter = document.getElementById('btn-print-letter');
    const btnTypewriter = document.getElementById('btn-typewriter');
    const polaroidUploadBtn = document.getElementById('polaroid-upload-btn');
    const polaroidFileInput = document.getElementById('polaroid-file-input');
    const polaroidImg = document.getElementById('polaroid-img');

    // 1. Initialize from URL Parameters or Local Storage
    function initParams() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('to')) state.recipient = urlParams.get('to');
        if (urlParams.has('from')) state.sender = urlParams.get('from');
        if (urlParams.has('title')) state.title = urlParams.get('title');
        if (urlParams.has('date')) state.startDate = urlParams.get('date');

        // Update form values
        inputRecipient.value = state.recipient;
        inputSender.value = state.sender;
        inputStartDate.value = state.startDate;

        updateDisplayTexts();

        // Format Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        displayCurrentDate.textContent = new Date().toLocaleDateString('id-ID', options);
    }

    function updateDisplayTexts() {
        if (displayRecipientTag) displayRecipientTag.textContent = `Untuk: ${state.recipient}`;
        if (displayRecipientHeader) displayRecipientHeader.textContent = state.recipient;
        if (displaySenderSign) displaySenderSign.textContent = state.sender;
        if (displayLetterTitle) displayLetterTitle.textContent = state.title;
    }

    // 2. Open Envelope Functionality
    function openEnvelope() {
        if (state.isLetterOpen) return;
        state.isLetterOpen = true;

        // Visual effects on seal break
        const rect = waxSealBtn.getBoundingClientRect();
        const sealX = rect.left + rect.width / 2;
        const sealY = rect.top + rect.height / 2;

        if (window.RomanticVisualEngine) {
            window.RomanticVisualEngine.spawnSealBreakFX(sealX, sealY);
            window.RomanticVisualEngine.spawnHeartBurst(sealX, sealY, 12);
        }

        // Audio seal sound & start romantic BGM
        if (window.RomanticAudio) {
            window.RomanticAudio.playSealBreak();
            setTimeout(() => {
                window.RomanticAudio.start();
                updateMusicWidgetUI(true);
            }, 600);
        }

        // 3D Envelope Opening Animation
        envelopeWrapper.classList.add('open');
        waxSealBtn.style.transform = 'translate(-50%, -50%) scale(0)';
        waxSealBtn.style.opacity = '0';

        // Transition smoothly to parchment letter
        setTimeout(() => {
            stageEnvelope.classList.add('hidden');
            stageLetter.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 850);
    }

    waxSealBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelopeWrapper.addEventListener('click', () => {
        openEnvelope();
    });

    // 3. Fleeing "Tidak" Button (Impossible to refuse love!)
    const cheekyMessages = [
        "Eits, mau klik apa tuh? 😜",
        "Tombol ini rusak khusus untukmu! 💕",
        "Hatimu bilang 'Iya' kok! ❤️",
        "Jangan nakal, klik yang kiri yuk! 🙈",
        "Takdir kita sudah tertulis bersama! ✨",
        "Gabisa nolak deh pokoknya! 💍"
    ];
    let cheekyIndex = 0;

    function fleeButton() {
        const container = proposalActionArea.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();

        const maxX = Math.max(20, container.width - btnRect.width - 20);
        const maxY = Math.max(20, 120);

        const randomX = (Math.random() - 0.5) * (maxX * 0.8);
        const randomY = (Math.random() - 0.5) * (maxY * 0.8);

        btnNo.style.position = 'relative';
        btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
        btnNo.textContent = cheekyMessages[cheekyIndex % cheekyMessages.length];
        cheekyIndex++;

        if (window.RomanticVisualEngine) {
            const r = btnNo.getBoundingClientRect();
            window.RomanticVisualEngine.spawnHeartBurst(r.left + r.width / 2, r.top + r.height / 2, 4);
        }
    }

    btnNo.addEventListener('mouseenter', fleeButton);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fleeButton();
    });

    // 4. "Iya, Selamanya! ❤️" Proposal Celebration
    btnYes.addEventListener('click', () => {
        proposalActionArea.style.display = 'none';
        proposalCelebration.style.display = 'block';

        if (window.RomanticVisualEngine) {
            window.RomanticVisualEngine.triggerCelebration();
        }

        if (window.RomanticAudio) {
            window.RomanticAudio.playLoveCelebration();
        }
    });

    // 5. Secret Whisper Card Reveal
    secretCardCover.addEventListener('click', () => {
        secretCardCover.classList.toggle('revealed');
        if (window.RomanticAudio) {
            window.RomanticAudio.playHeartChime();
        }
        if (window.RomanticVisualEngine) {
            const r = secretCardCover.getBoundingClientRect();
            window.RomanticVisualEngine.spawnHeartBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
        }
    });

    // 6. Love Days Counter Calculation
    function updateLoveCounter() {
        const start = new Date(state.startDate).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        document.getElementById('counter-days').textContent = days;
        document.getElementById('counter-hours').textContent = hours;
        document.getElementById('counter-minutes').textContent = minutes;
        document.getElementById('counter-seconds').textContent = seconds;
    }

    setInterval(updateLoveCounter, 1000);
    updateLoveCounter();

    // 7. Polaroid Photo Replacement
    if (polaroidUploadBtn && polaroidFileInput) {
        polaroidUploadBtn.addEventListener('click', () => {
            polaroidFileInput.click();
        });

        polaroidFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    polaroidImg.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 8. Typewriter Effect
    const mainLetterParagraph = document.getElementById('typewriter-paragraph');
    const originalLetterText = mainLetterParagraph ? mainLetterParagraph.textContent.trim() : '';

    if (btnTypewriter && mainLetterParagraph) {
        btnTypewriter.addEventListener('click', () => {
            if (state.isTyping) return;
            state.isTyping = true;
            mainLetterParagraph.textContent = '';
            let charIndex = 0;

            const typeInterval = setInterval(() => {
                if (charIndex < originalLetterText.length) {
                    mainLetterParagraph.textContent += originalLetterText[charIndex];
                    if (charIndex % 3 === 0 && window.RomanticAudio) {
                        window.RomanticAudio.playTypewriterClick();
                    }
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    state.isTyping = false;
                }
            }, 30);
        });
    }

    // 9. Floating Music Widget Controls & Equalizer Visualizer
    function updateMusicWidgetUI(isPlaying) {
        if (isPlaying) {
            musicWidget.classList.add('playing');
            musicPlayIcon.textContent = '⏸️';
        } else {
            musicWidget.classList.remove('playing');
            musicPlayIcon.textContent = '▶️';
        }
    }

    musicPlayBtn.addEventListener('click', () => {
        if (!window.RomanticAudio) return;
        const isPlaying = window.RomanticAudio.toggle();
        updateMusicWidgetUI(isPlaying);
    });

    musicVolume.addEventListener('input', (e) => {
        if (window.RomanticAudio) {
            window.RomanticAudio.setVolume(parseFloat(e.target.value));
        }
    });

    // Real-time audio visualizer loop
    function updateVisualizer() {
        if (window.RomanticAudio && window.RomanticAudio.isPlaying) {
            const data = window.RomanticAudio.getVisualizerData();
            vizBars.forEach((bar, idx) => {
                const val = data[idx * 2] || 10;
                const h = Math.max(3, Math.min(18, (val / 255) * 18));
                bar.style.height = `${h}px`;
            });
        } else {
            vizBars.forEach(bar => bar.style.height = '3px');
        }
        requestAnimationFrame(updateVisualizer);
    }
    requestAnimationFrame(updateVisualizer);

    // Audio Mode Selection
    audioModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        if (mode === 'custom') {
            customAudioGroup.style.display = 'block';
        } else {
            customAudioGroup.style.display = 'none';
            if (window.RomanticAudio) {
                window.RomanticAudio.setMode(mode);
                musicTrackName.textContent = mode === 'rain-piano' ? 'Piano & Hujan Asmara' : 'Piano Asmara (Canon)';
            }
        }
    });

    customAudioFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && window.RomanticAudio) {
            const url = URL.createObjectURL(file);
            window.RomanticAudio.setMode('custom', url);
            musicTrackName.textContent = file.name.substring(0, 18) + '...';
            updateMusicWidgetUI(true);
        }
    });

    // 10. Settings & Personalization Modal
    btnOpenSettings.addEventListener('click', () => {
        modalSettings.classList.add('active');
    });

    btnCloseSettings.addEventListener('click', () => {
        modalSettings.classList.remove('active');
    });

    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) {
            modalSettings.classList.remove('active');
        }
    });

    btnSaveSettings.addEventListener('click', () => {
        if (inputRecipient.value.trim()) state.recipient = inputRecipient.value.trim();
        if (inputSender.value.trim()) state.sender = inputSender.value.trim();
        if (inputStartDate.value) state.startDate = inputStartDate.value;

        updateDisplayTexts();
        updateLoveCounter();
        modalSettings.classList.remove('active');

        if (window.RomanticVisualEngine) {
            window.RomanticVisualEngine.spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 10);
        }
    });

    // Copy Shareable Romantic Link
    btnCopyShare.addEventListener('click', () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            to: state.recipient,
            from: state.sender,
            date: state.startDate,
            title: state.title
        });
        const fullShareUrl = `${baseUrl}?${params.toString()}`;

        navigator.clipboard.writeText(fullShareUrl).then(() => {
            btnCopyShare.textContent = '✅ Tautan Cinta Berhasil Disalin!';
            setTimeout(() => {
                btnCopyShare.textContent = '🔗 Salin Tautan Berbagi WhatsApp';
            }, 3000);
        }).catch(() => {
            prompt('Salin tautan ini untuk pasanganmu:', fullShareUrl);
        });
    });

    // 11. Theme Switcher (Candlelight vs Starlight Twilight)
    btnToggleTheme.addEventListener('click', () => {
        if (state.theme === 'candlelight') {
            state.theme = 'starlight';
            document.body.classList.add('theme-starlight');
            btnToggleTheme.innerHTML = '✨ <span>Suasana Lilin</span>';
        } else {
            state.theme = 'candlelight';
            document.body.classList.remove('theme-starlight');
            btnToggleTheme.innerHTML = '🕯️ <span>Suasana Bintang</span>';
        }
    });

    // 12. Print / PDF Export
    btnPrintLetter.addEventListener('click', () => {
        window.print();
    });

    // Init call
    initParams();
});
