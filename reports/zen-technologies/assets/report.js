/* ---------- theme ---------- */
const root=document.documentElement, tb=document.getElementById('themebtn');
const prefDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(prefDark?'dark':'light');
function setTheme(t){root.setAttribute('data-theme',t);tb.textContent=t==='dark'?'Switch to light':'Switch to dark';}
tb.onclick=()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');

/* ---------- tooltip ---------- */
const tip=document.getElementById('tip');
function bindTip(el,html){
  el.addEventListener('mouseenter',e=>{tip.innerHTML=html;tip.style.opacity='1';});
  el.addEventListener('mousemove',e=>{
    const pad=14;let x=e.clientX+pad,y=e.clientY+pad;
    const r=tip.getBoundingClientRect();
    if(x+r.width>innerWidth-8)x=e.clientX-r.width-pad;
    if(y+r.height>innerHeight-8)y=e.clientY-r.height-pad;
    tip.style.left=x+'px';tip.style.top=y+'px';
  });
  el.addEventListener('mouseleave',()=>{tip.style.opacity='0';});
}
const NS='http://www.w3.org/2000/svg';
function mk(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;}
function fmt(n){return n.toLocaleString('en-IN',{maximumFractionDigits:1});}

/* ---------- 1. BOM split (single stacked bar) ---------- */
(function(){
  const W=760,H=104,L=0,R=0,barY=26,barH=40;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Bill of materials 25 to 35 percent, proprietary software 65 to 75 percent'});
  const segs=[{lab:'Physical bill of materials',v:30,c:'var(--series-2)',note:'25–35% of final product cost'},
              {lab:'Proprietary software & algorithms',v:70,c:'var(--series-1)',note:'65–75% of final product cost'}];
  let x=L, total=100, avail=W-L-R-2;
  segs.forEach(s=>{
    const w=avail*s.v/total;
    const r=mk('rect',{x:x,y:barY,width:w,height:barH,rx:4,fill:s.c,class:'bar'});
    bindTip(r,`<b>${s.lab}</b><br>${s.note}`);
    svg.appendChild(r);
    const t=mk('text',{x:x+12,y:barY+barH/2+4,class:'vallabel',fill:'#fff'});
    t.textContent=s.v+'%'; svg.appendChild(t);
    const lb=mk('text',{x:x,y:barY-9,class:'axtext'}); lb.textContent=s.lab; svg.appendChild(lb);
    const nt=mk('text',{x:x,y:barY+barH+18,class:'axtext'}); nt.textContent=s.note; svg.appendChild(nt);
    x+=w+2;
  });
  document.getElementById('chart-bom').appendChild(svg);
})();

/* ---------- 2. Revenue + PAT grouped bars ---------- */
(function(){
  const data=[{y:'FY22',s:69.75,p:2.61},{y:'FY23',s:218.85,p:49.97},{y:'FY24',s:439.85,p:129.50},
              {y:'FY25',s:973.64,p:280.24},{y:'FY26',s:687.69,p:193.45}];
  const W=760,H=310,ml=52,mr=14,mt=26,mb=40;
  const pw=W-ml-mr, ph=H-mt-mb, max=1000;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Sales and PAT FY22 to FY26'});
  [0,250,500,750,1000].forEach(v=>{
    const y=mt+ph-(v/max)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-9,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=v;svg.appendChild(t);
  });
  const bandW=pw/data.length, bw=Math.min(30,bandW*0.26);
  data.forEach((d,i)=>{
    const cx=ml+bandW*i+bandW/2;
    [[d.s,'var(--series-1)','Sales',-1],[d.p,'var(--series-2)','PAT',1]].forEach(([v,c,lab,side])=>{
      const h=(v/max)*ph, y=mt+ph-h, x=cx+(side<0?-bw-1:1);
      const r=mk('rect',{x:x,y:y,width:bw,height:Math.max(h,2),rx:4,fill:c,class:'bar'});
      bindTip(r,`<b>${d.y} ${lab}</b><br>₹${fmt(v)} Cr`);
      svg.appendChild(r);
      const t=mk('text',{x:x+bw/2,y:y-6,class:'vallabel','text-anchor':'middle'});
      t.textContent=Math.round(v);svg.appendChild(t);
    });
    const xl=mk('text',{x:cx,y:mt+ph+22,class:'axtext','text-anchor':'middle'});xl.textContent=d.y;svg.appendChild(xl);
  });
  const yl=mk('text',{x:ml-9,y:mt-10,class:'axtext','text-anchor':'end'});yl.textContent='₹ Cr';svg.appendChild(yl);
  document.getElementById('chart-rev').appendChild(svg);
})();

