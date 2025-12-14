// Profile Manager for HisaabKitaabApp v1.7 (No Storage Required)
class ProfileManager {
    constructor() {
        this.profiles = {};
        this.currentProfileName = null;
        this.isInitialized = false;
    }


    // Add this method to the ProfileManager class
getParticipantBanks(profileName) {
    const profile = this.getProfile(profileName);
    if (!profile || !profile.bank) return [];
    
    // Split banks by comma and trim whitespace
    return profile.bank.split(',')
        .map(bank => bank.trim())
        .filter(bank => bank.length > 0)
        .map(bank => bank.toLowerCase()); // Case-insensitive comparison
}

    // Initialize
    initialize() {
        try {
            this.isInitialized = true;
            console.log('Profile Manager initialized');
            
            // Listen for profile updates
            this.setupRealTimeListener();
            
            // Load existing profiles
            this.loadAllProfiles();
            
        } catch (error) {
            console.error('Failed to initialize Profile Manager:', error);
            this.loadFromLocalStorage();
        }
    }

    // Load all profiles from Firebase
    async loadAllProfiles() {
        try {
            console.log('Loading profiles from Firebase...');
            const snapshot = await firebase.database().ref('sharedProfiles').once('value');
            const profilesData = snapshot.val();
            
            if (profilesData) {
                this.profiles = profilesData;
                console.log('Profiles loaded from Firebase:', Object.keys(this.profiles).length);
                
                // Save to localStorage as backup
                this.saveToLocalStorage();
            } else {
                console.log('No profiles found in Firebase, trying localStorage...');
                this.loadFromLocalStorage();
            }
            
            // Update UI
            this.updateAllProfileDisplays();
            
        } catch (error) {
            console.error('Failed to load profiles from Firebase:', error);
            this.loadFromLocalStorage();
        }
    }

    // Load from localStorage as fallback
    loadFromLocalStorage() {
        try {
            const savedProfiles = JSON.parse(localStorage.getItem('hisaabKitaabProfiles')) || {};
            this.profiles = savedProfiles;
            console.log('Profiles loaded from localStorage:', Object.keys(this.profiles).length);
        } catch (error) {
            console.error('Failed to load profiles from localStorage:', error);
            this.profiles = {};
        }
    }

    // Save to localStorage as backup
    saveToLocalStorage() {
        try {
            localStorage.setItem('hisaabKitaabProfiles', JSON.stringify(this.profiles));
        } catch (error) {
            console.error('Failed to save profiles to localStorage:', error);
        }
    }

    // Save profile to Firebase
    async saveProfile(profileName, profileData) {
        try {
            // Clean up data (remove empty fields)
            const cleanData = {
                name: profileData.name || profileName,
                mobile: profileData.mobile || '',
                bank: profileData.bank || '',
                iban: profileData.iban || '',
                photoData: profileData.photoData || '', // Base64 image data
                lastUpdated: new Date().toISOString()
            };
            
            // Remove empty photoData to save space
            if (!cleanData.photoData) {
                delete cleanData.photoData;
            }
            
            // Save to Firebase
            await firebase.database().ref(`sharedProfiles/${profileName}`).set(cleanData);
            
            // Update local cache
            this.profiles[profileName] = cleanData;
            
            // Save to localStorage as backup
            this.saveToLocalStorage();
            
            console.log('Profile saved:', profileName);
            
            // Update UI
            this.updateProfileDisplay(profileName);
            
            return true;
        } catch (error) {
            console.error('Failed to save profile:', error);
            
            // Fallback to localStorage
            this.profiles[profileName] = profileData;
            this.saveToLocalStorage();
            this.updateProfileDisplay(profileName);
            
            return false;
        }
    }

    // Get profile data
    getProfile(profileName) {
        return this.profiles[profileName] || null;
    }

    // Create default profile
    createDefaultProfile(profileName) {
        return {
            name: profileName,
            mobile: '',
            bank: '',
            iban: '',
            lastUpdated: new Date().toISOString()
        };
    }

    // Get profile photo HTML
    getProfilePhotoHTML(profileName, size = 'medium') {
        const profile = this.getProfile(profileName);
        const sizes = {
            small: '30px',
            medium: '40px',
            large: '80px'
        };
        
        const sizePx = sizes[size] || sizes.medium;
        const initials = profileName.charAt(0).toUpperCase();
        
        if (profile && profile.photoData) {
            return `<div class="profile-photo" style="width: ${sizePx}; height: ${sizePx}; background-image: url('${profile.photoData}');"></div>`;
        } else {
            return `<div class="profile-photo-initials" style="width: ${sizePx}; height: ${sizePx}; background-color: ${this.getColorForName(profileName)};">${initials}</div>`;
        }
    }

