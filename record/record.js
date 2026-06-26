'use strict';

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const urlModule = require('url');

// ─── config ──────────────────────────────────────────────────────────────────
const APP_DIR = path.resolve(__dirname, '..');
const PORT = 3131;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.join(APP_DIR, 'docs', 'assets', 'gifs');
const VID_DIR = path.join(__dirname, 'videos');
if (!fs.existsSync(VID_DIR)) fs.mkdirSync(VID_DIR, { recursive: true });

const W = 1200, H = 800;
const TARGET = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['dashboard','checklist','schedule','dates','recipes','workout','habits','photos','notes','trash'];

// ─── local server ─────────────────────────────────────────────────────────────
const MIME = { '.html':'text/html','.js':'application/javascript','.json':'application/json',
  '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json' };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const p = urlModule.parse(req.url).pathname;
      const fp = path.join(APP_DIR, p === '/' ? 'index.html' : p);
      try {
        if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        res.end(fs.readFileSync(fp));
      } catch(e) { res.writeHead(500); res.end('Error'); }
    });
    server.listen(PORT, () => { console.log(`[server] ${BASE}`); resolve(server); });
  });
}

// ─── cursor overlay ───────────────────────────────────────────────────────────
const CURSOR_JS = `
(function(){
  function inject(){
    if(document.getElementById('_pc'))return;
    const dot=document.createElement('div');
    dot.id='_pc';
    dot.style.cssText='position:fixed;top:0;left:0;width:16px;height:16px;border-radius:50%;background:rgba(22,22,22,.92);border:2.5px solid rgba(255,255,255,.93);box-shadow:0 2px 8px rgba(0,0,0,.6);pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);transition:transform .1s;';
    const ring=document.createElement('div');
    ring.id='_pr';
    ring.style.cssText='position:fixed;top:0;left:0;width:40px;height:40px;border-radius:50%;border:2.5px solid rgba(192,106,69,.9);pointer-events:none;z-index:2147483646;transform:translate(-50%,-50%) scale(0);transition:transform .26s cubic-bezier(.17,.67,.35,.98),opacity .26s;opacity:0;';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.addEventListener('mousemove',e=>{
      dot.style.left=ring.style.left=e.clientX+'px';
      dot.style.top=ring.style.top=e.clientY+'px';
    },{passive:true});
    document.addEventListener('mousedown',()=>{
      dot.style.transform='translate(-50%,-50%) scale(.62)';
      ring.style.opacity='1';ring.style.transform='translate(-50%,-50%) scale(1.1)';
    });
    document.addEventListener('mouseup',()=>{
      dot.style.transform='translate(-50%,-50%) scale(1)';
      setTimeout(()=>{ring.style.transform='translate(-50%,-50%) scale(0)';ring.style.opacity='0';},90);
    });
  }
  if(document.body)inject();else document.addEventListener('DOMContentLoaded',inject);
})();
`;

