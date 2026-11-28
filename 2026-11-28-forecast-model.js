'use strict';
const FT = (() => {
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const round=n=>Math.round(n*10)/10;
  const severeConditions=w=>w.wind>=30||w.gust>=45||w.feels<=-5||w.feels>=38||(w.codes||[]).some(c=>[56,57,66,67,71,73,75,77,85,86,95,96,99].includes(c));
  function score(w){
    const required=['wind','gust','rain','prob','temp','feels'];
    if(!required.every(k=>Number.isFinite(w[k]))) return null;
    const comfort=t=>100-clamp(Math.max(18-t,t-24,0)*5);
    const wind=100-clamp(Math.max((w.wind-6)*3,(w.gust-18)*2,0));
    const rain=100-clamp(w.rain*15*.75+w.prob*.25);
    const temp=comfort(w.temp),feels=comfort(w.feels);
    const bbcTemp=w.bbc&&Number.isFinite(w.bbc.temp)?comfort(w.bbc.temp):null;
    const blended=bbcTemp===null?temp:.75*temp+.25*bbcTemp;
    const weather=wind*.35+rain*.35+blended*.15+feels*.15;
    const weatherPoints=(100-weather)/10;
    // Count forecasts, not severe hours/hazards or the blended union of weather codes.
    const severeSources=(w.sources||[w]).filter(severeConditions).map(s=>s.model||'Open-Meteo automatic fallback');
    if(/thunder|snow|sleet|ice|hail/i.test(w.bbc?.condition||''))severeSources.push('BBC Weather');
    const severe=severeSources.length>=2;
    const raw=weatherPoints;
    const value=round(clamp(severe?Math.max(raw,9.5):raw,0,10));
    return {value,weather:round(weather),wind:round(wind),rain:round(rain),temp:round(blended),feels:round(feels),weatherPoints,severe,severeSources,bbcTemp,disagree:!!w.modelDisagree||(bbcTemp!==null&&Math.abs(w.temp-w.bbc.temp)>=5)};
  }
  const band=value=>value<5?'good':value<8?'mid':'bad';
  function reason(w,s){
    if(s.severe)return 'The weather’s properly fucked. Even your all-weather mate can sit this bastard out.';
    if(s.disagree)return 'The forecasters can’t agree worth a fuck. Check the individual forecasts before deciding.';
    if(s.value<5)return 'The weather gets a yes. Find your golf shoes and stop negotiating with the sofa.';
    if(s.value<8)return 'Could be a round. Could be the pub. Check the wind, rain and temperature before committing.';
    const worst=[['wind',s.wind],['rain',s.rain],['feels',s.feels],['temperature',s.temp]].sort((a,b)=>a[1]-b[1])[0];
    if(worst[0]==='wind')return 'The wind is doing its best to cancel the round. We’d give this one a miss.';
    if(worst[0]==='rain')return 'Too much rain for our enthusiasm. The golf bag can have the day off.';
    return (worst[0]==='feels'?w.feels:w.temp)>24?'Hot as fuck. Our enthusiasm has melted. We’d give this round a miss.':'Cold as fuck. We’re voting for somewhere with a roof and a kettle.';
  }
  const ukDate=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  function bbcRecords(xml,now=new Date()){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))throw Error('BBC returned invalid XML');
    const issued=doc.querySelector('channel > pubDate')?.textContent;
    const issue=new Date(issued);
    if(!Number.isFinite(+issue)||now-issue>36*3600000||issue-now>3600000)throw Error('BBC feed is out of date');
    return [...doc.querySelectorAll('item')].map(item=>{
      const title=item.querySelector('title')?.textContent||'';
      const description=item.querySelector('description')?.textContent||'';
      const guid=item.querySelector('guid')?.textContent||'';
      const match=guid.match(/-(\d)-(\d{4}-\d{2}-\d{2})T/);
      if(!match)return null;
      const date=new Date(match[2]+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+Number(match[1]));
      const tempMatch=description.match(/Maximum Temperature:\s*(-?\d+(?:\.\d+)?)\s*°?C/i);
      const condition=title.replace(/^[^:]+:\s*/,'').split(',')[0];
      return {date:date.toISOString().slice(0,10),temp:tempMatch?Number(tempMatch[1]):null,condition,issued:issue.toISOString()};
    }).filter(Boolean);
  }
  function normalise(data,bbc=[],now=new Date()){
    const h=data.hourly,d=data.daily;
    if(!h?.time||!d?.time)throw Error('Forecast is missing hourly data');
    const keys=['temperature_2m','apparent_temperature','precipitation','precipitation_probability','wind_speed_10m','wind_gusts_10m','weather_code'];
    const fields=['temp','feels','rain','prob','wind','gust','code'];
    return d.time.slice(0,7).map(date=>{
      const ids=h.time.map((t,i)=>({t,i})).filter(({t})=>t.startsWith(date)&&Number(t.slice(11,13))>=9&&Number(t.slice(11,13))<16).map(x=>x.i);
      if(ids.length!==7)return {date,error:'Incomplete daytime forecast'};
      const values={};
      for(let k=0;k<keys.length;k++){
        const arr=ids.map(i=>h[keys[k]]?.[i]);
        if(!arr.every(x=>typeof x==='number'&&Number.isFinite(x)))return {date,error:'Missing weather measurements'};
        values[fields[k]]=arr;
      }
      const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
      return {date,temp:mean(values.temp),feels:mean(values.feels),rain:values.rain.reduce((x,y)=>x+y,0),prob:Math.max(...values.prob),wind:Math.max(...values.wind),gust:Math.max(...values.gust),codes:values.code,bbc:bbc.find(x=>x.date===date),fetched:now.toISOString()};
    });
  }
  const models=[{id:'ukmo_seamless',name:'UK Met Office'},{id:'ecmwf_ifs025',name:'ECMWF IFS'},{id:'gfs_seamless',name:'NOAA GFS'},{id:'icon_seamless',name:'DWD ICON'}];
  function multiNormalise(data,bbc=[],now=new Date()){
    if(!data.hourly||!data.daily?.time)throw Error('Forecast is missing hourly data');
    // Explicit model families only: do not count best_match again alongside its inputs.
    const available=models.filter(m=>Object.hasOwn(data.hourly,'temperature_2m_'+m.id));
    const sourceModels=available.length?available:[{id:'best_match',name:'Open-Meteo automatic fallback'}];
    const series=sourceModels.map(m=>{
      const hourly={time:data.hourly.time};
      for(const k of ['temperature_2m','apparent_temperature','precipitation','precipitation_probability','wind_speed_10m','wind_gusts_10m','weather_code'])hourly[k]=data.hourly[m.id==='best_match'?k:k+'_'+m.id];
      return {model:m,days:normalise({...data,hourly},[],now)};
    });
    return data.daily.time.slice(0,7).map(date=>{
      const sources=series.map(x=>({...x.days.find(d=>d.date===date),model:x.model.name})).filter(w=>score(w));
      if(!sources.length)return {date,error:'No complete model forecast for this day'};
      const w={date,sources,bbc:bbc.find(b=>b.date===date),fetched:now.toISOString(),codes:[...new Set(sources.flatMap(s=>s.codes))]};
      for(const k of ['temp','feels','rain','prob','wind','gust'])w[k]=sources.reduce((n,s)=>n+s[k],0)/sources.length;
      const spread=k=>Math.max(...sources.map(s=>s[k]))-Math.min(...sources.map(s=>s[k]));
      w.modelDisagree=spread('temp')>=5||spread('wind')>=10||spread('rain')>=4;
      w.severeSources=sources.filter(severeConditions).map(s=>s.model);
      w.missingModels=models.filter(m=>!sources.some(s=>s.model===m.name)).map(m=>m.name);
      return w;
    });
  }
  return {models,severeConditions,score,reason,band,round,ukDate,bbcRecords,normalise,multiNormalise};
})();
