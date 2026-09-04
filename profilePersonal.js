/* ===========================================================
   profilePersonal.js
   Tab 1: Personal Information
   Depends on profileCore.js (must load first).
=========================================================== */
window.initPersonalTab = function () {

  const P = window.Profile;

  /* ---------------- Department (locked, set at registration) ---------------- */
  const departmentOptions = [
    { code: "IT", label: "Information Technology" },
    { code: "CSE", label: "Computer Science & Engineering" },
    { code: "ECE", label: "Electronics & Communication" },
    { code: "EEE", label: "Electrical & Electronics" },
    { code: "MECH", label: "Mechanical Engineering" },
    { code: "CIVIL", label: "Civil Engineering" },
    { code: "AIDS", label: "AI & Data Science" },
    { code: "MATHS", label: "Mathematics" },
    { code: "PHYSICS", label: "Physics" },
    { code: "CHEMISTRY", label: "Chemistry" },
    { code: "TAMIL", label: "Tamil" },
    { code: "ENGLISH", label: "English" },
    { code: "NON-TEACHING", label: "Non-Teaching Staff" },
    { code: "ADMINISTRATION", label: "Administration" }
  ];

  const profDept = document.getElementById('profDept');
  if (profDept) {
    departmentOptions.forEach(function (d) {
      const opt = document.createElement('option');
      opt.value = d.code;
      opt.textContent = d.label;
      if (d.code === P.regDept) opt.selected = true;
      profDept.appendChild(opt);
    });
    if (!P.regDept) {
      const opt = document.createElement('option');
      opt.textContent = 'Not set';
      opt.selected = true;
      profDept.insertBefore(opt, profDept.firstChild);
    }
  }

  const signedInAs = document.getElementById('signedInAs');
  if (signedInAs) {
    signedInAs.textContent = P.regEmail ? ('Signed in as ' + P.regEmail) : '';
  }

  const emailInput = document.getElementById('email');
  if (emailInput && P.regEmail && !emailInput.value) {
    emailInput.value = P.regEmail;
  }

  /* ---------------- State dropdown ---------------- */
  const states = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"];

  const stateSelect = document.getElementById('state');
  if (stateSelect) {
    const blankOpt = document.createElement('option');
    blankOpt.value = ''; blankOpt.disabled = true; blankOpt.textContent = 'Select state';
    stateSelect.appendChild(blankOpt);
    states.forEach(function (s) {
      const opt = document.createElement('option');
      opt.textContent = s;
      if (s === 'Tamil Nadu') opt.selected = true;
      stateSelect.appendChild(opt);
    });
  }

  /* ---------------- Dynamic Dropdowns Fetch from API ---------------- */
  async function populateDynamicDropdowns() {
    try {
      const res = await fetch('/api/dropdowns');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.dropdowns) return;

      const d = data.dropdowns;

      const fieldMap = [
        { id: 'post', list: d.post, placeholder: 'Select post' },
        { id: 'gender', list: d.gender, placeholder: 'Select' },
        { id: 'bloodGroup', list: d.blood_group, placeholder: 'Select' },
        { id: 'maritalStatus', list: d.marital_status, placeholder: 'Select' },
        { id: 'religion', list: d.religion, placeholder: 'Select religion' },
        { id: 'community', list: d.community, placeholder: 'Select community' }
      ];

      fieldMap.forEach(f => {
        const sel = document.getElementById(f.id);
        if (!sel || !Array.isArray(f.list) || f.list.length === 0) return;

        const currentVal = sel.value;
        sel.innerHTML = '';

        const defaultOpt = document.createElement('option');
        defaultOpt.value = ''; defaultOpt.disabled = true; defaultOpt.selected = true;
        defaultOpt.textContent = f.placeholder;
        sel.appendChild(defaultOpt);

        f.list.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.value;
          opt.textContent = item.label;
          if (item.value === currentVal) opt.selected = true;
          sel.appendChild(opt);
        });
      });
    } catch (err) {
      console.warn('Could not load dynamic dropdowns for personal tab, using default HTML options:', err);
    }
  }

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

  setupOtherToggle('post', 'fld-postOther', 'postOther');
  setupOtherToggle('gender', 'fld-genderOther', 'genderOther');
  setupOtherToggle('bloodGroup', 'fld-bloodGroupOther', 'bloodGroupOther');
  setupOtherToggle('religion', 'fld-religionOther', 'religionOther');
  setupOtherToggle('community', 'fld-communityOther', 'communityOther');

  /* ---------------- Marital status & Spouse / Other ---------------- */
  const maritalStatusSelect = document.getElementById('maritalStatus');
  const spouseNameField = document.getElementById('fld-spouseName');
  const maritalStatusOtherField = document.getElementById('fld-maritalStatusOther');

  function syncMaritalStatus() {
    if (!maritalStatusSelect) return;
    const val = maritalStatusSelect.value;
    if (spouseNameField) {
      spouseNameField.style.display = val === 'Married' ? '' : 'none';
      if (val !== 'Married') document.getElementById('spouseName').value = '';
    }
    if (maritalStatusOtherField) {
      maritalStatusOtherField.style.display = val === 'Other' ? '' : 'none';
      if (val !== 'Other') document.getElementById('maritalStatusOther').value = '';
    }
  }
  if (maritalStatusSelect) {
    maritalStatusSelect.addEventListener('change', syncMaritalStatus);
    syncMaritalStatus();
  }

  /* ---------------- Same-as-permanent address ---------------- */
  const permanentAddress = document.getElementById('permanentAddress');
  const communicationAddress = document.getElementById('communicationAddress');
  const sameAsPermanent = document.getElementById('sameAsPermanent');

  if (sameAsPermanent && permanentAddress && communicationAddress) {
    sameAsPermanent.addEventListener('change', function () {
      if (sameAsPermanent.checked) {
        communicationAddress.value = permanentAddress.value;
        communicationAddress.disabled = true;
      } else {
        communicationAddress.disabled = false;
      }
    });
    permanentAddress.addEventListener('input', function () {
      if (sameAsPermanent.checked) communicationAddress.value = permanentAddress.value;
    });
  }

  /* ---------------- Photo file field handling ---------------- */
  const photoInput = document.getElementById('photoDoc');
  if (photoInput) {
    photoInput.addEventListener('change', function () {
      const nameEl = document.getElementById('photoDocName');
      if (nameEl) nameEl.textContent = photoInput.files.length ? photoInput.files[0].name : 'No photo selected';
      document.getElementById('fld-photoDoc').classList.remove('has-error');
      P.setError(null, 'photoDocError', '');
    });
  }

  /* ---------------- Step 1 validation ---------------- */
  function validateStep1() {
    let ok = true;

    // Application & Staff Details
    const appliedDate = document.getElementById('appliedDate').value;
    if (!appliedDate) { P.setError('appliedDate', 'appliedDateError', 'Applied date is required.'); ok = false; }
    else P.setError('appliedDate', 'appliedDateError', '');

    if (!P.required('post', 'postError', 'Post applied for')) ok = false;
    if (document.getElementById('post').value === 'Other') {
      if (!P.required('postOther', 'postOtherError', 'Please specify post')) ok = false;
    }

    // Identity & family
    if (!P.required('fullName', 'fullNameError', 'Full name')) ok = false;

    const dob = document.getElementById('dob').value;
    if (!dob) { P.setError('dob', 'dobError', 'Date of birth is required.'); ok = false; }
    else P.setError('dob', 'dobError', '');

    const age = document.getElementById('age').value;
    if (!age || age < 18 || age > 70) { P.setError('age', 'ageError', 'Enter a valid age (18–70).'); ok = false; }
    else P.setError('age', 'ageError', '');

    if (!P.required('fatherName', 'fatherNameError', "Father's name")) ok = false;
    if (!P.required('motherName', 'motherNameError', "Mother's name")) ok = false;

    if (!P.required('gender', 'genderError', 'Gender')) ok = false;
    if (document.getElementById('gender').value === 'Other') {
      if (!P.required('genderOther', 'genderOtherError', 'Please specify gender')) ok = false;
    }

    if (!P.required('bloodGroup', 'bloodGroupError', 'Blood group')) ok = false;
    if (document.getElementById('bloodGroup').value === 'Other') {
      if (!P.required('bloodGroupOther', 'bloodGroupOtherError', 'Please specify blood group')) ok = false;
    }

    if (!P.required('maritalStatus', 'maritalStatusError', 'Marital status')) ok = false;
    if (maritalStatusSelect.value === 'Married') {
      if (!P.required('spouseName', 'spouseNameError', "Spouse's name")) ok = false;
    } else if (maritalStatusSelect.value === 'Other') {
      if (!P.required('maritalStatusOther', 'maritalStatusOtherError', 'Please specify marital status')) ok = false;
    }

    // Photo
    if (!photoInput.files.length) {
      document.getElementById('fld-photoDoc').classList.add('has-error');
      P.setError(null, 'photoDocError', 'Passport size photo is required.');
      ok = false;
    } else {
      document.getElementById('fld-photoDoc').classList.remove('has-error');
      P.setError(null, 'photoDocError', '');
    }

    // Background
    if (!P.required('nationality', 'nationalityError', 'Nationality')) ok = false;

    if (!P.required('religion', 'religionError', 'Religion')) ok = false;
    if (document.getElementById('religion').value === 'Other') {
      if (!P.required('religionOther', 'religionOtherError', 'Please specify religion')) ok = false;
    }

    if (!P.required('community', 'communityError', 'Community / category')) ok = false;
    if (document.getElementById('community').value === 'Other') {
      if (!P.required('communityOther', 'communityOtherError', 'Please specify community')) ok = false;
    }

    if (!P.required('caste', 'casteError', 'Caste')) ok = false;

    // Contact
    const emailVal = document.getElementById('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { P.setError('email', 'emailError', 'Enter a valid email address.'); ok = false; }
    else P.setError('email', 'emailError', '');

    if (!P.optionalPattern('altEmail', 'altEmailError', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.')) ok = false;

    const phone = document.getElementById('phone').value.trim();
    if (!/^[0-9]{10}$/.test(phone)) { P.setError('phone', 'phoneError', 'Enter a valid 10-digit mobile number.'); ok = false; }
    else P.setError('phone', 'phoneError', '');

    if (!P.optionalPattern('whatsapp', 'whatsappError', /^[0-9]{10}$/, 'Enter a valid 10-digit number.')) ok = false;

    // Emergency contact
    if (!P.required('emergencyName', 'emergencyNameError', 'Emergency contact name')) ok = false;
    if (!P.required('emergencyRelation', 'emergencyRelationError', 'Relationship')) ok = false;

    const emergencyPhone = document.getElementById('emergencyPhone').value.trim();
    if (!/^[0-9]{10}$/.test(emergencyPhone)) { P.setError('emergencyPhone', 'emergencyPhoneError', 'Enter a valid 10-digit number.'); ok = false; }
    else P.setError('emergencyPhone', 'emergencyPhoneError', '');

    // Government ID (Aadhaar)
    const aadhaar = document.getElementById('aadhaar').value.trim();
    if (!/^[0-9]{12}$/.test(aadhaar)) { P.setError('aadhaar', 'aadhaarError', 'Enter a valid 12-digit Aadhaar number.'); ok = false; }
    else P.setError('aadhaar', 'aadhaarError', '');

    // Address
    if (!P.required('permanentAddress', 'permanentAddressError', 'Permanent address')) ok = false;
    if (!P.required('communicationAddress', 'communicationAddressError', 'Communication address')) ok = false;

    if (!P.required('state', 'stateError', 'State')) ok = false;
    if (!P.required('district', 'districtError', 'District / City')) ok = false;

    const pincode = document.getElementById('pincode').value.trim();
    if (!/^[0-9]{6}$/.test(pincode)) { P.setError('pincode', 'pincodeError', 'Enter a valid 6-digit pincode.'); ok = false; }
    else P.setError('pincode', 'pincodeError', '');

    return ok;
  }

  /* ---------------- Save Personal Data to MySQL API ---------------- */
  async function savePersonalToBackend() {
    const formData = new FormData();
    formData.append('user_email', P.regEmail);

    const fieldIds = [
      'appliedDate', 'post', 'postOther', 'fullName', 'dob', 'age', 'fatherName', 'motherName',
      'gender', 'genderOther', 'bloodGroup', 'bloodGroupOther', 'maritalStatus', 'spouseName',
      'maritalStatusOther', 'nationality', 'religion', 'religionOther', 'community', 'communityOther',
      'caste', 'email', 'altEmail', 'phone', 'whatsapp', 'emergencyName', 'emergencyRelation',
      'emergencyPhone', 'aadhaar', 'permanentAddress', 'communicationAddress', 'state', 'district', 'pincode'
    ];

    fieldIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.value !== undefined) {
        formData.append(id, el.value.trim());
      }
    });

    if (photoInput && photoInput.files.length > 0) {
      formData.append('photoDoc', photoInput.files[0]);
    }

    try {
      const res = await fetch('/api/personal', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!result.success) {
        P.showBanner(result.message || 'Failed to save personal information to MySQL.', 'error');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving personal info to API:', err);
      return true; // proceed smoothly even if offline/preview
    }
  }

  /* ---------------- Navigation: Tab 1 -> Tab 2 ---------------- */
  document.getElementById('toStep2').addEventListener('click', async function () {
    if (!validateStep1()) {
      P.showBanner('Please fill all required fields correctly before continuing.', 'error');
      return;
    }

    const saved = await savePersonalToBackend();
    if (saved) {
      P.setMaxCompleted(1);
      P.goToStep(2);
    }
  });

  window.populatePersonalTab = function (p) {
    if (!p) return;
    const fieldMapping = {
      appliedDate: p.applied_date ? p.applied_date.split('T')[0] : '',
      post: p.post,
      postOther: p.post_other,
      fullName: p.full_name,
      dob: p.dob ? p.dob.split('T')[0] : '',
      age: p.age,
      fatherName: p.father_name,
      motherName: p.mother_name,
      gender: p.gender,
      genderOther: p.gender_other,
      bloodGroup: p.blood_group,
      bloodGroupOther: p.blood_group_other,
      maritalStatus: p.marital_status,
      spouseName: p.spouse_name,
      maritalStatusOther: p.marital_status_other,
      nationality: p.nationality,
      religion: p.religion,
      religionOther: p.religion_other,
      community: p.community,
      communityOther: p.community_other,
      caste: p.caste,
      email: p.email,
      altEmail: p.alt_email,
      phone: p.phone,
      whatsapp: p.whatsapp,
      emergencyName: p.emergency_name,
      emergencyRelation: p.emergency_relation,
      emergencyPhone: p.emergency_phone,
      aadhaar: p.aadhaar,
      permanentAddress: p.permanent_address,
      communicationAddress: p.communication_address,
      state: p.state,
      district: p.district,
      pincode: p.pincode
    };

    Object.keys(fieldMapping).forEach(id => {
      const el = document.getElementById(id);
      if (el && fieldMapping[id] !== undefined && fieldMapping[id] !== null) {
        el.value = fieldMapping[id];
        el.dispatchEvent(new Event('change'));
      }
    });

    if (p.photo_path) {
      const photoNameEl = document.getElementById('photoDocName');
      if (photoNameEl) photoNameEl.textContent = p.photo_path.split('/').pop() || 'Photo saved';
    }
  };

};