// ─── svg photo seeds ──────────────────────────────────────────────────────────
function svgPhoto(c1, c2, label, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect x="0" y="${h-52}" width="${w}" height="52" fill="rgba(0,0,0,.3)"/><text x="${w/2}" y="${h-18}" text-anchor="middle" fill="rgba(255,255,255,.92)" font-family="Work Sans,sans-serif" font-size="16" font-weight="600">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
const PHOTOS = [
  { id:'ph0', src: svgPhoto('#C06A45','#8B3A1E','Davis Centre atrium',400,300), caption:'Davis Centre atrium' },
  { id:'ph1', src: svgPhoto('#7B8A66','#3A5028','Ring Road in the morning',400,240), caption:'Ring Road in the morning' },
  { id:'ph2', src: svgPhoto('#6E8499','#2D4F6E','Study spot in DC library',400,350), caption:'Study spot in DC library' },
  { id:'ph3', src: svgPhoto('#CA9A3E','#8B6420','SLC food court lunch',400,270), caption:'SLC food court lunch' },
  { id:'ph4', src: svgPhoto('#B5754F','#7A3A18','REZ room setup day 1',400,360), caption:'REZ room setup day 1' },
  { id:'ph5', src: svgPhoto('#8C7B62','#5C3A22','Late night QNC grind',400,255), caption:'Late night QNC grind' },
];

// ─── seed data ────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,8); }

function makeSeed({ withPhotos = false } = {}) {
  return {
    checklist: [
      {id:uid(),cat:'Admin & Accounts',label:'Activate WatIAM account',done:true},
      {id:uid(),cat:'Admin & Accounts',label:'Log in to Quest (fees, grades, enrollment)',done:true},
      {id:uid(),cat:'Admin & Accounts',label:'Set up LEARN (online course platform)',done:false},
      {id:uid(),cat:'Admin & Accounts',label:'Register on WaterlooWorks (co-op portal)',done:false},
      {id:uid(),cat:'Admin & Accounts',label:'Pick up WatCard',done:false},
      {id:uid(),cat:'Residence',label:'Twin XL sheets × 2 sets',done:true},
      {id:uid(),cat:'Residence',label:'Mattress topper',done:true},
      {id:uid(),cat:'Residence',label:'Bath towels × 3',done:false},
      {id:uid(),cat:'Residence',label:'Ethernet cable',done:false},
      {id:uid(),cat:'Residence',label:'Laundry bag + detergent pods',done:false},
      {id:uid(),cat:'Electronics & Tech',label:'Laptop + charger',done:true},
      {id:uid(),cat:'Electronics & Tech',label:'Power bar + extension cord',done:false},
      {id:uid(),cat:'Electronics & Tech',label:'USB-C hub / dongles',done:false},
      {id:uid(),cat:'Personal & Health',label:'OHIP card + vaccination records',done:false},
      {id:uid(),cat:'Personal & Health',label:'Prescription meds + OTC basics',done:false},
    ],
    classes: [
      {id:uid(),name:'MATH 117 – Calculus 1',day:'Mon',start:'08:30',end:'09:20',loc:'MC 4045',color:'#C06A45'},
      {id:uid(),name:'ECE 105 – Classical Mechanics',day:'Mon',start:'10:30',end:'11:20',loc:'PHY 313',color:'#7B8A66'},
      {id:uid(),name:'ECE 140 – Linear Circuits',day:'Mon',start:'13:30',end:'14:50',loc:'E5 6004',color:'#CA9A3E'},
      {id:uid(),name:'MATH 115 – Linear Algebra',day:'Tue',start:'08:30',end:'09:50',loc:'MC 4045',color:'#6E8499'},
      {id:uid(),name:'ECE 150 – Fundamentals of Programming',day:'Tue',start:'11:30',end:'12:50',loc:'E7 4053',color:'#B5754F'},
      {id:uid(),name:'MATH 117 – Calculus 1',day:'Wed',start:'08:30',end:'09:20',loc:'MC 4045',color:'#C06A45'},
      {id:uid(),name:'ECE 105 – Classical Mechanics',day:'Wed',start:'10:30',end:'11:20',loc:'PHY 313',color:'#7B8A66'},
      {id:uid(),name:'ECE 190 – Engineering Profession',day:'Wed',start:'13:30',end:'14:20',loc:'EIT 1015',color:'#8C7B62'},
      {id:uid(),name:'MATH 115 – Linear Algebra',day:'Thu',start:'08:30',end:'09:50',loc:'MC 4045',color:'#6E8499'},
      {id:uid(),name:'ECE 150 – Fundamentals of Programming',day:'Thu',start:'11:30',end:'12:50',loc:'E7 4053',color:'#B5754F'},
      {id:uid(),name:'MATH 117 – Calculus 1',day:'Fri',start:'08:30',end:'09:20',loc:'MC 4045',color:'#C06A45'},
      {id:uid(),name:'ECE 105 – Classical Mechanics',day:'Fri',start:'10:30',end:'11:20',loc:'PHY 313',color:'#7B8A66'},
    ],
    dates: [
      {id:uid(),title:'Residence move-in day',date:'2026-09-01'},
      {id:uid(),title:'1A classes begin',date:'2026-09-08'},
      {id:uid(),title:'Course add/drop deadline',date:'2026-09-21'},
      {id:uid(),title:'MATH 117 Midterm',date:'2026-10-15'},
      {id:uid(),title:'Fall Reading Week',date:'2026-10-26'},
      {id:uid(),title:'ECE 150 Project due',date:'2026-11-13'},
      {id:uid(),title:'Last day of 1A classes',date:'2026-12-04'},
      {id:uid(),title:'Final exams begin',date:'2026-12-07'},
    ],
    recipes: [
      {id:uid(),type:'food',name:'Microwave mug omelette',time:'5 min',
        ingredients:['2 eggs','Splash of milk','Shredded cheese','Salt + pepper','Diced ham'],
        steps:['Beat eggs + milk in a mug','Stir in cheese and add-ins','Microwave 1 min, stir','Microwave 45s more until set']},
      {id:uid(),type:'food',name:'Dorm ramen upgrade',time:'10 min',
        ingredients:['1 pack instant ramen','1 egg','Handful frozen veg','Soy sauce','Sriracha'],
        steps:['Boil noodles + veg 3 min','Crack egg in, stir gently','Add half the seasoning','Top with soy + sriracha']},
      {id:uid(),type:'food',name:'No-cook overnight oats',time:'2 min + overnight',
        ingredients:['½ cup oats','½ cup milk','1 tbsp peanut butter','Honey','Banana'],
        steps:['Mix oats + milk in a jar','Stir in PB + honey','Fridge overnight','Top with banana']},
      {id:uid(),type:'drink',name:'Iced brown sugar latte',time:'5 min',
        ingredients:['1 shot espresso','1 tbsp brown sugar','Splash hot water','Milk','Ice'],
        steps:['Dissolve sugar in hot water','Add coffee, stir','Fill glass with ice + milk','Pour over and stir']},
      {id:uid(),type:'drink',name:'Matcha latte',time:'6 min',
        ingredients:['1 tsp matcha powder','Hot water (80°C)','Oat milk','Honey','Ice (optional)'],
        steps:['Whisk matcha + 2 tbsp hot water into paste','Steam or froth oat milk','Combine, add honey to taste','Pour over ice for iced version']},
      {id:uid(),type:'drink',name:'Electrolyte study water',time:'2 min',
        ingredients:['Cold water','Pinch of salt','Squeeze of lemon','1 tsp honey'],
        steps:['Combine in bottle','Shake well','Sip during late-night study']},
    ],
    workout: {
      Mon:{label:'Push',items:[
        {id:uid(),name:'Bench press',sets:4,reps:8,weight:115,prev:110,done:false},
        {id:uid(),name:'Overhead press',sets:3,reps:10,weight:65,prev:65,done:false},
        {id:uid(),name:'Incline dumbbell',sets:3,reps:12,weight:40,prev:35,done:false},
        {id:uid(),name:'Tricep pushdown',sets:3,reps:15,weight:50,prev:50,done:false},
      ]},
      Tue:{label:'Pull',items:[
        {id:uid(),name:'Deadlift',sets:3,reps:5,weight:185,prev:175,done:false},
        {id:uid(),name:'Pull-ups',sets:4,reps:8,weight:0,prev:0,done:false},
        {id:uid(),name:'Barbell row',sets:3,reps:10,weight:95,prev:95,done:false},
        {id:uid(),name:'Bicep curls',sets:3,reps:12,weight:30,prev:25,done:false},
      ]},
      Wed:{label:'Legs',items:[
        {id:uid(),name:'Back squat',sets:4,reps:6,weight:155,prev:145,done:false},
        {id:uid(),name:'Romanian deadlift',sets:3,reps:10,weight:115,prev:115,done:false},
        {id:uid(),name:'Leg press',sets:3,reps:12,weight:230,prev:220,done:false},
        {id:uid(),name:'Calf raises',sets:4,reps:15,weight:90,prev:90,done:false},
      ]},
      Thu:{label:'Rest',items:[]},
      Fri:{label:'Upper',items:[
        {id:uid(),name:'Incline bench',sets:4,reps:8,weight:95,prev:95,done:false},
        {id:uid(),name:'Lat pulldown',sets:3,reps:12,weight:110,prev:100,done:false},
        {id:uid(),name:'Lateral raises',sets:3,reps:15,weight:15,prev:15,done:false},
      ]},
      Sat:{label:'Cardio + core',items:[
        {id:uid(),name:'Run (intervals)',sets:1,reps:1,weight:0,prev:0,done:false},
        {id:uid(),name:'Plank hold (sec)',sets:3,reps:45,weight:0,prev:0,done:false},
        {id:uid(),name:'Hanging leg raise',sets:3,reps:12,weight:0,prev:0,done:false},
      ]},
      Sun:{label:'Rest',items:[]},
    },
    habits: [
      {id:uid(),name:'Drink 8 glasses of water',done:false,streak:3},
      {id:uid(),name:'Read 20 minutes',done:true,streak:5},
      {id:uid(),name:'Make the bed',done:true,streak:8},
      {id:uid(),name:'Hit the gym',done:false,streak:2},
      {id:uid(),name:'No phone in bed',done:false,streak:1},
      {id:uid(),name:'Take vitamins',done:true,streak:6},
    ],
    photos: withPhotos ? PHOTOS : [],
    notes: [
      {id:uid(),title:'MATH 117 – Calculus I',
        body:'<p><strong>Week 5: Integration</strong></p><p>The Fundamental Theorem of Calculus connects derivatives and integrals. If F is the antiderivative of f, then the definite integral from a to b = F(b) − F(a). Most important idea of the course.</p><p>u-substitution: replace the inner function with u. Works when you spot a composite function pattern.</p><ul><li>FTC practice: section 5.3, ex. 14–22</li><li>Review u-sub feedback from assignment 3</li><li>Office hours: Wed 2–4pm, MC 5158</li></ul>',
        ts:Date.now()-172800000},
      {id:uid(),title:'Dorm room must-haves',
        body:'<ol><li>White noise machine — I sleep light</li><li>Surge protector with USB-A + USB-C ports</li><li>Cold brew maker for morning coffee</li><li>Command strips — so many command strips</li></ol><p>Also: shower caddy + flip flops for the shared bathroom.</p>',
        ts:Date.now()-7200000},
    ],
    trash: [
      {id:uid(),type:'note',name:'Draft email to advisor',item:{id:uid(),title:'Draft email to advisor',body:'Dear Prof...',ts:Date.now()-500000},deletedAt:Date.now()-100000},
      {id:uid(),type:'habit',name:'Cold shower every day',item:{id:uid(),name:'Cold shower every day',done:false,streak:0},deletedAt:Date.now()-200000},
      {id:uid(),type:'checklist',name:'Foam roller (optional)',item:{id:uid(),cat:'Personal & Health',label:'Foam roller (optional)',done:false},deletedAt:Date.now()-300000},
      {id:uid(),type:'date',name:'Engineering orientation social',item:{id:uid(),title:'Engineering orientation social',date:'2026-09-03'},deletedAt:Date.now()-400000},
    ],
  };
}

// ─── browser context factory ───────────────────────────────────────────────────
async function makeCtx(browser, seed) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } },
  });
  await ctx.route('**/*.supabase.co/**', r => r.abort());
  await ctx.route('**/supabase.co/**', r => r.abort());
  await ctx.addInitScript(seedStr => {
    try { localStorage.setItem('collegeApp_v4', seedStr); } catch(e) {}
  }, JSON.stringify(seed));
  await ctx.addInitScript(CURSOR_JS);
  return ctx;
}

