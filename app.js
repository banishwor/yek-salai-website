// Yek Salai Website JavaScript
class YekSalaiApp {
    constructor() {
        this.clanData = null;
        this.familyTree = JSON.parse(localStorage.getItem('familyTree')) || [];
        this.userStats = JSON.parse(localStorage.getItem('userStats')) || {
            searches: 0,
            familyTrees: 0
        };
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        
        // Quiz questions
        this.quizQuestions = [
            {
                question: "How many Yek Salai clans are there in Meitei culture?",
                options: ["5", "7", "9", "10"],
                correct: 1
            },
            {
                question: "What does 'Yek Tinnaba' refer to?",
                options: ["Marriage within same clan is prohibited", "Marriage between different clans", "Clan leadership", "Religious ceremony"],
                correct: 0
            },
            {
                question: "Which color is NOT traditionally associated with any Yek Salai?",
                options: ["Red", "Blue", "Green", "Golden"],
                correct: 2
            },
            {
                question: "What is the primary purpose of the Yek Salai system?",
                options: ["Economic organization", "Military structure", "Social organization and marriage regulation", "Religious hierarchy"],
                correct: 2
            },
            {
                question: "What does 'Shairuk Tinnaba' mean?",
                options: ["Same lineage marriage prohibition", "Different clan marriage", "Clan celebration", "Family gathering"],
                correct: 0
            }
        ];
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        await this.loadClanData();
        this.setupEventListeners();
        this.initializeTheme();
        this.updateStats();
        this.initializeClanBrowser();
        this.renderFamilyTree();
        this.showLoading(false);
    }

    async loadClanData() {
        try {
            // Try relative path first (for local development)
            let response = await fetch('./yek_salai_database.json');
            
            // If that fails, try absolute path for GitHub Pages
            if (!response.ok) {
                response = await fetch('/yek-salai-website/yek_salai_database.json');
            }
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const json = await response.json();
            console.log('Raw JSON loaded:', json); // Debug log
            
            // Transform the data structure to match your code
            this.clanData = this.transformClanData(json.clans);
            console.log('Transformed clan data:', this.clanData);
            console.log('Total surnames loaded:', Object.values(this.clanData).reduce((total, clan) => total + (clan.surnames ? clan.surnames.length : 0), 0));
            
        } catch (error) {
            console.error('Failed to load clan data:', error);
            // Keep your fallback but make it obvious
            console.warn('Using fallback data with only 70 surnames');
            this.clanData = {
                "Mangang": { 
                    color: "red", 
                    surnames: ["Meitei", "Rajkumar", "Sagolsem", "Khundrakpam", "Thounaojam", "Soibam", "Mutum", "Khurai", "Ningthoujam", "Laishram"]
                },
                "Luwang": { 
                    color: "white", 
                    surnames: ["Luwang", "Huirem", "Thokchom", "Mayengbam", "Keisham", "Laishram", "Konsam", "Longjam", "Mayanglambam", "Potsangbam"]
                },
                "Khuman": { 
                    color: "dark", 
                    surnames: ["Khuman", "Yumnam", "Oinam", "Moirangthem", "Thongam", "Usham", "Yanglem", "Heisnam", "Thangjam", "Leishangthem"]
                },
                "Angom": { 
                    color: "pink", 
                    surnames: ["Angom", "Sinam", "Khumukcham", "Pukhrambam", "Thiyam", "Khumanthem", "Nongmaithem", "Soraisham", "Wangkhem", "Hijam"]
                },
                "Moirang": { 
                    color: "golden", 
                    surnames: ["Moirang", "Thokchom", "Haobijam", "Yengkhom", "Nameirakpam", "Ningombam", "Maibam", "Kumam", "Thangmeinam", "Phaomei"]
                },
                "Khaba-Nganba": { 
                    color: "black", 
                    surnames: ["Khaba", "Nganba", "Konthoujam", "Elangbam", "Kangabam", "Naorem", "Shamjetsabam", "Khangembam", "Yaikhom", "Th"]
                },
                "Sharang-Leishangthem": { 
                    color: "blue", 
                    surnames: ["Sharang", "Leishangthem", "Ngangom", "Pukhrambam", "Salam", "Wangkhemcha", "Leimapokpam", "Khwairakpam", "Lourembam", "Ayekpam"]
                }
            };
        }
    }

