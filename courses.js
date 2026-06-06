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
    if (/\b(stuck|don'?t know|idk|i dont know|no idea|give up|i can'?t|i cant)\b/.test(t)) return 'stuck';
    if (/\b(hint|help|clue|tip)\b/.test(t)) return 'hint';
    if (/\b(skip|next|pass|move on)\b/.test(t)) return 'skip';
    if (/\?$/.test(t) || /^(what|how|why|huh|wait)\b/.test(t)) return 'question';
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
  };

  let elStream, elInput, elForm, elSend, elProgress, elScore, elActions,
      elModeChips, elModeMeta, elScreenQuiz, elScreenResult, elResultText, elResultList, elRestart;

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
    if (q.hints && state.hintShown < q.hints.length) {
      polySay(q.hints[state.hintShown], 550);
      state.hintShown++;
    } else {
      polySay("Here's the move: think about what the question is really asking, step by step. What do you get?", 550);
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
      if (kind === 'skip' || kind === 'stuck') {
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
    if (kind === 'stuck') {
      polySay("That's okay — everyone gets stuck. Let me help.", 450);
      return setTimeout(() => giveHint(q), 1100);
    }
    if (kind === 'hint') {
      return giveHint(q);
    }
    if (kind === 'skip') {
      polySay(`No worries. The answer was ${formatAnswer(q.a)} — we'll see it again.`, 450);
      state.wrongs.push({ i: state.i, expected: formatAnswer(q.a), user: '(skipped)' });
      state.awaiting = false;
      return setTimeout(() => { state.i++; state.i >= COURSE.questions.length ? finish() : askQuestion(); }, 1300);
    }
    if (kind === 'question') {
      polySay("Good question. Here's a nudge to get you going.", 450);
      return setTimeout(() => giveHint(q), 1100);
    }
    if (kind === 'affirm') {
      return polySay("Great — so what's your answer?", 450);
    }

    // An actual answer attempt
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
    elScreenQuiz.style.display = 'none';
    elScreenResult.style.display = '';
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

  function setMode(mode) {
    state.mode = mode;
    elModeChips.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    elModeMeta.textContent = mode === 'assessment'
      ? 'Assessment — no hints, scored at the end'
      : 'Poly chats and gives hints as you go';
    if (elActions) elActions.style.display = mode === 'assessment' ? 'none' : '';
    reset();
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
    elResultText = document.getElementById('result-text');
    elResultList = document.getElementById('result-list');
    elRestart = document.getElementById('result-restart');

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

    elModeChips.addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (b) setMode(b.dataset.mode);
    });
    elRestart.addEventListener('click', () => setMode(state.mode));

    setMode('practice');
  });
})();
