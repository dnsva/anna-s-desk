// record_final.js — all 10 GIFs, full interaction, cursor overlay
const { chromium } = require("/Users/anna/Documents/github/anna's-desk/record/node_modules/playwright");
const { spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

const RW = 900, RH = 600, GW = 840, GH = 560;
const BASE    = 'http://localhost:8765/anna-s-desk/';
const GIF_DIR = "/Users/anna/Documents/github/anna's-desk/docs/assets/gifs";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const click = (page, x, y) => page.mouse.click(x, y);
const move  = (page, x, y) => page.mouse.move(x, y);

async function scroll(page, dy, steps = 4, ms = 65) {
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy); await sleep(ms); }
}

async function injectCursor(page) {
  await page.evaluate(() => {
    document.getElementById('__pw_cur')?.remove();
    document.getElementById('__pw_cur_style')?.remove();
    const style = document.createElement('style');
    style.id = '__pw_cur_style';
    style.textContent = `
      #__pw_cur {
        position: fixed; width: 22px; height: 22px;
        border: 2.5px solid #fff; border-radius: 50%;
        background: rgba(196,98,45,0.88);
        box-shadow: 0 2px 8px rgba(61,35,20,0.45);
        pointer-events: none; z-index: 2147483647;
        transform: translate(-50%,-50%);
        transition: left 0.08s ease, top 0.08s ease;
      }
    `;
    document.head.appendChild(style);
    const el = document.createElement('div');
    el.id = '__pw_cur';
    el.style.cssText = 'left:450px;top:300px;';
    document.documentElement.appendChild(el);
    document.addEventListener('mousemove', e => {
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
    }, true);
  });
  await page.mouse.move(450, 300);
}

// Find small clickable toggle boxes/circles by bounding-rect size + transparent bg
async function findToggles(page, minSize, maxSize) {
  return page.evaluate(({ lo, hi }) => {
    return Array.from(document.querySelectorAll('div'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        if (r.width < lo || r.width > hi || r.height < lo || r.height > hi) return false;
        if (r.x < 240 || r.x > 320 || r.y < 100) return false;
        const bg = getComputedStyle(el).backgroundColor;
        return bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
      });
  }, { lo: minSize, hi: maxSize });
}

// Get bounding box center of an element found by text content
async function findByText(page, text, opts = {}) {
  return page.evaluate(({ text, minY, cursor }) => {
    const el = Array.from(document.querySelectorAll('div')).find(e => {
      const t = e.textContent.trim();
      const r = e.getBoundingClientRect();
      if (r.y < (minY || 0) || r.width < 10) return false;
      if (cursor && getComputedStyle(e).cursor !== 'pointer') return false;
      return t === text;
    });
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
  }, { text, ...opts });
}

const nav = {
  checklist:  [123, 157],
  schedule:   [123, 195],
  'key-dates':[123, 233],
  recipes:    [123, 271],
  workout:    [123, 309],
  habits:     [123, 347],
  photos:     [123, 385],
  notes:      [123, 423],
  trash:      [123, 461],
};

// Toolbar button positions (verified at 900×600 in note editor)
const TB = {
  bold:     [306, 206],
  italic:   [339, 206],
  underline:[372, 206],
  strike:   [405, 206],
  ul:       [450, 206],
  ol:       [483, 206],
  hlYellow: [524, 206],
  hlGreen:  [549, 206],
  hlBlue:   [574, 206],
  hlPink:   [599, 206],
  hlOrange: [624, 206],
};

async function toolbarClick(page, [x, y]) {
  await move(page, x, y); await sleep(150);
  await page.mouse.down(); await sleep(60);
  await page.mouse.up(); await sleep(350);
}

async function makeGif(name, fn, extraSetup) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `adgif_${name}_`));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: RW, height: RH },
    recordVideo: { dir: tmpDir, size: { width: RW, height: RH } },
  });
  await ctx.route('**supabase**', r => r.abort());

  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await sleep(1400);
  await injectCursor(page);

  if (extraSetup) {
    await extraSetup(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await injectCursor(page);
  }

  await fn(page);

  const video = page.video();
  await page.close();
  const videoPath = await video.path();
  await ctx.close();
  await browser.close();

  const gifPath = path.join(GIF_DIR, `${name}.gif`);
  const result = spawnSync('ffmpeg', [
    '-y', '-i', videoPath,
    '-vf', `fps=15,scale=${GW}:${GH}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:diff_mode=rectangle`,
    '-loop', '0', gifPath,
  ], { encoding: 'utf8' });

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (result.status === 0) {
    const mb = (fs.statSync(gifPath).size / 1024 / 1024).toFixed(1);
    console.log(`✓ ${name}.gif  (${mb} MB)`);
  } else {
    console.error(`✗ ${name}.gif\n`, result.stderr?.slice(-300));
  }
}

