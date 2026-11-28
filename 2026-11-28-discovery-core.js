// Browser-only preferences and discovery. No account, tracking or forecast server.
const FTGCore = (() => {
  'use strict';
  const key = 'ftg-club-preferences-v1';
  const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const distance = (a, b) => {
    const rad = n => n * Math.PI / 180;
    const dlat = rad(b.lat - a.lat), dlon = rad(b.lon - a.lon);
    const h = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlon / 2) ** 2;
    return 3958.7613 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  };
  const validPoint = p => p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180;
  const courseURL = c => c.singleCourse ? `/clubs/${c.clubId}/` : `/clubs/${c.clubId}/courses/${c.id}/`;
  const clubURL = c => `/clubs/${c.id}/`;
  function preferences(storage, ids) {
    const known = new Set(ids);
    let state = { favourites: [], area: null }, persistent = true, unsaved = false;
    const sync = () => {
      // Preserve visit-local choices after a quota/write failure even if reads work.
      if (unsaved) return false;
      try {
        const raw = JSON.parse(storage.getItem(key) || 'null');
        const next = { favourites: [], area: null };
        if (raw && typeof raw === 'object') {
          next.favourites = [...new Set(Array.isArray(raw.favourites) ? raw.favourites.filter(id => known.has(id)) : [])];
          if (validPoint(raw.area) && typeof raw.area.label === 'string') next.area = { lat: raw.area.lat, lon: raw.area.lon, label: raw.area.label.slice(0, 80) };
        }
        state = next;
        persistent = true;
      } catch { persistent = false; }
      return persistent;
    };
    sync();
    const write = () => {
      try { storage.setItem(key, JSON.stringify(state)); persistent = true; unsaved = false; }
      catch { persistent = false; unsaved = true; }
      return persistent;
    };
    return {
      get state() { return structuredClone(state); },
      get persistent() { return persistent; },
      sync,
      toggle(id) {
        if (!known.has(id)) return false;
        sync();
        state.favourites = state.favourites.includes(id) ? state.favourites.filter(x => x !== id) : [...state.favourites, id];
        return write();
      },
      remember(area) {
        if (!validPoint(area)) return false;
        sync();
        // Save an approximate area, never precise device coordinates.
        state.area = { lat: Math.round(area.lat * 100) / 100, lon: Math.round(area.lon * 100) / 100, label: String(area.label || 'Saved area').slice(0, 80) };
        return write();
      },
      forgetArea() { sync(); state.area = null; return write(); },
      reset() { state = { favourites: [], area: null }; return write(); },
    };
  }
  // Recognise locally before requesting a postcode or postcode-area lookup.
  function searchInput(value) {
    const text=String(value || '').trim(), code=text.replace(/\s+/g,'').toUpperCase();
    if (/^(?:GIR0AA|[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2})$/.test(code)) return {kind:'postcode',value:code};
    if (/^(?:GIR\d?[A-Z]{0,2}|[A-Z]{1,2}\d[A-Z\d]?(?:\d[A-Z]{0,2})?)$/.test(code)) return {kind:'partial-postcode',value:code};
    return {kind:text?'name':'empty',value:text};
  }
  function postcodeLookup(value) {
    const input=searchInput(value), code=input.value;
    if(input.kind==='postcode')return {value:code.slice(0,-3)+' '+code.slice(-3),path:'postcodes/'+encodeURIComponent(code),approximate:false};
    if(input.kind!=='partial-postcode')return null;
    if(/^[A-Z]{1,2}\d[A-Z\d]?$/.test(code))return {value:code,path:'outcodes/'+code,approximate:true};
    const prefix=code.match(/^([A-Z]{1,2}\d[A-Z\d]?|GIR)(\d[A-Z]?)$/);
    if(!prefix)return null;
    const formatted=prefix[1]+' '+prefix[2];
    return {value:formatted,path:'postcodes?query='+encodeURIComponent(formatted)+'&limit=100',approximate:true};
  }
  function results(clubs, { query = '', area = '', origin = null } = {}) {
    const words = fold(query).split(' ').filter(Boolean);
    const relevance=c=>words.length && words.every(w=>fold([c.name,...(c.aliases||[]),...c.courses.map(x=>x.name)].join(' ')).includes(w))?0:1;
    return clubs.filter(c => (!area || c.area === area) && words.every(w => fold([c.name, c.area, c.country, ...(c.aliases || []), ...c.courses.map(x => x.name)].join(' ')).includes(w)))
      .map(c => ({ ...c, distance: validPoint(origin) ? distance(origin, c) : null }))
      .sort((a,b)=>relevance(a)-relevance(b) || (origin?a.distance-b.distance || a.name.localeCompare(b.name):a.name.localeCompare(b.name)));
  }
  return { key, fold, distance, validPoint, preferences, searchInput, postcodeLookup, results, courseURL, clubURL };
})();
if (typeof module !== 'undefined') module.exports = FTGCore;