    transformClanData(clans) {
        const transformed = {};
        
        Object.values(clans).forEach(clan => {
            transformed[clan.name] = {
                color: clan.color.toLowerCase(),
                surnames: clan.surnames,
                total_surnames: clan.total_surnames
            };
        });
        
        return transformed;
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', this.toggleTheme.bind(this));
        
        // Navigation
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        // Mobile navigation
        document.getElementById('navToggle')?.addEventListener('click', this.toggleMobileNav.bind(this));
        
        // Hero buttons
        document.querySelectorAll('.hero__actions .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('onclick');
                if (target) {
                    const section = target.match(/navigateToSection\('(.+?)'\)/);
                    if (section) {
                        this.navigateToSection(section[1]);
                    }
                }
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('clanSearchInput');
        const searchBtn = document.getElementById('clanSearchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch(e);
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', this.handleSearch.bind(this));
        }
        
        // Marriage compatibility checker
        document.getElementById('checkCompatibilityBtn')?.addEventListener('click', this.checkMarriageCompatibility.bind(this));
        
        // Family tree functionality
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.openModal('addMemberModal'));
        document.getElementById('exportTreeBtn')?.addEventListener('click', this.exportFamilyTree.bind(this));
        document.getElementById('clearTreeBtn')?.addEventListener('click', this.clearFamilyTree.bind(this));
        
        // Quiz functionality
        document.getElementById('startQuizBtn')?.addEventListener('click', this.startQuiz.bind(this));
        
        // Form submissions
        document.getElementById('addMemberForm')?.addEventListener('submit', this.handleAddMember.bind(this));
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (!searchContainer?.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.querySelector('.theme-toggle .material-icons');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetSection = href.substring(1);
            this.navigateToSection(targetSection);
        }
    }

    navigateToSection(sectionId) {
        console.log('Navigating to section:', sectionId);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section activated:', sectionId);
        } else {
            console.error('Section not found:', sectionId);
        }
        