    // Get color based on name
    getColorForName(name) {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#d35400', '#c0392b',
            '#2980b9', '#27ae60', '#8e44ad', '#f1c40f',
            '#16a085', '#e67e22', '#2c3e50', '#7f8c8d'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    // Update profile display in UI
    updateProfileDisplay(profileName) {
        this.updateAllProfileDisplays();
    }

    // Update all profile displays
    updateAllProfileDisplays() {
        // Update in create sheet participants list
        this.updateParticipantLists();
        
        // Update in expense table
        this.updateExpenseTable();
        
        // Update in sheets list
        this.updateSheetsList();
        
        // Update in Control Panel
        this.updateDefaultParticipantsList();
    }

    // Update participant lists
    updateParticipantLists() {
        // Update in create sheet participants list
        const participantItems = document.querySelectorAll('.participant-name, .edit-participant-name, .sheet-participant');
        participantItems.forEach(item => {
            const nameElement = item.querySelector('span:not(.profile-photo):not(.profile-photo-initials)');
            if (nameElement) {
                const name = nameElement.textContent.trim();
                if (name) {
                    const photoHTML = this.getProfilePhotoHTML(name, 'small');
                    // Keep existing structure, just update photo
                    const existingPhoto = item.querySelector('.profile-photo, .profile-photo-initials');
                    if (existingPhoto) {
                        existingPhoto.outerHTML = photoHTML;
                    } else {
                        item.insertAdjacentHTML('afterbegin', photoHTML);
                    }
                }
            }
        });
    }

    // Update expense table
    updateExpenseTable() {
        const tableRows = document.querySelectorAll('#tableBody tr');
        tableRows.forEach(row => {
            const nameCell = row.querySelector('td:first-child');
            if (nameCell) {
                const nameSpan = nameCell.querySelector('span[style*="font-weight: 600"]');
                if (nameSpan) {
                    const name = nameSpan.textContent.trim();
                    if (name) {
                        const photoHTML = this.getProfilePhotoHTML(name, 'small');
                        // Check if photo already exists
                        const existingPhoto = nameCell.querySelector('.profile-photo, .profile-photo-initials');
                        if (existingPhoto) {
                            existingPhoto.outerHTML = photoHTML;
                        } else {
                            nameCell.insertAdjacentHTML('afterbegin', photoHTML);
                        }
                    }
                }
            }
        });
    }

    // Update sheets list
    updateSheetsList() {
        // Implementation will be called from script.js
    }

    // Update default participants list in Control Panel
    updateDefaultParticipantsList() {
        const defaultParticipantsList = document.getElementById('defaultParticipantsList');
        if (!defaultParticipantsList) return;
        
        defaultParticipantsList.innerHTML = '';
        
        const participants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants')) || window.defaultParticipants || [];
        
        participants.forEach(participant => {
            const participantItem = document.createElement('li');
            participantItem.className = 'default-participant-item';
            
            // Get profile photo
            const photoHTML = this.getProfilePhotoHTML(participant, 'small');
            
            participantItem.innerHTML = `
                <div class="default-participant-info">
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
            profileInfo.style.cursor = 'pointer';
            profileInfo.addEventListener('click', (e) => {
                if (!e.target.matches('button')) {
                    this.showProfileCard(participant, true); // true = isAdmin
                }
            });
            
            // Add click event to edit button
            const editBtn = participantItem.querySelector('.edit-profile-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showProfileCard(participant, true); // true = isAdmin
            });
            
            // Add click event to remove button
            const removeBtn = participantItem.querySelector('.remove-default-participant-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDefaultParticipant(participant);
            });
            
            defaultParticipantsList.appendChild(participantItem);
        });
    }

    // Remove default participant
    async removeDefaultParticipant(name) {
        if (!confirm(`Remove "${name}" from default participants list?`)) {
            return;
        }
        
        let participants = JSON.parse(localStorage.getItem('hisaabKitaabDefaultParticipants')) || window.defaultParticipants || [];
        participants = participants.filter(p => p !== name);
        
        localStorage.setItem('hisaabKitaabDefaultParticipants', JSON.stringify(participants));
        
        // Update the defaultParticipants array used in the app
        if (window.defaultParticipants) {
            window.defaultParticipants = participants;
        }
        
        // Update the list
        this.updateDefaultParticipantsList();
        
        alert(`"${name}" removed from default participants list`);
    }

    // Show profile card
    showProfileCard(profileName, isAdmin = false) {
        this.currentProfileName = profileName;
        const profile = this.getProfile(profileName) || this.createDefaultProfile(profileName);
        
        // Update modal content
        document.getElementById('profileFullName').textContent = profile.name || profileName;
        document.getElementById('profileMobile').textContent = profile.mobile || 'Not Available';
        document.getElementById('profileBank').textContent = profile.bank || 'Not Available';
        document.getElementById('profileIBAN').textContent = profile.iban || 'Not Available';
        
        // Update large photo
        const largePhotoContainer = document.getElementById('profileLargePhoto');
        if (profile.photoData) {
            largePhotoContainer.innerHTML = `<div class="profile-photo-large-img" style="background-image: url('${profile.photoData}');"></div>`;
        } else {
            const initials = profileName.charAt(0).toUpperCase();
            largePhotoContainer.innerHTML = `<div class="profile-photo-large-initials" style="background-color: ${this.getColorForName(profileName)};">${initials}</div>`;
        }
        
        // Show/hide edit buttons based on admin status
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelEditProfileBtn');
        const editForm = document.getElementById('profileEditForm');
        
        if (isAdmin) {
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            editForm.style.display = 'none';
            
            // Fill edit form
            document.getElementById('editProfileName').value = profile.name || profileName;
            document.getElementById('editProfileMobile').value = profile.mobile || '';
            document.getElementById('editProfileBank').value = profile.bank || '';
            document.getElementById('editProfileIBAN').value = profile.iban || '';
        } else {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            editForm.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('profileCardModal').style.display = 'flex';
    }

    // Hide profile card
    hideProfileCard() {
        document.getElementById('profileCardModal').style.display = 'none';
        this.currentProfileName = null;
    }

    // Enter edit mode
    enterEditMode() {
        document.getElementById('editProfileBtn').style.display = 'none';
        document.getElementById('saveProfileBtn').style.display = 'inline-block';
        document.getElementById('cancelEditProfileBtn').style.display = 'inline-block';
        document.getElementById('profileEditForm').style.display = 'block';
        document.getElementById('closeProfileCardBtn').style.display = 'none';
    }

    // Exit edit mode
    exitEditMode() {
        document.getElementById('editProfileBtn').style.display = 'inline-block';
        document.getElementById('saveProfileBtn').style.display = 'none';
        document.getElementById('cancelEditProfileBtn').style.display = 'none';
        document.getElementById('profileEditForm').style.display = 'none';
        document.getElementById('closeProfileCardBtn').style.display = 'inline-block';
        
        // Reload profile data
        if (this.currentProfileName) {
            this.showProfileCard(this.currentProfileName, true);
        }
    }

    // Save edited profile
    async saveEditedProfile() {
        if (!this.currentProfileName) return;
        
        const profile = this.getProfile(this.currentProfileName) || this.createDefaultProfile(this.currentProfileName);
        
        // Update profile data
        profile.name = document.getElementById('editProfileName').value.trim() || this.currentProfileName;
        profile.mobile = document.getElementById('editProfileMobile').value.trim();
        profile.bank = document.getElementById('editProfileBank').value.trim();
        profile.iban = document.getElementById('editProfileIBAN').value.trim();
        profile.lastUpdated = new Date().toISOString();
        
        // Keep existing photo data
        if (!profile.photoData && this.profiles[this.currentProfileName]?.photoData) {
            profile.photoData = this.profiles[this.currentProfileName].photoData;
        }
        
        // Save to Firebase
        const success = await this.saveProfile(this.currentProfileName, profile);
        
        if (success) {
            alert('Profile updated successfully!');
            this.exitEditMode();
            this.showProfileCard(this.currentProfileName, true);
        } else {
            alert('Failed to update profile. Please try again.');
        }
    }

    // Handle photo upload (convert to base64)
    handlePhotoUpload(file) {
        if (!this.currentProfileName || !file) return;
        
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            const base64Data = event.target.result;
            
            // Check size (limit to 100KB for Firebase Database)
            if (base64Data.length > 100000) {
                alert('Photo is too large! Please use a smaller image (max 100KB).');
                return;
            }
            
            // Update profile with photo data
            const profile = this.getProfile(this.currentProfileName) || this.createDefaultProfile(this.currentProfileName);
            profile.photoData = base64Data;
            profile.lastUpdated = new Date().toISOString();
            
            // Save profile
            const success = await this.saveProfile(this.currentProfileName, profile);
            
            if (success) {
                alert('Photo uploaded successfully!');
                this.showProfileCard(this.currentProfileName, true);
            } else {
                alert('Failed to upload photo. Please try again.');
            }
        };
        
        reader.onerror = () => {
            alert('Failed to read photo file. Please try again.');
        };
        
        reader.readAsDataURL(file);
    }

    // Handle photo removal
    async handlePhotoRemoval() {
        if (!this.currentProfileName) return;
        
        if (confirm('Remove profile photo?')) {
            const profile = this.getProfile(this.currentProfileName) || this.createDefaultProfile(this.currentProfileName);
            
            // Remove photo data
            delete profile.photoData;
            profile.lastUpdated = new Date().toISOString();
            
            // Save profile
            const success = await this.saveProfile(this.currentProfileName, profile);
            
            if (success) {
                alert('Photo removed successfully!');
                this.showProfileCard(this.currentProfileName, true);
            } else {
                alert('Failed to remove photo. Please try again.');
            }
        }
    }

    // Listen for real-time profile updates
    setupRealTimeListener() {
        try {
            firebase.database().ref('sharedProfiles').on('value', (snapshot) => {
                const profilesData = snapshot.val();
                if (profilesData) {
                    this.profiles = profilesData;
                    this.saveToLocalStorage();
                    this.updateAllProfileDisplays();
                    console.log('Real-time profile update received');
                }
            });
        } catch (error) {
            console.error('Failed to setup real-time listener:', error);
        }
    }

    // Get all profiles
    getAllProfiles() {
        return this.profiles;
    }
}

// Create global instance
window.profileManager = new ProfileManager();