// ─── interaction helpers ───────────────────────────────────────────────────────
const wait = ms => new Promise(r => setTimeout(r, ms));

async function mov(page, x, y, steps = 28) {
  await page.mouse.move(x, y, { steps });
}

async function clickEl(page, locator, opts = {}) {
  try { await locator.scrollIntoViewIfNeeded({ timeout: 4000 }); } catch(e) {}
  const box = await locator.boundingBox({ timeout: opts.timeout ?? 6000 });
  if (!box) { console.warn('no box for locator'); return; }
  const cx = box.x + box.width  * (opts.xf ?? 0.5);
  const cy = box.y + box.height * (opts.yf ?? 0.5);
  await mov(page, cx, cy, opts.ms ?? 28);
  await wait(opts.pre ?? 200);
  await page.mouse.click(cx, cy);
  await wait(opts.post ?? 320);
}

async function navSidebar(page, name) {
  await wait(200);
  // Use exact text match; avoid scrollIntoViewIfNeeded (sticky sidebar always visible)
  const el = page.getByText(name, { exact: true }).first();
  const box = await el.boundingBox({ timeout: 8000 });
  if (!box) { console.warn(`navSidebar: '${name}' not found`); return; }
  await mov(page, box.x + box.width/2, box.y + box.height/2, 28);
  await wait(200);
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  await wait(500);
}

