(function () {

  const API_BASE = (window.location.protocol === 'file:') ? 'http://localhost:8000' : '';

  const banner = document.getElementById('banner');
  const appSearch = document.getElementById('appSearch');
  const appDeptFilter = document.getElementById('appDeptFilter');
  const appInstFilter = document.getElementById('appInstFilter');
  const appTableBody = document.getElementById('appTableBody');

  const adminAuthModal = document.getElementById('adminAuthModal');
  const adminMainContent = document.getElementById('adminMainContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminAuthBanner = document.getElementById('adminAuthBanner');
  const btnLogoutAdmin = document.getElementById('btnLogoutAdmin');

  // Tabs & Panels
  const tabApps = document.getElementById('tabApps');
  const tabDropdowns = document.getElementById('tabDropdowns');
  const panelApplications = document.getElementById('panelApplications');
  const panelDropdowns = document.getElementById('panelDropdowns');
  const dropdownCardsGrid = document.getElementById('dropdownCardsGrid');

  // Add Option Modal
  const btnOpenAddOption = document.getElementById('btnOpenAddOption');
  const optModalBackdrop = document.getElementById('optModalBackdrop');
  const closeOptModal = document.getElementById('closeOptModal');
  const cancelOptModal = document.getElementById('cancelOptModal');
  const addOptForm = document.getElementById('addOptForm');

  let allApplications = [];
  let allDropdowns = {};

  /* ---------------- Banner Helpers ---------------- */
  function showBanner(msg, type, bannerEl) {
    const el = bannerEl || banner;
    if (!el) return;
    el.textContent = msg;
    el.className = 'banner is-visible ' + type;
  }
  function hideBanner(bannerEl) {
    const el = bannerEl || banner;
    if (!el) return;
    el.className = 'banner';
    el.textContent = '';
  }

  /* ---------------- Admin Authentication Gate ---------------- */
  function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      if (adminAuthModal) adminAuthModal.style.display = 'none';
      if (adminMainContent) adminMainContent.style.display = 'block';
      if (btnLogoutAdmin) btnLogoutAdmin.style.display = 'inline-block';
      loadApplications();
      loadDropdowns();
    } else {
      if (adminAuthModal) adminAuthModal.style.display = 'flex';
      if (adminMainContent) adminMainContent.style.display = 'none';
      if (btnLogoutAdmin) btnLogoutAdmin.style.display = 'none';
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideBanner(adminAuthBanner);

      const username = document.getElementById('adminUsername').value.trim().toLowerCase();
      const pw = document.getElementById('adminPassword').value;

      if (!username || !pw) {
        showBanner('Please enter admin username and password.', 'error', adminAuthBanner);
        return;
      }

      try {
        const res = await fetch(API_BASE + '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username, password: pw })
        });
        const data = await res.json();

        if (data.success && (data.isAdmin || username === 'admin')) {
          sessionStorage.setItem('adminLoggedIn', 'true');
          showBanner('Access Granted. Loading Dashboard…', 'success', adminAuthBanner);
          setTimeout(() => {
            checkAdminAuth();
          }, 600);
        } else {
          showBanner(data.message || 'Invalid admin credentials.', 'error', adminAuthBanner);
        }
      } catch (err) {
        console.error('Admin login error:', err);
        if (username === 'admin' && pw === 'admin@123') {
          sessionStorage.setItem('adminLoggedIn', 'true');
          showBanner('Access Granted. Loading Dashboard…', 'success', adminAuthBanner);
          setTimeout(() => {
            checkAdminAuth();
          }, 600);
        } else {
          showBanner('Invalid admin credentials.', 'error', adminAuthBanner);
        }
      }
    });
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.addEventListener('click', function () {
      sessionStorage.removeItem('adminLoggedIn');
      checkAdminAuth();
    });
  }

  /* ---------------- TABS SWITCHING ---------------- */
  function switchTab(activeTab) {
    hideBanner();
    if (activeTab === 'apps') {
      tabApps.classList.add('is-active');
      tabDropdowns.classList.remove('is-active');
      tabApps.setAttribute('aria-selected', 'true');
      tabDropdowns.setAttribute('aria-selected', 'false');
      panelApplications.style.display = 'block';
      panelDropdowns.style.display = 'none';
    } else {
      tabDropdowns.classList.add('is-active');
      tabApps.classList.remove('is-active');
      tabDropdowns.setAttribute('aria-selected', 'true');
      tabApps.setAttribute('aria-selected', 'false');
      panelDropdowns.style.display = 'block';
      panelApplications.style.display = 'none';
      loadDropdowns();
    }
  }

  if (tabApps) tabApps.addEventListener('click', () => switchTab('apps'));
  if (tabDropdowns) tabDropdowns.addEventListener('click', () => switchTab('dropdowns'));

  /* ---------------- APPLICATIONS VIEWER ---------------- */
  async function loadApplications() {
    try {
      const res = await fetch(API_BASE + '/api/admin/applications');
      const data = await res.json();
      if (!data.success) {
        showBanner(data.message || 'Failed to load applications.', 'error');
        return;
      }
      allApplications = data.applications || [];
      populateDepartmentFilter();
      populateInstitutionFilter();
      renderApplicationsTable();
      updateStats();
    } catch (err) {
      console.error('Error loading applications:', err);
      showBanner('Failed to connect to backend server.', 'error');
    }
  }

  function populateDepartmentFilter() {
    if (!appDeptFilter) return;
    const selected = appDeptFilter.value;
    appDeptFilter.innerHTML = '<option value="all">All Departments</option>';

    const depts = [...new Set(allApplications.map(a => a.department).filter(Boolean))].sort();
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === selected) opt.selected = true;
      appDeptFilter.appendChild(opt);
    });
  }

  function populateInstitutionFilter() {
    if (!appInstFilter) return;
    const selected = appInstFilter.value;
    appInstFilter.innerHTML = '<option value="all">All Institutions</option>';

    const instSet = new Set();
    allApplications.forEach(app => {
      if (app.institutions) {
        const list = app.institutions.split(/\s*\|\|\s*/);
        list.forEach(i => {
          const trimmed = i.trim();
          if (trimmed) instSet.add(trimmed);
        });
      }
    });

    const instList = Array.from(instSet).sort();
    instList.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = inst;
      opt.textContent = inst;
      if (inst === selected) opt.selected = true;
      appInstFilter.appendChild(opt);
    });
  }

  if (appSearch) appSearch.addEventListener('input', renderApplicationsTable);
  if (appDeptFilter) appDeptFilter.addEventListener('change', renderApplicationsTable);
  if (appInstFilter) appInstFilter.addEventListener('change', renderApplicationsTable);

  function renderApplicationsTable() {
    if (!appTableBody) return;
    appTableBody.innerHTML = '';

    const query = appSearch ? appSearch.value.trim().toLowerCase() : '';
    const deptFilter = appDeptFilter ? appDeptFilter.value : 'all';
    const instFilter = appInstFilter ? appInstFilter.value : 'all';

    const filtered = allApplications.filter(app => {
      const matchDept = deptFilter === 'all' || app.department === deptFilter;

      const appInsts = app.institutions ? app.institutions.toLowerCase() : '';
      const matchInst = instFilter === 'all' || appInsts.includes(instFilter.toLowerCase());

      const matchQuery = !query ||
        (app.full_name && app.full_name.toLowerCase().includes(query)) ||
        (app.email && app.email.toLowerCase().includes(query)) ||
        (app.department && app.department.toLowerCase().includes(query)) ||
        (app.post && app.post.toLowerCase().includes(query)) ||
        (appInsts && appInsts.includes(query));

      return matchDept && matchInst && matchQuery;
    });

    if (filtered.length === 0) {
      appTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">No applications match the search criteria.</td></tr>`;
      return;
    }

    filtered.forEach(app => {
      const tr = document.createElement('tr');

      const photoSrc = app.photo_path || 'college.jpg';
      const name = app.full_name || 'Incomplete Profile';
      const post = app.post === 'Other' ? (app.post_other || 'Other') : (app.post || 'Not specified');
      const dateStr = app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A';

      tr.innerHTML = `
        <td>
          <div class="applicant-cell">
            <img src="${photoSrc}" class="applicant-avatar" alt="Photo" onerror="this.src='college.jpg'">
            <div>
              <div class="applicant-name">${name}</div>
              <div class="applicant-email">${app.email}</div>
            </div>
          </div>
        </td>
        <td><span class="dept-badge">${app.department}</span></td>
        <td>${post}</td>
        <td>${app.phone || 'N/A'}</td>
        <td>${dateStr}</td>
        <td>
          <button type="button" class="btn-secondary btn-sm view-app-btn" data-email="${app.email}">
            View Detail
          </button>
        </td>
      `;
      appTableBody.appendChild(tr);
    });

    appTableBody.querySelectorAll('.view-app-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        openApplicationModal(this.dataset.email);
      });
    });
  }

  /* Modal Application Detail */
  const appModalBackdrop = document.getElementById('appModalBackdrop');
  const closeAppModal = document.getElementById('closeAppModal');
  const appModalContent = document.getElementById('appModalContent');

  if (closeAppModal) {
    closeAppModal.addEventListener('click', () => {
      if (appModalBackdrop) appModalBackdrop.style.display = 'none';
    });
  }

  async function openApplicationModal(email) {
    if (!appModalContent || !appModalBackdrop) return;
    appModalContent.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading candidate application details...</p>';
    appModalBackdrop.style.display = 'flex';

    try {
      const res = await fetch(API_BASE + `/api/admin/applications/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!data.success) {
        appModalContent.innerHTML = `<p class="has-error">${data.message || 'Failed to load details'}</p>`;
        return;
      }

      const p = data.personal || {};
      const ed = data.education || [];
      const ex = data.experience || [];
      const cert = data.certifications || [];
      const phd = data.phd_details || null;

      let html = `
        <div class="detail-section">
          <div style="display:flex; gap:1.5rem; align-items:center; margin-bottom: 1rem;">
            <img src="${p.photo_path || 'college.jpg'}" style="width:90px; height:110px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;" onerror="this.src='college.jpg'">
            <div>
              <h2 style="margin:0; font-size:1.4rem;">${p.full_name || 'Candidate'}</h2>
              <p style="margin:0.2rem 0; color:#64748b;"><strong>Email:</strong> ${data.user.email} | <strong>Dept:</strong> ${data.user.department}</p>
              <p style="margin:0; color:#64748b;"><strong>Applied Post:</strong> ${p.post === 'Other' ? p.post_other : (p.post || 'N/A')}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="detail-section-title">Personal Details</h3>
          <div class="detail-grid">
            <div class="detail-item"><strong>Date of Birth / Age</strong> ${p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'} (${p.age || 'N/A'} yrs)</div>
            <div class="detail-item"><strong>Gender</strong> ${p.gender || 'N/A'}</div>
            <div class="detail-item"><strong>Blood Group</strong> ${p.blood_group || 'N/A'}</div>
            <div class="detail-item"><strong>Father's Name</strong> ${p.father_name || 'N/A'}</div>
            <div class="detail-item"><strong>Mother's Name</strong> ${p.mother_name || 'N/A'}</div>
            <div class="detail-item"><strong>Marital Status</strong> ${p.marital_status || 'N/A'}</div>
            <div class="detail-item"><strong>Community / Caste</strong> ${p.community || 'N/A'} / ${p.caste || 'N/A'}</div>
            <div class="detail-item"><strong>Religion</strong> ${p.religion || 'N/A'}</div>
            <div class="detail-item"><strong>Aadhaar No</strong> ${p.aadhaar || 'N/A'}</div>
            <div class="detail-item"><strong>Mobile</strong> ${p.phone || 'N/A'}</div>
          </div>
        </div>
      `;

      if (ed.length) {
        let edRows = ed.map(e => `
          <tr>
            <td><strong>${e.qual_type.toUpperCase()}</strong></td>
            <td>${e.degree || 'N/A'}</td>
            <td>${e.institution_name || e.institution_other || 'N/A'}</td>
            <td>${e.percentage ? e.percentage + '%' : 'N/A'}</td>
            <td>${e.year_of_passing || 'N/A'}</td>
            <td>${e.cert_path ? `<a href="${e.cert_path}" target="_blank" style="color:#0284c7; font-weight:600;">View Doc</a>` : 'No Doc'}</td>
          </tr>
        `).join('');

        html += `
          <div class="detail-section">
            <h3 class="detail-section-title">Educational Qualifications</h3>
            <table class="admin-table">
              <thead><tr><th>Qual</th><th>Degree</th><th>Institution</th><th>%</th><th>Year</th><th>Document</th></tr></thead>
              <tbody>${edRows}</tbody>
            </table>
          </div>
        `;
      }

      if (phd) {
        html += `
          <div class="detail-section">
            <h3 class="detail-section-title">Ph.D Attributes & Details</h3>
            <div class="detail-grid">
              <div class="detail-item"><strong>University</strong> ${phd.university || 'N/A'}</div>
              <div class="detail-item"><strong>Thesis Title</strong> ${phd.title || 'N/A'}</div>
              <div class="detail-item"><strong>Status</strong> ${phd.status || 'N/A'}</div>
              <div class="detail-item"><strong>Guide Name & College</strong> ${phd.guide_name || 'N/A'} (${phd.guide_college || 'N/A'})</div>
              <div class="detail-item"><strong>Reg / Completion Year</strong> ${phd.year_of_registration || 'N/A'} / ${phd.year_of_completion || 'N/A'}</div>
              <div class="detail-item"><strong>Publications (During/Post)</strong> ${phd.no_of_publications_during_phd || 0} / ${phd.no_of_publications_post_phd || 0}</div>
            </div>
          </div>
        `;
      }

      if (ex.length) {
        let exRows = ex.map(x => x.is_fresher ? `<tr><td colspan="5"><strong>Fresher (No Prior Experience)</strong></td></tr>` : `
          <tr>
            <td>${x.exp_type || 'Teaching'}</td>
            <td>${x.org_name || 'N/A'}</td>
            <td>${x.designation || 'N/A'}</td>
            <td>${x.total_duration || 'N/A'}</td>
            <td>${x.salary ? '₹' + x.salary : 'N/A'}</td>
          </tr>
        `).join('');

        html += `
          <div class="detail-section">
            <h3 class="detail-section-title">Work Experience</h3>
            <table class="admin-table">
              <thead><tr><th>Type</th><th>Organization</th><th>Designation</th><th>Duration</th><th>Salary</th></tr></thead>
              <tbody>${exRows}</tbody>
            </table>
          </div>
        `;
      }

      if (cert.length) {
        let certRows = cert.map(c => `
          <tr>
            <td>${c.title}</td>
            <td>${c.category || 'NPTEL'}</td>
            <td>${c.organization || 'N/A'}</td>
            <td>${c.score || 'N/A'}</td>
            <td>${c.year || 'N/A'}</td>
            <td>${c.cert_doc ? `<a href="${c.cert_doc}" target="_blank" style="color:#0284c7; font-weight:600;">View Cert</a>` : 'No Cert'}</td>
          </tr>
        `).join('');

        html += `
          <div class="detail-section">
            <h3 class="detail-section-title">Certifications & NPTEL</h3>
            <table class="admin-table">
              <thead><tr><th>Course Title</th><th>Category</th><th>Organization</th><th>Score</th><th>Year</th><th>Document</th></tr></thead>
              <tbody>${certRows}</tbody>
            </table>
          </div>
        `;
      }

      html += `
        <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
          <button type="button" onclick="window.print()" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            📥 Download Application as PDF
          </button>
        </div>
      `;

      appModalContent.innerHTML = html;
    } catch (err) {
      console.error(err);
      appModalContent.innerHTML = `<p class="has-error">Error loading details.</p>`;
    }
  }

  /* ---------------- DROPDOWN MANAGEMENT ---------------- */
  async function loadDropdowns() {
    if (!dropdownCardsGrid) return;
    try {
      const res = await fetch(API_BASE + '/api/admin/dropdowns');
      const data = await res.json();
      if (!data.success) {
        showBanner(data.message || 'Failed to load dropdowns.', 'error');
        return;
      }
      const rawOptions = data.options || data.dropdowns || [];
      if (Array.isArray(rawOptions)) {
        allDropdowns = {};
        rawOptions.forEach(opt => {
          const cat = opt.category || 'other';
          if (!allDropdowns[cat]) allDropdowns[cat] = [];
          allDropdowns[cat].push(opt);
        });
      } else {
        allDropdowns = rawOptions;
      }
      renderDropdownCards();
    } catch (err) {
      console.error('Error loading dropdowns:', err);
      showBanner('Failed to load dropdown options from server.', 'error');
    }
  }

  function renderDropdownCards() {
    if (!dropdownCardsGrid) return;
    dropdownCardsGrid.innerHTML = '';

    const ignoredCats = ['blood_group', 'community', 'religion', 'gender', 'marital_status'];
    const categories = Object.keys(allDropdowns).filter(c => !ignoredCats.includes(c));
    if (categories.length === 0) {
      dropdownCardsGrid.innerHTML = `< p style = "color:#64748b;" > No dropdown categories configured.</p > `;
      return;
    }

    categories.forEach(cat => {
      const items = allDropdowns[cat] || [];
      const card = document.createElement('div');
      card.className = 'cat-card';

      const catTitle = cat.replace(/_/g, ' ');

      let rowsHtml = items.map(item => `
          < div class="opt-row" >
          <div class="opt-info">
            <span class="opt-label">${item.option_label}</span>
            <span class="opt-code">${item.option_value}</span>
          </div>
          <div class="opt-controls">
            <label class="switch">
              <input type="checkbox" class="toggle-opt" data-id="${item.id}" ${item.is_active ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <button type="button" class="btn-icon-del delete-opt" data-id="${item.id}" title="Delete Option">&times;</button>
          </div>
        </div >
          `).join('');

      card.innerHTML = `
          < div class="cat-card-header" >
          <span class="cat-card-title">${catTitle}</span>
          <span class="cat-card-count">${items.length} options</span>
        </div >
          <div class="cat-card-body">
            ${rowsHtml || '<p style="font-size:0.85rem; color:#94a3b8;">No options added yet.</p>'}
          </div>
        `;
      dropdownCardsGrid.appendChild(card);
    });

    // Toggle status listener
    dropdownCardsGrid.querySelectorAll('.toggle-opt').forEach(chk => {
      chk.addEventListener('change', async function () {
        const id = this.dataset.id;
        const active = this.checked ? 1 : 0;
        try {
          const res = await fetch(API_BASE + `/ api / admin / dropdowns / ${id}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: active })
          });
          const data = await res.json();
          if (!data.success) {
            this.checked = !this.checked;
            showBanner(data.message || 'Failed to update option status.', 'error');
          } else {
            showBanner('Dropdown option status updated.', 'success');
          }
        } catch (err) {
          console.error(err);
          this.checked = !this.checked;
          showBanner('Failed to update option.', 'error');
        }
      });
    });

    // Delete listener
    dropdownCardsGrid.querySelectorAll('.delete-opt').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.dataset.id;
        if (!confirm('Are you sure you want to delete this dropdown option?')) return;
        try {
          const res = await fetch(API_BASE + `/api/admin/dropdowns/${id}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (!data.success) {
            showBanner(data.message || 'Failed to delete option.', 'error');
          } else {
            showBanner('Dropdown option deleted successfully.', 'success');
            loadDropdowns();
          }
        } catch (err) {
          console.error(err);
          showBanner('Failed to delete option.', 'error');
        }
      });
    });
  }

  /* ---------------- ADD DROPDOWN OPTION MODAL ---------------- */
  if (btnOpenAddOption) {
    btnOpenAddOption.addEventListener('click', () => {
      if (optModalBackdrop) optModalBackdrop.style.display = 'flex';
    });
  }
  if (closeOptModal) {
    closeOptModal.addEventListener('click', () => {
      if (optModalBackdrop) optModalBackdrop.style.display = 'none';
    });
  }
  if (cancelOptModal) {
    cancelOptModal.addEventListener('click', () => {
      if (optModalBackdrop) optModalBackdrop.style.display = 'none';
    });
  }

  if (addOptForm) {
    addOptForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const cat = document.getElementById('optCategory').value;
      const label = document.getElementById('optLabel').value.trim();
      let val = document.getElementById('optValue').value.trim();

      if (!label) {
        alert('Please enter an option label.');
        return;
      }
      if (!val) {
        val = label.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      }

      try {
        const res = await fetch(API_BASE + '/api/admin/dropdowns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat, option_label: label, option_value: val })
        });
        const data = await res.json();
        if (!data.success) {
          showBanner(data.message || 'Failed to add option.', 'error');
        } else {
          showBanner(`Option "${label}" added successfully!`, 'success');
          if (optModalBackdrop) optModalBackdrop.style.display = 'none';
          addOptForm.reset();
          loadDropdowns();
        }
      } catch (err) {
        console.error(err);
        showBanner('Failed to save new dropdown option.', 'error');
      }
    });
  }

  function updateStats() {
    const statApps = document.getElementById('statApps');
    const statDepts = document.getElementById('statDepts');
    const statInsts = document.getElementById('statInsts');

    if (statApps) statApps.textContent = allApplications.length;

    const uniqueDepts = new Set(allApplications.map(a => a.department).filter(Boolean));
    if (statDepts) statDepts.textContent = uniqueDepts.size;

    const uniqueInsts = new Set();
    allApplications.forEach(app => {
      if (app.institutions) {
        app.institutions.split(/\s*\|\|\s*/).forEach(i => {
          if (i.trim()) uniqueInsts.add(i.trim());
        });
      }
    });
    if (statInsts) statInsts.textContent = uniqueInsts.size;
  }

  // Initial Auth Check
  checkAdminAuth();

})();
