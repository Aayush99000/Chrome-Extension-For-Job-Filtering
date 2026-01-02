(() => {
    console.log("LinkedIn content script loaded.");
    let inScanning =false;
    let settings ={};

    async funtion init() {
        settings =await getUserSettings();

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'Scan_Jobs') {
                scanJobs();
            } else if (message type == 'Clear_Filters') {
                clearFilters();
            }
    });

    if (settings.autoFilter) {
        setTimeout(() => scanJobs(), 3000);
    }

    addScanButton();
}

//add floating scan button
function addScanButton() {
    if (document.getElementById('job-filter-scan-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'job-filter-scan-btn';
    btn.className = 'job-filter-scan-btn';
    btn.textContent = 'Scan Jobs';
    btn.onclick = () => {
        scanJobs();
    };
    document.body.appendChild(btn);
}

//scan jobs function
async function scanJobs() {
    if (isScanning) return;;
    isScanning = true;

    console.log("Scanning jobs...");

    const jobCards = document.querrySelectorAll('.job-card-container ,.job-search-results__list-item, .scaffold-layout__list-item');
    if (jobCards.length === 0) {
        console.log('No job cards found on this page.');
        isScanning = false;
        return;
    }
    console.log(`Found ${jobCards.length} job cards.`);

    let matchedCount = 0;

    for (const card of jobCards) {
        if( card.querrySelector('.job-filter-badge')) continue;
        const jobData = extractJobData(card);
        if (!jobData) continue;

        //Get match score from background
        const matchResult = await matchJob(jobData);

        addMatchIndicator(card , matchResult);

        //Dim low matchin jobs
        if (matchResult.score*100 < settings.Threshold) {
            card.classList.add('job-filter-dimmed');
        } else {
            matchedCount++;
        }
    }

    //update status
    await updateStatus(jobCards.length , matchedCount);

    console.log('Job scanning completed : ${matchedCount}/${jobCards.length} jobs matched');
    isScanning = false;
}

//extract job data from card
function extractJobData(card) {
    try {
        const title = card.querrySelector('.job-card-list__title, .job-card-container__link, .job-search-card__title').innerText.trim();
        const company = card.querrySelector('.job-card-container__company-name, .job-card-list__company-name, .job-search-card__subtitle').innerText.trim();
        const location = card.querrySelector('.job-card-container__metadata-item, .job-card-list__location, .job-search-card__location').innerText.trim();
        const description = card.querrySelector('.job-card-container__description, .job-card-list__description, .job-search-card__snippet')?.innerText.trim() || '';
        
        return { title, company, location, description , url: window.location.href };
    } catch (error) {
        console.error('Error extracting job data:', error);
        return null;
    }
}

//add match indicator to job card
function addMatchIndicator(card , matchResults){
    const score = Math.round(matchResults.score * 100);
}
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