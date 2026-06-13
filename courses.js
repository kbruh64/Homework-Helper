// Conversational course engine — Poly talks, reads what the student types, and reacts.
// Reads window.COURSE for the question bank. Two modes: practice (hints) and assessment (scored, no hints).
(function () {
  // ─── Answer checking ───
  const norm = (s) => String(s).toLowerCase().trim().replace(/\s+/g, '');

  // Pull a fraction "a/b" out of text, if present
  function asFraction(s) {
    const m = norm(s).match(/(\d+)\/(\d+)/);
    if (!m) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10)];
  }
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  function reduce([n, d]) {
    if (d === 0) return [n, d];
    const g = gcd(Math.abs(n), Math.abs(d)) || 1;
    return [n / g, d / g];
  }

  // Pull the first number (incl. decimals/negatives) out of free text like "the answer is 24"
  function asNumber(s) {
    const m = norm(s).replace(/[, ]/g, '').match(/-?\d+(\.\d+)?(?!\/)/);
    return m ? parseFloat(m[0]) : null;
  }

  function checkAnswer(user, expected) {
    const list = Array.isArray(expected) ? expected : [expected];
    const uNorm = norm(user);
    const uFrac = asFraction(user);
    const uNum = uFrac ? null : asNumber(user); // don't treat "3/5" as the number 3

    return list.some(e => {
      const eNorm = norm(e);
      if (uNorm === eNorm) return true;                 // exact text match (e.g. "right angle")
      if (uNorm.includes(eNorm) && eNorm.length > 1) return true; // "the answer is right angle"

      // Fraction comparison — accept equivalent fractions (2/4 == 1/2)
      const eFrac = asFraction(e);
      if (uFrac && eFrac) {
        const [un, ud] = reduce(uFrac), [en, ed] = reduce(eFrac);
        if (un === en && ud === ed) return true;
      }

      // Numeric comparison (handles "24", "the answer is 24", "24.0")
      const eNum = asNumber(e);
      if (uNum !== null && eNum !== null && Math.abs(uNum - eNum) < 0.0001) return true;

      return false;
    });
  }
  const formatAnswer = (a) => Array.isArray(a) ? a[0] : String(a);

  // ─── Classify what the student typed ───
  function classify(text) {
    const t = text.toLowerCase().trim();
    if (!t) return 'empty';
    // "I'm stuck / give up" style
    if (/\b(stuck|give up|i give up|i can'?t do (this|it)|i cant do (this|it)|too hard|this is hard|so hard|hard)\b/.test(t)) return 'stuck';
    // "I don't get it / I'm confused / explain" (stems, no trailing \b so "confused"/"confusing" match)
    if (/(don'?t get|dont get|don'?t understand|dont understand|confus|\blost\b|explain|i don'?t know how|i dont know how|\bhuh\b|makes no sense|no sense)/.test(t)) return 'confused';
    // Direct help / hint asks
    if (/\b(hint|help|clue|tip|show me|how do i|how do you|where do i start)\b/.test(t)) return 'hint';
    // "idk / no idea" (plain not-knowing)
    if (/\b(idk|no idea|i don'?t know|i dont know|dunno|not sure)\b/.test(t)) return 'confused';
    if (/\b(skip|next|pass|move on)\b/.test(t)) return 'skip';
    if (/\?$/.test(t) || /^(what|how|why|wait)\b/.test(t)) return 'question';
    if (/^(yes|yeah|yep|ok|okay|got it|i think so|ready|sure)\b/.test(t)) return 'affirm';
    return 'answer';
  }

  // ─── Friendly response banks ───
  const praise = [
    "Yes! That's it.", "Exactly right.", "Nailed it.", "You got it.",
    "Spot on.", "Perfect.", "That's the one.", "Beautiful work.",
  ];
  const encourage = [
    "Not quite — give it one more try.", "Close! Look at it once more.",
    "Hmm, not yet. Try again — you can do this.", "Almost. Take another run at it.",
  ];
  const movers = [
    "Next one.", "Okay, here's the next.", "On to the next.", "Let's keep going.",
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ─── State ───
  const state = {
    mode: 'practice',
    i: 0, correct: 0, attempts: 0, hintShown: 0,
    wrongs: [], awaiting: false, finished: false,
    askedConfusing: false, // true after Poly asks "which part is tricky?"
  };

  // Poly Pro (AI hints via the backend). Answer-checking stays rule-based for correct scoring.
  const pro = { on: false, available: false };

  let elStream, elInput, elForm, elSend, elProgress, elScore, elActions,
      elModeChips, elModeMeta, elScreenQuiz, elScreenResult, elResultText, elResultList, elRestart,
      elProToggle, elScreenFlash, elScreenSpeed, elResultTag, elResultTitle;

  // ─── Message rendering ───
  function bubble(text, who) {
    const wrap = document.createElement('div');
    wrap.className = 'cmsg cmsg-' + who;
    if (who === 'poly') {
      wrap.innerHTML = `<span class="cmsg-av" aria-hidden="true"><svg viewBox="0 0 120 110" style="color:#2f6f4e"><use href="#poly-svg"/></svg></span><span class="cmsg-text"></span>`;
      wrap.querySelector('.cmsg-text').textContent = text;
    } else {
      wrap.textContent = text;
    }
    elStream.appendChild(wrap);
    elStream.scrollTop = elStream.scrollHeight;
    return wrap;
  }

  function polyTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'cmsg cmsg-poly cmsg-typing';
    wrap.innerHTML = `<span class="cmsg-av" aria-hidden="true"><svg viewBox="0 0 120 110" style="color:#2f6f4e"><use href="#poly-svg"/></svg></span><span class="cmsg-text"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`;
    elStream.appendChild(wrap);
    elStream.scrollTop = elStream.scrollHeight;
    return wrap;
  }

  // Poly "speaks" with a short typing delay so it feels alive
  function polySay(text, delay = 600) {
    const typing = polyTyping();
    setTimeout(() => {
      typing.remove();
      bubble(text, 'poly');
    }, delay);
  }
  function polySayThen(text, delay, after) {
    const typing = polyTyping();
    setTimeout(() => {
      typing.remove();
      bubble(text, 'poly');
      if (after) after();
    }, delay);
  }

  // ─── Question flow ───
  function askQuestion() {
    const q = COURSE.questions[state.i];
    state.attempts = 0;
    state.hintShown = 0;
    state.askedConfusing = false;
    state.awaiting = true;
    elProgress.textContent = `Question ${state.i + 1} of ${COURSE.questions.length}`;
    const lead = state.i === 0 ? "" : pick(movers) + " ";
    polySay(`${lead}${q.q}`, 500);
    enableInput(true);
  }

  function enableInput(on) {
    elInput.disabled = !on;
    elSend.disabled = !on;
    if (on) setTimeout(() => elInput.focus(), 30);
  }

  function correctAndAdvance(q) {
    if (state.attempts <= 1 && state.hintShown === 0) state.correct++;
    updateScore();
    polySay(`${pick(praise)} ${formatAnswer(q.a)}.`, 500);
    state.awaiting = false;
    setTimeout(() => {
      state.i++;
      if (state.i >= COURSE.questions.length) finish();
      else askQuestion();
    }, 1200);
  }

  function revealAndAdvance(q) {
    state.wrongs.push({ i: state.i, expected: formatAnswer(q.a) });
    updateScore();
    polySay(`The answer is ${formatAnswer(q.a)}. The thinking is what counts — and you stuck with it.`, 600);
    state.awaiting = false;
    setTimeout(() => {
      state.i++;
      if (state.i >= COURSE.questions.length) finish();
      else askQuestion();
    }, 1500);
  }

  function giveHint(q) {
    if (pro.on) return giveProHint(q);
    if (q.hints && state.hintShown < q.hints.length) {
      polySay(q.hints[state.hintShown], 550);
      state.hintShown++;
    } else {
      polySay("Here's the move: think about what the question is really asking, step by step. What do you get?", 550);
    }
  }

  // Ask Mistral for a hint about THIS question — never the answer. Answer is checked by code.
  async function giveProHint(q) {
    const typing = polyTyping();
    const prompt =
      `You are Poly, a kind math tutor for a grade 3-4 child. ` +
      `The question is: "${q.q}". The correct answer is "${formatAnswer(q.a)}". ` +
      `Give ONE short, friendly hint (1-2 simple sentences) that guides the child toward it. ` +
      `Do NOT state the answer. Use kid-friendly words.`;
    try {
      const r = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });
      typing.remove();
      if (!r.ok) throw new Error('bad');
      const data = await r.json();
      bubble(data.reply || "Think about what the question is really asking. What's the first step?", 'poly');
      state.hintShown++;
    } catch (e) {
      typing.remove();
      // Fall back to the built-in hint so the child is never stuck
      if (q.hints && state.hintShown < q.hints.length) { bubble(q.hints[state.hintShown], 'poly'); state.hintShown++; }
      else bubble("Let's break it into small steps. What's the first thing you'd do?", 'poly');
    }
  }

  // ─── The main handler — reads the student's reply ───
  function handle(text) {
    if (!state.awaiting || state.finished) return;
    bubble(text, 'me');
    const q = COURSE.questions[state.i];
    const kind = classify(text);

    // Assessment mode: no hints, one shot, score it
    if (state.mode === 'assessment') {
      if (kind === 'skip' || kind === 'stuck' || kind === 'confused') {
        state.wrongs.push({ i: state.i, expected: formatAnswer(q.a), user: '(skipped)' });
        polySay("No problem — we'll come back to that idea later.", 450);
        state.awaiting = false;
        return setTimeout(() => { state.i++; state.i >= COURSE.questions.length ? finish() : askQuestion(); }, 900);
      }
      state.attempts++;
      if (checkAnswer(text, q.a)) {
        state.correct++; updateScore();
        polySay(pick(praise), 450);
      } else {
        state.wrongs.push({ i: state.i, expected: formatAnswer(q.a), user: text });
        polySay("Got it — noted.", 450);
      }
      state.awaiting = false;
      return setTimeout(() => { state.i++; state.i >= COURSE.questions.length ? finish() : askQuestion(); }, 900);
    }

    // Practice mode: conversational with hints

    // Skip is always honored immediately
    if (kind === 'skip') {
      polySay(`No worries. The answer was ${formatAnswer(q.a)} — we'll see it again.`, 450);
      state.wrongs.push({ i: state.i, expected: formatAnswer(q.a), user: '(skipped)' });
      state.awaiting = false;
      return setTimeout(() => { state.i++; state.i >= COURSE.questions.length ? finish() : askQuestion(); }, 1300);
    }

    // If Poly already asked "which part is tricky?", read the kid's explanation here.
    if (state.askedConfusing && kind !== 'answer') {
      state.askedConfusing = false;
      const replies = [
        "Thanks for telling me — that helps. Let's take it one small piece at a time.",
        "Got it. That part trips a lot of kids up. Here's a way in.",
        "Okay, I hear you. Let's slow it right down.",
      ];
      polySay(pick(replies), 450);
      return setTimeout(() => giveHint(q), 1100);
    }

    // A help request — ask what's confusing FIRST, then we'll hint on their reply.
    if (kind === 'stuck' || kind === 'confused' || kind === 'hint' || kind === 'question') {
      // First time on this question: ask what's tricky. After that, just hint.
      if (!state.askedConfusing && state.hintShown === 0) {
        state.askedConfusing = true;
        const asks = [
          "That's totally okay — this one can be tricky. Which part is confusing? You can just tell me, or say \"all of it.\"",
          "No problem. What's the bit that's tricky — the start, a word, or what to do next?",
          "Happens to everyone. Tell me what's tripping you up and we'll untangle it together.",
        ];
        return polySay(pick(asks), 450);
      }
      // Already talked it through once — go straight to the next hint.
      const warm = ["Sure — here's another nudge.", "Let's look again.", "Okay, try this."];
      polySay(pick(warm), 400);
      return setTimeout(() => giveHint(q), 1000);
    }

    if (kind === 'affirm') {
      return polySay("Great — so what's your answer?", 450);
    }

    // An actual answer attempt
    state.askedConfusing = false;
    state.attempts++;
    if (checkAnswer(text, q.a)) {
      return correctAndAdvance(q);
    }
    // Wrong — encourage, then hint, then reveal after a few tries
    if (state.attempts >= 3) {
      return revealAndAdvance(q);
    }
    polySay(pick(encourage), 500);
    if (q.hints && state.hintShown < q.hints.length) {
      setTimeout(() => giveHint(q), 1100);
    }
  }

  function updateScore() {
    elScore.textContent = `${state.correct} right`;
  }

  // ─── Results ───
  function finish() {
    state.finished = true;
    showScreen('result');
    if (elResultTag) elResultTag.textContent = 'Course complete';
    if (elResultTitle) elResultTitle.textContent = 'How it went.';
    const total = COURSE.questions.length;
    const pct = Math.round((state.correct / total) * 100);
    elResultText.textContent = state.mode === 'assessment'
      ? `You got ${state.correct} out of ${total} — that's ${pct}%.`
      : `You worked through all ${total} questions, ${state.correct} right on the first try. Every one made you a little sharper.`;
    elResultList.innerHTML = '';
    if (state.wrongs.length) {
      const h = document.createElement('div');
      h.className = 'result-tag';
      h.textContent = 'Worth a second look';
      elResultList.appendChild(h);
      state.wrongs.forEach(w => {
        const q = COURSE.questions[w.i];
        const row = document.createElement('div');
        row.className = 'result-row';
        const yours = w.user ? `<div class="rr-a">You said: <span class="mono">${w.user}</span> &nbsp;·&nbsp; Answer: <span class="mono">${w.expected}</span></div>` : `<div class="rr-a">Answer: <span class="mono">${w.expected}</span></div>`;
        row.innerHTML = `<div class="rr-q mono">${q.q}</div>${yours}`;
        elResultList.appendChild(row);
      });
    } else {
      const h = document.createElement('div');
      h.className = 'result-tag';
      h.textContent = state.mode === 'assessment' ? 'Perfect run' : 'Clean session — no slips';
      elResultList.appendChild(h);
    }
  }

  // ─── Mode + reset ───
  function reset() {
    state.i = 0; state.correct = 0; state.attempts = 0; state.hintShown = 0;
    state.wrongs = []; state.awaiting = false; state.finished = false;
    elScreenResult.style.display = 'none';
    elScreenQuiz.style.display = '';
    elStream.innerHTML = '';
    updateScore();
    enableInput(false);
    const intro = state.mode === 'assessment'
      ? `Hi, I'm Poly. This is the assessment — ${COURSE.questions.length} questions, no hints, and I'll score it at the end. Take your time. Ready?`
      : `Hi, I'm Poly! We'll go through ${COURSE.questions.length} ${COURSE.title} questions together. I give hints, not answers — and you can type "hint" or "I'm stuck" anytime. Let's start.`;
    polySayThen(intro, 500, () => setTimeout(askQuestion, 700));
    enableInput(true);
  }

  function showScreen(name) {
    const map = { quiz: elScreenQuiz, flash: elScreenFlash, speed: elScreenSpeed, result: elScreenResult };
    Object.entries(map).forEach(([k, el]) => { if (el) el.style.display = (k === name) ? '' : 'none'; });
  }

  function setMode(mode) {
    state.mode = mode;
    elModeChips.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    const metas = {
      practice: 'Poly chats and gives hints as you go',
      assessment: 'Assessment — no hints, scored at the end',
      flashcards: 'Type your answer, flip to check, rate yourself',
      speed: 'Race the clock — streaks add bonus time',
    };
    elModeMeta.textContent = metas[mode] || metas.practice;
    if (elActions) elActions.style.display = (mode === 'practice') ? '' : 'none';
    stopSpeed(); // clear any running timer when switching away

    if (mode === 'flashcards') { showScreen('flash'); startFlash(); }
    else if (mode === 'speed') { showScreen('speed'); startSpeed(); }
    else { showScreen('quiz'); reset(); }
  }

  // ════════════════ FLASHCARDS (type → flip → rate) ════════════════
  const flash = { order: [], pos: 0, got: 0, again: [], flipped: false, animating: false };
  let elFlashCard, elFlashQ, elFlashA, elFlashYours, elFlashCount, elFlashTally,
      elFlashForm, elFlashInput, elFlashFlip, elFlashRate, elFlashDeck;

  function startFlash() {
    flash.order = COURSE.questions.map((_, i) => i);
    flash.pos = 0; flash.got = 0; flash.again = []; flash.flipped = false; flash.animating = false;
    if (elFlashDeck) elFlashDeck.classList.remove('empty');
    if (elFlashCard) elFlashCard.classList.remove('fly-right', 'fly-left', 'flipped');
    renderFlash();
  }
  function renderFlash() {
    const q = COURSE.questions[flash.order[flash.pos]];
    elFlashCard.classList.remove('flipped');
    flash.flipped = false;
    elFlashQ.textContent = q.q;
    elFlashA.textContent = formatAnswer(q.a);
    elFlashYours.textContent = '';
    elFlashYours.className = 'flash-yours';
    elFlashCount.textContent = `Card ${flash.pos + 1} of ${flash.order.length}`;
    elFlashTally.textContent = `${flash.got} got it`;
    // Thin the peeking stack as we near the last card
    if (elFlashDeck) elFlashDeck.classList.toggle('empty', flash.order.length - flash.pos <= 1);
    elFlashForm.style.display = '';
    elFlashRate.style.display = 'none';
    elFlashInput.value = '';
    setTimeout(() => elFlashInput.focus(), 30);
  }
  function flipFlash() {
    const q = COURSE.questions[flash.order[flash.pos]];
    const typed = elFlashInput.value.trim();
    if (typed) {
      const right = checkAnswer(typed, q.a);
      elFlashYours.textContent = right ? `You said "${typed}" — correct!` : `You said "${typed}".`;
      elFlashYours.className = 'flash-yours ' + (right ? 'right' : 'wrong');
    }
    elFlashCard.classList.add('flipped');
    flash.flipped = true;
    elFlashForm.style.display = 'none';
    elFlashRate.style.display = '';
  }
  function rateFlash(good) {
    if (flash.animating) return;
    flash.animating = true;
    if (good) flash.got++;
    else flash.again.push(flash.order[flash.pos]);

    // Slide the current card away (right = got it, left = review)
    elFlashCard.classList.add(good ? 'fly-right' : 'fly-left');
    elFlashRate.style.display = 'none';

    setTimeout(() => {
      flash.pos++;
      // Decide what's next
      const moreInDeck = flash.pos < flash.order.length;
      if (!moreInDeck && flash.again.length) {
        flash.order = flash.again; flash.again = []; flash.pos = 0;
      } else if (!moreInDeck) {
        return finishFlash();
      }
      // Reset card and render the next one with a rise-in
      elFlashCard.classList.remove('fly-right', 'fly-left', 'flipped');
      flash.flipped = false;
      renderFlash();
      elFlashCard.classList.add('rise-in');
      setTimeout(() => { elFlashCard.classList.remove('rise-in'); flash.animating = false; }, 420);
    }, 460);
  }
  function finishFlash() {
    showScreen('result');
    elResultTag && (elResultTag.textContent = 'Flashcards done');
    elResultTitle && (elResultTitle.textContent = 'Nice deck run.');
    elResultText.textContent = `You marked ${flash.got} cards as "got it" and cleared every "review again." Spaced practice like this is what makes facts stick.`;
    elResultList.innerHTML = '';
  }

  // ════════════════ SPEED (race the clock + streak bonus) ════════════════
  const SPEED_START = 60, BONUS = 2;
  const speed = { time: 0, score: 0, streak: 0, order: [], pos: 0, running: false, raf: 0, last: 0 };
  let elSpeedStart, elSpeedPlay, elSpeedGo, elSpeedClock, elSpeedScore, elSpeedStreak,
      elStopwatch, elSwProg, elSpeedQ, elSpeedForm, elSpeedInput, elSpeedSend, elSpeedFlash;

  function startSpeed() {
    stopSpeed();
    elSpeedStart.style.display = '';
    elSpeedPlay.style.display = 'none';
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function beginSpeed() {
    speed.time = SPEED_START; speed.score = 0; speed.streak = 0;
    speed.order = shuffle(COURSE.questions.map((_, i) => i)); speed.pos = 0;
    speed.running = true; speed.last = performance.now();
    elSpeedStart.style.display = 'none';
    elSpeedPlay.style.display = '';
    nextSpeedQ();
    elSpeedFlash.textContent = '';
    speed.raf = requestAnimationFrame(tickSpeed);
    setTimeout(() => elSpeedInput.focus(), 30);
  }
  function tickSpeed(now) {
    if (!speed.running) return;
    const dt = (now - speed.last) / 1000; speed.last = now;
    speed.time -= dt;
    if (speed.time <= 0) { speed.time = 0; renderClock(); return endSpeed(); }
    renderClock();
    speed.raf = requestAnimationFrame(tickSpeed);
  }
  function renderClock() {
    elSpeedClock.textContent = Math.ceil(speed.time);
    const low = speed.time <= 10;
    if (elStopwatch) elStopwatch.classList.toggle('low', low);
    const frac = Math.max(0, Math.min(1, speed.time / SPEED_START));
    if (elSwProg) {
      const C = 2 * Math.PI * 52; // 326.7
      elSwProg.style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
    }
  }
  function nextSpeedQ() {
    if (speed.pos >= speed.order.length) speed.order = shuffle(speed.order); // loop if they're fast
    speed.pos = speed.pos % speed.order.length;
    const q = COURSE.questions[speed.order[speed.pos]];
    elSpeedQ.textContent = q.q;
    elSpeedInput.value = '';
  }
  function submitSpeed() {
    if (!speed.running) return;
    const v = elSpeedInput.value.trim();
    if (!v) return;
    const q = COURSE.questions[speed.order[speed.pos]];
    if (checkAnswer(v, q.a)) {
      speed.score++; speed.streak++;
      speed.time += BONUS;
      elSpeedFlash.innerHTML = `Yes! <span class="bonus">+${BONUS}s</span>`;
      elSpeedFlash.className = 'speed-flash ok';
      elSpeedScore.textContent = speed.score;
      elSpeedStreak.textContent = speed.streak >= 3 ? `🔥 ${speed.streak} streak` : '';
      renderClock();
    } else {
      speed.streak = 0;
      elSpeedFlash.textContent = `It was ${formatAnswer(q.a)}.`;
      elSpeedFlash.className = 'speed-flash no';
      elSpeedStreak.textContent = '';
    }
    speed.pos++;
    nextSpeedQ();
    elSpeedInput.focus();
  }
  function endSpeed() {
    stopSpeed();
    showScreen('result');
    elResultTag && (elResultTag.textContent = 'Time!');
    elResultTitle && (elResultTitle.textContent = "Clock's up.");
    elResultText.textContent = `You answered ${speed.score} right against the clock. ${speed.score >= 10 ? 'Lightning fast!' : speed.score >= 5 ? 'Solid run — go again and beat it.' : 'Keep at it — speed comes with practice.'}`;
    elResultList.innerHTML = '';
  }
  function stopSpeed() {
    speed.running = false;
    if (speed.raf) cancelAnimationFrame(speed.raf);
    speed.raf = 0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.COURSE === 'undefined') return;
    elStream = document.getElementById('chat-stream');
    elInput = document.getElementById('q-input');
    elForm = document.getElementById('q-form');
    elSend = document.getElementById('q-send');
    elProgress = document.getElementById('csh-progress');
    elScore = document.getElementById('csh-score');
    elActions = document.getElementById('chat-actions');
    elModeChips = document.getElementById('mode-chips');
    elModeMeta = document.getElementById('mode-meta');
    elScreenQuiz = document.getElementById('screen-quiz');
    elScreenResult = document.getElementById('screen-result');
    elScreenFlash = document.getElementById('screen-flash');
    elScreenSpeed = document.getElementById('screen-speed');
    elResultText = document.getElementById('result-text');
    elResultList = document.getElementById('result-list');
    elResultTag = document.getElementById('result-tag');
    elResultTitle = document.getElementById('result-title');
    elRestart = document.getElementById('result-restart');

    // Flashcard elements
    elFlashDeck = document.getElementById('flash-deck');
    elFlashCard = document.getElementById('flashcard');
    elFlashQ = document.getElementById('flash-q');
    elFlashA = document.getElementById('flash-a');
    elFlashYours = document.getElementById('flash-yours');
    elFlashCount = document.getElementById('flash-count');
    elFlashTally = document.getElementById('flash-tally');
    elFlashForm = document.getElementById('flash-form');
    elFlashInput = document.getElementById('flash-input');
    elFlashRate = document.getElementById('flash-rate');

    // Speed elements
    elSpeedStart = document.getElementById('speed-start');
    elSpeedPlay = document.getElementById('speed-play');
    elSpeedGo = document.getElementById('speed-go');
    elSpeedClock = document.getElementById('speed-clock');
    elSpeedScore = document.getElementById('speed-score');
    elSpeedStreak = document.getElementById('speed-streak');
    elStopwatch = document.querySelector('.stopwatch');
    elSwProg = document.getElementById('sw-prog');
    elSpeedQ = document.getElementById('speed-q');
    elSpeedForm = document.getElementById('speed-form');
    elSpeedInput = document.getElementById('speed-input');
    elSpeedSend = document.getElementById('speed-send');
    elSpeedFlash = document.getElementById('speed-flash');

    elForm.addEventListener('submit', e => {
      e.preventDefault();
      const v = elInput.value.trim();
      if (!v) return;
      elInput.value = '';
      handle(v);
    });

    elActions.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b || !state.awaiting) return;
      const map = { hint: 'hint', stuck: "I'm stuck", skip: 'skip' };
      handle(map[b.dataset.act]);
    });

    // Flashcard listeners
    elFlashForm.addEventListener('submit', e => { e.preventDefault(); if (!flash.flipped) flipFlash(); });
    elFlashCard.addEventListener('click', () => { if (!flash.flipped && !flash.animating) flipFlash(); }); // tap the card to flip
    elFlashRate.addEventListener('click', e => {
      const b = e.target.closest('[data-rate]');
      if (b) rateFlash(b.dataset.rate === 'good');
    });

    // Speed listeners
    elSpeedGo.addEventListener('click', beginSpeed);
    elSpeedForm.addEventListener('submit', e => { e.preventDefault(); submitSpeed(); });

    elModeChips.addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (b) setMode(b.dataset.mode);
    });
    elRestart.addEventListener('click', () => setMode(state.mode));

    // ─── Poly Pro toggle ───
    elProToggle = document.getElementById('course-pro-toggle');
    if (elProToggle) {
      // Enable Pro whenever served over http(s); /chat is the real test.
      // Only disable for local file:// where no server can answer.
      const onServer = location.protocol === 'http:' || location.protocol === 'https:';
      pro.available = onServer;
      if (!onServer) { elProToggle.disabled = true; elProToggle.title = 'Open the hosted site to use Poly Pro'; }

      elProToggle.addEventListener('click', () => {
        if (!pro.available) return;
        pro.on = !pro.on;
        elProToggle.setAttribute('aria-checked', String(pro.on));
        elModeMeta.textContent = pro.on
          ? 'Poly Pro · AI hints (answers still checked exactly)'
          : (state.mode === 'assessment' ? 'Assessment — no hints, scored at the end' : 'Poly chats and gives hints as you go');
      });
    }

    setMode('practice');
  });
})();
