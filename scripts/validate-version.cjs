const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(path.join(rootDir, filePath), 'utf8'));
}

function readTomlVersion(filePath) {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    const match = content.match(/^version\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
}

try {
    const pkg = readJson('package.json');
    const tauriConf = readJson('src-tauri/tauri.conf.json');
    const cargoVersion = readTomlVersion('src-tauri/Cargo.toml');

    const vPkg = pkg.version;
    const vTauri = tauriConf.version;
    const vCargo = cargoVersion;

    console.log(`Checking versions...`);
    console.log(`  package.json:          ${vPkg}`);
    console.log(`  src-tauri/tauri.conf.json: ${vTauri}`);
    console.log(`  src-tauri/Cargo.toml:      ${vCargo}`);

    if (vPkg !== vTauri || vPkg !== vCargo) {
        console.error('❌ Version mismatch detected!');
        process.exit(1);
    }

    console.log('✅ Versions match.');
} catch (err) {
    console.error('❌ Error validating versions:', err);
    process.exit(1);
}
