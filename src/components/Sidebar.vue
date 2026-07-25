<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon"><i class="fa-solid fa-bolt"></i></div>
      <span class="logo-text">HNF CRM</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      <div
        class="nav-item"
        :class="{ active: page === 'dashboard' }"
        @click="$emit('navigate', 'dashboard')"
      >
        <i class="fa-solid fa-chart-pie"></i> Dashboard
      </div>
      <div
        class="nav-item"
        :class="{ active: page === 'customers' }"
        @click="$emit('navigate', 'customers')"
      >
        <i class="fa-solid fa-users"></i> Customers
        <span class="nav-badge">8</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: page === 'tasks' }"
        @click="$emit('navigate', 'tasks')"
      >
        <i class="fa-solid fa-list-check"></i> Tasks
        <span class="nav-badge">5</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: page === 'schedule' }"
        @click="$emit('navigate', 'schedule')"
      >
        <i class="fa-solid fa-chart-gantt"></i> Schedule
      </div>

      <div class="nav-section-label">Team</div>
      <div
        class="nav-item"
        :class="{ active: page === 'employees' }"
        @click="$emit('navigate', 'employees')"
      >
        <i class="fa-solid fa-user-tie"></i> Employees
      </div>

      <div class="nav-section-label">System</div>
      <div
        class="nav-item"
        :class="{ active: page === 'settings' }"
        @click="$emit('navigate', 'settings')"
      >
        <i class="fa-solid fa-gear"></i> Settings
      </div>
    </nav>

    <div class="sidebar-footer">
      <div
        class="user-card"
        @click="$emit('navigate', 'settings')"
        title="Click to view Settings"
      >
        <div
          class="avatar avatar-sm"
          style="
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
          "
        >
          {{ user ? user.initials : 'AD' }}
        </div>
        <div style="overflow: hidden">
          <div
            class="user-name"
            style="
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            "
          >
            {{ user ? user.name : 'Admin User' }}
          </div>
          <div class="user-role">{{ user ? user.role : 'Super Admin' }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  page: { type: String, required: true },
  user: {
    type: Object,
    default: () => ({ name: 'Admin User', role: 'HOD IT', initials: 'AD' }),
  },
});

defineEmits(['navigate']);
</script>
