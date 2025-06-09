// Language toggle functionality
let currentLanguage = 'en';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ko' : 'en';
    
    // Hide all elements of the current language
    const elementsToHide = document.querySelectorAll(currentLanguage === 'en' ? '.ko' : '.en');
    const elementsToShow = document.querySelectorAll(currentLanguage === 'en' ? '.en' : '.ko');
    
    elementsToHide.forEach(el => el.classList.add('hidden'));
    elementsToShow.forEach(el => el.classList.remove('hidden'));
    
    // Update language button text
    const langBtn = document.getElementById('lang-btn-text');
    langBtn.textContent = currentLanguage === 'en' ? '한국어' : 'English';
}

// Main navigation functionality
function showSection(sectionId) {
    // Hide all main sections
    const sections = document.querySelectorAll('.main-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active nav tab
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the clicked tab
    const activeTab = event.target.closest('.nav-tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Trip info sidebar tab functionality
function showTripTab(tabId) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab content
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update active sidebar tab
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    sidebarTabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the clicked tab
    const activeTab = event.target.closest('.sidebar-tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// FAQ accordion functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherQuestion.parentElement.querySelector('.faq-answer').style.maxHeight = '0';
                    otherQuestion.parentElement.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = '0';
                faqItem.classList.remove('active');
            } else {
                this.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                faqItem.classList.add('active');
            }
        });
    });
}

// Form submission handler
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Basic validation
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.age || !data.emergencyContact || !data.experienceLevel) {
        alert(currentLanguage === 'en' ? 
            'Please fill in all required fields.' : 
            '모든 필수 필드를 작성해 주세요.');
        return;
    }
    
    // Age validation
    if (data.age < 16 || data.age > 80) {
        alert(currentLanguage === 'en' ? 
            'Age must be between 16 and 80 years.' : 
            '나이는 16세에서 80세 사이여야 합니다.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert(currentLanguage === 'en' ? 
            'Please enter a valid email address.' : 
            '유효한 이메일 주소를 입력해 주세요.');
        return;
    }
    
    // Show success message
    alert(currentLanguage === 'en' ? 
        'Thank you for your registration! We will contact you within 24 hours with confirmation and payment details.' : 
        '등록해 주셔서 감사합니다! 24시간 이내에 확인 및 결제 세부사항과 함께 연락드리겠습니다.');
    
    // Reset form
    event.target.reset();
    
    console.log('Registration data:', data);
}

// Smooth scroll for navigation
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ functionality
    initializeFAQ();
    
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target);
        });
    });
    
    // Add form validation styling
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error') && this.value) {
                this.classList.remove('error');
            }
        });
    });
    
    // Mobile menu toggle for responsive design
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navTabs = document.querySelector('.nav-tabs');
    
    if (mobileMenuToggle && navTabs) {
        mobileMenuToggle.addEventListener('click', function() {
            navTabs.classList.toggle('mobile-open');
        });
    }
    
    // Close mobile menu when clicking on a nav item
    const navTabButtons = document.querySelectorAll('.nav-tab');
    navTabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            if (navTabs && navTabs.classList.contains('mobile-open')) {
                navTabs.classList.remove('mobile-open');
            }
        });
    });
    
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
    
    // Parallax effect for header background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});

// Utility function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add animation on scroll
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('animated');
        }
    });
}

// Throttle scroll events for better performance
let ticking = false;
function updateAnimations() {
    animateOnScroll();
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
});

// Scroll to top functionality
function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
}

// Enhanced mobile menu functionality
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navTabs = document.querySelector('.nav-tabs');
    
    if (mobileToggle && navTabs) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navTabs.classList.toggle('mobile-open');
            this.setAttribute('aria-expanded', navTabs.classList.contains('mobile-open'));
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navTabs.contains(e.target) && !mobileToggle.contains(e.target)) {
                navTabs.classList.remove('mobile-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close mobile menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navTabs.classList.remove('mobile-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Enhanced form validation
function enhancedFormValidation() {
    const form = document.getElementById('registration-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error styling
        field.classList.remove('error');
        removeErrorMessage(field);
        
        if (isRequired && !value) {
            isValid = false;
            errorMessage = currentLanguage === 'en' ? 'This field is required' : '이 필드는 필수입니다';
        } else if (value) {
            // Specific field validations
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = currentLanguage === 'en' ? 'Please enter a valid email' : '유효한 이메일을 입력하세요';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = currentLanguage === 'en' ? 'Please enter a valid phone number' : '유효한 전화번호를 입력하세요';
                    }
                    break;
                case 'number':
                    const num = parseInt(value);
                    if (field.id === 'age' && (num < 16 || num > 80)) {
                        isValid = false;
                        errorMessage = currentLanguage === 'en' ? 'Age must be between 16 and 80' : '나이는 16세에서 80세 사이여야 합니다';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            field.classList.add('error');
            showErrorMessage(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ functionality
    initializeFAQ();
    
    // Create scroll to top button
    createScrollToTopButton();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Enhanced form validation
    enhancedFormValidation();
    
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target);
        });
    });
    
    // Close mobile menu when clicking on a nav item
    const navTabButtons = document.querySelectorAll('.nav-tab');
    navTabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            const navTabs = document.querySelector('.nav-tabs');
            if (navTabs && navTabs.classList.contains('mobile-open')) {
                navTabs.classList.remove('mobile-open');
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                if (mobileToggle) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Parallax effect for header background (throttled)
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => animationObserver.observe(el));
    }
    
    // Handle form submission with enhanced validation
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let allValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    allValid = false;
                }
            });
            
            if (allValid) {
                handleFormSubmission(e);
            } else {
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
});

// Export functions for global use
window.toggleLanguage = toggleLanguage;
window.showSection = showSection;
window.showTripTab = showTripTab;
window.handleFormSubmission = handleFormSubmission;
