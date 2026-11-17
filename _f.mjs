import opentype from 'opentype.js'; import fs from 'fs';
const buf = fs.readFileSync('node_modules/@fontsource/fraunces/files/fraunces-latin-800-normal.woff');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength));
const scale = (1000*100)/((font.unitsPerEm||2048)*72);
const out = {glyphs:{}, familyName:'Fraunces', ascender:Math.round(font.ascender*scale), descender:Math.round(font.descender*scale), underlinePosition:-100, underlineThickness:50, boundingBox:{yMin:Math.round(font.tables.head.yMin*scale), xMin:Math.round(font.tables.head.xMin*scale), yMax:Math.round(font.tables.head.yMax*scale), xMax:Math.round(font.tables.head.xMax*scale)}, resolution:1000, original_font_information:{}};
for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ') {
  const g = font.charToGlyph(ch); let o='';
  for (const c of g.path.commands) {
    let t = c.type.toLowerCase(); if (t==='c') t='b'; o += t+' ';
    if (c.x!==undefined) o += Math.round(c.x*scale)+' '+Math.round(c.y*scale)+' ';
    if (c.x1!==undefined) o += Math.round(c.x1*scale)+' '+Math.round(c.y1*scale)+' ';
    if (c.x2!==undefined) o += Math.round(c.x2*scale)+' '+Math.round(c.y2*scale)+' ';
  }
  out.glyphs[ch] = {ha:Math.round(g.advanceWidth*scale), x_min:0, x_max:Math.round(g.advanceWidth*scale), o};
}
fs.writeFileSync('src/data/fuente3d.json', JSON.stringify(out)); console.log(fs.statSync('src/data/fuente3d.json').size, out.glyphs.L.o.slice(0,80));
