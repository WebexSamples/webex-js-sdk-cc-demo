// Global variables
let webex;
let currentTask;
let agentId;
let auxCodeId = null;
let agentStatus = null;
let idleCodesList = [];

// DOM Elements
const authStatus = document.getElementById('auth-status');
const loginStatus = document.getElementById('login-status');
const teamsDropdown = document.getElementById('teams-dropdown');
const loginButton = document.getElementById('login-button');
const dialNumber = document.getElementById('dial-number');
const agentState = document.getElementById('agent-state');
const stateButton = document.getElementById('state-button');
const incomingCallControls = document.getElementById('incoming-call-controls');
const activeCallControls = document.getElementById('active-call-controls');
const incomingCallInfo = document.getElementById('incoming-call-info');
const answerButton = document.getElementById('answer-button');
const declineButton = document.getElementById('decline-button');
const holdButton = document.getElementById('hold-button');
const muteButton = document.getElementById('mute-button');
const endButton = document.getElementById('end-button');

// Additional DOM Elements
const consultButton = document.getElementById('consult-button');
const transferButton = document.getElementById('transfer-button');
const consultDialog = document.getElementById('consult-dialog');
const transferDialog = document.getElementById('transfer-dialog');
const loginOption = document.getElementById('login-option');

// Add these DOM elements at the top with other DOM elements
const initSection = document.getElementById('init-section');
const stationLoginSection = document.getElementById('station-login-section');
const agentStateSection = document.getElementById('agent-state-section');
const callControlsSection = document.getElementById('call-controls-section');

// Add new DOM element reference
const taskArea = document.getElementById('task-area');

// Add to DOM Elements section
const wrapupDialog = document.getElementById('wrapup-dialog');
const wrapupCodesDropdown = document.getElementById('wrapup-codes');

// Add to DOM Elements section at the top
const userMenu = document.getElementById('user-menu');
const userDropdown = document.getElementById('user-dropdown');

// Add new DOM element
const loadingSection = document.getElementById('loading-section');

// Update DOM Elements section
const stateMenu = document.getElementById('state-menu');
const stateDropdown = document.getElementById('state-dropdown');

// Initialize SDK
function initializeSDK() {
  const accessToken = document.getElementById('access-token').value;
  if (!accessToken) {
    alert('Please enter an access token');
    return;
  }

  // Show loading, hide init
  initSection.style.display = 'none';
  loadingSection.classList.remove('hidden'); // Changed from style.display
  loadingSection.style.display = 'block'; // Explicitly set display block

  webex = window.webex = Webex.init({
    config: generateWebexConfig(),
    credentials: {
      access_token: accessToken,
    },
  });

  webex.once('ready', () => {
    // Keep loading visible until registration is complete
    registerWebexEvents();
  });
}

// Generating Webex Config
function generateWebexConfig() {
  return {
    appName: 'WebexCCSampleApp',
    appPlatform: 'Web',
    fedramp: false,
    logger: { level: 'info' },
    cc: {
      allowMultiLogin: false,
    },
  };
}

// Register Webex events
function registerWebexEvents() {
  webex.cc
    .register(true)
    .then((profile) => {
      // Hide loading section only after registration is complete
      loadingSection.style.display = 'none';

      // Always start with hiding agent state section
      agentStateSection.style.display = 'none';

      if (profile.isAgentLoggedIn) {
        setupLoggedInState();
        // Don't show login section if already logged in
        stationLoginSection.style.display = 'none';
      } else {
        // Show login section if not logged in
        stationLoginSection.style.display = 'block';
      }

      // Handle successful registration
      loginButton.disabled = false;

      // Check if agent is already logged in
      if (profile.isAgentLoggedIn) {
        setupLoggedInState();
        return;
      }

      // If not logged in, show login section
      stationLoginSection.style.display = 'block';

      // Continue with existing registration code
      loginStatus.textContent = 'Registered successfully';
      loginButton.disabled = false;

      // Populate teams dropdown
      profile.teams.forEach((team) => {
        const option = document.createElement('option');
        option.value = team.id;
        option.text = team.name;
        teamsDropdown.add(option);
      });

      // Store idle codes for later use
      idleCodesList = profile.idleCodes || [];

      // Clear existing options
      agentState.innerHTML = '<option value="">Select State...</option>';

      // Add idle codes
      if (idleCodesList.length > 0) {
        idleCodesList.forEach((idleCode) => {
          if (!idleCode.isSystem) {
            const option = document.createElement('option');
            option.text = idleCode.name;
            option.value = idleCode.id;
            agentState.add(option);
          }
        });
      }

      // Add wrapup codes to dropdown
      if (profile.wrapupCodes) {
        profile.wrapupCodes.forEach((code) => {
          const option = document.createElement('option');
          option.value = code.id;
          option.text = code.name;
          wrapupCodesDropdown.add(option);
        });
      }

      agentId = profile.agentId;

      // Add this line to set agent name
      document.getElementById('agent-name').textContent =
        profile.name || 'Agent Name';

      // Initialize with offline status
      updateAgentStatus('Offline');
    })
    .catch((error) => {
      loadingSection.style.display = 'none';
      loginStatus.textContent = 'Registration failed: ' + error.message;
      loginButton.disabled = true;
    });

  // Handle incoming calls
  webex.cc.on('task:incoming', handleIncomingCall);
}

