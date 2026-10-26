/**
 * petals.js - Romantic Canvas FX Engine
 * Realistic falling rose petals with 3D fluttering physics, glowing fireflies,
 * interactive heart sparkles, and celebration fireworks.
 */

class RomanticVisuals {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.petals = [];
        this.fireflies = [];
        this.floatingHearts = [];
        this.fireworks = [];

        this.maxPetals = 35;
        this.maxFireflies = 40;
        this.windSpeed = 0.5;
        this.windAngle = 0;

        this.init();
    }

    init() {
        // Create canvas if not already in DOM
        this.canvas = document.getElementById('petals-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'petals-canvas';
            document.body.prepend(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());

        // Spawn initial particles
        for (let i = 0; i < this.maxPetals; i++) {
            this.petals.push(this.createPetal(true));
        }

        for (let i = 0; i < this.maxFireflies; i++) {
            this.fireflies.push(this.createFirefly());
        }

        // Global click / tap heart burst
        window.addEventListener('click', (e) => {
            // Don't trigger on input/select elements
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            this.spawnHeartBurst(e.clientX, e.clientY);
            if (window.RomanticAudio && window.RomanticAudio.isPlaying) {
                window.RomanticAudio.playHeartChime();
            }
        });

        // Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createPetal(randomY = false) {
        const colors = [
            { r: 217, g: 4, b: 41 },    // Crimson Red
            { r: 239, g: 35, b: 60 },   // Rose Red
            { r: 181, g: 23, b: 158 },  // Velvet Magenta
            { r: 255, g: 117, b: 143 }, // Soft Rose Pink
            { r: 155, g: 17, b: 30 }    // Deep Burgundy
        ];

        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -30,
            size: 14 + Math.random() * 18,
            speedY: 1.2 + Math.random() * 2.2,
            speedX: -0.5 + Math.random() * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            flip: Math.random() * Math.PI,
            flipSpeed: 0.02 + Math.random() * 0.03,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.6 + Math.random() * 0.35,
            swayPhase: Math.random() * Math.PI * 2
        };
    }

    createFirefly() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: 1.2 + Math.random() * 2.2,
            baseAlpha: 0.2 + Math.random() * 0.6,
            pulseSpeed: 0.015 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        };
    }

    spawnHeartBurst(x, y, count = 6) {
        const symbols = ['❤️', '💖', '✨', '🌹', '💕', '💍'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
            this.floatingHearts.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 2.5,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                size: 16 + Math.random() * 14,
                alpha: 1.0,
                decay: 0.012 + Math.random() * 0.015,
                rotation: (Math.random() - 0.5) * 0.6
            });
        }
    }

    // Wax seal breaking spark particles
    spawnSealBreakFX(x, y) {
        const particles = 30;
        for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.fireworks.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: Math.random() > 0.5 ? '#d90429' : '#ffd700',
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.15
            });
        }
    }

    // Celebration fireworks for proposal "Iya"
    triggerCelebration() {
        const burstCount = 6;
        for (let b = 0; b < burstCount; b++) {
            setTimeout(() => {
                const cx = (0.2 + Math.random() * 0.6) * this.width;
                const cy = (0.2 + Math.random() * 0.4) * this.height;

                // Firework sparks
                const colors = ['#ff4d6d', '#ff758f', '#ffb703', '#ffd166', '#ff0054', '#ffffff'];
                for (let i = 0; i < 45; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2.5 + Math.random() * 9;
                    this.fireworks.push({
                        x: cx,
                        y: cy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 3 + Math.random() * 4,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        alpha: 1,
                        decay: 0.014 + Math.random() * 0.012,
                        gravity: 0.12
                    });
                }

                // Heart explosion
                this.spawnHeartBurst(cx, cy, 14);
            }, b * 320);
        }
    }

    drawPetal(petal) {
        this.ctx.save();
        this.ctx.translate(petal.x, petal.y);
        this.ctx.rotate(petal.rotation);
        this.ctx.scale(1, Math.cos(petal.flip)); // 3D flip effect

        const w = petal.size;
        const h = petal.size * 1.35;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.bezierCurveTo(w / 1.5, -h / 2, w, h / 3, 0, h / 2);
        this.ctx.bezierCurveTo(-w, h / 3, -w / 1.5, -h / 2, 0, -h / 2);

        const { r, g, b } = petal.color;
        const gradient = this.ctx.createRadialGradient(0, 0, 1, 0, 0, h);
        gradient.addColorStop(0, `rgba(${r + 30}, ${g + 30}, ${b + 30}, ${petal.opacity})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${petal.opacity * 0.9})`);
        gradient.addColorStop(1, `rgba(${Math.max(0, r - 40)}, ${g}, ${b}, ${petal.opacity * 0.6})`);

        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
        this.ctx.shadowBlur = 4;
        this.ctx.fill();

        this.ctx.restore();
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Fireflies (Soft warm fairy dust)
        for (let i = 0; i < this.fireflies.length; i++) {
            const f = this.fireflies[i];
            f.phase += f.pulseSpeed;
            f.x += f.vx;
            f.y += f.vy;

            if (f.x < 0) f.x = this.width;
            if (f.x > this.width) f.x = 0;
            if (f.y < 0) f.y = this.height;
            if (f.y > this.height) f.y = 0;

            const alpha = f.baseAlpha * (0.5 + 0.5 * Math.sin(f.phase));

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 230, 160, ${alpha})`;
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.restore();
        }

        // 2. Draw Falling Rose Petals
        this.windAngle += 0.01;
        const currentWind = Math.sin(this.windAngle) * 0.8;

        for (let i = 0; i < this.petals.length; i++) {
            const p = this.petals[i];
            p.swayPhase += 0.02;
            p.x += p.speedX + currentWind + Math.sin(p.swayPhase) * 0.6;
            p.y += p.speedY;
            p.rotation += p.rotSpeed;
            p.flip += p.flipSpeed;

            this.drawPetal(p);

            // Recycle petal when falling off screen
            if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40) {
                this.petals[i] = this.createPetal(false);
            }
        }

        // 3. Draw Floating Hearts / Emojis
        for (let i = this.floatingHearts.length - 1; i >= 0; i--) {
            const h = this.floatingHearts[i];
            h.x += h.vx;
            h.y += h.vy;
            h.alpha -= h.decay;
            h.vy += 0.02; // slight gravity reduction

            if (h.alpha <= 0) {
                this.floatingHearts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(h.x, h.y);
            this.ctx.rotate(h.rotation);
            this.ctx.globalAlpha = h.alpha;
            this.ctx.font = `${h.size}px serif`;
            this.ctx.fillText(h.symbol, -h.size / 2, h.size / 2);
            this.ctx.restore();
        }

        // 4. Draw Fireworks / Sparks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += fw.gravity;
            fw.alpha -= fw.decay;

            if (fw.alpha <= 0) {
                this.fireworks.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
            this.ctx.fillStyle = fw.color;
            this.ctx.globalAlpha = fw.alpha;
            this.ctx.shadowColor = fw.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
            this.ctx.restore();
        }

        requestAnimationFrame(this.render);
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.RomanticVisualEngine = new RomanticVisuals();
});