async function fillNamed(page, nameAttr, text, delay = 62) {
  const el = page.locator(`[name="${nameAttr}"]`).first();
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (box) await mov(page, box.x + 18, box.y + box.height/2, 22);
  await wait(160);
  await el.click();
  await wait(80);
  await page.keyboard.type(text, { delay });
}

// For clicking the checkbox to the left of a label div
async function toggleByLabel(page, labelText) {
  const lbl = page.getByText(labelText, { exact: true }).first();
  await lbl.scrollIntoViewIfNeeded();
  const box = await lbl.boundingBox();
  if (!box) return;
  // Checkbox is ~26px to the left of label start (22px box + 4px gap)
  const cx = box.x - 26, cy = box.y + box.height/2;
  await mov(page, cx, cy, 26);
  await wait(180);
  await page.mouse.click(cx, cy);
  await wait(450);
}

// For clicking the × delete button to the right of a label (flex:1 stretches label)
async function deleteByLabel(page, labelText) {
  // exact: true ensures we get the leaf label div, not a parent container
  const lbl = page.getByText(labelText, { exact: true }).first();
  try { await lbl.scrollIntoViewIfNeeded({ timeout: 4000 }); } catch(e) {}
  const box = await lbl.boundingBox({ timeout: 6000 });
  if (!box) return;
  // flex:1 means label stretches; × button sits just past its right edge
  const cx = box.x + box.width + 24, cy = box.y + box.height/2;
  await mov(page, cx, cy, 26);
  await wait(200);
  await page.mouse.click(cx, cy);
  await wait(500);
}

async function smoothScroll(page, delta) {
  const steps = 20, per = delta / steps;
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, per); await wait(32); }
}

// ─── section recordings ────────────────────────────────────────────────────────

async function recDashboard(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(1400);

  // Hover over hero habit chip
  const habitChip = page.getByText('Habits today').first();
  const hBox = await habitChip.boundingBox();
  if (hBox) { await mov(page, hBox.x + hBox.width/2, hBox.y + hBox.height/2, 30); await wait(800); }

  // Hover over workout chip
  const wkChip = page.getByText("Today's workout").first();
  const wBox = await wkChip.boundingBox();
  if (wBox) { await mov(page, wBox.x + wBox.width/2, wBox.y + wBox.height/2, 26); await wait(800); }

  // Pan cursor across tile grid — Checklist tile
  const clTile = page.getByText('Move-in Checklist').first();
  const clBox = await clTile.boundingBox();
  if (clBox) { await mov(page, clBox.x + clBox.width/2, clBox.y + clBox.height/2, 30); await wait(600); }

  // Key Dates tile
  const kdTile = page.getByText('Key Dates').first();
  const kdBox = await kdTile.boundingBox();
  if (kdBox) { await mov(page, kdBox.x + kdBox.width/2, kdBox.y + kdBox.height/2, 26); await wait(500); }

  // Habits tile
  const hTile = page.getByText('Habits').first();
  const htBox = await hTile.boundingBox();
  if (htBox) { await mov(page, htBox.x + htBox.width/2, htBox.y + htBox.height/2, 26); await wait(500); }

  // Click Habits tile → navigate (use tile subtitle to find the card, then click its parent)
  const hTileEl = page.getByText('Habits').nth(1); // nth(0)=sidebar, nth(1)=tile
  await clickEl(page, hTileEl, { post: 900 });

  // Scroll down a bit in Habits
  await smoothScroll(page, 80);
  await wait(600);

  // Navigate back home via sidebar
  await navSidebar(page, 'Today');
  await wait(1000);
}

async function recChecklist(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Checklist');
  await wait(700);

  // Hover over progress bar area
  await mov(page, W/2, 220, 25);
  await wait(800);

  // Scroll down to see items
  await smoothScroll(page, 120);
  await wait(500);

  // Check off "Set up LEARN"
  await toggleByLabel(page, 'Set up LEARN (online course platform)');

  // Check off "Ethernet cable"
  await toggleByLabel(page, 'Ethernet cable');
  await wait(400);

  // Scroll to add form at bottom
  await smoothScroll(page, 900);
  await wait(700);

  // Add a new item
  await fillNamed(page, 'cl-item', 'Pill organizer');
  await wait(400);
  // Click Add button
  const addBtns = page.locator('div:text-is("Add")');
  await clickEl(page, addBtns.last(), { post: 700 });

  // Scroll back up
  await smoothScroll(page, -600);
  await wait(600);

  // Delete "Register on WaterlooWorks (co-op portal)"
  await deleteByLabel(page, 'Register on WaterlooWorks (co-op portal)');
  await wait(700);
}

