// API helper functions for calling Python backend

const API_URL = "http://localhost:5000/api";

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch(`${API_URL}/resume/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function getStoredResume() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["resumeData"], (result) => {
      resolve(result.resumeData || null);
    });
  });
}

export async function matchJob(jobData) {
  try {
    const response = await fetch(`${API_URL}/match/job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Match API Error:", error);
    // Return mock data if backend is down
    return getMockMatchData(jobData);
  }
}

// Mock data for testing without backend
function getMockMatchData(jobData) {
  const title = jobData.title?.toLowerCase() || "";
  const score = Math.random() * 0.5 + 0.3; // Random score between 0.3 and 0.8

  return {
    score: score,
    matched_skills: ["Python", "JavaScript", "React"],
    reasons: [
      "Technical skills match requirements",
      "Experience level appropriate",
      "Location preference aligns",
    ],
  };
}

// Get user settings from storage
export async function getUserSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["threshold", "autoFilter", "showReasons"],
      (result) => {
        resolve({
          threshold: result.threshold || 70,
          autoFilter: result.autoFilter !== false,
          showReasons: result.showReasons !== false,
        });
      }
    );
  });
}

// Update stats
export async function updateStats(scanned, matched) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["stats"], (result) => {
      const stats = result.stats || { scanned: 0, matched: 0 };
      stats.scanned += scanned;
      stats.matched += matched;
      chrome.storage.local.set({ stats }, resolve);
    });
  });
}
