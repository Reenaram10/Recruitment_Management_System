/* ===========================================================
   profileCore.js
   Shared state + helpers used by every tab:
     - profilePersonal.js    (Tab 1: Personal Info)
     - profileEducation.js   (Tab 2: Education & Documents)
     - profileExperience.js  (Tab 3: Work Experience)
   Must be loaded BEFORE the three tab scripts.
=========================================================== */
window.Profile = (function () {

  /* ---------------------------------------------------------
     This page reads ?email= & ?dept= from the URL, passed by
     index.html after registration. Replace with real session
     handling (server-side auth) in production.
  --------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const regEmail = params.get('email') || '';
  const regDept = params.get('dept') || '';

  /* ---------------- Banner ---------------- */
  const banner = document.getElementById('banner');
  function hideBanner() { banner.className = 'banner'; banner.textContent = ''; }
  function showBanner(msg, type) { banner.textContent = msg; banner.className = 'banner is-visible ' + type; }

  /* ---------------- Generic field validation helpers ---------------- */
  function setError(inputId, errorId, message) {
    const el = document.getElementById(inputId);
    if (el) el.classList.toggle('has-error', !!message);
    const err = document.getElementById(errorId);
    if (err) err.textContent = message || '';
  }

  function required(id, errId, label) {
    const val = document.getElementById(id).value.trim();
    if (!val) { setError(id, errId, label + ' is required.'); return false; }
    setError(id, errId, '');
    return true;
  }

  function optionalPattern(id, errId, pattern, message) {
    const val = document.getElementById(id).value.trim();
    if (val && !pattern.test(val)) { setError(id, errId, message); return false; }
    setError(id, errId, '');
    return true;
  }

  /* ---------------- Stepper ----------------
     NOTE: panel1/panel2/panel3/panelDone live in separate fragment
     files (tab_personal.html, tab_education.html, tab_experience.html,
     tab_done.html) that profileApp.js fetches and injects into the
     DOM at load time. So this lookup — and all the stepper wiring
     below — must run AFTER that injection, via initStepper(),
     not at module-load time.
  --------------------------------------------------------- */
  let panels = {};
  let doneStep = null;
  let stepNodes = [];
  let stepLines = [];
  let currentStep = 1;
  let maxCompleted = 0;

  function renderStepper() {
    stepNodes.forEach(function (node) {
      const n = parseInt(node.dataset.step, 10);
      node.classList.toggle('is-active', n === currentStep);
      node.classList.toggle('is-complete', n <= maxCompleted);
    });
    stepLines.forEach(function (line) {
      const n = parseInt(line.dataset.line, 10);
      line.classList.toggle('is-complete', n <= maxCompleted);
    });
  }

  function goToStep(step) {
    Object.keys(panels).forEach(function (key) {
      panels[key].classList.toggle('is-active', parseInt(key, 10) === step);
    });
    doneStep.classList.remove('is-active');
    currentStep = step;
    hideBanner();
    renderStepper();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setMaxCompleted(step) {
    maxCompleted = Math.max(maxCompleted, step);
    renderStepper();
  }

  function finishAll() {
    maxCompleted = Object.keys(panels).length;
    renderStepper();
    Object.values(panels).forEach(function (p) { p.classList.remove('is-active'); });
    doneStep.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initStepper() {
    panels = {
      1: document.getElementById('panel1'),
      2: document.getElementById('panel2'),
      3: document.getElementById('panel3'),
      4: document.getElementById('panel4')
    };
    doneStep = document.getElementById('panelDone');
    stepNodes = document.querySelectorAll('.step-node');
    stepLines = document.querySelectorAll('.step-line');

    stepNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        const target = parseInt(node.dataset.step, 10);
        if (target <= maxCompleted + 1 && target < currentStep) goToStep(target);
      });
    });

    renderStepper();
  }

  /* ---------------- Public API shared across tab scripts ---------------- */
  return {
    regEmail: regEmail,
    regDept: regDept,
    showBanner: showBanner,
    hideBanner: hideBanner,
    setError: setError,
    required: required,
    optionalPattern: optionalPattern,
    initStepper: initStepper,
    goToStep: goToStep,
    setMaxCompleted: setMaxCompleted,
    finishAll: finishAll
  };

})();
