// Quiz engine — shared by every course page. Reads window.COURSE for the question bank.
(function () {
  const norm = (s) => String(s).toLowerCase().trim().replace(/\s+/g, '');
  function checkAnswer(user, expected) {
    const u = norm(user);
    const list = Array.isArray(expected) ? expected : [expected];
    return list.some(e => {
      const n = norm(e);
      if (u === n) return true;
      // numeric tolerance
      const un = parseFloat(u), en = parseFloat(n);
      if (!isNaN(un) && !isNaN(en) && Math.abs(un - en) < 0.0001) return true;
      return false;
    });
  }

  const state = {
    mode: 'practice', // 'practice' | 'assessment'
    i: 0,
    correct: 0,
    attempts: 0,
    wrongs: [],   // { i, user, expected }
    revealed: false,
    hintShown: 0,
  };

  let elQ, elInput, elFeedback, elSubmit, elNext, elHintBtn, elModeChips, elProgress, elScreenQuiz, elScreenResult, elResultText, elResultList, elRestart;

  function render() {
    const q = COURSE.questions[state.i];
    elQ.textContent = q.q;
    elInput.value = '';
    elInput.disabled = false;
    elInput.focus();
    elFeedback.textContent = '';
    elFeedback.className = 'q-feedback';
    elNext.style.display = 'none';
    elSubmit.style.display = '';
    elHintBtn.style.display = (state.mode === 'practice' && q.hints && q.hints.length) ? '' : 'none';
    state.revealed = false;
    state.hintShown = 0;
    elProgress.textContent = `Question ${state.i + 1} of ${COURSE.questions.length}`;
  }

  function submit() {
    const q = COURSE.questions[state.i];
    const v = elInput.value;
    if (!v.trim()) return;
    state.attempts++;
    const ok = checkAnswer(v, q.a);
    if (ok) {
      if (!state.revealed) state.correct++;
      elFeedback.textContent = state.mode === 'assessment' ? 'Correct.' : `Yes! ${formatAnswer(q.a)} — nice.`;
      elFeedback.className = 'q-feedback ok';
      elInput.disabled = true;
      elSubmit.style.display = 'none';
      elNext.style.display = '';
      if (state.mode === 'assessment' && !state.revealed) {
        // already counted
      }
    } else {
      if (state.mode === 'assessment') {
        state.wrongs.push({ i: state.i, user: v, expected: formatAnswer(q.a) });
        elFeedback.textContent = 'Not quite. Moving on.';
        elFeedback.className = 'q-feedback err';
        elInput.disabled = true;
        elSubmit.style.display = 'none';
        elNext.style.display = '';
      } else {
        // practice: nudge with a hint or reveal
        if (q.hints && state.hintShown < q.hints.length) {
          elFeedback.textContent = q.hints[state.hintShown];
          elFeedback.className = 'q-feedback hint';
          state.hintShown++;
        } else {
          state.revealed = true;
          state.wrongs.push({ i: state.i, user: v, expected: formatAnswer(q.a) });
          elFeedback.textContent = `The answer is ${formatAnswer(q.a)}. Try the next one.`;
          elFeedback.className = 'q-feedback err';
          elInput.disabled = true;
          elSubmit.style.display = 'none';
          elNext.style.display = '';
        }
      }
    }
  }

  function formatAnswer(a) { return Array.isArray(a) ? a[0] : String(a); }

  function next() {
    if (state.i + 1 >= COURSE.questions.length) return finish();
    state.i++;
    render();
  }

  function finish() {
    elScreenQuiz.style.display = 'none';
    elScreenResult.style.display = '';
    const total = COURSE.questions.length;
    const pct = Math.round((state.correct / total) * 100);
    let msg;
    if (state.mode === 'assessment') {
      msg = `You got ${state.correct} out of ${total}. That's ${pct}%.`;
    } else {
      msg = `You worked through all ${total} questions. ${state.correct} on the first try.`;
    }
    elResultText.textContent = msg;
    elResultList.innerHTML = '';
    if (state.wrongs.length) {
      const h = document.createElement('div');
      h.className = 'result-tag';
      h.textContent = 'Worth a second look';
      elResultList.appendChild(h);
      state.wrongs.forEach(w => {
        const row = document.createElement('div');
        row.className = 'result-row';
        const q = COURSE.questions[w.i];
        row.innerHTML = `<div class="rr-q mono">${q.q}</div><div class="rr-a">Your answer: <span class="mono">${w.user}</span> &nbsp;·&nbsp; Right answer: <span class="mono">${w.expected}</span></div>`;
        elResultList.appendChild(row);
      });
    } else {
      const h = document.createElement('div');
      h.className = 'result-tag';
      h.textContent = state.mode === 'assessment' ? 'Perfect run' : 'Clean session — no slips';
      elResultList.appendChild(h);
    }
  }

  function reset() {
    state.i = 0; state.correct = 0; state.attempts = 0; state.wrongs = []; state.revealed = false; state.hintShown = 0;
    elScreenResult.style.display = 'none';
    elScreenQuiz.style.display = '';
    render();
  }

  function setMode(mode) {
    state.mode = mode;
    elModeChips.querySelectorAll('[data-mode]').forEach(b => {
      b.classList.toggle('on', b.dataset.mode === mode);
    });
    reset();
  }

  function hint() {
    const q = COURSE.questions[state.i];
    if (!q.hints || !q.hints.length) return;
    if (state.hintShown >= q.hints.length) return;
    elFeedback.textContent = q.hints[state.hintShown];
    elFeedback.className = 'q-feedback hint';
    state.hintShown++;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.COURSE === 'undefined') return;
    elQ = document.getElementById('q-prompt');
    elInput = document.getElementById('q-input');
    elFeedback = document.getElementById('q-feedback');
    elSubmit = document.getElementById('q-submit');
    elNext = document.getElementById('q-next');
    elHintBtn = document.getElementById('q-hint');
    elModeChips = document.getElementById('mode-chips');
    elProgress = document.getElementById('q-progress');
    elScreenQuiz = document.getElementById('screen-quiz');
    elScreenResult = document.getElementById('screen-result');
    elResultText = document.getElementById('result-text');
    elResultList = document.getElementById('result-list');
    elRestart = document.getElementById('result-restart');

    document.getElementById('q-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
    elNext.addEventListener('click', next);
    elHintBtn.addEventListener('click', hint);
    elRestart.addEventListener('click', () => setMode(state.mode));
    elModeChips.addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (b) setMode(b.dataset.mode);
    });
    setMode('practice');
  });
})();
