(() => {
  console.log('🎯 Job Filter AI: LinkedIn script loaded');

  let isScanning = false;
  let settings = {};

  // Initialize
  async function init() {
    settings = await getUserSettings();
    
    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCAN_JOBS') {
        scanJobs();
      } else if (message.type === 'CLEAR_FILTERS') {
        clearFilters();
      }
    });

    // Auto-scan if enabled
    if (settings.autoFilter) {
      // Wait for page to load jobs
      setTimeout(() => scanJobs(), 2000);
    }

    // Add manual scan button
    addScanButton();
  }

  // Add floating scan button
  function addScanButton() {
    if (document.getElementById('job-filter-scan-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'job-filter-scan-btn';
    btn.className = 'job-filter-scan-btn';
    btn.textContent = '🎯 Scan Jobs';
    btn.onclick = scanJobs;
    document.body.appendChild(btn);
  }

  // Main scan function
  async function scanJobs() {
    if (isScanning) return;
    isScanning = true;

    console.log('🔍 Scanning LinkedIn jobs...');

    // LinkedIn job card selectors (may need updates as LinkedIn changes)
    const jobCards = document.querySelectorAll(
      '.jobs-search-results__list-item, .job-card-container, .scaffold-layout__list-item'
    );

    if (jobCards.length === 0) {
      console.log('⚠️ No job cards found');
      isScanning = false;
      return;
    }

    console.log(`📊 Found ${jobCards.length} job cards`);

    let matchedCount = 0;

    for (const card of jobCards) {
      // Skip if already processed
      if (card.querySelector('.job-filter-badge')) continue;

      const jobData = extractJobData(card);
      if (!jobData) continue;

      // Get match score from backend
      const matchResult = await matchJob(jobData);

      // Add visual indicator
      addMatchIndicator(card, matchResult);

      // Dim low-match jobs
      if (matchResult.score * 100 < settings.threshold) {
        card.classList.add('job-filter-dimmed');
      } else {
        matchedCount++;
      }
    }

    // Update stats
    await updateStats(jobCards.length, matchedCount);

    console.log(`✅ Scan complete: ${matchedCount}/${jobCards.length} jobs matched`);
    isScanning = false;
  }

  // Extract job data from LinkedIn card
  function extractJobData(card) {
    try {
      // LinkedIn DOM selectors (adjust as needed)
      const titleEl = card.querySelector(
        '.job-card-list__title, .artdeco-entity-lockup__title, .job-card-container__link'
      );
      
      const companyEl = card.querySelector(
        '.job-card-container__primary-description, .artdeco-entity-lockup__subtitle'
      );
      
      const locationEl = card.querySelector(
        '.job-card-container__metadata-item, .artdeco-entity-lockup__caption'
      );

      const title = titleEl?.innerText?.trim() || 'Unknown Title';
      const company = companyEl?.innerText?.trim() || 'Unknown Company';
      const location = locationEl?.innerText?.trim() || 'Unknown Location';

      // Try to get job description (if available)
      const descriptionEl = card.querySelector('.job-card-container__job-insight');
      const description = descriptionEl?.innerText?.trim() || '';

      return {
        title,
        company,
        location,
        description,
        platform: 'linkedin'
      };
    } catch (error) {
      console.error('Error extracting job data:', error);
      return null;
    }
  }

  // Add match indicator to job card
  function addMatchIndicator(card, matchResult) {
    const score = Math.round(matchResult.score * 100);
    
    // Determine badge color
    let badgeClass = 'low';
    if (score >= 70) badgeClass = 'high';
    else if (score >= 40) badgeClass = 'medium';

    // Create badge
    const badge = document.createElement('div');
    badge.className = `job-filter-badge ${badgeClass}`;
    badge.textContent = `${score}% Match`;

    // Insert badge at top of card
    const insertTarget = card.querySelector(
      '.artdeco-entity-lockup__content, .job-card-container__metadata'
    );
    
    if (insertTarget) {
      insertTarget.insertBefore(badge, insertTarget.firstChild);
    } else {
      card.insertBefore(badge, card.firstChild);
    }

    // Add reasons if enabled
    if (settings.showReasons && matchResult.reasons) {
      const reasonsDiv = createReasonsElement(matchResult);
      badge.after(reasonsDiv);
    }
  }

  // Create reasons display element
  function createReasonsElement(matchResult) {
    const div = document.createElement('div');
    div.className = 'job-filter-reasons';
    
    const title = document.createElement('div');
    title.className = 'job-filter-reasons-title';
    title.textContent = 'Match Details:';
    
    const list = document.createElement('ul');
    
    // Add matched skills
    if (matchResult.matched_skills?.length > 0) {
      const skillsLi = document.createElement('li');
      skillsLi.innerHTML = `<span class="match-skill">✓</span> Skills: ${matchResult.matched_skills.join(', ')}`;
      list.appendChild(skillsLi);
    }

    // Add reasons
    matchResult.reasons?.forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      list.appendChild(li);
    });

    div.appendChild(title);
    div.appendChild(list);
    
    return div;
  }

  // Clear all filters
  function clearFilters() {
    document.querySelectorAll('.job-filter-badge, .job-filter-reasons').forEach(el => el.remove());
    document.querySelectorAll('.job-filter-dimmed').forEach(el => {
      el.classList.remove('job-filter-dimmed');
    });
    console.log('🧹 Filters cleared');
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-scan when new jobs load (for infinite scroll)
  const observer = new MutationObserver((mutations) => {
    if (settings.autoFilter) {
      scanJobs();
    }
  });

  // Observe job list container for changes
  setTimeout(() => {
    const jobList = document.querySelector('.jobs-search-results-list, .scaffold-layout__list');
    if (jobList) {
      observer.observe(jobList, { childList: true, subtree: true });
    }
  }, 3000);
})();