        // Update navigation
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleMobileNav() {
        const navList = document.querySelector('.nav__list');
        if (navList) {
            navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    handleSearch(e) {
        const query = document.getElementById('clanSearchInput')?.value.trim().toLowerCase();
        
        if (!query) {
            this.hideSearchResults();
            return;
        }
        
        this.performSearch(query);
        this.incrementStat('searches');
    }

    performSearch(query) {
        const results = [];
        
        if (!this.clanData) {
            this.showSearchResults([]);
            return;
        }
        
        // Search through all clans and surnames
        Object.entries(this.clanData).forEach(([clanName, clanInfo]) => {
            if (clanInfo.surnames) {
                clanInfo.surnames.forEach(surname => {
                    if (surname.toLowerCase().includes(query)) {
                        results.push({
                            surname: surname,
                            clan: clanName,
                            color: clanInfo.color
                        });
                    }
                });
            }
        });
        
        this.showSearchResults(results);
    }

    showSearchResults(results) {
        const resultsContainer = document.getElementById('clanSearchResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">No surnames found matching your search.</div>';
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="result-surname">${result.surname}</div>
                    <div class="result-clan">Belongs to ${result.clan} clan</div>
                `;
                resultsContainer.appendChild(resultItem);
            });
        }
        
        resultsContainer.classList.add('active');
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById('clanSearchResults');
        if (resultsContainer) {
            resultsContainer.classList.remove('active');
        }
    }

    initializeClanBrowser() {
        if (!this.clanData) return;
        
        const tabsContainer = document.getElementById('clanTabs');
        const contentContainer = document.getElementById('clanContent');
        
        if (!tabsContainer || !contentContainer) return;
        
        tabsContainer.innerHTML = '';
        
        // Create clan tabs
        Object.keys(this.clanData).forEach((clanName, index) => {
            const tab = document.createElement('button');
            tab.className = `clan-tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = clanName;
            tab.addEventListener('click', () => this.showClanContent(clanName, tab));
            tabsContainer.appendChild(tab);
        });
        
        // Show first clan content
        const firstClan = Object.keys(this.clanData)[0];
        if (firstClan) {
            this.showClanContent(firstClan, tabsContainer.firstChild);
        }
        
        // Initialize clan info grid for learning section
        this.initializeClanInfo();
    }

    showClanContent(clanName, clickedTab) {
        // Update active tab
        document.querySelectorAll('.clan-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
        
        // Show clan surnames
        const contentContainer = document.getElementById('clanContent');
        if (!contentContainer) return;
        
        const clanInfo = this.clanData[clanName];
        
        if (clanInfo && clanInfo.surnames) {
            contentContainer.innerHTML = `
                <h4>${clanName} Clan Surnames (${clanInfo.surnames.length})</h4>
                <div class="clan-surnames">
                    ${clanInfo.surnames.map(surname => `<div class="surname-item">${surname}</div>`).join('')}
                </div>
            `;
        } else {
            contentContainer.innerHTML = `<p>No surname data available for ${clanName}</p>`;
        }
    }

    initializeClanInfo() {
        const clanInfoGrid = document.getElementById('clanInfoGrid');
        if (!clanInfoGrid || !this.clanData) return;
        
        const clanDescriptions = {
            "Mangang": "The royal clan, traditionally associated with leadership and governance.",
            "Luwang": "Known for their administrative skills and scholarly traditions.",
            "Khuman": "Warriors and protectors, known for their bravery in battle.",
            "Angom": "Skilled craftspeople and artisans, keepers of traditional arts.",
            "Moirang": "Merchants and traders, known for their business acumen.",
            "Khaba-Nganba": "Spiritual leaders and keepers of religious traditions.",
            "Sharang-Leishangthem": "Farmers and land managers, connected to agricultural traditions."
        };
        
        clanInfoGrid.innerHTML = Object.entries(this.clanData).map(([clanName, clanInfo]) => `
            <div class="clan-info-card">
                <div class="clan-color clan-color--${clanInfo.color}"></div>
                <div class="clan-name">${clanName}</div>
                <div class="clan-description">${clanDescriptions[clanName] || 'Traditional Meitei clan with rich cultural heritage.'}</div>
            </div>
        `).join('');
    }

    checkMarriageCompatibility() {
        const surname1 = document.getElementById('surname1Input')?.value.trim();
        const surname2 = document.getElementById('surname2Input')?.value.trim();
        
        if (!surname1 || !surname2) {
            this.showCompatibilityResult('error', 'Please enter both surnames', 'Both surnames are required to check compatibility.');
            return;
        }
        
        if (!this.clanData) {
            this.showCompatibilityResult('error', 'Clan data not available', 'Please wait for the clan database to load.');
            return;
        }
        
        // Find clans for both surnames
        const clan1 = this.findClanBySurname(surname1);
        const clan2 = this.findClanBySurname(surname2);
        
        if (!clan1) {
            this.showCompatibilityResult('error', `Surname "${surname1}" not found`, 'This surname is not in our clan database.');
            return;
        }
        
        if (!clan2) {
            this.showCompatibilityResult('error', `Surname "${surname2}" not found`, 'This surname is not in our clan database.');
            return;
        }
        
        // Check compatibility
        if (clan1 === clan2) {
            this.showCompatibilityResult('incompatible', 'Marriage Not Allowed', 
                `Both surnames belong to the same clan (${clan1}). According to Meitei tradition (Yek Tinnaba), marriage within the same clan is prohibited.`);
        } else {
            this.showCompatibilityResult('compatible', 'Marriage Allowed', 
                `${surname1} (${clan1} clan) and ${surname2} (${clan2} clan) can marry according to Meitei traditions.`);
        }
    }

    findClanBySurname(surname) {
        for (const [clanName, clanInfo] of Object.entries(this.clanData)) {
            if (clanInfo.surnames && clanInfo.surnames.some(s => 
                s.toLowerCase() === surname.toLowerCase())) {
                return clanName;
            }
        }
        return null;
    }

    showCompatibilityResult(type, title, description) {
        const resultContainer = document.getElementById('compatibilityResult');
        if (!resultContainer) return;
        
        let iconClass = 'check_circle';
        if (type === 'error' || type === 'incompatible') {
            iconClass = type === 'error' ? 'error' : 'cancel';
        }
        
        resultContainer.innerHTML = `
            <div class="result-icon">
                <span class="material-icons">${iconClass}</span>
            </div>
            <div class="result-title">${title}</div>
            ${description ? `<div class="result-description">${description}</div>` : ''}
        `;
        
        resultContainer.className = `compatibility-result active ${type}`;
    }

    startQuiz() {
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.showQuizQuestion();
    }

    showQuizQuestion() {
        const quizContainer = document.getElementById('quizContainer');
        if (!quizContainer) return;
        
        if (this.currentQuizIndex >= this.quizQuestions.length) {
            this.showQuizResults();
            return;
        }
        
        const question = this.quizQuestions[this.currentQuizIndex];
        
        quizContainer.innerHTML = `
            <div class="quiz-question">
                <h4>Question ${this.currentQuizIndex + 1} of ${this.quizQuestions.length}</h4>
                <p>${question.question}</p>
            </div>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <button class="quiz-option" data-answer="${index}">${option}</button>
                `).join('')}
            </div>
        `;
        
        // Add event listeners to quiz options
        quizContainer.querySelectorAll('.quiz-option').forEach((option, index) => {
            option.addEventListener('click', () => this.selectQuizAnswer(index));
        });
    }

    selectQuizAnswer(selectedIndex) {
        const question = this.quizQuestions[this.currentQuizIndex];
        const options = document.querySelectorAll('.quiz-option');
        
        // Highlight selected option
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === selectedIndex) {
                option.classList.add('selected');
            }
        });
        
        // Check if correct
        if (selectedIndex === question.correct) {
            this.quizScore++;
        }
        
        // Move to next question after delay
        setTimeout(() => {
            this.currentQuizIndex++;
            this.showQuizQuestion();
        }, 1000);
    }

    showQuizResults() {
        const quizContainer = document.getElementById('quizContainer');
        if (!quizContainer) return;
        
        const percentage = Math.round((this.quizScore / this.quizQuestions.length) * 100);
        
        let message = 'Good effort! Keep learning about Meitei culture.';
        if (percentage >= 80) {
            message = 'Excellent! You have great knowledge of Meitei traditions.';
        } else if (percentage >= 60) {
            message = 'Good work! You understand the basics well.';
        }
        
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h4>Quiz Complete!</h4>
                <p>You scored ${this.quizScore} out of ${this.quizQuestions.length} (${percentage}%)</p>
                <p>${message}</p>
                <button class="btn btn--primary" onclick="window.app.startQuiz()">Retake Quiz</button>
            </div>
        `;
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Reset form if it's the add member modal
            if (modalId === 'addMemberModal') {
                const form = document.getElementById('addMemberForm');
                if (form) form.reset();
            }
        }
    }

    handleAddMember(e) {
        e.preventDefault();
        this.saveFamilyMember();
    }

    saveFamilyMember() {
        const name = document.getElementById('memberName')?.value.trim();
        const surname = document.getElementById('memberSurname')?.value.trim();
        const relationship = document.getElementById('memberRelationship')?.value;
        const birthYear = document.getElementById('memberBirthYear')?.value;
        const notes = document.getElementById('memberNotes')?.value.trim();
        
        if (!name || !surname || !relationship) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Find clan for surname
        const clan = this.findClanBySurname(surname);
        
        const member = {
            id: Date.now(),
            name,
            surname,
            clan: clan || 'Unknown',
            relationship,
            birthYear: birthYear || null,
            notes: notes || '',
            dateAdded: new Date().toISOString()
        };
        
        this.familyTree.push(member);
        localStorage.setItem('familyTree', JSON.stringify(this.familyTree));
        
        this.incrementStat('familyTrees');
        this.renderFamilyTree();
        this.closeModal('addMemberModal');
    }

    renderFamilyTree() {
        const container = document.getElementById('familyTreeContainer');
        if (!container) return;
        
        if (this.familyTree.length === 0) {
            container.innerHTML = `
                <div class="tree-placeholder">
                    <span class="material-icons">account_tree</span>
                    <p>Start building your family tree by adding the first family member.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="family-tree-grid">
                ${this.familyTree.map(member => `
                    <div class="family-member">
                        <div class="member-name">${member.name}</div>
                        <div class="member-details">
                            <div>${member.surname} (${member.clan})</div>
                            <div>${member.relationship}</div>
                            ${member.birthYear ? `<div>Born: ${member.birthYear}</div>` : ''}
                            ${member.notes ? `<div>${member.notes}</div>` : ''}
                        </div>
                        <button class="btn btn--sm" onclick="window.app.removeFamilyMember(${member.id})">Remove</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    removeFamilyMember(memberId) {
        if (confirm('Are you sure you want to remove this family member?')) {
            this.familyTree = this.familyTree.filter(member => member.id !== memberId);
            localStorage.setItem('familyTree', JSON.stringify(this.familyTree));
            this.renderFamilyTree();
            this.updateStats();
        }
    }

    exportFamilyTree() {
        if (this.familyTree.length === 0) {
            alert('No family tree data to export');
            return;
        }
        
        const data = JSON.stringify(this.familyTree, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'family-tree.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    clearFamilyTree() {
        if (confirm('Are you sure you want to clear your entire family tree? This cannot be undone.')) {
            this.familyTree = [];
            localStorage.setItem('familyTree', JSON.stringify(this.familyTree));
            this.renderFamilyTree();
            this.updateStats();
        }
    }

    incrementStat(statName) {
        this.userStats[statName]++;
        localStorage.setItem('userStats', JSON.stringify(this.userStats));
        this.updateStats();
    }

    updateStats() {
        // Update homepage statistics
        const searchesElement = document.getElementById('searchesCount');
        const familyTreesElement = document.getElementById('familyTreesCount');
        
        if (searchesElement) {
            searchesElement.textContent = this.userStats.searches;
        }
        
        if (familyTreesElement) {
            familyTreesElement.textContent = this.familyTree.length;
        }
        
        // Update total surnames count
        const totalSurnamesElement = document.getElementById('totalSurnamesCount');
        if (totalSurnamesElement && this.clanData) {
            const totalSurnames = Object.values(this.clanData).reduce((total, clan) => {
                return total + (clan.surnames ? clan.surnames.length : 0);
            }, 0);
            totalSurnamesElement.textContent = totalSurnames + '+';
        }
    }

    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    }
}

// Global functions for event handlers
window.navigateToSection = function(sectionId) {
    if (window.app) {
        window.app.navigateToSection(sectionId);
    }
};

window.closeModal = function(modalId) {
    if (window.app) {
        window.app.closeModal(modalId);
    }
};

window.saveFamilyMember = function() {
    if (window.app) {
        window.app.saveFamilyMember();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new YekSalaiApp();
});