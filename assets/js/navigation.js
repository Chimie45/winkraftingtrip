// Navigation Manager (navigation.js)

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileToggle = document.querySelector('.mobile-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.lastScrollY = 0;
        this.scrollDirection = 'up';
        this.isScrolling = false;
        this.isMobileMenuOpen = false;
        this.currentSection = '';
        
        // Configuration
        this.config = {
            hideOnScrollDown: true,
            scrollThreshold: 100,
            scrolledThreshold: 50,
            smoothScrollOffset: 80,
            mobileBreakpoint: 768,
            autoCloseDelay: 300
        };
        
        // Throttled scroll handler
        this.throttledScrollHandler = WinkUtils.throttle(() => this.handleScroll(), 10);
        
        if (this.navbar) {
            this.init();
        }
    }

    init() {
        WinkUtils.log('Navigation manager initialized');
        
        this.bindScrollHandler();
        this.bindMobileToggle();
        this.bindSmoothScroll();
        this.bindNavLinkEffects();
        this.bindKeyboardNavigation();
        this.bindResizeHandler();
        this.initActiveSection();
        this.addAccessibilityFeatures();
    }

    // Handle scroll behavior
    bindScrollHandler() {
        window.addEventListener('scroll', this.throttledScrollHandler);
    }

    // Main scroll handler
    handleScroll() {
        if (!this.navbar) return;
        
        const currentScrollY = window.scrollY;
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
        this.isScrolling = true;
        
        // Add/remove scrolled class based on scroll position
        this.updateScrolledState(currentScrollY);
        
        // Hide/show navbar based on scroll direction
        this.updateNavbarVisibility(currentScrollY);
        
        // Update active section
        this.updateActiveSection();
        
        this.lastScrollY = currentScrollY;
        
        // Clear scrolling flag after a delay
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }

    // Update navbar appearance when scrolled
    updateScrolledState(scrollY) {
        const shouldHaveScrolledClass = scrollY > this.config.scrolledThreshold;
        
        if (shouldHaveScrolledClass && !this.navbar.classList.contains('scrolled')) {
            this.navbar.classList.add('scrolled');
            this.animateNavbarChange('scrolled');
        } else if (!shouldHaveScrolledClass && this.navbar.classList.contains('scrolled')) {
            this.navbar.classList.remove('scrolled');
            this.animateNavbarChange('top');
        }
    }

    // Update navbar visibility based on scroll direction
    updateNavbarVisibility(scrollY) {
        if (!this.config.hideOnScrollDown || this.isMobileMenuOpen) return;
        
        if (scrollY > this.config.scrollThreshold) {
            if (this.scrollDirection === 'down') {
                this.hideNavbar();
            } else {
                this.showNavbar();
            }
        } else {
            this.showNavbar();
        }
    }

    // Hide navbar with animation
    hideNavbar() {
        if (this.navbar.style.transform === 'translateY(-100%)') return;
        
        this.navbar.style.transform = 'translateY(-100%)';
        this.navbar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Show navbar with animation
    showNavbar() {
        if (this.navbar.style.transform === 'translateY(0px)' || !this.navbar.style.transform) return;
        
        this.navbar.style.transform = 'translateY(0)';
        this.navbar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Animate navbar changes
    animateNavbarChange(state) {
        this.navbar.style.transition = 'all 0.3s ease';
        
        if (state === 'scrolled') {
            // Add subtle scale effect when scrolled
            requestAnimationFrame(() => {
                this.navbar.style.transform = 'scaleY(0.95)';
                setTimeout(() => {
                    this.navbar.style.transform = 'scaleY(1)';
                }, 100);
            });
        }
    }

    // Mobile menu toggle functionality
    bindMobileToggle() {
        if (!this.mobileToggle) return;
        
        this.mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    // Open mobile menu
    openMobileMenu() {
        this.isMobileMenuOpen = true;
        
        // Update classes
        this.navMenu.classList.add('mobile-open');
        this.mobileToggle.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        this.animateMenuItems('in');
        
        // Update ARIA attributes
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Force navbar to stay visible
        this.showNavbar();
        
        WinkUtils.log('Mobile menu opened');
    }

    // Close mobile menu
    closeMobileMenu() {
        if (!this.isMobileMenuOpen) return;
        
        this.isMobileMenuOpen = false;
        
        // Animate out menu items first
        this.animateMenuItems('out');
        
        setTimeout(() => {
            // Update classes
            this.navMenu.classList.remove('mobile-open');
            this.mobileToggle.classList.remove('active');
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Update ARIA attributes
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.navMenu.setAttribute('aria-hidden', 'true');
        }, this.config.autoCloseDelay);
        
        WinkUtils.log('Mobile menu closed');
    }

    // Animate menu items
    animateMenuItems(direction) {
        const links = this.navMenu.querySelectorAll('.nav-link');
        
        links.forEach((link, index) => {
            if (direction === 'in') {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-20px)';
                link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    link.style.opacity = '1';
                    link.style.transform = 'translateY(0)';
                }, index * 50);
            } else {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-10px)';
            }
        });
    }

    // Smooth scroll functionality
    bindSmoothScroll() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip empty or just hash links
                if (!href || href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    this.smoothScrollTo(targetElement);
                    
                    // Close mobile menu if open
                    if (this.isMobileMenuOpen) {
                        setTimeout(() => this.closeMobileMenu(), 100);
                    }
                }
            });
        });
    }

    // Smooth scroll to element
    smoothScrollTo(element) {
        const elementTop = element.offsetTop - this.config.smoothScrollOffset;
        const startPosition = window.pageYOffset;
        const distance = elementTop - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
        
        let startTime = null;
        
        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition + (distance * ease));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                // Focus the target element for accessibility
                element.focus({ preventScroll: true });
            }
        };
        
        requestAnimationFrame(animateScroll);
    }

    // Add magnetic and hover effects to nav links
    bindNavLinkEffects() {
        this.navLinks.forEach(link => {
            // Skip coming soon links
            if (link.classList.contains('coming-soon')) return;
            
            // Magnetic effect
            link.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= this.config.mobileBreakpoint) return;
                
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                link.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translate(0, 0)';
            });
            
            // Click ripple effect
            link.addEventListener('click', (e) => {
                this.createRippleEffect(e, link);
            });
        });
    }

    // Create ripple effect on click
    createRippleEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: navRipple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // Initialize active section detection
    initActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        
        if (sections.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }

    // Update active section highlighting
    updateActiveSection() {
        // This could be enhanced with more sophisticated logic
        // For now, the IntersectionObserver handles it
    }

    // Set active navigation link
    setActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;
        
        this.currentSection = sectionId;
        
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to matching link
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Add pulse effect
            activeLink.style.animation = 'navPulse 0.3s ease';
            setTimeout(() => {
                activeLink.style.animation = '';
            }, 300);
        }
    }

    // Keyboard navigation support
    bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // Arrow key navigation in mobile menu
            if (this.isMobileMenuOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                this.handleArrowKeyNavigation(e.key);
            }
        });
        
        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Handle arrow key navigation in mobile menu
    handleArrowKeyNavigation(key) {
        const visibleLinks = Array.from(this.navLinks).filter(link => !link.classList.contains('coming-soon'));
        const focusedIndex = visibleLinks.findIndex(link => link === document.activeElement);
        
        let nextIndex;
        if (key === 'ArrowDown') {
            nextIndex = focusedIndex < visibleLinks.length - 1 ? focusedIndex + 1 : 0;
        } else {
            nextIndex = focusedIndex > 0 ? focusedIndex - 1 : visibleLinks.length - 1;
        }
        
        visibleLinks[nextIndex].focus();
    }

    // Handle window resize
    bindResizeHandler() {
        window.addEventListener('resize', WinkUtils.debounce(() => {
            // Close mobile menu if window becomes wide enough
            if (window.innerWidth > this.config.mobileBreakpoint && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));
    }

    // Add accessibility features
    addAccessibilityFeatures() {
        // Set initial ARIA attributes
        if (this.mobileToggle) {
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileToggle.setAttribute('aria-controls', 'navigation-menu');
            this.mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        }
        
        if (this.navMenu) {
            this.navMenu.setAttribute('id', 'navigation-menu');
            this.navMenu.setAttribute('aria-hidden', 'true');
        }
        
        // Add skip link if not present
        this.addSkipLink();
    }

    // Add skip link for accessibility
    addSkipLink() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('main, #main-content, .main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Get current navigation state
    getState() {
        return {
            currentSection: this.currentSection,
            isMobileMenuOpen: this.isMobileMenuOpen,
            scrollDirection: this.scrollDirection,
            lastScrollY: this.lastScrollY,
            isScrolling: this.isScrolling
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Destroy navigation manager
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.throttledScrollHandler);
        
        // Restore original state
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        document.body.style.overflow = '';
        
        WinkUtils.log('Navigation manager destroyed');
    }
}

// Add navigation animation styles
const navStyles = document.createElement('style');
navStyles.textContent = `
    @keyframes navRipple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes navPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(navStyles);

// Make NavigationManager globally available
window.NavigationManager = NavigationManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
