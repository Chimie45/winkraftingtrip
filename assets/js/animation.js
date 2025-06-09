// Advanced Animation Manager (animations.js)

class AdvancedAnimationManager {
    constructor() {
        this.animationQueue = [];
        this.activeAnimations = new Set();
        this.observers = new Map();
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            observerOptions: {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            },
            staggerDelay: window.WINK_CONFIG.animations.stagger,
            defaultDuration: window.WINK_CONFIG.animations.duration,
            defaultEasing: window.WINK_CONFIG.animations.easing,
            enableParallax: true,
            enableMagnetic: true,
            reduceMotion: false
        };
        
        // Check for reduced motion preference
        this.checkReducedMotion();
        
        this.init();
    }

    init() {
        WinkUtils.log('Advanced animation manager initialized');
        
        this.createIntersectionObserver();
        this.initScrollAnimations();
        this.initActivityFilters();
        this.init3DCards();
        this.initTimelineAnimation();
        this.initMagneticEffects();
        this.initParallaxEffects();
        this.addRippleEffects();
        this.bindHoverEffects();
        this.startAnimationLoop();
        
        this.isInitialized = true;
    }

    // Check for reduced motion preference
    checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.config.reduceMotion = prefersReducedMotion;
        
        if (prefersReducedMotion) {
            WinkUtils.log('Reduced motion preference detected, limiting animations');
        }
    }

    // Create intersection observer for scroll animations
    createIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            WinkUtils.log('IntersectionObserver not supported, using fallback');
            this.fallbackScrollAnimations();
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.config.observerOptions);
        
        // Observe all animatable elements
        const animatableElements = document.querySelectorAll(
            '.animate-on-scroll, .activity-card, .value-card-3d, .timeline-item, .testimonial-card, .hero-stats, .section-header'
        );
        
        animatableElements.forEach(el => {
            observer.observe(el);
            // Set initial state
            this.setInitialAnimationState(el);
        });
        
        this.observers.set('main', observer);
        WinkUtils.log(`Observing ${animatableElements.length} elements for animations`);
    }

    // Set initial animation state for elements
    setInitialAnimationState(element) {
        if (this.config.reduceMotion) return;
        
        // Don't animate elements that are already visible
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            return;
        }
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = `opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing}, transform ${this.config.defaultDuration}ms ${this.config.defaultEasing}`;
    }

    // Trigger animation for specific element
    triggerElementAnimation(element) {
        if (this.config.reduceMotion) {
            element.classList.add('animate-in');
            return;
        }
        
        // Determine animation type based on element
        if (element.classList.contains('activity-card')) {
            this.animateActivityCard(element);
        } else if (element.classList.contains('timeline-item')) {
            this.animateTimelineItem(element);
        } else if (element.classList.contains('value-card-3d')) {
            this.animate3DCard(element);
        } else if (element.classList.contains('hero-stats')) {
            this.animateHeroStats(element);
        } else if (element.classList.contains('section-header')) {
            this.animateSectionHeader(element);
        } else {
            this.animateGenericElement(element);
        }
        
        element.classList.add('animate-in');
    }

    // Animate activity cards with stagger
    animateActivityCard(card) {
        const cards = Array.from(card.parentNode.children);
        const index = cards.indexOf(card);
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.classList.add('show');
            
            // Animate internal elements
            const image = card.querySelector('.activity-image img');
            const overlay = card.querySelector('.activity-overlay');
            
            if (image) {
                setTimeout(() => {
                    image.style.transform = 'scale(1.02)';
                }, 200);
            }
            
            if (overlay) {
                setTimeout(() => {
                    overlay.style.opacity = '0.9';
                }, 300);
            }
        }, index * this.config.staggerDelay);
    }

    // Animate timeline items
    animateTimelineItem(item) {
        const isEven = Array.from(item.parentNode.children).indexOf(item) % 2 === 0;
        
        item.style.transform = isEven ? 'translateX(-100px)' : 'translateX(100px)';
        item.style.opacity = '0';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
            
            // Animate content after main animation
            const content = item.querySelector('.timeline-content');
            if (content) {
                setTimeout(() => {
                    content.style.transform = 'translateY(0)';
                    content.style.opacity = '1';
                }, 200);
            }
        }, 100);
    }

    // Animate 3D cards
    animate3DCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'perspective(1000px) rotateY(-90deg) scale(0.8)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
            
            // Add floating animation after entrance
            setTimeout(() => {
                card.style.animation = 'float 6s ease-in-out infinite';
            }, 500);
        }, 100);
    }

    // Animate hero statistics with counting effect
    animateHeroStats(statsContainer) {
        const statNumbers = statsContainer.querySelectorAll('.stat-number');
        
        statNumbers.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0) scale(1)';
                
                // Trigger counting animation if StatCounterManager is available
                if (window.winkApp && window.winkApp.getManager('stats')) {
                    window.winkApp.getManager('stats').animateCounter(stat);
                }
            }, index * 200);
        });
    }

    // Animate section headers
    animateSectionHeader(header) {
        const title = header.querySelector('h2, h1');
        const subtitle = header.querySelector('p, .section-subtitle');
        const accentLine = header.querySelector('.accent-line');
        
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 100);
        }
        
        if (accentLine) {
            accentLine.style.width = '0';
            setTimeout(() => {
                accentLine.style.width = '80px';
            }, 300);
        }
        
        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(20px)';
            setTimeout(() => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 500);
        }
    }

    // Generic element animation
    animateGenericElement(element) {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }

    // Initialize scroll-based parallax animations
    initScrollAnimations() {
        if (!this.config.enableParallax || this.config.reduceMotion) return;
        
        const parallaxElements = document.querySelectorAll('.hero-image, .floating-elements, [data-parallax]');
        
        const updateParallax = WinkUtils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                
                if (el.classList.contains('hero-image')) {
                    el.style.transform = `translateY(${yPos}px) scale(1.02)`;
                } else {
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        }, 16); // 60fps
        
        window.addEventListener('scroll', updateParallax);
    }

    // Initialize activity filter animations
    initActivityFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const activityCards = document.querySelectorAll('.activity-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Animate button state change
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.transform = 'scale(1)';
                });
                btn.classList.add('active');
                
                if (!this.config.reduceMotion) {
                    btn.style.transform = 'scale(1.05)';
                    setTimeout(() => btn.style.transform = 'scale(1)', 200);
                }
                
                // Filter and animate cards
                this.filterActivityCards(activityCards, filter);
            });
        });
    }

    // Filter and animate activity cards
    filterActivityCards(cards, filter) {
        const visibleCards = [];
        const hiddenCards = [];
        
        cards.forEach(card => {
            const categories = card.getAttribute('data-category')?.split(' ') || [];
            const shouldShow = filter === 'all' || categories.includes(filter);
            
            if (shouldShow) {
                visibleCards.push(card);
            } else {
                hiddenCards.push(card);
            }
        });
        
        // Hide cards first
        hiddenCards.forEach(card => {
            if (!this.config.reduceMotion) {
                card.style.transform = 'translateY(20px) scale(0.9)';
                card.style.opacity = '0';
            }
            card.classList.remove('show');
            
            setTimeout(() => {
                card.style.display = 'none';
            }, this.config.reduceMotion ? 0 : 300);
        });
        
        // Show cards with stagger
        visibleCards.forEach((card, index) => {
            card.style.display = 'block';
            
            setTimeout(() => {
                if (!this.config.reduceMotion) {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.opacity = '1';
                }
                card.classList.add('show');
            }, this.config.reduceMotion ? 0 : index * 50);
        });
    }

    // Initialize 3D card interactions
    init3DCards() {
        const cards3D = document.querySelectorAll('.value-card-3d');
        
        cards3D.forEach(card => {
            let isFlipped = false;
            
            // Click to flip
            card.addEventListener('click', () => {
                if (this.config.reduceMotion) return;
                
                isFlipped = !isFlipped;
                card.style.transform = `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`;
            });
            
            // Mouse tilt effect
            if (!this.config.reduceMotion && this.config.enableMagnetic) {
                card.addEventListener('mousemove', (e) => {
                    if (isFlipped) return;
                    
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (x - centerX) / 10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    if (!isFlipped) {
                        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                    }
                });
            }
        });
    }

    // Initialize timeline animations
    initTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            if (!this.config.reduceMotion) {
                item.style.opacity = '0';
                item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
            }
        });
    }

    // Initialize magnetic effects for interactive elements
    initMagneticEffects() {
        if (!this.config.enableMagnetic || this.config.reduceMotion) return;
        
        const magneticElements = document.querySelectorAll('.btn, .fab, .play-button, .activity-card');
        
        magneticElements.forEach(el => {
            this.addMagneticEffect(el);
        });
    }

    // Add magnetic effect to element
    addMagneticEffect(element, strength = 0.1) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    }

    // Initialize parallax effects
    initParallaxEffects() {
        if (!this.config.enableParallax || this.config.reduceMotion) return;
        
        // Hero background parallax
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const heroImage = heroSection.querySelector('.hero-image');
            const floatingElements = heroSection.querySelector('.floating-elements');
            
            if (heroImage) heroImage.dataset.parallax = '0.3';
            if (floatingElements) floatingElements.dataset.parallax = '0.2';
        }
        
        // Add parallax to other sections
        const parallaxSections = document.querySelectorAll('.activities-showcase, .values-section');
        parallaxSections.forEach(section => {
            section.dataset.parallax = '0.1';
        });
    }

    // Add ripple effects to interactive elements
    addRippleEffects() {
        if (this.config.reduceMotion) return;
        
        const rippleElements = document.querySelectorAll('.btn, .filter-btn, .carousel-btn, .activity-card');
        
        rippleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.createRipple(e, element);
            });
        });
    }

    // Create ripple effect
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleAnimation 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // Bind hover effects
    bindHoverEffects() {
        if (this.config.reduceMotion) return;
        
        // Enhanced card hover effects
        const cards = document.querySelectorAll('.activity-card, .testimonial-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.zIndex = '1';
            });
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Animation loop for continuous animations
    startAnimationLoop() {
        const animate = () => {
            // Process animation queue
            if (this.animationQueue.length > 0) {
                const animation = this.animationQueue.shift();
                if (typeof animation === 'function') {
                    animation();
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // Add animation to queue
    queueAnimation(animationFn) {
        this.animationQueue.push(animationFn);
    }

    // Create custom animation
    createAnimation(element, properties, duration = this.config.defaultDuration, easing = this.config.defaultEasing) {
        return new Promise(resolve => {
            if (this.config.reduceMotion) {
                // Apply final state immediately
                Object.assign(element.style, properties);
                resolve();
                return;
            }
            
            const startValues = {};
            const endValues = {};
            
            // Parse properties
            for (const [prop, value] of Object.entries(properties)) {
                startValues[prop] = getComputedStyle(element)[prop];
                endValues[prop] = value;
            }
            
            element.style.transition = `all ${duration}ms ${easing}`;
            Object.assign(element.style, endValues);
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    // Fallback for browsers without IntersectionObserver
    fallbackScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const checkElements = WinkUtils.throttle(() => {
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    this.triggerElementAnimation(el);
                }
            });
        }, 100);
        
        window.addEventListener('scroll', checkElements);
        checkElements(); // Check initial state
    }

    // Get animation statistics
    getStats() {
        return {
            isInitialized: this.isInitialized,
            queueLength: this.animationQueue.length,
            activeAnimations: this.activeAnimations.size,
            reduceMotion: this.config.reduceMotion,
            observersCount: this.observers.size
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Re-check reduced motion if changed
        if (newConfig.hasOwnProperty('reduceMotion')) {
            this.checkReducedMotion();
        }
    }

    // Pause all animations
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
        WinkUtils.log('Animations paused');
    }

    // Resume all animations
    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
        WinkUtils.log('Animations resumed');
    }

    // Destroy animation manager
    destroy() {
        // Clear observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear animation queue
        this.animationQueue = [];
        this.activeAnimations.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.throttledScrollHandler);
        
        this.isInitialized = false;
        WinkUtils.log('Animation manager destroyed');
    }
}

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    @keyframes slideInLeft {
        0% { transform: translateX(-100px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        0% { transform: translateX(100px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInScale {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(animationStyles);

// Make AdvancedAnimationManager globally available
window.AdvancedAnimationManager = AdvancedAnimationManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAnimationManager;
}
