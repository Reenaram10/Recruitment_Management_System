/* ===========================================================
   profileEducation.js
   Tab 2: Education & Documents
   Depends on profileCore.js (must load first).
=========================================================== */
window.initEducationTab = function () {

  const P = window.Profile;

  /* ---------------- Dynamic Institution Names Fetch from Backend ---------------- */
  const collegeSelectIds = ['ugInstitution', 'pgInstitution', 'mphilInstitution', 'phdInstitution'];

  const cachedInstitutions = {
    engineering: [],
    arts: [],
    all: []
  };

  function getInstitutionCategoryForDegree(deg) {
    if (!deg) return 'all';
    const cleanDeg = deg.trim();
    const engineeringDegrees = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech'];
    const artsDegrees = ['B.Sc', 'B.A', 'B.Com', 'B.C.A', 'B.B.A', 'M.Sc', 'M.A', 'M.Com', 'M.C.A', 'M.B.A'];

    if (engineeringDegrees.includes(cleanDeg)) return 'engineering';
    if (artsDegrees.includes(cleanDeg)) return 'arts';
    return 'all';
  }

  function populateInstitutionSelect(selectId, degreeVal) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    const category = getInstitutionCategoryForDegree(degreeVal);
    let list = cachedInstitutions[category];

    if (!list || list.length === 0) {
      list = cachedInstitutions.all.length ? cachedInstitutions.all : [
        'National Engineering College, Kovilpatti',
        'Anna University, Chennai',
        'Indian Institute of Technology Madras (IIT Madras)',
        'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        'PSG College of Technology, Coimbatore',
        'Coimbatore Institute of Technology, Coimbatore',
        'St. Xavier\'s College, Palayamkottai',
        'Manonmaniam Sundaranar University, Tirunelveli',
        'Madurai Kamaraj University, Madurai'
      ];
    }

    const currentVal = sel.value;
    sel.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = !currentVal;
    defaultOpt.textContent = 'Select institution / college';
    sel.appendChild(defaultOpt);

    let matchFound = false;
    list.forEach(function (name) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentVal) {
        opt.selected = true;
        matchFound = true;
      }
      sel.appendChild(opt);
    });

    const otherOpt = document.createElement('option');
    otherOpt.value = 'Other';
    otherOpt.textContent = 'Other (Specify below)';
    if (currentVal === 'Other' || (!matchFound && currentVal)) {
      otherOpt.selected = true;
    }
    sel.appendChild(otherOpt);
  }

  async function fetchAndPopulateInstitutions() {
    try {
      const res = await fetch('/api/institutions');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          cachedInstitutions.engineering = data.engineering || [];
          cachedInstitutions.arts = data.arts || [];
          cachedInstitutions.all = data.institutions || [];
        }
      }
    } catch (err) {
      console.warn('Could not fetch institutions from server:', err);
    }

    const ugDegreeVal = document.getElementById('ugDegree') ? document.getElementById('ugDegree').value : '';
    const pgDegreeVal = document.getElementById('pgDegree') ? document.getElementById('pgDegree').value : '';

    populateInstitutionSelect('ugInstitution', ugDegreeVal);
    populateInstitutionSelect('pgInstitution', pgDegreeVal);
    populateInstitutionSelect('mphilInstitution', '');
    populateInstitutionSelect('phdInstitution', '');
  }

  fetchAndPopulateInstitutions();

  /* ---------------- Dynamic Ph.D Status Fetch ---------------- */
  async function fetchPhdStatuses() {
    const sel = document.getElementById('phdStatus');
    if (!sel) return;

    try {
      const res = await fetch('/api/dropdowns?category=phd_status');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.options) && data.options.length > 0) {
        const currentVal = sel.value;
        sel.innerHTML = '';
        data.options.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.option_value;
          opt.textContent = item.option_label;
          if (item.option_value === currentVal) opt.selected = true;
          sel.appendChild(opt);
        });
      }
    } catch (err) {
      console.warn('Could not fetch phd_status options, using defaults:', err);
    }
  }

  fetchPhdStatuses();

  /* ---------------- Generic "Other" toggle helper ---------------- */
  function setupOtherToggle(selectId, containerId, inputId) {
    const sel = document.getElementById(selectId);
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (!sel || !container) return;

    function sync() {
      const isOther = sel.value === 'Other';
      container.style.display = isOther ? '' : 'none';
      if (!isOther && input) {
        input.value = '';
        P.setError(inputId, inputId + 'Error', '');
      }
    }
    sel.addEventListener('change', sync);
    sync();
  }

  // Medium toggles
  setupOtherToggle('tenthMedium', 'fld-tenthMediumOther', 'tenthMediumOther');
  setupOtherToggle('twelfthMedium', 'fld-twelfthMediumOther', 'twelfthMediumOther');
  setupOtherToggle('ugMedium', 'fld-ugMediumOther', 'ugMediumOther');
  setupOtherToggle('pgMedium', 'fld-pgMediumOther', 'pgMediumOther');
  setupOtherToggle('mphilMedium', 'fld-mphilMediumOther', 'mphilMediumOther');
  setupOtherToggle('phdMedium', 'fld-phdMediumOther', 'phdMediumOther');

  // Institution toggles
  setupOtherToggle('tenthInstitution', 'fld-tenthInstitutionOther', 'tenthInstitutionOther');
  setupOtherToggle('twelfthInstitution', 'fld-twelfthInstitutionOther', 'twelfthInstitutionOther');
  setupOtherToggle('ugInstitution', 'fld-ugInstitutionOther', 'ugInstitutionOther');
  setupOtherToggle('pgInstitution', 'fld-pgInstitutionOther', 'pgInstitutionOther');
  setupOtherToggle('mphilInstitution', 'fld-mphilInstitutionOther', 'mphilInstitutionOther');
  setupOtherToggle('phdInstitution', 'fld-phdInstitutionOther', 'phdInstitutionOther');

  /* ---------------- "Not applicable" toggles for UG/PG/M.Phil/PhD ---------------- */
  const eduBlocks = [
    { prefix: 'tenth', naId: null, block: 'tenthBlock' },
    { prefix: 'twelfth', naId: null, block: 'twelfthBlock' },
    { prefix: 'ug', naId: 'ugNA', block: 'ugBlock' },
    { prefix: 'pg', naId: 'pgNA', block: 'pgBlock' },
    { prefix: 'mphil', naId: 'mphilNA', block: 'mphilBlock' },
    { prefix: 'phd', naId: 'phdNA', block: 'phdBlock' }
  ];

  eduBlocks.forEach(function (b) {
    if (!b.naId) return;
    const naCheckbox = document.getElementById(b.naId);
    const blockEl = document.getElementById(b.block);
    if (!naCheckbox || !blockEl) return;
    naCheckbox.addEventListener('change', function () {
      blockEl.classList.toggle('is-na', naCheckbox.checked);
      ['Percentage', 'Year', 'Medium', 'Attempt', 'Class', 'Institution'].forEach(function (suffix) {
        P.setError(b.prefix + suffix, b.prefix + suffix + 'Error', '');
      });
      P.setError(b.prefix + 'MediumOther', b.prefix + 'MediumOtherError', '');
      P.setError(b.prefix + 'InstitutionOther', b.prefix + 'InstitutionOtherError', '');
      if (b.prefix === 'ug') {
        P.setError('ugDegree', 'ugDegreeError', '');
        P.setError('ugDegreeOther', 'ugDegreeOtherError', '');
        P.setError('ugSpecialization', 'ugSpecializationError', '');
        P.setError('ugSpecializationOther', 'ugSpecializationOtherError', '');
      }
      if (b.prefix === 'pg') {
        P.setError('pgDegree', 'pgDegreeError', '');
        P.setError('pgDegreeOther', 'pgDegreeOtherError', '');
        P.setError('pgSpecialization', 'pgSpecializationError', '');
        P.setError('pgSpecializationOther', 'pgSpecializationOtherError', '');
        P.setError('pgTopic', 'pgTopicError', '');
      }
      if (b.prefix === 'mphil') {
        P.setError('mphilTopic', 'mphilTopicError', '');
      }
      if (b.prefix === 'phd') {
        P.setError('phdTopic', 'phdTopicError', '');
      }
    });
  });

  /* ---------------- UG Degree -> Specialization dependent dropdown ---------------- */
  const ugSpecializationMap = {
    "B.E.": ["Computer Science and Engineering", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology", "Artificial Intelligence and Data Science", "Other"],
    "B.E": ["Computer Science and Engineering", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology", "Artificial Intelligence and Data Science", "Other"],
    "B.Tech.": ["Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Artificial Intelligence and Data Science", "Artificial Intelligence and Machine Learning", "Other"],
    "B.Tech": ["Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Artificial Intelligence and Data Science", "Artificial Intelligence and Machine Learning", "Other"],
    "B.Sc.": ["Computer Science", "Information Technology", "Physics", "Chemistry", "Mathematics", "Biotechnology", "Microbiology", "Statistics", "Botany", "Zoology", "Other"],
    "B.Sc": ["Computer Science", "Information Technology", "Physics", "Chemistry", "Mathematics", "Biotechnology", "Microbiology", "Statistics", "Botany", "Zoology", "Other"],
    "B.A.": ["English Literature", "Tamil Literature", "History", "Economics", "Political Science", "Sociology", "Psychology", "Other"],
    "B.A": ["English Literature", "Tamil Literature", "History", "Economics", "Political Science", "Sociology", "Psychology", "Other"],
    "B.Com.": ["General Commerce", "Accounting and Finance", "Banking and Insurance", "Computer Applications", "Corporate Secretaryship", "Other"],
    "B.Com": ["General Commerce", "Accounting and Finance", "Banking and Insurance", "Computer Applications", "Corporate Secretaryship", "Other"],
    "B.C.A.": ["Computer Applications", "Software Engineering", "Data Science", "Cyber Security", "Other"],
    "B.C.A": ["Computer Applications", "Software Engineering", "Data Science", "Cyber Security", "Other"],
    "B.B.A": ["Business Administration", "Finance", "Marketing", "Other"],
    "Other": ["Other"]
  };

  const ugDegree = document.getElementById('ugDegree');
  const ugDegreeOtherField = document.getElementById('fld-ugDegreeOther');
  const ugDegreeOther = document.getElementById('ugDegreeOther');
  const ugSpecialization = document.getElementById('ugSpecialization');
  const ugSpecializationOtherField = document.getElementById('fld-ugSpecializationOther');
  const ugSpecializationOther = document.getElementById('ugSpecializationOther');

  function fillUgSpecializationOptions(degree) {
    if (!ugSpecialization) return;
    ugSpecialization.innerHTML = '';
    const list = ugSpecializationMap[degree] || [];

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = list.length ? 'Select specialization' : 'Select degree first';
    ugSpecialization.appendChild(placeholder);

    list.forEach(function (label) {
      const opt = document.createElement('option');
      opt.textContent = label;
      ugSpecialization.appendChild(opt);
    });

    ugSpecialization.disabled = !list.length;
  }

  function syncUgDegreeOtherField() {
    const isOther = ugDegree && ugDegree.value === 'Other';
    if (ugDegreeOtherField) {
      ugDegreeOtherField.style.display = isOther ? '' : 'none';
      if (!isOther && ugDegreeOther) ugDegreeOther.value = '';
    }
  }

  function syncUgSpecializationOtherField() {
    const showOther = ugSpecialization && ugSpecialization.value === 'Other';
    if (ugSpecializationOtherField) {
      ugSpecializationOtherField.style.display = showOther ? '' : 'none';
      if (!showOther && ugSpecializationOther) ugSpecializationOther.value = '';
    }
  }

  function syncUgScoreFields() {
    const deg = ugDegree ? ugDegree.value : '';
    const gateFld = document.getElementById('fld-ugGateScore');
    const netFld = document.getElementById('fld-ugNetSletScore');

    const isEngineering = deg === 'B.E.' || deg === 'B.Tech';
    const isArtsScience = deg === 'B.Sc' || deg === 'B.A' || deg === 'B.Com' || deg === 'B.C.A' || deg === 'B.B.A';

    if (gateFld) gateFld.style.display = isEngineering ? '' : 'none';
    if (netFld) netFld.style.display = isArtsScience ? '' : 'none';
  }

  if (ugDegree) {
    ugDegree.addEventListener('change', function () {
      fillUgSpecializationOptions(ugDegree.value);
      populateInstitutionSelect('ugInstitution', ugDegree.value);
      syncUgDegreeOtherField();
      syncUgSpecializationOtherField();
      syncUgScoreFields();
      P.setError('ugDegree', 'ugDegreeError', '');
    });
  }

  if (ugSpecialization) {
    ugSpecialization.addEventListener('change', function () {
      syncUgSpecializationOtherField();
      P.setError('ugSpecialization', 'ugSpecializationError', '');
    });
  }

  fillUgSpecializationOptions('');

  function validateUGDegree(skip) {
    if (skip) return true;
    let ok = true;

    if (!P.required('ugDegree', 'ugDegreeError', 'Degree')) ok = false;

    if (ugDegree && ugDegree.value === 'Other') {
      if (!P.required('ugDegreeOther', 'ugDegreeOtherError', 'Please specify degree')) ok = false;
    }

    if (ugDegree && ugDegree.value) {
      if (!ugSpecialization.value) {
        P.setError('ugSpecialization', 'ugSpecializationError', 'Specialization is required.');
        ok = false;
      } else {
        P.setError('ugSpecialization', 'ugSpecializationError', '');
        if (ugSpecialization.value === 'Other' && !ugSpecializationOther.value.trim()) {
          P.setError('ugSpecializationOther', 'ugSpecializationOtherError', 'Please specify your specialization.');
          ok = false;
        } else {
          P.setError('ugSpecializationOther', 'ugSpecializationOtherError', '');
        }
      }
    }
    return ok;
  }

  /* ---------------- PG Degree -> Specialization dependent dropdown ---------------- */
  const pgSpecializationMap = {
    "M.E.": ["Computer Science and Engineering", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Structural Engineering", "VLSI Design", "Thermal Engineering", "CAD/CAM", "Other"],
    "M.E": ["Computer Science and Engineering", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Structural Engineering", "VLSI Design", "Thermal Engineering", "CAD/CAM", "Other"],
    "M.Tech.": ["Computer Science and Engineering", "Information Technology", "Data Science", "Artificial Intelligence", "Biotechnology", "VLSI & Embedded Systems", "Other"],
    "M.Tech": ["Computer Science and Engineering", "Information Technology", "Data Science", "Artificial Intelligence", "Biotechnology", "VLSI & Embedded Systems", "Other"],
    "M.Sc.": ["Computer Science", "Information Technology", "Physics", "Chemistry", "Mathematics", "Biotechnology", "Microbiology", "Data Analytics", "Other"],
    "M.Sc": ["Computer Science", "Information Technology", "Physics", "Chemistry", "Mathematics", "Biotechnology", "Microbiology", "Data Analytics", "Other"],
    "M.A.": ["English Literature", "Tamil Literature", "History", "Economics", "Sociology", "Psychology", "Other"],
    "M.A": ["English Literature", "Tamil Literature", "History", "Economics", "Sociology", "Psychology", "Other"],
    "M.Com.": ["Commerce", "Accounting and Finance", "Bank Management", "Corporate Governance", "Other"],
    "M.Com": ["Commerce", "Accounting and Finance", "Bank Management", "Corporate Governance", "Other"],
    "M.C.A.": ["Computer Applications", "Software Engineering", "Cloud Computing", "Other"],
    "M.C.A": ["Computer Applications", "Software Engineering", "Cloud Computing", "Other"],
    "M.B.A.": ["Finance", "Marketing", "Human Resource Management", "Systems / Information Technology", "Operations Management", "General Management", "Logistics & Supply Chain", "Other"],
    "M.B.A": ["Finance", "Marketing", "Human Resource Management", "Systems / Information Technology", "Operations Management", "General Management", "Logistics & Supply Chain", "Other"],
    "Other": ["Other"]
  };

  const pgDegree = document.getElementById('pgDegree');
  const pgDegreeOtherField = document.getElementById('fld-pgDegreeOther');
  const pgDegreeOther = document.getElementById('pgDegreeOther');
  const pgSpecialization = document.getElementById('pgSpecialization');
  const pgSpecializationOtherField = document.getElementById('fld-pgSpecializationOther');
  const pgSpecializationOther = document.getElementById('pgSpecializationOther');

  function fillPgSpecializationOptions(degree) {
    if (!pgSpecialization) return;
    pgSpecialization.innerHTML = '';
    const list = pgSpecializationMap[degree] || [];

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = list.length ? 'Select specialization' : 'Select degree first';
    pgSpecialization.appendChild(placeholder);

    list.forEach(function (label) {
      const opt = document.createElement('option');
      opt.textContent = label;
      pgSpecialization.appendChild(opt);
    });

    pgSpecialization.disabled = !list.length;
  }

  function syncPgDegreeOtherField() {
    const isOther = pgDegree && pgDegree.value === 'Other';
    if (pgDegreeOtherField) {
      pgDegreeOtherField.style.display = isOther ? '' : 'none';
      if (!isOther && pgDegreeOther) pgDegreeOther.value = '';
    }
  }

  function syncPgSpecializationOtherField() {
    const showOther = pgSpecialization && pgSpecialization.value === 'Other';
    if (pgSpecializationOtherField) {
      pgSpecializationOtherField.style.display = showOther ? '' : 'none';
      if (!showOther && pgSpecializationOther) pgSpecializationOther.value = '';
    }
  }

  function syncPgScoreFields() {
    const deg = pgDegree ? pgDegree.value : '';
    const gateFld = document.getElementById('fld-pgGateScore');
    const netFld = document.getElementById('fld-pgNetSletScore');

    const isEngineering = deg === 'M.E.' || deg === 'M.Tech';
    const isArtsScience = deg === 'M.Sc' || deg === 'M.A' || deg === 'M.Com' || deg === 'M.C.A' || deg === 'M.B.A';

    if (gateFld) gateFld.style.display = isEngineering ? '' : 'none';
    if (netFld) netFld.style.display = isArtsScience ? '' : 'none';
  }

  if (pgDegree) {
    pgDegree.addEventListener('change', function () {
      fillPgSpecializationOptions(pgDegree.value);
      populateInstitutionSelect('pgInstitution', pgDegree.value);
      syncPgDegreeOtherField();
      syncPgSpecializationOtherField();
      syncPgScoreFields();
      P.setError('pgDegree', 'pgDegreeError', '');
    });
  }

  if (pgSpecialization) {
    pgSpecialization.addEventListener('change', function () {
      syncPgSpecializationOtherField();
      P.setError('pgSpecialization', 'pgSpecializationError', '');
    });
  }

  fillPgSpecializationOptions('');

  function validatePGDegree(skip) {
    if (skip) return true;
    let ok = true;

    if (!P.required('pgDegree', 'pgDegreeError', 'Degree')) ok = false;

    if (pgDegree && pgDegree.value === 'Other') {
      if (!P.required('pgDegreeOther', 'pgDegreeOtherError', 'Please specify degree')) ok = false;
    }

    if (pgDegree && pgDegree.value) {
      if (!pgSpecialization.value) {
        P.setError('pgSpecialization', 'pgSpecializationError', 'Specialization is required.');
        ok = false;
      } else {
        P.setError('pgSpecialization', 'pgSpecializationError', '');
        if (pgSpecialization.value === 'Other' && !pgSpecializationOther.value.trim()) {
          P.setError('pgSpecializationOther', 'pgSpecializationOtherError', 'Please specify your specialization.');
          ok = false;
        } else {
          P.setError('pgSpecializationOther', 'pgSpecializationOtherError', '');
        }
      }
    }
    return ok;
  }

  /* ---------------- Education block validation ---------------- */
  function validateEduBlock(prefix, skip) {
    if (skip) return true;
    let ok = true;

    const pct = document.getElementById(prefix + 'Percentage').value;
    if (pct === '' || pct < 0 || pct > 100) { P.setError(prefix + 'Percentage', prefix + 'PercentageError', 'Enter a valid percentage.'); ok = false; }
    else P.setError(prefix + 'Percentage', prefix + 'PercentageError', '');

    const year = document.getElementById(prefix + 'Year').value;
    if (!year || year < 1970 || year > 2026) { P.setError(prefix + 'Year', prefix + 'YearError', 'Enter a valid year.'); ok = false; }
    else P.setError(prefix + 'Year', prefix + 'YearError', '');

    if (!P.required(prefix + 'Medium', prefix + 'MediumError', 'Medium of study')) ok = false;

    const mediumVal = document.getElementById(prefix + 'Medium').value;
    if (mediumVal === 'Other') {
      if (!P.required(prefix + 'MediumOther', prefix + 'MediumOtherError', 'Please specify medium')) ok = false;
    }

    if (!P.required(prefix + 'Attempt', prefix + 'AttemptError', 'First attempt')) ok = false;
    if (!P.required(prefix + 'Class', prefix + 'ClassError', 'First class')) ok = false;

    const instVal = document.getElementById(prefix + 'Institution').value;
    if (!instVal) {
      P.setError(prefix + 'Institution', prefix + 'InstitutionError', 'Institution / school name is required.');
      ok = false;
    } else {
      P.setError(prefix + 'Institution', prefix + 'InstitutionError', '');
      if (instVal === 'Other') {
        if (!P.required(prefix + 'InstitutionOther', prefix + 'InstitutionOtherError', 'Please specify institution name')) ok = false;
      }
    }

    return ok;
  }

  function validateStep2() {
    let ok = true;
    const ugSkip = document.getElementById('ugNA').checked;
    const pgSkip = document.getElementById('pgNA').checked;
    const mphilSkip = document.getElementById('mphilNA').checked;
    const phdSkip = document.getElementById('phdNA').checked;

    if (!validateEduBlock('tenth', false)) ok = false;
    if (!validateEduBlock('twelfth', false)) ok = false;

    if (!validateEduBlock('ug', ugSkip)) ok = false;
    if (!validateUGDegree(ugSkip)) ok = false;

    if (!validateEduBlock('pg', pgSkip)) ok = false;
    if (!validatePGDegree(pgSkip)) ok = false;

    if (!validateEduBlock('mphil', mphilSkip)) ok = false;
    if (!validateEduBlock('phd', phdSkip)) ok = false;

    return ok;
  }

  /* ---------------- Document uploads UI ---------------- */
  const fileIds = ['tenthDoc', 'twelfthDoc', 'ugDoc', 'pgDoc', 'mphilDoc', 'phdDoc', 'idProofDoc'];
  fileIds.forEach(function (id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('change', function () {
      const nameEl = document.getElementById(id + 'Name');
      if (nameEl) nameEl.textContent = input.files.length ? input.files[0].name : 'No file selected';
      const wrap = document.getElementById('fld-' + id);
      if (wrap) wrap.classList.remove('has-error');
      P.setError(null, id + 'Error', '');
    });
  });

  /* ---------------- Save Education Data to MySQL API ---------------- */
  async function saveEducationToBackend() {
    const formData = new FormData();
    formData.append('user_email', P.regEmail);

    const prefixes = ['tenth', 'twelfth', 'ug', 'pg', 'mphil', 'phd'];
    prefixes.forEach(function (prefix) {
      const naCheckbox = document.getElementById(prefix + 'NA');
      const isNA = naCheckbox ? naCheckbox.checked : false;
      formData.append(prefix + 'NA', isNA);

      if (!isNA) {
        const fields = [
          'Percentage', 'Year', 'Medium', 'MediumOther', 'Attempt', 'Class',
          'Degree', 'DegreeOther', 'Specialization', 'SpecializationOther', 'Topic',
          'Institution', 'InstitutionOther', 'GateScore', 'NetSletScore'
        ];

        fields.forEach(function (f) {
          const el = document.getElementById(prefix + f);
          if (el && el.value !== undefined) {
            formData.append(prefix + f, el.value.trim());
          }
        });
      }

      const docInput = document.getElementById(prefix + 'Doc');
      if (docInput && docInput.files.length > 0) {
        formData.append(prefix + 'Doc', docInput.files[0]);
      }
    });

    // Append Ph.D specific detailed attributes if Ph.D section is present
    const phdExtraFields = [
      'phdStatus', 'phdYearRegistration', 'phdGuideName', 'phdGuideCollege',
      'phdPublicationsDuring', 'phdPublicationsPost', 'phdPostExperience'
    ];
    phdExtraFields.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.value !== undefined) {
        formData.append(id, el.value.trim());
      }
    });

    const idProofInput = document.getElementById('idProofDoc');
    if (idProofInput && idProofInput.files.length > 0) {
      formData.append('idProofDoc', idProofInput.files[0]);
    }

    try {
      const res = await fetch('/api/education', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!result.success) {
        P.showBanner(result.message || 'Failed to save education details to MySQL.', 'error');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving education details:', err);
      // Gracefully handle if server connection error
      return true;
    }
  }

  /* ---------------- Navigation: Tab 2 <-> Tab 1 / Tab 3 ---------------- */
  document.getElementById('backTo1').addEventListener('click', function () { P.goToStep(1); });

  document.getElementById('toStep3').addEventListener('click', async function () {
    const eduOk = validateStep2();
    if (!eduOk) {
      P.showBanner('Please fill all required education fields before continuing.', 'error');
      return;
    }

    const saved = await saveEducationToBackend();
    if (saved) {
      P.setMaxCompleted(2);
      P.goToStep(3);
    }
  });

  window.populateEducationTab = function (educationList, phdDetails) {
    if (Array.isArray(educationList) && educationList.length > 0) {
      educationList.forEach(function (item) {
        const prefix = item.qual_type;
        if (!prefix) return;

        if (item.is_na) {
          const naCheckbox = document.getElementById(prefix + 'NA');
          if (naCheckbox) {
            naCheckbox.checked = true;
            naCheckbox.dispatchEvent(new Event('change'));
          }
        }

        const setVal = function (id, val) {
          const el = document.getElementById(id);
          if (el && val !== undefined && val !== null) {
            el.value = val;
            el.dispatchEvent(new Event('change'));
          }
        };

        setVal(prefix + 'Percentage', item.percentage);
        setVal(prefix + 'Year', item.year_of_passing);
        setVal(prefix + 'Medium', item.medium);
        setVal(prefix + 'MediumOther', item.medium_other);
        setVal(prefix + 'Attempt', item.first_attempt);
        setVal(prefix + 'Class', item.first_class);

        if (prefix === 'ug') {
          setVal('ugDegree', item.degree);
          fillUgSpecializationOptions(item.degree || '');
          setVal('ugSpecialization', item.specialization);
          setVal('ugDegreeOther', item.degree_other);
          setVal('ugSpecializationOther', item.specialization_other);
          setVal('ugGateScore', item.ug_gate_score);
          setVal('ugNetSletScore', item.ug_net_slet_score);
        } else if (prefix === 'pg') {
          setVal('pgDegree', item.degree);
          fillPgSpecializationOptions(item.degree || '');
          setVal('pgSpecialization', item.specialization);
          setVal('pgDegreeOther', item.degree_other);
          setVal('pgSpecializationOther', item.specialization_other);
          setVal('pgGateScore', item.ug_gate_score);
          setVal('pgNetSletScore', item.ug_net_slet_score);
        }

        setVal(prefix + 'Institution', item.institution_name);
        setVal(prefix + 'InstitutionOther', item.institution_other);
        setVal(prefix + 'Topic', item.topic);

        if (item.cert_path) {
          const docNameEl = document.getElementById(prefix + 'DocName');
          if (docNameEl) docNameEl.textContent = item.cert_path.split('/').pop() || 'File saved';
        }
      });
    }

    if (phdDetails) {
      const setVal = function (id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) {
          el.value = val;
          el.dispatchEvent(new Event('change'));
        }
      };
      setVal('phdStatus', phdDetails.status);
      setVal('phdYearRegistration', phdDetails.year_of_registration);
      setVal('phdYear', phdDetails.year_of_completion);
      setVal('phdGuideName', phdDetails.guide_name);
      setVal('phdGuideCollege', phdDetails.guide_college);
      setVal('phdPublicationsDuring', phdDetails.no_of_publications_during_phd);
      setVal('phdPublicationsPost', phdDetails.no_of_publications_post_phd);
      setVal('phdPostExperience', phdDetails.post_phd_experience);
    }
  };

};
