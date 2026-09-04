/* ===========================================================
   profileExperience.js
   Tab 3: Work Experience
   Depends on profileCore.js (must load first).
=========================================================== */
window.initExperienceTab = function () {

  const P = window.Profile;

  const experienceWrap = document.getElementById('experienceWrap');
  const experienceSection = document.getElementById('experienceSection');
  const fresherCheck = document.getElementById('fresherCheck');
  const totalExperienceEl = document.getElementById('totalExperience');
  let expRowSeq = 0;

  function expRowTemplate(rowId) {
    return (
      '<div class="exp-row" data-row-id="' + rowId + '">' +
      '<div class="exp-row-grid">' +
      '<div class="field">' +
      '<label>Type *</label>' +
      '<select class="exp-type">' +
      '<option value="" disabled selected>Select</option>' +
      '<option>Academic</option>' +
      '<option>Industry</option>' +
      '</select>' +
      '<div class="field-error"></div>' +
      '</div>' +
      '<div class="field">' +
      '<label>Organization Name *</label>' +
      '<input type="text" class="exp-org" placeholder="Institution / company name">' +
      '<div class="field-error"></div>' +
      '</div>' +
      '<div class="field">' +
      '<label>From *</label>' +
      '<input type="date" class="exp-from">' +
      '<div class="field-error"></div>' +
      '</div>' +
      '<div class="field">' +
      '<label>To *</label>' +
      '<input type="date" class="exp-to">' +
      '<div class="field-error"></div>' +
      '</div>' +
      '<div class="field">' +
      '<label>Total</label>' +
      '<input type="text" class="exp-total" placeholder="Auto" readonly>' +
      '</div>' +
      '<div class="field">' +
      '<label>Designation *</label>' +
      '<input type="text" class="exp-designation" placeholder="e.g. Assistant Professor">' +
      '<div class="field-error"></div>' +
      '</div>' +
      '<div class="field">' +
      '<label>Salary (₹/month) *</label>' +
      '<input type="number" class="exp-salary" min="0" placeholder="e.g. 45000">' +
      '<div class="field-error"></div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="exp-remove" title="Remove this entry">✕</button>' +
      '</div>'
    );
  }

  function calcDuration(fromVal, toVal) {
    if (!fromVal || !toVal) return null;
    const from = new Date(fromVal);
    const to = new Date(toVal);
    if (isNaN(from) || isNaN(to) || to < from) return null;
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) months -= 1;
    if (months < 0) months = 0;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let label = '';
    if (years) label += years + (years === 1 ? ' yr ' : ' yrs ');
    label += remMonths + (remMonths === 1 ? ' mo' : ' mos');
    return { months: months, label: label.trim() };
  }

  function updateRemoveButtons() {
    const rows = experienceWrap.querySelectorAll('.exp-row');
    rows.forEach(function (row) {
      row.querySelector('.exp-remove').disabled = rows.length <= 1;
    });
  }

  function updateGrandTotal() {
    let totalMonths = 0;
    experienceWrap.querySelectorAll('.exp-row').forEach(function (row) {
      const dur = calcDuration(row.querySelector('.exp-from').value, row.querySelector('.exp-to').value);
      if (dur) totalMonths += dur.months;
    });
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    totalExperienceEl.value = totalMonths === 0 ? '' : (years + (years === 1 ? ' yr ' : ' yrs ') + months + (months === 1 ? ' mo' : ' mos')).trim();
  }

  function wireRow(row) {
    const fromInput = row.querySelector('.exp-from');
    const toInput = row.querySelector('.exp-to');
    const totalInput = row.querySelector('.exp-total');

    function refreshTotal() {
      const dur = calcDuration(fromInput.value, toInput.value);
      totalInput.value = dur ? dur.label : '';
      updateGrandTotal();
    }
    fromInput.addEventListener('change', refreshTotal);
    toInput.addEventListener('change', refreshTotal);

    row.querySelector('.exp-remove').addEventListener('click', function () {
      if (experienceWrap.querySelectorAll('.exp-row').length <= 1) return;
      row.remove();
      updateRemoveButtons();
      updateGrandTotal();
    });
  }

  function addExpRow() {
    expRowSeq += 1;
    experienceWrap.insertAdjacentHTML('beforeend', expRowTemplate(expRowSeq));
    const row = experienceWrap.querySelector('[data-row-id="' + expRowSeq + '"]');
    wireRow(row);
    updateRemoveButtons();
  }

  document.getElementById('addExperience').addEventListener('click', addExpRow);
  addExpRow(); // start with one blank row

  fresherCheck.addEventListener('change', function () {
    experienceSection.classList.toggle('is-disabled', fresherCheck.checked);
    if (fresherCheck.checked) {
      experienceWrap.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
      experienceWrap.querySelectorAll('.has-error').forEach(function (el) { el.classList.remove('has-error'); });
    }
  });

  function setRowError(inputEl, message) {
    inputEl.classList.toggle('has-error', !!message);
    const err = inputEl.parentElement.querySelector('.field-error');
    if (err) err.textContent = message || '';
  }

  function validateExperience() {
    if (fresherCheck.checked) return true;

    let ok = true;
    const rows = experienceWrap.querySelectorAll('.exp-row');
    rows.forEach(function (row) {
      const typeEl = row.querySelector('.exp-type');
      const orgEl = row.querySelector('.exp-org');
      const fromEl = row.querySelector('.exp-from');
      const toEl = row.querySelector('.exp-to');
      const designationEl = row.querySelector('.exp-designation');
      const salaryEl = row.querySelector('.exp-salary');

      if (!typeEl.value) { setRowError(typeEl, 'Required.'); ok = false; } else setRowError(typeEl, '');
      if (!orgEl.value.trim()) { setRowError(orgEl, 'Required.'); ok = false; } else setRowError(orgEl, '');
      if (!fromEl.value) { setRowError(fromEl, 'Required.'); ok = false; } else setRowError(fromEl, '');

      if (!toEl.value) { setRowError(toEl, 'Required.'); ok = false; }
      else if (fromEl.value && toEl.value < fromEl.value) { setRowError(toEl, '"To" must be after "From".'); ok = false; }
      else setRowError(toEl, '');

      if (!designationEl.value.trim()) { setRowError(designationEl, 'Required.'); ok = false; } else setRowError(designationEl, '');

      const salary = salaryEl.value;
      if (salary === '' || salary < 0) { setRowError(salaryEl, 'Required.'); ok = false; } else setRowError(salaryEl, '');
    });
    return ok;
  }

  /* ---------------- Save Experience Data to MySQL API ---------------- */
  async function saveExperienceToBackend() {
    const isFresher = fresherCheck.checked;
    const entries = [];

    if (!isFresher) {
      const rows = experienceWrap.querySelectorAll('.exp-row');
      rows.forEach(function (row) {
        entries.push({
          type: row.querySelector('.exp-type').value,
          org: row.querySelector('.exp-org').value.trim(),
          from: row.querySelector('.exp-from').value,
          to: row.querySelector('.exp-to').value,
          total: row.querySelector('.exp-total').value,
          designation: row.querySelector('.exp-designation').value.trim(),
          salary: row.querySelector('.exp-salary').value
        });
      });
    }

    try {
      const res = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: P.regEmail,
          is_fresher: isFresher,
          entries: entries
        })
      });
      const result = await res.json();
      if (!result.success) {
        P.showBanner(result.message || 'Failed to save experience details to MySQL.', 'error');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving experience info to API:', err);
      return true;
    }
  }

  /* ---------------- Navigation: Tab 3 <-> Tab 2 / Tab 4 ---------------- */
  document.getElementById('backTo2').addEventListener('click', function () { P.goToStep(2); });

  const toStep4Btn = document.getElementById('toStep4') || document.getElementById('finishProfile');
  if (toStep4Btn) {
    toStep4Btn.addEventListener('click', async function () {
      if (!validateExperience()) {
        P.showBanner('Please complete every experience entry, or tick "I am a fresher" if you have none.', 'error');
        return;
      }

      const saved = await saveExperienceToBackend();
      if (saved) {
        P.setMaxCompleted(3);
        P.goToStep(4);
      }
    });
  }

  window.populateExperienceTab = function (experienceList) {
    if (!Array.isArray(experienceList) || experienceList.length === 0) return;

    const fresherRow = experienceList.find(e => e.is_fresher);
    if (fresherRow && fresherRow.is_fresher) {
      fresherCheck.checked = true;
      fresherCheck.dispatchEvent(new Event('change'));
      return;
    }

    fresherCheck.checked = false;
    fresherCheck.dispatchEvent(new Event('change'));

    experienceWrap.innerHTML = '';
    expRowSeq = 0;

    experienceList.forEach(function (e) {
      addExpRow();
      const row = experienceWrap.querySelector('.exp-row:last-child');
      if (!row) return;

      if (e.exp_type) row.querySelector('.exp-type').value = e.exp_type;
      if (e.org_name) row.querySelector('.exp-org').value = e.org_name;
      if (e.from_date) row.querySelector('.exp-from').value = e.from_date.split('T')[0];
      if (e.to_date) row.querySelector('.exp-to').value = e.to_date.split('T')[0];
      if (e.designation) row.querySelector('.exp-designation').value = e.designation;
      if (e.salary) row.querySelector('.exp-salary').value = e.salary;

      row.querySelector('.exp-from').dispatchEvent(new Event('change'));
    });
  };

};
