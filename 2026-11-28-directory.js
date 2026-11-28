// The discovery catalogue is already loaded. Render only the directory branches in use.
const FTGDirectory = (() => {
  'use strict';
  const pageSize = 40;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const compare = (a,b) => a.name.localeCompare(b.name,'en',{sensitivity:'base'});
  function group(clubs) {
    const countries = new Map();
    for (const club of clubs) {
      if (!countries.has(club.country)) countries.set(club.country,new Map());
      const counties=countries.get(club.country);
      if (!counties.has(club.area)) counties.set(club.area,[]);
      counties.get(club.area).push({id:club.id,name:club.name});
    }
    return [...countries].map(([name,counties])=>({name,counties:[...counties].map(([name,clubs])=>({name,clubs:clubs.sort(compare)})).sort(compare)})).sort(compare);
  }
  function mount(root, clubs) {
    if (!root) return;
    const countries=group(clubs), body=root.querySelector('[data-directory-root]');
    if (!body) return;
    const count = n => `${n.toLocaleString('en-GB')} club${n===1?'':'s'}`;
    const branchBody = node => node.querySelector('[data-directory-body]');
    function clear(node) { const target=branchBody(node); if(target)target.innerHTML=''; delete node.dataset.visible; }
    function closeOthers(node,selector,parent) {
      parent.querySelectorAll(selector).forEach(other=>{if(other!==node){other.open=false;clear(other);}});
    }
    function renderCounties(node) {
      const country=countries[Number(node.dataset.country)];
      const id=`directory-area-${node.dataset.country}`;
      branchBody(node).innerHTML=`<label for="${id}" class="directory-area-label">County or council area<select id="${id}" data-directory-area><option value="">Choose an area</option>${country.counties.map((county,i)=>`<option value="${i}">${esc(county.name)} (${county.clubs.length})</option>`).join('')}</select></label><div data-directory-selected></div>`;
    }
    function renderClubs(node,limit=pageSize) {
      const country=node.closest('[data-country]'),county=countries[Number(country.dataset.country)].counties[Number(node.dataset.county)];
      const visible=Math.min(limit,county.clubs.length);
      node.dataset.visible=String(visible);
      branchBody(node).innerHTML=`<ul class="directory-clubs">${county.clubs.slice(0,visible).map(club=>`<li><a href="/clubs/${club.id}/">${esc(club.name)}</a></li>`).join('')}</ul><p class="directory-progress" role="status">Showing ${visible} of ${count(county.clubs.length)}</p>${visible<county.clubs.length?`<button class="button" data-directory-more>Show ${Math.min(pageSize,county.clubs.length-visible)} more clubs</button>`:''}`;
    }
    root.addEventListener('toggle',event=>{
      const node=event.target;
      if(node===root){
        body.innerHTML=root.open?countries.map((country,i)=>`<details class="directory-country" data-country="${i}"><summary><span>${esc(country.name)}</span> <small>${count(country.counties.reduce((n,c)=>n+c.clubs.length,0))} · ${country.counties.length} areas</small></summary><div data-directory-body></div></details>`).join(''):'';
        return;
      }
      if(!root.contains(node))return; // Ignore queued toggle events from discarded branches.
      if(node.matches('[data-country]')){
        if(!node.open){clear(node);return;}
        closeOthers(node,'[data-country]',body);renderCounties(node);
      }
    },true);
    root.addEventListener('change',event=>{
      const select=event.target;
      if(!select.matches('[data-directory-area]') || !root.contains(select))return;
      const country=select.closest('[data-country]'),target=country.querySelector('[data-directory-selected]');
      const area=countries[Number(country.dataset.country)].counties[Number(select.value)];
      if(select.value==='' || !area){target.innerHTML='';return;}
      target.innerHTML=`<section class="directory-county" data-county="${Number(select.value)}"><h3>${esc(area.name)}</h3><div data-directory-body></div></section>`;
      renderClubs(target.querySelector('[data-county]'));
    });
    root.addEventListener('click',event=>{
      const more=event.target.closest('[data-directory-more]');
      if(!more || !root.contains(more))return;
      const county=more.closest('[data-county]'),previous=Number(county.dataset.visible);
      renderClubs(county,previous+pageSize);
      // Continue keyboard navigation at the first newly revealed club.
      county.querySelectorAll('a')[previous]?.focus();
    });
    // The user may open the directory while the catalogue is still loading.
    if(root.open)root.dispatchEvent(new Event('toggle'));
  }
  return {group,mount,pageSize};
})();
if(typeof module!=='undefined')module.exports=FTGDirectory;
