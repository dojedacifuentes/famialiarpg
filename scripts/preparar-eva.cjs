// Sólo ejecutado para optimizar referencias locales autorizadas por el propietario.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const [retrato, referencia] = process.argv.slice(2);
if (!retrato || !referencia) throw new Error('Indica retrato y referencia de marca');
const salida = path.join(__dirname, '..', 'public', 'eva');
fs.mkdirSync(salida, { recursive: true });
Promise.all([
  sharp(retrato).resize(384, 384, { fit: 'cover' }).webp({ quality: 84 }).toFile(path.join(salida, 'eva-guia.webp')),
  sharp(referencia).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(salida, 'identidad-eva.webp')),
]).catch((e) => { console.error(e); process.exitCode = 1; });
