// Language state
let currentLanguage = 'en';

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website functionality
function initializeWebsite() {
    // Set default active states
    showSection('trip-info');
    showTripTab('introduction');
    
    // Add event listeners for responsive sidebar
    handleResponsiveSidebar();
}

// Toggle between English and Korean
function toggleLanguage() {
    const langBtnText = document.getElementById('lang-btn-text');
    const enElements = document.querySelectorAll('.en');
    const koElements = document.querySelectorAll('.ko');
    
    if (currentLanguage === 'en') {
        // Switch to Korean
        currentLanguage = 'ko';
        langBtnText.textContent = 'English';
        
        enElements.forEach(el => el.classList.add('hidden'));
        koElements.forEach(el => el.classList.remove('hidden'));
    } else {
        // Switch to English
        currentLanguage = 'en';
        langBtnText.textContent = '한국어';
        
        koElements.forEach(el => el.classList.add('hidden'));
        enElements.forEach(el => el.classList.remove('hidden'));
    }
}

// Show main navigation sections
function showSection(sectionName) {
    // Hide all main sections
    const sections = document.querySelectorAll('.main-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
}

// Show trip info tabs (vertical sidebar tabs)
function showTripTab(tabName) {
    // Hide all trip tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all sidebar tabs
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    sidebarTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to clicked sidebar tab
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // If called programmatically, find the tab by data attribute or content
        const targetTab = document.querySelector(`[onclick="showTripTab('${tabName}')"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
}

// Handle responsive sidebar behavior
function handleResponsiveSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    
    // Add touch/scroll support for mobile sidebar
    if (window.innerWidth <= 768) {
        sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
        sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
}

// Touch event handlers for mobile sidebar scrolling
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    // Reset values
    xDown = null;
    yDown = null;
}

// Form validation for registration
function validateRegistrationForm() {
    const form = document.getElementById('registration-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    // Email validation
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value)) {
        emailInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    
    if (validateRegistrationForm()) {
        // Show success message
        showNotification('Registration submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('registration-form').reset();
    } else {
        // Show error message
        showNotification('Please fill in all required fields correctly.', 'error');
    }
}

// Show notification messages
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '10px';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '1000';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    } else {
        notification.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    handleResponsiveSidebar();
});

// Smooth scrolling for anchor links
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// FAQ toggle functionality
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const isExpanded = element.getAttribute('aria-expanded') === 'true';
    
    element.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
    }
}

// Initialize FAQ functionality
function initializeFAQs() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => toggleFAQ(question));
    });
}

// Call FAQ initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFAQs();
});