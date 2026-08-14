(function() {
    'use strict';

    // --- DOM references ---
    const preloader = document.getElementById('preloader');
    const speedScreen = document.getElementById('speedScreen');
    const revealScreen = document.getElementById('revealScreen');
    const speedValueEl = document.getElementById('speedValue');
    const speedPhaseEl = document.getElementById('speedPhase');
    const pingValueEl = document.getElementById('pingValue');
    const progressBarFill = document.getElementById('progressBarFill');
    const particlesContainer = document.getElementById('particlesContainer');
    const revealImage = document.getElementById('revealImage');

    // --- State ---
    let skipped = false;
    let testCompleted = false;
    let revealStarted = false;
    let fadeOutStarted = false;
    const startTime = performance.now();

    // --- Timing constants (in ms) ---
    const SPEED_TEST_DURATION = 3800;
    const REVEAL_SHOW_DURATION = 2600;
    const FADE_OUT_DURATION = 800;

    // --- Speed curve phases ---
    const phases = [
        { start: 0.00, end: 0.12, min: 0, max: 0, label: 'connecting...' },
        { start: 0.12, end: 0.45, min: 10, max: 95, label: 'testing download speed...' },
        { start: 0.45, end: 0.65, min: 65, max: 95, label: 'testing download speed...' },
        { start: 0.65, end: 0.82, min: 25, max: 55, label: 'testing upload speed...' },
        { start: 0.82, end: 0.95, min: 70, max: 92, label: 'finalizing...' },
        { start: 0.95, end: 1.00, min: 87.42, max: 87.42, label: 'complete!' },
    ];

    const FINAL_SPEED = 87.42;

    // --- Helper functions ---
    function getTargetSpeed(fraction) {
        for (let i = 0; i < phases.length; i++) {
            const p = phases[i];
            if (fraction >= p.start && fraction < p.end) {
                const t = (fraction - p.start) / (p.end - p.start);
                const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                return p.min + (p.max - p.min) * eased;
            }
        }
        return FINAL_SPEED;
    }

    function getPhaseLabel(fraction) {
        for (let i = 0; i < phases.length; i++) {
            const p = phases[i];
            if (fraction >= p.start && fraction < p.end) {
                return p.label;
            }
        }
        return 'complete!';
    }

    // --- Create particles ---
    function createParticles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const x = Math.random() * 100;
            const y = 30 + Math.random() * 70;
            const size = 1.5 + Math.random() * 3;
            const delay = Math.random() * 2.5;
            const duration = 2.2 + Math.random() * 2.5;
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.animationDelay = delay + 's';
            particle.style.animationDuration = duration + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // --- Show reveal screen ---
    function showRevealScreen() {
        if (revealStarted) return;
        revealStarted = true;

        speedScreen.style.display = 'none';
        revealScreen.style.display = 'flex';
        createParticles();

        // Add glitch overlay
        const glitch = document.createElement('div');
        glitch.classList.add('glitch-overlay');
        preloader.appendChild(glitch);
        setTimeout(() => {
            if (glitch.parentNode) glitch.parentNode.removeChild(glitch);
        }, 350);

        // Fade out after reveal duration
        setTimeout(fadeOutPreloader, REVEAL_SHOW_DURATION);
    }

    // --- Fade out preloader ---
    function fadeOutPreloader() {
        if (fadeOutStarted) return;
        fadeOutStarted = true;

        preloader.classList.add('fade-out');
        document.body.classList.remove('preloader-active');

        setTimeout(() => {
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, FADE_OUT_DURATION + 100);
    }

    // --- Skip preloader ---
    function skipPreloader() {
        if (skipped) return;
        skipped = true;
        testCompleted = true;
        fadeOutPreloader();
    }

    // --- Event listeners ---
    preloader.addEventListener('click', function(e) {
        if (revealStarted && !fadeOutStarted) {
            fadeOutPreloader();
            return;
        }
        if (!testCompleted) {
            skipPreloader();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!testCompleted) {
                skipPreloader();
            } else if (revealStarted && !fadeOutStarted) {
                fadeOutPreloader();
            }
        }
    });

    // --- Main animation loop ---
    let currentSpeed = 0;
    let currentPing = 0;

    function animateSpeedTest(now) {
        const elapsed = now - startTime;
        const fraction = Math.min(elapsed / SPEED_TEST_DURATION, 1);

        progressBarFill.style.width = (fraction * 100) + '%';

        const targetSpeed = getTargetSpeed(fraction);
        currentSpeed += (targetSpeed - currentSpeed) * 0.15;
        if (Math.abs(targetSpeed - currentSpeed) < 0.01) {
            currentSpeed = targetSpeed;
        }

        const pingTarget = 8 + Math.sin(elapsed * 0.003) * 8 + Math.random() * 4;
        currentPing += (pingTarget - currentPing) * 0.1;
        pingValueEl.textContent = Math.round(currentPing);

        if (fraction >= 0.95) {
            speedValueEl.textContent = FINAL_SPEED.toFixed(2);
            speedValueEl.classList.add('highlight');
        } else if (fraction < 0.12) {
            speedValueEl.textContent = '0.00';
            speedValueEl.classList.remove('highlight');
        } else {
            speedValueEl.textContent = currentSpeed.toFixed(2);
            speedValueEl.classList.remove('highlight');
        }

        const phaseLabel = getPhaseLabel(fraction);
        speedPhaseEl.textContent = phaseLabel;
        if (fraction >= 0.95) {
            speedPhaseEl.classList.add('complete');
        } else {
            speedPhaseEl.classList.remove('complete');
        }

        if (fraction >= 1 && !testCompleted) {
            testCompleted = true;
            setTimeout(showRevealScreen, 600);
            return;
        }

        if (!testCompleted) {
            requestAnimationFrame(animateSpeedTest);
        }
    }

    // --- Start ---
    requestAnimationFrame(animateSpeedTest);

    // --- Skip hint hover ---
    const skipHint = document.getElementById('skipHint');
    if (skipHint) {
        skipHint.addEventListener('mouseenter', function() {
            this.textContent = 'skip →';
        });
        skipHint.addEventListener('mouseleave', function() {
            this.textContent = 'click anywhere to skip →';
        });
    }

    // --- Image error fallback ---
    if (revealImage) {
        revealImage.addEventListener('error', function() {
            console.warn('image1.png not found at images/image1.png');
            setTimeout(fadeOutPreloader, 1500);
        });
    }

    // --- Safety fallback ---
    setTimeout(() => {
        if (!fadeOutStarted) {
            fadeOutPreloader();
        }
    }, 12000);
})();