/* ---------- 2b. AMC-eligible installed base + recurring revenue ---------- */
(function(){
  const el=document.getElementById('chart-amcbase'); if(!el)return;
  const data=[
    {y:'FY23',base:438.9,amc:35.9,proj:false},{y:'FY24',base:444.8,amc:33.2,proj:false},
    {y:'FY25',base:444.4,amc:40.0,proj:false},{y:'FY26',base:564.5,amc:40.0,proj:false},
    {y:'FY27',base:928.6,amc:72.6,proj:true},{y:'FY28',base:1813.3,amc:141.8,proj:true},
    {y:'FY29',base:2442.6,amc:191.0,proj:true},{y:'FY30',base:2372.7,amc:185.5,proj:true},
    {y:'FY31',base:2243.2,amc:175.4,proj:true}];
  const W=760,H=344,ml=56,mr=48,mt=42,mb=42;
  const pw=W-ml-mr, ph=H-mt-mb, maxB=2500, maxA=250;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'AMC eligible installed base and recurring revenue FY23 to FY31'});
  [0,625,1250,1875,2500].forEach(v=>{
    const y=mt+ph-(v/maxB)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-9,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=fmt(v);svg.appendChild(t);
    const t2=mk('text',{x:W-mr+9,y:y+4,class:'axtext'});t2.textContent=fmt(v/maxB*maxA);svg.appendChild(t2);
  });
  const bandW=pw/data.length, bw=Math.min(40,bandW*0.5);
  // forecast shading
  const fx=ml+bandW*4;
  svg.appendChild(mk('rect',{x:fx,y:mt,width:W-mr-fx,height:ph,fill:'var(--text-muted)','fill-opacity':.05}));
  const fl=mk('text',{x:fx+8,y:mt+14,class:'axtext'});fl.textContent='modelled — zero new equipment sales';svg.appendChild(fl);
  data.forEach((d,i)=>{
    const cx=ml+bandW*i+bandW/2, h=(d.base/maxB)*ph, y=mt+ph-h;
    const r=mk('rect',{x:cx-bw/2,y:y,width:bw,height:Math.max(h,2),rx:4,
      fill:'var(--series-1)','fill-opacity':d.proj?0.42:1,class:'bar'});
    bindTip(r,`<b>${d.y} eligible base</b><br>₹${fmt(d.base)} Cr of equipment inside its AMC window${d.proj?'<br><i>modelled</i>':''}`);
    svg.appendChild(r);
    const xl=mk('text',{x:cx,y:mt+ph+22,class:'axtext','text-anchor':'middle'});xl.textContent=d.y;svg.appendChild(xl);
  });
  const px=i=>ml+bandW*i+bandW/2, py=v=>mt+ph-(v/maxA)*ph;
  const solid=data.slice(0,4), dash=data.slice(3);
  [[solid,'none'],[dash,'6 4']].forEach(([seg,da])=>{
    const off=(seg===dash)?3:0;
    svg.appendChild(mk('path',{d:seg.map((d,j)=>`${j?'L':'M'}${px(j+off)},${py(d.amc)}`).join(' '),
      fill:'none',stroke:'var(--series-2)','stroke-width':2.4,'stroke-dasharray':da,'stroke-linejoin':'round'}));
  });
  data.forEach((d,i)=>{
    const c=mk('circle',{cx:px(i),cy:py(d.amc),r:5,fill:d.proj?'var(--surface-1)':'var(--series-2)',
      stroke:'var(--series-2)','stroke-width':2.2});
    bindTip(c,`<b>${d.y} AMC revenue</b><br>₹${fmt(d.amc)} Cr${d.proj?'<br><i>modelled at 7.8% attach</i>':'<br><i>actual</i>'}`);
    svg.appendChild(c);
    const t=mk('text',{x:px(i),y:py(d.amc)-11,class:'vallabel','text-anchor':'middle'});
    t.textContent=Math.round(d.amc);svg.appendChild(t);
  });
  const yl=mk('text',{x:2,y:14,class:'axtext'});yl.textContent='◼ Eligible base, ₹ Cr';svg.appendChild(yl);
  const yr=mk('text',{x:W-2,y:14,class:'axtext','text-anchor':'end'});yr.textContent='AMC revenue, ₹ Cr ●';svg.appendChild(yr);
  el.appendChild(svg);
})();