// Update loginAgent function to show loading
function loginAgent() {
  const teamId = teamsDropdown.value;
  const selectedLoginOption = loginOption.value;

  if (!teamId) {
    alert('Please select a team');
    return;
  }

  if (!selectedLoginOption) {
    alert('Please select a login option');
    return;
  }

  // Show loading section
  loadingSection.style.display = 'block';
  stationLoginSection.style.display = 'none';

  webex.cc
    .stationLogin({
      teamId: teamId,
      loginOption: selectedLoginOption,
      dialNumber: dialNumber.value,
    })
    .then(() => {
      loadingSection.style.display = 'none';
      setupLoggedInState();
    })
    .catch((error) => {
      loadingSection.style.display = 'none';
      stationLoginSection.style.display = 'block';
      loginStatus.textContent = 'Login failed: ' + error.message;
    });
}

// Add new function to handle logged in state setup
function setupLoggedInState() {
  // Hide login section and show agent section
  stationLoginSection.style.display = 'none';
  agentStateSection.style.display = 'block';

  // Enable agent state controls
  agentState.disabled = false;

  // Show task area after login
  taskArea.classList.remove('hidden');
  taskArea.style.display = 'block';

  // Hide all call-related controls
  document.querySelector('.no-tasks').style.display = 'block';
  incomingCallControls.style.display = 'none';
  activeCallControls.style.display = 'none';
  wrapupDialog.style.display = 'none';
  consultDialog.style.display = 'none';
  transferDialog.style.display = 'none';

  // Auto update to available state
  updateAgentStatus('Idle');

  loginStatus.textContent = 'Logged in successfully';
}

// Update logout function
function logoutAgent() {
  webex.cc
    .stationLogout({ logoutReason: 'logout' })
    .then(() => {
      // Reset all sections to initial state
      stationLoginSection.style.display = 'block';
      agentStateSection.style.display = 'none';
      agentState.disabled = true;

      // Clear states
      agentState.selectedIndex = 0;
      updateAgentStatus('Offline');
      userDropdown.classList.remove('show');
      loginStatus.textContent = 'Logged out successfully';

      // Reset login form if needed
      loginButton.disabled = false;
      teamsDropdown.selectedIndex = 0;
      loginOption.selectedIndex = 0;
      dialNumber.value = '';
    })
    .catch((error) => {
      console.error('Logout failed:', error);
      alert('Failed to logout');
    });
}

// Add handler for state changes
function handleAgentStatus(event) {
  const selectedOption = event.target.options[event.target.selectedIndex];
  if (selectedOption.value === 'AVAILABLE') {
    agentStatus = 'Available';
    auxCodeId = 0;
  } else {
    agentStatus = selectedOption.text;
    auxCodeId = selectedOption.value;
  }
  console.log('Agent status change:', { agentStatus, auxCodeId });
}

// Update setAgentState function
function setAgentState() {
  const stateOption = agentState.options[agentState.selectedIndex];
  if (!stateOption.value) return;

  // Handle state change first
  handleAgentStatus({ target: agentState });

  const state = agentStatus === 'Available' ? 'Available' : 'Idle';

  console.log('Setting agent state:', {
    state,
    auxCodeId,
    lastStateChangeReason: agentStatus,
    agentId,
  });

  webex.cc
    .setAgentState({
      state,
      auxCodeId,
      lastStateChangeReason: agentStatus,
      agentId,
    })
    .then((response) => {
      console.log('Agent status set successfully', response);
      updateAgentStatus(state);
      stateDropdown.classList.remove('show');
    })
    .catch((error) => {
      console.error('Agent status set failed', error);
      alert('Failed to set agent state');
    });
}

