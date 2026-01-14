(() => {
  console.log('🎯 Job Filter AI: Glassdoor script loaded');

  let isScanning = false;
  let settings = {};

  async function init() {
    settings = await getUserSettings();
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCAN_JOBS') scanJobs();
      else if (message.type === 'CLEAR_FILTERS') clearFilters();
    });

    if (settings.autoFilter) {
      setTimeout(() => scanJobs(), 2000);
    }

    addScanButton();
  }

  function addScanButton() {
    if (document.getElementById('job-filter-scan-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'job-filter-scan-btn';
    btn.className = 'job-filter-scan-btn';
    btn.textContent = '🎯 Scan Jobs';
    btn.onclick = scanJobs;
    document.body.appendChild(btn);
  }

  async function scanJobs() {
    if (isScanning) return;
    isScanning = true;

    console.log('🔍 Scanning Glassdoor jobs...');

    // Glassdoor job card selectors
    const jobCards = document.querySelectorAll(
      '[data-test="jobListing"], .react-job-listing, .JobsList_jobListItem__wjTHv'
    );

    if (jobCards.length === 0) {
      console.log('⚠️ No job cards found');
      isScanning = false;
      return;
    }

    console.log(`📊 Found ${jobCards.length} job cards`);
    let matchedCount = 0;

    for (const card of jobCards) {
      if (card.querySelector('.job-filter-badge')) continue;

      const jobData = extractJobData(card);
      if (!jobData) continue;

      const matchResult = await matchJob(jobData);
      addMatchIndicator(card, matchResult);

      if (matchResult.score * 100 < settings.threshold) {
        card.classList.add('job-filter-dimmed');
      } else {
        matchedCount++;
      }
    }

    await updateStats(jobCards.length, matchedCount);
    console.log(`✅ Scan complete: ${matchedCount}/${jobCards.length} jobs matched`);
    isScanning = false;
  }

  function extractJobData(card) {
    try {
      const titleEl = card.querySelector(
        '[data-test="job-title"], .JobCard_jobTitle__GLrsC, .job-title'
      );
      
      const companyEl = card.querySelector(
        '[data-test="employer-name"], .EmployerProfile_employerName__xMpBh, .employer-name'
      );
      
      const locationEl = card.querySelector(
        '[data-test="emp-location"], .JobCard_location__N_iYE, .location'
      );

      return {
        title: titleEl?.innerText?.trim() || 'Unknown Title',
        company: companyEl?.innerText?.trim() || 'Unknown Company',
        location: locationEl?.innerText?.trim() || 'Unknown Location',
        description: '',
        platform: 'glassdoor'
      };
    } catch (error) {
      console.error('Error extracting job data:', error);
      return null;
    }
  }

  function addMatchIndicator(card, matchResult) {
    const score = Math.round(matchResult.score * 100);
    let badgeClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

    const badge = document.createElement('div');
    badge.className = `job-filter-badge ${badgeClass}`;
    badge.textContent = `${score}% Match`;

    card.insertBefore(badge, card.firstChild);

    if (settings.showReasons && matchResult.reasons) {
      const reasonsDiv = createReasonsElement(matchResult);
      badge.after(reasonsDiv);
    }
  }

  function createReasonsElement(matchResult) {
    const div = document.createElement('div');
    div.className = 'job-filter-reasons';
    
    const title = document.createElement('div');
    title.className = 'job-filter-reasons-title';
    title.textContent = 'Match Details:';
    
    const list = document.createElement('ul');
    
    if (matchResult.matched_skills?.length > 0) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="match-skill">✓</span> Skills: ${matchResult.matched_skills.join(', ')}`;
      list.appendChild(li);
    }

    matchResult.reasons?.forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      list.appendChild(li);
    });

    div.appendChild(title);
    div.appendChild(list);
    return div;
  }

  function clearFilters() {
    document.querySelectorAll('.job-filter-badge, .job-filter-reasons').forEach(el => el.remove());
    document.querySelectorAll('.job-filter-dimmed').forEach(el => {
      el.classList.remove('job-filter-dimmed');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
