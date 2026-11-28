/* Shared static-page controller. Forecasts go directly from this browser to Open-Meteo. */
'use strict';
const FTGApp = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (date, options) => new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/London', ...options }).format(new Date(date + 'T12:00:00Z'));
  const band = FT.band;
  const num = n => Number.isFinite(n) ? Math.round(n) : '–';
  const pageSize = 6;
  const verdicts = FTGVerdicts.createPageAllocator();
  const verdict = (course, weather, score) => verdicts.label(score.value, `${course.id}|${weather.date}`);
  let clubs = [], courses = [], prefs, origin = null, view = 'nearby', visible = pageSize, query = '', area = '';
  let forecasts = new Map(), errors = new Map(), pending = new Map(), queue = [], active = 0, locationRequest = 0, locationPending = false, locationTimer, postcodeTimer;
  const postcodeCache = new Map();
  const clubId = document.body.dataset.club, courseId = document.body.dataset.course;
  const isClub = Boolean(clubId);
  const icon = w => w.codes?.some(c => c >= 95) ? '⛈' : w.codes?.some(c => [71,73,75,77,85,86].includes(c)) ? '❄' : w.rain > 1 ? '🌧' : w.prob > 40 ? '🌦' : w.codes?.some(c => c === 3) ? '☁' : w.codes?.every(c => c === 0) ? '☀' : '⛅';
  function announce(message, failure = false) {
    $('preference-status').textContent = message;
    $('preference-status').className = failure ? 'status error' : 'status';
  }
  function saved(id) { return prefs.state.favourites.includes(id); }
  function saveButton(c) { return `<button class="button ${saved(c.id) ? 'saved' : ''}" data-save="${c.id}" aria-pressed="${saved(c.id)}" aria-label="${saved(c.id) ? 'Remove' : 'Save'} ${esc(c.full)}${saved(c.id) ? ' from favourites' : ' to favourites'}">${saved(c.id) ? '★ Saved' : '☆ Save'}</button>`; }
  function forecastSummary(c) {
    const days = forecasts.get(c.id), err = errors.get(c.id);
    if (!days) return `<div class="card-score"><p>${err ? esc(err) + ' <button class="link-button" data-retry="' + c.id + '">Retry forecast</button>' : 'Checking the forecast…'}</p></div>`;
    const first = days[0], score = first && FT.score(first);
    return `<div class="card-score">${score ? `<strong class="score ${band(score.value)}">${score.value.toFixed(1)}<small>/10</small></strong><p><b>Today</b><br>${esc(verdict(c,first,score))}</p>` : '<p>Today’s measurements are incomplete. Check later days.</p>'}</div><div class="strip" aria-label="Seven-day outlook">${days.map(w => { const s = FT.score(w); return `<a class="${s ? band(s.value) : 'empty'}" href="${FTGCore.courseURL(c)}" aria-label="${esc(c.full)}, ${fmt(w.date,{weekday:'long',day:'numeric',month:'long'})}${s ? ', '+s.value.toFixed(1)+' out of ten' : ', measurements missing'}"><span>${fmt(w.date,{weekday:'short'})}</span>${s ? s.value.toFixed(1) : '–'}</a>`; }).join('')}</div>`;
  }
  function displayedCourses(club) {
    if (view === 'favourites') return club.courses.filter(c => saved(c.id));
    const words = FTGCore.fold(query).split(' ').filter(Boolean);
    const courseMatches = words.length && club.courses.filter(c => words.every(w => FTGCore.fold(club.name+' '+c.name).includes(w)));
    return courseMatches?.length ? courseMatches : [club.courses[0]];
  }
  function homeResults() {
    let list = FTGCore.results(clubs, { query, area, origin });
    if (view === 'favourites') list = list.filter(c => c.courses.some(x => saved(x.id)));
    return list;
  }
  function renderHome({ loadForecasts = true } = {}) {
    if (view === 'favourites' && !prefs.state.favourites.length) { view = 'nearby'; visible = pageSize; }
    const list = homeResults(), showing = list.slice(0,visible);
    $('results-title').textContent = view === 'favourites' ? 'Saved clubs' : query ? `Clubs matching “${query}”` : area ? 'Find your next round' : origin ? `Clubs near ${origin.label}` : 'Clubs around Stratford';
    $('result-count').textContent = `${list.length} club${list.length === 1 ? '' : 's'}${origin ? ' · approximate straight-line distance' : ''}`;
    $('view-favourites').setAttribute('aria-pressed', String(view === 'favourites'));
    $('view-nearby').setAttribute('aria-pressed', String(view === 'nearby'));
    $('view-favourites').textContent = `Saved (${prefs.state.favourites.length})`;
    $('view-favourites').disabled = !prefs.state.favourites.length;
    $('clubs').innerHTML = showing.length ? showing.map(club => {
      const choices = displayedCourses(club);
      return `<article class="club-card"><div class="club-meta">${esc(club.area)}${club.distance !== null ? ' · '+club.distance.toFixed(1)+' miles' : ''}</div><h3><a href="${FTGCore.clubURL(club)}">${esc(club.name)}</a></h3>${choices.map(c => `<div class="card-head"><span class="club-meta">${club.courses.length > 1 ? esc(c.name) : 'Seven-day outlook'}</span>${saveButton(c)}</div><div data-summary="${c.id}">${forecastSummary(c)}</div>`).join('')}<div class="card-bottom"><a href="${FTGCore.courseURL(choices[0])}">Full forecast${club.courses.length > 1 ? ' · '+club.courses.length+' courses' : ''}</a><span>Weather only</span></div></article>`;
    }).join('') : `<div class="notice">${view === 'favourites' && !prefs.state.favourites.length ? 'Your shortlist starts here. Find a club and choose ☆ Save. It will be waiting here next time on this browser.' : 'No matching clubs in the directory. Try another name or clear the filters. '}</div>`;
    $('load-more').hidden = visible >= list.length;
    $('load-more').textContent = `Show ${Math.min(pageSize,list.length-visible)} more clubs`;
    if (loadForecasts) showing.forEach(club => displayedCourses(club).forEach(c => requestForecast(c)));
    renderArea();
  }
  function defaultOrigin() {
    const club=clubs.find(c=>c.id==='stratford-on-avon');
    return {lat:club.lat,lon:club.lon,label:club.name,isDefault:true};
  }
  function renderArea() {
    if (!$('area-label')) return;
    $('area-label').textContent = origin ? `Using ${origin.label}. Results cover clubs in our current directory.` : 'Choose a postcode or use your current location. Results cover the current directory only.';
    $('remember-area').hidden = !origin;
    $('forget-area').hidden = (!origin || origin.isDefault) && !prefs.state.area;
  }
  async function getJSON(url) {
    const r = await fetch(url, { signal: AbortSignal.timeout(18000) });
    if (!r.ok) throw Error(r.status === 429 ? 'Weather provider is busy. Please retry shortly.' : `Service unavailable (${r.status}).`);
    return r.json();
  }
  async function fetchForecast(c) {
    const params = new URLSearchParams({ latitude:c.lat, longitude:c.lon, hourly:'temperature_2m,apparent_temperature,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,weather_code', daily:'sunrise,sunset', timezone:'Europe/London', wind_speed_unit:'mph', forecast_days:7, models:FT.models.map(m => m.id).join(',') });
    let data;
    try { data = await getJSON('https://api.open-meteo.com/v1/forecast?' + params); }
    catch (e) {
      if (e.message.includes('busy')) throw e;
      params.delete('models');
      data = await getJSON('https://api.open-meteo.com/v1/forecast?' + params);
    }
    const days = FT.multiNormalise(data);
    if (days[0]?.date !== FT.ukDate(new Date())) throw Error('The provider returned an old forecast. Please retry.');
    if(days.length!==7 || days.some((w,i)=>w.date!==new Date(Date.parse(days[0].date+'T12:00:00Z')+i*86400000).toISOString().slice(0,10)))throw Error('The provider returned an incomplete seven-day forecast. Please retry.');
    if (!days.some(w => FT.score(w))) throw Error('Incomplete weather data. Please retry.');
    return days;
  }
  function pump() {
    while (active < 4 && queue.length) {
      const { c, resolve } = queue.shift(); active++;
      fetchForecast(c).then(days => { forecasts.set(c.id, days); errors.delete(c.id); }).catch(e => { errors.set(c.id, e.message || 'Forecast unavailable. Please retry.'); }).finally(() => {
        active--; pending.delete(c.id); resolve();
        if (!isClub) $('refresh-shortlist').disabled = pending.size > 0;
        if (isClub && currentCourse()?.id === c.id) renderForecast(c);
        else if (!isClub) document.querySelectorAll(`[data-summary="${c.id}"]`).forEach(n => { n.innerHTML = forecastSummary(c); });
        pump();
      });
    }
  }
  function requestForecast(c, force = false) {
    if (pending.has(c.id)) return pending.get(c.id);
    if (!force && (forecasts.has(c.id) || errors.has(c.id))) return Promise.resolve();
    if (force) { forecasts.delete(c.id); errors.delete(c.id); }
    let resolve; const promise = new Promise(r => { resolve = r; });
    pending.set(c.id,promise);
    if (!isClub) $('refresh-shortlist').disabled = true;
    queue.push({ c, resolve }); pump(); return promise;
  }
  function currentCourse() { return courses.find(c => c.id === (courseId || clubs.find(club => club.id === clubId)?.courses[0]?.id)); }
  function renderForecast(c) {
    const days = forecasts.get(c.id) || [], busy = pending.has(c.id), err = errors.get(c.id);
    const rated = days.map((w,i) => ({w,i,s:FT.score(w)})).filter(x => x.s);
    const best = rated.reduce((a,b) => !a || b.s.value < a.s.value ? b : a,null);
    $('refresh').disabled = busy;
    $('status').textContent = busy ? 'Asking the clouds what the fuck they’re doing…' : err || (days.length ? `Updated ${new Date(days.find(w=>w.fetched)?.fetched || Date.now()).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'})} UK · ${days[0].sources?.length || 0} forecast model${days[0].sources?.length === 1 ? '' : 's'} today` : 'Ready to check the forecast.');
    $('status').className = err ? 'status error' : 'status';
    $('week').setAttribute('aria-busy',String(busy));
    $('week').innerHTML = !days.length ? `<div class="notice">${busy ? 'Collecting the seven-day outlook…' : esc(err || 'Forecast unavailable. Choose Refresh to retry.')} ${err ? 'No made-up weather. No made-up score.' : ''}</div>` : days.map((w,i) => {
      const s=FT.score(w),day=i===0?'Today':fmt(w.date,{weekday:'short'});
      if (!s) return `<div class="day"><b>${day}</b><span class="day-date">${fmt(w.date,{day:'numeric',month:'short'})}</span><p>Measurements missing.<br>No score.</p></div>`;
      return `<button class="day ${best?.i===i?'best':''}" data-day="${i}" data-owner="${c.id}" aria-label="${esc(c.full)}, ${fmt(w.date,{weekday:'long',day:'numeric',month:'long'})}, ${s.value.toFixed(1)} out of ten. Show breakdown.">${best?.i===i?'<span class="ribbon">LEAST BAD BET</span>':''}<div class="day-name">${day}</div><span class="day-date">${fmt(w.date,{day:'numeric',month:'short'})}</span><span class="weather-icon" aria-hidden="true">${icon(w)}</span><div class="score ${band(s.value)}">${s.value.toFixed(1)}<small> /10</small></div><div class="verdict">${esc(verdict(c,w,s))}</div><div class="metrics"><div><span>Temp / feels</span><b>${num(w.temp)}° / ${num(w.feels)}°</b></div><div><span>Wind</span><b>${num(w.wind)} mph</b></div><div><span>Rain</span><b>${w.rain.toFixed(1)} mm</b></div><div><span>Rain chance</span><b>${num(w.prob)}%</b></div></div><span class="sources-tag">${w.sources.length} model${w.sources.length===1?'':'s'}${s.disagree?' · disagree':''}</span></button>`;
    }).join('');
    $('recommend').hidden = !best;
    if (best) $('recommend').innerHTML = `<b>${fmt(best.w.date,{weekday:'long'})} is the least bad bet.</b> ${esc(FT.reason(best.w,best.s))}${best.s.value>=6?' “Best” is doing a lot of work here.':''}`;
    $('course-save').innerHTML = saveButton(c);
  }
  function detail(id,index) {
    const c = courses.find(c => c.id === id), w = forecasts.get(id)?.[index], s = w && FT.score(w);
    if (!s) return;
    const rows = [['Wind',s.wind,'35%'],['Rain',s.rain,'35%'],['Temperature',s.temp,'15%'],['Feels-like',s.feels,'15%']];
    $('detail-content').innerHTML = `<div class="dialog-top"><button class="close" aria-label="Close breakdown">×</button><div class="eyebrow">${fmt(w.date,{weekday:'long',day:'numeric',month:'long'})}</div><h2 id="detail-title">${esc(c.full)}</h2><div class="score">${s.value.toFixed(1)}<small> /10</small></div><p>${esc(verdict(c,w,s))}</p></div><div class="dialog-body"><p><b>${esc(FT.reason(w,s))}</b></p>${s.severe?'<p class="danger">At least two forecasts predict severe conditions. Minimum 9.5/10 applies. Check official warnings and the club before travelling.</p>':''}<p><b>Weather quality ${s.weather.toFixed(1)}/100</b><br>Higher weather quality means a lower reluctance score.</p><div class="breakdown">${rows.map(([name,value,weight])=>`<div class="break-row"><span>${name}<br><small>${weight}</small></span><div class="bar"><i style="width:${value}%"></i></div><b>${value.toFixed(1)}</b></div>`).join('')}</div><div class="formula"><b>How that becomes ${s.value.toFixed(1)}/10</b><br>(100 − unrounded weather quality) ÷ 10 = ${s.weatherPoints.toFixed(2)}${s.severe?' → severe-weather minimum 9.5':''} → ${s.value.toFixed(1)}/10<br>100% weather. Calculated before rounding.</div><div class="provider"><b>Blended daytime forecast</b><br>${w.temp.toFixed(1)}°C · feels ${w.feels.toFixed(1)}°C · wind ${num(w.wind)} mph · gusts ${num(w.gust)} mph<br>${w.rain.toFixed(1)} mm rain · peak hourly rain chance ${num(w.prob)}%<small>Peak hourly probability is not the probability of rain over the whole day. Measurements cover 09:00–16:00 UK time; equal-weight model averages are scored. Fetched ${esc(new Date(w.fetched).toLocaleString('en-GB',{timeZone:'Europe/London'}))} UK time.</small></div>${w.sources.map(m=>`<div class="provider"><b>${esc(m.model)}</b><br>${m.temp.toFixed(1)}°C · feels ${m.feels.toFixed(1)}°C · wind ${num(m.wind)} mph · gusts ${num(m.gust)} mph<br>${m.rain.toFixed(1)} mm · peak hourly rain chance ${num(m.prob)}%<small>${FT.severeConditions(m)?'Severe conditions forecast.':'No severe threshold reached.'}</small></div>`).join('')}${w.modelDisagree?'<p class="danger">Forecasters disagree. A spread of at least 5°C, 10 mph wind or 4 mm rain triggers this flag. Check the individual models before deciding.</p>':''}${w.missingModels?.length?`<p>Incomplete or unavailable: ${w.missingModels.map(esc).join(', ')}. Excluded from the blend.</p>`:''}${s.severeSources.length?`<p class="danger">Severe forecast from: ${s.severeSources.map(esc).join(', ')}. ${s.severe?'The 9.5 minimum applies.':'One forecast alone does not force the minimum.'}</p>`:''}<p>Days 4–7 are a planning steer. This score does not measure forecast confidence or course-open status.</p></div>`;
    $('detail').showModal();
  }
  async function refresh() {
    const list = isClub ? [currentCourse()] : homeResults().slice(0,visible).flatMap(displayedCourses);
    const jobs = list.map(c=>requestForecast(c,true));
    if (isClub) renderForecast(currentCourse()); else renderHome();
    await Promise.all(jobs);
  }
  function cancelLocation() {
    ++locationRequest; clearTimeout(locationTimer);clearTimeout(postcodeTimer);
    if (locationPending) {locationPending=false;locationStatus('');if(!isClub){$('search-submit').disabled=false;$('search-submit').textContent='Search';}}
  }
  function setView(next) {
    cancelLocation();
    hideSearchPreview();
    if(next==='favourites'){query='';area='';$('club-search').value='';$('area-filter').value='';renderSearchPreview();}
    view=next; visible=pageSize; renderHome();
  }
  function searchMessage(text,error=false) {
    $('search-status').textContent=text;
    $('search-status').className=error?'search-status error':'search-status';
  }
  function hideSearchPreview() { $('search-preview').hidden=true; }
  function renderSearchPreview() {
    const input=FTGCore.searchInput($('club-search').value), panel=$('search-preview');
    $('club-search').setAttribute('aria-invalid','false');
    $('search-submit').disabled=false;
    panel.innerHTML='';panel.hidden=true;
    if(input.kind==='empty'){
      $('search-submit').textContent='Search';
      searchMessage('Club matches appear as you type. Postcodes find nearby clubs after a short pause.');return;
    }
    if(input.kind==='postcode' || input.kind==='partial-postcode'){
      $('search-submit').textContent='Find nearby';
      searchMessage(FTGCore.postcodeLookup(input.value)?'Pause typing to see nearby clubs, or choose Find nearby.':'Keep typing a postcode district (e.g. CV37), sector (CV37 8) or full postcode.');return;
    }
    const list=FTGCore.results(clubs,{query:input.value,area,origin});
    $('search-submit').textContent=list.length?'Show clubs':'Search';
    searchMessage(list.length?`${list.length} matching club${list.length===1?'':'s'}. Open a match below, or show the matching forecasts.`:'No matching clubs. Try another name, a postcode or clear the county filter.',!list.length);
    showSearchMatches(list,FTGCore.fold(input.value).split(' ').filter(Boolean));
  }
  function showSearchMatches(list,words=[],nearby=false) {
    const panel=$('search-preview');
    panel.innerHTML='<ul>'+list.slice(0,4).map(club=>{
      const matches=words.length?club.courses.filter(c=>words.every(w=>FTGCore.fold(club.name+' '+c.name).includes(w))):[];
      const course=matches.length===1?matches[0]:null;
      return `<li><a href="${course?FTGCore.courseURL(course):FTGCore.clubURL(club)}"><strong>${esc(club.name)}</strong><span>${esc(club.area)}${course && club.courses.length>1?' · '+esc(course.name):''}${nearby?' · '+club.distance.toFixed(1)+' miles':''}</span></a></li>`;
    }).join('')+'</ul>'+(list.length>4?`<button type="button" class="preview-all" id="search-all">${nearby?'Show nearby forecasts':`Show all ${list.length} matching clubs`}</button>`:'');
    panel.hidden=!list.length;
  }
  function schedulePostcode() {
    const lookup=FTGCore.postcodeLookup($('club-search').value);
    if(lookup)postcodeTimer=setTimeout(()=>postcode($('club-search').value,{automatic:true}),450);
  }
  function focusResults() {
    hideSearchPreview();
    $('results-title').focus({preventScroll:true});
    $('results-title').scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  async function submitSearch(event) {
    event?.preventDefault();cancelLocation();hideSearchPreview();
    const input=FTGCore.searchInput($('club-search').value);
    if(input.kind==='partial-postcode' && !FTGCore.postcodeLookup(input.value)){
      searchMessage('Enter a postcode district (CV37), sector (CV37 8) or full UK postcode.',true);
      $('club-search').setAttribute('aria-invalid','true');return;
    }
    if(FTGCore.postcodeLookup(input.value)){await postcode(input.value);return;}
    query=input.value;view='nearby';visible=pageSize;renderHome();
    searchMessage(query?`Showing forecasts for clubs matching “${query}”.`:'Showing clubs in your selected area.');
    focusResults();
  }
  async function lookupPostcode(lookup) {
    if(!postcodeCache.has(lookup.path)){
      const request=getJSON('https://api.postcodes.io/'+lookup.path).then(data=>{
        const rows=Array.isArray(data.result)?data.result:[data.result];
        const points=rows.filter(r=>r && FTGCore.validPoint({lat:r.latitude,lon:r.longitude}));
        if(!points.length)throw Error('Postcode not found');
        // Prefix matches are capped by the provider: this is a representative area, not an exact sector boundary.
        const district=points[0].admin_district;
        const label=(Array.isArray(district)?district.join(', '):district)||'chosen postcode area';
        return {lat:points.reduce((sum,r)=>sum+r.latitude,0)/points.length,lon:points.reduce((sum,r)=>sum+r.longitude,0)/points.length,label:label+(lookup.approximate?' (approximate area)':'')};
      }).catch(error=>{postcodeCache.delete(lookup.path);throw error;});
      postcodeCache.set(lookup.path,request);
    }
    return postcodeCache.get(lookup.path);
  }
  async function postcode(value,{automatic=false}={}) {
    const lookup=FTGCore.postcodeLookup(value);
    if(!lookup)return;
    const token=++locationRequest;locationPending=true;
    $('search-submit').disabled=!automatic;$('search-submit').textContent=automatic?'Find nearby':'Finding…';
    searchMessage(`Finding clubs near ${lookup.value}…`);
    if(!automatic)locationStatus('');
    try {
      const point=await lookupPostcode(lookup);
      if(token!==locationRequest)return;
      locationPending=false;
      $('search-submit').disabled=false;$('search-submit').textContent='Find nearby';
      if(automatic){
        showSearchMatches(FTGCore.results(clubs,{origin:point}),[],true);
        searchMessage(`Clubs nearest ${lookup.value}${lookup.approximate?' (approximate area)':''}. Keep typing to refine, open a club or choose Find nearby for forecasts.`);
        return;
      }
      origin=point;query='';area='';$('area-filter').value='';
      locationStatus('Area updated for this visit. “Remember this area” is under County & saved area.');
      setView('nearby');
      searchMessage(`Showing nearest clubs around ${origin.label}.`);focusResults();
    }catch{
      if(token===locationRequest){locationPending=false;hideSearchPreview();searchMessage('Couldn’t find that postcode or area. Keep typing, check it or try a club name.',true);$('club-search').setAttribute('aria-invalid','true');}
    }finally{
      if(token===locationRequest){$('search-submit').disabled=false;$('search-submit').textContent='Find nearby';}
    }
  }
  function locationStatus(text,error=false) { $('location-status').textContent=text; $('location-status').className=error?'status error':'status'; }
  function nearMe() {
    query='';area='';$('club-search').value='';$('area-filter').value='';renderSearchPreview();
    const token=++locationRequest; clearTimeout(locationTimer);clearTimeout(postcodeTimer);
    locationPending=true;
    function fallback(message) {
      if(token!==locationRequest)return;
      clearTimeout(locationTimer); locationPending=false;
      origin ||= defaultOrigin();
      locationStatus(message+(origin ? ` Using ${origin.label} instead.` : ' Enter a postcode or search by club name.'),true);
      setView('nearby');
    }
    if (!navigator.geolocation) { fallback('Location isn’t available in this browser.'); return; }
    locationStatus('Finding nearby clubs. Your browser may ask for location permission…');
    // The browser timeout may exclude time spent waiting for permission.
    locationTimer=setTimeout(()=>fallback('Location wasn’t provided in time.'),15000);
    try {
      navigator.geolocation.getCurrentPosition(p=>{
        if(token!==locationRequest)return;
        clearTimeout(locationTimer);
        const point={lat:p.coords.latitude,lon:p.coords.longitude};
        if(!FTGCore.validPoint(point)){fallback('Your device couldn’t provide a valid location.');return;}
        locationPending=false;
        origin={...point,label:'your current location'};
        locationStatus('Nearest clubs first, using your device location for this visit.');
        setView('nearby');
      },()=>fallback('Location unavailable or permission declined.'),{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
    } catch { fallback('Location isn’t available in this browser.'); }
  }
  function bind() {
    document.addEventListener('click',event=>{
      if(!isClub && event.target.closest('#search-all')){submitSearch();return;}
      const save=event.target.closest('[data-save]');
      if(save){if(!isClub)cancelLocation();const id=save.dataset.save;const ok=prefs.toggle(id);if(isClub)renderForecast(currentCourse());else renderHome();announce(ok?(saved(id)?'Club saved on this browser.':'Club removed from favourites.'):'Browser storage is unavailable. Your choices work for this visit but won’t be remembered.',!ok);return;}
      const day=event.target.closest('[data-day]');if(day){detail(day.dataset.owner,Number(day.dataset.day));return;}
      const retry=event.target.closest('[data-retry]');if(retry){const c=courses.find(c=>c.id===retry.dataset.retry);if(c)requestForecast(c,true);return;}
      if(event.target.closest('.close'))$('detail').close();
    });
    $('reset-preferences').addEventListener('click',()=>{if(!isClub)cancelLocation();const ok=prefs.reset();origin=isClub?null:defaultOrigin();if(isClub)renderForecast(currentCourse());else{view='nearby';locationStatus('Using Stratford-on-Avon Golf Club as the starting area.');renderHome();}announce(ok?'Saved clubs and area cleared. Analytics preferences are unchanged.':'Preferences cleared for this visit; browser storage is unavailable.',!ok);});
    if(isClub){
      $('course-picker')?.addEventListener('change',e=>{const c=courses.find(c=>c.id===e.target.value);if(c)location.assign(FTGCore.courseURL(c));});
      $('refresh').addEventListener('click',refresh);
      $('share').addEventListener('click',async()=>{
        const c=currentCourse(),url='https://fuckthat.golf'+FTGCore.courseURL(c);
        try{if(navigator.share){await navigator.share({title:c.full+' · Fuck That!',url});announce('Club link shared.');}else if(navigator.clipboard){await navigator.clipboard.writeText(url);announce('Club link copied.');}else{announce('Share this club using the address in your browser.');}}catch(e){if(e.name!=='AbortError')announce('Couldn’t share automatically. Copy the address from your browser.',true);}
      });
    }else{
      $('club-search').addEventListener('input',()=>{cancelLocation();renderSearchPreview();schedulePostcode();if(!$('club-search').value.trim()){query='';view='nearby';visible=pageSize;renderHome();}});
      $('club-search').addEventListener('focus',()=>{renderSearchPreview();clearTimeout(postcodeTimer);schedulePostcode();});
      $('club-search').addEventListener('keydown',event=>{if(event.key==='Escape'){cancelLocation();hideSearchPreview();renderHome();}});
      $('search-form').addEventListener('submit',submitSearch);
      $('edit-search').addEventListener('click',()=>{$('club-search').focus();$('club-search').scrollIntoView({block:'center',behavior:'smooth'});});
      $('area-filter').addEventListener('change',e=>{cancelLocation();area=e.target.value;query=FTGCore.searchInput($('club-search').value).kind==='name'?$('club-search').value.trim():'';view='nearby';visible=pageSize;renderHome();renderSearchPreview();focusResults();});
      $('clear-filters').addEventListener('click',()=>{cancelLocation();query='';area='';$('club-search').value='';$('area-filter').value='';visible=pageSize;view='nearby';renderHome();renderSearchPreview();});
      $('view-favourites').addEventListener('click',()=>setView('favourites'));
      $('view-nearby').addEventListener('click',()=>setView('nearby'));
      $('load-more').addEventListener('click',()=>{cancelLocation();visible+=pageSize;renderHome();});
      $('refresh-shortlist').addEventListener('click',refresh);
      $('near-me').addEventListener('click',nearMe);
      $('remember-area').addEventListener('click',()=>{if(!origin)return;const ok=prefs.remember({...origin,label:origin.label==='your current location'?'saved area':origin.label});announce(ok?'Approximate area saved on this browser. Your precise location was not saved.':'Couldn’t save this area. It still works for this visit.',!ok);});
      $('forget-area').addEventListener('click',()=>{cancelLocation();const ok=prefs.forgetArea();origin=defaultOrigin();locationStatus('Using Stratford-on-Avon Golf Club as the starting area.');renderHome();announce(ok?'Saved area cleared.':'Area cleared for this visit; browser storage is unavailable.',!ok);});
    }
    window.addEventListener('storage',event=>{if(event.key===FTGCore.key || event.key===null){prefs.sync();if(isClub)renderForecast(currentCourse());else renderHome();}});
    window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
  }
  async function init() {
    try {
      const catalogue=await getJSON('/2026-11-28-clubs.json');
      clubs=catalogue.clubs.map(club=>({...club,courses:club.courses.map(c=>({...c,clubId:club.id,singleCourse:club.courses.length===1,full:club.courses.length===1?club.name:club.name+' · '+c.name,lat:c.lat??club.lat,lon:c.lon??club.lon}))}));
      courses=clubs.flatMap(c=>c.courses);
      let storage;try{storage=localStorage;}catch{storage={getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}};}
      prefs=FTGCore.preferences(storage,courses.map(c=>c.id));origin=prefs.state.area || (isClub?null:defaultOrigin());
      bind();
      if(!prefs.persistent)announce('Browser storage is unavailable. Choices work for this visit but may not be remembered.',true);
      if(isClub){const c=currentCourse();if(!c)throw Error('This course is not in the current directory.');requestForecast(c);renderForecast(c);}
      else{
        FTGDirectory.mount($('club-directory'),clubs);
        const hasSaved=prefs.state.favourites.length>0;
        view=hasSaved?'favourites':'nearby';
        $('area-filter').innerHTML='<option value="">All areas</option>'+[...new Set(clubs.map(c=>c.area))].sort().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
        // Show a usable directory immediately, but wait for the location result
        // before fetching the first shortlist to avoid requesting the wrong six.
        renderHome({loadForecasts:hasSaved});
        if(!hasSaved)nearMe();
      }
    }catch{announce('The club catalogue couldn’t load. Refresh this page to retry, or open the full directory under Browse all clubs.',true);if($('clubs'))$('clubs').innerHTML='<div class="notice">Catalogue unavailable. Please refresh to retry.</div>';if($('status'))$('status').textContent='Catalogue unavailable. Please refresh this page.';}
  }
  const ready=init();
  return {ready,refresh,detail};
})();