/* ---------- 2c. AMC projection scenarios ---------- */
(function(){
  const el=document.getElementById('chart-amcproj'); if(!el)return;
  const yrs=['FY26','FY27','FY28','FY29','FY30','FY31'];
  const series=[
    {n:'Broker case (L=15, r=10%)',c:'var(--series-3)',v:[40.0,110.1,203.4,265.2,261.5,255.2]},
    {n:'Management case (L=10, r=10%)',c:'var(--series-2)',v:[40.0,92.9,181.3,244.3,237.3,224.3]},
    {n:'Fitted (L=10, r=7.8%)',c:'var(--series-1)',v:[40.0,72.6,141.8,191.0,185.5,175.4]}];
  const W=760,H=322,ml=52,mr=74,mt=38,mb=42;
  const pw=W-ml-mr, ph=H-mt-mb, max=280;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Projected AMC revenue FY26 to FY31 under three parameterisations'});
  [0,70,140,210,280].forEach(v=>{
    const y=mt+ph-(v/max)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-9,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=v;svg.appendChild(t);
  });
  const px=i=>ml+(pw/(yrs.length-1))*i, py=v=>mt+ph-(v/max)*ph;
  // band between highest and lowest
  const hi=series[0].v, lo=series[2].v;
  svg.appendChild(mk('path',{d:hi.map((v,i)=>`${i?'L':'M'}${px(i)},${py(v)}`).join(' ')+' '+
    lo.map((v,i)=>`L${px(lo.length-1-i)},${py(lo[lo.length-1-i])}`).join(' ')+' Z',
    fill:'var(--series-1)','fill-opacity':.07,stroke:'none'}));
  yrs.forEach((y,i)=>{const t=mk('text',{x:px(i),y:mt+ph+22,class:'axtext','text-anchor':'middle'});t.textContent=y;svg.appendChild(t);});
  series.forEach(s=>{
    svg.appendChild(mk('path',{d:s.v.map((v,i)=>`${i?'L':'M'}${px(i)},${py(v)}`).join(' '),
      fill:'none',stroke:s.c,'stroke-width':2.4,'stroke-dasharray':'6 4','stroke-linejoin':'round','stroke-linecap':'round'}));
    s.v.forEach((v,i)=>{
      const c=mk('circle',{cx:px(i),cy:py(v),r:5,fill:i?'var(--surface-1)':s.c,stroke:s.c,'stroke-width':2.2});
      bindTip(c,`<b>${yrs[i]} — ${s.n}</b><br>₹${fmt(v)} Cr${i?'<br><i>modelled, no new equipment sales</i>':'<br><i>actual</i>'}`);
      svg.appendChild(c);
    });
  });
  series.forEach(s=>{
    const t=mk('text',{x:px(yrs.length-1)+9,y:py(s.v[s.v.length-1])+4,class:'vallabel',fill:s.c});
    t.textContent='₹'+Math.round(s.v[s.v.length-1])+' Cr';svg.appendChild(t);
  });
  const a=mk('text',{x:px(0)+6,y:py(40)+20,class:'axtext'});a.textContent='FY26 actual ₹40 Cr';svg.appendChild(a);
  const yl=mk('text',{x:2,y:14,class:'axtext'});yl.textContent='Recurring revenue, ₹ Cr';svg.appendChild(yl);
  el.appendChild(svg);
})();

