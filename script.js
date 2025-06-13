// Call Tracker Pro - JavaScript Application
// Powered by Twilio Voice SDK

class CallTracker {
    constructor() {
        this.calls = [];
        this.currentCall = null;
        this.callTimer = null;
        this.callStartTime = null;
        this.twilioDevice = null;
        this.twilioPhoneNumbers = [];
        this.selectedFromNumber = null;
        
        this.init();
    }

    init() {
        this.loadCallsFromStorage();
        this.setupEventListeners();
        this.renderCallsTable();
        this.updateStatistics();
        this.loadTwilioCredentials();
        this.loadSelectedFromNumber();
        this.initializeTwilioClient();
        this.loadTwilioPhoneNumbers();
    }

    // Storage Functions
    saveCallsToStorage(calls = this.calls) {
        const last100 = calls.slice(-100);
        localStorage.setItem('callTrackerCalls', JSON.stringify(last100));
        this.calls = last100;
    }

    getCallsFromStorage() {
        const stored = localStorage.getItem('callTrackerCalls');
        return stored ? JSON.parse(stored) : [];
    }

    loadCallsFromStorage() {
        this.calls = this.getCallsFromStorage();
    }

    saveTwilioCredentials(creds) {
        localStorage.setItem('twilioCredentials', JSON.stringify(creds));
    }

    getTwilioCredentials() {
        const stored = localStorage.getItem('twilioCredentials');
        return stored ? JSON.parse(stored) : {};
    }

    loadTwilioCredentials() {
        const creds = this.getTwilioCredentials();
        if (creds.accountSid) {
            document.getElementById('accountSid').value = creds.accountSid;
        }
        if (creds.apiKeySid) {
            document.getElementById('apiKeySid').value = creds.apiKeySid;
        }
        if (creds.apiKeySecret) {
            document.getElementById('apiKeySecret').value = creds.apiKeySecret;
        }
        if (creds.twilioPhoneNumber) {
            document.getElementById('twilioPhoneNumber').value = creds.twilioPhoneNumber;
        }
    }

    saveSelectedFromNumber(phoneNumber) {
        localStorage.setItem('selectedFromNumber', phoneNumber);
        this.selectedFromNumber = phoneNumber;
    }

    loadSelectedFromNumber() {
        const saved = localStorage.getItem('selectedFromNumber');
        if (saved) {
            this.selectedFromNumber = saved;
            document.getElementById('fromNumberSelect').value = saved;
        }
    }

    // Phone Number Management Functions
    async loadTwilioPhoneNumbers() {
        try {
            this.showNumberLoadingStatus('Loading phone numbers...');
            
            const response = await fetch('/api/phone-numbers');
            
            if (response.ok) {
                const data = await response.json();
                this.twilioPhoneNumbers = data.phoneNumbers;
                this.populateFromNumberDropdown();
                this.hideNumberLoadingStatus();
                
                if (data.phoneNumbers.length === 0) {
                    this.showNumberLoadingStatus('No phone numbers found. Please purchase a Twilio number.');
                }
                return data.phoneNumbers;
            } else {
                const error = await response.json();
                this.showNumberLoadingStatus(`Error: ${error.error}`);
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Failed to load phone numbers:', error);
            this.showNumberLoadingStatus('Failed to load phone numbers. Check your Twilio configuration.');
            throw error;
        }
    }

    populateFromNumberDropdown() {
        const select = document.getElementById('fromNumberSelect');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add phone numbers as options
        this.twilioPhoneNumbers.forEach(number => {
            const option = document.createElement('option');
            option.value = number.phoneNumber;
            option.textContent = `${number.friendlyName} (${number.phoneNumber})`;
            
            // Add voice capability indicator
            if (!number.capabilities.voice) {
                option.textContent += ' - No Voice';
                option.disabled = true;
            }
            
            select.appendChild(option);
        });
        
        // Restore previously selected number
        if (this.selectedFromNumber) {
            select.value = this.selectedFromNumber;
        }
        
        // Auto-select first available number if none selected
        if (!this.selectedFromNumber && this.twilioPhoneNumbers.length > 0) {
            const firstVoiceNumber = this.twilioPhoneNumbers.find(n => n.capabilities.voice);
            if (firstVoiceNumber) {
                select.value = firstVoiceNumber.phoneNumber;
                this.saveSelectedFromNumber(firstVoiceNumber.phoneNumber);
            }
        }
    }

    showNumberLoadingStatus(message) {
        const status = document.getElementById('numberLoadingStatus');
        status.textContent = message;
        status.classList.remove('hidden');
    }

    hideNumberLoadingStatus() {
        document.getElementById('numberLoadingStatus').classList.add('hidden');
    }

    // CRUD Operations
    addCall(callData) {
        const newCall = {
            id: this.generateId(),
            ...callData,
            dateTime: callData.dateTime || new Date().toISOString()
        };
        
        this.calls.push(newCall);
        this.saveCallsToStorage();
        this.renderCallsTable();
        this.updateStatistics();
        return newCall;
    }

    updateCall(id, callData) {
        const index = this.calls.findIndex(call => call.id === id);
        if (index !== -1) {
            this.calls[index] = { ...this.calls[index], ...callData };
            this.saveCallsToStorage();
            this.renderCallsTable();
            this.updateStatistics();
        }
    }

    deleteCall(id) {
        this.calls = this.calls.filter(call => call.id !== id);
        this.saveCallsToStorage();
        this.renderCallsTable();
        this.updateStatistics();
    }

    getCallById(id) {
        return this.calls.find(call => call.id === id);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Twilio Voice Functions
    async initializeTwilioClient() {
        try {
            const token = await this.getAccessToken();
            if (token) {
                this.twilioDevice = new Twilio.Device(token);
                this.setupTwilioEventListeners();
                this.updateCallStatus('Ready');
            }
        } catch (error) {
            console.error('Failed to initialize Twilio client:', error);
            this.updateCallStatus('Setup Required');
        }
    }

    async getAccessToken() {
        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.token;
            }
        } catch (error) {
            console.error('Failed to get access token:', error);
        }
        return null;
    }

