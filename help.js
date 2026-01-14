// Simple script for help page interactions
document.addEventListener("DOMContentLoaded", () => {
  // Could add collapsible FAQ sections, search functionality, etc.
  console.log("Help page loaded");

  // Optional: Add click tracking for analytics
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      console.log("Help link clicked:", e.target.href);
    });
  });
});
