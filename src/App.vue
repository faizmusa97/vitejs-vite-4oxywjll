<template>
  <!-- LOGIN PAGE -->
  <div v-if="!isLoggedIn" class="login-page">
    <div class="login-card fade-in">
      <div class="login-logo">
        <div class="logo-icon" style="width: 52px; height: 52px; font-size: 22px; border-radius: 14px;">
          <i class="fa-solid fa-bolt"></i>
        </div>
      </div>
      <h2 class="login-title">Welcome back</h2>
      <p class="login-sub">Sign in to your HNF CRM account</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <div class="input-icon">
          <i class="fa-solid fa-envelope"></i>
          <input class="form-control" type="email" v-model="loginForm.email" placeholder="you@company.com" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-icon">
          <i class="fa-solid fa-lock"></i>
          <input class="form-control" type="password" v-model="loginForm.password" placeholder="Enter password (admin123)" @keyup.enter="doLogin" />
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <label class="checkbox-row">
          <input type="checkbox" v-model="loginForm.remember" /> Remember me
        </label>
        <a href="#" style="font-size: 13px; color: var(--accent)">Forgot password?</a>
      </div>
      <div v-if="loginError" style="color: var(--danger); font-size: 13px; margin-bottom: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
        <i class="fa-solid fa-circle-exclamation"></i> {{ loginError }}
      </div>
      <button class="btn btn-primary login-btn" @click="doLogin">
        <i class="fa-solid fa-right-to-bracket"></i> Sign In
      </button>
      <p style="text-align: center; margin-top: 20px; font-size: 12px; color: var(--text-muted);">
        Hint: password is <strong style="color: var(--text-secondary)">admin123</strong>
      </p>
    </div>
  </div>

  <!-- MAIN APP -->
  <div v-else class="layout">
    <Sidebar :page="page" :user="userProfile" @navigate="(p) => { page = p; selectedCustomer = null; selectedEmployee = null; }" />
    
    <div class="main-content">
      <Topbar
        :title="pageInfo.title"
        :subtitle="pageInfo.subtitle"
        :current-role="currentRole"
        :system-roles="systemRoles"
        @logout="handleLogout"
        @navigate="(p) => { page = p; selectedCustomer = null; selectedEmployee = null; }"
        @change-role="switchRole"
      />

      <div class="page-wrapper fade-in">
        <!-- DASHBOARD -->
        <div v-if="page === 'dashboard'">
          <div class="stats-grid">
            <div v-if="can('view_sales')" class="stat-card indigo">
              <div class="stat-icon indigo"><i class="fa-solid fa-dollar-sign"></i></div>
              <div class="stat-value">${{ (totalRevenue / 1000).toFixed(0) }}k</div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> +18.2% this month</div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon purple"><i class="fa-solid fa-users"></i></div>
              <div class="stat-value">{{ customers.length }}</div>
              <div class="stat-label">Total Customers</div>
              <div class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> +3 this week</div>
            </div>
            <div class="stat-card cyan">
              <div class="stat-icon cyan"><i class="fa-solid fa-list-check"></i></div>
              <div class="stat-value">{{ openTasks }}</div>
              <div class="stat-label">Open Tasks</div>
              <div class="stat-change down"><i class="fa-solid fa-arrow-trend-down"></i> {{ tasks.filter(t => t.priority === 'high' && t.status !== 'done').length }} high priority</div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon green"><i class="fa-solid fa-user-check"></i></div>
              <div class="stat-value">{{ activeCount }}</div>
              <div class="stat-label">Active Clients</div>
              <div class="stat-change up"><i class="fa-solid fa-arrow-trend-up"></i> 75% retention</div>
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
              <div class="mini-chart" style="height: 80px; align-items: flex-end; gap: 6px;">
                <div
                  v-for="(v, i) in chartData"
                  :key="i"
                  class="mini-bar"
                  :style="{
                    height: v + '%',
                    background: 'linear-gradient(180deg,#6366f1,#8b5cf6)',
                    opacity: i === chartData.length - 1 ? 1 : 0.55,
                    borderRadius: '5px 5px 0 0',
                    flex: 1
                  }"
                ></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span v-for="m in ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']" :key="m" style="font-size: 11px; color: var(--text-muted)">{{ m }}</span>
              </div>
            </div>

            <div class="card" :style="{ gridColumn: can('view_sales') ? 'auto' : 'span 2' }">
              <div class="card-header">
                <div class="card-title">Recent Activity</div>
              </div>
              <div class="activity-item" v-for="a in activities" :key="a.id">
                <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" :style="{ background: a.color + '22' }">
                  <i :class="'fa-solid ' + a.icon" :style="{ color: a.color, fontSize: '13px' }"></i>
                </div>
                <div>
                  <div style="font-size: 13px; color: var(--text-primary)">{{ a.text }}</div>
                  <div class="activity-time">{{ a.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-6" style="margin-top: 20px;">
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
                  <tr v-for="c in customers.slice(0, 5)" :key="c.id" style="cursor: pointer" @click="viewCustomer(c)">
                    <td class="primary" style="display: flex; align-items: center; gap: 10px">
                      <div class="avatar avatar-sm" :style="{ background: getColor(c.id) }">
                        {{ initials(c.name) }}
                      </div>
                      {{ c.name }}
                    </td>
                    <td>{{ c.company }}</td>
                    <td>
                      <span class="badge" :class="statusBadge(c.status)">{{ c.status }}</span>
                    </td>
                    <td v-if="can('view_sales')" class="primary">{{ fmtVal(c.value) }}</td>
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
              <div class="page-desc">{{ customers.length }} total customers</div>
            </div>
            <button v-if="can('add_edit_customer')" class="btn btn-primary" @click="openAddCustomer">
              <i class="fa-solid fa-plus"></i> Add Customer
            </button>
          </div>
          <div class="filter-bar">
            <div class="search-bar" style="flex: 1; max-width: 360px">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input class="form-control" v-model="searchQ" placeholder="Search customers..." />
            </div>
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
                    <td class="primary" style="display: flex; align-items: center; gap: 10px; min-width: 180px;">
                      <div class="avatar avatar-sm" :style="{ background: getColor(c.id) }">
                        {{ initials(c.name) }}
                      </div>
                      <div>
                        <div>{{ c.name }}</div>
                        <div style="font-size: 11px; color: var(--text-muted)">{{ c.email }}</div>
                      </div>
                    </td>
                    <td>{{ c.company }}</td>
                    <td>{{ c.industry }}</td>
                    <td>
                      <span class="badge" :class="statusBadge(c.status)">{{ c.status }}</span>
                    </td>
                    <td v-if="can('view_sales')" class="primary">{{ fmtVal(c.value) }}</td>
                    <td>{{ c.city }}, {{ c.country }}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" @click="viewCustomer(c)">
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
            <button v-if="can('add_edit_customer')" class="btn btn-primary btn-sm" @click="openEditCustomer">
              <i class="fa-solid fa-pen-to-square"></i> Edit Customer
            </button>
          </div>

          <div class="detail-header">
            <div class="avatar avatar-xl" :style="{ background: getColor(selectedCustomer.id) }">
              {{ initials(selectedCustomer.name) }}
            </div>
            <div class="detail-info">
              <div class="detail-name">{{ selectedCustomer.name }}</div>
              <div class="detail-meta">
                <span><i class="fa-solid fa-building"></i> {{ selectedCustomer.company }}</span>
                <span><i class="fa-solid fa-envelope"></i> {{ selectedCustomer.email }}</span>
                <span><i class="fa-solid fa-phone"></i> {{ selectedCustomer.phone }}</span>
                <span><i class="fa-solid fa-location-dot"></i> {{ selectedCustomer.city }}, {{ selectedCustomer.country }}</span>
              </div>
              <div style="margin-top: 12px">
                <span class="badge" :class="statusBadge(selectedCustomer.status)">{{ selectedCustomer.status }}</span>
              </div>
            </div>
            <div v-if="can('view_sales')" style="text-align: right">
              <div style="font-size: 28px; font-weight: 800; color: var(--accent)">
                {{ fmtVal(selectedCustomer.value) }}
              </div>
              <div style="font-size: 12px; color: var(--text-muted)">Deal Value</div>
              <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary)">
                {{ selectedCustomer.deal }}
              </div>
            </div>
          </div>

          <div class="detail-tabs">
            <button class="tab-btn" :class="{ active: customerTab === 'overview' }" @click="customerTab = 'overview'">
              <i class="fa-solid fa-circle-info"></i> Overview
            </button>
            <button v-if="can('view_sales')" class="tab-btn" :class="{ active: customerTab === 'orders' }" @click="customerTab = 'orders'">
              <i class="fa-solid fa-receipt"></i> Sales Orders
              <span class="nav-badge" style="margin-left: 6px">{{ customerOrders.length }}</span>
            </button>
            <button class="tab-btn" :class="{ active: customerTab === 'tasks' }" @click="customerTab = 'tasks'">
              <i class="fa-solid fa-list-check"></i> Tasks
              <span class="nav-badge" style="margin-left: 6px">{{ tasks.filter(t => t.customer === selectedCustomer.name).length }}</span>
            </button>
          </div>

          <!-- TAB: Overview -->
          <div v-if="customerTab === 'overview'" class="grid-2">
            <div class="card">
              <div class="card-title" style="margin-bottom: 16px">Contact Information</div>
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
                  <div class="info-value" style="line-height: 1.7">{{ selectedCustomer.notes }}</div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title">Order Summary</div>
                <button v-if="can('view_sales')" class="btn btn-primary btn-sm" @click="showOrderModal = true">
                  <i class="fa-solid fa-plus"></i> New Order
                </button>
              </div>
              <div style="display: flex; gap: 14px; margin-bottom: 16px">
                <div style="flex: 1; padding: 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 800; color: var(--success)">
                    {{ customerOrders.filter(o => o.type === 'request').length }}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px">Requests</div>
                </div>
                <div style="flex: 1; padding: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 10px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 800; color: var(--accent)">
                    {{ customerOrders.filter(o => o.type === 'bug').length }}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px">Bugs (Free)</div>
                </div>
                <div style="flex: 1; padding: 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 10px; text-align: center;">
                  <div style="font-size: 18px; font-weight: 800; color: var(--accent-3)">
                    {{ '$' + customerOrders.filter(o => o.type === 'request').reduce((a, o) => a + o.amount, 0).toLocaleString() }}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px">Total Billed</div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: Sales Orders -->
          <div v-if="customerTab === 'orders'">
            <div class="page-header" style="margin-bottom: 16px">
              <div style="font-size: 15px; font-weight: 600; color: var(--text-secondary)">
                Orders & Bug Tickets for {{ selectedCustomer.name }}
              </div>
              <button class="btn btn-primary btn-sm" @click="showOrderModal = true">
                <i class="fa-solid fa-plus"></i> New Order
              </button>
            </div>
            <div class="card">
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title & Description</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Quotation #</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="o in customerOrders" :key="o.id">
                      <td>
                        <span class="badge" :class="o.type === 'bug' ? 'badge-danger' : 'badge-info'">
                          <i :class="o.type === 'bug' ? 'fa-solid fa-bug' : 'fa-solid fa-cart-shopping'"></i>
                          {{ o.type === 'bug' ? 'Bug (Free)' : 'Request' }}
                        </span>
                      </td>
                      <td class="primary">
                        <div>{{ o.title }}</div>
                        <div style="font-size: 11px; color: var(--text-muted)">
                          {{ o.desc ? (o.desc.slice(0, 50) + (o.desc.length > 50 ? '...' : '')) : '' }}
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="o.status === 'approved' ? 'badge-success' : o.status === 'resolved' ? 'badge-cyan' : o.status === 'pending' ? 'badge-warning' : 'badge-info'">{{ o.status }}</span>
                      </td>
                      <td class="primary">{{ o.type === 'bug' ? 'Free' : '$' + o.amount.toLocaleString() }}</td>
                      <td style="font-size: 12px">{{ o.date }}</td>
                      <td style="font-size: 12px; color: var(--accent)">{{ o.quotationNo || '—' }}</td>
                      <td>
                        <button v-if="o.type === 'request'" class="btn btn-ghost btn-sm" @click="openQuotation(o)">
                          <i class="fa-solid fa-file-invoice"></i> Quotation
                        </button>
                        <span v-else style="font-size: 12px; color: var(--text-muted)">N/A</span>
                      </td>
                    </tr>
                    <tr v-if="!customerOrders.length">
                      <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px">
                        No orders yet. Click "New Order" to add one.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB: Customer Tasks -->
          <div v-if="customerTab === 'tasks'">
            <div class="page-header" style="margin-bottom: 16px">
              <div style="font-size: 15px; font-weight: 600; color: var(--text-secondary)">
                Tasks linked to {{ selectedCustomer.name }}
              </div>
            </div>
            <div v-for="t in tasks.filter(t => t.customer === selectedCustomer.name)" :key="t.id" class="task-card" @click="viewTask(t)">
              <div style="display: flex; gap: 8px; margin-bottom: 6px">
                <span class="badge" style="background: rgba(99, 102, 241, 0.1); color: var(--accent); font-size: 10px">{{ t.type }}</span>
                <span class="badge" :class="priorityBadge(t.priority)">{{ t.priority }}</span>
                <span class="badge" :class="t.status === 'done' ? 'badge-success' : t.status === 'in-progress' ? 'badge-info' : 'badge-warning'">{{ t.status }}</span>
              </div>
              <div class="task-title">{{ t.title }}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px">
                <i class="fa-regular fa-calendar"></i> {{ t.due }} &middot; {{ t.assignee }}
              </div>
            </div>
            <div v-if="!tasks.filter(t => t.customer === selectedCustomer.name).length" style="color: var(--text-muted); font-size: 13px; padding: 20px 0">
              No tasks assigned to this customer.
            </div>
          </div>
        </div>

        <!-- TASKS KANBAN -->
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
          <div class="filter-bar">
            <span style="font-size: 13px; color: var(--text-secondary)">Filter by priority:</span>
            <button class="btn btn-sm" :class="taskFilter === 'all' ? 'btn-primary' : 'btn-ghost'" @click="taskFilter = 'all'">All</button>
            <button class="btn btn-sm" :class="taskFilter === 'high' ? 'btn-primary' : 'btn-ghost'" @click="taskFilter = 'high'">High</button>
            <button class="btn btn-sm" :class="taskFilter === 'medium' ? 'btn-primary' : 'btn-ghost'" @click="taskFilter = 'medium'">Medium</button>
            <button class="btn btn-sm" :class="taskFilter === 'low' ? 'btn-primary' : 'btn-ghost'" @click="taskFilter = 'low'">Low</button>
          </div>
          <div class="kanban">
            <div class="kanban-col" v-for="(col, key) in taskCols" :key="key">
              <div class="kanban-col-title">
                <span :style="{ color: key === 'todo' ? 'var(--warning)' : key === 'in-progress' ? 'var(--accent)' : 'var(--success)' }">
                  <i :class="key === 'done' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle'"></i>
                  {{ key === 'todo' ? 'To Do' : key === 'in-progress' ? 'In Progress' : 'Done' }}
                </span>
                <span class="kanban-count">{{ col.length }}</span>
              </div>
              <div class="task-card" v-for="t in col" :key="t.id" @click="viewTask(t)">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
                  <span class="badge" :class="'badge-' + (t.type || 'task').toLowerCase().replace(' ', '-')" style="font-size: 10px; background: rgba(99, 102, 241, 0.1); color: var(--accent)">
                    {{ t.type }}
                  </span>
                  <span class="badge" :class="priorityBadge(t.priority)">{{ t.priority }}</span>
                </div>
                <div class="task-title">{{ t.title }}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px">{{ t.desc }}</div>
                <div class="task-meta">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <div class="avatar avatar-sm" :style="{ background: safeColor(t.assignee), width: '24px', height: '24px', fontSize: '10px' }">
                      {{ safeInitials(t.assignee) }}
                    </div>
                    <span style="font-size: 11px; color: var(--text-secondary)">{{ t.assignee }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span v-if="(t.attachments || []).length" style="font-size: 11px; color: var(--accent); display: inline-flex; align-items: center; gap: 3px" title="Attached Files">
                      <i class="fa-solid fa-paperclip"></i>{{ t.attachments.length }}
                    </span>
                    <span class="task-due"><i class="fa-regular fa-calendar"></i>{{ t.due }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SCHEDULE & GANTT CHART -->
        <div v-if="page === 'schedule'" class="fade-in">
          <div class="stats-grid">
            <div class="stat-card indigo">
              <div class="stat-icon indigo"><i class="fa-solid fa-list-check"></i></div>
              <div class="stat-value">{{ tasks.length }}</div>
              <div class="stat-label">Total Scheduled Tasks</div>
              <div class="stat-change up"><i class="fa-solid fa-clock"></i> Active timeline view</div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon purple"><i class="fa-solid fa-spinner"></i></div>
              <div class="stat-value">{{ schedInProgressCount }}</div>
              <div class="stat-label">In Progress</div>
              <div class="stat-change up"><i class="fa-solid fa-play"></i> Active workflows</div>
            </div>
            <div class="stat-card cyan">
              <div class="stat-icon cyan"><i class="fa-solid fa-hourglass-half"></i></div>
              <div class="stat-value">{{ schedTodoCount }}</div>
              <div class="stat-label">Pending / To Do</div>
              <div class="stat-change down"><i class="fa-solid fa-circle-exclamation"></i> Action required</div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
              <div class="stat-value">{{ schedDoneCount }}</div>
              <div class="stat-label">Completed</div>
              <div class="stat-change up"><i class="fa-solid fa-check-double"></i> {{ schedCompletionRate }}% completion rate</div>
            </div>
          </div>

          <div class="page-header" style="margin-bottom: 16px">
            <div>
              <div class="page-title">Project Schedule Timeline</div>
              <div class="page-desc">Gantt Chart tracking for pending, in-progress, and completed tasks</div>
            </div>
            <button class="btn btn-primary" @click="showTaskModal = true">
              <i class="fa-solid fa-plus"></i> New Scheduled Task
            </button>
          </div>

          <div class="filter-bar" style="margin-bottom: 20px; flex-wrap: wrap">
            <div class="search-bar" style="flex: 1; max-width: 320px">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input class="form-control" v-model="schedSearch" placeholder="Search task or assignee..." />
            </div>

            <div style="display: flex; gap: 6px; align-items: center">
              <span style="font-size: 13px; color: var(--text-secondary); margin-right: 4px">Status:</span>
              <button class="btn btn-sm" :class="schedStatus === 'all' ? 'btn-primary' : 'btn-ghost'" @click="schedStatus = 'all'">
                All ({{ tasks.length }})
              </button>
              <button class="btn btn-sm" :class="schedStatus === 'todo' ? 'btn-primary' : 'btn-ghost'" @click="schedStatus = 'todo'">
                <i class="fa-solid fa-hourglass-half" style="color: var(--warning)"></i> Pending ({{ schedTodoCount }})
              </button>
              <button class="btn btn-sm" :class="schedStatus === 'in-progress' ? 'btn-primary' : 'btn-ghost'" @click="schedStatus = 'in-progress'">
                <i class="fa-solid fa-spinner" style="color: var(--accent)"></i> In Progress ({{ schedInProgressCount }})
              </button>
              <button class="btn btn-sm" :class="schedStatus === 'done' ? 'btn-primary' : 'btn-ghost'" @click="schedStatus = 'done'">
                <i class="fa-solid fa-circle-check" style="color: var(--success)"></i> Completed ({{ schedDoneCount }})
              </button>
            </div>

            <div style="display: flex; gap: 8px; align-items: center">
              <span style="font-size: 13px; color: var(--text-secondary)">Priority:</span>
              <select class="form-control" v-model="schedPriority" style="width: 130px">
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div class="gantt-card">
            <div class="gantt-wrapper">
              <div class="gantt-sidebar">
                <div class="gantt-sidebar-header">
                  <span>Task Name & Assignee</span>
                </div>
                <div class="gantt-sidebar-row" v-for="t in filteredSchedTasks" :key="'side-' + t.id" @click="viewTask(t)" title="Click to view/edit task">
                  <div class="avatar avatar-sm" :style="{ background: safeColor(t.assignee), width: '28px', height: '28px', fontSize: '11px', flexShrink: 0 }">
                    {{ safeInitials(t.assignee) }}
                  </div>
                  <div style="overflow: hidden; flex: 1">
                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
                      {{ t.title }}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px">
                      <span class="badge" :class="t.status === 'done' ? 'badge-success' : t.status === 'in-progress' ? 'badge-info' : 'badge-warning'" style="font-size: 9px">
                        {{ t.status }}
                      </span>
                      <span style="font-size: 11px; color: var(--text-muted)">{{ t.assignee || 'Unassigned' }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!filteredSchedTasks.length" style="padding: 40px 16px; text-align: center; color: var(--text-muted); font-size: 13px">
                  No tasks match the filter criteria.
                </div>
              </div>

              <div class="gantt-timeline-area">
                <div class="gantt-dates-header">
                  <div class="gantt-date-col" v-for="d in ganttDates" :key="d.dateStr" :class="{ 'is-today': d.isToday, 'is-weekend': d.isWeekend }">
                    <div style="font-size: 10px; text-transform: uppercase">{{ d.dayName }}</div>
                    <div style="font-size: 13px; font-weight: 700; margin-top: 1px">{{ d.dayNum }}</div>
                  </div>
                </div>

                <div class="gantt-timeline-body">
                  <div class="gantt-grid-row" v-for="t in filteredSchedTasks" :key="'grid-' + t.id">
                    <div class="gantt-grid-cell" v-for="d in ganttDates" :key="'cell-' + t.id + '-' + d.dateStr" :class="{ 'is-today': d.isToday, 'is-weekend': d.isWeekend }"></div>

                    <div
                      class="gantt-task-bar"
                      :class="t.status === 'done' ? 'bar-done' : t.status === 'in-progress' ? 'bar-in-progress' : 'bar-todo'"
                      :style="getGanttBarStyle(t)"
                      @click="viewTask(t)"
                      :title="t.title + ' (' + (t.progress || 0) + '% complete) — Due: ' + t.due"
                    >
                      <div class="gantt-bar-fill" :style="{ width: (t.progress || (t.status === 'done' ? 100 : 30)) + '%' }"></div>
                      <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 6px; overflow: hidden">
                        <i :class="t.status === 'done' ? 'fa-solid fa-circle-check' : t.status === 'in-progress' ? 'fa-solid fa-spinner' : 'fa-solid fa-clock'" style="font-size: 11px"></i>
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ t.title }}</span>
                      </div>
                      <div style="position: relative; z-index: 2; font-size: 10px; font-weight: 800; background: rgba(0, 0, 0, 0.25); padding: 2px 6px; border-radius: 6px; margin-left: 6px">
                        {{ t.progress || (t.status === 'done' ? 100 : 0) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPLOYEES DIRECTORY -->
        <div v-if="page === 'employees'">
          <div class="page-header">
            <div>
              <div class="page-title">Employee Directory</div>
              <div class="page-desc">{{ employees.length }} team members</div>
            </div>
            <button v-if="can('add_edit_employee')" class="btn btn-primary" @click="openAddEmployee">
              <i class="fa-solid fa-user-plus"></i> Create New Employee
            </button>
          </div>
          <div class="filter-bar">
            <div class="search-bar" style="flex: 1; max-width: 320px">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input class="form-control" v-model="empSearch" placeholder="Search employees..." />
            </div>
          </div>
          <div class="employee-grid">
            <div class="employee-card" v-for="e in filteredEmployees" :key="e.id" @click="viewEmployee(e)">
              <div class="avatar avatar-lg" style="margin: 0 auto" :style="{ background: getColor(e.id) }">
                {{ initials(e.name) }}
              </div>
              <div class="employee-name">{{ e.name }}</div>
              <div class="employee-dept">{{ e.role }} &middot; {{ e.dept }}</div>
              <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 14px; flex-wrap: wrap">
                <span class="badge" :class="e.status === 'active' ? 'badge-success' : e.status === 'on-leave' ? 'badge-warning' : 'badge-secondary'">{{ e.status }}</span>
                <span class="badge badge-info" v-if="e.accessLevel">
                  <i class="fa-solid fa-shield-halved" style="font-size: 10px; margin-right: 3px"></i>{{ e.accessLevel }}
                </span>
              </div>
              <div class="employee-stats">
                <div v-if="can('view_sales')">
                  <div class="emp-stat-val">{{ e.deals }}</div>
                  <div class="emp-stat-lbl">Deals</div>
                </div>
                <div>
                  <div class="emp-stat-val">{{ e.tasks }}</div>
                  <div class="emp-stat-lbl">Tasks</div>
                </div>
              </div>
              <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted)">
                <i class="fa-solid fa-envelope"></i> {{ e.email }}
              </div>
              <div style="margin-top: 8px">
                <span style="font-size: 11px; color: var(--accent)"><i class="fa-solid fa-arrow-right"></i> View Profile</span>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPLOYEE DETAIL -->
        <div v-if="page === 'employee_detail' && selectedEmployee">
          <div style="display: flex; gap: 10px; margin-bottom: 16px">
            <button class="btn btn-ghost btn-sm" @click="page = 'employees'">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <button v-if="can('add_edit_employee')" class="btn btn-primary btn-sm" @click="openEditEmployee">
              <i class="fa-solid fa-pen-to-square"></i> Edit Employee
            </button>
          </div>

          <div class="detail-header" style="margin-bottom: 24px">
            <div class="avatar avatar-xl" :style="{ background: getColor(selectedEmployee.id) }">
              {{ initials(selectedEmployee.name) }}
            </div>
            <div class="detail-info">
              <div class="detail-name">{{ selectedEmployee.name }}</div>
              <div class="detail-meta">
                <span><i class="fa-solid fa-briefcase"></i> {{ selectedEmployee.role }}</span>
                <span><i class="fa-solid fa-building"></i> {{ selectedEmployee.dept }}</span>
                <span><i class="fa-solid fa-envelope"></i> {{ selectedEmployee.email }}</span>
                <span><i class="fa-solid fa-phone"></i> {{ selectedEmployee.phone }}</span>
              </div>
              <div style="margin-top: 12px">
                <span class="badge" :class="selectedEmployee.status === 'active' ? 'badge-success' : selectedEmployee.status === 'on-leave' ? 'badge-warning' : 'badge-secondary'">{{ selectedEmployee.status }}</span>
              </div>
            </div>
            <div style="display: flex; gap: 20px; text-align: center">
              <div v-if="can('view_sales')" style="padding: 16px 24px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px">
                <div style="font-size: 28px; font-weight: 800; color: var(--accent)">{{ selectedEmployee.deals }}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px">Deals Closed</div>
              </div>
              <div style="padding: 16px 24px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px">
                <div style="font-size: 28px; font-weight: 800; color: var(--success)">{{ selectedEmployee.tasks }}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px">Open Tasks</div>
              </div>
              <div v-if="can('view_sales')" style="padding: 16px 24px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px">
                <div style="font-size: 22px; font-weight: 800; color: var(--accent-3)">{{ '$' + ((selectedEmployee.revenue || 0) / 1000).toFixed(0) + 'k' }}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px">Revenue</div>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-title" style="margin-bottom: 16px">Employee Information</div>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Department</div><div class="info-value">{{ selectedEmployee.dept }}</div></div>
                <div class="info-item"><div class="info-label">Role</div><div class="info-value">{{ selectedEmployee.role }}</div></div>
                <div class="info-item"><div class="info-label">Joined</div><div class="info-value">{{ selectedEmployee.joined }}</div></div>
                <div class="info-item"><div class="info-label">Status</div>
                  <div class="info-value"><span class="badge" :class="selectedEmployee.status === 'active' ? 'badge-success' : selectedEmployee.status === 'on-leave' ? 'badge-warning' : 'badge-secondary'">{{ selectedEmployee.status }}</span></div>
                </div>
                <div class="info-item"><div class="info-label">Email</div><div class="info-value" style="word-break: break-all">{{ selectedEmployee.email }}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div class="info-value">{{ selectedEmployee.phone }}</div></div>
                <div class="info-item" style="grid-column: span 2"><div class="info-label">Access Level</div><div class="info-value"><span class="badge badge-info"><i class="fa-solid fa-shield-halved"></i> {{ selectedEmployee.accessLevel || 'Standard' }}</span></div></div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">Assigned Tasks</div>
                <span class="badge badge-info">{{ tasks.filter(t => t.assignee === selectedEmployee.name).length }} total</span>
              </div>
              <div v-if="!tasks.filter(t => t.assignee === selectedEmployee.name).length" style="color: var(--text-muted); font-size: 13px">No tasks assigned.</div>
              <div class="task-card" v-for="t in tasks.filter(t => t.assignee === selectedEmployee.name)" :key="t.id" @click="viewTask(t)">
                <div style="display: flex; gap: 8px; margin-bottom: 6px">
                  <span class="badge" style="background: rgba(99, 102, 241, 0.1); color: var(--accent); font-size: 10px">{{ t.type }}</span>
                  <span class="badge" :class="priorityBadge(t.priority)">{{ t.priority }}</span>
                  <span class="badge" :class="t.status === 'done' ? 'badge-success' : t.status === 'in-progress' ? 'badge-info' : 'badge-warning'">{{ t.status }}</span>
                </div>
                <div class="task-title">{{ t.title }}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 5px">
                  <i class="fa-regular fa-calendar"></i> Due: {{ t.due }}
                  <span v-if="t.customer" style="margin-left: 8px"><i class="fa-solid fa-user"></i> {{ t.customer }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SETTINGS -->
        <div v-if="page === 'settings'" class="fade-in">
          <div class="grid-2">
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title"><i class="fa-solid fa-user-gear" style="color: var(--accent)"></i> Edit Profile</div>
                  <div class="card-subtitle">Update your personal profile information</div>
                </div>
              </div>

              <div v-if="profileSuccessMsg" style="padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; color: var(--success); font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px">
                <i class="fa-solid fa-circle-check"></i> {{ profileSuccessMsg }}
              </div>

              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 14px; background: var(--glass); border-radius: 12px; border: 1px solid var(--glass-border)">
                <div class="avatar avatar-lg" style="background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff">{{ userProfile.initials }}</div>
                <div>
                  <div style="font-size: 16px; font-weight: 700">{{ userProfile.name }}</div>
                  <div style="font-size: 12px; color: var(--text-secondary)">{{ userProfile.role }} &middot; {{ userProfile.department }}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px">{{ userProfile.email }}</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" v-model="profileForm.name" /></div>
                <div class="form-group"><label class="form-label">Email Address *</label><input class="form-control" type="email" v-model="profileForm.email" /></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Phone Number</label><input class="form-control" v-model="profileForm.phone" /></div>
                <div class="form-group"><label class="form-label">Role / Title</label>
                  <select class="form-control" v-model="profileForm.role" @change="switchRole(profileForm.role)">
                    <option v-for="r in systemRoles" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group"><label class="form-label">Department</label><input class="form-control" v-model="profileForm.department" /></div>
              <div class="form-group"><label class="form-label">Bio / Notes</label><textarea class="form-control" v-model="profileForm.bio" rows="3"></textarea></div>

              <div style="text-align: right">
                <button class="btn btn-primary" @click="saveProfile"><i class="fa-solid fa-floppy-disk"></i> Save Profile</button>
              </div>
            </div>

            <div>
              <div class="card" style="margin-bottom: 20px">
                <div class="card-header">
                  <div>
                    <div class="card-title"><i class="fa-solid fa-palette" style="color: var(--accent)"></i> Appearance & Theme</div>
                    <div class="card-subtitle">Choose your preferred UI theme interface</div>
                  </div>
                </div>
                <div style="display: flex; gap: 16px;">
                  <div class="card" :style="{ flex: 1, border: currentTheme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--glass-border)', cursor: 'pointer' }" @click="switchTheme('dark')">
                    <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px"><i class="fa-solid fa-moon"></i> Dark Theme</div>
                    <div style="font-size: 11px; color: var(--text-muted)">Dark glassmorphism interface</div>
                  </div>
                  <div class="card" :style="{ flex: 1, border: currentTheme === 'light' ? '2px solid var(--accent)' : '1px solid var(--glass-border)', cursor: 'pointer' }" @click="switchTheme('light')">
                    <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px"><i class="fa-solid fa-sun"></i> Light Theme</div>
                    <div style="font-size: 11px; color: var(--text-muted)">Bright & clean interface</div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title"><i class="fa-solid fa-sliders" style="color: var(--accent)"></i> Preferences</div>
                    <div class="card-subtitle">System notifications & default view</div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 14px">
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--glass); border-radius: 10px; border: 1px solid var(--glass-border)">
                    <div>
                      <div style="font-size: 13px; font-weight: 600">Email Notifications</div>
                      <div style="font-size: 11px; color: var(--text-muted)">Receive email digests for order updates</div>
                    </div>
                    <input type="checkbox" checked style="accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer" />
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--glass); border-radius: 10px; border: 1px solid var(--glass-border)">
                    <div>
                      <div style="font-size: 13px; font-weight: 600">Task Due Alerts</div>
                      <div style="font-size: 11px; color: var(--text-muted)">Show popups when assigned tasks are due</div>
                    </div>
                    <input type="checkbox" checked style="accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TASK DETAIL / EDIT MODAL -->
    <div class="modal-overlay" v-if="showTaskDetailModal" @click.self="showTaskDetailModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <div class="modal-title">Task Detail</div>
          <button class="modal-close" @click="showTaskDetailModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" v-if="selectedTask">
          <div v-if="!taskEditMode" style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
                {{ selectedTask.title }}
              </div>
              <button class="btn btn-ghost btn-sm" @click="taskEditMode = true">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 12px;">
              {{ selectedTask.desc || 'No description provided.' }}
            </div>
            <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap;">
              <span><i class="fa-solid fa-user"></i> {{ selectedTask.assignee || 'Unassigned' }}</span>
              <span><i class="fa-regular fa-calendar"></i> Due: {{ selectedTask.due }}</span>
              <span><i class="fa-solid fa-flag"></i> Priority: {{ selectedTask.priority }}</span>
              <span><i class="fa-solid fa-bars-progress"></i> Status: {{ selectedTask.status }}</span>
            </div>
          </div>

          <!-- TASK EDIT FORM -->
          <div v-else style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input class="form-control" v-model="taskEditForm.title" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="taskEditForm.desc"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-control" v-model="taskEditForm.priority"><option>high</option><option>medium</option><option>low</option></select>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-control" v-model="taskEditForm.status"><option>todo</option><option>in-progress</option><option>done</option></select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Assignee</label>
                <select class="form-control" v-model="taskEditForm.assignee"><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-group">
                <label class="form-label">Progress (%)</label>
                <input class="form-control" type="number" min="0" max="100" v-model.number="taskEditForm.progress" />
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
              <button class="btn btn-ghost btn-sm" @click="taskEditMode = false">Cancel</button>
              <button class="btn btn-primary btn-sm" @click="saveTaskEdit"><i class="fa-solid fa-floppy-disk"></i> Save</button>
            </div>
          </div>

          <!-- Attachments Section -->
          <div style="margin-top: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-paperclip" style="color: var(--accent)"></i>
                Attachments
                <span class="badge badge-info" style="font-size: 10px">{{ (selectedTask.attachments || []).length }}</span>
              </div>
              <label class="btn btn-primary btn-sm" style="cursor: pointer; margin: 0">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" @change="(e) => handleFileUpload(e, selectedTask)" style="display: none" />
              </label>
            </div>

            <div v-if="(selectedTask.attachments || []).length" style="display: flex; flex-direction: column; gap: 8px">
              <div v-for="att in selectedTask.attachments" :key="att.id" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden">
                  <div v-if="['jpg', 'jpeg', 'png', 'gif', 'webp'].includes((att.original_name || att.file_name).split('.').pop().toLowerCase())" style="width: 36px; height: 36px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0; border: 1px solid var(--glass-border)">
                    <img :src="att.file_path" style="width: 100%; height: 100%; object-fit: cover" />
                  </div>
                  <div v-else style="width: 36px; height: 36px; border-radius: 6px; background: rgba(99, 102, 241, 0.12); display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 16px; flex-shrink: 0;">
                    <i :class="'fa-solid ' + fileIcon(att.original_name || att.file_name, att.file_type)"></i>
                  </div>
                  <div style="overflow: hidden">
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
                      {{ att.original_name || att.file_name }}
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px">
                      {{ fmtFileSize(att.file_size) }} &middot; {{ att.created_at }}
                    </div>
                  </div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                  <button class="btn btn-ghost btn-sm" @click="downloadAttachment(att)" title="Download File">
                    <i class="fa-solid fa-download" style="color: var(--success)"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="removeAttachment(att, selectedTask)" title="Delete File">
                    <i class="fa-solid fa-trash-can" style="color: var(--danger)"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else style="font-size: 12px; color: var(--text-muted); padding: 12px; text-align: center; border: 1px dashed var(--glass-border); border-radius: 8px;">
              No files attached yet. Supported: Images, PDF, DOC, DOCX.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE TASK MODAL -->
    <div class="modal-overlay" v-if="showTaskModal" @click.self="showTaskModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <div class="modal-title">Create Task Request</div>
          <button class="modal-close" @click="showTaskModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Title *</label><input class="form-control" v-model="taskForm.title" placeholder="Task title..." /></div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" v-model="taskForm.desc" placeholder="Describe the task..."></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Priority</label>
              <select class="form-control" v-model="taskForm.priority"><option>high</option><option>medium</option><option>low</option></select>
            </div>
            <div class="form-group"><label class="form-label">Type</label>
              <select class="form-control" v-model="taskForm.type"><option>Call</option><option>Demo</option><option>Email</option><option>Meeting</option><option>Proposal</option><option>Contract</option><option>Internal</option></select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Assignee</label>
              <select class="form-control" v-model="taskForm.assignee"><option value="">Select...</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
            </div>
            <div class="form-group"><label class="form-label">Due Date</label><input class="form-control" type="date" v-model="taskForm.due" /></div>
          </div>
          <div class="form-group"><label class="form-label">Customer</label>
            <select class="form-control" v-model="taskForm.customer"><option value="">None</option><option v-for="c in customers" :key="c.id">{{ c.name }}</option></select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showTaskModal = false">Cancel</button>
          <button class="btn btn-primary" @click="addTask" :disabled="!taskForm.title"><i class="fa-solid fa-plus"></i> Create Task</button>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT CUSTOMER MODAL -->
    <div class="modal-overlay" v-if="showCustomerModal" @click.self="showCustomerModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <div class="modal-title">{{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}</div>
          <button class="modal-close" @click="showCustomerModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" v-model="customerForm.name" placeholder="John Smith" /></div>
            <div class="form-group"><label class="form-label">Email *</label><input class="form-control" type="email" v-model="customerForm.email" placeholder="john@company.com" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Phone</label><input class="form-control" v-model="customerForm.phone" placeholder="+1 555-0000" /></div>
            <div class="form-group"><label class="form-label">Company</label><input class="form-control" v-model="customerForm.company" placeholder="Acme Corp" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Status</label>
              <select class="form-control" v-model="customerForm.status"><option>active</option><option>prospect</option><option>inactive</option></select>
            </div>
            <div class="form-group"><label class="form-label">Industry</label><input class="form-control" v-model="customerForm.industry" placeholder="Technology" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Deal Value ($)</label><input class="form-control" type="number" v-model.number="customerForm.value" placeholder="0" /></div>
            <div class="form-group"><label class="form-label">Deal / Plan</label><input class="form-control" v-model="customerForm.deal" placeholder="Enterprise Suite" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">City</label><input class="form-control" v-model="customerForm.city" placeholder="San Francisco" /></div>
            <div class="form-group"><label class="form-label">Country</label><input class="form-control" v-model="customerForm.country" placeholder="USA" /></div>
          </div>
          <div class="form-group"><label class="form-label">Owner</label>
            <select class="form-control" v-model="customerForm.owner"><option value="">Select owner...</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
          </div>
          <div class="form-group"><label class="form-label">Notes</label><textarea class="form-control" v-model="customerForm.notes" placeholder="Any additional notes..."></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showCustomerModal = false">Cancel</button>
          <button class="btn btn-primary" @click="saveCustomer" :disabled="!customerForm.name || !customerForm.email">
            <i :class="editingCustomer ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-plus'"></i>
            {{ editingCustomer ? 'Save Changes' : 'Add Customer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT EMPLOYEE MODAL -->
    <div class="modal-overlay" v-if="showEmployeeModal" @click.self="showEmployeeModal = false">
      <div class="modal fade-in" style="max-width: 580px">
        <div class="modal-header">
          <div class="modal-title">
            <i class="fa-solid fa-user-plus" style="color: var(--accent); margin-right: 8px"></i>
            {{ editingEmployee ? 'Edit Employee Account' : 'Create New Employee Account' }}
          </div>
          <button class="modal-close" @click="showEmployeeModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" v-model="employeeForm.name" placeholder="e.g. Sarah Connor" /></div>
            <div class="form-group"><label class="form-label">Email Address *</label><input class="form-control" type="email" v-model="employeeForm.email" placeholder="s.connor@hnfcrm.com" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Phone Number</label><input class="form-control" v-model="employeeForm.phone" placeholder="+1 555-0199" /></div>
            <div class="form-group"><label class="form-label">Status</label>
              <select class="form-control" v-model="employeeForm.status"><option>active</option><option>on-leave</option><option>inactive</option></select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Job Position / Role *</label>
              <select class="form-control" v-model="employeeForm.role">
                <option v-for="r in systemRoles" :key="r">{{ r }}</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Department *</label>
              <select class="form-control" v-model="employeeForm.dept">
                <option>Sales</option><option>Engineering</option><option>IT Support</option><option>Operations</option><option>Systems</option><option>Infrastructure</option><option>Finance</option><option>Marketing</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Access Level</label>
              <select class="form-control" v-model="employeeForm.accessLevel"><option>Standard</option><option>Manager</option><option>Admin</option></select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showEmployeeModal = false">Cancel</button>
          <button class="btn btn-primary" @click="saveEmployee" :disabled="!employeeForm.name || !employeeForm.email">
            <i :class="editingEmployee ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-user-plus'"></i>
            {{ editingEmployee ? 'Save Changes' : 'Create Account' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE ORDER MODAL -->
    <div class="modal-overlay" v-if="showOrderModal" @click.self="showOrderModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <div class="modal-title">Add Order / Ticket</div>
          <button class="modal-close" @click="showOrderModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Type</label>
            <select class="form-control" v-model="orderForm.type">
              <option value="request">Paid Feature Request</option>
              <option value="bug">Bug Report (Free)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input class="form-control" v-model="orderForm.title" placeholder="Short description of request or bug..." />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" v-model="orderForm.desc" placeholder="Provide details..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group" v-if="orderForm.type === 'request'">
              <label class="form-label">Quotation Amount ($)</label>
              <input class="form-control" type="number" v-model.number="orderForm.amount" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Assigned Lead</label>
              <select class="form-control" v-model="orderForm.assignee">
                <option value="">Unassigned</option>
                <option v-for="e in employees" :key="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showOrderModal = false">Cancel</button>
          <button class="btn btn-primary" @click="addOrder" :disabled="!orderForm.title">Create Order</button>
        </div>
      </div>
    </div>

    <!-- QUOTATION PRINT MODAL -->
    <div class="modal-overlay" v-if="showQuotationModal" @click.self="showQuotationModal = false">
      <div class="modal fade-in" style="max-width: 650px">
        <div class="modal-header">
          <div class="modal-title">Official Quotation</div>
          <button class="modal-close" @click="showQuotationModal = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" id="quotation-print" v-if="quotationOrder">
          <div style="border-bottom: 2px solid var(--accent); padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h2 style="color: var(--accent); margin-bottom: 4px">HNF CRM Systems Ltd.</h2>
              <div style="font-size: 12px; color: var(--text-muted)">100 Tech Plaza, Suite 400 &middot; San Francisco, CA</div>
            </div>
            <div style="text-align: right">
              <div style="font-size: 18px; font-weight: 800; color: var(--text-primary)">QUOTATION</div>
              <div style="font-size: 13px; color: var(--accent); font-weight: 700">{{ quotationOrder.quotationNo }}</div>
              <div style="font-size: 11px; color: var(--text-muted)">Date: {{ quotationOrder.date }}</div>
            </div>
          </div>

          <div style="margin-bottom: 20px; font-size: 13px;">
            <strong>Customer:</strong> {{ selectedCustomer ? selectedCustomer.name : quotationOrder.customerName }}<br />
            <strong>Company:</strong> {{ selectedCustomer ? selectedCustomer.company : 'N/A' }}
          </div>

          <table style="margin-bottom: 20px;">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{{ quotationOrder.title }}</strong>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px">{{ quotationOrder.desc }}</div>
                </td>
                <td style="text-align: right; font-weight: 700">${{ (quotationOrder.amount || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; font-size: 16px; font-weight: 800; color: var(--accent); border-top: 1px solid var(--glass-border); padding-top: 12px;">
            Total: ${{ (quotationOrder.amount || 0).toLocaleString() }} USD
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showQuotationModal = false">Close</button>
          <button class="btn btn-primary" @click="printQuotation"><i class="fa-solid fa-print"></i> Print Quotation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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

// LocalStorage helpers
function loadStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

const customersList = ref(loadStorage('hnf_customers', [...defaultCustomers]));
const employeesList = ref(loadStorage('hnf_employees', [...defaultEmployees]));
const tasksList = ref(loadStorage('hnf_tasks', [...defaultTasks]));
const ordersList = ref(loadStorage('hnf_orders', [...defaultOrders]));
const activitiesList = ref(loadStorage('hnf_activities', [...defaultActivities]));

watch(customersList, (v) => saveStorage('hnf_customers', v), { deep: true });
watch(employeesList, (v) => saveStorage('hnf_employees', v), { deep: true });
watch(tasksList, (v) => saveStorage('hnf_tasks', v), { deep: true });
watch(ordersList, (v) => saveStorage('hnf_orders', v), { deep: true });
watch(activitiesList, (v) => saveStorage('hnf_activities', v), { deep: true });

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

const isLoggedIn = ref(localStorage.getItem('hnf_isLoggedIn') === 'true');
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
const schedStatus = ref('all');
const schedPriority = ref('all');
const schedSearch = ref('');

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

const emptyEmployee = () => ({
  name: '',
  email: '',
  phone: '',
  role: 'Account Executive',
  dept: 'Sales',
  accessLevel: 'Standard',
  status: 'active',
  deals: 0,
  revenue: 0,
  tasks: 0,
  joined: new Date().toISOString().slice(0, 10),
});
const employeeForm = ref(emptyEmployee());

const taskForm = ref({
  title: '',
  desc: '',
  priority: 'medium',
  assignee: '',
  due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  type: 'Call',
  customer: '',
});

const defaultUser = {
  name: 'Admin User',
  email: 'admin@hnfcrm.com',
  phone: '+1 (555) 234-5678',
  role: 'HOD IT',
  department: 'Management',
  initials: 'AD',
  bio: 'Lead Administrator of HNF CRM System.',
};
const userProfile = ref(loadStorage('hnf_userProfile', defaultUser));
watch(userProfile, (v) => saveStorage('hnf_userProfile', v), { deep: true });

const profileForm = ref({ ...userProfile.value });
const profileSuccessMsg = ref('');

const currentTheme = ref(localStorage.getItem('crm_theme') || 'dark');
function switchTheme(t) {
  currentTheme.value = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('crm_theme', t);
}

// Fetch remote data from Backend API on mount
async function loadAPIData() {
  try {
    const [custRes, empRes, taskRes, ordRes] = await Promise.all([
      apiCall('get_customers'),
      apiCall('get_employees'),
      apiCall('get_tasks'),
      apiCall('get_orders'),
    ]);

    if (custRes && (Array.isArray(custRes) || Array.isArray(custRes.data))) {
      customersList.value = Array.isArray(custRes) ? custRes : custRes.data;
    }
    if (empRes && (Array.isArray(empRes) || Array.isArray(empRes.data))) {
      employeesList.value = Array.isArray(empRes) ? empRes : empRes.data;
    }
    if (taskRes && (Array.isArray(taskRes) || Array.isArray(taskRes.data))) {
      tasksList.value = Array.isArray(taskRes) ? taskRes : taskRes.data;
    }
    if (ordRes && (Array.isArray(ordRes) || Array.isArray(ordRes.data))) {
      ordersList.value = Array.isArray(ordRes) ? ordRes : ordRes.data;
    }
  } catch (e) {
    console.warn('API connection notice:', e);
  }
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', currentTheme.value);
  loadAPIData();
});

const systemRoles = ref(SYSTEM_ROLES);
const currentRole = computed(() => userProfile.value ? userProfile.value.role : 'HOD IT');

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
  loginError.value = '';
  const apiRes = await apiCall('login', {
    email: loginForm.value.email,
    password: loginForm.value.password,
  });
  if (apiRes && apiRes.error) {
    loginError.value = apiRes.error;
    return;
  }
  isLoggedIn.value = true;
  if (loginForm.value.remember) {
    localStorage.setItem('hnf_isLoggedIn', 'true');
  }
}

function handleLogout() {
  isLoggedIn.value = false;
  localStorage.removeItem('hnf_isLoggedIn');
}

async function saveProfile() {
  if (!profileForm.value.name || !profileForm.value.email) return;
  const parts = profileForm.value.name.trim().split(' ');
  const init = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
  userProfile.value = { ...profileForm.value, initials: init };
  await apiCall('update_profile', profileForm.value);
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
async function saveCustomer() {
  if (!customerForm.value.name || !customerForm.value.email) return;
  const action = editingCustomer.value ? 'update_customer' : 'create_customer';
  const apiRes = await apiCall(action, customerForm.value);

  if (editingCustomer.value) {
    const idx = customersList.value.findIndex(c => c.id === editingCustomer.value.id);
    if (idx !== -1) {
      customersList.value[idx] = { ...editingCustomer.value, ...customerForm.value };
      selectedCustomer.value = customersList.value[idx];
    }
  } else {
    const newC = {
      id: apiRes && apiRes.id ? apiRes.id : Date.now(),
      joined: new Date().toISOString().slice(0, 10),
      ...customerForm.value,
    };
    customersList.value.unshift(newC);
    activitiesList.value.unshift({
      id: Date.now(),
      text: `New customer account added: ${newC.name} (${newC.company})`,
      time: 'Just now',
      color: '#06b6d4',
      icon: 'fa-user-plus',
    });
  }
  showCustomerModal.value = false;
}

function viewEmployee(e) {
  selectedEmployee.value = e;
  page.value = 'employee_detail';
}
function openAddEmployee() {
  editingEmployee.value = null;
  employeeForm.value = emptyEmployee();
  showEmployeeModal.value = true;
}
function openEditEmployee() {
  editingEmployee.value = selectedEmployee.value;
  employeeForm.value = { ...selectedEmployee.value };
  showEmployeeModal.value = true;
}
async function saveEmployee() {
  if (!employeeForm.value.name || !employeeForm.value.email) return;
  const action = editingEmployee.value ? 'update_employee' : 'create_employee';
  const apiRes = await apiCall(action, employeeForm.value);

  if (editingEmployee.value) {
    const idx = employeesList.value.findIndex(e => e.id === editingEmployee.value.id);
    if (idx !== -1) {
      employeesList.value[idx] = { ...editingEmployee.value, ...employeeForm.value };
      selectedEmployee.value = employeesList.value[idx];
    }
  } else {
    const newE = {
      id: apiRes && apiRes.id ? apiRes.id : Date.now(),
      ...employeeForm.value,
    };
    employeesList.value.unshift(newE);
    activitiesList.value.unshift({
      id: Date.now(),
      text: `New employee account created: ${newE.name} (${newE.role})`,
      time: 'Just now',
      color: '#6366f1',
      icon: 'fa-user-plus',
    });
  }
  showEmployeeModal.value = false;
}

function viewTask(t) {
  selectedTask.value = t;
  taskEditMode.value = false;
  taskEditForm.value = { ...t };
  showTaskDetailModal.value = true;
}
async function addTask() {
  if (!taskForm.value.title) return;
  const apiRes = await apiCall('create_task', taskForm.value);
  const newT = {
    id: apiRes && apiRes.id ? apiRes.id : Date.now(),
    status: 'todo',
    progress: 0,
    startDate: new Date().toISOString().slice(0, 10),
    attachments: [],
    ...taskForm.value,
  };
  tasksList.value.unshift(newT);
  taskForm.value = {
    title: '',
    desc: '',
    priority: 'medium',
    assignee: '',
    due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    type: 'Call',
    customer: '',
  };
  showTaskModal.value = false;
}
async function saveTaskEdit() {
  if (!taskEditForm.value.title || !selectedTask.value) return;
  await apiCall('update_task', taskEditForm.value);
  const idx = tasksList.value.findIndex(t => t.id === selectedTask.value.id);
  if (idx !== -1) {
    tasksList.value[idx] = { ...selectedTask.value, ...taskEditForm.value };
    selectedTask.value = tasksList.value[idx];
  }
  taskEditMode.value = false;
}

async function addOrder() {
  if (!orderForm.value.title || !selectedCustomer.value) return;
  const apiRes = await apiCall('create_order', {
    ...orderForm.value,
    customerId: selectedCustomer.value.id,
  });
  const newO = {
    id: apiRes && apiRes.id ? apiRes.id : Date.now(),
    customerId: selectedCustomer.value.id,
    customerName: selectedCustomer.value.name,
    type: orderForm.value.type,
    title: orderForm.value.title,
    desc: orderForm.value.desc,
    status: 'pending',
    amount: orderForm.value.type === 'bug' ? 0 : Number(orderForm.value.amount),
    date: new Date().toISOString().slice(0, 10),
    quotationNo: orderForm.value.type === 'request'
      ? 'QT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3)
      : null,
    assignee: orderForm.value.assignee,
  };
  ordersList.value.unshift(newO);
  orderForm.value = { type: 'request', title: '', desc: '', amount: 0, assignee: '' };
  showOrderModal.value = false;
}

function openQuotation(o) {
  quotationOrder.value = o;
  showQuotationModal.value = true;
}
function printQuotation() {
  const el = document.getElementById('quotation-print');
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write(
    '<html><head><title>Quotation</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h2{color:#6366f1}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}</style></head><body>' +
    el.innerHTML +
    '</body></html>'
  );
  w.document.close();
  w.focus();
  w.print();
  w.close();
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
  todo: tasksList.value.filter(
    (t) => t.status === 'todo' && (taskFilter.value === 'all' || t.priority === taskFilter.value)
  ),
  'in-progress': tasksList.value.filter(
    (t) => t.status === 'in-progress' && (taskFilter.value === 'all' || t.priority === taskFilter.value)
  ),
  done: tasksList.value.filter(
    (t) => t.status === 'done' && (taskFilter.value === 'all' || t.priority === taskFilter.value)
  ),
}));

const pageInfo = computed(() => {
  const map = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of CRM performance' },
    customers: { title: 'Customers', subtitle: 'Manage customer accounts' },
    customer_detail: {
      title: selectedCustomer.value ? selectedCustomer.value.name : 'Customer Profile',
      subtitle: selectedCustomer.value ? selectedCustomer.value.company : 'Detailed customer insights',
    },
    tasks: { title: 'Tasks', subtitle: 'Manage team requests' },
    schedule: { title: 'Schedule', subtitle: 'Gantt timeline view' },
    employees: { title: 'Employees', subtitle: 'Team directory' },
    employee_detail: {
      title: selectedEmployee.value ? selectedEmployee.value.name : 'Employee Profile',
      subtitle: selectedEmployee.value ? (selectedEmployee.value.role + ' · ' + selectedEmployee.value.dept) : 'Team member details',
    },
    settings: { title: 'Settings', subtitle: 'System preferences' },
  };
  return map[page.value] || { title: 'HNF CRM', subtitle: '' };
});

const totalRevenue = computed(() => customersList.value.reduce((a, c) => a + (c.value || 0), 0));
const activeCount = computed(() => customersList.value.filter((c) => c.status === 'active').length);
const openTasks = computed(() => tasksList.value.filter((t) => t.status !== 'done').length);
const customerOrders = computed(() =>
  selectedCustomer.value ? ordersList.value.filter((o) => o.customerId === selectedCustomer.value.id) : []
);

function priorityBadge(p) {
  return p === 'high' ? 'badge-danger' : p === 'medium' ? 'badge-warning' : 'badge-secondary';
}
function statusBadge(s) {
  return s === 'active' ? 'badge-success' : s === 'prospect' ? 'badge-info' : s === 'inactive' ? 'badge-danger' : 'badge-warning';
}
function fmtVal(v) {
  return v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'k' : '$' + (v || 0);
}

function fileIcon(name = '', type = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || type.includes('image')) return 'fa-file-image';
  if (ext === 'pdf' || type.includes('pdf')) return 'fa-file-pdf';
  if (['doc', 'docx'].includes(ext) || type.includes('word')) return 'fa-file-word';
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
  if (!files || !files.length || !targetTask) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileData = evt.target.result;
      const newAtt = {
        id: Date.now() + i,
        task_id: targetTask.id,
        file_name: file.name,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: fileData,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      if (!targetTask.attachments) targetTask.attachments = [];
      targetTask.attachments.push(newAtt);
      saveStorage('hnf_tasks', tasksList.value);
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
}

function removeAttachment(att, targetTask) {
  if (!confirm('Are you sure you want to delete this attachment?')) return;
  if (targetTask && targetTask.attachments) {
    targetTask.attachments = targetTask.attachments.filter((a) => a.id !== att.id);
    saveStorage('hnf_tasks', tasksList.value);
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

// Schedule & Gantt chart math
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

const filteredSchedTasks = computed(() => {
  return tasksList.value.filter((t) => {
    const matchStatus = schedStatus.value === 'all' || t.status === schedStatus.value;
    const matchPriority = schedPriority.value === 'all' || t.priority === schedPriority.value;
    const matchQ =
      !schedSearch.value ||
      t.title.toLowerCase().includes(schedSearch.value.toLowerCase()) ||
      (t.assignee && t.assignee.toLowerCase().includes(schedSearch.value.toLowerCase()));
    return matchStatus && matchPriority && matchQ;
  });
});

function getGanttBarStyle(t) {
  const start = new Date(t.startDate || t.due);
  const end = new Date(t.due);
  const diffStart = Math.max(0, Math.round((start - ganttStartDate) / (1000 * 60 * 60 * 24)));
  const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const cellWidth = 52;
  return {
    left: diffStart * cellWidth + 'px',
    width: duration * cellWidth + 'px',
  };
}

const schedTodoCount = computed(() => tasksList.value.filter((t) => t.status === 'todo').length);
const schedInProgressCount = computed(() => tasksList.value.filter((t) => t.status === 'in-progress').length);
const schedDoneCount = computed(() => tasksList.value.filter((t) => t.status === 'done').length);
const schedCompletionRate = computed(() => Math.round((schedDoneCount.value / (tasksList.value.length || 1)) * 100));
</script>