/* ---------- 3. EBITDA margin line ---------- */
(function(){
  const data=[{y:'FY22',v:14.26},{y:'FY23',v:36.49},{y:'FY24',v:44.49},{y:'FY25',v:44.36},
              {y:'FY26',v:48.37},{y:'Q1 FY27',v:27.40}];
  const W=760,H=250,ml=46,mr=44,mt=28,mb=38;
  const pw=W-ml-mr, ph=H-mt-mb, max=55;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'EBITDA margin trend'});
  [0,15,30,45].forEach(v=>{
    const y=mt+ph-(v/max)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-9,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=v+'%';svg.appendChild(t);
  });
  const step=pw/(data.length-1);
  const pts=data.map((d,i)=>[ml+step*i, mt+ph-(d.v/max)*ph]);
  svg.appendChild(mk('path',{d:'M'+pts.map(p=>p.join(' ')).join(' L '),fill:'none',
    stroke:'var(--series-1)','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'}));
  data.forEach((d,i)=>{
    const [x,y]=pts[i];
    svg.appendChild(mk('circle',{cx:x,cy:y,r:6,fill:'var(--surface-1)',stroke:'var(--series-1)','stroke-width':2}));
    const hit=mk('circle',{cx:x,cy:y,r:17,fill:'transparent',class:'bar'});
    bindTip(hit,`<b>${d.y}</b><br>EBITDA margin ${d.v}%`);svg.appendChild(hit);
    const t=mk('text',{x:x,y:y-15,class:'vallabel','text-anchor':i===data.length-1?'end':'middle'});
    t.textContent=d.v+'%';svg.appendChild(t);
    const xl=mk('text',{x:x,y:mt+ph+22,class:'axtext','text-anchor':'middle'});xl.textContent=d.y;svg.appendChild(xl);
  });
  document.getElementById('chart-margin').appendChild(svg);
})();

/* ---------- 4. ROCE decline ---------- */
(function(){
  const data=[{y:'FY24',v:46},{y:'FY25',v:23.63},{y:'FY26',v:16}];
  const W=360,H=200,ml=42,mr=14,mt=22,mb=34;
  const pw=W-ml-mr, ph=H-mt-mb, max=50;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'ROCE decline FY24 to FY26'});
  [0,25,50].forEach(v=>{
    const y=mt+ph-(v/max)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-8,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=v+'%';svg.appendChild(t);
  });
  const band=pw/data.length,bw=Math.min(46,band*0.5);
  data.forEach((d,i)=>{
    const x=ml+band*i+(band-bw)/2, h=(d.v/max)*ph, y=mt+ph-h;
    const r=mk('rect',{x:x,y:y,width:bw,height:h,rx:4,fill:'var(--series-2)',class:'bar'});
    bindTip(r,`<b>${d.y}</b><br>ROCE ${d.v}%`);svg.appendChild(r);
    const t=mk('text',{x:x+bw/2,y:y-6,class:'vallabel','text-anchor':'middle'});t.textContent=d.v+'%';svg.appendChild(t);
    const xl=mk('text',{x:x+bw/2,y:mt+ph+20,class:'axtext','text-anchor':'middle'});xl.textContent=d.y;svg.appendChild(xl);
  });
  document.getElementById('chart-roce').appendChild(svg);
})();

