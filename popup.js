import { uploadResume, getStoredResume } from "../utils/api.js";

// DOM Elements
const uploadSection = document.getElementById("upload-section");
const resumeInfo = document.getElementById("resume-info");
const filterSettings = document.getElementById("filter-settings");
const actions = document.getElementById("actions");
const stats = document.getElementById("stats");

const fileInput = document.getElementById("resume-upload");
const fileName = document.getElementById("file-name");
const processBtn = document.getElementById("process-btn");
const uploadStatus = document.getElementById("upload-status");
const changeResumeBtn = document.getElementById("change-resume-btn");

const thresholdSlider = document.getElementById("threshold");
const thresholdValue = document.getElementById("threshold-value");
const scanBtn = document.getElementById("scan-btn");
const clearFiltersBtn = document.getElementById("clear-filters-btn");

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await checkExistingResume();
  setupEventListeners();
  loadStats();
});

// Check if resume already uploaded
async function checkExistingResume() {
  chrome.storage.local.get(["resumeData"], (result) => {
    if (result.resumeData) {
      showResumeLoaded(result.resumeData.fileName);
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // File selection
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileName.textContent = file.name;
      processBtn.disabled = false;
    }
  });

  // Process resume
  processBtn.addEventListener("click", handleResumeUpload);

  // Change resume
  changeResumeBtn.addEventListener("click", () => {
    uploadSection.style.display = "block";
    resumeInfo.style.display = "none";
    filterSettings.style.display = "none";
    actions.style.display = "none";
    stats.style.display = "none";
  });

  // Threshold slider
  thresholdSlider.addEventListener("input", (e) => {
    thresholdValue.textContent = `${e.target.value}%`;
    chrome.storage.local.set({ threshold: e.target.value });
  });

  // Scan current page
  scanBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { type: "SCAN_JOBS" });
    showStatus("Scanning jobs on current page...", "loading");
  });

  // Clear filters
  clearFiltersBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { type: "CLEAR_FILTERS" });
    showStatus("Filters cleared!", "success");
  });
}

// Handle resume upload
async function handleResumeUpload() {
  const file = fileInput.files[0];
  if (!file) return;

  showStatus("Processing resume...", "loading");
  processBtn.disabled = true;

  try {
    const result = await uploadResume(file);

    if (result.success) {
      // Store resume data
      chrome.storage.local.set({
        resumeData: {
          fileName: file.name,
          data: result.data,
          uploadedAt: new Date().toISOString(),
        },
      });

      showStatus("Resume processed successfully!", "success");
      setTimeout(() => {
        showResumeLoaded(file.name);
      }, 1500);
    } else {
      showStatus("Error processing resume. Please try again.", "error");
      processBtn.disabled = false;
    }
  } catch (error) {
    console.error("Upload error:", error);
    showStatus("Failed to upload resume. Is the backend running?", "error");
    processBtn.disabled = false;
  }
}

// Show resume loaded state
function showResumeLoaded(fileName) {
  uploadSection.style.display = "none";
  resumeInfo.style.display = "block";
  filterSettings.style.display = "block";
  actions.style.display = "block";
  stats.style.display = "block";

  document.getElementById("resume-file-name").textContent = fileName;
}

// Show status message
function showStatus(message, type) {
  uploadStatus.textContent = message;
  uploadStatus.className = `status ${type}`;
}

// Load stats
function loadStats() {
  chrome.storage.local.get(["stats"], (result) => {
    const stats = result.stats || { scanned: 0, matched: 0 };
    document.getElementById("jobs-scanned").textContent = stats.scanned;
    document.getElementById("jobs-matched").textContent = stats.matched;
  });
}
