/**
 * dashboard-sidebar.js
 * Injects a collapsible left-side dashboard panel that shows
 * hours worked this week, month, and year.
 *
 * Usage: import "./dashboard-sidebar.js" in your main entry point.
 * Depends on getWeekHours, getMonthHours, getYearHours from timeTracker.js.
 */

import { getWeekHours, getMonthHours, getYearHours } from "./timeTracker.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_STORAGE_KEY = "dashboardSidebarOpen";
const REFRESH_INTERVAL_MS = 60_000; // refresh stats every minute

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts milliseconds to a decimal hour string, e.g. "3.5 hrs".
 * Shows minutes instead when under 60 minutes.
 */
function formatHours(ms) {
  if (ms <= 0) return "0 hrs";
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = (ms / 3_600_000).toFixed(1);
  return `${hours} hrs`;
}

/**
 * Returns a 0–100 progress value for the week assuming a 40-hour week.
 */
function weekProgress(ms) {
  return Math.min(100, ((ms / 3_600_000) / 40) * 100).toFixed(0);
}

/**
 * Returns a 0–100 progress value for the month assuming 160 hours/month.
 */
function monthProgress(ms) {
  return Math.min(100, ((ms / 3_600_000) / 160) * 100).toFixed(0);
}

/**
 * Returns a 0–100 progress value for the year assuming 1920 hours/year.
 */
function yearProgress(ms) {
  return Math.min(100, ((ms / 3_600_000) / 1920) * 100).toFixed(0);
}

// ─── DOM Building ─────────────────────────────────────────────────────────────

function buildSidebar() {
  const sidebar = document.createElement("aside");
  sidebar.id = "ws-dashboard-sidebar";
  sidebar.setAttribute("aria-label", "Time dashboard");
  sidebar.innerHTML = `
    <button
      id="ws-sidebar-toggle"
      class="ws-sidebar-toggle"
      aria-expanded="false"
      aria-controls="ws-dashboard-sidebar"
      title="Open dashboard"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="18" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      <span class="ws-toggle-label">Dashboard</span>
    </button>

    <div class="ws-sidebar-panel" id="ws-sidebar-panel" aria-hidden="true">
      <header class="ws-sidebar-header">
        <span class="ws-sidebar-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Time Dashboard
        </span>
        <button class="ws-sidebar-close" id="ws-sidebar-close" title="Close dashboard" aria-label="Close dashboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div class="ws-sidebar-content">
        <p class="ws-sidebar-subtitle">Hours Worked</p>

        <!-- This Week -->
        <div class="ws-stat-card">
          <div class="ws-stat-meta">
            <span class="ws-stat-period">This Week</span>
            <span class="ws-stat-value" id="ws-week-hours">—</span>
          </div>
          <div class="ws-progress-track" aria-hidden="true">
            <div class="ws-progress-fill ws-fill--week" id="ws-week-fill" style="width: 0%"></div>
          </div>
          <span class="ws-progress-label" id="ws-week-pct">0% of 40 hrs</span>
        </div>

        <!-- This Month -->
        <div class="ws-stat-card">
          <div class="ws-stat-meta">
            <span class="ws-stat-period">This Month</span>
            <span class="ws-stat-value" id="ws-month-hours">—</span>
          </div>
          <div class="ws-progress-track" aria-hidden="true">
            <div class="ws-progress-fill ws-fill--month" id="ws-month-fill" style="width: 0%"></div>
          </div>
          <span class="ws-progress-label" id="ws-month-pct">0% of 160 hrs</span>
        </div>

        <!-- This Year -->
        <div class="ws-stat-card">
          <div class="ws-stat-meta">
            <span class="ws-stat-period">This Year</span>
            <span class="ws-stat-value" id="ws-year-hours">—</span>
          </div>
          <div class="ws-progress-track" aria-hidden="true">
            <div class="ws-progress-fill ws-fill--year" id="ws-year-fill" style="width: 0%"></div>
          </div>
          <span class="ws-progress-label" id="ws-year-pct">0% of 1 920 hrs</span>
        </div>

        <hr class="ws-divider" />

        <p class="ws-sidebar-note">
          Based on 40 hrs/wk, 160 hrs/mo, 1 920 hrs/yr
        </p>
      </div>
    </div>
  `;
  return sidebar;
}

// ─── Stats Rendering ──────────────────────────────────────────────────────────

function renderStats() {
  try {
    const weekMs   = getWeekHours();
    const monthMs  = getMonthHours();
    const yearMs   = getYearHours();

    // Values
    document.getElementById("ws-week-hours").textContent  = formatHours(weekMs);
    document.getElementById("ws-month-hours").textContent = formatHours(monthMs);
    document.getElementById("ws-year-hours").textContent  = formatHours(yearMs);

    // Progress bars (animated via CSS transition)
    const wPct = weekProgress(weekMs);
    const mPct = monthProgress(monthMs);
    const yPct = yearProgress(yearMs);

    document.getElementById("ws-week-fill").style.width  = `${wPct}%`;
    document.getElementById("ws-month-fill").style.width = `${mPct}%`;
    document.getElementById("ws-year-fill").style.width  = `${yPct}%`;

    // Labels
    document.getElementById("ws-week-pct").textContent  = `${wPct}% of 40 hrs`;
    document.getElementById("ws-month-pct").textContent = `${mPct}% of 160 hrs`;
    document.getElementById("ws-year-pct").textContent  = `${yPct}% of 1 920 hrs`;
  } catch (err) {
    console.warn("[Dashboard] Could not render stats:", err);
  }
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

function openSidebar() {
  const sidebar = document.getElementById("ws-dashboard-sidebar");
  const panel   = document.getElementById("ws-sidebar-panel");
  const toggle  = document.getElementById("ws-sidebar-toggle");

  sidebar.classList.add("ws-sidebar--open");
  panel.setAttribute("aria-hidden", "false");
  toggle.setAttribute("aria-expanded", "true");
  toggle.title = "Dashboard open";
  localStorage.setItem(SIDEBAR_STORAGE_KEY, "1");
  renderStats(); // fresh render on open
}

function closeSidebar() {
  const sidebar = document.getElementById("ws-dashboard-sidebar");
  const panel   = document.getElementById("ws-sidebar-panel");
  const toggle  = document.getElementById("ws-sidebar-toggle");

  sidebar.classList.remove("ws-sidebar--open");
  panel.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.title = "Open dashboard";
  localStorage.setItem(SIDEBAR_STORAGE_KEY, "0");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initDashboardSidebar() {
  // Prevent double-init
  if (document.getElementById("ws-dashboard-sidebar")) return;

  const sidebar = buildSidebar();
  document.body.appendChild(sidebar);

  // Wire toggle button (the tab sticking out)
  document.getElementById("ws-sidebar-toggle").addEventListener("click", () => {
    const isOpen = document.getElementById("ws-dashboard-sidebar")
      .classList.contains("ws-sidebar--open");
    isOpen ? closeSidebar() : openSidebar();
  });

  // Wire close button inside panel
  document.getElementById("ws-sidebar-close").addEventListener("click", closeSidebar);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Restore last open state
  if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1") {
    openSidebar();
  }

  // Auto-refresh stats on interval
  setInterval(renderStats, REFRESH_INTERVAL_MS);

  // Also refresh when app saves a session (custom event hook)
  document.addEventListener("ws:sessionSaved", renderStats);
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboardSidebar);
} else {
  initDashboardSidebar();
}

export { renderStats, openSidebar, closeSidebar };
