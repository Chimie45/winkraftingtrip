// Language Manager (language.js)

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.isTransitioning = false;
        this.supportedLanguages = ['en', 'kr'];
        this.fallbackLanguage = 'en';
        
        // Language configuration
        this.config = {
            transitionDuration: 300,
            staggerDelay: 20,
            enableAnimations: true
        };
        
        // Cache for translated elements
        this.translatedElements = new Map();
        
        this.init();
    }

    init() {
        WinkUtils.log('Language manager initialized');
        
        // Find all translatable elements
        this.cacheTranslatableElements();
        
        // Bind language toggle buttons
        this.bindLanguageButtons();
        
        // Load stored language preference
        this.loadStoredLanguage();
        
        // Add keyboard shortcut listener
        this.addKeyboardShortcuts();
        
        // Observe for new translatable elements
        this.observeNewElements();
    }

    // Cache all elements with translation attributes
    cacheTranslatableElements() {
        const elements = document.querySelectorAll('[data-en][data-kr]');
        
        elements.forEach(element => {
            const id = this.generateElementId(element);
            this.translatedElements.set(id, {
                element: element,
                translations: {
                    en: element.getAttribute('data-en'),
                    kr: element.getAttribute('data-kr')
                },
                originalText: element.textContent
            });
        });
        
        WinkUtils.log(`Cached ${this.translatedElements.size} translatable elements`);
    }

    // Generate unique ID for element
    generateElementId(element) {
        if (element.id) return element.id;
        
        // Generate ID based on position and content
        const rect = element.getBoundingClientRect();
        const content = element.textContent.substring(0, 20).replace(/\s+/g, '');
        return `lang_${Math.round(rect.top)}_${Math.round(rect.left)}_${content}`.replace(/[^a-zA-Z0-9_]/g, '');
    }

    // Bind language toggle buttons
    bindLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            
            // Validate language is supported
            if (!this.supportedLanguages.includes(lang)) {
                console.warn(`Unsupported language: ${lang}`);
                return;
            }
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.isTransitioning) {
                    WinkUtils.log('Language switch already in progress');
                    return;
                }
                
                if (lang !== this.currentLanguage) {
                    this.switchLanguage(lang);
                }
            });
            
            // Add hover effect
            btn.addEventListener('mouseenter', () => {
                if (lang !== this.currentLanguage) {
                    btn.style.transform = 'scale(1.1)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (lang !== this.currentLanguage) {
                    btn.style.transform = 'scale(1)';
                }
            });
        });
    }

    // Switch to specified language
    async switchLanguage(targetLang) {
        if (!this.supportedLanguages.includes(targetLang)) {
            console.warn(`Cannot switch to unsupported language: ${targetLang}`);
            return;
        }
        
        if (this.isTransitioning || targetLang === this.currentLanguage) {
            return;
        }
        
        WinkUtils.log(`Switching language from ${this.currentLanguage} to ${targetLang}`);
        
        this.isTransitioning = true;
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = targetLang;
        
        try {
            // Update button states immediately
            this.updateLanguageButtons();
            
            // Show transition effect
            if (this.config.enableAnimations) {
                await this.showTransitionEffect();
            }
            
            // Update all content
            await this.updateAllContent();
            
            // Update document language
            this.updateDocumentLanguage();
            
            // Store preference
            this.storeLanguagePreference();
            
            // Dispatch language change event
            this.dispatchLanguageChangeEvent(previousLanguage, targetLang);
            
            // Show success message
            const message = targetLang === 'kr' ? '언어가 변경되었습니다' : 'Language changed successfully';
            WinkUtils.createToast(message, 'success');
            
        } catch (error) {
            console.error('Language switch failed:', error);
            this.currentLanguage = previousLanguage;
            this.updateLanguageButtons();
            WinkUtils.createToast('Language switch failed. Please try again.', 'error');
        } finally {
            this.isTransitioning = false;
        }
    }

    // Show visual transition effect
    async showTransitionEffect() {
        return new Promise(resolve => {
            // Add blur effect to body
            document.body.style.transition = `filter ${this.config.transitionDuration}ms ease`;
            document.body.style.filter = 'blur(2px)';
            
            setTimeout(() => {
                document.body.style.filter = 'none';
                resolve();
            }, this.config.transitionDuration);
        });
    }

    // Update all translatable content
    async updateAllContent() {
        const elements = Array.from(this.translatedElements.values());
        
        // Update elements with staggered animation
        for (let i = 0; i < elements.length; i++) {
            const elementData = elements[i];
            
            if (this.config.enableAnimations) {
                // Animate element change
                this.animateElementChange(elementData.element, () => {
                    this.updateElementContent(elementData);
                });
                
                // Stagger the animations
                if (i % 5 === 0) { // Every 5th element
                    await new Promise(resolve => setTimeout(resolve, this.config.staggerDelay));
                }
            } else {
                this.updateElementContent(elementData);
            }
        }
    }

    // Update individual element content
    updateElementContent(elementData) {
        const { element, translations } = elementData;
        const newText = translations[this.currentLanguage] || translations[this.fallbackLanguage] || elementData.originalText;
        
        if (element.textContent !== newText) {
            element.textContent = newText;
            
            // Add visual feedback
            element.style.color = 'var(--highlight-color)';
            setTimeout(() => {
                element.style.color = '';
            }, 200);
        }
    }

    // Animate individual element change
    animateElementChange(element, updateCallback) {
        // Fade out
        element.style.transition = 'opacity 150ms ease, transform 150ms ease';
        element.style.opacity = '0.7';
        element.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
            // Update content
            updateCallback();
            
            // Fade in
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            // Remove transition after animation
            setTimeout(() => {
                element.style.transition = '';
            }, 150);
        }, 75);
    }

    // Update language button states
    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            const isActive = lang === this.currentLanguage;
            
            btn.classList.toggle('active', isActive);
            
            // Update ARIA attributes
            btn.setAttribute('aria-pressed', isActive.toString());
            
            // Add visual feedback
            if (isActive) {
                btn.style.transform = 'scale(1.05)';
            } else {
                btn.style.transform = 'scale(1)';
            }
        });
    }

    // Update document language attribute
    updateDocumentLanguage() {
        const langCode = this.currentLanguage === 'kr' ? 'ko' : this.currentLanguage;
        document.documentElement.lang = langCode;
        
        // Update title if available
        const titles = {
            en: 'When in Korea - Premium Adventure Tours',
            kr: 'When in Korea - 프리미엄 어드벤처 투어'
        };
        
        if (titles[this.currentLanguage]) {
            document.title = titles[this.currentLanguage];
        }
    }

    // Store language preference
    storeLanguagePreference() {
        WinkUtils.storeLanguage(this.currentLanguage);
        
        // Also store in cookie for server-side detection
        document.cookie = `wink_lang=${this.currentLanguage}; path=/; max-age=31536000`; // 1 year
    }

    // Load stored language preference
    loadStoredLanguage() {
        let storedLang = WinkUtils.getStoredLanguage();
        
        // Check cookie as fallback
        if (!storedLang || storedLang === 'en') {
            const cookieMatch = document.cookie.match(/wink_lang=([^;]+)/);
            if (cookieMatch) {
                storedLang = cookieMatch[1];
            }
        }
        
        // Detect browser language as final fallback
        if (!storedLang || storedLang === 'en') {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('ko')) {
                storedLang = 'kr';
            }
        }
        
        if (storedLang && storedLang !== 'en' && this.supportedLanguages.includes(storedLang)) {
            this.switchLanguage(storedLang);
        } else {
            // Ensure buttons are in correct state for default language
            this.updateLanguageButtons();
        }
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + L to toggle language
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                this.toggleLanguage();
            }
            
            // Alt + 1 for English, Alt + 2 for Korean
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                this.switchLanguage('en');
            }
            
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                this.switchLanguage('kr');
            }
        });
    }

    // Toggle between languages
    toggleLanguage() {
        const nextLang = this.currentLanguage === 'en' ? 'kr' : 'en';
        this.switchLanguage(nextLang);
    }

    // Observe for new translatable elements (for dynamic content)
    observeNewElements() {
        const observer = new MutationObserver((mutations) => {
            let foundNewElements = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node itself is translatable
                        if (node.hasAttribute && node.hasAttribute('data-en') && node.hasAttribute('data-kr')) {
                            this.addTranslatableElement(node);
                            foundNewElements = true;
                        }
                        
                        // Check for translatable children
                        const children = node.querySelectorAll ? node.querySelectorAll('[data-en][data-kr]') : [];
                        children.forEach(child => {
                            this.addTranslatableElement(child);
                            foundNewElements = true;
                        });
                    }
                });
            });
            
            if (foundNewElements) {
                WinkUtils.log('Found new translatable elements, updating...');
                // Update new elements to current language
                this.updateAllContent();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Add new translatable element to cache
    addTranslatableElement(element) {
        const id = this.generateElementId(element);
        
        if (!this.translatedElements.has(id)) {
            this.translatedElements.set(id, {
                element: element,
                translations: {
                    en: element.getAttribute('data-en'),
                    kr: element.getAttribute('data-kr')
                },
                originalText: element.textContent
            });
            
            // Update immediately to current language
            if (this.currentLanguage !== 'en') {
                this.updateElementContent(this.translatedElements.get(id));
            }
        }
    }

    // Dispatch language change event
    dispatchLanguageChangeEvent(previousLang, newLang) {
        const event = new CustomEvent('wink:languageChanged', {
            detail: {
                previousLanguage: previousLang,
                currentLanguage: newLang,
                supportedLanguages: this.supportedLanguages
            }
        });
        
        document.dispatchEvent(event);
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get supported languages
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    // Check if language is supported
    isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }

    // Get translation for specific key (if implementing key-based translations)
    translate(key, lang = this.currentLanguage) {
        // This could be extended to support key-based translations
        // For now, returns the key as fallback
        return key;
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Get statistics
    getStats() {
        return {
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.supportedLanguages,
            translatedElementsCount: this.translatedElements.size,
            isTransitioning: this.isTransitioning
        };
    }

    // Destroy language manager
    destroy() {
        this.translatedElements.clear();
        
        // Remove event listeners
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        
        WinkUtils.log('Language manager destroyed');
    }
}

// Make LanguageManager globally available
window.LanguageManager = LanguageManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}
