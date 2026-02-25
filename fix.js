import fs from 'fs';
let c = fs.readFileSync('src/reflections.js', 'utf8');
let t = '"The Hour of Absolute Silence"';
let i = c.indexOf(t);
if (i > -1) {
    let s = c.substring(0, i) + t + ',\n"content":"Night reveals who we truly are.",\n"fact":"Silence."\n}\n}\n];\n';
    fs.writeFileSync('src/reflections.js', s);
}
