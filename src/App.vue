<template>
  <!-- LOGIN -->
  <div v-if="!isLoggedIn" class="login-page">
    <div class="login-card fade-in">
      <div class="login-logo">
        <div
          class="logo-icon"
          style="
            width: 52px;
            height: 52px;
            font-size: 22px;
            border-radius: 14px;
          "
        >
          <i class="fa-solid fa-bolt"></i>
        </div>
      </div>
      <h2 class="login-title">Welcome back</h2>
      <p class="login-sub">Sign in to your HNF CRM account</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <div class="input-icon">
          <i class="fa-solid fa-envelope"></i
          ><input
            class="form-control"
            type="email"
            v-model="loginForm.email"
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-icon">
          <i class="fa-solid fa-lock"></i
          ><input
            class="form-control"
            type="password"
            v-model="loginForm.password"
            placeholder="Enter password (admin123)"
            @keyup.enter="doLogin"
          />
        </div>
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        "
      >
        <label class="checkbox-row"
          ><input type="checkbox" v-model="loginForm.remember" /> Remember
          me</label
        >
        <a href="#" style="font-size: 13px; color: var(--accent)"
          >Forgot password?</a
        >
      </div>
      <div
        v-if="loginError"
        style="
          color: var(--danger);
          font-size: 13px;
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
        "
      >
        <i class="fa-solid fa-circle-exclamation"></i> {{ loginError }}
      </div>
      <button class="btn btn-primary login-btn" @click="doLogin">
        <i class="fa-solid fa-right-to-bracket"></i> Sign In
      </button>
      <p
        style="
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: var(--text-muted);
        "
      >
        Hint: password is
        <strong style="color: var(--text-secondary)">admin123</strong>
      </p>
    </div>
  </div>

  <!-- MAIN APP -->
  <div v-else class="layout">
    <Sidebar
      :page="page"
      :user="userProfile"
      @navigate="
        (p) => {
          page = p;
          selectedCustomer = null;
          selectedEmployee = null;
        }
      "
    />
    <div class="main-content">
      <Topbar
        :title="pageInfo.title"
        :subtitle="pageInfo.subtitle"
        :current-role="currentRole"
        :system-roles="systemRoles"
        @logout="isLoggedIn = false"
        @navigate="
          (p) => {
            page = p;
            selectedCustomer = null;
            selectedEmployee = null;
          }
        "
        @change-role="switchRole"
      />
      <div class="page-wrapper fade-in">
        <!-- DASHBOARD -->
        <div v-if="page === 'dashboard'">
          <div class="stats-grid">
            <div v-if="can('view_sales')" class="stat-card indigo">
              <div class="stat-icon indigo">
                <i class="fa-solid fa-dollar-sign"></i>
              </div>
              <div class="stat-value">
                ${{ (totalRevenue / 1000).toFixed(0) }}k
              </div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-change up">
                <i class="fa-solid fa-arrow-trend-up"></i> +18.2% this month
              </div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon purple">
                <i class="fa-solid fa-users"></i>
              </div>
              <div class="stat-value">{{ customers.length }}</div>
              <div class="stat-label">Total Customers</div>
              <div class="stat-change up">
                <i class="fa-solid fa-arrow-trend-up"></i> +3 this week
              </div>
            </div>
            <div class="stat-card cyan">
              <div class="stat-icon cyan">
                <i class="fa-solid fa-list-check"></i>
              </div>
              <div class="stat-value">{{ openTasks }}</div>
              <div class="stat-label">Open Tasks</div>
              <div class="stat-change down">
                <i class="fa-solid fa-arrow-trend-down"></i> 2 overdue
              </div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon green">
                <i class="fa-solid fa-user-check"></i>
              </div>
              <div class="stat-value">{{ activeCount }}</div>
              <div class="stat-label">Active Clients</div>
              <div class="stat-change up">
                <i class="fa-solid fa-arrow-trend-up"></i> 75% retention
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div v-if="can('view_sales')" class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">Revenue Trend</div>
                  <div class="card-subtitle">Last 12 months performance</div>
                </div>
                <span class="badge badge-success">+18.2%</span>
              </div>
              <div
                class="mini-chart"
                style="height: 80px; align-items: flex-end; gap: 6px"
              >
                <div
                  v-for="(v, i) in chartData"
                  :key="i"
                  class="mini-bar"
                  :style="{
                    height: v + '%',
                    background: 'linear-gradient(180deg,#6366f1,#8b5cf6)',
                    opacity: i === chartData.length - 1 ? 1 : 0.55,
                    borderRadius: '5px 5px 0 0',
                    flex: 1,
                  }"
                ></div>
              </div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  margin-top: 10px;
                "
              >
                <span
                  v-for="m in ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']"
                  :key="m"
                  style="font-size: 11px; color: var(--text-muted)"
                  >{{ m }}</span
                >
              </div>
            </div>

            <div
              class="card"
              :style="{ gridColumn: can('view_sales') ? 'auto' : 'span 2' }"
            >
              <div class="card-header">
                <div class="card-title">Recent Activity</div>
              </div>
              <div class="activity-item" v-for="a in activities" :key="a.id">
                <div
                  style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                  "
                  :style="{ background: a.color + '22' }"
                >
                  <i
                    :class="'fa-solid ' + a.icon"
                    :style="{ color: a.color, fontSize: '13px' }"
                  ></i>
                </div>
                <div>
                  <div style="font-size: 13px; color: var(--text-primary)">
                    {{ a.text }}
                  </div>
                  <div class="activity-time">{{ a.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-6">
            <div class="card-header">
              <div class="card-title">Top Customers</div>
              <button class="btn btn-ghost btn-sm" @click="page = 'customers'">
                View All <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th v-if="can('view_sales')">Deal Value</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="c in customers.slice(0, 5)"
                    :key="c.id"
                    style="cursor: pointer"
                    @click="viewCustomer(c)"
                  >
                    <td
                      class="primary"
                      style="display: flex; align-items: center; gap: 10px"
                    >
                      <div
                        class="avatar avatar-sm"
                        :style="{ background: getColor(c.id) }"
                      >
                        {{ initials(c.name) }}
                      </div>
                      {{ c.name }}
                    </td>
                    <td>{{ c.company }}</td>
                    <td>
                      <span class="badge" :class="statusBadge(c.status)">{{
                        c.status
                      }}</span>
                    </td>
                    <td v-if="can('view_sales')" class="primary">
                      {{ fmtVal(c.value) }}
                    </td>
                    <td>{{ c.owner }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- CUSTOMERS -->
        <div v-if="page === 'customers'">
          <div class="page-header">
            <div>
              <div class="page-title">Customer List</div>
              <div class="page-desc">
                {{ customers.length }} total customers
              </div>
            </div>
            <button
              v-if="can('add_edit_customer')"
              class="btn btn-primary"
              @click="openAddCustomer"
            >
              <i class="fa-solid fa-plus"></i> Add Customer
            </button>
          </div>
          <div class="filter-bar">
            <div class="search-bar" style="flex: 1; max-width: 360px">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                class="form-control"
                v-model="searchQ"
                placeholder="Search customers..."
              />
            </div>
            <select class="form-control" style="width: 160px">
              <option>All Status</option>
              <option>Active</option>
              <option>Prospect</option>
              <option>Inactive</option>
            </select>
          </div>
          <div class="card">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Status</th>
                    <th v-if="can('view_sales')">Value</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in filteredCustomers" :key="c.id">
                    <td
                      class="primary"
                      style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        min-width: 180px;
                      "
                    >
                      <div
                        class="avatar avatar-sm"
                        :style="{ background: getColor(c.id) }"
                      >
                        {{ initials(c.name) }}
                      </div>
                      <div>
                        <div>{{ c.name }}</div>
                        <div style="font-size: 11px; color: var(--text-muted)">
                          {{ c.email }}
                        </div>
                      </div>
                    </td>
                    <td>{{ c.company }}</td>
                    <td>{{ c.industry }}</td>
                    <td>
                      <span class="badge" :class="statusBadge(c.status)">{{
                        c.status
                      }}</span>
                    </td>
                    <td v-if="can('view_sales')" class="primary">
                      {{ fmtVal(c.value) }}
                    </td>
                    <td>{{ c.city }}, {{ c.country }}</td>
                    <td>
                      <button
                        class="btn btn-ghost btn-sm"
                        @click="viewCustomer(c)"
                      >
                        <i class="fa-solid fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- CUSTOMER DETAIL -->
        <div v-if="page === 'customer_detail' && selectedCustomer">
          <div style="display: flex; gap: 10px; margin-bottom: 16px">
            <button class="btn btn-ghost btn-sm" @click="page = 'customers'">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <button
              v-if="can('add_edit_customer')"
              class="btn btn-primary btn-sm"
              @click="openEditCustomer"
            >
              <i class="fa-solid fa-pen-to-square"></i> Edit Customer
            </button>
          </div>

          <!-- Profile Header -->
          <div class="detail-header">
            <div
              class="avatar avatar-xl"
              :style="{ background: getColor(selectedCustomer.id) }"
            >
              {{ initials(selectedCustomer.name) }}
            </div>
            <div class="detail-info">
              <div class="detail-name">{{ selectedCustomer.name }}</div>
              <div class="detail-meta">
                <span
                  ><i class="fa-solid fa-building"></i>
                  {{ selectedCustomer.company }}</span
                >
                <span
                  ><i class="fa-solid fa-envelope"></i>
                  {{ selectedCustomer.email }}</span
                >
                <span
                  ><i class="fa-solid fa-phone"></i>
                  {{ selectedCustomer.phone }}</span
                >
                <span
                  ><i class="fa-solid fa-location-dot"></i>
                  {{ selectedCustomer.city }},
                  {{ selectedCustomer.country }}</span
                >
              </div>
              <div style="margin-top: 12px">
                <span
                  class="badge"
                  :class="statusBadge(selectedCustomer.status)"
                  >{{ selectedCustomer.status }}</span
                >
              </div>
            </div>
            <div v-if="can('view_sales')" style="text-align: right">
              <div
                style="font-size: 28px; font-weight: 800; color: var(--accent)"
              >
                {{ fmtVal(selectedCustomer.value) }}
              </div>
              <div style="font-size: 12px; color: var(--text-muted)">
                Deal Value
              </div>
              <div
                style="
                  margin-top: 8px;
                  font-size: 13px;
                  color: var(--text-secondary);
                "
              >
                {{ selectedCustomer.deal }}
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="detail-tabs">
            <button
              class="tab-btn"
              :class="{ active: customerTab === 'overview' }"
              @click="customerTab = 'overview'"
            >
              <i class="fa-solid fa-circle-info"></i> Overview
            </button>
            <button
              v-if="can('view_sales')"
              class="tab-btn"
              :class="{ active: customerTab === 'orders' }"
              @click="customerTab = 'orders'"
            >
              <i class="fa-solid fa-receipt"></i> Sales Orders
              <span class="nav-badge" style="margin-left: 6px">{{
                customerOrders.length
              }}</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: customerTab === 'tasks' }"
              @click="customerTab = 'tasks'"
            >
              <i class="fa-solid fa-list-check"></i> Tasks
              <span class="nav-badge" style="margin-left: 6px">{{
                tasks.filter((t) => t.customer === selectedCustomer.name).length
              }}</span>
            </button>
          </div>

          <!-- TAB: Overview -->
          <div v-if="customerTab === 'overview'" class="grid-2">
            <div class="card">
              <div class="card-title" style="margin-bottom: 16px">
                Contact Information
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Industry</div>
                  <div class="info-value">{{ selectedCustomer.industry }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Owner</div>
                  <div class="info-value">{{ selectedCustomer.owner }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Joined</div>
                  <div class="info-value">{{ selectedCustomer.joined }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Country</div>
                  <div class="info-value">{{ selectedCustomer.country }}</div>
                </div>
                <div class="info-item" style="grid-column: span 2">
                  <div class="info-label">Notes</div>
                  <div class="info-value" style="line-height: 1.7">
                    {{ selectedCustomer.notes }}
                  </div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title">Order Summary</div>
              </div>
              <div style="display: flex; gap: 14px; margin-bottom: 16px">
                <div
                  style="
                    flex: 1;
                    padding: 14px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 10px;
                    text-align: center;
                  "
                >
                  <div
                    style="
                      font-size: 22px;
                      font-weight: 800;
                      color: var(--success);
                    "
                  >
                    {{
                      customerOrders.filter((o) => o.type === 'request').length
                    }}
                  </div>
                  <div
                    style="
                      font-size: 11px;
                      color: var(--text-muted);
                      margin-top: 4px;
                    "
                  >
                    Requests
                  </div>
                </div>
                <div
                  style="
                    flex: 1;
                    padding: 14px;
                    background: rgba(99, 102, 241, 0.08);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 10px;
                    text-align: center;
                  "
                >
                  <div
                    style="
                      font-size: 22px;
                      font-weight: 800;
                      color: var(--accent);
                    "
                  >
                    {{ customerOrders.filter((o) => o.type === 'bug').length }}
                  </div>
                  <div
                    style="
                      font-size: 11px;
                      color: var(--text-muted);
                      margin-top: 4px;
                    "
                  >
                    Bugs (Free)
                  </div>
                </div>
                <div
                  style="
                    flex: 1;
                    padding: 14px;
                    background: rgba(6, 182, 212, 0.08);
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-radius: 10px;
                    text-align: center;
                  "
                >
                  <div
                    style="
                      font-size: 18px;
                      font-weight: 800;
                      color: var(--accent-3);
                    "
                  >
                    {{
                      '$' +
                      customerOrders
                        .filter((o) => o.type === 'request')
                        .reduce((a, o) => a + o.amount, 0)
                        .toLocaleString()
                    }}
                  </div>
                  <div
                    style="
                      font-size: 11px;
                      color: var(--text-muted);
                      margin-top: 4px;
                    "
                  >
                    Total Billed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TASKS -->
        <div v-if="page === 'tasks'">
          <div class="page-header">
            <div>
              <div class="page-title">Task Requests</div>
              <div class="page-desc">Kanban-style task management</div>
            </div>
            <button class="btn btn-primary" @click="showTaskModal = true">
              <i class="fa-solid fa-plus"></i> New Task
            </button>
          </div>
          <div class="kanban">
            <div class="kanban-col" v-for="(col, key) in taskCols" :key="key">
              <div class="kanban-col-title">
                <span
                  :style="{
                    color:
                      key === 'todo'
                        ? 'var(--warning)'
                        : key === 'in-progress'
                        ? 'var(--accent)'
                        : 'var(--success)',
                  }"
                >
                  <i
                    :class="
                      key === 'done'
                        ? 'fa-solid fa-circle-check'
                        : 'fa-solid fa-circle'
                    "
                  ></i>
                  {{
                    key === 'todo'
                      ? 'To Do'
                      : key === 'in-progress'
                      ? 'In Progress'
                      : 'Done'
                  }}
                </span>
                <span class="kanban-count">{{ col.length }}</span>
              </div>
              <div
                class="task-card"
                v-for="t in col"
                :key="t.id"
                @click="viewTask(t)"
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                  "
                >
                  <span
                    class="badge"
                    :class="'badge-' + t.type.toLowerCase().replace(' ', '-')"
                    style="
                      font-size: 10px;
                      background: rgba(99, 102, 241, 0.1);
                      color: var(--accent);
                    "
                    >{{ t.type }}</span
                  >
                  <span class="badge" :class="priorityBadge(t.priority)">{{
                    t.priority
                  }}</span>
                </div>
                <div class="task-title">{{ t.title }}</div>
                <div
                  style="
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 10px;
                  "
                >
                  {{ t.desc }}
                </div>
                <div class="task-meta">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <div
                      class="avatar avatar-sm"
                      :style="{
                        background: safeColor(t.assignee),
                        width: '24px',
                        height: '24px',
                        fontSize: '10px',
                      }"
                    >
                      {{ safeInitials(t.assignee) }}
                    </div>
                    <span
                      style="font-size: 11px; color: var(--text-secondary)"
                      >{{ t.assignee }}</span
                    >
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span
                      v-if="(t.attachments || []).length"
                      style="
                        font-size: 11px;
                        color: var(--accent);
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                      "
                      title="Attached Files"
                      ><i class="fa-solid fa-paperclip"></i
                      >{{ t.attachments.length }}</span
                    >
                    <span class="task-due"
                      ><i class="fa-regular fa-calendar"></i>{{ t.due }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SCHEDULE & GANTT CHART -->
        <div v-if="page === 'schedule'" class="fade-in">
          <div class="gantt-card">
            <div class="gantt-wrapper">
              <div class="gantt-sidebar">
                <div class="gantt-sidebar-header">
                  <span>Task Name & Assignee</span>
                </div>
                <div
                  class="gantt-sidebar-row"
                  v-for="t in filteredSchedTasks"
                  :key="'side-' + t.id"
                  @click="viewTask(t)"
                >
                  <div
                    class="avatar avatar-sm"
                    :style="{
                      background: safeColor(t.assignee),
                      width: '28px',
                      height: '28px',
                      fontSize: '11px',
                      flexShrink: 0,
                    }"
                  >
                    {{ safeInitials(t.assignee) }}
                  </div>
                  <div style="overflow: hidden; flex: 1">
                    <div
                      style="
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      "
                    >
                      {{ t.title }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-timeline-area">
                <div class="gantt-dates-header">
                  <div
                    class="gantt-date-col"
                    v-for="d in ganttDates"
                    :key="d.dateStr"
                    :class="{
                      'is-today': d.isToday,
                      'is-weekend': d.isWeekend,
                    }"
                  >
                    <div style="font-size: 10px; text-transform: uppercase">
                      {{ d.dayName }}
                    </div>
                    <div
                      style="font-size: 13px; font-weight: 700; margin-top: 1px"
                    >
                      {{ d.dayNum }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPLOYEES -->
        <div v-if="page === 'employees'">
          <div class="page-header">
            <div>
              <div class="page-title">Employee Directory</div>
              <div class="page-desc">{{ employees.length }} team members</div>
            </div>
            <button
              v-if="can('add_edit_employee')"
              class="btn btn-primary"
              @click="openAddEmployee"
            >
              <i class="fa-solid fa-user-plus"></i> Create New Employee
            </button>
          </div>
          <div class="employee-grid">
            <div
              class="employee-card"
              v-for="e in filteredEmployees"
              :key="e.id"
              @click="viewEmployee(e)"
            >
              <div
                class="avatar avatar-lg"
                style="margin: 0 auto"
                :style="{ background: getColor(e.id) }"
              >
                {{ initials(e.name) }}
              </div>
              <div class="employee-name">{{ e.name }}</div>
              <div class="employee-dept">
                {{ e.role }} &middot; {{ e.dept }}
              </div>
            </div>
          </div>
        </div>

        <!-- SETTINGS -->
        <div v-if="page === 'settings'" class="fade-in">
          <div class="card">
            <div class="card-title">Edit Profile</div>
            <div class="form-group">
              <label class="form-label">Full Name *</label
              ><input class="form-control" v-model="profileForm.name" />
            </div>
            <div class="form-group">
              <label class="form-label">Role / Title</label>
              <select
                class="form-control"
                v-model="profileForm.role"
                @change="switchRole(profileForm.role)"
              >
                <option v-for="r in systemRoles" :key="r" :value="r">
                  {{ r }}
                </option>
              </select>
            </div>
            <button class="btn btn-primary" @click="saveProfile">
              <i class="fa-solid fa-floppy-disk"></i> Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TASK DETAIL MODAL -->
    <div
      class="modal-overlay"
      v-if="showTaskDetailModal"
      @click.self="showTaskDetailModal = false"
    >
      <div class="modal fade-in">
        <div class="modal-header">
          <div class="modal-title">Task Detail</div>
          <button class="modal-close" @click="showTaskDetailModal = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body" v-if="selectedTask">
          <div
            style="
              background: var(--glass);
              border: 1px solid var(--glass-border);
              border-radius: 12px;
              padding: 18px;
              margin-bottom: 16px;
            "
          >
            <div
              style="
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 8px;
              "
            >
              {{ selectedTask.title }}
            </div>
            <div
              style="
                font-size: 14px;
                color: var(--text-secondary);
                line-height: 1.7;
              "
            >
              {{ selectedTask.desc || 'No description provided.' }}
            </div>
          </div>

          <!-- Attachments Section -->
          <div
            style="
              margin-top: 16px;
              background: var(--glass);
              border: 1px solid var(--glass-border);
              border-radius: 12px;
              padding: 16px;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
              "
            >
              <div
                style="
                  font-size: 13px;
                  font-weight: 700;
                  color: var(--text-primary);
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <i
                  class="fa-solid fa-paperclip"
                  style="color: var(--accent)"
                ></i>
                Attachments
                <span class="badge badge-info" style="font-size: 10px">{{
                  (selectedTask.attachments || []).length
                }}</span>
              </div>
              <label
                class="btn btn-primary btn-sm"
                style="cursor: pointer; margin: 0"
              >
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  @change="(e) => handleFileUpload(e, selectedTask)"
                  style="display: none"
                />
              </label>
            </div>

            <!-- List of Attached Files -->
            <div
              v-if="(selectedTask.attachments || []).length"
              style="display: flex; flex-direction: column; gap: 8px"
            >
              <div
                v-for="att in selectedTask.attachments"
                :key="att.id"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 10px 12px;
                  background: rgba(255, 255, 255, 0.03);
                  border: 1px solid var(--glass-border);
                  border-radius: 8px;
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    overflow: hidden;
                  "
                >
                  <div
                    v-if="
                      ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                        (att.original_name || att.file_name)
                          .split('.')
                          .pop()
                          .toLowerCase()
                      )
                    "
                    style="
                      width: 36px;
                      height: 36px;
                      border-radius: 6px;
                      overflow: hidden;
                      background: #000;
                      flex-shrink: 0;
                      border: 1px solid var(--glass-border);
                    "
                  >
                    <img
                      :src="att.file_path"
                      style="width: 100%; height: 100%; object-fit: cover"
                    />
                  </div>
                  <div
                    v-else
                    style="
                      width: 36px;
                      height: 36px;
                      border-radius: 6px;
                      background: rgba(99, 102, 241, 0.12);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--accent);
                      font-size: 16px;
                      flex-shrink: 0;
                    "
                  >
                    <i
                      :class="
                        'fa-solid ' +
                        fileIcon(
                          att.original_name || att.file_name,
                          att.file_type
                        )
                      "
                    ></i>
                  </div>
                  <div style="overflow: hidden">
                    <div
                      style="
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      "
                    >
                      {{ att.original_name || att.file_name }}
                    </div>
                    <div
                      style="
                        font-size: 10px;
                        color: var(--text-muted);
                        margin-top: 2px;
                      "
                    >
                      {{ fmtFileSize(att.file_size) }} &middot;
                      {{ att.created_at }}
                    </div>
                  </div>
                </div>
                <div
                  style="
                    display: flex;
                    gap: 6px;
                    align-items: center;
                    flex-shrink: 0;
                  "
                >
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="downloadAttachment(att)"
                    title="Download File"
                  >
                    <i
                      class="fa-solid fa-download"
                      style="color: var(--success)"
                    ></i>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="removeAttachment(att, selectedTask)"
                    title="Delete File"
                  >
                    <i
                      class="fa-solid fa-trash-can"
                      style="color: var(--danger)"
                    ></i>
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              style="
                font-size: 12px;
                color: var(--text-muted);
                padding: 12px;
                text-align: center;
                border: 1px dashed var(--glass-border);
                border-radius: 8px;
              "
            >
              No files attached yet. Supported: Images (PNG, JPG), PDF, DOC,
              DOCX.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Topbar from './components/Topbar.vue';
import { apiCall } from './service/api.js';
import {
  SYSTEM_ROLES,
  ROLE_PERMISSIONS,
  getColor,
  initials,
  customers as defaultCustomers,
  employees as defaultEmployees,
  tasks as defaultTasks,
  orders as defaultOrders,
  activities as defaultActivities,
  chartData,
} from './data/mockData.js';

const customersList = ref([...defaultCustomers]);
const employeesList = ref([...defaultEmployees]);
const tasksList = ref([...defaultTasks]);
const ordersList = ref([...defaultOrders]);
const activitiesList = ref([...defaultActivities]);

const customers = computed(() => customersList.value);
const employees = computed(() => employeesList.value);
const tasks = computed(() => tasksList.value);
const activities = computed(() => activitiesList.value);

function safeColor(str) {
  return getColor(str ? str.length : 0);
}
function safeInitials(str) {
  return initials(str);
}

const isLoggedIn = ref(true);
const page = ref('dashboard');
const selectedCustomer = ref(null);
const showTaskModal = ref(false);
const showCustomerModal = ref(false);
const editingCustomer = ref(null);
const selectedEmployee = ref(null);
const showEmployeeModal = ref(false);
const editingEmployee = ref(null);
const selectedTask = ref(null);
const showTaskDetailModal = ref(false);
const taskEditMode = ref(false);
const taskEditForm = ref({});
const customerTab = ref('overview');
const showOrderModal = ref(false);
const orderForm = ref({
  type: 'request',
  title: '',
  desc: '',
  amount: 0,
  assignee: '',
});
const showQuotationModal = ref(false);
const quotationOrder = ref(null);
const searchQ = ref('');
const empSearch = ref('');
const taskFilter = ref('all');
const loginForm = ref({
  email: 'admin@hnfcrm.com',
  password: '',
  remember: false,
});
const loginError = ref('');

const emptyCustomer = () => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'prospect',
  value: 0,
  deal: '',
  owner: '',
  city: '',
  country: '',
  industry: '',
  notes: '',
});
const customerForm = ref(emptyCustomer());

