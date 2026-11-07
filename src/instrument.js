// Cavaquinho brasileiro, da 4ª (mais grave) à 1ª (mais aguda).
// MuseScore instruments.xml: MIDI 62, 67, 71, 74. Veja MUSIC_SOURCES.md.
export const STRINGS=[{id:'D4',name:'Ré4',number:4,midi:62},{id:'G4',name:'Sol4',number:3,midi:67},{id:'B4',name:'Si4',number:2,midi:71},{id:'D5',name:'Ré5',number:1,midi:74}].map(s=>({...s,hz:440*2**((s.midi-69)/12)}));
export const STANDARD_TUNING='D4–G4–B4–D5';
export const LEGACY_INCORRECT_TUNING='D4–G3–B3–D4';

// Limite do instrumento atual, informado explicitamente por Rafael em 07/11/2026.
export const MAX_FRET=12;