/* ---------- 5. Working capital days ---------- */
(function(){
  const data=[{y:'FY25',v:283},{y:'FY26',v:543}];
  const W=360,H=200,ml=44,mr=14,mt=22,mb=34;
  const pw=W-ml-mr, ph=H-mt-mb, max=600;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Working capital days 283 to 543'});
  [0,200,400,600].forEach(v=>{
    const y=mt+ph-(v/max)*ph;
    svg.appendChild(mk('line',{x1:ml,x2:W-mr,y1:y,y2:y,class:'gridline'}));
    const t=mk('text',{x:ml-8,y:y+4,class:'axtext','text-anchor':'end'});t.textContent=v;svg.appendChild(t);
  });
  const band=pw/data.length,bw=Math.min(62,band*0.46);
  data.forEach((d,i)=>{
    const x=ml+band*i+(band-bw)/2, h=(d.v/max)*ph, y=mt+ph-h;
    const r=mk('rect',{x:x,y:y,width:bw,height:h,rx:4,fill:i===1?'var(--series-2)':'var(--series-1)',class:'bar'});
    bindTip(r,`<b>${d.y}</b><br>${d.v} working capital days`);svg.appendChild(r);
    const t=mk('text',{x:x+bw/2,y:y-6,class:'vallabel','text-anchor':'middle'});t.textContent=d.v;svg.appendChild(t);
    const xl=mk('text',{x:x+bw/2,y:mt+ph+20,class:'axtext','text-anchor':'middle'});xl.textContent=d.y;svg.appendChild(xl);
  });
  const note=mk('text',{x:ml+pw/2,y:mt-8,class:'axtext','text-anchor':'middle'});note.textContent='days';svg.appendChild(note);
  document.getElementById('chart-wc').appendChild(svg);
})();

/* ---------- 6. Order book composition ---------- */
(function(){
  const rows=[
    {lab:'By type',segs:[{n:'Equipment',v:920.59,c:'var(--series-1)'},{n:'AMC',v:318.43,c:'var(--series-3)'}]},
    {lab:'By geography',segs:[{n:'Domestic',v:1153.77,c:'var(--series-1)'},{n:'Export',v:85.25,c:'var(--series-3)'}]}
  ];
  const W=760,H=176,ml=104,mr=14,mt=18,barH=38,gap=44;
  const pw=W-ml-mr, total=1239.02;
  const svg=mk('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Order book composition by type and geography'});
  rows.forEach((row,ri)=>{
    const y=mt+ri*(barH+gap);
    const lb=mk('text',{x:ml-12,y:y+barH/2+4,class:'axtext','text-anchor':'end'});lb.textContent=row.lab;svg.appendChild(lb);
    let x=ml;
    row.segs.forEach(s=>{
      const w=(pw-2)*s.v/total;
      const r=mk('rect',{x:x,y:y,width:w,height:barH,rx:4,fill:s.c,class:'bar'});
      bindTip(r,`<b>${s.n}</b><br>₹${fmt(s.v)} Cr · ${(s.v/total*100).toFixed(1)}%`);
      svg.appendChild(r);
      const pct=(s.v/total*100).toFixed(1)+'%';
      if(w>72){const t=mk('text',{x:x+12,y:y+barH/2+4,class:'vallabel',fill:'#fff'});t.textContent=pct;svg.appendChild(t);}
      const wide=w>72;
      const nt=mk('text',{x:wide?x:x+w,y:y+barH+17,class:'axtext',
        'text-anchor':wide?'start':'end'});
      nt.textContent=`${s.n} ₹${fmt(s.v)} Cr${wide?'':' · '+pct}`;svg.appendChild(nt);
      x+=w+2;
    });
  });
  document.getElementById('chart-ob').appendChild(svg);
})();

/* ---------- scrollspy ---------- */
const links=[...document.querySelectorAll('.nav a')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
const io=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      const i=secs.indexOf(e.target);
      links.forEach(l=>l.classList.remove('active'));
      if(i>-1)links[i].classList.add('active');
    }
  });
},{rootMargin:'-15% 0px -70% 0px',threshold:0});
secs.forEach(s=>s&&io.observe(s));