const userProfile = ref({
  name: 'Admin User',
  email: 'admin@hnfcrm.com',
  phone: '+1 (555) 234-5678',
  role: 'HOD IT',
  department: 'Management',
  initials: 'AD',
  bio: 'Lead Administrator of HNF CRM System.',
});
const profileForm = ref({ ...userProfile.value });
const profileSuccessMsg = ref('');

const systemRoles = ref(SYSTEM_ROLES);
const currentRole = computed(() =>
  userProfile.value ? userProfile.value.role : 'HOD IT'
);

function can(perm) {
  const role = userProfile.value ? userProfile.value.role : 'HOD IT';
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['HOD IT'];
  return !!perms[perm];
}

function switchRole(r) {
  if (userProfile.value) {
    userProfile.value.role = r;
    profileForm.value.role = r;
  }
}

async function doLogin() {
  if (!loginForm.value.email || !loginForm.value.password) {
    loginError.value = 'Please fill all fields.';
    return;
  }
  const res = await apiCall(
    'login',
    { email: loginForm.value.email, password: loginForm.value.password },
    currentRole.value
  );
  if (res && res.status === 'error') {
    loginError.value = res.message;
    return;
  }
  isLoggedIn.value = true;
}

async function loadInitialData() {
  const res = await apiCall('get_initial_data', {}, currentRole.value);
  if (res && res.status === 'success' && res.data) {
    if (res.data.customers && res.data.customers.length)
      customersList.value = res.data.customers;
    if (res.data.employees && res.data.employees.length)
      employeesList.value = res.data.employees;
    if (res.data.tasks && res.data.tasks.length)
      tasksList.value = res.data.tasks;
    if (res.data.orders && res.data.orders.length)
      ordersList.value = res.data.orders;
    if (res.data.activities && res.data.activities.length)
      activitiesList.value = res.data.activities;
    if (res.data.userProfile) {
      userProfile.value = { ...userProfile.value, ...res.data.userProfile };
      profileForm.value = { ...userProfile.value };
    }
  }
}
onMounted(loadInitialData);

