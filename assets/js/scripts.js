// Language translations
const translations = {
  en: {
    title: "2025 Summer Rafting Trip",
    nav: {
      tripInfo: "Trip Info",
      aboutWink: "About WinK",
      register: "Register For Trip"
    },
    tabs: {
      introduction: "Introduction",
      rafting: "Rafting",
      paintball: "Paintball",
      atv: "ATV / Fourwheeling",
      bungee: "Bungee Jumping",
      food: "Food and Lodging",
      transportation: "Transportation",
      faq: "FAQ"
    },
    content: {
      introduction: {
        title: "Welcome to WinK's 2025 Summer Adventure!",
        description: "Join When in Korea (WinK) for an unforgettable summer rafting trip packed with thrilling activities and amazing memories. Experience the best of Korean outdoor adventures with fellow adventurers!"
      },
      rafting: {
        title: "White Water Rafting",
        description: "Experience the thrill of navigating Korea's pristine rivers. Our professional guides will ensure a safe and exciting rafting experience suitable for all skill levels."
      },
      paintball: {
        title: "Tactical Paintball",
        description: "Engage in strategic paintball battles in specially designed arenas. Equipment and safety gear provided for an action-packed experience."
      },
      atv: {
        title: "ATV / Fourwheeling Adventure",
        description: "Explore rugged mountain trails on powerful ATVs. No experience necessary - our instructors will guide you through scenic routes and challenging terrain."
      },
      bungee: {
        title: "Bungee Jumping",
        description: "Take the ultimate leap of faith! Experience the adrenaline rush of bungee jumping from certified platforms with stunning views."
      },
      food: {
        title: "Food and Lodging",
        description: "Enjoy delicious Korean BBQ, traditional meals, and comfortable accommodation. All dietary restrictions can be accommodated with advance notice."
      },
      transportation: {
        title: "Transportation",
        description: "Round-trip transportation from Seoul included. Comfortable buses with experienced drivers will ensure safe and convenient travel to all activity locations."
      },
      faq: {
        title: "Frequently Asked Questions",
        description: "Find answers to common questions about the trip, what to bring, safety measures, and more."
      }
    }
  },
  ko: {
    title: "2025 여름 래프팅 여행",
    nav: {
      tripInfo: "여행 정보",
      aboutWink: "WinK 소개",
      register: "여행 신청"
    },
    tabs: {
      introduction: "소개",
      rafting: "래프팅",
      paintball: "페인트볼",
      atv: "ATV / 사륜차",
      bungee: "번지점프",
      food: "음식과 숙박",
      transportation: "교통",
      faq: "자주 묻는 질문"
    },
    content: {
      introduction: {
        title: "WinK의 2025 여름 모험에 오신 것을 환영합니다!",
        description: "When in Korea (WinK)와 함께 잊을 수 없는 여름 래프팅 여행을 떠나보세요. 스릴 넘치는 활동과 놀라운 추억이 가득합니다. 동료 모험가들과 함께 한국 최고의 야외 모험을 경험하세요!"
      },
      rafting: {
        title: "급류 래프팅",
        description: "한국의 깨끗한 강에서 스릴을 경험하세요. 전문 가이드가 모든 수준에 적합한 안전하고 흥미진진한 래프팅 경험을 보장합니다."
      },
      paintball: {
        title: "전술 페인트볼",
        description: "특별히 설계된 경기장에서 전략적인 페인트볼 전투에 참여하세요. 액션 가득한 경험을 위한 장비와 안전 장비가 제공됩니다."
      },
      atv: {
        title: "ATV / 사륜차 모험",
        description: "강력한 ATV로 험준한 산길을 탐험하세요. 경험이 없어도 괜찮습니다 - 강사가 경치 좋은 루트와 도전적인 지형을 안내해 드립니다."
      },
      bungee: {
        title: "번지점프",
        description: "궁극의 도약을 경험하세요! 멋진 전망을 자랑하는 인증된 플랫폼에서 번지점프의 아드레날린 러시를 경험하세요."
      },
      food: {
        title: "음식과 숙박",
        description: "맛있는 한국 바베큐, 전통 음식, 편안한 숙박 시설을 즐기세요. 사전 통지로 모든 식이 제한 사항을 수용할 수 있습니다."
      },
      transportation: {
        title: "교통",
        description: "서울에서 왕복 교통편이 포함되어 있습니다. 경험 많은 운전사가 있는 편안한 버스로 모든 활동 장소까지 안전하고 편리한 여행을 보장합니다."
      },
      faq: {
        title: "자주 묻는 질문",
        description: "여행, 준비물, 안전 조치 등에 대한 일반적인 질문에 대한 답변을 찾아보세요."
      }
    }
  }
};

