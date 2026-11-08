import fs from 'node:fs';
const audit=JSON.parse(fs.readFileSync(new URL('../audit/pdf-sequencias-review.json',import.meta.url)));
const text='// Facts transcribed from the user-provided PDF; see audit/pdf-sequencias-review.json.\n'+
 'export const PDF_SOURCE='+JSON.stringify(audit.source,null,2)+';\n'+
 'export const PDF_REFERENCES='+JSON.stringify(audit.accepted,null,2)+'.map(r=>({...r,referenceKind:"pdf",sourceId:PDF_SOURCE.id,source:`Betto Correa · Sequências para cavaquinho · p. ${r.pages.join(", ")}`}));\n';
fs.writeFileSync(new URL('../src/pdf-references.js',import.meta.url),text);
console.log('Generated',audit.accepted.length,'position/fingering references');
