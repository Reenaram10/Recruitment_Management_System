const fs = require('fs');
const path = require('path');

function replaceAuthPage() {
    const file = path.join('src', 'pages', 'AuthPage.jsx');
    let content = fs.readFileSync(file, 'utf8');
    const target = /fetch\('\/api\/dropdowns\?category=department'\)[\s\S]*?\}\);/m;
    const replacement = `fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setDepts(data.data.map(d => ({ value: d.code, label: d.name })));
                }
            });`;
    fs.writeFileSync(file, content.replace(target, replacement));
}

function replacePersonalTab() {
    const file = path.join('src', 'components', 'profile', 'PersonalTab.jsx');
    let content = fs.readFileSync(file, 'utf8');
    // First, replace department fetch
    content = content.replace(/fetch\('\/api\/dropdowns\?category=department'\)[\s\S]*?\}\);/m,
        `fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setDepartments(data.data.map(d => ({ value: d.code, label: d.name })));
                }
            });`);
    // Then replace post fetch
    content = content.replace(/fetch\(\`\/api\/dropdowns\?category=post&parent_id=\$\{localDept\}\`\)[\s\S]*?\}\);/m,
        `if (localDept) {
            fetch(\`/api/departments/\${encodeURIComponent(localDept)}/designations\`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setPosts(data.data.map(d => ({ value: d.name, label: d.name })));
                    } else setPosts([]);
                });
        } else setPosts([]);`);
    fs.writeFileSync(file, content);
}

function replaceEducationTab() {
    const file = path.join('src', 'components', 'profile', 'EducationTab.jsx');
    let content = fs.readFileSync(file, 'utf8');

    // Replace pg_domain fetch
    // Replace: fetch('/api/dropdowns?category=pg_domain') ... catch((err) => ...);
    const target = /fetch\('\/api\/dropdowns\?category=pg_domain'\)[\s\S]*?catch\(\(err\) => console\.warn\('Failed to fetch dynamic pg_domains:', err\)\);/m;
    const replacement = `// Fetch PG domains based on user department
        const targetDept = profileData?.user?.department || user?.department;
        if (targetDept) {
            fetch(\`/api/departments/\${encodeURIComponent(targetDept)}/pg-domains\`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setDynamicPgDomains(data.data.map(d => d.name));
                    } else {
                        setDynamicPgDomains([]);
                    }
                })
                .catch(err => console.warn('Failed to fetch pg-domains:', err));
        }`;
    fs.writeFileSync(file, content.replace(target, replacement));
}

try {
    replaceAuthPage();
    replacePersonalTab();
    replaceEducationTab();
    console.log('Frontend fetched updated!');
} catch (e) {
    console.error(e);
}
