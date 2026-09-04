/* ===========================================================
   profileApp.js
   Loads each tab's HTML from its own file and wires everything
   up. This is what actually makes the "split HTML" work:
     tab_personal.html    -> #panel1-mount
     tab_education.html   -> #panel2-mount
     tab_experience.html  -> #panel3-mount
     tab_done.html        -> #panelDone-mount

   IMPORTANT: fetch() cannot read local files when the page is
   opened directly (double-clicked) as a file:// URL — browsers
   block that for security. Serve this folder with a local
   server instead, e.g. from a terminal in this folder:
       python3 -m http.server 8000
   then open http://localhost:8000/profile.html
=========================================================== */
(async function () {

  async function loadFragment(url, mountId) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
    const html = await res.text();
    document.getElementById(mountId).innerHTML = html;
  }

  try {
    await Promise.all([
      loadFragment('tab_personal.html', 'panel1-mount'),
      loadFragment('tab_education.html', 'panel2-mount'),
      loadFragment('tab_experience.html', 'panel3-mount'),
      loadFragment('tab_certifications.html', 'panel4-mount'),
      loadFragment('tab_done.html', 'panelDone-mount')
    ]);
  } catch (err) {
    document.querySelector('main.wrap').insertAdjacentHTML(
      'beforeend',
      '<div class="banner is-visible error">Could not load the form. ' +
      'If you opened this file directly (file://), please serve it from a local ' +
      'web server instead — e.g. run <code>python3 -m http.server</code> in this ' +
      'folder and open it via http://localhost.</div>'
    );
    console.error(err);
    return;
  }

  // Now that all panel markup exists in the DOM, wire up the
  // stepper and each tab's own logic, in order.
  window.Profile.initStepper();
  window.initPersonalTab();
  window.initEducationTab();
  window.initExperienceTab();
  window.initCertificationsTab();

  // Auto-prefill existing candidate profile data from MySQL
  const email = window.Profile.regEmail;
  if (email) {
    try {
      const res = await fetch('/api/profile?email=' + encodeURIComponent(email));
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.personal && window.populatePersonalTab) {
            window.populatePersonalTab(data.personal);
          }
          if ((Array.isArray(data.education) || data.phd_details) && window.populateEducationTab) {
            window.populateEducationTab(data.education || [], data.phd_details || null);
          }
          if (Array.isArray(data.experience) && window.populateExperienceTab) {
            window.populateExperienceTab(data.experience);
          }
          if (Array.isArray(data.certifications) && window.populateCertificationsTab) {
            window.populateCertificationsTab(data.certifications);
          }

          let maxStep = 1;
          if (data.personal && data.personal.full_name) maxStep = Math.max(maxStep, 1);
          if (data.education && data.education.length > 0) maxStep = Math.max(maxStep, 2);
          if (data.experience && data.experience.length > 0) maxStep = Math.max(maxStep, 3);
          if (data.certifications && data.certifications.length > 0) maxStep = Math.max(maxStep, 4);

          window.Profile.setMaxCompleted(maxStep);
        }
      }
    } catch (err) {
      console.warn('Could not fetch existing profile data:', err);
    }
  }

})();