// Handle incoming call
function handleIncomingCall(task) {
  currentTask = task;
  const caller = task.data.interaction.callAssociatedDetails.ani;

  // Update incoming call info
  incomingCallInfo.textContent = `Incoming call from ${caller}`;
  document.querySelector('.no-tasks').style.display = 'none';

  // Show incoming call controls
  incomingCallControls.style.display = 'block';
  incomingCallControls.classList.remove('hidden');

  // Enable buttons
  answerButton.disabled = false;
  declineButton.disabled = false;

  // Register task listeners
  task.on('task:assigned', handleTaskAssigned);
  task.on('task:media', handleTaskMedia);
  task.on('task:end', handleTaskEnd);
}

// Handle task assigned - update to enable consult/transfer
function handleTaskAssigned() {
  // Hide incoming call controls
  incomingCallControls.style.display = 'none';
  incomingCallControls.classList.add('hidden');

  // Show active call controls
  activeCallControls.style.display = 'block';
  activeCallControls.classList.remove('hidden');

  // Ensure no-tasks message is hidden
  document.querySelector('.no-tasks').style.display = 'none';

  // Enable all call control buttons
  holdButton.disabled = false;
  muteButton.disabled = false;
  endButton.disabled = false;
  consultButton.disabled = false;
  transferButton.disabled = false;

  updateAgentStatus('OnCall');
}

// Handle task media
function handleTaskMedia(track) {
  document.getElementById('remote-audio').srcObject = new MediaStream([track]);
}

// Update handleTaskEnd function
function handleTaskEnd() {
  // Hide call controls
  activeCallControls.style.display = 'none';
  incomingCallControls.style.display = 'none';
  consultDialog.style.display = 'none';
  transferDialog.style.display = 'none';

  activeCallControls.classList.add('hidden');
  incomingCallControls.classList.add('hidden');
  consultDialog.classList.add('hidden');
  transferDialog.classList.add('hidden');

  // Disable buttons
  holdButton.disabled = true;
  muteButton.disabled = true;
  endButton.disabled = true;
  consultButton.disabled = true;
  transferButton.disabled = true;

  // Show wrapup dialog
  wrapupDialog.style.display = 'block';
  wrapupDialog.classList.remove('hidden');
}

// Call control functions
function answerCall() {
  if (currentTask) {
    currentTask.accept(currentTask.data.interactionId);
    // Show active call controls after accepting
    handleTaskAssigned();
  }
}

function declineCall() {
  if (currentTask) {
    currentTask.decline(currentTask.data.interactionId);
    handleTaskEnd();
  }
}

function toggleHold() {
  if (currentTask) {
    if (holdButton.textContent.includes('Hold')) {
      currentTask.hold().then(() => {
        holdButton.innerHTML = '<i class="fas fa-play"></i> Resume';
      });
    } else {
      currentTask.resume().then(() => {
        holdButton.innerHTML = '<i class="fas fa-pause"></i> Hold';
      });
    }
  }
}

function toggleMute() {
  if (currentTask) {
    currentTask.toggleMute();
    if (muteButton.textContent.includes('Mute')) {
      muteButton.innerHTML = '<i class="fas fa-microphone"></i> Unmute';
      muteButton.classList.add('unmuted');
    } else {
      muteButton.innerHTML = '<i class="fas fa-microphone-slash"></i> Mute';
      muteButton.classList.remove('unmuted');
    }
  }
}

// Update endCall function to close all dialogs
function endCall() {
  if (currentTask) {
    currentTask.end().then(() => {
      // Close all dialogs
      consultDialog.classList.add('hidden');
      transferDialog.classList.add('hidden');
      handleTaskEnd();
    });
  }
}