async function recSchedule(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Schedule');
  await wait(700);

  // Hover over a few class cards
  const firstClass = page.getByText('MATH 117 – Calculus 1').first();
  const fcBox = await firstClass.boundingBox();
  if (fcBox) { await mov(page, fcBox.x + fcBox.width/2, fcBox.y + fcBox.height/2, 28); await wait(600); }

  const ece105 = page.getByText('ECE 105 – Classical Mechanics').first();
  const ecBox = await ece105.boundingBox();
  if (ecBox) { await mov(page, ecBox.x + ecBox.width/2, ecBox.y + ecBox.height/2, 26); await wait(500); }

  // Scroll down to see Tuesday
  await smoothScroll(page, 200);
  await wait(600);

  // Click "Add class" button (text "Add class" or shows as toggle label)
  const addClassBtn = page.getByText('Add class').first();
  await clickEl(page, addClassBtn, { post: 600 });

  // Fill class name
  await fillNamed(page, 'class-name', 'CS 136 – Algorithms');
  await wait(300);

  // Select day: Wed
  const daySelect = page.locator('[name="class-day"]').first();
  await clickEl(page, daySelect, { post: 200 });
  await daySelect.selectOption('Wed');
  await wait(400);

  // Start time
  const startInput = page.locator('[name="class-start"]').first();
  await clickEl(page, startInput, { post: 150 });
  await startInput.fill('14:30');
  await wait(300);

  // End time
  const endInput = page.locator('[name="class-end"]').first();
  await clickEl(page, endInput, { post: 150 });
  await endInput.fill('16:20');
  await wait(300);

  // Location
  await fillNamed(page, 'class-location', 'MC 4065');
  await wait(300);

  // Save
  await clickEl(page, page.getByText('Save class').first(), { post: 800 });

  // Scroll to find Wednesday section to show new class
  await smoothScroll(page, 200);
  await wait(700);

  // Delete the new class (click × next to CS 136)
  await deleteByLabel(page, 'CS 136 – Algorithms');
  await wait(700);
}

async function recDates(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Key Dates');
  await wait(700);

  // Hover over countdown badges
  const moveinBadge = page.getByText('Residence move-in day').first();
  const miBox = await moveinBadge.boundingBox();
  if (miBox) { await mov(page, miBox.x - 60, miBox.y + miBox.height/2, 30); await wait(700); }

  const midterm = page.getByText('MATH 117 Midterm').first();
  const mtBox = await midterm.boundingBox();
  if (mtBox) { await mov(page, mtBox.x - 60, mtBox.y + mtBox.height/2, 26); await wait(600); }

  // Add a new date
  await fillNamed(page, 'date-title', 'ECE 105 Midterm');
  await wait(300);

  const dateInput = page.locator('[name="date-when"]').first();
  await clickEl(page, dateInput, { post: 150 });
  await dateInput.fill('2026-10-08');
  await wait(300);

  await clickEl(page, page.locator('div:text-is("Add")').last(), { post: 800 });

  // Hover over the new entry to show the terracotta badge
  const newDate = page.getByText('ECE 105 Midterm').first();
  const ndBox = await newDate.boundingBox();
  if (ndBox) { await mov(page, ndBox.x + ndBox.width/2, ndBox.y + ndBox.height/2, 28); await wait(700); }

  // Delete "Course add/drop deadline"
  await deleteByLabel(page, 'Course add/drop deadline');
  await wait(700);
}

async function recRecipes(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Recipes');
  await wait(700);

  // Hover over food cards
  const omelette = page.getByText('Microwave mug omelette').first();
  const omBox = await omelette.boundingBox();
  if (omBox) { await mov(page, omBox.x + omBox.width/2, omBox.y + omBox.height/2, 28); await wait(500); }

  const ramen = page.getByText('Dorm ramen upgrade').first();
  const rmBox = await ramen.boundingBox();
  if (rmBox) { await mov(page, rmBox.x + rmBox.width/2, rmBox.y + rmBox.height/2, 26); await wait(500); }

  // Open omelette recipe
  await clickEl(page, omelette, { post: 700 });

  // Scroll to see ingredients + steps
  await smoothScroll(page, 120);
  await wait(600);

  // Hover over ingredients
  const ingLabel = page.getByText('Shredded cheese').first();
  const ingBox = await ingLabel.boundingBox();
  if (ingBox) { await mov(page, ingBox.x + ingBox.width/2, ingBox.y + ingBox.height/2, 26); await wait(500); }

  // Scroll to steps
  await smoothScroll(page, 100);
  await wait(600);

  // Navigate back to recipe list via sidebar (avoids ‹ button encoding issues)
  await navSidebar(page, 'Recipes');
  await wait(500);

  // Switch to Drinks tab (exact: true avoids matching parent container "FoodDrinks")
  await clickEl(page, page.getByText('Drinks', { exact: true }).first(), { post: 900 });
  await wait(500);

  await page.waitForFunction(() => document.body.textContent.includes('Matcha latte'), { timeout: 8000 }).catch(() => {});
  await wait(300);

  // Open matcha latte
  await clickEl(page, page.getByText('Matcha latte').first(), { post: 700 });

  // Scroll through it
  await smoothScroll(page, 120);
  await wait(600);

  // Delete this recipe
  await clickEl(page, page.getByText('Delete recipe').first(), { post: 700 });

  await wait(500);
}

