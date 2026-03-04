(function () {
  'use strict';

  const TOTAL = 24;
  let current = 0;

  // --- 要素取得 ---
  const track    = document.getElementById('slidesTrack');
  const counter  = document.getElementById('slideCounter');
  const progress = document.getElementById('progressFill');
  const btnPrev  = document.getElementById('navPrev');
  const btnNext  = document.getElementById('navNext');
  const dotsWrap = document.getElementById('navDots');
  const slides   = document.querySelectorAll('.slide');

  // --- ドット生成 ---
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('button');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `スライド ${i + 1}`);
    dot.dataset.index = i;
    dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap.querySelectorAll('.nav-dot');

  // ドットクリック
  dotsWrap.addEventListener('click', function (e) {
    const dot = e.target.closest('.nav-dot');
    if (dot) goTo(Number(dot.dataset.index));
  });

  // --- スライド移動 ---
  function goTo(index) {
    if (index < 0 || index >= TOTAL) return;
    current = index;
    render();
  }

  function render() {
    // トラックを横移動（コンテナのpx幅を使用 → PC表示でも正確に動く）
    var slideW = wrapper.offsetWidth;
    track.style.transform = 'translateX(-' + (current * slideW) + 'px)';

    // カウンター更新
    counter.textContent = (current + 1) + ' / ' + TOTAL;

    // プログレスバー更新
    progress.style.width = (((current + 1) / TOTAL) * 100) + '%';

    // ドット更新
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });

    // 矢印ボタン更新
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === TOTAL - 1;

    // コンテンツを先頭にスクロールリセット
    const content = slides[current] && slides[current].querySelector('.slide-content');
    if (content) content.scrollTop = 0;
  }

  // --- ボタン操作 ---
  btnPrev.addEventListener('click', function () { goTo(current - 1); });
  btnNext.addEventListener('click', function () { goTo(current + 1); });
  document.getElementById('tocBtn').addEventListener('click', function () { goTo(0); });

  // --- 目次クリック ---
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-slide]');
    if (item) goTo(Number(item.dataset.slide));
  });

  // --- キーボード操作 ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // --- タッチスワイプ ---
  // 縦スクロールと横スワイプを判別して処理を分岐する
  // コンテンツエリア内のタッチはスワイプ判定をスキップ（iOS click 発火のため）
  var touchStartX = 0;
  var touchStartY = 0;
  var swipeDir       = null; // 'h' | 'v' | null
  var touchInContent = false; // .slide-content 内から開始したか

  var wrapper = document.querySelector('.slider-wrapper');

  wrapper.addEventListener('touchstart', function (e) {
    touchStartX    = e.touches[0].clientX;
    touchStartY    = e.touches[0].clientY;
    swipeDir       = null;
    touchInContent = !!e.target.closest('.slide-content');
  }, { passive: true });

  wrapper.addEventListener('touchmove', function (e) {
    // コンテンツエリア内はスワイプ判定しない（縦スクロール＋タップを優先）
    if (touchInContent) return;
    if (swipeDir === null) {
      var dx = Math.abs(e.touches[0].clientX - touchStartX);
      var dy = Math.abs(e.touches[0].clientY - touchStartY);
      // 5px 以上動いたら方向確定
      if (dx > 5 || dy > 5) {
        swipeDir = dx >= dy ? 'h' : 'v';
      }
    }
    // 横スワイプと判定した場合はページの縦スクロールをブロック
    if (swipeDir === 'h') {
      e.preventDefault();
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', function (e) {
    if (touchInContent || swipeDir !== 'h') return;
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current + 1); // 左スワイプ → 次へ
      else          goTo(current - 1); // 右スワイプ → 前へ
    }
    swipeDir = null;
  }, { passive: true });

  // --- ウィンドウリサイズ時に位置を再計算 ---
  window.addEventListener('resize', function () { render(); });

  // --- 初期描画 ---
  render();

})();
