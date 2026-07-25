<template>
  <header class="topbar">
    <div class="topbar-left">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div
      class="topbar-right"
      style="display: flex; align-items: center; gap: 12px"
    >
      <!-- Quick Role Switcher -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--glass);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        "
      >
        <i
          class="fa-solid fa-user-shield"
          style="color: var(--accent); font-size: 14px"
        ></i>
        <span
          style="
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
          "
          >Role:</span
        >
        <select
          :value="currentRole"
          @change="$emit('change-role', $event.target.value)"
          style="
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            outline: none;
          "
        >
          <option
            v-for="r in systemRoles || []"
            :key="r"
            :value="r"
            style="background: #1e1e2d; color: #fff"
          >
            {{ r }}
          </option>
        </select>
      </div>

      <div
        class="topbar-btn"
        @click="$emit('navigate', 'settings')"
        title="Settings"
      >
        <i class="fa-solid fa-gear"></i>
      </div>
      <div class="topbar-btn" title="Notifications">
        <i class="fa-solid fa-bell"></i>
      </div>
      <div class="topbar-btn" @click="$emit('logout')" title="Logout">
        <i class="fa-solid fa-right-from-bracket"></i>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'HNF CRM' },
  subtitle: { type: String, default: '' },
  currentRole: { type: String, default: 'HOD IT' },
  systemRoles: { type: Array, default: () => [] },
});

defineEmits(['logout', 'navigate', 'change-role']);
</script>