async function recWorkout(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Workout');
  await wait(700);

  // Click Mon tab explicitly to ensure Push day is shown
  await clickEl(page, page.getByText('Mon').first(), { post: 500 });

  // Hover over bench press row
  const bench = page.getByText('Bench press').first();
  const bBox = await bench.boundingBox();
  if (bBox) { await mov(page, bBox.x + bBox.width/2, bBox.y + bBox.height/2, 28); await wait(500); }

  // Toggle bench press (checkbox to the left)
  await toggleByLabel(page, 'Bench press');

  // Click the weight chip for "Overhead press" — shows "65 lb"
  const weightChip = page.getByText('65 lb', { exact: true }).first();
  await clickEl(page, weightChip, { post: 400 });

  // Type new weight value
  const weightInput = page.locator('[name="weight"]').first();
  if (await weightInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await weightInput.fill('70');
    await wait(350);
    await page.keyboard.press('Enter');
    await wait(500);
  }

  // Switch to Tue (Pull) tab
  await clickEl(page, page.getByText('Tue').first(), { post: 600 });

  // Show Pull day, hover over deadlift
  const dl = page.getByText('Deadlift').first();
  const dlBox = await dl.boundingBox();
  if (dlBox) { await mov(page, dlBox.x + dlBox.width/2, dlBox.y + dlBox.height/2, 26); await wait(500); }

  // Scroll to add form
  await smoothScroll(page, 300);
  await wait(500);

  // Add a new exercise
  await fillNamed(page, 'exercise-name', 'Face pulls');
  await wait(200);
  await fillNamed(page, 'exercise-sets', '3');
  await wait(200);
  await fillNamed(page, 'exercise-reps', '15');
  await wait(200);
  await clickEl(page, page.getByText('Add', { exact: true }).last(), { post: 700 });

  // Scroll up to see it
  await smoothScroll(page, -100);
  await wait(500);

  // Delete "Face pulls"
  await deleteByLabel(page, 'Face pulls');
  await wait(700);
}

async function recHabits(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Habits');
  await wait(700);

  // Hover over progress bar
  await mov(page, W/2, 225, 26);
  await wait(700);

  // Toggle "Drink 8 glasses of water"
  await toggleByLabel(page, 'Drink 8 glasses of water');

  // Toggle "Hit the gym"
  await toggleByLabel(page, 'Hit the gym');
  await wait(500);

  // Scroll to add form
  await smoothScroll(page, 400);
  await wait(500);

  // Add a new habit
  await fillNamed(page, 'habit-name', '10-minute stretch');
  await wait(300);
  await clickEl(page, page.getByText('Add', { exact: true }).last(), { post: 700 });

  // Delete "No phone in bed"
  await deleteByLabel(page, 'No phone in bed');
  await wait(700);
}

