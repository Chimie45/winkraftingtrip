// Custom Cursor Manager (cursor.js)

class CursorManager {
    constructor() {
        this.cursor = document.querySelector('.cursor-follower');
        this.dot = document.querySelector('.cursor-dot');
        
        this.mousePos = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.dotPos = { x: 0, y: 0 };
        
        this.isActive = false;
        this.isHovering = false;
        this.cursorState = 'default'; // default, hover, click, special
        
        // Check if device supports custom cursor
        if (this.shouldActivate()) {
            this.init();
        }
    }

    // Check if custom cursor should be activated
    shouldActivate() {
        // Only activate on desktop devices with mouse
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isDesktop = window.innerWidth > 768;
        const hasRequiredElements = this.cursor && this.dot;
        
        return !hasTouch && isDesktop && hasRequiredElements;
    }

    init() {
        WinkUtils.log('Custom cursor initialized');
        
        this.isActive = true;
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        
        // Bind events
        this.bindEvents();
        
        // Start animation loop
        this.animate();
        
        // Set initial positions
        this.setInitialPosition();
    }

    // Set initial cursor position
    setInitialPosition() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        this.mousePos = { x: centerX, y: centerY };
        this.cursorPos = { x: centerX, y: centerY };
        this.dotPos = { x: centerX, y: centerY };
        