async function saveProfile() {
  if (!profileForm.value.name || !profileForm.value.email) return;
  const res = await apiCall(
    'save_profile',
    profileForm.value,
    currentRole.value
  );
  if (res && res.status === 'success' && res.data) {
    userProfile.value = res.data;
  } else {
    userProfile.value = { ...profileForm.value };
  }
  profileSuccessMsg.value = 'Profile updated successfully!';
  setTimeout(() => {
    profileSuccessMsg.value = '';
  }, 3000);
}

function viewCustomer(c) {
  selectedCustomer.value = c;
  page.value = 'customer_detail';
  customerTab.value = 'overview';
}
function openAddCustomer() {
  editingCustomer.value = null;
  customerForm.value = emptyCustomer();
  showCustomerModal.value = true;
}
function openEditCustomer() {
  editingCustomer.value = selectedCustomer.value;
  customerForm.value = { ...selectedCustomer.value };
  showCustomerModal.value = true;
}

function viewEmployee(e) {
  selectedEmployee.value = e;
  page.value = 'employee_detail';
}
function openAddEmployee() {
  editingEmployee.value = null;
  showEmployeeModal.value = true;
}
function openEditEmployee() {
  editingEmployee.value = selectedEmployee.value;
  showEmployeeModal.value = true;
}

