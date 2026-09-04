/* ===========================================================
   profileCertifications.js
   Tab 4: Certifications & NPTEL
   Depends on profileCore.js (must load first).
=========================================================== */
window.initCertificationsTab = function () {

    const P = window.Profile;
    const wrap = document.getElementById('certificationsWrap');
    const addBtn = document.getElementById('addCertBtn');
    let certCounter = 0;

    function createCertRow() {
        certCounter++;
        const rowId = certCounter;

        const div = document.createElement('div');
        div.className = 'cert-card form-section';
        div.style.position = 'relative';
        div.style.padding = '1.25rem';
        div.style.marginBottom = '1.25rem';
        div.style.border = '1px solid var(--border-color, #e2e8f0)';
        div.style.borderRadius = '8px';
        div.style.background = 'var(--card-bg, #ffffff)';
        div.dataset.certId = rowId;

        div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid #f1f5f9;">
        <h4 style="margin:0; font-size:1.05rem; color:var(--text-main, #1e293b); font-weight:600;">
          Certification Entry #${rowId}
        </h4>
        <button type="button" class="btn-remove-cert" style="background:none; border:none; color:#ef4444; font-size:0.875rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:0.25rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          Remove
        </button>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Course Title / Certification Name *</label>
          <input type="text" class="cert-title" placeholder="e.g. Deep Learning / Cloud Computing">
          <div class="field-error cert-title-error"></div>
        </div>
        <div class="field">
          <label>Score / Percentage *</label>
          <input type="text" class="cert-score" placeholder="e.g. 88% or Score: 78/100">
          <div class="field-error cert-score-error"></div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:0.75rem;">
        <div class="field">
          <label>Category *</label>
          <select class="cert-category">
            <option value="" disabled selected>Select category</option>
            <option value="Gold">Gold</option>
            <option value="Elite">Elite</option>
            <option value="Elite+Silver">Elite+Silver</option>
            <option value="Successfully Completed">Successfully Completed</option>
            <option value="Other">Other</option>
          </select>
          <div class="field-error cert-category-error"></div>
        </div>
        <div class="field">
          <label>Issuing Organization / Institute *</label>
          <input type="text" class="cert-org" placeholder="e.g. NPTEL / IIT Kharagpur, IIT Madras">
          <div class="field-error cert-org-error"></div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:0.75rem;">
        <div class="field">
          <label>Year of Completion *</label>
          <input type="number" class="cert-year" min="1990" max="2026" placeholder="e.g. 2024">
          <div class="field-error cert-year-error"></div>
        </div>
        <div class="field file-field">
          <label>Certificate Upload <span class="hint">(optional)</span></label>
          <input type="file" class="cert-doc" accept=".pdf,.jpg,.jpeg,.png">
          <div class="file-info" style="font-size:0.8rem; color:#64748b; margin-top:0.25rem;">No file chosen</div>
        </div>
      </div>
    `;

        const removeBtn = div.querySelector('.btn-remove-cert');
        removeBtn.addEventListener('click', function () {
            if (wrap.querySelectorAll('.cert-card').length > 1) {
                div.remove();
                updateRemoveButtonsVisibility();
            } else {
                P.showBanner('At least one certification entry is required, or clear fields if not applicable.', 'error');
            }
        });

        const fileInput = div.querySelector('.cert-doc');
        const fileInfo = div.querySelector('.file-info');
        fileInput.addEventListener('change', function () {
            fileInfo.textContent = fileInput.files.length ? fileInput.files[0].name : 'No file chosen';
        });

        wrap.appendChild(div);
        updateRemoveButtonsVisibility();
    }

    function updateRemoveButtonsVisibility() {
        const cards = wrap.querySelectorAll('.cert-card');
        cards.forEach(function (card) {
            const btn = card.querySelector('.btn-remove-cert');
            if (btn) btn.style.display = cards.length > 1 ? 'inline-flex' : 'none';
        });
    }

    // Create initial certification row
    if (wrap && wrap.children.length === 0) {
        createCertRow();
    }

    if (addBtn) {
        addBtn.addEventListener('click', function () {
            createCertRow();
        });
    }

    function validateCertifications() {
        let ok = true;
        const cards = wrap.querySelectorAll('.cert-card');

        cards.forEach(function (card) {
            const titleInput = card.querySelector('.cert-title');
            const titleErr = card.querySelector('.cert-title-error');
            const scoreInput = card.querySelector('.cert-score');
            const scoreErr = card.querySelector('.cert-score-error');
            const catSelect = card.querySelector('.cert-category');
            const catErr = card.querySelector('.cert-category-error');
            const orgInput = card.querySelector('.cert-org');
            const orgErr = card.querySelector('.cert-org-error');
            const yearInput = card.querySelector('.cert-year');
            const yearErr = card.querySelector('.cert-year-error');

            if (!titleInput.value.trim()) {
                titleErr.textContent = 'Title is required.';
                titleInput.classList.add('has-error');
                ok = false;
            } else {
                titleErr.textContent = '';
                titleInput.classList.remove('has-error');
            }

            if (!scoreInput.value.trim()) {
                scoreErr.textContent = 'Score is required.';
                scoreInput.classList.add('has-error');
                ok = false;
            } else {
                scoreErr.textContent = '';
                scoreInput.classList.remove('has-error');
            }

            if (!catSelect.value) {
                catErr.textContent = 'Select category.';
                catSelect.classList.add('has-error');
                ok = false;
            } else {
                catErr.textContent = '';
                catSelect.classList.remove('has-error');
            }

            if (!orgInput.value.trim()) {
                orgErr.textContent = 'Organization is required.';
                orgInput.classList.add('has-error');
                ok = false;
            } else {
                orgErr.textContent = '';
                orgInput.classList.remove('has-error');
            }

            const yearVal = yearInput.value ? parseInt(yearInput.value) : 0;
            if (!yearVal || yearVal < 1990 || yearVal > 2026) {
                yearErr.textContent = 'Valid year required.';
                yearInput.classList.add('has-error');
                ok = false;
            } else {
                yearErr.textContent = '';
                yearInput.classList.remove('has-error');
            }
        });

        return ok;
    }

    async function saveCertificationsToBackend() {
        const formData = new FormData();
        formData.append('user_email', P.regEmail);

        const cards = wrap.querySelectorAll('.cert-card');
        const entries = [];

        cards.forEach(function (card, index) {
            entries.push({
                title: card.querySelector('.cert-title').value.trim(),
                score: card.querySelector('.cert-score').value.trim(),
                category: card.querySelector('.cert-category').value,
                organization: card.querySelector('.cert-org').value.trim(),
                year: card.querySelector('.cert-year').value
            });

            const fileInput = card.querySelector('.cert-doc');
            if (fileInput && fileInput.files.length > 0) {
                formData.append(`certDoc_${index}`, fileInput.files[0]);
            }
        });

        formData.append('entries', JSON.stringify(entries));

        try {
            const res = await fetch('/api/certifications', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (!result.success) {
                P.showBanner(result.message || 'Failed to save certifications to MySQL.', 'error');
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error saving certifications:', err);
            return true;
        }
    }

    /* ---------------- Navigation Buttons ---------------- */
    const backTo3 = document.getElementById('backTo3');
    if (backTo3) {
        backTo3.addEventListener('click', function () {
            P.goToStep(3);
        });
    }

    const finishBtn = document.getElementById('finishProfile');
    if (finishBtn) {
        finishBtn.addEventListener('click', async function () {
            if (!validateCertifications()) {
                P.showBanner('Please complete all required certification fields correctly.', 'error');
                return;
            }

            const saved = await saveCertificationsToBackend();
            if (saved) {
                P.finishAll();
            }
        });
    }

    window.populateCertificationsTab = function (certificationsList) {
        if (!Array.isArray(certificationsList) || certificationsList.length === 0) return;

        if (wrap) wrap.innerHTML = '';
        certCounter = 0;

        certificationsList.forEach(function (c) {
            createCertRow();
            const card = wrap.querySelector('.cert-card:last-child');
            if (!card) return;

            if (c.title) card.querySelector('.cert-title').value = c.title;
            if (c.score) card.querySelector('.cert-score').value = c.score;
            if (c.category) card.querySelector('.cert-category').value = c.category;
            if (c.organization) card.querySelector('.cert-org').value = c.organization;
            if (c.year) card.querySelector('.cert-year').value = c.year;

            if (c.cert_doc) {
                const info = card.querySelector('.file-info');
                if (info) info.textContent = c.cert_doc.split('/').pop() || 'File saved';
            }
        });
    };

};
