// Load settings when page opens
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  setupEventListeners();
});

// Load current settings from storage
async function loadSettings() {
  chrome.storage.local.get([
    'threshold',
    'autoFilter',
    'showReasons',
    'hideLowMatches',
    'badgeStyle',
    'colorTheme',
    'enableNotifications',
    'notificationThreshold'
  ], (result) => {
    // Filtering preferences
    document.getElementById('threshold-setting').value = result.threshold || 70;
    document.getElementById('auto-filter-setting').checked = result.autoFilter !== false;
    document.getElementById('show-reasons-setting').checked = result.showReasons !== false;
    document.getElementById('hide-low-setting').checked = result.hideLowMatches || false;
    
    // Display settings
    document.getElementById('badge-style-setting').value = result.badgeStyle || 'percentage';
    document.getElementById('color-theme-setting').value = result.colorTheme || 'default';
    
    // Notification settings
    document.getElementById('notifications-setting').checked = result.enableNotifications || false;
    document.getElementById('notification-threshold-setting').value = result.notificationThreshold || 80;
  });
}

// Setup event listeners for all settings
function setupEventListeners() {
  // Threshold
  document.getElementById('threshold-setting').addEventListener('change', (e) => {
    saveSetting('threshold', parseInt(e.target.value));
  });

  // Auto-filter
  document.getElementById('auto-filter-setting').addEventListener('change', (e) => {
    saveSetting('autoFilter', e.target.checked);
  });

  // Show reasons
  document.getElementById('show-reasons-setting').addEventListener('change', (e) => {
    saveSetting('showReasons', e.target.checked);
  });

  // Hide low matches
  document.getElementById('hide-low-setting').addEventListener('change', (e) => {
    saveSetting('hideLowMatches', e.target.checked);
  });

  // Badge style
  document.getElementById('badge-style-setting').addEventListener('change', (e) => {
    saveSetting('badgeStyle', e.target.value);
  });

  // Color theme
  document.getElementById('color-theme-setting').addEventListener('change', (e) => {
    saveSetting('colorTheme', e.target.value);
  });

  // Notifications
  document.getElementById('notifications-setting').addEventListener('change', (e) => {
    saveSetting('enableNotifications', e.target.checked);
  });

  // Notification threshold
  document.getElementById('notification-threshold-setting').addEventListener('change', (e) => {
    saveSetting('notificationThreshold', parseInt(e.target.value));
  });

  // Clear resume data
  document.getElementById('clear-resume-btn').addEventListener('click', clearResumeData);

  // Reset settings
  document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
}

// Save individual setting
function saveSetting(key, value) {
  chrome.storage.local.set({ [key]: value }, () => {
    showSaveNotification();
  });
}

// Show save notification
function showSaveNotification() {
  const notification = document.getElementById('save-notification');
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// Clear resume data
function clearResumeData() {
  if (confirm('Are you sure you want to clear your resume data? This cannot be undone.')) {
    chrome.storage.local.remove(['resumeData'], () => {
      alert('Resume data cleared successfully!');
      // Reload main popup
      window.location.href = 'popup.html';
    });
  }
}

// Reset all settings to defaults
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    const defaults = {
      threshold: 70,
      autoFilter: true,
      showReasons: true,
      hideLowMatches: false,
      badgeStyle: 'percentage',
      colorTheme: 'default',
      enableNotifications: false,
      notificationThreshold: 80
    };

    chrome.storage.local.set(defaults, () => {
      alert('Settings reset to defaults!');
      loadSettings(); // Reload to show defaults
      showSaveNotification();
    });
  }
}