const fs = require('fs');
const path = require('path');

const API_IMPORT = "import { API_URL } from '../config';\n";
const API_IMPORT_APP = "import { API_URL } from './config';\n";

function processFile(filePath, isApp = false) {
    let content = fs.readFileSync(filePath, 'utf8');
    let dirty = false;

    // Replace fetch('/api  with fetch(`${API_URL}/api
    if (content.includes("fetch('/api")) {
        content = content.replace(/fetch\('\/api/g, "fetch(`${API_URL}/api");
        dirty = true;
    }
    // Replace fetch(`/api  with fetch(`${API_URL}/api
    if (content.includes('fetch(`/api')) {
        content = content.replace(/fetch\(\`\/api/g, "fetch(`${API_URL}/api");
        dirty = true;
    }

    // Replace http://localhost:5000 with API_URL constant literal where appropriate.
    // In Orders.jsx and Banner.jsx: const API = 'http://localhost:5000';
    if (content.includes("const API = 'http://localhost:5000';")) {
        content = content.replace("const API = 'http://localhost:5000';", "const API = API_URL;");
        dirty = true;
    }

    // In App.jsx: ['🌐', 'Backend API', 'localhost:5000']
    if (content.includes("'localhost:5000'")) {
        content = content.replace("'localhost:5000'", "API_URL.replace('https://', '')");
        dirty = true;
    }

    if (dirty) {
        // Add import
        const imp = isApp ? API_IMPORT_APP : API_IMPORT;
        if (!content.includes(imp.trim())) {
            // insert after last import
            if (content.match(/^import .*$/gm)) {
                content = content.replace(/^(import .*)$/gm, (match, p1, offset, string) => {
                    const nextLineOffset = offset + match.length;
                    if (string.substring(nextLineOffset).match(/^\s*import /)) return match;
                    return match + '\n' + imp;
                });
            } else {
                content = imp + '\n' + content;
            }
        }
        fs.writeFileSync(filePath, content);
        console.log("Updated", filePath);
    }
}

const pagesDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Products.jsx', 'Categories.jsx', 'Orders.jsx', 'Banner.jsx', 'Login.jsx'];

filesToProcess.forEach(f => {
    const p = path.join(pagesDir, f);
    if (fs.existsSync(p)) processFile(p);
});

const appFile = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appFile)) processFile(appFile, true);
