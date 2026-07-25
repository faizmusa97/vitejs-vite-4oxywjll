<!DOCTYPE html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wellio — Glass Health Dashboard</title>
    <meta
      name="description"
      content="Wellio glass morphism health and fitness dashboard"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>

  <body>
    <!-- SIDEBAR -->
    <div id="sidebar-mount"></div>

    <!-- MAIN LAYOUT -->
    <div class="app-layout">
      <!-- CENTER CONTENT -->
      <main class="main-content" id="main-content">
        <div id="header-mount"></div>
        <div id="stats-mount"></div>
        <div id="heart-mount"></div>
      </main>

      <!-- RIGHT PANEL -->
      <aside class="right-panel" id="right-panel">
        <div id="insights-mount"></div>
        <div id="schedule-mount"></div>
      </aside>
    </div>

    <style>
      .app-layout {
        margin-left: var(--sidebar-width);
        display: grid;
        grid-template-columns: 1fr 310px;
        min-height: 100vh;
        max-height: 100vh;
        overflow: hidden;
      }

      .main-content {
        padding: 28px 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .right-panel {
        padding: 24px 16px 24px 8px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        border-left: 1px solid var(--glass-border);
        background: rgba(255, 255, 255, 0.02);
      }
    </style>

    <script>
      async function loadComponent(id, file) {
        const r = await fetch(file);
        const html = await r.text();
        document.getElementById(id).innerHTML = html;
      }
      Promise.all([
        loadComponent('sidebar-mount', 'components/sidebar.html'),
        loadComponent('header-mount', 'components/header.html'),
        loadComponent('stats-mount', 'components/stats-cards.html'),
        loadComponent('heart-mount', 'components/heart-rate.html'),
        loadComponent('insights-mount', 'components/health-insights.html'),
        loadComponent('schedule-mount', 'components/activity-schedule.html'),
      ]);
    </script>
  </body>
</html>