function viewTask(t) {
  selectedTask.value = t;
  taskEditMode.value = false;
  taskEditForm.value = { ...t };
  showTaskDetailModal.value = true;
}

const filteredCustomers = computed(() =>
  customersList.value.filter(
    (c) =>
      !searchQ.value ||
      c.name.toLowerCase().includes(searchQ.value.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQ.value.toLowerCase())
  )
);
const filteredEmployees = computed(() =>
  employeesList.value.filter(
    (e) =>
      !empSearch.value ||
      e.name.toLowerCase().includes(empSearch.value.toLowerCase()) ||
      e.dept.toLowerCase().includes(empSearch.value.toLowerCase())
  )
);

const taskCols = computed(() => ({
  todo: tasksList.value.filter((t) => t.status === 'todo'),
  'in-progress': tasksList.value.filter((t) => t.status === 'in-progress'),
  done: tasksList.value.filter((t) => t.status === 'done'),
}));

const pageInfo = computed(() => {
  const map = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of CRM performance' },
    customers: { title: 'Customers', subtitle: 'Manage customer accounts' },
    customer_detail: {
      title: 'Customer Profile',
      subtitle: 'Detailed customer insights',
    },
    tasks: { title: 'Tasks', subtitle: 'Manage team requests' },
    schedule: { title: 'Schedule', subtitle: 'Gantt timeline view' },
    employees: { title: 'Employees', subtitle: 'Team directory' },
    employee_detail: {
      title: 'Employee Profile',
      subtitle: 'Team member details',
    },
    settings: { title: 'Settings', subtitle: 'System preferences' },
  };
  return map[page.value] || { title: 'HNF CRM', subtitle: '' };
});

