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
        
        // Traditional Meitei Marriage Rules
        this.marriageRules = {
            "yek_tinnaba": {
                "type": "permanent",
                "description": "Same clan marriage forbidden",
                "check": (clan1, clan2) => clan1.id === clan2.id,
                "severity": "critical",
                "generations": "permanent"
            },
            
            "shairuk_tinnaba": {
                "type": "inter_clan",
                "forbidden_pairs": [
                    ["Khuman", "Luwang"],
                    ["Moirang", "Angom"], 
                    ["Khaba Nganba", "Salang Leisangthem"]
                ],
                "achouba": { "generations": "permanent", "applies_to": "royal" },
                "macha": { "generations": 2, "applies_to": "common" }
            },
            
            "mungnaba": {
                "ee_mungnaba": { 
                    "description": "Two sisters' descendants",
                    "generations": 5,
                    "diagram": "sister1_children ↔ sister2_children"
                },
                "manem_matung": {
                    "male_line": 7,
                    "female_line": 5,
                    "description": "Brother/sister descendants"
                }
            },
            
            "pen_tinnaba": {
                "generations": 3,
                "description": "Same grandmother, different grandfathers",
                "matrilineal": true
            }
        };
        
        // Initialize Enhanced Marriage Checker
        this.enhancedMarriageChecker = new EnhancedMarriageChecker(this.marriageRules);
        
        // Initialize Genealogy Builder
        this.genealogyBuilder = new GenealogyBuilder();
        this.migrateLegacyFamilyTree();
        
        // Initialize Community Features
        this.communityFeatures = new CommunityFeatures();
        
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

    migrateLegacyFamilyTree() {
        // Convert old family tree format to new PersonNode schema
        const legacyTree = JSON.parse(localStorage.getItem('familyTree')) || [];
        
        if (legacyTree.length > 0 && !legacyTree[0].fatherId && !legacyTree[0].motherId) {
            // This is a legacy format, convert it
            const migratedTree = legacyTree.map(member => ({
                id: member.id || `person_${Date.now()}_${Math.random()}`,
                name: member.name,
                surname: member.surname,
                clan: member.clan,
                motherId: null,
                fatherId: null,
                metadata: {
                    birthYear: member.birthYear,
                    deathYear: null,
                    notes: member.notes || '',
                    relationship: member.relationship, // Keep for reference
                    dateAdded: member.dateAdded
                }
            }));
            
            this.familyTree = migratedTree;
            localStorage.setItem('familyTree', JSON.stringify(this.familyTree));
            console.log('Migrated legacy family tree to new schema');
        }
    }

    async loadClanData() {
        try {
            let response;
            let jsonUrl;
            
            // Detect if we're on GitHub Pages
            const isGitHubPages = window.location.hostname === 'banishwor.github.io';
            
            if (isGitHubPages) {
                // Use GitHub Pages path
                jsonUrl = '/yek-salai-website/yek_salai_database.json';
                console.log('Loading from GitHub Pages:', jsonUrl);
                response = await fetch(jsonUrl);
            } else {
                // Use relative path for local development
                jsonUrl = './yek_salai_database.json';
                console.log('Loading locally:', jsonUrl);
                response = await fetch(jsonUrl);
            }
            
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${jsonUrl}`);
            
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
        
        // Map JSON colors to correct CSS classes according to traditional Meitei colors
        const colorMapping = {
            'red': 'red',           // Mangang - Red
            'white': 'white',       // Luwang - White  
            'dark': 'dark',         // Khuman - Black (using 'dark' class name but black color)
            'pink': 'pink',         // Angom - Yellow (using 'pink' class name but yellow color)
            'golden': 'golden',     // Moirang - Red mixed with black
            'black': 'black',       // Khaba-Nganba - Purple (using 'black' class name but purple color)
            'blue': 'blue'          // Salai-Leishangthem - Sky blue
        };
        
        Object.values(clans).forEach(clan => {
            const jsonColor = clan.color.toLowerCase();
            transformed[clan.name] = {
                color: colorMapping[jsonColor] || jsonColor,
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
        
        // Check compatibility using Enhanced Marriage Checker
        const enhancedResult = this.enhancedMarriageChecker.checkCompatibility(surname1, surname2);
        this.showEnhancedCompatibilityResult(enhancedResult);
    }

    checkDetailedCompatibility(clan1, clan2, surname1, surname2) {
        // 1. Check Yek Tinnaba (Same clan prohibition)
        if (this.marriageRules.yek_tinnaba.check({id: clan1}, {id: clan2})) {
            return {
                type: 'incompatible',
                title: 'Marriage Not Allowed - Yek Tinnaba',
                description: `Both surnames belong to the same clan (${clan1}). According to Meitei tradition (Yek Tinnaba), marriage within the same clan is permanently prohibited to prevent inbreeding and maintain clan purity.`
            };
        }

        // 2. Check Shairuk Tinnaba (Inter-clan restrictions)
        const forbiddenPairs = this.marriageRules.shairuk_tinnaba.forbidden_pairs;
        const isShairukRestricted = forbiddenPairs.some(pair => 
            (pair[0] === clan1 && pair[1] === clan2) || 
            (pair[0] === clan2 && pair[1] === clan1)
        );

        if (isShairukRestricted) {
            return {
                type: 'restricted',
                title: 'Marriage Restricted - Shairuk Tinnaba',
                description: `Marriage between ${clan1} and ${clan2} clans is restricted under Shairuk Tinnaba rules. This restriction varies by social status (Achouba/Macha) and may require special consideration or approval from clan elders.`
            };
        }

        // 3. Check Mungnaba (Kinship restrictions) - if we had family history
        // This would require additional family tree analysis

        // 4. If no restrictions found, marriage is allowed
        return {
            type: 'compatible',
            title: 'Marriage Allowed',
            description: `${surname1} (${clan1} clan) and ${surname2} (${clan2} clan) can marry according to traditional Meitei marriage rules. No Yek Tinnaba or Shairuk Tinnaba restrictions apply to this combination.`
        };
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
        if (type === 'error') {
            iconClass = 'error';
        } else if (type === 'incompatible') {
            iconClass = 'cancel';
        } else if (type === 'restricted') {
            iconClass = 'warning';
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

    showEnhancedCompatibilityResult(enhancedResult) {
        const resultContainer = document.getElementById('compatibilityResult');
        if (!resultContainer) return;
        
        let iconClass = 'check_circle';
        if (enhancedResult.severity === 'critical') {
            iconClass = 'cancel';
        } else if (enhancedResult.severity === 'warning') {
            iconClass = 'warning';
        }
        
        resultContainer.innerHTML = `
            <div class="result-icon">
                <span class="material-icons">${iconClass}</span>
            </div>
            <div class="result-title">${enhancedResult.explanation}</div>
            ${enhancedResult.diagram ? `<div class="result-diagram">${enhancedResult.diagram}</div>` : ''}
        `;
        
        resultContainer.className = `compatibility-result active ${enhancedResult.severity}`;
    }

        getMarriageRuleInfo(ruleName) {
        if (!this.marriageRules[ruleName]) {
            return null;
        }

        const rule = this.marriageRules[ruleName];
        let info = {
            name: ruleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: rule.description || '',
            type: rule.type || 'general',
            severity: rule.severity || 'medium',
            generations: rule.generations || 'varies'
        };

        // Add specific details based on rule type
        switch (ruleName) {
            case 'yek_tinnaba':
                info.details = 'Permanent prohibition of marriage within the same clan';
                info.cultural_significance = 'Maintains clan purity and prevents inbreeding';
                break;

            case 'shairuk_tinnaba':
                info.details = `Inter-clan restrictions with ${rule.forbidden_pairs.length} forbidden pairs`;
                info.forbidden_pairs = rule.forbidden_pairs;
                info.achouba = rule.achouba;
                info.macha = rule.macha;
                break;

            case 'mungnaba':
                info.details = 'Kinship-based restrictions through maternal and paternal lines';
                info.ee_mungnaba = rule.ee_mungnaba;
                info.manem_matung = rule.manem_matung;
                break;

            case 'pen_tinnaba':
                info.details = 'Matrilineal descent restrictions';
                info.matrilineal = rule.matrilineal;
                break;
        }

        return info;
    }

    showMarriageRulesEducation() {
        const container = document.getElementById('compatibilityResult');
        if (!container) return;

        const rules = ['yek_tinnaba', 'shairuk_tinnaba', 'mungnaba', 'pen_tinnaba'];
        let html = '<div class="marriage-rules-education">';
        html += '<h3>Meitei Marriage Rules Guide</h3>';
        
        rules.forEach(ruleName => {
            const ruleInfo = this.getMarriageRuleInfo(ruleName);
            if (ruleInfo) {
                html += `
                    <div class="rule-section">
                        <h4>${ruleInfo.name}</h4>
                        <p><strong>Description:</strong> ${ruleInfo.description}</p>
                        <p><strong>Details:</strong> ${ruleInfo.details}</p>
                        <p><strong>Cultural Significance:</strong> ${ruleInfo.cultural_significance}</p>
                        <p><strong>Severity:</strong> <span class="severity-${ruleInfo.severity}">${ruleInfo.severity}</span></p>
                        <p><strong>Generations:</strong> ${ruleInfo.generations}</p>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
        container.className = 'compatibility-result active education';
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
        const birthYear = parseInt(document.getElementById('memberBirthYear')?.value) || null;
        const notes = document.getElementById('memberNotes')?.value.trim();
        
        if (!name || !surname) {
            alert('Please fill in all required fields (Name and Surname)');
            return;
        }
        
        // Find clan for surname
        const clan = this.findClanBySurname(surname);
        
        const personData = {
            name,
            surname,
            clan: clan || 'Unknown',
            birthYear,
            notes
        };
        
        const newPerson = this.genealogyBuilder.addPerson(this.familyTree, personData);
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
        
        // Generate SVG tree visualization
        const treeSVG = this.genealogyBuilder.generateTreeSVG(this.familyTree);
        const generations = this.genealogyBuilder.getGenerations(this.familyTree);
        
        container.innerHTML = `
            <div class="family-tree-controls">
                <div class="tree-view-toggle">
                    <button class="btn btn--sm active" data-view="visual" onclick="window.app.switchTreeView('visual')">Visual Tree</button>
                    <button class="btn btn--sm" data-view="list" onclick="window.app.switchTreeView('list')">List View</button>
                </div>
                <div class="tree-export-buttons">
                    <button class="btn btn--sm" onclick="window.app.exportTreeToPDF()">Export PDF</button>
                    <button class="btn btn--sm" onclick="window.app.exportTreeToGEDCOM()">Export GEDCOM</button>
                </div>
            </div>
            
            <div class="tree-view-container">
                <div id="visual-tree-view" class="tree-view active">
                    <div class="tree-svg-container">
                        ${treeSVG}
                    </div>
                    <div class="family-tree-legend">
                        <div class="legend-item">
                            <div class="legend-arrow"></div>
                            <span>Parent to Child</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-double-arrow"></div>
                            <span>Parental Relationship</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-equals">=</span>
                            <span>Marriage/Partnership</span>
                        </div>
                    </div>
                    <div class="generation-summary">
                        <h4>Generations: ${generations.size}</h4>
                        <p>Total Family Members: ${this.familyTree.length}</p>
                    </div>
                </div>
                
                <div id="list-tree-view" class="tree-view">
                    <div class="family-tree-grid">
                        ${this.familyTree.map(member => `
                            <div class="family-member" data-person-id="${member.id}">
                                <div class="member-name">${member.name}</div>
                                <div class="member-details">
                                    <div>${member.surname} (${member.clan})</div>
                                    ${member.metadata.birthYear ? `<div>Born: ${member.metadata.birthYear}</div>` : ''}
                                    ${member.fatherId || member.motherId ? 
                                        `<div class="parent-info">
                                            ${member.fatherId ? `Father: ${this.getPersonName(member.fatherId)}` : ''}
                                            ${member.motherId ? `Mother: ${this.getPersonName(member.motherId)}` : ''}
                                        </div>` : ''
                                    }
                                    ${member.metadata.notes ? `<div>${member.metadata.notes}</div>` : ''}
                                </div>
                                <div class="member-actions">
                                    <button class="btn btn--sm" onclick="window.app.editFamilyMember('${member.id}')">Edit</button>
                                    <button class="btn btn--sm btn--danger" onclick="window.app.removeFamilyMember('${member.id}')">Remove</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add click handlers for SVG nodes
        this.setupTreeInteractions();
    }

    getPersonName(personId) {
        const person = this.familyTree.find(p => p.id === personId);
        return person ? `${person.name} ${person.surname}` : 'Unknown';
    }

    switchTreeView(viewType) {
        // Toggle view buttons
        document.querySelectorAll('.tree-view-toggle .btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewType) {
                btn.classList.add('active');
            }
        });

        // Toggle view containers
        document.querySelectorAll('.tree-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewType}-tree-view`)?.classList.add('active');
    }

    setupTreeInteractions() {
        // Add click handlers for SVG person nodes
        document.querySelectorAll('.person-node').forEach(node => {
            node.addEventListener('click', (e) => {
                const personId = e.currentTarget.dataset.personId;
                this.selectPerson(personId);
            });
        });
    }

    selectPerson(personId) {
        // Highlight selected person and show details
        document.querySelectorAll('.person-node').forEach(node => {
            node.classList.remove('selected');
        });
        document.querySelector(`[data-person-id="${personId}"]`)?.classList.add('selected');
        
        // Show person details in sidebar or modal
        this.showPersonDetails(personId);
    }

    showPersonDetails(personId) {
        const person = this.familyTree.find(p => p.id === personId);
        if (!person) return;

        const parents = this.genealogyBuilder.getParents(this.familyTree, personId);
        const children = this.genealogyBuilder.getChildren(this.familyTree, personId);
        const siblings = this.genealogyBuilder.getSiblings(this.familyTree, personId);

        console.log('Person Details:', {
            person,
            parents,
            children: children.length,
            siblings: siblings.length
        });
    }

    editFamilyMember(personId) {
        const person = this.familyTree.find(p => p.id === personId);
        if (!person) return;

        // Pre-fill the form with existing data
        document.getElementById('memberName').value = person.name;
        document.getElementById('memberSurname').value = person.surname;
        document.getElementById('memberBirthYear').value = person.metadata.birthYear || '';
        document.getElementById('memberNotes').value = person.metadata.notes || '';

        // Store the ID for updating
        this.editingPersonId = personId;
        
        // Change modal title and button text
        const modal = document.getElementById('addMemberModal');
        if (modal) {
            modal.querySelector('h3').textContent = 'Edit Family Member';
            // You might want to change the submit button text too
        }

        this.openModal('addMemberModal');
    }

    removeFamilyMember(memberId) {
        if (confirm('Are you sure you want to remove this family member?')) {
            this.genealogyBuilder.deletePerson(this.familyTree, memberId);
            localStorage.setItem('familyTree', JSON.stringify(this.familyTree));
            this.renderFamilyTree();
            this.updateStats();
        }
    }

    exportTreeToPDF() {
        // Create a simple PDF export using the browser's print functionality
        const printWindow = window.open('', '_blank');
        const treeSVG = this.genealogyBuilder.generateTreeSVG(this.familyTree);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Family Tree - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .tree-svg-container { text-align: center; }
                    .family-list { margin-top: 30px; }
                    .family-member { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
                    @media print { 
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Yek Salai Family Tree</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                
                <div class="tree-svg-container">
                    ${treeSVG}
                </div>
                
                <div class="family-list">
                    <h2>Family Members</h2>
                    ${this.familyTree.map(person => `
                        <div class="family-member">
                            <strong>${person.name} ${person.surname}</strong> (${person.clan})<br>
                            ${person.metadata.birthYear ? `Born: ${person.metadata.birthYear}<br>` : ''}
                            ${person.metadata.notes ? `Notes: ${person.metadata.notes}` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    exportTreeToGEDCOM() {
        const gedcomData = this.genealogyBuilder.exportToGEDCOM(this.familyTree);
        const blob = new Blob([gedcomData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-tree-${new Date().toISOString().split('T')[0]}.ged`;
        a.click();
        
        URL.revokeObjectURL(url);
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

// Enhanced Marriage Checker Class
class EnhancedMarriageChecker {
    constructor(marriageRules) {
        this.marriageRules = marriageRules;
    }
    
    checkCompatibility(surname1, surname2) {
        const result = {
            compatible: true,
            violations: [],
            warnings: [],
            explanation: "",
            diagram: null,
            severity: "none"
        };
        
        // 1. Check Yek Tinnaba (Same clan prohibition)
        if (this.checkYekTinnaba(surname1, surname2)) {
            result.violations.push({
                rule: "Yek Tinnaba",
                severity: "critical",
                message: "Same clan marriage strictly prohibited",
                generations: "permanent",
                reason: "Common ancestor descent"
            });
        }
        
        // 2. Check Shairuk Tinnaba (Inter-clan restrictions)
        const shairukViolation = this.checkShairukTinnaba(surname1, surname2);
        if (shairukViolation) {
            result.violations.push(shairukViolation);
        }
        
        return this.generateDetailedResult(result);
    }
    
    checkYekTinnaba(surname1, surname2) {
        // Find clans for both surnames
        const clan1 = this.findClanBySurname(surname1);
        const clan2 = this.findClanBySurname(surname2);
        
        // Use the enhanced rule checking from marriageRules
        if (window.app && window.app.marriageRules) {
            return window.app.marriageRules.yek_tinnaba.check({id: clan1}, {id: clan2});
        }
        
        // Fallback to simple comparison
        return clan1 && clan2 && clan1 === clan2;
    }
    
    checkShairukTinnaba(surname1, surname2) {
        const clan1 = this.findClanBySurname(surname1);
        const clan2 = this.findClanBySurname(surname2);
        
        if (!clan1 || !clan2) return null;
        
        const forbiddenPairs = this.marriageRules.shairuk_tinnaba.forbidden_pairs;
        const isRestricted = forbiddenPairs.some(pair => 
            (pair[0] === clan1 && pair[1] === clan2) || 
            (pair[0] === clan2 && pair[1] === clan1)
        );
        
        if (isRestricted) {
            return {
                rule: "Shairuk Tinnaba",
                severity: "warning",
                message: `Marriage between ${clan1} and ${clan2} clans requires special consideration`,
                generations: "varies by social status",
                reason: "Inter-clan lineage restrictions"
            };
        }
        
        return null;
    }
    

    
    generateDetailedResult(result) {
        if (result.violations.length > 0) {
            result.compatible = false;
            result.severity = result.violations.some(v => v.severity === "critical") ? "critical" : "warning";
            
            // Generate explanation
            const criticalViolations = result.violations.filter(v => v.severity === "critical");
            const warningViolations = result.violations.filter(v => v.severity === "warning");
            
            if (criticalViolations.length > 0) {
                result.explanation = `Marriage is strictly prohibited due to: ${criticalViolations.map(v => v.rule).join(', ')}`;
            } else {
                result.explanation = `Marriage requires special consideration due to: ${warningViolations.map(v => v.rule).join(', ')}`;
            }
            
            // Generate diagram for the most severe violation
            const primaryViolation = criticalViolations[0] || warningViolations[0];
            result.diagram = this.generateLineageDiagram(primaryViolation);
        } else {
            result.explanation = "Marriage is permitted according to traditional Meitei marriage rules";
        }
        
        return result;
    }
    
    generateLineageDiagram(violation) {
        // Generate SVG lineage diagram showing prohibited relationship
        const ruleName = violation.rule || "Marriage Rule";
        const generations = violation.generations || "varies";
        
        return `
            <svg class="lineage-diagram" width="400" height="250" viewBox="0 0 400 250">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                    </marker>
                    <marker id="prohibited" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                        <polygon points="0 0, 12 4, 0 8" fill="#ff4444" />
                    </marker>
                </defs>
                
                <!-- Background -->
                <rect width="400" height="250" fill="#f8f9fa" rx="10"/>
                
                <!-- Common Ancestor -->
                <g class="ancestor-node" transform="translate(200, 40)">
                    <circle r="25" fill="#ff4444" stroke="#fff" stroke-width="3"/>
                    <text x="0" y="8" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">Common</text>
                    <text x="0" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">Ancestor</text>
                </g>
                
                <!-- Descendant Lines -->
                <g class="descendant-lines">
                    <!-- Left lineage -->
                    <line x1="175" y1="65" x2="100" y2="120" stroke="#666" stroke-width="3" marker-end="url(#arrow)"/>
                    <line x1="100" y1="120" x2="100" y2="160" stroke="#666" stroke-width="2"/>
                    
                    <!-- Right lineage -->
                    <line x1="225" y1="65" x2="300" y2="120" stroke="#666" stroke-width="3" marker-end="url(#arrow)"/>
                    <line x1="300" y1="120" x2="300" y2="160" stroke="#666" stroke-width="2"/>
                    
                    <!-- Prohibited marriage line -->
                    <line x1="100" y1="180" x2="300" y2="180" stroke="#ff4444" stroke-width="4" stroke-dasharray="8,4" marker-end="url(#prohibited)"/>
                    <text x="200" y="170" text-anchor="middle" font-size="12" font-weight="bold" fill="#ff4444">MARRIAGE PROHIBITED</text>
                    
                    <!-- Descendant nodes -->
                    <circle cx="100" cy="140" r="18" fill="#4CAF50" stroke="#fff" stroke-width="3"/>
                    <circle cx="300" cy="140" r="18" fill="#4CAF50" stroke="#fff" stroke-width="3"/>
                    
                    <!-- Generation indicators -->
                    <text x="100" y="200" text-anchor="middle" font-size="11" fill="#666">Generation ${generations}</text>
                    <text x="300" y="200" text-anchor="middle" font-size="11" fill="#666">Generation ${generations}</text>
                    
                    <!-- Labels -->
                    <text x="100" y="230" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Lineage 1</text>
                    <text x="300" y="230" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Lineage 2</text>
                </g>
                
                <!-- Rule label -->
                <text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="#ff4444">${ruleName}</text>
                
                <!-- Severity indicator -->
                <circle cx="350" cy="30" r="15" fill="${violation.severity === 'critical' ? '#ff4444' : '#ffaa00'}" stroke="#fff" stroke-width="2"/>
                <text x="350" y="35" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">${violation.severity === 'critical' ? '!' : '?'}</text>
            </svg>
        `;
    }
    
    findClanBySurname(surname) {
        // This method should access the clan data from the main app
        // For now, we'll implement a basic version
        if (window.app && window.app.clanData) {
            for (const [clanName, clanInfo] of Object.entries(window.app.clanData)) {
                if (clanInfo.surnames && clanInfo.surnames.some(s => 
                    s.toLowerCase() === surname.toLowerCase())) {
                    return clanName;
                }
            }
        }
        return null;
    }
}

// Genealogy Builder Class
class GenealogyBuilder {
    constructor() {
        this.selectedPersonId = null;
        this.draggedPersonId = null;
    }

    /**
     * PersonNode Schema:
     * {
     *   id: string (unique identifier)
     *   name: string
     *   surname: string  
     *   clan: string
     *   motherId: string | null
     *   fatherId: string | null
     *   metadata: {
     *     birthYear: number | null
     *     deathYear: number | null
     *     birthPlace: string | null
     *     deathPlace: string | null
     *     notes: string
     *     photos: string[] (URLs or base64)
     *     dateAdded: string (ISO date)
     *     lastModified: string (ISO date)
     *   }
     * }
     */

    createPersonNode(personData) {
        const timestamp = new Date().toISOString();
        return {
            id: personData.id || `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: personData.name || '',
            surname: personData.surname || '',
            clan: personData.clan || 'Unknown',
            motherId: personData.motherId || null,
            fatherId: personData.fatherId || null,
            metadata: {
                birthYear: personData.birthYear || null,
                deathYear: personData.deathYear || null,
                birthPlace: personData.birthPlace || null,
                deathPlace: personData.deathPlace || null,
                notes: personData.notes || '',
                photos: personData.photos || [],
                dateAdded: personData.dateAdded || timestamp,
                lastModified: timestamp
            }
        };
    }

    addPerson(familyTree, personData) {
        const newPerson = this.createPersonNode(personData);
        familyTree.push(newPerson);
        return newPerson;
    }

    updatePerson(familyTree, personId, updates) {
        const personIndex = familyTree.findIndex(p => p.id === personId);
        if (personIndex === -1) return null;

        const person = familyTree[personIndex];
        Object.assign(person, updates);
        person.metadata.lastModified = new Date().toISOString();
        
        return person;
    }

    deletePerson(familyTree, personId) {
        // Remove the person and update any children to remove parent references
        const personIndex = familyTree.findIndex(p => p.id === personId);
        if (personIndex === -1) return false;

        // Update children to remove parent reference
        familyTree.forEach(person => {
            if (person.fatherId === personId) person.fatherId = null;
            if (person.motherId === personId) person.motherId = null;
        });

        familyTree.splice(personIndex, 1);
        return true;
    }

    setParentChild(familyTree, childId, parentId, parentType) {
        const child = familyTree.find(p => p.id === childId);
        const parent = familyTree.find(p => p.id === parentId);
        
        if (!child || !parent) return false;

        if (parentType === 'father') {
            child.fatherId = parentId;
        } else if (parentType === 'mother') {
            child.motherId = parentId;
        }

        child.metadata.lastModified = new Date().toISOString();
        return true;
    }

    getGenerations(familyTree) {
        const generations = new Map();
        const visited = new Set();

        function calculateGeneration(personId, currentGen = 0) {
            if (visited.has(personId)) return;
            visited.add(personId);

            const person = familyTree.find(p => p.id === personId);
            if (!person) return;

            if (!generations.has(currentGen)) {
                generations.set(currentGen, []);
            }
            generations.get(currentGen).push(person);

            // Find children
            const children = familyTree.filter(p => p.fatherId === personId || p.motherId === personId);
            children.forEach(child => {
                calculateGeneration(child.id, currentGen + 1);
            });
        }

        // Start with people who have no parents (root generation)
        const rootPeople = familyTree.filter(p => !p.fatherId && !p.motherId);
        rootPeople.forEach(person => {
            calculateGeneration(person.id, 0);
        });

        return generations;
    }

    getChildren(familyTree, personId) {
        return familyTree.filter(p => p.fatherId === personId || p.motherId === personId);
    }

    getParents(familyTree, personId) {
        const person = familyTree.find(p => p.id === personId);
        if (!person) return { father: null, mother: null };

        return {
            father: person.fatherId ? familyTree.find(p => p.id === person.fatherId) : null,
            mother: person.motherId ? familyTree.find(p => p.id === person.motherId) : null
        };
    }

    getSiblings(familyTree, personId) {
        const person = familyTree.find(p => p.id === personId);
        if (!person) return [];

        return familyTree.filter(p => 
            p.id !== personId && 
            ((p.fatherId && p.fatherId === person.fatherId) || 
             (p.motherId && p.motherId === person.motherId))
        );
    }

    exportToGEDCOM(familyTree) {
        let gedcom = '0 HEAD\n';
        gedcom += '1 SOUR Yek Salai Website\n';
        gedcom += '1 GEDC\n';
        gedcom += '2 VERS 5.5.1\n';
        gedcom += '2 FORM LINEAGE-LINKED\n';
        gedcom += '1 CHAR UTF-8\n';
        gedcom += '1 DATE ' + new Date().toISOString().split('T')[0].replace(/-/g, ' ') + '\n';

        // Add individuals
        familyTree.forEach((person, index) => {
            const id = `I${index + 1}`;
            gedcom += `0 @${id}@ INDI\n`;
            gedcom += `1 NAME ${person.name} /${person.surname}/\n`;
            
            if (person.metadata.birthYear) {
                gedcom += '1 BIRT\n';
                gedcom += `2 DATE ${person.metadata.birthYear}\n`;
                if (person.metadata.birthPlace) {
                    gedcom += `2 PLAC ${person.metadata.birthPlace}\n`;
                }
            }
            
            if (person.metadata.deathYear) {
                gedcom += '1 DEAT\n';
                gedcom += `2 DATE ${person.metadata.deathYear}\n`;
                if (person.metadata.deathPlace) {
                    gedcom += `2 PLAC ${person.metadata.deathPlace}\n`;
                }
            }

            if (person.metadata.notes) {
                gedcom += `1 NOTE ${person.metadata.notes}\n`;
            }
        });

        // Add families (parent-child relationships)
        const families = this.extractFamilies(familyTree);
        families.forEach((family, index) => {
            const famId = `F${index + 1}`;
            gedcom += `0 @${famId}@ FAM\n`;
            
            if (family.father) {
                const fatherIndex = familyTree.findIndex(p => p.id === family.father.id);
                gedcom += `1 HUSB @I${fatherIndex + 1}@\n`;
            }
            
            if (family.mother) {
                const motherIndex = familyTree.findIndex(p => p.id === family.mother.id);
                gedcom += `1 WIFE @I${motherIndex + 1}@\n`;
            }
            
            family.children.forEach(child => {
                const childIndex = familyTree.findIndex(p => p.id === child.id);
                gedcom += `1 CHIL @I${childIndex + 1}@\n`;
            });
        });

        gedcom += '0 TRLR\n';
        return gedcom;
    }

    extractFamilies(familyTree) {
        const families = [];
        const processedPairs = new Set();

        familyTree.forEach(person => {
            if (person.fatherId || person.motherId) {
                const father = person.fatherId ? familyTree.find(p => p.id === person.fatherId) : null;
                const mother = person.motherId ? familyTree.find(p => p.id === person.motherId) : null;
                
                const pairKey = `${person.fatherId || 'none'}-${person.motherId || 'none'}`;
                
                if (!processedPairs.has(pairKey)) {
                    processedPairs.add(pairKey);
                    
                    const children = familyTree.filter(p => 
                        (person.fatherId && p.fatherId === person.fatherId) ||
                        (person.motherId && p.motherId === person.motherId)
                    );
                    
                    families.push({
                        father,
                        mother,
                        children
                    });
                }
            }
        });

        return families;
    }

    generateTreeSVG(familyTree) {
        const generations = this.getGenerations(familyTree);
        const svgWidth = Math.max(800, generations.size * 200);
        const svgHeight = Math.max(600, [...generations.values()].reduce((max, gen) => Math.max(max, gen.length), 0) * 150);
        
        let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
        svg += '<defs>';
        svg += '<style>.person-node { cursor: pointer; } .person-text { font-family: Arial, sans-serif; font-size: 12px; }</style>';
        
        // Define arrow markers
        svg += '<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">';
        svg += '<polygon points="0 0, 10 3.5, 0 7" fill="#666" />';
        svg += '</marker>';
        
        svg += '<marker id="doubleArrow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">';
        svg += '<polygon points="0 0, 12 4, 0 8" fill="#1976d2" />';
        svg += '</marker>';
        
        svg += '</defs>';
        
        // Draw generations
        generations.forEach((people, genLevel) => {
            const y = 100 + (genLevel * 150);
            const spacing = svgWidth / (people.length + 1);
            
            people.forEach((person, index) => {
                const x = spacing * (index + 1);
                
                // Person node
                svg += `<g class="person-node" data-person-id="${person.id}">`;
                svg += `<rect x="${x - 50}" y="${y - 30}" width="100" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5"/>`;
                svg += `<text x="${x}" y="${y - 10}" text-anchor="middle" class="person-text">${person.name}</text>`;
                svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" class="person-text">${person.surname}</text>`;
                svg += `<text x="${x}" y="${y + 20}" text-anchor="middle" class="person-text" font-size="10">${person.clan}</text>`;
                svg += '</g>';
                
                // Draw connections to parents
                const parents = this.getParents(familyTree, person.id);
                if (parents.father || parents.mother) {
                    // Find parent positions in previous generation
                    const parentGen = generations.get(genLevel - 1);
                    if (parentGen) {
                        const parentY = 100 + ((genLevel - 1) * 150);
                        
                        if (parents.father) {
                            const fatherIndex = parentGen.findIndex(p => p.id === parents.father.id);
                            if (fatherIndex !== -1) {
                                const fatherX = spacing * (fatherIndex + 1);
                                // Draw arrow from father to child
                                svg += `<line x1="${fatherX}" y1="${parentY + 30}" x2="${x}" y2="${y - 30}" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>`;
                            }
                        }
                        
                        if (parents.mother) {
                            const motherIndex = parentGen.findIndex(p => p.id === parents.mother.id);
                            if (motherIndex !== -1) {
                                const motherX = spacing * (motherIndex + 1);
                                // Draw arrow from mother to child
                                svg += `<line x1="${motherX}" y1="${parentY + 30}" x2="${x}" y2="${y - 30}" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>`;
                            }
                        }
                    }
                }
            });
            
            // Draw parental relationship arrows (double-sided arrows between father and mother)
            if (genLevel > 0) {
                const parentGen = generations.get(genLevel - 1);
                if (parentGen) {
                    const parentY = 100 + ((genLevel - 1) * 150);
                    
                    // Group people by family (same father and mother)
                    const families = new Map();
                    parentGen.forEach(person => {
                        const children = familyTree.filter(p => 
                            p.fatherId === person.id || p.motherId === person.id
                        );
                        
                        children.forEach(child => {
                            const familyKey = `${child.fatherId || 'none'}-${child.motherId || 'none'}`;
                            if (!families.has(familyKey)) {
                                families.set(familyKey, { father: null, mother: null, children: [] });
                            }
                            const family = families.get(familyKey);
                            if (child.fatherId === person.id) {
                                family.father = person;
                            }
                            if (child.motherId === person.id) {
                                family.mother = person;
                            }
                            family.children.push(child);
                        });
                    });
                    
                    // Draw double-sided arrows between parents
                    families.forEach(family => {
                        if (family.father && family.mother) {
                            const fatherIndex = parentGen.findIndex(p => p.id === family.father.id);
                            const motherIndex = parentGen.findIndex(p => p.id === family.mother.id);
                            
                            if (fatherIndex !== -1 && motherIndex !== -1) {
                                const fatherX = spacing * (fatherIndex + 1);
                                const motherX = spacing * (motherIndex + 1);
                                
                                // Draw double-sided arrow between father and mother
                                const midY = parentY + 60; // Below the parent boxes
                                const midX = (fatherX + motherX) / 2;
                                
                                // Left arrow (father to mother)
                                svg += `<line x1="${fatherX + 25}" y1="${midY}" x2="${midX - 10}" y2="${midY}" stroke="#1976d2" stroke-width="3" marker-end="url(#doubleArrow)"/>`;
                                
                                // Right arrow (mother to father)
                                svg += `<line x1="${motherX - 25}" y1="${midY}" x2="${midX + 10}" y2="${midY}" stroke="#1976d2" stroke-width="3" marker-end="url(#doubleArrow)"/>`;
                                
                                // Add equals sign in the middle
                                svg += `<text x="${midX}" y="${midY + 5}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1976d2">=</text>`;
                            }
                        }
                    });
                }
            }
        });
        
        svg += '</svg>';
        return svg;
    }
}

// Community Features Class
class CommunityFeatures {
    constructor() {
        this.feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || [];
        this.surnameSubmissions = JSON.parse(localStorage.getItem('surnameSubmissions')) || [];
        this.communityStats = {
            totalContributors: 0,
            recentSubmissions: 0,
            platformUpdates: 0
        };
        this.init();
    }

    init() {
        this.loadCommunityStats();
        this.updateContributionDisplay();
        
        // Add delayed display for community features
        this.setupDelayedDisplay();
    }

    setupDelayedDisplay() {
        // Show community features after 3 seconds delay
        setTimeout(() => {
            this.showCommunityFeatures();
        }, 3000);
    }

    showCommunityFeatures() {
        const communitySection = document.getElementById('community');
        if (communitySection) {
            communitySection.classList.add('show');
        }
    }

    // Feedback System
    submitFeedback(feedbackData) {
        const feedback = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...feedbackData,
            status: 'pending'
        };
        
        this.feedbackData.push(feedback);
        localStorage.setItem('feedbackData', JSON.stringify(this.feedbackData));
        
        // Simulate GitHub issue creation
        this.createGitHubIssue(feedback);
        
        // Update stats
        this.communityStats.totalContributors++;
        this.updateContributionDisplay();
        
        return feedback;
    }

    async createGitHubIssue(feedback) {
        try {
            // Check if GitHub config is available
            if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token || window.GITHUB_CONFIG.token === 'YOUR_GITHUB_TOKEN') {
                console.warn('GitHub API not configured. Please update github-config.js with your GitHub details.');
                return this.createLocalIssue(feedback);
            }

            const issueData = {
                title: `[${feedback.type.toUpperCase()}] ${feedback.title}`,
                body: this.formatFeedbackForGitHub(feedback),
                labels: window.GITHUB_CONFIG.labels.feedback,
                assignees: window.GITHUB_CONFIG.assignees,
                milestone: window.GITHUB_CONFIG.milestone
            };

            const response = await fetch(`${window.GITHUB_CONFIG.apiBase}/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${window.GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(issueData)
            });

            if (response.ok) {
                const issue = await response.json();
                console.log('GitHub Issue created successfully:', issue);
                this.showNotification(`GitHub issue #${issue.number} created successfully!`, 'success');
                return issue;
            } else {
                const error = await response.json();
                console.error('Failed to create GitHub issue:', error);
                this.showNotification(`Failed to create GitHub issue: ${error.message}`, 'error');
                return this.createLocalIssue(feedback);
            }
        } catch (error) {
            console.error('Error creating GitHub issue:', error);
            this.showNotification('Error creating GitHub issue. Creating local issue instead.', 'warning');
            return this.createLocalIssue(feedback);
        }
    }

    createLocalIssue(feedback) {
        // Fallback to local storage when GitHub API is not available
        const localIssue = {
            id: Date.now(),
            title: `[${feedback.type.toUpperCase()}] ${feedback.title}`,
            body: this.formatFeedbackForGitHub(feedback),
            status: 'local',
            timestamp: new Date().toISOString()
        };
        
        console.log('Local issue created:', localIssue);
        this.showNotification('Issue saved locally (GitHub API not configured)', 'info');
        return localIssue;
    }

    formatFeedbackForGitHub(feedback) {
        return `## Feedback Details

**Type:** ${feedback.type}
**Title:** ${feedback.title}
**Description:** ${feedback.description}

**Submitter:** ${feedback.name || 'Anonymous'}
**Contact:** ${feedback.contact || 'Not provided'}
**Timestamp:** ${new Date(feedback.timestamp).toLocaleString()}

---
*This issue was automatically created from community feedback.*`;
    }

    // Surname Submission System
    async submitSurname(surnameData) {
        const submission = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...surnameData,
            status: 'pending',
            votes: 0,
            approved: false
        };
        
        this.surnameSubmissions.push(submission);
        localStorage.setItem('surnameSubmissions', JSON.stringify(this.surnameSubmissions));
        
        // Create GitHub issue for surname review
        await this.createSurnameReviewIssue(submission);
        
        // Update stats
        this.communityStats.recentSubmissions++;
        this.updateContributionDisplay();
        
        return submission;
    }

    async createSurnameReviewIssue(submission) {
        try {
            // Check if GitHub config is available
            if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token || window.GITHUB_CONFIG.token === 'YOUR_GITHUB_TOKEN') {
                console.warn('GitHub API not configured. Please update github-config.js with your GitHub details.');
                return this.createLocalSurnameIssue(submission);
            }

            const issueData = {
                title: `[SURNAME REVIEW] ${submission.surname} - ${submission.yekSalai}`,
                body: this.formatSurnameForGitHub(submission),
                labels: window.GITHUB_CONFIG.labels.surname,
                assignees: window.GITHUB_CONFIG.assignees,
                milestone: window.GITHUB_CONFIG.milestone
            };

            const response = await fetch(`${window.GITHUB_CONFIG.apiBase}/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${window.GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(issueData)
            });

            if (response.ok) {
                const issue = await response.json();
                console.log('GitHub Issue created successfully:', issue);
                this.showNotification(`Surname review issue #${issue.number} created successfully!`, 'success');
                return issue;
            } else {
                const error = await response.json();
                console.error('Failed to create GitHub issue:', error);
                this.showNotification(`Failed to create GitHub issue: ${error.message}`, 'error');
                return this.createLocalSurnameIssue(submission);
            }
        } catch (error) {
            console.error('Error creating GitHub issue:', error);
            this.showNotification('Error creating GitHub issue. Creating local issue instead.', 'warning');
            return this.createLocalSurnameIssue(submission);
        }
    }

    createLocalSurnameIssue(submission) {
        // Fallback to local storage when GitHub API is not available
        const localIssue = {
            id: Date.now(),
            title: `[SURNAME REVIEW] ${submission.surname} - ${submission.yekSalai}`,
            body: this.formatSurnameForGitHub(submission),
            status: 'local',
            timestamp: new Date().toISOString()
        };
        
        console.log('Local surname issue created:', localIssue);
        this.showNotification('Surname review saved locally (GitHub API not configured)', 'info');
        return localIssue;
    }

    formatSurnameForGitHub(submission) {
        return `## New Surname Submission

**Surname:** ${submission.surname}
**Yek Salai:** ${submission.yekSalai}
**Description:** ${submission.description || 'No description provided'}

**Submitter:** ${submission.submitterName}
**Contact:** ${submission.contact || 'Not provided'}
**Source:** ${submission.source || 'Not specified'}

**Status:** Pending community review
**Votes:** 0

---
*This issue was automatically created from community surname submission.*`;
    }

    // Community Stats
    loadCommunityStats() {
        // Load from localStorage or initialize with defaults
        const savedStats = localStorage.getItem('communityStats');
        if (savedStats) {
            this.communityStats = JSON.parse(savedStats);
        } else {
            this.communityStats = {
                totalContributors: this.feedbackData.length + this.surnameSubmissions.length,
                recentSubmissions: this.surnameSubmissions.filter(s => 
                    new Date(s.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length,
                platformUpdates: Math.floor(Math.random() * 10) + 5 // Simulated data
            };
        }
    }

    updateContributionDisplay() {
        // Update the stats display in the UI
        const totalContributorsEl = document.getElementById('totalContributors');
        const recentSubmissionsEl = document.getElementById('recentSubmissions');
        const platformUpdatesEl = document.getElementById('platformUpdates');
        
        if (totalContributorsEl) totalContributorsEl.textContent = this.communityStats.totalContributors;
        if (recentSubmissionsEl) recentSubmissionsEl.textContent = this.communityStats.recentSubmissions;
        if (platformUpdatesEl) platformUpdatesEl.textContent = this.communityStats.platformUpdates;
        
        // Save to localStorage
        localStorage.setItem('communityStats', JSON.stringify(this.communityStats));
    }

    refreshCommunityStats() {
        this.loadCommunityStats();
        this.updateContributionDisplay();
        
        // Show refresh confirmation
        this.showNotification('Community stats refreshed!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create and show a notification
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span class="material-icons">${type === 'success' ? 'check_circle' : 'info'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
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

// Community Features Global Functions
window.openFeedbackModal = function() {
    if (window.app) {
        window.app.openModal('feedbackModal');
    }
};

window.openSurnameSubmissionModal = function() {
    if (window.app) {
        window.app.openModal('surnameSubmissionModal');
    }
};

window.submitFeedback = async function() {
    if (window.app && window.app.communityFeatures) {
        const form = document.getElementById('feedbackForm');
        const formData = new FormData(form);
        
        const feedbackData = {
            type: formData.get('feedbackType') || document.getElementById('feedbackType').value,
            title: formData.get('feedbackTitle') || document.getElementById('feedbackTitle').value,
            description: formData.get('feedbackDescription') || document.getElementById('feedbackDescription').value,
            name: formData.get('feedbackName') || document.getElementById('feedbackName').value,
            contact: formData.get('feedbackContact') || document.getElementById('feedbackContact').value
        };
        
        if (!feedbackData.type || !feedbackData.title || !feedbackData.description) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            const result = await window.app.communityFeatures.submitFeedback(feedbackData);
            console.log('Feedback submitted:', result);
            
            // Show success message
            window.app.communityFeatures.showNotification('Feedback submitted successfully! Thank you for your contribution.', 'success');
            
            // Close modal and reset form
            window.app.closeModal('feedbackModal');
            form.reset();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            window.app.communityFeatures.showNotification('Error submitting feedback. Please try again.', 'error');
        }
    }
};

window.submitSurname = async function() {
    if (window.app && window.app.communityFeatures) {
        const form = document.getElementById('surnameSubmissionForm');
        const formData = new FormData(form);
        
        const surnameData = {
            surname: formData.get('newSurname') || document.getElementById('newSurname').value,
            yekSalai: formData.get('newSurnameYekSalai') || document.getElementById('newSurnameYekSalai').value,
            description: formData.get('surnameDescription') || document.getElementById('surnameDescription').value,
            submitterName: formData.get('submitterName') || document.getElementById('submitterName').value,
            contact: formData.get('submitterContact') || document.getElementById('submitterContact').value,
            source: formData.get('surnameSource') || document.getElementById('surnameDescription').value
        };
        
        if (!surnameData.surname || !surnameData.yekSalai || !surnameData.submitterName) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            const result = await window.app.communityFeatures.submitSurname(surnameData);
            console.log('Surname submitted:', result);
            
            // Show success message
            window.app.communityFeatures.showNotification('Surname submitted successfully! It will be reviewed by the community.', 'success');
            
            // Close modal and reset form
            window.app.closeModal('surnameSubmissionModal');
            form.reset();
        } catch (error) {
            console.error('Error submitting surname:', error);
            window.app.communityFeatures.showNotification('Error submitting surname. Please try again.', 'error');
        }
    }
};

window.refreshCommunityStats = function() {
    if (window.app && window.app.communityFeatures) {
        window.app.communityFeatures.refreshCommunityStats();
    }
};

window.showCommunityFeatures = function() {
    const communitySection = document.getElementById('community');
    if (communitySection) {
        communitySection.classList.add('show');
        communitySection.style.opacity = '1';
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new YekSalaiApp();
});