(async () => {

  // ── 1. DASHBOARD ─────────────────────────────────────────────────────────
  await makeGif('dashboard', async (page) => {
    await sleep(700);
    await move(page, 380, 172); await sleep(500);
    await move(page, 583, 248); await sleep(600);
    await move(page, 330, 248); await sleep(500);
    await move(page, 534, 185); await sleep(700);
    await sleep(400);
    await scroll(page, 110, 4, 70); await sleep(700);
    await move(page, 396, 310); await sleep(500);
    await move(page, 675, 310); await sleep(500);
    await move(page, 396, 395); await sleep(500);
    await move(page, 675, 395); await sleep(500);
    await scroll(page, 110, 3, 70); await sleep(600);
    await move(page, 396, 310); await sleep(400);
    await move(page, 675, 310); await sleep(400);
    await move(page, 396, 395); await sleep(400);
    await sleep(600);
    await scroll(page, -300, 8, 55); await sleep(1500);
  });


  // ── 2. CHECKLIST ─────────────────────────────────────────────────────────
  await makeGif('checklist', async (page) => {
    await click(page, ...nav.checklist); await sleep(1200);
    const boxes = await findToggles(page, 19, 25);
    for (const pos of boxes.slice(0, 4)) {
      await move(page, pos.x, pos.y); await sleep(180);
      await click(page, pos.x, pos.y); await sleep(560);
    }
    await move(page, 530, 120); await sleep(700);
    await scroll(page, 120, 4, 70); await sleep(700);
    await scroll(page, 120, 4, 70); await sleep(700);
    await scroll(page, 120, 4, 70); await sleep(700);
    await scroll(page, -400, 10, 55); await sleep(1200);
  });


  // ── 3. SCHEDULE ──────────────────────────────────────────────────────────
  // Fix: move cursor to each field, fill location, show new class in schedule
  await makeGif('schedule', async (page) => {
    await click(page, ...nav.schedule); await sleep(1500);

    // Brief scroll to show existing week
    await scroll(page, 100, 3, 70); await sleep(700);
    await scroll(page, -100, 3, 70); await sleep(500);

    // Open add-class form
    await move(page, 790, 127); await sleep(350);
    await click(page, 790, 127); await sleep(1000);

    // Class name — move cursor to field, then type
    const nameBox = await page.locator('input[name="class-name"]').boundingBox();
    await move(page, nameBox.x + 80, nameBox.y + nameBox.height / 2); await sleep(300);
    await page.locator('input[name="class-name"]').click(); await sleep(200);
    await page.keyboard.type('ECE 192 – Engineering Economics', { delay: 40 });
    await sleep(350);

    // Day select — move cursor, pick Wednesday
    const dayBox = await page.locator('select[name="class-day"]').boundingBox();
    await move(page, dayBox.x + dayBox.width / 2, dayBox.y + dayBox.height / 2); await sleep(300);
    await page.locator('select[name="class-day"]').selectOption('Wed'); await sleep(400);

    // Start time
    const startBox = await page.locator('input[name="class-start"]').boundingBox();
    await move(page, startBox.x + startBox.width / 2, startBox.y + startBox.height / 2); await sleep(300);
    await page.fill('input[name="class-start"]', '11:30'); await sleep(350);

    // End time
    const endBox = await page.locator('input[name="class-end"]').boundingBox();
    await move(page, endBox.x + endBox.width / 2, endBox.y + endBox.height / 2); await sleep(300);
    await page.fill('input[name="class-end"]', '12:20'); await sleep(350);

    // Location — move cursor, type
    const locBox = await page.locator('input[name="class-location"]').boundingBox();
    await move(page, locBox.x + 70, locBox.y + locBox.height / 2); await sleep(300);
    await page.locator('input[name="class-location"]').click(); await sleep(200);
    await page.keyboard.type('STC 0050', { delay: 42 });
    await sleep(350);

    // Save class button
    const saveBtn = await findByText(page, 'Save class', { minY: 100, cursor: true });
    if (saveBtn) {
      await move(page, saveBtn.x, saveBtn.y); await sleep(350);
      await click(page, saveBtn.x, saveBtn.y); await sleep(1200);
    }

    // Scroll to Wednesday to show the newly added class
    await scroll(page, 120, 5, 65); await sleep(800);
    // Hover over the new class card
    const newClass = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div')).find(e =>
        e.textContent.includes('ECE 192') && e.getBoundingClientRect().width > 200
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (newClass) { await move(page, newClass.x, newClass.y); await sleep(1200); }
    await scroll(page, -300, 7, 60); await sleep(800);
  });


  // ── 4. KEY DATES ─────────────────────────────────────────────────────────
  await makeGif('key-dates', async (page) => {
    await click(page, ...nav['key-dates']); await sleep(1500);
    await move(page, 754, 185); await sleep(600);
    await move(page, 754, 265); await sleep(500);
    await move(page, 754, 345); await sleep(500);
    await scroll(page, 100, 3, 80); await sleep(700);
    await scroll(page, -100, 3, 80); await sleep(600);
    await page.click('input[name="date-title"]'); await sleep(350);
    await page.type('input[name="date-title"]', 'MATH 117 Midterm 2', { delay: 42 });
    await sleep(350);
    await page.fill('input[name="date-when"]', '2026-11-20'); await sleep(450);
    const addBtn = await findByText(page, 'Add', { minY: 0, cursor: true });
    if (addBtn) { await move(page, addBtn.x, addBtn.y); await sleep(300); await click(page, addBtn.x, addBtn.y); await sleep(900); }
    await scroll(page, 80, 3, 80); await sleep(800);
  });


  // ── 5. RECIPES ───────────────────────────────────────────────────────────
  // Fix: open a food recipe detail, scroll it, go back, switch tabs, open a drink
  await makeGif('recipes', async (page) => {
    await click(page, ...nav.recipes); await sleep(1200);

    // Hover over food recipe cards
    await move(page, 383, 225); await sleep(500);
    await move(page, 685, 225); await sleep(500);

    // Open "Dorm ramen upgrade" (second food card)
    const ramenPos = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div')).find(e =>
        e.textContent.trim().startsWith('Dorm ramen upgrade') &&
        getComputedStyle(e).cursor === 'pointer' &&
        e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().y > 150
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (ramenPos) {
      await move(page, ramenPos.x, ramenPos.y); await sleep(300);
      await click(page, ramenPos.x, ramenPos.y); await sleep(1200);
    }

    // Scroll through detail — ingredients + steps
    await move(page, 550, 300); await sleep(400);
    await scroll(page, 90, 3, 80); await sleep(600);
    await scroll(page, 90, 3, 80); await sleep(500);
    await move(page, 550, 350); await sleep(400);

    // Click back
    const backFood = await findByText(page, '‹ All recipes', { minY: 100 });
    if (backFood) {
      await move(page, backFood.x, backFood.y); await sleep(300);
      await click(page, backFood.x, backFood.y); await sleep(800);
    }

    // Switch to Drinks tab
    const drinksTab = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div')).find(e =>
        e.textContent.trim() === 'Drinks' && e.getBoundingClientRect().y < 180
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (drinksTab) {
      await move(page, drinksTab.x, drinksTab.y); await sleep(300);
      await click(page, drinksTab.x, drinksTab.y); await sleep(800);
    }

    // Hover over drink cards
    await move(page, 383, 225); await sleep(400);
    await move(page, 685, 225); await sleep(400);

    // Open "Iced brown sugar latte"
    const lattePos = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div')).find(e =>
        e.textContent.trim().startsWith('Iced brown sugar latte') &&
        getComputedStyle(e).cursor === 'pointer' &&
        e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().y > 150
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (lattePos) {
      await move(page, lattePos.x, lattePos.y); await sleep(300);
      await click(page, lattePos.x, lattePos.y); await sleep(1200);
    }

    // Scroll through latte steps
    await scroll(page, 90, 3, 80); await sleep(600);
    await move(page, 550, 350); await sleep(800);
  });


  // ── 6. WORKOUT ───────────────────────────────────────────────────────────
  // Fix: when editing scheme, type value with · separator to show two chips
  await makeGif('workout', async (page) => {
    await click(page, ...nav.workout); await sleep(1000);
    await move(page, 310, 131); await sleep(300);
    await click(page, 310, 131); await sleep(900); // Mon tab

    await move(page, 309, 247); await sleep(200);
    await click(page, 309, 247); await sleep(650); // Back Squat done
    await move(page, 309, 329); await sleep(200);
    await click(page, 309, 329); await sleep(650); // Leg Extensions done

    // Click the Back Squat scheme chip → opens inline editor
    const schemePos = await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('div')).find(
        el => el.textContent.trim() === '5×5 32.5lb/side' && el.getBoundingClientRect().y > 150
      );
      if (!chip) return null;
      const r = chip.getBoundingClientRect(); 
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (schemePos) {
      await move(page, schemePos.x, schemePos.y); await sleep(300);
      await click(page, schemePos.x, schemePos.y); await sleep(600); // opens inline editor
      
      // autofocus is unreliable in headless — explicitly click the input to focus it
      const inputLoc = page.locator('input[autofocus="true"]');
      const inputBox = await inputLoc.boundingBox({ timeout: 3000 }).catch(() => null);
      if (inputBox) {
        const ix = Math.round(inputBox.x + inputBox.width / 2);
        const iy = Math.round(inputBox.y + inputBox.height / 2);
        await move(page, ix, iy); await sleep(200);
        // Triple-click selects all existing text, then type replaces it with two chips
        await page.mouse.click(ix, iy, { clickCount: 3 }); await sleep(150);
        await page.keyboard.type('1×12 warmup · 5×5 35lb/side', { delay: 50 });
        await sleep(300);
        await page.keyboard.press('Enter'); await sleep(900); // chips render
      }
    }

    await move(page, 309, 411); await sleep(200);
    await click(page, 309, 411); await sleep(650); // Pendulum Squat done

    await move(page, 440, 131); await sleep(300);
    await click(page, 440, 131); await sleep(900); // Wed tab
    await scroll(page, 80, 3, 80); await sleep(600);
    await move(page, 310, 131); await sleep(300);
    await click(page, 310, 131); await sleep(900); // back to Mon — show chips
    await move(page, 450, 280); await sleep(800);  // hover over scheme chips
  });


  // ── 7. HABITS ────────────────────────────────────────────────────────────
  await makeGif('habits', async (page) => {
    await click(page, ...nav.habits); await sleep(1400);
    const undone = await findToggles(page, 24, 32);
    for (const pos of undone.slice(0, 3)) {
      await move(page, pos.x, pos.y); await sleep(200);
      await click(page, pos.x, pos.y); await sleep(620);
    }
    await move(page, 530, 148); await sleep(600);
    await scroll(page, 80, 3, 80); await sleep(600);
    await page.click('input[name="habit-name"]'); await sleep(350);
    await page.type('input[name="habit-name"]', 'Study without phone', { delay: 42 });
    await sleep(400);
    await page.keyboard.press('Enter'); await sleep(800);
  });


  // ── 8. PHOTOS ────────────────────────────────────────────────────────────
  // Fix: type different captions for photo 1 and photo 2 separately
  await makeGif('photos', async (page) => {
    await click(page, ...nav.photos); await sleep(1500);

    // Hover over the photo grid to show content
    await move(page, 325, 200); await sleep(500);
    await move(page, 465, 200); await sleep(500);
    await move(page, 605, 200); await sleep(500);

    // Caption for photo 1 — get exact position, move cursor there, type
    const cap0 = await page.locator('input[name="photo-caption"]').nth(0).boundingBox();
    if (cap0) {
      await move(page, cap0.x + 55, cap0.y + cap0.height / 2); await sleep(400);
      await page.locator('input[name="photo-caption"]').nth(0).click(); await sleep(200);
      await page.keyboard.type('sunrise walk to MC building', { delay: 40 });
      await sleep(600);
    }

    // Caption for photo 2 — different image, different caption
    const cap1 = await page.locator('input[name="photo-caption"]').nth(1).boundingBox();
    if (cap1) {
      await move(page, cap1.x + 55, cap1.y + cap1.height / 2); await sleep(400);
      await page.locator('input[name="photo-caption"]').nth(1).click(); await sleep(200);
      await page.keyboard.type('DC library, 2nd floor', { delay: 40 });
      await sleep(600);
    }

    // Caption for photo 3
    const cap2 = await page.locator('input[name="photo-caption"]').nth(2).boundingBox();
    if (cap2) {
      await move(page, cap2.x + 55, cap2.y + cap2.height / 2); await sleep(350);
      await page.locator('input[name="photo-caption"]').nth(2).click(); await sleep(200);
      await page.keyboard.type('first week dorm setup', { delay: 40 });
      await sleep(600);
    }

    await scroll(page, 60, 3, 90); await sleep(500);
    await scroll(page, -60, 3, 90); await sleep(800);
  },
  async (page) => {
    await page.evaluate(() => {
      function makePhoto(c1, c2, label) {
        const cv = document.createElement('canvas');
        cv.width = 400; cv.height = 280;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = c1; ctx.fillRect(0, 0, 400, 280);
        ctx.fillStyle = c2; ctx.fillRect(30, 30, 340, 220);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, 200, 150);
        return { id: Math.random().toString(36).slice(2, 8), src: cv.toDataURL('image/jpeg', 0.85), caption: '' };
      }
      const data = {
        checklist: ChecklistSection.seed(), classes: ScheduleSection.seed(),
        dates: DatesSection.seed(), recipes: RecipesSection.seed(),
        workout: WorkoutSection.seed(), habits: HabitsSection.seed(),
        notes: NotesSection.seed(), trash: [],
        photos: [
          makePhoto('#c4622d', '#d4845a', 'MC building'),
          makePhoto('#8a5a4a', '#a07868', 'study spot'),
          makePhoto('#3d2314', '#5a2d1a', 'dorm setup'),
        ],
      };
      localStorage.setItem('collegeApp_v4', JSON.stringify(data));
    });
  });


  // ── 9. NOTES ─────────────────────────────────────────────────────────────
  // Create a NEW note: type all content first, then apply formatting via Selection API.
  // Keyboard selection (Shift+End etc.) is unreliable in headless Chromium contenteditable,
  // so we use Range/Selection API in page.evaluate() to set precise selections.
  await makeGif('notes', async (page) => {
    await click(page, ...nav.notes); await sleep(1000);

    // Show notes list briefly, then click "+ New note"
    await move(page, 450, 270); await sleep(600);
    await move(page, 790, 127); await sleep(350);
    await click(page, 790, 127); await sleep(900);

    // Type the title
    const titleLoc = page.locator('input[name="note-title"]');
    const titleBox = await titleLoc.boundingBox();
    await move(page, titleBox.x + 80, titleBox.y + titleBox.height / 2); await sleep(250);
    await titleLoc.click(); await sleep(200);
    await page.keyboard.type('ECE 150 Assignment 3', { delay: 45 });
    await sleep(400);

    // Click into body contenteditable
    const bodyLoc = page.locator('[data-note-editor]');
    const bodyBox = await bodyLoc.boundingBox();
    await move(page, bodyBox.x + 60, bodyBox.y + 30); await sleep(300);
    await bodyLoc.click(); await sleep(300);

    // ── TYPE ALL CONTENT FIRST (no toolbar until all Enter presses are done) ──
    await page.keyboard.type('Pointers and dynamic memory allocation', { delay: 35 });
    await sleep(150);
    await page.keyboard.press('Enter'); await sleep(120);
    await page.keyboard.press('Enter'); await sleep(180);
    await page.keyboard.type('Review tutorial on double pointers', { delay: 35 });
    await page.keyboard.press('Enter'); await sleep(120);
    await page.keyboard.type('Run valgrind before submitting', { delay: 35 });
    await page.keyboard.press('Enter'); await sleep(120);
    await page.keyboard.type('Submit before Friday midnight', { delay: 35 });
    await sleep(600);

    // ── APPLY FORMATTING via Selection API ──

    // 1. Yellow highlight on first line
    await page.evaluate(() => {
      const ed = document.querySelector('[data-note-editor]');
      ed.focus();
      const textNode = ed.firstChild; // "Pointers..." text node
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, textNode.textContent.length);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
    await sleep(100);
    await toolbarClick(page, TB.hlYellow); await sleep(500);

    // 2. Bullet list on last 3 lines
    //    After yellow, structure: span(Pointers), div(br), div(Review), div(Run), div(Submit)
    await page.evaluate(() => {
      const ed = document.querySelector('[data-note-editor]');
      ed.focus();
      const divs = Array.from(ed.querySelectorAll(':scope > div'));
      // divs[0]=br, divs[1]=Review, divs[2]=Run, divs[3]=Submit
      const startDiv = divs[1];
      const endDiv   = divs[3];
      const range = document.createRange();
      range.setStart(startDiv, 0);
      range.setEnd(endDiv, endDiv.childNodes.length);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
    await sleep(100);
    await toolbarClick(page, TB.ul); await sleep(600);

    // 3. Pink highlight on last bullet
    await page.evaluate(() => {
      const ed = document.querySelector('[data-note-editor]');
      ed.focus();
      const lis = ed.querySelectorAll('li');
      const lastLi = lis[lis.length - 1]; // "Submit before Friday midnight"
      if (lastLi) {
        const textNode = lastLi.firstChild;
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, textNode.textContent.length);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    await sleep(100);
    await toolbarClick(page, TB.hlPink); await sleep(500);

    // Show the finished note
    await move(page, 450, 350); await sleep(1000);

    // Navigate back to list to show the saved note card
    const allNotes = await findByText(page, '‹ All notes', { minY: 80 });
    if (allNotes) {
      await move(page, allNotes.x, allNotes.y); await sleep(350);
      await click(page, allNotes.x, allNotes.y); await sleep(1000);
    }
    await move(page, 450, 260); await sleep(800);
  });


  // ── 10. TRASH ────────────────────────────────────────────────────────────
  // Fix: after restoring, navigate to Notes to prove the item is back
  await makeGif('trash', async (page) => {
    await click(page, ...nav.trash); await sleep(1500);
    await sleep(600);

    // Hover over each trash item
    await move(page, 450, 136); await sleep(500);
    await move(page, 450, 216); await sleep(500);
    await move(page, 450, 296); await sleep(400);

    // Find first Restore button and click it
    const restoreLoc = page.getByText('Restore').first();
    const restoreBox = await restoreLoc.boundingBox({ timeout: 5000 }).catch(() => null);
    if (restoreBox) {
      const rx = Math.round(restoreBox.x + restoreBox.width / 2);
      const ry = Math.round(restoreBox.y + restoreBox.height / 2);
      await move(page, rx, ry); await sleep(400);
      await click(page, rx, ry); await sleep(1200); // item disappears
    }

    // Hover remaining 2 items to confirm they're still there
    await move(page, 450, 136); await sleep(500);
    await move(page, 450, 216); await sleep(500);
    await sleep(300);

    // Navigate to Notes to prove the restored note is back
    await move(page, ...nav.notes); await sleep(350);
    await click(page, ...nav.notes); await sleep(1400);

    // The restored note ("PHYS 115 Lab Notes") is now at top of list
    await move(page, 450, 225); await sleep(700); // hover over restored note card
    await click(page, 450, 225); await sleep(1000); // open it
    await move(page, 450, 280); await sleep(700);  // show content
  },
  async (page) => {
    await page.evaluate(() => {
      const now = Date.now();
      const data = {
        checklist: ChecklistSection.seed(), classes: ScheduleSection.seed(),
        dates: DatesSection.seed(), recipes: RecipesSection.seed(),
        workout: WorkoutSection.seed(), habits: HabitsSection.seed(),
        notes: NotesSection.seed(), photos: [],
        trash: [
          // Use a note title NOT in seed so it's clearly a restored item
          { id: 'tr1', type: 'note', name: 'PHYS 115 Lab Notes',
            item: { id: 'n9', title: 'PHYS 115 Lab Notes',
              body: 'Exp error: ±0.02 N  |  Pendulum period: 1.42 s  |  Calculated g: 9.78 m/s²', ts: now - 100000 },
            deletedAt: now - 3600000 },
          { id: 'tr2', type: 'recipe', name: 'Microwave mug omelette',
            item: { id: 'r9', name: 'Microwave mug omelette', type: 'food', time: '5 min', ingredients: [], steps: [] },
            deletedAt: now - 86400000 },
          { id: 'tr3', type: 'habit', name: 'Hit the gym',
            item: { id: 'h9', name: 'Hit the gym', done: false, streak: 2 },
            deletedAt: now - 172800000 },
        ],
      };
      localStorage.setItem('collegeApp_v4', JSON.stringify(data));
    });
  });

  console.log('\nAll done!');
})().catch(err => { console.error(err); process.exit(1); });
