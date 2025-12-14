
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileCardModal = document.getElementById('profileCardModal');
    const closeProfileCardBtn = document.getElementById('closeProfileCardBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
    const profilePhotoUpload = document.getElementById('profilePhotoUpload');
    const removeProfilePhotoBtn = document.getElementById('removeProfilePhotoBtn');

    const userStatus = document.getElementById('userStatus');
    const logoutBtn = document.getElementById('logoutBtn');
    const viewerTab = document.getElementById('viewerTab');
    const adminTab = document.getElementById('adminTab');
    const viewerContent = document.getElementById('viewerContent');
    const adminContent = document.getElementById('adminContent');
    const loginSection = document.getElementById('loginSection');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminSections = document.getElementById('adminSections');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const confirmAdminLoginBtn = document.getElementById('confirmAdminLoginBtn');
    const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
    const loginAsAdminBtn = document.getElementById('loginAsAdminBtn');
    
    const createBtn = document.getElementById('createBtn');
    const participantsSection = document.getElementById('participantsSection');
    const sheetSection = document.getElementById('sheetSection');
    const editParticipantsSection = document.getElementById('editParticipantsSection');
    const sheetName = document.getElementById('sheetName');
    const participantsList = document.getElementById('participantsList');
    const createSheetBtn = document.getElementById('createSheetBtn');
    const tableBody = document.getElementById('tableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const sharePdfBtn = document.getElementById('sharePdfBtn');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    const deleteSheetBtn = document.getElementById('deleteSheetBtn');
    const editParticipantsBtn = document.getElementById('editParticipantsBtn');
    const updateParticipantsBtn = document.getElementById('updateParticipantsBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const adminSheetActions = document.getElementById('adminSheetActions');
    
    const totalParticipantsElement = document.getElementById('totalParticipants');
    const totalSpentElement = document.getElementById('totalSpent');
    const totalMealsElement = document.getElementById('totalMeals');
    const costPerMealElement = document.getElementById('costPerMeal');
    const oneMealCountElement = document.getElementById('oneMealCount');
    const twoMealsCountElement = document.getElementById('twoMealsCount');
    const threeMealsCountElement = document.getElementById('threeMealsCount');
    const settlementList = document.getElementById('settlementList');
    const sheetsList = document.getElementById('sheetsList');
    const adminSheetsList = document.getElementById('adminSheetsList');
    const noSheetsMessage = document.getElementById('noSheetsMessage');
    const adminNoSheetsMessage = document.getElementById('adminNoSheetsMessage');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const customParticipantInput = document.getElementById('customParticipantInput');
    const addCustomParticipantBtn = document.getElementById('addCustomParticipantBtn');
    const editCustomParticipantInput = document.getElementById('editCustomParticipantInput');
    const editAddCustomParticipantBtn = document.getElementById('editAddCustomParticipantBtn');
    const editParticipantsList = document.getElementById('editParticipantsList');
    const totalMealsSummary = document.getElementById('totalMealsSummary');
    
    // New Elements for Beta v1.5 & v1.6
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Control Panel Elements (NEW for v1.6)
    const controlPanelBtn = document.getElementById('controlPanelBtn');
    const controlPanelModal = document.getElementById('controlPanelModal');
    const closeControlPanelBtn = document.getElementById('closeControlPanelBtn');
    const defaultParticipantsList = document.getElementById('defaultParticipantsList');
    const controlPanelParticipantInput = document.getElementById('controlPanelParticipantInput');
    const addDefaultParticipantBtn = document.getElementById('addDefaultParticipantBtn');
    const totalSheetsCount = document.getElementById('totalSheetsCount');
    const latestSheetDate = document.getElementById('latestSheetDate');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    // Application State
    let selectedParticipants = [];
    let currentSheetData = null;
    let savedSheets = JSON.parse(localStorage.getItem('hisaabKitaabSheets')) || [];
    let isAdmin = false;
    let currentMode = 'viewer';
    let ADMIN_PASSWORD = "226622";
    
    // App Version
    const APP_VERSION = "1.7";
    
    // Default participants (will be loaded from localStorage)
    let defaultParticipants = [
        "Rizwan", "Aarif", "Abdul Razzaq", "Haris", "Mauzam", 
        "Masif", "Mudassar", "Shahid", "Mansoor Kotawdekar", 
        "Mansoor Wasta", "Mohsin", "Ubedulla", "Abdul Alim", "Sabir", "Aftab"
    ];
    
    // Initialize Application
    initApp();
    
    function initApp() {
        // Load default participants from localStorage
        const savedDefaultParticipants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants'));
        if (savedDefaultParticipants) {
            defaultParticipants = savedDefaultParticipants;
        }
        
        // Load admin password from localStorage if exists
        const savedPassword = localStorage.getItem('hisaabKitaabAdminPassword');
        if (savedPassword) {
            ADMIN_PASSWORD = savedPassword;
        }
        
        // Check and upgrade existing sheets if needed
        checkAndUpgradeSheets();
        
        loadSavedSheets();
        setupEventListeners();
        checkAdminStatus();
        applyTheme(); // Apply saved theme
        
        // Initialize Firebase sync
        setTimeout(() => {
            if (window.firebaseSync) {
                window.firebaseSync.initialize();
            }
            
            // Initialize Profile Manager with delay to ensure DOM is ready
            setTimeout(() => {
                if (window.profileManager) {
                    console.log('Initializing Profile Manager...');
                    window.profileManager.initialize();
                    // Pre-load participants for control panel
                    loadDefaultParticipants();
                } else {
                    console.error('Profile Manager not loaded!');
                }
            }, 1500);
        }, 1000);
    }
    
    // Check and upgrade existing sheets to add version tracking
    function checkAndUpgradeSheets() {
        let needsSaving = false;
        
        savedSheets.forEach(sheet => {
            // Add version if missing (old sheets)
            if (!sheet.version) {
                sheet.version = "1.6"; // Old sheets were created before v1.7
                needsSaving = true;
                console.log(`Upgraded sheet "${sheet.name}" to version 1.6`);
            }
            
            // Ensure bankSettlements field exists for compatibility
            if (!sheet.bankSettlements) {
                sheet.bankSettlements = {};
                needsSaving = true;
            }
        });
        
        if (needsSaving) {
            localStorage.setItem('hisaabKitaabSheets', JSON.stringify(savedSheets));
        }
    }
    
    function setupEventListeners() {
        // Mode Tabs
        viewerTab.addEventListener('click', () => switchMode('viewer'));
        adminTab.addEventListener('click', () => switchMode('admin'));

        // User Management
        loginAsAdminBtn.addEventListener('click', showAdminLoginModal);
        confirmAdminLoginBtn.addEventListener('click', handleAdminLogin);
        cancelAdminLoginBtn.addEventListener('click', hideAdminLoginModal);
        logoutBtn.addEventListener('click', handleLogout);
        
        // Theme Toggle
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Profile Events
        closeProfileCardBtn.addEventListener('click', () => window.profileManager?.hideProfileCard());
        editProfileBtn.addEventListener('click', () => window.profileManager?.enterEditMode());
        saveProfileBtn.addEventListener('click', () => window.profileManager?.saveEditedProfile());
        cancelEditProfileBtn.addEventListener('click', () => window.profileManager?.exitEditMode());
        profilePhotoUpload.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                window.profileManager?.handlePhotoUpload(e.target.files[0]);
            }
        });
        removeProfilePhotoBtn.addEventListener('click', () => window.profileManager?.handlePhotoRemoval());

        // Sync button
        document.getElementById('manualSyncBtn')?.addEventListener('click', () => {
            if (window.firebaseSync) {
                window.firebaseSync.manualSync();
            }
        });
        
        // Sheet Management
        createBtn.addEventListener('click', showParticipantsSection);
        createSheetBtn.addEventListener('click', createNewSheet);
        calculateBtn.addEventListener('click', calculateShares);
        saveBtn.addEventListener('click', saveSheet);
        sharePdfBtn.addEventListener('click', handlePDFGeneration);
        closeSheetBtn.addEventListener('click', closeSheet);
        deleteSheetBtn.addEventListener('click', showDeleteConfirmation);
        confirmDeleteBtn.addEventListener('click', deleteCurrentSheet);
        cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);
        
        // Participants Management
        addCustomParticipantBtn.addEventListener('click', () => addCustomParticipant(customParticipantInput, participantsList));
        customParticipantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCustomParticipant(customParticipantInput, participantsList);
        });
        editAddCustomParticipantBtn.addEventListener('click', () => addCustomParticipantToEdit(editCustomParticipantInput, editParticipantsList));
        editCustomParticipantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCustomParticipantToEdit(editCustomParticipantInput, editParticipantsList);
        });
        
        // Edit Participants
        editParticipantsBtn.addEventListener('click', openEditParticipants);
        updateParticipantsBtn.addEventListener('click', updateParticipants);
        cancelEditBtn.addEventListener('click', cancelEditParticipants);
        
        // Control Panel Events (NEW for v1.6)
        controlPanelBtn.addEventListener('click', showControlPanel);
        closeControlPanelBtn.addEventListener('click', hideControlPanel);
        addDefaultParticipantBtn.addEventListener('click', addDefaultParticipant);
        controlPanelParticipantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addDefaultParticipant();
        });
        changePasswordBtn.addEventListener('click', changeAdminPassword);
    }
    
    // Theme Functions
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('hisaabKitaabTheme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }
    
    function applyTheme() {
        const savedTheme = localStorage.getItem('hisaabKitaabTheme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeIcon(false);
        }
    }
    
    function updateThemeIcon(isDark) {
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        themeToggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
    
    // Mode Switching Functions
    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'viewer') {
            viewerTab.classList.add('active');
            adminTab.classList.remove('active');
            viewerContent.classList.add('active');
            adminContent.classList.remove('active');
            updateUIForViewer();
        } else if (mode === 'admin') {
            viewerTab.classList.remove('active');
            adminTab.classList.add('active');
            viewerContent.classList.remove('active');
            adminContent.classList.add('active');
            if (isAdmin) {
                updateUIForAdmin();
            } else {
                updateUIForAdminLogin();
            }
        }
        
        // Refresh settlement list to show correct status display
        if (currentSheetData && currentSheetData.settlements) {
            generateSettlementSuggestions();
        }
    }
    
    // User Management Functions
    function checkAdminStatus() {
        const savedAdminStatus = localStorage.getItem('hisaabKitaabAdmin');
        if (savedAdminStatus === 'true') {
            isAdmin = true;
            userStatus.style.display = 'flex';
            controlPanelBtn.style.display = 'inline-block';
            updateUIForAdmin();
        } else {
            isAdmin = false;
            userStatus.style.display = 'none';
            updateUIForViewer();
        }
    }
    
    function showAdminLoginModal() {
        adminLoginModal.style.display = 'flex';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
    
    function hideAdminLoginModal() {
        adminLoginModal.style.display = 'none';
    }
    
    function handleAdminLogin() {
        const password = adminPasswordInput.value.trim();
        if (password === ADMIN_PASSWORD) {
            isAdmin = true;
            localStorage.setItem('hisaabKitaabAdmin', 'true');
            userStatus.style.display = 'flex';
            controlPanelBtn.style.display = 'inline-block';
            updateUIForAdmin();
            hideAdminLoginModal();
            alert('Admin login successful!');
        } else {
            alert('Incorrect password. Please try again.');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }
    
    function handleLogout() {
        isAdmin = false;
        localStorage.removeItem('hisaabKitaabAdmin');
        userStatus.style.display = 'none';
        controlPanelBtn.style.display = 'none';
        updateUIForAdminLogin();
        closeSheet();
        alert('Logged out successfully.');
    }
    
    function updateUIForAdmin() {
        loginSection.style.display = 'none';
        adminSections.style.display = 'block';
        calculateBtn.style.display = 'inline-block';
        saveBtn.style.display = 'inline-block';
        sharePdfBtn.style.display = 'inline-block';
        adminSheetActions.style.display = 'flex';
        closeSheetBtn.style.display = 'inline-block';
        totalMealsSummary.style.display = 'flex';
        controlPanelBtn.style.display = 'inline-block';
        loadSavedSheets();
    }
    
    function updateUIForViewer() {
        calculateBtn.style.display = 'none';
        saveBtn.style.display = 'none';
        sharePdfBtn.style.display = 'inline-block';
        adminSheetActions.style.display = 'none';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        closeSheetBtn.style.display = 'inline-block';
        totalMealsSummary.style.display = 'none';
        loadSavedSheets();
    }
    
    function updateUIForAdminLogin() {
        loginSection.style.display = 'block';
        adminSections.style.display = 'none';
        calculateBtn.style.display = 'none';
        saveBtn.style.display = 'none';
        sharePdfBtn.style.display = 'none';
        adminSheetActions.style.display = 'none';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        closeSheetBtn.style.display = 'none';
        totalMealsSummary.style.display = 'none';
    }
    
    // Sheet Management Functions
    function showParticipantsSection() {
        if (!isAdmin) return;
        
        participantsList.innerHTML = '';
        defaultParticipants.forEach(participantName => {
            addParticipantToList(participantName);
        });
        
        customParticipantInput.value = '';
        participantsSection.style.display = 'block';
        participantsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function addParticipantToList(participantName) {
        const participantItem = document.createElement('li');
        participantItem.className = 'participant';
        participantItem.style.borderLeft = '3px solid var(--primary-color)';
        
        // Get profile photo HTML
        const photoHTML = window.profileManager?.getProfilePhotoHTML(participantName, 'small') || '';
        
        participantItem.innerHTML = `
            <span class="participant-name clickable-profile">
                ${photoHTML}
                <span>${participantName}</span>
            </span>
            <div class="checkbox-container">
                <input type="checkbox" id="participant_${participantName.replace(/\s+/g, '_')}" 
                       value="${participantName}" checked>
            </div>
        `;
        
        // Add click event to show profile
        const nameElement = participantItem.querySelector('.participant-name');
        nameElement.addEventListener('click', (e) => {
            if (!e.target.matches('input[type="checkbox"]')) {
                window.profileManager?.showProfileCard(participantName, isAdmin && currentMode === 'admin');
            }
        });
        
        participantsList.appendChild(participantItem);
    }
    
    function createNewSheet() {
        if (!isAdmin) return;
        
        selectedParticipants = [];
        const checkboxes = document.querySelectorAll('#participantsList input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            selectedParticipants.push(checkbox.value);
        });
        
        if (selectedParticipants.length === 0) {
            alert('Please select at least one participant');
            return;
        }
        
        const now = new Date();
        const dateString = now.toLocaleDateString();
        
        // Generate sheet name with duplicate detection
        let sheetNameBase = `Hisaab-${dateString}`;
        let sheetNameFinal = sheetNameBase;
        let counter = 1;
        
        while (savedSheets.some(sheet => sheet.name === sheetNameFinal)) {
            counter++;
            sheetNameFinal = `${sheetNameBase}(${counter})`;
        }
        
        const sheetId = 'sheet_' + Date.now();
        
        sheetName.textContent = sheetNameFinal;
        
        currentSheetData = {
            id: sheetId,
            name: sheetNameFinal,
            date: dateString,
            lastUpdated: formatDateTime(new Date()),
            participants: selectedParticipants,
            expenses: {},
            settlements: {},
            bankSettlements: {}, // NEW: Track bank-aware settlements
            createdAt: new Date().toISOString(),
            version: APP_VERSION // Mark as new version sheet
        };
        
        selectedParticipants.forEach(participant => {
            currentSheetData.expenses[participant] = {
                spent: 0,
                meals: 3,
                toBePaid: 0
            };
        });
        
        renderExpenseTable();
        participantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
        resetSummary();
        sheetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function renderExpenseTable() {
        tableBody.innerHTML = '';
        
        selectedParticipants.forEach(participant => {
            const row = document.createElement('tr');
            
            // Participant Name with Profile Photo
            const nameCell = document.createElement('td');
            const photoHTML = window.profileManager?.getProfilePhotoHTML(participant, 'small') || '';
            nameCell.innerHTML = `
                <div class="clickable-profile" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    ${photoHTML}
                    <span style="font-weight: 600;">${participant}</span>
                </div>
            `;
            
            // Add click event to show profile
            nameCell.querySelector('.clickable-profile').addEventListener('click', () => {
                window.profileManager?.showProfileCard(participant, isAdmin && currentMode === 'admin');
            });
            
            // Spent Amount
            const spentCell = document.createElement('td');
            spentCell.className = 'amount-cell';
            
            if (isAdmin && currentMode === 'admin') {
                const spentInput = document.createElement('input');
                spentInput.type = 'number';
                spentInput.min = '0';
                spentInput.step = '0.01';
                spentInput.value = currentSheetData.expenses[participant].spent;
                spentInput.dataset.participant = participant;
                spentInput.addEventListener('input', function() {
                    currentSheetData.expenses[participant].spent = parseFloat(this.value) || 0;
                });
                spentCell.appendChild(spentInput);
            } else {
                spentCell.textContent = currentSheetData.expenses[participant].spent.toFixed(2) + ' SAR';
            }
            
            // Meals
            const mealsCell = document.createElement('td');
            mealsCell.className = 'meals-cell';
            
            if (isAdmin && currentMode === 'admin') {
                const mealsSelect = document.createElement('select');
                mealsSelect.dataset.participant = participant;
                
                const mealOptions = [
                    { value: 1, text: '1 Meal' },
                    { value: 2, text: '2 Meals' },
                    { value: 3, text: 'All Meals' }
                ];
                
                mealOptions.forEach(mealOption => {
                    const option = document.createElement('option');
                    option.value = mealOption.value.toString();
                    option.textContent = mealOption.text;
                    mealsSelect.appendChild(option);
                });
                
                mealsSelect.value = currentSheetData.expenses[participant].meals.toString();
                mealsSelect.addEventListener('change', function() {
                    currentSheetData.expenses[participant].meals = parseInt(this.value);
                });
                mealsCell.appendChild(mealsSelect);
            } else {
                const mealsValue = currentSheetData.expenses[participant].meals;
                mealsCell.textContent = mealsValue === 3 ? 'All Meals' : mealsValue + ' Meal' + (mealsValue > 1 ? 's' : '');
            }
            
            // To Be Paid
            const toBePaidCell = document.createElement('td');
            toBePaidCell.className = 'amount-cell';
            toBePaidCell.textContent = currentSheetData.expenses[participant].toBePaid.toFixed(2) + ' SAR';
            toBePaidCell.dataset.participant = participant;
            
            row.appendChild(nameCell);
            row.appendChild(spentCell);
            row.appendChild(mealsCell);
            row.appendChild(toBePaidCell);
            tableBody.appendChild(row);
        });
        
        // Total Row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td>Total</td>
            <td class="amount-cell" id="totalSpentCell">0.00 SAR</td>
            <td></td>
            <td></td>
        `;
        tableBody.appendChild(totalRow);
    }
    
    function calculateShares() {
        if (!isAdmin) return;
        
        let totalSpent = 0;
        let totalMeals = 0;
        let oneMealCount = 0, twoMealsCount = 0, threeMealsCount = 0;
        
        selectedParticipants.forEach(participant => {
            totalSpent += currentSheetData.expenses[participant].spent;
            totalMeals += currentSheetData.expenses[participant].meals;
            
            switch(currentSheetData.expenses[participant].meals) {
                case 1: oneMealCount++; break;
                case 2: twoMealsCount++; break;
                case 3: threeMealsCount++; break;
            }
        });
        
        const costPerMeal = totalMeals > 0 ? totalSpent / totalMeals : 0;
        
        // Update Summary
        totalParticipantsElement.textContent = selectedParticipants.length;
        document.getElementById('totalSpentCell').textContent = totalSpent.toFixed(2) + ' SAR';
        totalSpentElement.textContent = totalSpent.toFixed(2) + ' SAR';
        totalMealsElement.textContent = totalMeals;
        costPerMealElement.textContent = costPerMeal.toFixed(2) + ' SAR';
        oneMealCountElement.textContent = oneMealCount;
        twoMealsCountElement.textContent = twoMealsCount;
        threeMealsCountElement.textContent = threeMealsCount;
        
        // Calculate To Be Paid with CSS variable colors
        selectedParticipants.forEach(participant => {
            const spentAmount = currentSheetData.expenses[participant].spent;
            const mealsAttended = currentSheetData.expenses[participant].meals;
            const shareAmount = costPerMeal * mealsAttended;
            const toBePaid = shareAmount - spentAmount;
            
            currentSheetData.expenses[participant].toBePaid = toBePaid;
            
            const toBePaidCell = document.querySelector(`td[data-participant="${participant}"]`);
            if (toBePaidCell) {
                toBePaidCell.textContent = toBePaid.toFixed(2) + ' SAR';
                // Use CSS variables instead of hardcoded colors
                if (toBePaid > 0) {
                    toBePaidCell.style.color = 'var(--danger-color)';
                } else if (toBePaid < 0) {
                    toBePaidCell.style.color = 'var(--success-color)';
                } else {
                    toBePaidCell.style.color = 'var(--text-color)';
                }
            }
        });
        
        currentSheetData.totalSpent = totalSpent;
        currentSheetData.totalMeals = totalMeals;
        currentSheetData.costPerMeal = costPerMeal;
        currentSheetData.lastUpdated = formatDateTime(new Date());
        
        generateSettlementSuggestions();
    }
    
    // NEW: Get banks from profile - FIXED to handle comma separation
    function getParticipantBanks(participantName) {
        if (!window.profileManager) return [];
        
        const profile = window.profileManager.getProfile(participantName);
        if (!profile || !profile.bank) return [];
        
        // Split banks by comma and trim whitespace
        const banks = profile.bank.split(',')
            .map(bank => bank.trim())
            .filter(bank => bank.length > 0)
            .map(bank => bank.toLowerCase()); // Convert to lowercase for case-insensitive comparison
        
        return banks;
    }
    
    // NEW: Check if two participants share any bank - FIXED
    function shareSameBank(participant1, participant2) {
        const banks1 = getParticipantBanks(participant1);
        const banks2 = getParticipantBanks(participant2);
        
        if (banks1.length === 0 || banks2.length === 0) return false;
        
        // Check for any common bank (case-insensitive)
        return banks1.some(bank1 => 
            banks2.some(bank2 => bank1 === bank2)
        );
    }
    
    // NEW: Get common banks between two participants
    function getCommonBanks(participant1, participant2) {
        const banks1 = getParticipantBanks(participant1);
        const banks2 = getParticipantBanks(participant2);
        
        if (banks1.length === 0 || banks2.length === 0) return [];
        
        // Find common banks
        return banks1.filter(bank1 => banks2.includes(bank1));
    }
    
    // Check if sheet should use bank-aware settlements
    function shouldUseBankAwareSettlements() {
        // Only use bank-aware settlements for sheets created with v1.7 or later
        return currentSheetData && currentSheetData.version && 
               parseFloat(currentSheetData.version) >= 1.7;
    }
    
    // NEW: Improved Bank-aware settlement algorithm - FIXED
    function generateBankAwareSettlements(creditors, debtors) {
        const settlements = [];
        
        console.log("Starting bank-aware settlement calculation...");
        console.log("Creditors:", creditors);
        console.log("Debtors:", debtors);
        
        // Create mutable copies
        let remainingCreditors = creditors.map(c => ({...c}));
        let remainingDebtors = debtors.map(d => ({...d}));
        
        // Step 1: Process SAME BANK transfers first (MUST prioritize)
        console.log("Step 1: Processing same-bank transfers...");
        
        // Create a list of all possible same-bank pairs
        const sameBankPairs = [];
        
        for (let i = 0; i < remainingDebtors.length; i++) {
            const debtor = remainingDebtors[i];
            if (!debtor || debtor.amount <= 0.01) continue;
            
            for (let j = 0; j < remainingCreditors.length; j++) {
                const creditor = remainingCreditors[j];
                if (!creditor || creditor.amount <= 0.01) continue;
                
                if (shareSameBank(debtor.name, creditor.name)) {
                    sameBankPairs.push({
                        debtorIndex: i,
                        creditorIndex: j,
                        debtor: debtor,
                        creditor: creditor,
                        commonBanks: getCommonBanks(debtor.name, creditor.name)
                    });
                }
            }
        }
        
        console.log("Found same-bank pairs:", sameBankPairs);
        
        // Process same-bank pairs
        for (const pair of sameBankPairs) {
            const { debtorIndex, creditorIndex, debtor, creditor } = pair;
            
            // Check if amounts are still valid
            if (remainingDebtors[debtorIndex]?.amount <= 0.01 || 
                remainingCreditors[creditorIndex]?.amount <= 0.01) {
                continue;
            }
            
            const settlementAmount = Math.min(debtor.amount, creditor.amount);
            
            if (settlementAmount > 0.01) {
                const settlementKey = `${debtor.name}_to_${creditor.name}`;
                
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: settlementAmount.toFixed(2),
                    key: settlementKey,
                    status: currentSheetData.settlements && currentSheetData.settlements[settlementKey] 
                           ? currentSheetData.settlements[settlementKey].status 
                           : 'not-paid',
                    sameBank: true,
                    commonBanks: getCommonBanks(debtor.name, creditor.name)
                });
                
                console.log(`Same-bank settlement: ${debtor.name} -> ${creditor.name}: ${settlementAmount} SAR`);
                
                // Update amounts
                remainingDebtors[debtorIndex].amount -= settlementAmount;
                remainingCreditors[creditorIndex].amount -= settlementAmount;
                
                // Remove if amount is negligible
                if (remainingDebtors[debtorIndex].amount < 0.01) {
                    remainingDebtors[debtorIndex].amount = 0;
                }
                if (remainingCreditors[creditorIndex].amount < 0.01) {
                    remainingCreditors[creditorIndex].amount = 0;
                }
            }
        }
        
        // Filter out zero amounts
        remainingCreditors = remainingCreditors.filter(c => c.amount > 0.01);
        remainingDebtors = remainingDebtors.filter(d => d.amount > 0.01);
        
        console.log("After same-bank settlements:");
        console.log("Remaining Creditors:", remainingCreditors);
        console.log("Remaining Debtors:", remainingDebtors);
        
        // Step 2: Process remaining amounts (regular settlement)
        console.log("Step 2: Processing remaining amounts...");
        
        remainingCreditors.sort((a, b) => b.amount - a.amount);
        remainingDebtors.sort((a, b) => b.amount - a.amount);
        
        let i = 0, j = 0;
        while (i < remainingCreditors.length && j < remainingDebtors.length) {
            const creditor = remainingCreditors[i];
            const debtor = remainingDebtors[j];
            const settlementAmount = Math.min(creditor.amount, debtor.amount);
            
            if (settlementAmount > 0.01) {
                const settlementKey = `${debtor.name}_to_${creditor.name}`;
                const sameBank = shareSameBank(debtor.name, creditor.name);
                
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: settlementAmount.toFixed(2),
                    key: settlementKey,
                    status: currentSheetData.settlements && currentSheetData.settlements[settlementKey] 
                           ? currentSheetData.settlements[settlementKey].status 
                           : 'not-paid',
                    sameBank: sameBank,
                    commonBanks: sameBank ? getCommonBanks(debtor.name, creditor.name) : []
                });
                
                console.log(`${sameBank ? 'Same-bank' : 'Regular'} settlement: ${debtor.name} -> ${creditor.name}: ${settlementAmount} SAR`);
                
                creditor.amount -= settlementAmount;
                debtor.amount -= settlementAmount;
                
                if (creditor.amount < 0.01) i++;
                if (debtor.amount < 0.01) j++;
            } else {
                if (creditor.amount <= debtor.amount) i++;
                else j++;
            }
        }
        
        console.log("Final settlements:", settlements);
        return settlements;
    }
    
    // OLD: Original settlement algorithm (pre v1.7)
    function generateOldSettlements(creditors, debtors) {
        const settlements = [];
        
        // Simple settlement algorithm (old version)
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        
        let i = 0, j = 0;
        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];
            const settlementAmount = Math.min(creditor.amount, debtor.amount);
            
            if (settlementAmount > 0.01) {
                const settlementKey = `${debtor.name}_to_${creditor.name}`;
                
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: settlementAmount.toFixed(2),
                    key: settlementKey,
                    status: currentSheetData.settlements && currentSheetData.settlements[settlementKey] 
                           ? currentSheetData.settlements[settlementKey].status 
                           : 'not-paid',
                    sameBank: false,
                    commonBanks: []
                });
                
                creditor.amount -= settlementAmount;
                debtor.amount -= settlementAmount;
                
                if (creditor.amount < 0.01) i++;
                if (debtor.amount < 0.01) j++;
            } else {
                if (creditor.amount <= debtor.amount) i++;
                else j++;
            }
        }
        
        return settlements;
    }
    
    function generateSettlementSuggestions() {
        const creditors = [];
        const debtors = [];
        
        selectedParticipants.forEach(participant => {
            const balance = currentSheetData.expenses[participant].toBePaid;
            if (balance < 0) {
                creditors.push({ name: participant, amount: -balance });
            } else if (balance > 0) {
                debtors.push({ name: participant, amount: balance });
            }
        });
        
        console.log("Generating settlements for:");
        console.log("Creditors (receiving money):", creditors);
        console.log("Debtors (owing money):", debtors);
        console.log("Sheet version:", currentSheetData?.version);
        
        let settlements = [];
        
        // Choose settlement algorithm based on sheet version
        if (shouldUseBankAwareSettlements()) {
            console.log("Using BANK-AWARE settlement algorithm (v1.7+)");
            settlements = generateBankAwareSettlements(creditors, debtors);
        } else {
            console.log("Using OLD settlement algorithm (pre v1.7)");
            settlements = generateOldSettlements(creditors, debtors);
        }
        
        // Store settlements in currentSheetData
        currentSheetData.settlements = {};
        currentSheetData.bankSettlements = {}; // Reset bank settlements
        
        settlements.forEach(settlement => {
            currentSheetData.settlements[settlement.key] = {
                from: settlement.from,
                to: settlement.to,
                amount: settlement.amount,
                status: settlement.status,
                sameBank: settlement.sameBank || false,
                commonBanks: settlement.commonBanks || []
            };
            
            // Track bank-aware settlements separately
            if (settlement.sameBank) {
                currentSheetData.bankSettlements[settlement.key] = {
                    banks: settlement.commonBanks || []
                };
            }
        });
        
        renderSettlementList(settlements);
    }
    
    function renderSettlementList(settlements) {
        settlementList.innerHTML = '';
        
        if (settlements.length === 0) {
            settlementList.innerHTML = '<div class="no-settlements">All balances are settled! 🎉</div>';
            return;
        }
        
        // Only show bank-aware summary for new version sheets
        const isNewVersion = shouldUseBankAwareSettlements();
        
        // Count same-bank settlements
        const sameBankCount = settlements.filter(s => s.sameBank).length;
        const differentBankCount = settlements.length - sameBankCount;
        
        // Add summary header only for new version sheets with same-bank settlements
        if (isNewVersion && sameBankCount > 0) {
            const summaryHeader = document.createElement('div');
            summaryHeader.className = 'settlement-summary';
            summaryHeader.innerHTML = `
                <div style="background-color: var(--success-color); color: white; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span style="font-size: 1.2rem;">🏦</span>
                        <strong style="font-size: 1.1rem;">Bank-Aware Settlement Priority</strong>
                    </div>
                    <div style="font-size: 0.9rem;">
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <span style="background-color: rgba(255,255,255,0.3); padding: 3px 10px; border-radius: 12px;">
                                ✅ ${sameBankCount} Same-Bank Transfers
                            </span>
                            <span style="background-color: rgba(255,255,255,0.3); padding: 3px 10px; border-radius: 12px;">
                                🔄 ${differentBankCount} Other Transfers
                            </span>
                        </div>
                        <div style="margin-top: 8px; font-style: italic;">
                            Same-bank transfers are prioritized for easier and potentially fee-free transactions
                        </div>
                    </div>
                </div>
            `;
            settlementList.appendChild(summaryHeader);
        }
        
        settlements.forEach(settlement => {
            const settlementItem = document.createElement('div');
            settlementItem.className = 'settlement-item';
            
            // Add bank indicator for new version sheets only
            if (isNewVersion && settlement.sameBank) {
                settlementItem.style.borderLeft = '4px solid var(--success-color)';
                settlementItem.style.backgroundColor = 'color-mix(in srgb, var(--success-color) 10%, transparent)';
            }
            
            // Check if we're in admin mode AND the user is logged in as admin
            const showAdminControls = isAdmin && currentMode === 'admin';
            
            // Get bank information for display (only for new version sheets)
            const commonBanks = settlement.commonBanks || [];
            const bankInfo = commonBanks.length > 0 ? 
                `(${commonBanks.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')})` : 
                '';
            
            if (showAdminControls) {
                // Admin mode with toggle button
                const isPaid = settlement.status === 'paid';
                const statusClass = isPaid ? 'paid' : 'not-paid';
                const statusText = isPaid ? 'Paid' : 'Not Paid';
                
                settlementItem.innerHTML = `
                    <div class="settlement-details">
                        <div class="settlement-first-line">
                            <span class="settlement-from" style="font-weight: 600;">${settlement.from}</span>
                            <span class="settlement-arrow">→</span>
                            <span class="settlement-to" style="font-weight: 600;">${settlement.to}</span>
                            ${isNewVersion && settlement.sameBank ? 
                                `<span class="bank-indicator" title="Same Bank Transfer - ${bankInfo}" style="margin-left: 10px;">
                                    🏦 Same Bank ${bankInfo}
                                </span>` : 
                                ''
                            }
                        </div>
                        <div class="settlement-second-line">
                            <span class="settlement-amount">${settlement.amount} SAR</span>
                            <button class="settlement-toggle-btn ${statusClass}" data-key="${settlement.key}">
                                ${statusText}
                            </button>
                        </div>
                    </div>
                `;
                
                const toggleBtn = settlementItem.querySelector('.settlement-toggle-btn');
                toggleBtn.addEventListener('click', function() {
                    const newStatus = currentSheetData.settlements[this.dataset.key].status === 'paid' ? 'not-paid' : 'paid';
                    currentSheetData.settlements[this.dataset.key].status = newStatus;
                    
                    // Update button appearance
                    if (newStatus === 'paid') {
                        this.className = 'settlement-toggle-btn paid';
                        this.textContent = 'Paid';
                    } else {
                        this.className = 'settlement-toggle-btn not-paid';
                        this.textContent = 'Not Paid';
                    }
                    
                    saveSheet();
                });
            } else {
                // Viewer mode or admin in viewer tab - show static status
                const statusClass = settlement.status === 'paid' ? 'status-paid' : 'status-not-paid';
                const statusText = settlement.status === 'paid' ? 'Paid' : 'Not Paid';
                
                settlementItem.innerHTML = `
                    <div class="settlement-details">
                        <div class="settlement-first-line">
                            <span class="settlement-from" style="font-weight: 600;">${settlement.from}</span>
                            <span class="settlement-arrow">→</span>
                            <span class="settlement-to" style="font-weight: 600;">${settlement.to}</span>
                            ${isNewVersion && settlement.sameBank ? 
                                `<span class="bank-indicator" title="Same Bank Transfer - ${bankInfo}" style="margin-left: 10px;">
                                    🏦 Same Bank ${bankInfo}
                                </span>` : 
                                ''
                            }
                        </div>
                        <div class="settlement-second-line">
                            <span class="settlement-amount">${settlement.amount} SAR</span>
                            <span class="settlement-status ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                `;
            }
            
            settlementList.appendChild(settlementItem);
        });
        
        // Add settlement tips only for new version sheets
        if (isNewVersion) {
            const tipsSection = document.createElement('div');
            tipsSection.className = 'settlement-tips';
            tipsSection.innerHTML = `
                <div style="margin-top: 20px; padding: 12px; background-color: var(--hover-bg); border-radius: 8px; border-left: 4px solid var(--info-color); font-size: 0.9rem;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: var(--info-color);">
                        <span style="font-size: 1.1rem;">💡</span>
                        <strong>Settlement Tips:</strong>
                    </div>
                    <ul style="margin: 0 0 0 20px; padding: 0; color: var(--secondary-color);">
                        <li><strong>Same-bank transfers</strong> are usually instant and may have lower fees</li>
                        <li>Mark settlements as "Paid" once completed to track progress</li>
                        <li>Consider using mobile banking apps for quick transfers</li>
                        <li>Keep transaction references for record keeping</li>
                    </ul>
                </div>
            `;
            settlementList.appendChild(tipsSection);
        }
    }
    
    function saveSheet() {
        if (!currentSheetData || !isAdmin) return;
        
        calculateShares();
        
        const existingIndex = savedSheets.findIndex(sheet => sheet.id === currentSheetData.id);
        if (existingIndex !== -1) {
            savedSheets[existingIndex] = currentSheetData;
        } else {
            savedSheets.push(currentSheetData);
        }
        
        localStorage.setItem('hisaabKitaabSheets', JSON.stringify(savedSheets));
        loadSavedSheets();
        
        // Auto-sync to cloud
        if (window.firebaseSync && window.firebaseSync.isInitialized) {
            window.firebaseSync.saveToCloud(savedSheets);
        }
        
        alert('Sheet saved successfully!');
    }
    
    function closeSheet() {
        sheetSection.style.display = 'none';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        currentSheetData = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function showDeleteConfirmation() {
        if (!isAdmin) return;
        deleteModal.style.display = 'flex';
    }
    
    function hideDeleteConfirmation() {
        deleteModal.style.display = 'none';
    }
    
    function deleteCurrentSheet() {
        if (!currentSheetData || !isAdmin) return;
        
        savedSheets = savedSheets.filter(sheet => sheet.id !== currentSheetData.id);
        localStorage.setItem('hisaabKitaabSheets', JSON.stringify(savedSheets));
        loadSavedSheets();
        closeSheet();
        hideDeleteConfirmation();
        alert('Sheet deleted successfully!');
    }
    
    // Participants Management Functions
    function addCustomParticipant(inputElement, listElement) {
        if (!isAdmin) return;
        
        const customName = inputElement.value.trim();
        if (!customName) {
            alert('Please enter a participant name');
            return;
        }
        
        const existingParticipants = Array.from(listElement.children).map(item => 
            item.querySelector('.participant-name').textContent
        );
        
        if (existingParticipants.includes(customName)) {
            alert('This participant already exists in the list');
            inputElement.value = '';
            return;
        }
        
        // Add new participant
        const participantItem = document.createElement('li');
        participantItem.className = 'participant custom-participant';
        participantItem.style.borderLeft = '3px solid var(--primary-color)';
        
        participantItem.innerHTML = `
            <span class="participant-name">
                ${customName}
            </span>
            <div class="checkbox-container">
                <input type="checkbox" id="custom_${Date.now()}" value="${customName}" checked>
            </div>
        `;
        
        listElement.appendChild(participantItem);
        
        // Check the checkbox for new participant
        const newCheckbox = participantItem.querySelector('input[type="checkbox"]');
        if (newCheckbox) {
            newCheckbox.checked = true;
        }
        
        inputElement.value = '';
        alert(`Participant "${customName}" added successfully!`);
    }
    
    function addCustomParticipantToEdit(inputElement, listElement) {
        if (!isAdmin) return;
        
        const customName = inputElement.value.trim();
        if (!customName) {
            alert('Please enter a participant name');
            return;
        }
        
        const existingParticipants = Array.from(listElement.children).map(item => 
            item.querySelector('.edit-participant-name').textContent
        );
        
        if (existingParticipants.includes(customName)) {
            alert('This participant already exists in the list');
            inputElement.value = '';
            return;
        }
        
        addParticipantToEditList(customName);
        inputElement.value = '';
    }
    
    function addParticipantToEditList(participantName) {
        const participantItem = document.createElement('li');
        participantItem.className = 'edit-participant-item';
        participantItem.innerHTML = `
            <span class="edit-participant-name">${participantName}</span>
            <button class="remove-participant-btn" title="Remove Participant">🗑️</button>
        `;
        
        participantItem.querySelector('.remove-participant-btn').addEventListener('click', function() {
            participantItem.remove();
        });
        
        editParticipantsList.appendChild(participantItem);
    }
    
    function openEditParticipants() {
        if (!isAdmin || !currentSheetData) return;
        
        editParticipantsList.innerHTML = '';
        selectedParticipants.forEach(participant => {
            addParticipantToEditList(participant);
        });
        
        editCustomParticipantInput.value = '';
        editParticipantsSection.style.display = 'block';
        sheetSection.style.display = 'none';
        editParticipantsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function updateParticipants() {
        if (!isAdmin) return;
        
        const updatedParticipants = Array.from(editParticipantsList.children).map(item => 
            item.querySelector('.edit-participant-name').textContent
        );
        
        if (updatedParticipants.length === 0) {
            alert('Please add at least one participant');
            return;
        }
        
        selectedParticipants = updatedParticipants;
        currentSheetData.participants = updatedParticipants;
        
        // Initialize expenses for new participants
        updatedParticipants.forEach(participant => {
            if (!currentSheetData.expenses[participant]) {
                currentSheetData.expenses[participant] = { spent: 0, meals: 3, toBePaid: 0 };
            }
        });
        
        // Remove expenses for deleted participants
        Object.keys(currentSheetData.expenses).forEach(participant => {
            if (!updatedParticipants.includes(participant)) {
                delete currentSheetData.expenses[participant];
            }
        });
        
        renderExpenseTable();
        calculateShares();
        editParticipantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
        alert('Participants updated successfully!');
    }
    
    function cancelEditParticipants() {
        editParticipantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
    }
    
    function resetSummary() {
        totalParticipantsElement.textContent = '0';
        totalSpentElement.textContent = '0.00 SAR';
        totalMealsElement.textContent = '0';
        costPerMealElement.textContent = '0.00 SAR';
        oneMealCountElement.textContent = '0';
        twoMealsCountElement.textContent = '0';
        threeMealsCountElement.textContent = '0';
        settlementList.innerHTML = '<div class="no-settlements">Calculate shares to see settlement suggestions</div>';
    }
    
    function loadSavedSheets() {
        // Update viewer sheets list
        if (savedSheets.length === 0) {
            noSheetsMessage.style.display = 'block';
            sheetsList.style.display = 'none';
            if (adminNoSheetsMessage) adminNoSheetsMessage.style.display = 'block';
            if (adminSheetsList) adminSheetsList.style.display = 'none';
            return;
        }
        
        noSheetsMessage.style.display = 'none';
        sheetsList.style.display = 'block';
        sheetsList.innerHTML = '';
        
        if (adminNoSheetsMessage) adminNoSheetsMessage.style.display = 'none';
        if (adminSheetsList) {
            adminSheetsList.style.display = 'block';
            adminSheetsList.innerHTML = '';
        }
        
        savedSheets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        savedSheets.forEach(sheet => {
            // For viewer mode
            const sheetItem = createSheetListItem(sheet, false);
            sheetsList.appendChild(sheetItem);
            
            // For admin mode
            if (adminSheetsList) {
                const adminSheetItem = createSheetListItem(sheet, true);
                adminSheetsList.appendChild(adminSheetItem);
            }
        });
    }
    
    function createSheetListItem(sheet, isAdminList) {
        const sheetItem = document.createElement('li');
        sheetItem.className = 'sheet-item';
        
        const sheetInfo = document.createElement('div');
        const displayDate = sheet.lastUpdated ? formatDateTime(new Date(sheet.lastUpdated)) : 
                          sheet.date ? formatDateTime(new Date(sheet.date)) : 
                          formatDateTime(new Date(sheet.createdAt));
        
        // Create participants list with profile photos
        let participantsHTML = '';
        const participants = sheet.participants || [];
        participants.slice(0, 3).forEach(participant => {
            const photoHTML = window.profileManager?.getProfilePhotoHTML(participant, 'small') || '';
            participantsHTML += `<span class="sheet-participant">${photoHTML}</span>`;
        });
        
        if (participants.length > 3) {
            participantsHTML += `<span class="more-participants">+${participants.length - 3} more</span>`;
        }
        
        // Add version badge
        const sheetVersion = sheet.version || "1.6";
        const versionBadgeClass = parseFloat(sheetVersion) >= 1.7 ? 'new' : 'old';
        const versionText = parseFloat(sheetVersion) >= 1.7 ? 'v1.7+' : 'v1.6';
        
        sheetInfo.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <strong>${sheet.name}</strong>
                        <span class="version-badge ${versionBadgeClass}" title="Sheet version: ${sheetVersion}">${versionText}</span>
                    </div>
                    <div class="sheet-date">Updated: ${displayDate}</div>
                    <div class="sheet-participants" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;">
                        ${participantsHTML}
                    </div>
                </div>
            </div>
        `;
        
        const sheetActions = document.createElement('div');
        sheetActions.className = 'sheet-item-actions';
        
        if (isAdmin && isAdminList && currentMode === 'admin') {
            const renameBtn = document.createElement('button');
            renameBtn.className = 'rename-sheet-btn';
            renameBtn.innerHTML = '✏️';
            renameBtn.title = 'Rename Sheet';
            renameBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                renameSheet(sheet.id);
            });
            sheetActions.appendChild(renameBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-sheet-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Delete Sheet';
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${sheet.name}"?`)) {
                    deleteSheet(sheet.id);
                }
            });
            sheetActions.appendChild(deleteBtn);
        }
        
        sheetItem.appendChild(sheetInfo);
        sheetItem.appendChild(sheetActions);
        
        sheetItem.addEventListener('click', function() {
            openSheet(sheet.id);
        });
        
        return sheetItem;
    }
    
    function renameSheet(sheetId) {
        if (!isAdmin) return;
        
        const sheet = savedSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Sheet not found!');
            return;
        }
        
        const newName = prompt('Enter new name for the sheet:', sheet.name);
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            
            // Update the sheet name
            sheet.name = trimmedName;
            sheet.lastUpdated = formatDateTime(new Date());
            
            // Save to localStorage
            localStorage.setItem('hisaabKitaabSheets', JSON.stringify(savedSheets));
            
            // Force sync to Firebase
            if (window.firebaseSync && window.firebaseSync.isInitialized) {
                window.firebaseSync.saveToCloud(savedSheets);
            }
            
            // Update UI
            loadSavedSheets();
            
            // Update current sheet if it's open
            if (currentSheetData && currentSheetData.id === sheetId) {
                currentSheetData.name = trimmedName;
                sheetName.textContent = trimmedName;
            }
            
            alert('Sheet renamed successfully!');
        }
    }
    
    function deleteSheet(sheetId) {
        if (!isAdmin) return;
        
        savedSheets = savedSheets.filter(sheet => sheet.id !== sheetId);
        localStorage.setItem('hisaabKitaabSheets', JSON.stringify(savedSheets));
        
        // Sync to Firebase after deletion
        if (window.firebaseSync && window.firebaseSync.isInitialized) {
            window.firebaseSync.saveToCloud(savedSheets);
        }
        
        loadSavedSheets();
        
        if (currentSheetData && currentSheetData.id === sheetId) {
            closeSheet();
        }
        
        alert('Sheet deleted successfully!');
    }
    
    function openSheet(sheetId) {
        const sheet = savedSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Sheet not found!');
            return;
        }
        
        currentSheetData = JSON.parse(JSON.stringify(sheet));
        selectedParticipants = currentSheetData.participants;
        sheetName.textContent = currentSheetData.name;
        
        renderExpenseTable();
        
        let totalSpent = 0;
        let totalMeals = 0;
        let oneMealCount = 0, twoMealsCount = 0, threeMealsCount = 0;
        
        selectedParticipants.forEach(participant => {
            totalSpent += currentSheetData.expenses[participant].spent;
            totalMeals += currentSheetData.expenses[participant].meals;
            
            switch(currentSheetData.expenses[participant].meals) {
                case 1: oneMealCount++; break;
                case 2: twoMealsCount++; break;
                case 3: threeMealsCount++; break;
            }
        });
        
        const costPerMeal = totalMeals > 0 ? totalSpent / totalMeals : 0;
        
        totalParticipantsElement.textContent = selectedParticipants.length;
        document.getElementById('totalSpentCell').textContent = totalSpent.toFixed(2) + ' SAR';
        totalSpentElement.textContent = totalSpent.toFixed(2) + ' SAR';
        totalMealsElement.textContent = totalMeals;
        costPerMealElement.textContent = costPerMeal.toFixed(2) + ' SAR';
        oneMealCountElement.textContent = oneMealCount;
        twoMealsCountElement.textContent = twoMealsCount;
        threeMealsCountElement.textContent = threeMealsCount;
        
        selectedParticipants.forEach(participant => {
            const spentAmount = currentSheetData.expenses[participant].spent;
            const mealsAttended = currentSheetData.expenses[participant].meals;
            const shareAmount = costPerMeal * mealsAttended;
            const toBePaid = shareAmount - spentAmount;
            currentSheetData.expenses[participant].toBePaid = toBePaid;
            
            const toBePaidCell = document.querySelector(`td[data-participant="${participant}"]`);
            if (toBePaidCell) {
                toBePaidCell.textContent = toBePaid.toFixed(2) + ' SAR';
                // Use CSS variables instead of hardcoded colors
                if (toBePaid > 0) {
                    toBePaidCell.style.color = 'var(--danger-color)';
                } else if (toBePaid < 0) {
                    toBePaidCell.style.color = 'var(--success-color)';
                } else {
                    toBePaidCell.style.color = 'var(--text-color)';
                }
            }
        });
        
        generateSettlementSuggestions();
        
        sheetSection.style.display = 'block';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        sheetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Utility function to format date and time
    function formatDateTime(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }
    
    // PDF Generation Handler
    function handlePDFGeneration() {
        if (!currentSheetData) {
            alert('No sheet data available to share');
            return;
        }
        
        // Ensure calculations are done
        if (isAdmin && (!currentSheetData.totalSpent || currentSheetData.totalSpent === 0)) {
            calculateShares();
        }
        
        // Use the PDF generator
        if (window.generateExpensePDF) {
            window.generateExpensePDF(currentSheetData, selectedParticipants, isAdmin && currentMode === 'admin');
        } else {
            alert('PDF generator not loaded. Please refresh the page.');
        }
    }
    
    // Loading functions for PDF
    function showPDFLoading() {
        const loadingOverlay = document.getElementById('pdfLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    function hidePDFLoading() {
        const loadingOverlay = document.getElementById('pdfLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    // ==================== CONTROL PANEL FUNCTIONS (NEW for v1.6) ====================
    
    function showControlPanel() {
        if (!isAdmin) return;
        
        console.log('Opening Control Panel...');
        
        // Load default participants
        loadDefaultParticipants();
        
        // Load sheet summary
        updateSheetSummary();
        
        // Clear password fields
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        
        controlPanelModal.style.display = 'flex';
    }
    
    function hideControlPanel() {
        controlPanelModal.style.display = 'none';
    }
    
    function loadDefaultParticipants() {
        const defaultParticipantsList = document.getElementById('defaultParticipantsList');
        if (!defaultParticipantsList) {
            console.error('defaultParticipantsList element not found!');
            return;
        }
        
        console.log('Loading default participants...');
        
        // Get participants from localStorage or use default
        const participants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants')) || defaultParticipants;
        console.log('Participants to display:', participants);
        
        // Clear the list
        defaultParticipantsList.innerHTML = '';
        
        if (participants.length === 0) {
            defaultParticipantsList.innerHTML = '<li style="text-align: center; color: var(--secondary-color); padding: 20px;">No default participants added yet.</li>';
            return;
        }
        
        // Add each participant
        participants.forEach(participant => {
            const participantItem = document.createElement('li');
            participantItem.className = 'default-participant-item';
            
            // Get profile photo HTML if profile manager exists
            let photoHTML = '';
            if (window.profileManager && window.profileManager.getProfilePhotoHTML) {
                photoHTML = window.profileManager.getProfilePhotoHTML(participant, 'small');
            } else {
                // Fallback photo
                const initials = participant.charAt(0).toUpperCase();
                photoHTML = `<div class="profile-photo-initials" style="width: 30px; height: 30px; background-color: #3498db; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 14px;">${initials}</div>`;
            }
            
            participantItem.innerHTML = `
                <div class="default-participant-info clickable-profile" data-name="${participant}">
                    ${photoHTML}
                    <span class="default-participant-name">${participant}</span>
                </div>
                <div class="default-participant-actions">
                    <button class="edit-profile-btn" data-name="${participant}" title="Edit Profile">✏️</button>
                    <button class="remove-default-participant-btn" data-name="${participant}" title="Remove Participant">🗑️</button>
                </div>
            `;
            
            // Add click event to profile info
            const profileInfo = participantItem.querySelector('.default-participant-info');
            profileInfo.addEventListener('click', (e) => {
                if (!e.target.matches('button')) {
                    if (window.profileManager && window.profileManager.showProfileCard) {
                        window.profileManager.showProfileCard(participant, true);
                    } else {
                        alert(`Profile for: ${participant}\n\nNote: Profile Manager not fully loaded.`);
                    }
                }
            });
            
            // Add click event to edit button
            const editBtn = participantItem.querySelector('.edit-profile-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.profileManager && window.profileManager.showProfileCard) {
                    window.profileManager.showProfileCard(participant, true);
                } else {
                    alert(`Edit profile for: ${participant}\n\nNote: Profile Manager not fully loaded.`);
                }
            });
            
            // Add click event to remove button
            const removeBtn = participantItem.querySelector('.remove-default-participant-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeDefaultParticipant(participant);
            });
            
            defaultParticipantsList.appendChild(participantItem);
        });
    }
    
    function addDefaultParticipant() {
        const name = controlPanelParticipantInput.value.trim();
        
        if (!name) {
            alert('Please enter a participant name');
            return;
        }
        
        const participants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants')) || defaultParticipants;
        
        if (participants.includes(name)) {
            alert('This participant already exists in the default list');
            return;
        }
        
        participants.push(name);
        localStorage.setItem('hisaabKitaabDefaultParticipants', JSON.stringify(participants));
        
        controlPanelParticipantInput.value = '';
        
        // Update the defaultParticipants array used in the app
        defaultParticipants = participants;
        
        // Update UI
        loadDefaultParticipants();
        
        alert(`"${name}" added to default participants list`);
    }
    
    function removeDefaultParticipant(name) {
        if (!confirm(`Remove "${name}" from default participants list?`)) {
            return;
        }
        
        let participants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants')) || defaultParticipants;
        participants = participants.filter(p => p !== name);
        
        localStorage.setItem('hisaabKitaabDefaultParticipants', JSON.stringify(participants));
        
        // Update the defaultParticipants array used in the app
        defaultParticipants = participants;
        
        // Update the list
        loadDefaultParticipants();
        
        alert(`"${name}" removed from default participants list`);
    }
    
    function updateSheetSummary() {
        const savedSheets = JSON.parse(localStorage.getItem('hisaabKitaabSheets')) || [];
        
        totalSheetsCount.textContent = savedSheets.length;
        
        if (savedSheets.length > 0) {
            // Sort by creation date and get the latest
            const sortedSheets = [...savedSheets].sort((a, b) => 
                new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
            );
            
            const latestSheet = sortedSheets[0];
            const latestDate = latestSheet.lastUpdated || latestSheet.date || latestSheet.createdAt;
            
            if (latestDate) {
                const date = new Date(latestDate);
                latestSheetDate.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } else {
                latestSheetDate.textContent = 'Unknown';
            }
        } else {
            latestSheetDate.textContent = 'None';
        }
    }
    
    function changeAdminPassword() {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        if (!newPassword || !confirmPassword) {
            alert('Please fill in both password fields');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Update the ADMIN_PASSWORD variable
        localStorage.setItem('hisaabKitaabAdminPassword', newPassword);
        
        // Update the current session password
        ADMIN_PASSWORD = newPassword;
        
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        
        alert('Admin password changed successfully!');
    }
    
    // Make functions available globally for PDF generator
    window.showPDFLoading = showPDFLoading;
    window.hidePDFLoading = hidePDFLoading;
    window.loadSavedSheets = loadSavedSheets;
});
