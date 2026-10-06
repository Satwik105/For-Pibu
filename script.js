/* ==========================================
   FLORAL HEART SANCTUARY - SCRIPT.JS
   Mobile Optimized & SVG Canvas Capture Fix
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const heartPath = document.getElementById('heartPath');
    const heartTextPath = document.getElementById('heartTextPath');
    const displaySentence = document.getElementById('displaySentence');
    const heartTextElement = document.querySelector('.heart-text-boundary');
    
    const playOverlay = document.getElementById('playOverlay');
    const btnCenterPlay = document.getElementById('btnCenterPlay');
    const svgHeartImage = document.getElementById('svgHeartImage');
    const svgImageGroup = document.getElementById('svgImageGroup');
    const funnyCaption = document.getElementById('funnyCaption');
    
    const btnMusic = document.getElementById('btnMusic');
    const btnDownload = document.getElementById('btnDownload');
    const petalsContainer = document.getElementById('petalsContainer');

    // --- State Variables ---
    const currentText = "everything will be fine pibu";
    let isPlayingAudio = false;
    let audioContext = null;
    let musicInterval = null;
    
    // 5 Photos Array with Funny Captions & Animations
    const pibuPhotos = [
        { src: 'assets/photo1.jpg', base64: '', caption: 'The Handsome Serious Pibu 🤓', anim: 'bounce-in' },
        { src: 'assets/photo2.png', base64: '', caption: 'Sukuna Mode Pibu 😈⚡', anim: 'bounce-wobble' },
        { src: 'assets/photo3.jpg', base64: '', caption: 'Cake Face Sweet Tooth 🎂🤪', anim: 'bounce-pop' },
        { src: 'assets/photo4.png', base64: '', caption: 'Bandana Ninja Pibu 🥷👍', anim: 'bounce-in' },
        { src: 'assets/photo5.jpg', base64: '', caption: 'Pibu, Bestie & The Iggy 🐶💕', anim: 'bounce-wobble' }
    ];
    
    let photoIndex = 0;
    let slideshowInterval = null;

    // ==========================================
    // 1. PRELOAD PHOTOS TO BASE64 FOR RELIABLE DOWNLOAD CAPTURE
    // ==========================================
    async function preloadPhotosAsBase64() {
        for (let item of pibuPhotos) {
            try {
                const response = await fetch(item.src);
                const blob = await response.blob();
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        item.base64 = reader.result;
                        resolve();
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.warn('Fallback to direct path for', item.src, err);
                item.base64 = item.src;
            }
        }
        // Set initial photo to preloaded base64
        if (pibuPhotos[0].base64) {
            svgHeartImage.setAttribute('href', pibuPhotos[0].base64);
        }
    }

    preloadPhotosAsBase64();

    // ==========================================
    // 2. HEART TEXT OUTLINE REPETITION LOGIC
    // ==========================================
    function updateHeartTextBoundary() {
        if (!heartPath || !heartTextPath) return;

        const totalPathLength = heartPath.getTotalLength();
        const formattedPhrase = currentText + "  •  ";

        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        tempText.style.fontFamily = getComputedStyle(heartTextElement).fontFamily;
        tempText.style.fontSize = '14.5px';
        tempText.style.fontWeight = '700';
        tempText.style.letterSpacing = '1.5px';
        tempText.textContent = formattedPhrase;
        
        tempSvg.appendChild(tempText);
        document.body.appendChild(tempSvg);
        
        const phraseWidth = tempText.getComputedTextLength() || (formattedPhrase.length * 9);
        document.body.removeChild(tempSvg);

        let repeatCount = Math.ceil(totalPathLength / phraseWidth);
        if (repeatCount < 1) repeatCount = 1;

        let fullRepeatedText = "";
        for (let i = 0; i < repeatCount; i++) {
            fullRepeatedText += formattedPhrase;
        }

        heartTextPath.textContent = fullRepeatedText;
    }

    updateHeartTextBoundary();
    window.addEventListener('resize', updateHeartTextBoundary);

    // ==========================================
    // 3. FUNNY BOUNCE SLIDESHOW & PLAY BUTTON
    // ==========================================
    function nextPhotoSlide() {
        photoIndex = (photoIndex + 1) % pibuPhotos.length;
        const currentItem = pibuPhotos[photoIndex];

        // Trigger funny SVG bounce animation
        svgImageGroup.className.baseVal = '';
        void svgImageGroup.offsetWidth; // Force reflow

        const imageUri = currentItem.base64 || currentItem.src;
        svgHeartImage.setAttribute('href', imageUri);
        svgImageGroup.className.baseVal = currentItem.anim;

        // Update Funny Caption Badge
        if (funnyCaption) {
            funnyCaption.textContent = currentItem.caption;
            funnyCaption.style.animation = 'none';
            void funnyCaption.offsetWidth;
            funnyCaption.style.animation = 'captionPop 0.6s ease forwards';
        }
    }

    function startSlideshow() {
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowInterval = setInterval(nextPhotoSlide, 3200);
    }

    // Play Button Listener
    btnCenterPlay.addEventListener('click', () => {
        playOverlay.classList.add('hidden');

        if (!isPlayingAudio) {
            toggleAudio();
        }

        nextPhotoSlide();
        startSlideshow();
    });

    // ==========================================
    // 4. FLOATING PETALS GENERATOR
    // ==========================================
    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        const size = Math.random() * 12 + 10;
        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.3}px`;
        petal.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 7 + 7;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${Math.random() * 2}s`;

        petalsContainer.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, (duration + 3) * 1000);
    }

    for (let i = 0; i < 12; i++) {
        createPetal();
    }
    setInterval(createPetal, 900);

    // ==========================================
    // 5. SOFT AMBIENT MUSIC (WEB AUDIO API)
    // ==========================================
    function playMelodyNote(freq, duration = 1.2) {
        if (!audioContext) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + duration);
    }

    const notes = [
        261.63, 329.63, 392.00, 493.88,
        440.00, 523.25, 659.25, 783.99,
        349.23, 440.00, 523.25, 698.46,
        392.00, 493.88, 587.33, 783.99
    ];

    let noteIndex = 0;

    function toggleAudio() {
        if (!isPlayingAudio) {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            isPlayingAudio = true;
            btnMusic.classList.add('playing');
            btnMusic.style.color = 'var(--primary-red)';

            musicInterval = setInterval(() => {
                const note = notes[noteIndex % notes.length];
                playMelodyNote(note, 1.4);
                noteIndex++;
            }, 450);

        } else {
            isPlayingAudio = false;
            btnMusic.classList.remove('playing');
            btnMusic.style.color = '';
            if (musicInterval) clearInterval(musicInterval);
        }
    }

    btnMusic.addEventListener('click', toggleAudio);

    // ==========================================
    // 6. FIXED DOWNLOAD CARD CAPTURE (100% PHOTO CAPTURE)
    // ==========================================
    btnDownload.addEventListener('click', async () => {
        const captureArea = document.getElementById('captureArea');
        if (!captureArea) return;

        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            // Ensure current photo is set as base64 in SVG image href before capturing
            const currentItem = pibuPhotos[photoIndex];
            if (currentItem && currentItem.base64) {
                svgHeartImage.setAttribute('href', currentItem.base64);
            }

            // Capture using html2canvas with full CORS and scale settings
            const canvas = await html2canvas(captureArea, {
                backgroundColor: '#fde8ed',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                ignoreElements: (element) => element.classList.contains('floating-controls')
            });

            const link = document.createElement('a');
            link.download = `Everything-Will-Be-Fine-Pibu.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Error exporting image:', err);
            alert('Unable to export card right now. Please take a screenshot!');
        } finally {
            btnDownload.disabled = false;
            btnDownload.innerHTML = '<i class="fa-solid fa-download"></i><span class="btn-tooltip">Download</span>';
        }
    });

});
