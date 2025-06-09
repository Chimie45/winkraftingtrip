// When in Korea (WinK) - Main Application Scripts (scripts.js)

// Global Configuration
window.WINK_CONFIG = {
    animations: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        stagger: 100
    },
    particles: {
        count: 50,
        speed: 0.5,
        size: { min: 1, max: 3 },
        opacity: { min: 0.1, max: 0.5 }
    },
    carousel: {
        autoplayDelay: 5000,
        transitionDuration: 600
    },
    debug: false
};

// Global Utility Functions
window.WinkUtils = {
    // Throttle function execution
    throttle: (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },

    // Debounce function execution
    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor,

    // Random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,

    // Create DOM element with class and content
    createElement: (tag, className, content) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (content) el.textContent = content;
        return el;
    },

    // Create toast notification
    createToast: (message, type = 'info') => {
        const toast = WinkUtils.createElement('div', `toast-notification toast-${type}`);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🚀'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Log with debug flag
    log: (...args) => {
        if (window.WINK_CONFIG.debug) {
            console.log('[WINK]', ...args);
        }
    },

    // Get stored language preference
    getStoredLanguage: () => window.selectedLanguage || 'en',

    // Store language preference
    storeLanguage: (lang) => {
        window.selectedLanguage = lang;
    }
};

// Main Application Manager
class WinkApp {
    constructor() {
        this.managers = {};
        this.isInitialized = false;
        this.loadingComplete = false;
    }

    // Initialize the application
    async init() {
        if (this.isInitialized) return;
        
        WinkUtils.log('Initializing WinK Application...');
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize loading screen first
            this.initLoadingScreen();
            
            this.isInitialized = true;
            WinkUtils.log('WinK Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize WinK Application:', error);
            this.handleInitError(error);
        }
    }

    // Initialize loading screen
    initLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            // Import and initialize loading manager
            this.loadScript('assets/js/loading.js').then(() => {
                this.managers.loading = new LoadingManager();
                this.managers.loading.onComplete = () => this.onLoadingComplete();
            });
        } else {
            // No loading screen, proceed directly
            this.onLoadingComplete();
        }
    }

    // Called when loading is complete
    onLoadingComplete() {
        this.loadingComplete = true;
        WinkUtils.log('Loading complete, initializing managers...');
        
        // Initialize all other managers
        this.initializeManagers();
    }

    // Initialize all application managers
    async initializeManagers() {
        const managerConfigs = [
            { name: 'cursor', file: 'cursor.js', class: 'CursorManager' },
            { name: 'particles', file: 'particles.js', class: 'ParticleManager' },
            { name: 'language', file: 'language.js', class: 'LanguageManager' },
            { name: 'navigation', file: 'navigation.js', class: 'NavigationManager' },
            { name: 'animations', file: 'animations.js', class: 'AdvancedAnimationManager' },
            { name: 'stats', file: 'stats.js', class: 'StatCounterManager' },
            { name: 'testimonials', file: 'testimonials.js', class: 'TestimonialsManager' },
            { name: 'interactions', file: 'interactions.js', class: 'InteractionManager' },
            { name: 'map', file: 'map.js', class: 'MapManager' },
            { name: 'utilities', file: 'utilities.js', class: 'UtilityManager' }
        ];

        for (const config of managerConfigs) {
            try {
                await this.loadScript(`assets/js/${config.file}`);
                
                // Check if the class exists in global scope
                if (window[config.class]) {
                    this.managers[config.name] = new window[config.class]();
                    WinkUtils.log(`${config.name} manager initialized`);
                } else {
                    WinkUtils.log(`${config.class} not found, skipping ${config.name} manager`);
                }
            } catch (error) {
                console.warn(`Failed to load ${config.name} manager:`, error);
            }
        }

        // All managers initialized
        this.onAllManagersReady();
    }

    // Called when all managers are ready
    onAllManagersReady() {
        WinkUtils.log('All managers initialized successfully');
        
        // Add global event listeners
        this.addGlobalEventListeners();
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('wink:ready', {
            detail: { app: this, managers: this.managers }
        }));

        // Show success message
        WinkUtils.createToast('Welcome to When in Korea! 🇰🇷', 'success');
    }

    // Add global event listeners
    addGlobalEventListeners() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            if (!window.WINK_CONFIG.debug) {
                WinkUtils.createToast('An unexpected error occurred. Please refresh the page.', 'error');
            }
        });

        // Unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });

        // Network status handling
        window.addEventListener('offline', () => {
            WinkUtils.createToast('You are currently offline. Some features may not work.', 'warning');
        });

        window.addEventListener('online', () => {
            WinkUtils.createToast('Connection restored!', 'success');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search (placeholder)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                WinkUtils.createToast('Search feature coming soon! Press Ctrl+K', 'info');
            }

            // Alt + L for language toggle
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                if (this.managers.language) {
                    const currentLang = this.managers.language.currentLanguage || 'en';
                    const newLang = currentLang === 'en' ? 'kr' : 'en';
                    this.managers.language.switchLanguage(newLang);
                }
            }

            // ESC key to close any open modals/menus
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle visibility change (page focus/blur)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                WinkUtils.log('Page hidden');
            } else {
                WinkUtils.log('Page visible');
            }
        });
    }

    // Close all open modals and menus
    closeAllModals() {
        // Close mobile menu
        const mobileMenu = document.querySelector('.nav-menu.mobile-open');
        if (mobileMenu && this.managers.navigation) {
            this.managers.navigation.toggleMobileMenu();
        }

        // Close any video modals
        const videoModals = document.querySelectorAll('.video-modal.show');
        videoModals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Close FAB menu
        const fabMenu = document.querySelector('.floating-actions.active');
        if (fabMenu) {
            fabMenu.classList.remove('active');
        }
    }

    // Load external script
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Handle initialization error
    handleInitError(error) {
        console.error('WinK App initialization failed:', error);
        
        // Show fallback error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #cf3540;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>Oops! Something went wrong</h3>
            <p>Please refresh the page to try again.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #cf3540;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                margin-top: 1rem;
                cursor: pointer;
            ">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Get manager by name
    getManager(name) {
        return this.managers[name];
    }

    // Check if app is ready
    isReady() {
        return this.isInitialized && this.loadingComplete;
    }
}

// Initialize the application
const winkApp = new WinkApp();

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => winkApp.init());
} else {
    winkApp.init();
}

// Make app globally accessible
window.winkApp = winkApp;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WinkApp, winkApp };
}
