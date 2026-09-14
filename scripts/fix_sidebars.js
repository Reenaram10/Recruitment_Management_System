const fs = require('fs');

function updateFile(file, matchLogoutStr, replaceLogoutStr, asideMatch, asideReplace) {
    let c = fs.readFileSync(file, 'utf8');
    if (!c.includes('isSidebarOpen')) {
        c = c.replace(matchLogoutStr, replaceLogoutStr);
    }
    c = c.replace(asideMatch, asideReplace);
    fs.writeFileSync(file, c);
}

updateFile(
    'src/pages/AdminPage.jsx',
    'const { logout } = useAuth();',
    'const { logout, isSidebarOpen } = useAuth();',
    '<aside className="admin-sidebar">',
    '<aside className={`admin-sidebar ${!isSidebarOpen ? \\'sidebar - collapsed\\' : \\'\\'}`}>'
);

updateFile(
    'src/pages/ProfilePage.jsx',
    'const { logout, user } = useAuth();',
    'const { logout, user, isSidebarOpen } = useAuth();',
    '<aside className="profile-sidebar">',
    '<aside className={`profile-sidebar ${!isSidebarOpen ? \\'sidebar - collapsed\\' : \\'\\'}`}>'
);