async function recPhotos(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Photos');
  await wait(700);

  // Empty state is visible — hover over the dashed placeholder
  await mov(page, W/2, 420, 26);
  await wait(800);
  await mov(page, W/2, 460, 20);
  await wait(600);

  // Prepare SVG photo buffers
  const makePhotoBuf = (c1, c2, label) => {
    const w = 400, h = 300;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect x="0" y="${h-52}" width="${w}" height="52" fill="rgba(0,0,0,.3)"/><text x="${w/2}" y="${h-18}" text-anchor="middle" fill="rgba(255,255,255,.92)" font-family="Work Sans,sans-serif" font-size="16" font-weight="600">${label}</text></svg>`;
    return Buffer.from(svg);
  };
  const photoFiles = [
    { name: 'campus-autumn.svg',  mimeType: 'image/svg+xml', buffer: makePhotoBuf('#C06A45','#7A2E10','Campus in autumn') },
    { name: 'library-study.svg',  mimeType: 'image/svg+xml', buffer: makePhotoBuf('#6E8499','#2D4F6E','DC Library study spot') },
    { name: 'rez-room-setup.svg', mimeType: 'image/svg+xml', buffer: makePhotoBuf('#B5754F','#7A3A18','REZ room, Day 1') },
  ];

  // Move cursor to "+ Add photos" button — hover shows intent without triggering filechooser
  // (clicking a label wrapping a file input intercepts unrelated inputs in dc-runtime;
  //  setInputFiles directly on the scoped input is cleaner and avoids that ambiguity)
  const addBtn = page.getByText('+ Add photos').first();
  const btnBox = await addBtn.boundingBox({ timeout: 5000 });
  if (btnBox) {
    await mov(page, btnBox.x + btnBox.width/2, btnBox.y + btnBox.height/2, 26);
    await wait(700);
  }

  // dc-runtime strips boolean attributes like `multiple` from the rendered DOM, so
  // Playwright's setInputFiles rejects multiple files. Patch it before injecting.
  await page.evaluate(() => {
    const label = Array.from(document.querySelectorAll('label')).find(l => l.textContent.trim().startsWith('+ Add photos'));
    if (label) {
      const inp = label.querySelector('input[type="file"]');
      if (inp) { inp.multiple = true; inp.setAttribute('multiple', ''); }
    }
  });
  await page.locator('label').filter({ hasText: '+ Add photos' }).locator('input[type="file"]').setInputFiles(photoFiles);

  // Wait for photos to appear in the grid
  await page.locator('img[src^="data:"]').first().waitFor({ state: 'visible', timeout: 8000 });
  await wait(1000);

  // Pan cursor over the photo grid
  const firstImg = page.locator('img[src^="data:"]').first();
  const i1Box = await firstImg.boundingBox({ timeout: 5000 });
  if (i1Box) { await mov(page, i1Box.x + i1Box.width/2, i1Box.y + i1Box.height/2, 28); await wait(600); }

  // Click caption input of first photo and type a caption
  const capInput = page.locator('[name="photo-caption"]').first();
  await clickEl(page, capInput, { post: 300 });
  await page.keyboard.type('Waterloo campus, Day 1', { delay: 62 });
  await wait(600);

  // Hover over second photo
  const i2Box = await page.locator('img[src^="data:"]').nth(1).boundingBox({ timeout: 5000 }).catch(() => null);
  if (i2Box) { await mov(page, i2Box.x + i2Box.width/2, i2Box.y + i2Box.height/2, 26); await wait(600); }

  // Delete the third photo — × button is position:absolute top-right of its card
  const thirdCardBox = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img[src^="data:"]');
    if (imgs.length < 3) return null;
    const card = imgs[2].closest('div[style*="position:relative"]');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  if (thirdCardBox) {
    await mov(page, thirdCardBox.x + thirdCardBox.width - 14, thirdCardBox.y + 14, 26);
    await wait(400);
    await page.mouse.click(thirdCardBox.x + thirdCardBox.width - 14, thirdCardBox.y + 14);
    await wait(700);
  }

  await wait(500);
}

async function recNotes(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Notes');
  await wait(700);

  // Hover over both note cards
  const card1 = page.getByText('MATH 117 – Calculus I').first();
  const c1Box = await card1.boundingBox({ timeout: 5000 });
  if (c1Box) { await mov(page, c1Box.x + c1Box.width/2, c1Box.y + c1Box.height/2, 28); await wait(600); }

  const card2 = page.getByText('Dorm room must-haves').first();
  const c2Box = await card2.boundingBox({ timeout: 5000 });
  if (c2Box) { await mov(page, c2Box.x + c2Box.width/2, c2Box.y + c2Box.height/2, 26); await wait(500); }

  // Open MATH 117 note
  await clickEl(page, card1, { post: 800 });

  // Editor shows pre-formatted content — hover to read it
  const editor = page.locator('[data-note-editor]').first();
  await editor.waitFor({ state: 'visible', timeout: 5000 });
  const edBox = await editor.boundingBox({ timeout: 5000 });
  if (edBox) { await mov(page, edBox.x + 140, edBox.y + 40, 26); await wait(600); }
  if (edBox) { await mov(page, edBox.x + 220, edBox.y + 90, 20); await wait(500); }

  // Triple-click on second paragraph (FTC) to select it, then highlight yellow
  if (edBox) {
    const cx = edBox.x + 80, cy = edBox.y + 68;
    await page.mouse.click(cx, cy);
    await wait(250);
    await page.mouse.click(cx, cy, { clickCount: 3 });
    await wait(350);
  }
  await clickEl(page, page.locator('[title="Highlight yellow"]').first(), { post: 500 });

  // Triple-click on the u-substitution paragraph, then apply italic
  if (edBox) {
    const cx = edBox.x + 80, cy = edBox.y + 100;
    await page.mouse.click(cx, cy);
    await wait(250);
    await page.mouse.click(cx, cy, { clickCount: 3 });
    await wait(350);
  }
  await clickEl(page, page.locator('[title*="Italic"]').first(), { post: 450 });

  // Click at bottom of editor and type a new line
  if (edBox) { await page.mouse.click(edBox.x + 80, edBox.y + edBox.height - 35); await wait(300); }
  await page.keyboard.press('End');
  await wait(150);
  await page.keyboard.press('Enter');
  await wait(100);
  await page.keyboard.press('Enter');
  await wait(150);
  await page.keyboard.type('Midterm: Oct 15 — bring formula sheet + calculator!', { delay: 52 });
  await wait(700);

  // ‹ All notes
  await clickEl(page, page.getByText('‹ All notes').first(), { post: 700 });

  // Create a new note
  await clickEl(page, page.getByText('+ New note').first(), { post: 600 });

  // Type title
  const titleInput = page.locator('[name="note-title"]').first();
  await clickEl(page, titleInput, { post: 200 });
  await page.keyboard.type('ECE 150 – Pointers', { delay: 65 });
  await wait(400);

  // Click in editor, type intro line, then select and italicize it
  const editorNew = page.locator('[data-note-editor]').first();
  await clickEl(page, editorNew, { post: 300 });
  await page.keyboard.type('Key concepts before tutorial:', { delay: 52 });
  await wait(300);
  await page.keyboard.press('Home');
  await wait(150);
  await page.keyboard.press('Shift+End');
  await wait(300);
  await clickEl(page, page.locator('[title*="Italic"]').first(), { post: 450 });

  // Place cursor at end, start a bullet list
  const newEdBox = await editorNew.boundingBox({ timeout: 5000 });
  if (newEdBox) { await page.mouse.click(newEdBox.x + 80, newEdBox.y + 28); await wait(200); }
  await page.keyboard.press('End');
  await wait(100);
  await page.keyboard.press('Enter');
  await wait(150);
  await clickEl(page, page.locator('[title="Bullet list"]').first(), { post: 350 });

  // Type three bullet points
  await page.keyboard.type('int* p = &x; // pointer declaration', { delay: 50 });
  await page.keyboard.press('Enter');
  await wait(100);
  await page.keyboard.type('*p gives the value at address p', { delay: 50 });
  await page.keyboard.press('Enter');
  await wait(100);
  await page.keyboard.type('nullptr instead of NULL (safer, C++11)', { delay: 50 });
  await wait(400);

  // Select last bullet line and apply bold
  await page.keyboard.press('Home');
  await wait(150);
  await page.keyboard.press('Shift+End');
  await wait(300);
  await clickEl(page, page.locator('[title*="Bold"]').first(), { post: 400 });
  await wait(300);

  // ‹ All notes
  await clickEl(page, page.getByText('‹ All notes').first(), { post: 700 });

  // Delete the new note via its × card button (position:absolute top-right of the card)
  const noteCardBox = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[style*="position:relative"]'));
    for (const card of cards) {
      const titleEl = card.querySelector('[style*="Newsreader"]');
      const delBtn = card.querySelector('[style*="#CBBDA4"]');
      if (titleEl && delBtn && titleEl.textContent.includes('ECE 150')) {
        const r = card.getBoundingClientRect();
        return { x: r.left, y: r.top, width: r.width, height: r.height };
      }
    }
    return null;
  });
  if (noteCardBox) {
    const cx = noteCardBox.x + noteCardBox.width - 14;
    const cy = noteCardBox.y + 14;
    await mov(page, cx, cy, 26);
    await wait(350);
    await page.mouse.click(cx, cy);
    await wait(700);
  }

  await wait(500);
}

async function recTrash(page) {
  await page.goto(BASE);
  await page.waitForSelector("text=Anna's Desk", { timeout: 15000 });
  await wait(800);
  await navSidebar(page, 'Trash');
  await wait(700);

  // Hover over trash items
  const trashNote = page.getByText('Draft email to advisor').first();
  const tnBox = await trashNote.boundingBox();
  if (tnBox) { await mov(page, tnBox.x + tnBox.width/2, tnBox.y + tnBox.height/2, 28); await wait(600); }

  const trashHabit = page.getByText('Cold shower every day').first();
  const thBox = await trashHabit.boundingBox();
  if (thBox) { await mov(page, thBox.x + thBox.width/2, thBox.y + thBox.height/2, 26); await wait(600); }

  // Click "Restore" on the note
  const restoreBtns = page.getByText('Restore');
  await clickEl(page, restoreBtns.first(), { post: 700 });

  // Click "Delete" (permanent delete) on habit item
  const deleteBtns = page.getByText('Delete');
  await clickEl(page, deleteBtns.first(), { post: 700 });

  // Hover over remaining items
  const remaining = page.getByText('Foam roller (optional)').first();
  const rBox = await remaining.boundingBox();
  if (rBox) { await mov(page, rBox.x + rBox.width/2, rBox.y + rBox.height/2, 26); await wait(600); }

  // Navigate to Notes to show restored note
  await navSidebar(page, 'Notes');
  await wait(700);

  // Show the restored note "Draft email to advisor"
  const restoredNote = page.getByText('Draft email to advisor').first();
  if (await restoredNote.isVisible()) {
    const rnBox = await restoredNote.boundingBox();
    if (rnBox) { await mov(page, rnBox.x + rnBox.width/2, rnBox.y + rnBox.height/2, 26); await wait(700); }
  }

  await wait(500);
}

// ─── GIF conversion ───────────────────────────────────────────────────────────
function toGif(videoPath, outPath, trimStart = 0.5) {
  const palette = videoPath.replace('.webm', '_palette.png');
  console.log(`[gif] converting ${path.basename(videoPath)} → ${path.basename(outPath)}`);
  // Pass 1: generate palette
  execSync(`ffmpeg -y -ss ${trimStart} -i "${videoPath}" -vf "fps=18,scale=840:-1:flags=lanczos,palettegen=max_colors=256:stats_mode=diff" "${palette}"`, { stdio: 'pipe' });
  // Pass 2: apply palette
  execSync(`ffmpeg -y -ss ${trimStart} -i "${videoPath}" -i "${palette}" -lavfi "fps=18,scale=840:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "${outPath}"`, { stdio: 'pipe' });
  try { fs.unlinkSync(palette); } catch(e) {}
  const size = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  console.log(`[gif] ✓ ${path.basename(outPath)} — ${size}MB`);
}

// ─── main ─────────────────────────────────────────────────────────────────────
const SECTIONS = {
  dashboard: { fn: recDashboard, out: 'dashboard.gif' },
  checklist: { fn: recChecklist, out: 'checklist.gif' },
  schedule:  { fn: recSchedule,  out: 'schedule.gif'  },
  dates:     { fn: recDates,     out: 'key-dates.gif' },
  recipes:   { fn: recRecipes,   out: 'recipes.gif'   },
  workout:   { fn: recWorkout,   out: 'workout.gif'   },
  habits:    { fn: recHabits,    out: 'habits.gif'    },
  photos:    { fn: recPhotos,    out: 'photos.gif'    },
  notes:     { fn: recNotes,     out: 'notes.gif'     },
  trash:     { fn: recTrash,     out: 'trash.gif'     },
};

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });

  for (const key of TARGET) {
    const sec = SECTIONS[key];
    if (!sec) { console.warn(`Unknown section: ${key}`); continue; }
    console.log(`\n[record] ${key}`);

    const seed = makeSeed(sec.opts || {});
    const ctx = await makeCtx(browser, seed);
    const page = await ctx.newPage();

    try {
      await sec.fn(page);
    } catch(e) {
      console.error(`[error] ${key}:`, e.message);
    }

    const videoPath = await page.video().path();
    await ctx.close(); // flushes video

    const outPath = path.join(OUT_DIR, sec.out);
    try {
      toGif(videoPath, outPath);
    } catch(e) {
      console.error(`[gif error] ${key}:`, e.message);
    }
    try { fs.unlinkSync(videoPath); } catch(e) {}
  }

  await browser.close();
  server.close();
  console.log('\n[done] all sections recorded');
})();
