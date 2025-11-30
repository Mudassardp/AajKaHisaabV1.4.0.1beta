document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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
    const saveCloseBtn = document.getElementById('saveCloseBtn');
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
    
    // Application State
    let selectedParticipants = [];
    let currentSheetData = null;
    let savedSheets = JSON.parse(localStorage.getItem('hisaabKitaabSheets')) || [];
    let isAdmin = false;
    let currentMode = 'viewer'; // Track current mode
    const ADMIN_PASSWORD = "226622";
    
    // Define the 15 default participants with Mohsin at position 11
    const defaultParticipants = [
        "Rizwan", "Aarif", "Abdul Razzaq", "Haris", "Mauzam", 
        "Masif", "Mudassar", "Shahid", "Mansoor Kotawdekar", 
        "Mansoor Wasta", "Mohsin", "Ubedulla", "Abdul Alim", "Sabir", "Aftab"
    ];
    
    // Initialize Application
    initApp();
    
    function initApp() {
        loadSavedSheets();
        setupEventListeners();
        checkAdminStatus();
        // NEW: Initialize Firebase sync
        setTimeout(() => {
            if (window.firebaseSync) {
                window.firebaseSync.initialize();
            }
        }, 1000);
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

        // Add this in setupEventListeners()
        document.getElementById('manualSyncBtn')?.addEventListener('click', () => {
            if (window.firebaseSync) {
                window.firebaseSync.manualSync();
            }
        });
        
        // Sheet Management
        createBtn.addEventListener('click', showParticipantsSection);
        createSheetBtn.addEventListener('click', createNewSheet);
        calculateBtn.addEventListener('click', calculateShares);
        saveCloseBtn.addEventListener('click', saveAndCloseSheet);
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
        updateUIForAdminLogin();
        closeSheet();
        alert('Logged out successfully.');
    }
    
    function updateUIForAdmin() {
        loginSection.style.display = 'none';
        adminSections.style.display = 'block';
        calculateBtn.style.display = 'inline-block';
        saveCloseBtn.style.display = 'inline-block';
        sharePdfBtn.style.display = 'inline-block';
        adminSheetActions.style.display = 'flex';
        closeSheetBtn.style.display = 'inline-block';
        totalMealsSummary.style.display = 'flex';
        loadSavedSheets();
    }
    
    function updateUIForViewer() {
        calculateBtn.style.display = 'none';
        saveCloseBtn.style.display = 'none';
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
        saveCloseBtn.style.display = 'none';
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
            const participant = document.createElement('li');
            participant.className = 'participant';
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `participant_${participantName.replace(/\s+/g, '_')}`;
            checkbox.value = participantName;
            checkbox.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.className = 'participant-name';
            label.textContent = participantName;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            participant.appendChild(checkboxContainer);
            participantsList.appendChild(participant);
        });
        
        customParticipantInput.value = '';
        participantsSection.style.display = 'block';
        participantsSection.scrollIntoView({ behavior: 'smooth' });
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
            createdAt: new Date().toISOString()
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
            
            // Participant Name
            const nameCell = document.createElement('td');
            nameCell.textContent = participant;
            
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
        
        // Calculate To Be Paid
        selectedParticipants.forEach(participant => {
            const spentAmount = currentSheetData.expenses[participant].spent;
            const mealsAttended = currentSheetData.expenses[participant].meals;
            const shareAmount = costPerMeal * mealsAttended;
            const toBePaid = shareAmount - spentAmount;
            
            currentSheetData.expenses[participant].toBePaid = toBePaid;
            
            const toBePaidCell = document.querySelector(`td[data-participant="${participant}"]`);
            if (toBePaidCell) {
                toBePaidCell.textContent = toBePaid.toFixed(2) + ' SAR';
                toBePaidCell.style.color = toBePaid > 0 ? '#e74c3c' : toBePaid < 0 ? '#2ecc71' : '#2c3e50';
            }
        });
        
        currentSheetData.totalSpent = totalSpent;
        currentSheetData.totalMeals = totalMeals;
        currentSheetData.costPerMeal = costPerMeal;
        currentSheetData.lastUpdated = formatDateTime(new Date());
        
        generateSettlementSuggestions();
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
        
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        
        const settlements = [];
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
                           : 'not-paid'
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
        
        // Store settlements in currentSheetData
        currentSheetData.settlements = {};
        settlements.forEach(settlement => {
            currentSheetData.settlements[settlement.key] = {
                from: settlement.from,
                to: settlement.to,
                amount: settlement.amount,
                status: settlement.status
            };
        });
        
        renderSettlementList(settlements);
    }
    
    function renderSettlementList(settlements) {
        settlementList.innerHTML = '';
        if (settlements.length === 0) {
            settlementList.innerHTML = '<div class="no-settlements">All balances are settled! 🎉</div>';
        } else {
            settlements.forEach(settlement => {
                const settlementItem = document.createElement('div');
                settlementItem.className = 'settlement-item';
                
                // Check if we're in admin mode AND the user is logged in as admin
                const showAdminControls = isAdmin && currentMode === 'admin';
                
                if (showAdminControls) {
                    // Admin mode with toggle button
                    const isPaid = settlement.status === 'paid';
                    const statusClass = isPaid ? 'paid' : 'not-paid';
                    const statusText = isPaid ? 'Paid' : 'Not Paid';
                    
                    settlementItem.innerHTML = `
                        <div class="settlement-details">
                            <span class="settlement-from">${settlement.from}</span>
                            <span class="settlement-arrow">→</span>
                            <span class="settlement-to">${settlement.to}</span>
                            <span class="settlement-amount">${settlement.amount} SAR</span>
                            <button class="settlement-toggle-btn ${statusClass}" data-key="${settlement.key}">
                                ${statusText}
                            </button>
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
                            <span class="settlement-from">${settlement.from}</span>
                            <span class="settlement-arrow">→</span>
                            <span class="settlement-to">${settlement.to}</span>
                            <span class="settlement-amount">${settlement.amount} SAR</span>
                            <span class="settlement-status ${statusClass}">${statusText}</span>
                        </div>
                    `;
                }
                
                settlementList.appendChild(settlementItem);
            });
        }
    }
    
    function saveAndCloseSheet() {
        if (!isAdmin) return;
        saveSheet();
        closeSheet();
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
        
        // NEW: Auto-sync to cloud
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
        
        const participant = document.createElement('li');
        participant.className = 'participant custom-participant';
        participant.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="custom_${Date.now()}" value="${customName}" checked>
                <label for="custom_${Date.now()}" class="participant-name">${customName}</label>
            </div>
        `;
        listElement.appendChild(participant);
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
        
        sheetInfo.innerHTML = `
            <strong>${sheet.name}</strong>
            <div class="sheet-date">Updated: ${displayDate}</div>
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
            
            // NEW: Force sync to Firebase
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
        
        // NEW: Sync to Firebase after deletion
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
                toBePaidCell.style.color = toBePaid > 0 ? '#e74c3c' : toBePaid < 0 ? '#2ecc71' : '#2c3e50';
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
    
    // Make functions available globally for PDF generator
    window.showPDFLoading = showPDFLoading;
    window.hidePDFLoading = hidePDFLoading;
});