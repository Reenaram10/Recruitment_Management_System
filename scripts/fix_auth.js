const fs = require('fs');
let c = fs.readFileSync('src/pages/AuthPage.jsx', 'utf8');
const searchString = `                if (data.success && data.data) {
                    setDepts(data.data.map(d => ({ value: d.code, label: d.name })));
                }
            });

        if (!loginUsername || !loginPassword) {`;

const replaceString = `                if (data.success && data.data) {
                    setDepts(data.data.map(d => ({ value: d.code, label: d.name })));
                }
            });
    }, []);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setBanner({ type: '', message: '' });

        if (!loginUsername || !loginPassword) {`;
c = c.replace(searchString, replaceString);
fs.writeFileSync('src/pages/AuthPage.jsx', c);
