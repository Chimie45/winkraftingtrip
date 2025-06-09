// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize active states for main sections and trip info tabs
    showSection('trip-info');
    showTripTab('introduction');

    // Add event listeners for FAQ accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.closest('.faq-item');
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                const otherButton = item.querySelector('.faq-question');
                const otherAnswer = item.querySelector('.faq-answer');
                if (otherButton !== button) {
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle current FAQ item
            if (!isExpanded) {
                button.setAttribute('aria-expanded', 'true');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            } else {
                button.setAttribute('aria-expanded', 'false');
                faqAnswer.style.maxHeight = null;
            }
        });
    });
});

/**
 * Toggles the language of the content between English and Korean.
 */
function toggleLanguage() {
    const isEnglish = document.querySelector('.en').classList.contains('hidden');
    document.querySelectorAll('.en').forEach(el => el.classList.toggle('hidden'));
    document.querySelectorAll('.ko').forEach(el => el.classList.toggle('hidden'));

    const langBtnText = document.getElementById('lang-btn-text');
    if (isEnglish) {
        langBtnText.textContent = 'English';
    } else {
        langBtnText.textContent = '한국어';
    }
}

/**
 * Shows the selected main content section and hides others.
 * @param {string} sectionId - The ID of the section to show (e.g., 'trip-info', 'about', 'register').
 */
function showSection(sectionId) {
    // Hide all main sections
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.remove('hidden');

    // Update active state for navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`button[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

/**
 * Shows the selected trip information tab within the 'Trip Info' section.
 * @param {string} tabId - The ID of the trip info tab to show (e.g., 'introduction', 'rafting').
 */
function showTripTab(tabId) {
    // Hide all trip info tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');

    // Update active state for sidebar tabs
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`button[onclick="showTripTab('${tabId}')"]`).classList.add('active');
}

/**
 * Handles the submission of the registration form.
 * @param {Event} event - The form submission event.
 */
function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // In a real application, you would send this data to a server
    console.log('Form Data:', data);

    // Display a confirmation message
    const currentLang = document.getElementById('lang-btn-text').textContent === '한국어' ? 'en' : 'ko'; // Check current display language
    if (currentLang === 'en') {
        alert('Thank you for your registration! We will contact you within 24 hours with confirmation and payment details.');
    } else {
        alert('등록해 주셔서 감사합니다! 24시간 이내에 확인 및 결제 세부사항과 함께 연락드리겠습니다.');
    }

    form.reset(); // Clear the form after submission
}