    setupTwilioEventListeners() {
        if (!this.twilioDevice) return;

        this.twilioDevice.on('ready', () => {
            console.log('Twilio Device is ready');
            this.updateCallStatus('Ready');
        });

        this.twilioDevice.on('error', (error) => {
            console.error('Twilio Device error:', error);
            this.updateCallStatus('Error');
        });

        this.twilioDevice.on('connect', (conn) => {
            console.log('Call connected');
            this.currentCall = conn;
            this.updateCallStatus('Connected');
            this.showActiveCallUI();
            this.startCallTimer();
        });

        this.twilioDevice.on('disconnect', () => {
            console.log('Call disconnected');
            this.endCurrentCall();
        });

        this.twilioDevice.on('incoming', (conn) => {
            console.log('Incoming call from:', conn.parameters.From);
            this.handleIncomingCall(conn);
        });
    }

    makeCall(phoneNumber) {
        // Validate inputs
        if (!this.twilioDevice || !phoneNumber) {
            alert('Please enter a valid phone number and ensure Twilio is configured.');
            return;
        }

        // Validate from number selection
        const fromValidation = this.validateFromNumberSelection();
        if (!fromValidation.valid) {
            alert(fromValidation.message);
            return;
        }

        // Validate phone number format
        if (!this.validatePhoneNumber(phoneNumber)) {
            alert('Please enter a valid phone number.');
            return;
        }

        try {
            this.updateCallStatus('Connecting...');
            const connectionParams = {
                To: this.formatPhoneNumber(phoneNumber),
                From: this.selectedFromNumber
            };
            
            const connection = this.twilioDevice.connect(connectionParams);
            this.currentCall = connection;
            
            // Log the outgoing call
            setTimeout(() => {
                this.addCall({
                    contactName: phoneNumber,
                    phoneNumber: this.formatPhoneNumber(phoneNumber),
                    callType: 'outgoing',
                    duration: 0,
                    notes: `Outgoing call from ${this.selectedFromNumber} to ${this.formatPhoneNumber(phoneNumber)}`
                });
            }, 1000);
            
        } catch (error) {
            console.error('Failed to make call:', error);
            this.updateCallStatus('Call Failed');
            alert('Failed to make call. Please check your connection and try again.');
        }
    }

    endCall() {
        if (this.currentCall) {
            this.currentCall.disconnect();
        }
        this.endCurrentCall();
    }

    endCurrentCall() {
        this.currentCall = null;
        this.updateCallStatus('Ready');
        this.hideActiveCallUI();
        this.stopCallTimer();
    }

