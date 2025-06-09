// Loading Screen Manager (loading.js)

class LoadingManager {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');
        this.progressBar = document.querySelector('.progress-bar');
        this.loadingText = document.querySelector('.loading-text span');
        this.loadingLogo = document.querySelector('.loading-logo img');
        
        this.progress = 0;
        this.targetProgress = 0;
        this.isComplete = false;
        this.onComplete = null; // Callback for when loading is complete
        
        if (this.loadingScreen) {
            this.init();
        }
    }

    init() {
        WinkUtils.log('Loading screen initialized');
        
        // Prevent body scroll during loading
        document.body.style.overflow = 'hidden';
        
        // Start the loading simulation
        this.simulateResourceLoading();
        this.animateProgress();
        
        // Add logo click easter egg
        this.addEasterEgg();
    }

    // Simulate realistic loading progression
    simulateResourceLoading() {
        const loadingSteps = [
            { text: 'Loading adventures...', progress: 15, delay: 400 },
            { text: 'Preparing experiences...', progress: 35, delay: 600 },
            { text: 'Setting up activities...', progress: 55, delay: 500 },
            { text: 'Loading locations...', progress: 75, delay: 400 },
            { text: 'Finalizing details...', progress: 90, delay: 300 },
            { text: 'Almost ready...', progress: 98, delay: 200 },
            { text: 'Welcome to Korea!', progress: 100, delay: 500 }
        ];

        let currentStep = 0;
        
        const executeStep = () => {
            if (currentStep < loadingSteps.length && !this.isComplete) {
                const step = loadingSteps[currentStep];
                
                // Update text with fade effect
                this.updateLoadingText(step.text);
                
                // Update progress
                this.targetProgress = step.progress;
                
                // Add some randomness to make it feel more realistic
                const randomDelay = step.delay + WinkUtils.random(-100, 100);
                
                setTimeout(() => {
                    currentStep++;
                    if (currentStep < loadingSteps.length) {
                        executeStep();
                    } else {
                        // Loading complete
                        setTimeout(() => this.completeLoading(), 800);
                    }
                }, randomDelay);
            }
        };

        // Start after a brief delay
        setTimeout(executeStep, 600);
    }

    // Update loading text with smooth transition
    updateLoadingText(newText) {
        if (!this.loadingText) return;
        
        // Fade out
        this.loadingText.style.opacity = '0';
        this.loadingText.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            // Update text
            this.loadingText.textContent = newText;
            
            // Fade in
            this.loadingText.style.opacity = '1';
            this.loadingText.style.transform = 'translateY(0)';
        }, 150);
    }

    // Animate progress bar with smooth easing
    animateProgress() {
        const animate = () => {
            if (this.isComplete) return;
            
            // Smooth progress animation with easing
            this.progress = WinkUtils.lerp(this.progress, this.targetProgress, 0.08);
            
            if (this.progressBar) {
                this.progressBar.style.width = this.progress + '%';
            }
            
            // Continue animation
            if (Math.abs(this.progress - this.targetProgress) > 0.1) {
                requestAnimationFrame(animate);
            } else {
                // Snap to target when close enough
                this.progress = this.targetProgress;
                if (this.progressBar) {
                    this.progressBar.style.width = this.progress + '%';
                }
                
                // Continue if not at 100%
                if (this.progress < 100) {
                    setTimeout(() => requestAnimationFrame(animate), 50);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Complete the loading process
    completeLoading() {
        if (this.isComplete) return;
        
        this.isComplete = true;
        WinkUtils.log('Loading complete');
        
        // Final progress animation
        this.targetProgress = 100;
        this.progress = 100;
        
        if (this.progressBar) {
            this.progressBar.style.width = '100%';
        }
        
        // Add completion effects
        this.addCompletionEffects();
        
        // Hide loading screen after effects
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 800);
    }

    // Add visual completion effects
    addCompletionEffects() {
        // Logo success pulse
        if (this.loadingLogo) {
            this.loadingLogo.style.animation = 'none';
            this.loadingLogo.style.transform = 'scale(1.1)';
            this.loadingLogo.style.filter = 'brightness(0) invert(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))';
            
            setTimeout(() => {
                this.loadingLogo.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Progress bar success color
        if (this.progressBar) {
            this.progressBar.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        }
        
        // Text success state
        if (this.loadingText) {
            this.loadingText.style.color = '#ffffff';
            this.loadingText.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        }
    }

    // Hide loading screen with smooth transition
    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        
        // Fade out loading screen
        this.loadingScreen.style.opacity = '0';
        this.loadingScreen.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.loadingScreen.style.visibility = 'hidden';
            this.loadingScreen.style.display = 'none';
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Call completion callback
            if (this.onComplete && typeof this.onComplete === 'function') {
                this.onComplete();
            }
            
            // Dispatch loading complete event
            document.dispatchEvent(new CustomEvent('wink:loadingComplete'));
            
        }, 500);
    }

    // Add fun easter egg - click logo for instant complete
    addEasterEgg() {
        if (this.loadingLogo) {
            let clickCount = 0;
            
            this.loadingLogo.addEventListener('click', () => {
                clickCount++;
                
                // Easter egg: triple click to skip loading
                if (clickCount >= 3 && !this.isComplete) {
                    WinkUtils.log('Easter egg activated - skipping loading');
                    
                    // Flash effect
                    this.loadingLogo.style.filter = 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(255, 255, 255, 1))';
                    
                    setTimeout(() => {
                        this.updateLoadingText('Skipping to adventure! 🚀');
                        this.targetProgress = 100;
                        
                        setTimeout(() => {
                            this.completeLoading();
                        }, 300);
                    }, 100);
                }
                
                // Reset click count after delay
                setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            });
        }
    }

    // Force complete loading (useful for debugging)
    forceComplete() {
        if (this.isComplete) return;
        
        WinkUtils.log('Force completing loading');
        this.updateLoadingText('Loading complete!');
        this.targetProgress = 100;
        
        setTimeout(() => {
            this.completeLoading();
        }, 300);
    }

    // Get current progress
    getProgress() {
        return this.progress;
    }

    // Check if loading is complete
    isLoadingComplete() {
        return this.isComplete;
    }

    // Update progress manually (for external control)
    setProgress(progress, text = null) {
        this.targetProgress = Math.max(0, Math.min(100, progress));
        
        if (text && this.loadingText) {
            this.updateLoadingText(text);
        }
    }

    // Destroy loading manager
    destroy() {
        this.isComplete = true;
        
        if (this.loadingScreen) {
            this.loadingScreen.remove();
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        WinkUtils.log('Loading manager destroyed');
    }
}

// Make LoadingManager globally available
window.LoadingManager = LoadingManager;

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