// Add new submitWrapup function
function submitWrapup() {
  if (currentTask && wrapupCodesDropdown.value) {
    const wrapupReason =
      wrapupCodesDropdown.options[wrapupCodesDropdown.selectedIndex].text;
    const auxCodeId =
      wrapupCodesDropdown.options[wrapupCodesDropdown.selectedIndex].value;

    currentTask
      .wrapup({
        wrapUpReason: wrapupReason,
        auxCodeId: auxCodeId,
      })
      .then(() => {
        // Clean up UI after successful wrapup
        wrapupDialog.classList.add('hidden');
        document.querySelector('.no-tasks').style.display = 'block';
        currentTask = null;

        // Reset dropdown for next call
        wrapupCodesDropdown.selectedIndex = 0;

        updateAgentStatus('Available');
      })
      .catch((error) => {
        console.error('Wrapup failed:', error);
        alert('Failed to complete wrapup');
      });
  } else {
    alert('Please select a wrapup reason');
  }
}

// Consult functions
function showConsultDialog() {
  consultDialog.style.display = 'block';
  consultDialog.classList.remove('hidden');
}

function hideConsultDialog() {
  consultDialog.style.display = 'none';
  consultDialog.classList.add('hidden');
}

function initiateConsult() {
  const destination = document.getElementById('consult-destination').value;
  if (!destination) {
    alert('Please enter a destination');
    return;
  }

  currentTask
    .consult({
      to: destination,
      destinationType: 'dialNumber', // Simplified to always use dialNumber
    })
    .then(() => {
      console.log('Consult initiated successfully');
      hideConsultDialog();
      consultButton.disabled = true;
    })
    .catch((error) => {
      console.error('Consult failed:', error);
      alert('Failed to initiate consult');
    });
}

// Transfer functions
function showTransferDialog() {
  transferDialog.style.display = 'block';
  transferDialog.classList.remove('hidden');
}

function hideTransferDialog() {
  transferDialog.style.display = 'none';
  transferDialog.classList.add('hidden');
}

function initiateTransfer() {
  const destination = document.getElementById('transfer-destination').value;
  if (!destination) {
    alert('Please enter a destination');
    return;
  }

  currentTask
    .transfer({
      to: destination,
      destinationType: 'dialNumber', // Simplified to always use dialNumber
    })
    .then(() => {
      console.log('Transfer initiated successfully');
      hideTransferDialog();
      handleTaskEnd(); // Clean up UI after transfer
    })
    .catch((error) => {
      console.error('Transfer failed:', error);
      alert('Failed to initiate transfer');
    });
}

// Add consult event handlers
function registerTaskListeners(task) {
  // ...existing code...

  // Add consult events
  task.on('task:consult', () => {
    console.log('Consult call initiated');
  });

  task.on('task:consultEnd', () => {
    console.log('Consult call ended');
    consultButton.disabled = false;
  });

  task.on('task:transferred', () => {
    console.log('Call transferred successfully');
    handleTaskEnd();
  });
}

// Add these functions after the registerWebexEvents function
function updateAgentStatus(state) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  statusDot.className = 'status-dot';

  switch (state) {
    case 'Available':
      statusDot.classList.add('status-available');
      statusText.textContent = 'Available';
      break;
    case 'Idle':
      statusDot.classList.add('status-idle');
      statusText.textContent = 'Idle';
      break;
    case 'OnCall':
      statusDot.classList.add('status-busy');
      statusText.textContent = 'Engaged';
      break;
    default:
      statusDot.classList.add('status-idle');
      statusText.textContent = 'Offline';
  }
}

// Add this after your existing DOM event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Separate click handlers for state and user menus
  stateMenu.addEventListener('click', function (e) {
    stateDropdown.classList.toggle('show');
    e.stopPropagation();
  });

  userMenu.addEventListener('click', function (e) {
    userDropdown.classList.toggle('show');
    e.stopPropagation();
  });

  // Close both dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!stateMenu.contains(e.target)) {
      stateDropdown.classList.remove('show');
    }
    if (!userMenu.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
  });

  // Add change handler for agent state
  agentState.addEventListener('change', handleAgentStatus);

  // Close dialogs when clicking outside
  document.addEventListener('click', function (e) {
    if (
      !consultDialog.contains(e.target) &&
      !e.target.matches('#consult-button')
    ) {
      consultDialog.classList.add('hidden');
    }
    if (
      !transferDialog.contains(e.target) &&
      !e.target.matches('#transfer-button')
    ) {
      transferDialog.classList.add('hidden');
    }
  });
});
