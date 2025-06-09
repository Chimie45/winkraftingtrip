// Particle Background Manager (particles.js)

class ParticleManager {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) {
            WinkUtils.log('Particle canvas not found, skipping particle system');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        
        this.mousePos = { x: 0, y: 0 };
        this.isMouseActive = false;
        this.lastMouseMove = 0;
        
        this.animationId = null;
        this.isActive = true;
        this.isPaused = false;
        
        // Configuration
        this.config = {
            particleCount: this.calculateParticleCount(),
            speed: window.WINK_CONFIG.particles.speed,
            size: window.WINK_CONFIG.particles.size,
            opacity: window.WINK_CONFIG.particles.opacity,
            connectionDistance: 120,
            mouseInfluenceDistance: 100,
            mouseRepelForce: 0.02,
            colors: ['#2e528f', '#1e3a6f', '#4a6bb5'],
            connectionOpacity: 0.15
        };
        
        this.init();
    }

    // Calculate optimal particle count based on screen size
    calculateParticleCount() {
        const screenArea = window.innerWidth * window.innerHeight;
        const baseCount = window.WINK_CONFIG.particles.count;
        const density = screenArea / 20000; // Particles per 20k pixels
        
        return Math.min(Math.max(Math.floor(density), 20), baseCount);
    }

    init() {
        if (!this.canvas || !this.ctx) return;
        
        WinkUtils.log('Particle system initialized');
        
        this.resizeCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    // Resize canvas to full window
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    // Create particle system
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        WinkUtils.log(`Created ${this.particles.length} particles`);
    }

    // Create a single particle
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * this.config.speed,
            vy: (Math.random() - 0.5) * this.config.speed,
            size: WinkUtils.random(this.config.size.min, this.config.size.max),
            opacity: WinkUtils.random(this.config.opacity.min, this.config.opacity.max),
            baseOpacity: 0,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50
        };
    }

    // Bind event listeners
    bindEvents() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            this.isMouseActive = true;
            this.lastMouseMove = Date.now();
        });

        // Mouse leave detection
        document.addEventListener('mouseleave', () => {
            this.isMouseActive = false;
        });

        // Window resize
        window.addEventListener('resize', WinkUtils.debounce(() => {
            this.resizeCanvas();
            this.config.particleCount = this.calculateParticleCount();
            this.createParticles();
        }, 250));

        // Visibility change (pause when tab not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Performance monitoring
        this.monitorPerformance();
    }

    // Update particle positions and properties
    updateParticles() {
        const currentTime = Date.now();
        const mouseInactive = currentTime - this.lastMouseMove > 2000;
        
        if (mouseInactive && this.isMouseActive) {
            this.isMouseActive = false;
        }

        this.particles.forEach((particle, index) => {
            // Update life cycle
            particle.life += 0.5;
            if (particle.life > particle.maxLife) {
                this.particles[index] = this.createParticle();
                return;
            }

            // Basic movement
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Mouse interaction
            if (this.isMouseActive) {
                const dx = this.mousePos.x - particle.x;
                const dy = this.mousePos.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseInfluenceDistance) {
                    const force = (this.config.mouseInfluenceDistance - distance) / this.config.mouseInfluenceDistance;
                    
                    // Repel particles from mouse
                    particle.vx -= dx * force * this.config.mouseRepelForce;
                    particle.vy -= dy * force * this.config.mouseRepelForce;
                    
                    // Increase opacity near mouse
                    particle.opacity = Math.min(1, particle.baseOpacity + force * 0.6);
                } else {
                    // Gradually return to base opacity
                    particle.opacity = WinkUtils.lerp(particle.opacity, particle.baseOpacity, 0.02);
                }
            } else {
                particle.opacity = WinkUtils.lerp(particle.opacity, particle.baseOpacity, 0.02);
            }

            // Apply velocity damping
            particle.vx *= 0.995;
            particle.vy *= 0.995;

            // Boundary conditions with wrapping
            if (particle.x > this.canvas.width + 50) {
                particle.x = -50;
            } else if (particle.x < -50) {
                particle.x = this.canvas.width + 50;
            }

            if (particle.y > this.canvas.height + 50) {
                particle.y = -50;
            } else if (particle.y < -50) {
                particle.y = this.canvas.height + 50;
            }

            // Add subtle random movement
            particle.vx += (Math.random() - 0.5) * 0.002;
            particle.vy += (Math.random() - 0.5) * 0.002;

            // Clamp velocity
            const maxVel = this.config.speed * 2;
            particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
            particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
        });
    }

    // Calculate particle connections
    calculateConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (this.config.connectionDistance - distance) / this.config.connectionDistance;
                    this.connections.push({
                        p1, p2, opacity: opacity * this.config.connectionOpacity
                    });
                }
            }
        }
    }

    // Render particles and connections
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections first (behind particles)
        this.drawConnections();
        
        // Draw particles
        this.drawParticles();
    }

    // Draw particle connections
    drawConnections() {
        this.connections.forEach(connection => {
            this.ctx.save();
            this.ctx.globalAlpha = connection.opacity;
            this.ctx.strokeStyle = connection.p1.color;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(connection.p1.x, connection.p1.y);
            this.ctx.lineTo(connection.p2.x, connection.p2.y);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    // Draw individual particles
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            
            // Add slight glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // Main animation loop
    animate() {
        if (!this.isActive || this.isPaused) return;
        
        this.updateParticles();
        this.calculateConnections();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Monitor performance and adjust quality
    monitorPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust quality based on FPS
                if (fps < 30 && this.config.particleCount > 20) {
                    this.config.particleCount = Math.max(20, this.config.particleCount - 5);
                    this.createParticles();
                    WinkUtils.log(`Performance adjustment: reduced particles to ${this.config.particleCount}`);
                } else if (fps > 55 && this.config.particleCount < window.WINK_CONFIG.particles.count) {
                    this.config.particleCount = Math.min(window.WINK_CONFIG.particles.count, this.config.particleCount + 2);
                    this.createParticles();
                }
            }
            
            if (this.isActive) {
                requestAnimationFrame(checkPerformance);
            }
        };
        
        requestAnimationFrame(checkPerformance);
    }

    // Add particle burst effect at position
    addBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = WinkUtils.random(1, 3);
            
            const particle = this.createParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.opacity = 0.8;
            particle.life = 0;
            particle.maxLife = 30;
            
            this.particles.push(particle);
        }
        
        // Remove excess particles
        if (this.particles.length > this.config.particleCount * 1.5) {
            this.particles.splice(0, count);
        }
    }

    // Pause particle system
    pause() {
        this.isPaused = true;
        WinkUtils.log('Particle system paused');
    }

    // Resume particle system
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.animate();
            WinkUtils.log('Particle system resumed');
        }
    }

    // Set particle density
    setDensity(density) {
        this.config.particleCount = Math.max(10, Math.min(100, density));
        this.createParticles();
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.createParticles();
    }

    // Get current stats
    getStats() {
        return {
            particleCount: this.particles.length,
            connectionCount: this.connections.length,
            isActive: this.isActive,
            isPaused: this.isPaused
        };
    }

    // Destroy particle system
    destroy() {
        this.isActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.particles = [];
        this.connections = [];
        
        WinkUtils.log('Particle system destroyed');
    }
}

// Make ParticleManager globally available
window.ParticleManager = ParticleManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleManager;
}