// Current language
let currentLang = 'en';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Set up language switcher
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    langSwitcher.addEventListener('change', function() {
      currentLang = this.value;
      updateLanguage();
    });
  }

  // Set up tab functionality
  setupTabs();
  
  // Initial language update
  updateLanguage();
});

// Set up tab click handlers
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      showTab(tabId);
    });
  });
  
  // Show first tab by default
  if (tabButtons.length > 0) {
    showTab('introduction');
  }
}

// Show specific tab with smooth transition
function showTab(tabId) {
  // Update active tab button
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
    if (button.getAttribute('data-tab') === tabId) {
      button.classList.add('active');
    }
  });
  
  // Update content with fade effect
  const contentArea = document.getElementById('content-area');
  const content = translations[currentLang].content[tabId];
  
  if (content && contentArea) {
    // Fade out
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      let imageHtml = '';
      const imageMap = {
        introduction: 'intro.png',
        rafting: 'rafting.png',
        paintball: 'paintball.png',
        atv: 'atv.png'
      };
      
      if (imageMap[tabId]) {
        imageHtml = `<img src="/assets/images/${imageMap[tabId]}" alt="${content.title}" class="content-image">`;
      }
      
      contentArea.innerHTML = `
        <h2>${content.title}</h2>
        ${imageHtml}
        <p>${content.description}</p>
      `;
      
      // Fade in
      contentArea.style.transition = 'all 0.5s ease';
      contentArea.style.opacity = '1';
      contentArea.style.transform = 'translateY(0)';
    }, 300);
  }
}

// Update all text based on current language
function updateLanguage() {
  const t = translations[currentLang];
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = t.title;
  }
  
  // Update navigation
  document.querySelectorAll('[data-nav]').forEach(element => {
    const navKey = element.getAttribute('data-nav');
    if (t.nav[navKey]) {
      element.textContent = t.nav[navKey];
    }
  });
  
  // Update tab labels
  document.querySelectorAll('.tab-button').forEach(button => {
    const tabKey = button.getAttribute('data-tab');
    if (t.tabs[tabKey]) {
      button.textContent = t.tabs[tabKey];
    }
  });
  
  // Update current tab content
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    const tabId = activeTab.getAttribute('data-tab');
    showTab(tabId);
  }
}

// Handle registration form with modern modal
function openRegistrationForm() {
  const message = currentLang === 'en' 
    ? 'Registration will open soon! Get ready for an amazing adventure.' 
    : '등록이 곧 시작됩니다! 놀라운 모험을 준비하세요.';
  
  // Create modern notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 50px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 500;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    z-index: 2000;
    animation: notificationPop 0.5s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Handle About WinK with modern modal
function showAboutWink() {
  const message = currentLang === 'en' 
    ? 'When in Korea (WinK) - Your gateway to Korean adventures!' 
    : 'When in Korea (WinK) - 한국 모험의 관문!';
  
  // Create modern notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 30px 50px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 500;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    z-index: 2000;
    animation: notificationPop 0.5s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes notificationPop {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;
document.head.appendChild(style);