const totalRevenue = computed(() =>
  customersList.value.reduce((a, c) => a + c.value, 0)
);
const activeCount = computed(
  () => customersList.value.filter((c) => c.status === 'active').length
);
const openTasks = computed(
  () => tasksList.value.filter((t) => t.status !== 'done').length
);
const customerOrders = computed(() =>
  selectedCustomer.value
    ? ordersList.value.filter((o) => o.customerId === selectedCustomer.value.id)
    : []
);

function priorityBadge(p) {
  return p === 'high'
    ? 'badge-danger'
    : p === 'medium'
    ? 'badge-warning'
    : 'badge-secondary';
}
function statusBadge(s) {
  return s === 'active'
    ? 'badge-success'
    : s === 'prospect'
    ? 'badge-info'
    : s === 'inactive'
    ? 'badge-danger'
    : 'badge-warning';
}
function fmtVal(v) {
  return v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'k' : '$' + v;
}

function fileIcon(name = '', type = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ||
    type.includes('image')
  )
    return 'fa-file-image';
  if (ext === 'pdf' || type.includes('pdf')) return 'fa-file-pdf';
  if (['doc', 'docx'].includes(ext) || type.includes('word'))
    return 'fa-file-word';
  return 'fa-file-lines';
}

function fmtFileSize(bytes = 0) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function handleFileUpload(e, targetTask) {
  const files = e.target.files;
  if (!files || !files.length) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const fileData = evt.target.result;
      const payload = {
        taskId: targetTask ? targetTask.id : 0,
        fileName: file.name,
        fileType: file.type,
        fileData: fileData,
      };

      const res = await apiCall(
        'upload_attachment',
        payload,
        currentRole.value
      );
      let newAtt;
      if (res && res.status === 'success' && res.data) {
        newAtt = res.data;
      } else {
        newAtt = {
          id: Date.now() + i,
          task_id: targetTask ? targetTask.id : 0,
          file_name: file.name,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: fileData,
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
      }

      if (targetTask) {
        if (!targetTask.attachments) targetTask.attachments = [];
        targetTask.attachments.push(newAtt);
      }
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
}

async function removeAttachment(att, targetTask) {
  if (!confirm('Are you sure you want to delete this attachment?')) return;
  await apiCall('delete_attachment', { id: att.id }, currentRole.value);
  if (targetTask && targetTask.attachments) {
    targetTask.attachments = targetTask.attachments.filter(
      (a) => a.id !== att.id
    );
  }
}

function downloadAttachment(att) {
  const link = document.createElement('a');
  link.href = att.file_path;
  link.download = att.original_name || att.file_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Schedule Gantt
const ganttStartDate = new Date('2026-07-12');
const ganttTotalDays = 20;
const ganttDates = computed(() => {
  const dates = [];
  const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = '2026-07-22';
  for (let i = 0; i < ganttTotalDays; i++) {
    const d = new Date(ganttStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    dates.push({
      dateStr,
      dayName: daysName[d.getDay()],
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      index: i,
    });
  }
  return dates;
});
const filteredSchedTasks = computed(() => tasksList.value);
</script>
