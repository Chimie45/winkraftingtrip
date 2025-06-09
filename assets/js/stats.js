// Statistics Counter Manager (stats.js)

class StatCounterManager {
    constructor() {
        this.stats = document.querySelectorAll('.stat-number');
        this.animatedStats = new Set();
        this.activeCounters = new Map();
        this.observer = null;
        
        // Configuration
        this.config = {
            duration: 2000, // Default animation duration
            minDuration: 800, // Minimum duration for small numbers
            maxDuration: 3000, // Maximum duration for large numbers
            easing: 'easeOutCubic', // Easing function
            separator: ',', // Thousands separator
            decimalPlaces: 0, // Default decimal places
            prefix: '', // Default prefix
            suffix: '', // Default suffix
            enableSound: false, // Sound effects (disabled by default)
            observerThreshold: 0.5 // Intersection observer threshold
        };
        
        // Easing functions
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => 1 - Math.pow(1 - t, 3),
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutBounce: t => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        };
        
        if (this.stats.length > 0) {
            this.init();
        }
    }

    init() {
        WinkUtils.log('Statistics counter manager initialized');
        
        this.setupIntersectionObserver();
        this.parseStatElements();
        this.bindManualTriggers();
        
        // Add click-to-animate feature for demo purposes
        this.addClickToAnimate();
    }

    // Setup intersection observer for automatic triggering
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            WinkUtils.log('IntersectionObserver not supported, using scroll fallback');
            this.setupScrollFallback();
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedStats.has(entry.target)) {
                    this.animateCounter(entry.target);
                }
            });
        }, {
            threshold: this.config.observerThreshold,
            rootMargin: '0px 0px -100px 0px'
        });
        
        this.stats.forEach(stat => {
            this.observer.observe(stat);
        });
        
        WinkUtils.log(`Observing ${this.stats.length} stat counters`);
    }

    // Parse stat elements for configuration
    parseStatElements() {
        this.stats.forEach(stat => {
            const config = this.parseStatConfig(stat);
            stat._statConfig = config;
            
            // Set initial display
            this.displayValue(stat, 0, config);
        });
    }

    // Parse configuration from data attributes
    parseStatConfig(element) {
        const target = parseInt(element.getAttribute('data-count')) || 0;
        const duration = parseInt(element.getAttribute('data-duration')) || this.calculateDuration(target);
        const easing = element.getAttribute('data-easing') || this.config.easing;
        const separator = element.getAttribute('data-separator') || this.config.separator;
        const decimals = parseInt(element.getAttribute('data-decimals')) || this.config.decimalPlaces;
        const prefix = element.getAttribute('data-prefix') || this.config.prefix;
        const suffix = element.getAttribute('data-suffix') || this.config.suffix;
        const format = element.getAttribute('data-format') || 'number'; // number, percentage, currency
        
        return {
            target,
            duration,
            easing,
            separator,
            decimals,
            prefix,
            suffix,
            format
        };
    }

    // Calculate optimal duration based on target value
    calculateDuration(target) {
        const base = this.config.duration;
        const factor = Math.log10(Math.max(target, 1)) / 3; // Logarithmic scaling
        return Math.max(
            this.config.minDuration,
            Math.min(this.config.maxDuration, base * (0.5 + factor))
        );
    }

    // Main animation function
    animateCounter(element, customConfig = null) {
        if (this.animatedStats.has(element)) {
            WinkUtils.log('Stat already animated, skipping');
            return;
        }
        
        const config = customConfig || element._statConfig;
        if (!config || config.target === 0) return;
        
        this.animatedStats.add(element);
        
        WinkUtils.log(`Animating counter: ${config.target}`);
        
        // Add visual feedback
        this.addAnimationEffects(element);
        
        // Start counter animation
        this.runCounterAnimation(element, config);
    }

    // Run the actual counter animation
    runCounterAnimation(element, config) {
        const startTime = performance.now();
        const easingFn = this.easingFunctions[config.easing] || this.easingFunctions.easeOutCubic;
        
        // Store animation reference for potential cancellation
        const animationId = requestAnimationFrame(function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            const easedProgress = easingFn(progress);
            
            // Calculate current value
            const currentValue = config.target * easedProgress;
            
            // Display current value
            this.displayValue(element, currentValue, config);
            
            // Add sound effect at milestones
            if (this.config.enableSound) {
                this.playSoundEffect(progress);
            }
            
            if (progress < 1) {
                this.activeCounters.set(element, requestAnimationFrame(animate.bind(this)));
            } else {
                // Animation complete
                this.displayValue(element, config.target, config);
                this.onAnimationComplete(element, config);
                this.activeCounters.delete(element);
            }
        }.bind(this));
        
        this.activeCounters.set(element, animationId);
    }

    // Display formatted value
    displayValue(element, value, config) {
        let formattedValue;
        
        switch (config.format) {
            case 'percentage':
                formattedValue = this.formatNumber(value, config.decimals) + '%';
                break;
            case 'currency':
                formattedValue = '$' + this.formatNumber(value, config.decimals, config.separator);
                break;
            default:
                formattedValue = this.formatNumber(value, config.decimals, config.separator);
        }
        
        element.textContent = config.prefix + formattedValue + config.suffix;
    }

    // Format number with separators and decimals
    formatNumber(value, decimals = 0, separator = ',') {
        const roundedValue = Number(value.toFixed(decimals));
        const parts = roundedValue.toString().split('.');
        
        // Add thousands separator
        if (separator && parts[0].length > 3) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }
        
        return parts.join('.');
    }

    // Add visual effects during animation
    addAnimationEffects(element) {
        // Pulse effect
        element.style.animation = 'statPulse 0.3s ease';
        
        // Color transition
        const originalColor = getComputedStyle(element).color;
        element.style.color = 'var(--highlight-color)';
        element.style.transition = 'color 0.3s ease';
        
        // Restore original color after animation
        setTimeout(() => {
            element.style.color = originalColor;
        }, 300);
        
        // Scale effect
        setTimeout(() => {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }

    // Handle animation completion
    onAnimationComplete(element, config) {
        WinkUtils.log(`Counter animation completed: ${config.target}`);
        
        // Add completion effect
        element.style.animation = 'statComplete 0.5s ease';
        
        // Add glow effect for large numbers
        if (config.target >= 100) {
            element.style.textShadow = '0 0 10px var(--highlight-color)';
            setTimeout(() => {
                element.style.textShadow = '';
            }, 1000);
        }
        
        // Dispatch completion event
        element.dispatchEvent(new CustomEvent('wink:counterComplete', {
            detail: { target: config.target, element }
        }));
    }

    // Play sound effects (if enabled)
    playSoundEffect(progress) {
        if (!this.config.enableSound) return;
        
        // Play tick sounds at certain intervals
        const milestones = [0.25, 0.5, 0.75, 1];
        const currentMilestone = milestones.find(m => 
            progress >= m && progress < m + 0.05
        );
        
        if (currentMilestone && this.audioContext) {
            this.playTick(440 + (currentMilestone * 220)); // Increasing pitch
        }
    }

    // Simple audio tick (Web Audio API)
    playTick(frequency = 440) {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                WinkUtils.log('Web Audio API not supported');
                return;
            }
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // Bind manual triggers (buttons, etc.)
    bindManualTriggers() {
        const triggers = document.querySelectorAll('[data-stat-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const targetSelector = trigger.getAttribute('data-stat-trigger');
                const targetStat = document.querySelector(targetSelector);
                
                if (targetStat) {
                    this.resetAndAnimate(targetStat);
                }
            });
        });
    }

    // Add click-to-animate feature for demo
    addClickToAnimate() {
        this.stats.forEach(stat => {
            stat.style.cursor = 'pointer';
            stat.title = 'Click to animate';
            
            stat.addEventListener('click', () => {
                this.resetAndAnimate(stat);
            });
        });
    }

    // Reset and re-animate a counter
    resetAndAnimate(element) {
        // Cancel existing animation
        if (this.activeCounters.has(element)) {
            cancelAnimationFrame(this.activeCounters.get(element));
            this.activeCounters.delete(element);
        }
        
        // Reset state
        this.animatedStats.delete(element);
        
        // Reset display
        const config = element._statConfig;
        if (config) {
            this.displayValue(element, 0, config);
            
            // Re-animate after a brief delay
            setTimeout(() => {
                this.animateCounter(element);
            }, 100);
        }
    }

    // Animate all visible counters
    animateAllVisible() {
        this.stats.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (!this.animatedStats.has(stat)) {
                    setTimeout(() => {
                        this.animateCounter(stat);
                    }, Math.random() * 500); // Random delay for stagger effect
                }
            }
        });
    }

    // Reset all counters
    resetAllCounters() {
        this.animatedStats.clear();
        
        this.activeCounters.forEach((animationId, element) => {
            cancelAnimationFrame(animationId);
        });
        this.activeCounters.clear();
        
        this.stats.forEach(stat => {
            const config = stat._statConfig;
            if (config) {
                this.displayValue(stat, 0, config);
            }
        });
        
        WinkUtils.log('All counters reset');
    }

    // Setup scroll fallback for older browsers
    setupScrollFallback() {
        const checkCounters = WinkUtils.throttle(() => {
            this.stats.forEach(stat => {
                if (this.animatedStats.has(stat)) return;
                
                const rect = stat.getBoundingClientRect();
                const threshold = window.innerHeight * this.config.observerThreshold;
                
                if (rect.top < window.innerHeight - threshold) {
                    this.animateCounter(stat);
                }
            });
        }, 100);
        
        window.addEventListener('scroll', checkCounters);
        checkCounters(); // Check initial state
    }

    // Create counter programmatically
    createCounter(target, options = {}) {
        const element = document.createElement('span');
        element.className = 'stat-number';
        element.setAttribute('data-count', target);
        
        // Apply options as data attributes
        Object.entries(options).forEach(([key, value]) => {
            element.setAttribute(`data-${key}`, value);
        });
        
        // Parse config and set initial state
        element._statConfig = this.parseStatConfig(element);
        this.displayValue(element, 0, element._statConfig);
        
        return element;
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Re-parse all elements if needed
        this.parseStatElements();
    }

    // Get animation statistics
    getStats() {
        return {
            totalCounters: this.stats.length,
            animatedCounters: this.animatedStats.size,
            activeAnimations: this.activeCounters.size,
            config: this.config
        };
    }

    // Enable/disable sound effects
    toggleSound(enabled) {
        this.config.enableSound = enabled;
        WinkUtils.log(`Sound effects ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Destroy counter manager
    destroy() {
        // Cancel all active animations
        this.activeCounters.forEach((animationId) => {
            cancelAnimationFrame(animationId);
        });
        this.activeCounters.clear();
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Clean up audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.animatedStats.clear();
        
        WinkUtils.log('Statistics counter manager destroyed');
    }
}

// Add counter animation styles
const statStyles = document.createElement('style');
statStyles.textContent = `
    @keyframes statPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes statComplete {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .stat-number {
        transition: color 0.3s ease, transform 0.2s ease;
        display: inline-block;
    }
    
    .stat-number:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(statStyles);

// Make StatCounterManager globally available
window.StatCounterManager = StatCounterManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatCounterManager;
}
