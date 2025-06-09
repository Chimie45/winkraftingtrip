// When in Korea (WinK) - Interactive Scripts

// Language Management
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.init();
    }

    init() {
        this.bindLanguageButtons();
        this.loadStoredLanguage();
    }

    bindLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguageButtons(lang);
        this.updateContent(lang);
        this.storeLanguage(lang);
        
        // Add smooth transition effect
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 200);
    }

    updateLanguageButtons(activeLang) {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === activeLang) {
                btn.classList.add('active');
            }
        });
    }

    updateContent(lang) {
        const elements = document.querySelectorAll('[data-en][data-kr]');
        elements.forEach(element => {
            const content = element.getAttribute(`data-${lang}`);
            if (content) {
                element.textContent = content;
            }
        });
        
        // Update document language attribute
        document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';
    }

    storeLanguage(lang) {
        // Store in memory (since localStorage is not available)
        window.selectedLanguage = lang;
    }

    loadStoredLanguage() {
        // Load from memory or default to 'en'
        const storedLang = window.selectedLanguage || 'en';
        if (storedLang !== 'en') {
            this.switchLanguage(storedLang);
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileToggle = document.querySelector('.mobile-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        this.bindScrollHandler();
        this.bindMobileToggle();
        this.bindSmoothScroll();
    }

    bindScrollHandler() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class for styling
            if (currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    bindMobileToggle() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('mobile-open');
        this.mobileToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (this.navMenu.classList.contains('mobile-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    bindSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Close mobile menu if open
                if (this.navMenu.classList.contains('mobile-open')) {
                    this.toggleMobileMenu();
                }
            });
        });
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.createIntersectionObserver();
        this.bindScrollAnimations();
        this.bindHoverEffects();
    }

    createIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            // Observe elements for animation
            const animateElements = document.querySelectorAll('.activity-card, .value-card, .story-text');
            animateElements.forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });
        }
    }

    bindScrollAnimations() {
        // Parallax effect for hero image
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroImage.style.transform = `translateY(${rate}px) scale(1.02)`;
            });
        }
    }

    bindHoverEffects() {
        // Enhanced card hover effects
        const cards = document.querySelectorAll('.activity-card, .value-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Button ripple effect
        const buttons = document.querySelectorAll('.btn, .register-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Form and Interaction Manager
class InteractionManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindFormSubmissions();
        this.bindCtaButtons();
        this.bindComingSoonLinks();
        this.addLoadingStates();
    }

    bindFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        });
    }

    handleFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = 'Sent!';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1500);
        }
    }

    bindCtaButtons() {
        const ctaButtons = document.querySelectorAll('.btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.getAttribute('href') === '#') {
                    e.preventDefault();
                    this.showComingSoonMessage();
                }
            });
        });
    }

    bindComingSoonLinks() {
        const comingSoonLinks = document.querySelectorAll('.coming-soon');
        comingSoonLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoonMessage();
            });
        });
    }

    showComingSoonMessage() {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">🚀</span>
                <span class="toast-message">Coming Soon! Stay tuned for updates.</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    addLoadingStates() {
        // Add loading states to async operations
        const asyncButtons = document.querySelectorAll('[data-async]');
        asyncButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('loading');
                setTimeout(() => {
                    button.classList.remove('loading');
                }, 2000);
            });
        });
    }
}

// Performance and Utility Manager
class UtilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.addKeyboardNavigation();
        this.bindPrintOptimizations();
        this.addErrorHandling();
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading optimization
            img.setAttribute('loading', 'lazy');
            
            // Add error handling
            img.addEventListener('error', () => {
                img.style.display = 'none';
                console.warn(`Failed to load image: ${img.src}`);
            });
            
            // Add load success handler
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        });
    }

    addKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // ESC key closes mobile menu
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu.mobile-open');
                if (navMenu) {
                    const navManager = new NavigationManager();
                    navManager.toggleMobileMenu();
                }
            }
            
            // Tab navigation enhancements
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    bindPrintOptimizations() {
        window.addEventListener('beforeprint', () => {
            // Expand collapsed content for printing
            const collapsedElements = document.querySelectorAll('.collapsed');
            collapsedElements.forEach(el => el.classList.add('print-expanded'));
        });
        
        window.addEventListener('afterprint', () => {
            // Restore collapsed state
            const expandedElements = document.querySelectorAll('.print-expanded');
            expandedElements.forEach(el => el.classList.remove('print-expanded'));
        });
    }

    addErrorHandling() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            // Could send to analytics or show user-friendly message
        });
        
        // Unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new LanguageManager();
    new NavigationManager();
    new AnimationManager();
    new InteractionManager();
    new UtilityManager();
    
    // Add custom styles for dynamic elements
    const dynamicStyles = `
        <style>
            .toast-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: var(--shadow-medium);
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10000;
            }
            
            .toast-notification.show {
                transform: translateX(0);
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .toast-icon {
                font-size: 1.2rem;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .keyboard-navigation *:focus {
                outline: 2px solid var(--highlight-color) !important;
                outline-offset: 2px !important;
            }
            
            .loading {
                position: relative;
                pointer-events: none;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .navbar.scrolled {
                background: rgba(255, 255, 255, 0.98);
                box-shadow: var(--shadow-light);
            }
            
            @media (max-width: 768px) {
                .nav-menu.mobile-open {
                    display: flex;
                    position: fixed;
                    top: 80px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    flex-direction: column;
                    padding: 2rem;
                    gap: 1rem;
                    z-index: 999;
                }
                
                .mobile-toggle.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .mobile-toggle.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .mobile-toggle.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', dynamicStyles);
    
    console.log('🎉 WinK website initialized successfully!');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LanguageManager,
        NavigationManager,
        AnimationManager,
        InteractionManager,
        UtilityManager
    };
}