        this.updateCursorPosition();
    }

    // Bind all event listeners
    bindEvents() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        // Mouse enter/leave window
        document.addEventListener('mouseenter', () => {
            this.showCursor();
        });

        document.addEventListener('mouseleave', () => {
            this.hideCursor();
        });

        // Interactive elements
        this.bindInteractiveElements();
        
        // Click effects
        this.bindClickEffects();
        
        // Window resize
        window.addEventListener('resize', WinkUtils.debounce(() => {
            if (!this.shouldActivate() && this.isActive) {
                this.destroy();
            } else if (this.shouldActivate() && !this.isActive) {
                this.init();
            }
        }, 250));
    }

    // Bind interactive element hover effects
    bindInteractiveElements() {
        const interactiveSelectors = [
            'a', 'button', 'input', 'textarea', 'select',
            '.activity-card', '.value-card-3d', '.testimonial-card',
            '.nav-link', '.btn', '.filter-btn', '.carousel-btn',
            '.play-button', '.fab', '.map-pin'
        ];

        const interactiveElements = document.querySelectorAll(interactiveSelectors.join(', '));
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setHoverState(true, 'hover'));
            el.addEventListener('mouseleave', () => this.setHoverState(false, 'default'));
        });

        // Special elements with different cursor behavior
        const specialElements = document.querySelectorAll('.play-button, .fab, .premium-badge');
        
        specialElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setHoverState(true, 'special'));
            el.addEventListener('mouseleave', () => this.setHoverState(false, 'default'));
        });

        // Text elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (window.getComputedStyle(el).cursor === 'text' || el.isContentEditable) {
                    this.setHoverState(true, 'text');
                }
            });
            el.addEventListener('mouseleave', () => {
                this.setHoverState(false, 'default');
            });
        });
    }

    // Bind click effects
    bindClickEffects() {
        document.addEventListener('mousedown', () => {
            this.setCursorState('click');
        });

        document.addEventListener('mouseup', () => {
            this.setCursorState(this.isHovering ? 'hover' : 'default');
        });

        // Click ripple effect
        document.addEventListener('click', (e) => {
            this.createClickRipple(e.clientX, e.clientY);
        });
    }

    // Set hover state
    setHoverState(isHovering, state = 'hover') {
        this.isHovering = isHovering;
        this.setCursorState(isHovering ? state : 'default');
    }

    // Set cursor state with visual changes
    setCursorState(state) {
        if (this.cursorState === state) return;
        
        this.cursorState = state;
        
        // Remove existing state classes
        this.cursor.className = 'cursor-follower';
        this.dot.className = 'cursor-dot';
        
        // Apply state-specific styles
        switch (state) {
            case 'hover':
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.cursor.style.opacity = '0.6';
                this.cursor.style.mixBlendMode = 'normal';
                this.cursor.style.background = 'var(--primary-color)';
                break;
                
            case 'click':
                this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
                this.cursor.style.opacity = '0.8';
                this.cursor.style.background = 'var(--highlight-color)';
                break;
                
            case 'special':
                this.cursor.style.transform = 'translate(-50%, -50%) scale(2)';
                this.cursor.style.opacity = '0.7';
                this.cursor.style.background = 'var(--highlight-color)';
                this.cursor.style.mixBlendMode = 'normal';
                break;
                
            case 'text':
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1) scaleX(0.1)';
                this.cursor.style.opacity = '0.8';
                this.cursor.style.background = 'var(--dark-color)';
                this.cursor.style.borderRadius = '2px';
                break;
                
            default: // 'default'
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                this.cursor.style.opacity = '0.3';
                this.cursor.style.mixBlendMode = 'difference';
                this.cursor.style.background = 'var(--primary-color)';
                this.cursor.style.borderRadius = '50%';
                break;
        }
    }

    // Create click ripple effect
    createClickRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            width: 20px;
            height: 20px;
            background: var(--highlight-color);
            border-radius: 50%;
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0);
            animation: cursorRipple 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 9998;
        `;
        
        document.body.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Show cursor
    showCursor() {
        if (!this.isActive) return;
        
        this.cursor.style.opacity = this.cursorState === 'default' ? '0.3' : '0.6';
        this.dot.style.opacity = '1';
    }

    // Hide cursor
    hideCursor() {
        if (!this.isActive) return;
        
        this.cursor.style.opacity = '0';
        this.dot.style.opacity = '0';
    }

    // Update cursor positions
    updateCursorPosition() {
        if (!this.isActive) return;
        
        // Update dot position (immediate)
        this.dotPos.x = this.mousePos.x;
        this.dotPos.y = this.mousePos.y;
        
        this.dot.style.left = this.dotPos.x + 'px';
        this.dot.style.top = this.dotPos.y + 'px';
        
        // Update cursor position (smooth follow)
        this.cursorPos.x = WinkUtils.lerp(this.cursorPos.x, this.mousePos.x, 0.15);
        this.cursorPos.y = WinkUtils.lerp(this.cursorPos.y, this.mousePos.y, 0.15);
        
        this.cursor.style.left = this.cursorPos.x + 'px';
        this.cursor.style.top = this.cursorPos.y + 'px';
    }

    // Animation loop
    animate() {
        if (!this.isActive) return;
        
        this.updateCursorPosition();
        requestAnimationFrame(() => this.animate());
    }

    // Add magnetic effect to element
    addMagneticEffect(element, strength = 0.1) {
        if (!this.isActive) return;
        
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

    // Get current cursor position
    getPosition() {
        return { ...this.cursorPos };
    }

    // Get current cursor state
    getState() {
        return this.cursorState;
    }

    // Temporarily disable cursor
    disable() {
        if (!this.isActive) return;
        
        this.hideCursor();
        document.body.style.cursor = 'auto';
    }

    // Re-enable cursor
    enable() {
        if (!this.isActive) return;
        
        this.showCursor();
        document.body.style.cursor = 'none';
    }

    // Destroy cursor manager
    destroy() {
        if (!this.isActive) return;
        
        WinkUtils.log('Custom cursor destroyed');
        
        this.isActive = false;
        
        // Restore default cursor
        document.body.style.cursor = 'auto';
        
        // Hide custom cursor elements
        if (this.cursor) this.cursor.style.display = 'none';
        if (this.dot) this.dot.style.display = 'none';
        
        // Remove ripples
        const ripples = document.querySelectorAll('.cursor-ripple');
        ripples.forEach(ripple => ripple.remove());
    }
}

// Add cursor ripple animation styles
const cursorStyles = document.createElement('style');
cursorStyles.textContent = `
    @keyframes cursorRipple {
        to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
        }
    }
    
    .cursor-follower,
    .cursor-dot {
        transition: opacity 0.3s ease, transform 0.1s ease;
    }
`;
document.head.appendChild(cursorStyles);

// Make CursorManager globally available
window.CursorManager = CursorManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CursorManager;
}