    muteCall() {
        if (this.currentCall) {
            const isMuted = this.currentCall.isMuted();
            this.currentCall.mute(!isMuted);
            
            const muteBtn = document.getElementById('muteCall');
            muteBtn.classList.toggle('bg-red-200', !isMuted);
            muteBtn.classList.toggle('text-red-700', !isMuted);
            muteBtn.classList.toggle('bg-gray-200', isMuted);
            muteBtn.classList.toggle('text-gray-700', isMuted);
        }
    }

    holdCall() {
        // Implement hold functionality if supported by your Twilio setup
        alert('Hold functionality would be implemented based on your Twilio configuration');
    }

    handleIncomingCall(connection) {
        const from = connection.parameters.From;
        if (confirm(`Incoming call from ${from}. Accept?`)) {
            connection.accept();
            this.currentCall = connection;
            
            // Log the incoming call
            this.addCall({
                contactName: from,
                phoneNumber: from,
                callType: 'incoming',
                duration: 0,
                notes: 'Incoming call'
            });
        } else {
            connection.reject();
            
            // Log as missed call
            this.addCall({
                contactName: from,
                phoneNumber: from,
                callType: 'missed',
                duration: 0,
                notes: 'Missed call'
            });
        }
    }

    updateCallStatus(status) {
        const statusElement = document.getElementById('callStatus');
        statusElement.textContent = status;
        
        // Update status styling
        statusElement.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
        
        switch (status) {
            case 'Ready':
                statusElement.classList.add('bg-green-100', 'text-green-800');
                break;
            case 'Connecting...':
                statusElement.classList.add('bg-yellow-100', 'text-yellow-800');
                break;
            case 'Connected':
                statusElement.classList.add('bg-blue-100', 'text-blue-800');
                break;
            case 'Call Failed':
            case 'Error':
                statusElement.classList.add('bg-red-100', 'text-red-800');
                break;
            default:
                statusElement.classList.add('bg-gray-100', 'text-gray-800');
        }
    }

    // Dialer Functions
    appendToDialerInput(digit) {
        const input = document.getElementById('dialerInput');
        input.value += digit;
    }

    clearDialerInput() {
        document.getElementById('dialerInput').value = '';
    }

    validatePhoneNumber(number) {
        // Basic phone number validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(number.replace(/\D/g, ''));
    }

    validateFromNumberSelection() {
        if (!this.selectedFromNumber) {
            return {
                valid: false,
                message: 'Please select a from number before making calls.'
            };
        }
        
        const selectedNumber = this.twilioPhoneNumbers.find(n => n.phoneNumber === this.selectedFromNumber);
        if (!selectedNumber) {
            return {
                valid: false,
                message: 'Selected from number is no longer available.'
            };
        }
        
        if (!selectedNumber.capabilities.voice) {
            return {
                valid: false,
                message: 'Selected number does not support voice calls.'
            };
        }
        
        return { valid: true };
    }

    formatPhoneNumber(number) {
        // Basic US phone number formatting
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+1${cleaned}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`;
        }
        return number;
    }

    startCallTimer() {
        this.callStartTime = Date.now();
        this.callTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('callTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
        document.getElementById('callTimer').textContent = '00:00';
        
        // Update the last call's duration if it exists
        if (this.callStartTime && this.calls.length > 0) {
            const duration = Math.floor((Date.now() - this.callStartTime) / 60000); // in minutes
            const lastCall = this.calls[this.calls.length - 1];
            if (lastCall.duration === 0) {
                this.updateCall(lastCall.id, { duration });
            }
        }
        
        this.callStartTime = null;
    }

    showActiveCallUI() {
        document.getElementById('activeCallControls').classList.remove('hidden');
    }

    hideActiveCallUI() {
        document.getElementById('activeCallControls').classList.add('hidden');
    }

    // Display Functions
    renderCallsTable() {
        const tbody = document.getElementById('callsTableBody');
        const noCallsMessage = document.getElementById('noCallsMessage');
        
        const filteredCalls = this.getFilteredCalls();
        
        if (filteredCalls.length === 0) {
            tbody.innerHTML = '';
            noCallsMessage.classList.remove('hidden');
            return;
        }
        
        noCallsMessage.classList.add('hidden');
        
        tbody.innerHTML = filteredCalls.map(call => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${this.escapeHtml(call.contactName)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.escapeHtml(call.phoneNumber)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.getCallTypeBadge(call.callType)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDuration(call.duration)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDateTime(call.dateTime)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    ${this.escapeHtml(call.notes || '')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="callTracker.editCall('${call.id}')" class="text-twilio-red hover:text-twilio-red-dark mr-3">
                        Edit
                    </button>
                    <button onclick="callTracker.deleteCall('${call.id}')" class="text-red-600 hover:text-red-900">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getCallTypeBadge(type) {
        const badges = {
            incoming: 'bg-green-100 text-green-800',
            outgoing: 'bg-blue-100 text-blue-800',
            missed: 'bg-red-100 text-red-800'
        };
        
        const className = badges[type] || 'bg-gray-100 text-gray-800';
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}">
            ${label}
        </span>`;
    }

    updateStatistics() {
        const stats = {
            total: this.calls.length,
            incoming: this.calls.filter(c => c.callType === 'incoming').length,
            outgoing: this.calls.filter(c => c.callType === 'outgoing').length,
            missed: this.calls.filter(c => c.callType === 'missed').length
        };
        
        document.getElementById('totalCalls').textContent = stats.total;
        document.getElementById('incomingCalls').textContent = stats.incoming;
        document.getElementById('outgoingCalls').textContent = stats.outgoing;
        document.getElementById('missedCalls').textContent = stats.missed;
    }

    formatDuration(minutes) {
        if (!minutes || minutes === 0) return '0m';
        if (minutes < 1) return '<1m';
        return `${Math.round(minutes)}m`;
    }

    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }



    // Settings Modal Functions
    openSettingsModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    toggleCredentialVisibility() {
        const input = document.getElementById('accountSid');
        const eyeOpen = document.getElementById('eyeOpen');
        const eyeClosed = document.getElementById('eyeClosed');
        
        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        } else {
            input.type = 'password';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        }
    }

    // Search and Filter Functions
    searchCalls(searchTerm) {
        return this.calls.filter(call => 
            call.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.phoneNumber.includes(searchTerm)
        );
    }

    filterCallsByType(type) {
        if (!type) return this.calls;
        return this.calls.filter(call => call.callType === type);
    }

    getFilteredCalls() {
        let filtered = [...this.calls];
        
        const searchTerm = document.getElementById('searchInput').value;
        if (searchTerm) {
            filtered = this.searchCalls(searchTerm);
        }
        
        const filterType = document.getElementById('filterType').value;
        if (filterType) {
            filtered = filtered.filter(call => call.callType === filterType);
        }
        
        // Sort by date, most recent first
        return filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }

    applySearchAndFilter() {
        this.renderCallsTable();
    }

    // Export Function
    exportToCSV() {
        const headers = ['Contact Name', 'Phone Number', 'Type', 'Duration', 'Date & Time', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...this.calls.map(call => [
                `"${call.contactName}"`,
                `"${call.phoneNumber}"`,
                call.callType,
                call.duration || 0,
                `"${this.formatDateTime(call.dateTime)}"`,
                `"${call.notes || ''}"`
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csvContent, `call-history-${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Validation Functions
    validateAccountSid(sid) {
        const sidRegex = /^AC[a-f0-9]{32}$/i;
        return sidRegex.test(sid);
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Dialer buttons
        document.querySelectorAll('.dialer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const digit = e.target.dataset.digit;
                this.appendToDialerInput(digit);
            });
        });

        // Dialer controls
        document.getElementById('clearDialer').addEventListener('click', () => {
            this.clearDialerInput();
        });

        document.getElementById('makeCall').addEventListener('click', () => {
            const phoneNumber = document.getElementById('dialerInput').value;
            if (this.validatePhoneNumber(phoneNumber)) {
                this.makeCall(this.formatPhoneNumber(phoneNumber));
            } else {
                alert('Please enter a valid phone number');
            }
        });

        // Active call controls
        document.getElementById('muteCall').addEventListener('click', () => {
            this.muteCall();
        });

        document.getElementById('holdCall').addEventListener('click', () => {
            this.holdCall();
        });

        document.getElementById('endCall').addEventListener('click', () => {
            this.endCall();
        });

        // Header buttons

        document.getElementById('exportCalls').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('openSettings').addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Modal controls

        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Settings visibility toggle
        document.getElementById('toggleSidVisibility').addEventListener('click', () => {
            this.toggleCredentialVisibility();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => {
            this.applySearchAndFilter();
        });

        document.getElementById('filterType').addEventListener('change', () => {
            this.applySearchAndFilter();
        });

        // Form submissions

        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsFormSubmit();
        });

        // Test connection button
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testTwilioConnection();
        });

        // Import from Twilio button
        document.getElementById('importFromTwilio').addEventListener('click', () => {
            this.importFromTwilio();
        });

        // From number selection
        document.getElementById('fromNumberSelect').addEventListener('change', (e) => {
            this.saveSelectedFromNumber(e.target.value);
        });

        // Refresh phone numbers button
        document.getElementById('refreshNumbers').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            const originalHTML = button.innerHTML;
            
            // Show loading state
            button.innerHTML = '<svg class="w-4 h-4 text-gray-600 animate-spin" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>';
            button.disabled = true;
            
            this.loadTwilioPhoneNumbers().finally(() => {
                // Restore button state
                button.innerHTML = originalHTML;
                button.disabled = false;
            });
        });

        // Close modals when clicking outside

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettingsModal();
            }
        });
    }


    async handleSettingsFormSubmit() {
        const creds = {
            accountSid: document.getElementById('accountSid').value,
            apiKeySid: document.getElementById('apiKeySid').value,
            apiKeySecret: document.getElementById('apiKeySecret').value,
            twilioPhoneNumber: document.getElementById('twilioPhoneNumber').value
        };

        // Validate required fields
        if (!creds.accountSid || !creds.accountSid.trim()) {
            alert('Account SID is required');
            return;
        }

        try {
            // Send credentials to backend for configuration
            const response = await fetch('/api/configure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accountSid: creds.accountSid,
                    authToken: document.getElementById('authToken')?.value || '', // Add auth token field
                    apiKeySid: creds.apiKeySid,
                    apiKeySecret: creds.apiKeySecret,
                    twilioPhoneNumber: creds.twilioPhoneNumber
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to configure Twilio');
            }

            const result = await response.json();
            
            // Save credentials locally for reference
            this.saveTwilioCredentials(creds);
            this.closeSettingsModal();
            
            // Reinitialize Twilio client with new credentials
            this.initializeTwilioClient();
            
            // Reload phone numbers with new credentials
            this.loadTwilioPhoneNumbers();
            
            let message = 'Settings saved successfully!';
            if (result.hasTwimlApp) {
                message += ' TwiML app configured automatically.';
            }
            
            alert(message);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings: ' + error.message);
        }
    }

    async testTwilioConnection() {
        try {
            const token = await this.getAccessToken();
            if (token) {
                alert('Connection successful! Twilio credentials are working.');
            } else {
                alert('Connection failed. Please check your backend server and credentials.');
            }
        } catch (error) {
            alert('Connection failed: ' + error.message);
        }
    }

    async importFromTwilio() {
        const creds = this.getTwilioCredentials();
        if (!creds.accountSid) {
            alert('Please configure your Twilio credentials in Settings first.');
            return;
        }

        try {
            // Show loading state
            const importBtn = document.getElementById('importFromTwilio');
            const originalText = importBtn.innerHTML;
            importBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>Importing...';
            importBtn.disabled = true;

            const response = await fetch('/api/import-calls');
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.calls && data.calls.length > 0) {
                    // Merge imported calls with existing calls, avoiding duplicates
                    const existingCallIds = new Set(this.calls.map(call => call.id));
                    const newCalls = data.calls.filter(call => !existingCallIds.has(call.id));
                    
                    // Add new calls to the tracker
                    this.calls = [...this.calls, ...newCalls];
                    this.saveCallsToStorage();
                    this.renderCallsTable();
                    this.updateStatistics();
                    
                    alert(`Successfully imported ${newCalls.length} calls from Twilio. (${data.calls.length - newCalls.length} duplicates were skipped)`);
                } else {
                    alert('No calls found to import from your Twilio account.');
                }
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to import calls from Twilio');
            }
            
            // Restore button state
            importBtn.innerHTML = originalText;
            importBtn.disabled = false;
            
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed: ' + error.message);
            
            // Restore button state
            const importBtn = document.getElementById('importFromTwilio');
            importBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>Import from Twilio';
            importBtn.disabled = false;
        }
    }
}

// Initialize the application
const callTracker = new CallTracker();

// Expose callTracker globally for onclick handlers
window.callTracker = callTracker;