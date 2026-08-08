(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- NAV ---------------- */
  var nav = document.querySelector('.nav');
  var onScroll = function(){
    if(window.scrollY > 8){ nav.classList.add('is-scrolled'); }
    else{ nav.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if(toggle && mobileMenu){
    toggle.addEventListener('click', function(){
      var open = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        toggle.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- SCROLL REVEAL ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------------- FAQ ACCORDION ---------------- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function(other){
        if(other !== item){
          other.classList.remove('is-open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', (!isOpen).toString());
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ---------------- HERO PRECISION GRID ---------------- */
  var canvasHost = document.querySelector('.hero-grid-canvas');
  if(canvasHost){
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    var W = 1600, H = 900;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    var cols = 16, rows = 9;
    var cw = W / cols, ch = H / rows;

    var linesGroup = document.createElementNS(NS, 'g');
    linesGroup.setAttribute('stroke', 'rgba(255,255,255,0.07)');
    linesGroup.setAttribute('stroke-width', '1');

    for(var c = 0; c <= cols; c++){
      var x = c * cw;
      var vline = document.createElementNS(NS, 'line');
      vline.setAttribute('x1', x); vline.setAttribute('y1', 0);
      vline.setAttribute('x2', x); vline.setAttribute('y2', H);
      linesGroup.appendChild(vline);
    }
    for(var r = 0; r <= rows; r++){
      var y = r * ch;
      var hline = document.createElementNS(NS, 'line');
      hline.setAttribute('x1', 0); hline.setAttribute('y1', y);
      hline.setAttribute('x2', W); hline.setAttribute('y2', y);
      linesGroup.appendChild(hline);
    }
    svg.appendChild(linesGroup);

    // Calibrating highlight cells
    var seedCells = [
      { c: 3, r: 2 }, { c: 11, r: 5 }, { c: 6, r: 6 }, { c: 13, r: 1 }, { c: 8, r: 3 }
    ];
    var cellsGroup = document.createElementNS(NS, 'g');
    seedCells.forEach(function(cell, i){
      var rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', cell.c * cw);
      rect.setAttribute('y', cell.r * ch);
      rect.setAttribute('width', cw);
      rect.setAttribute('height', ch);
      rect.setAttribute('fill', 'rgba(58,92,255,0.10)');
      rect.setAttribute('stroke', 'rgba(58,92,255,0.55)');
      rect.setAttribute('stroke-width', '1');
      rect.style.opacity = '0';
      rect.style.transformOrigin = 'center';
      if(!reduceMotion){
        rect.style.animation = 'gridPulse 6s ease-in-out ' + (i * 1.1) + 's infinite';
      } else {
        rect.style.opacity = '0.6';
      }
      cellsGroup.appendChild(rect);

      var label = document.createElementNS(NS, 'text');
      var colLetter = String.fromCharCode(65 + cell.c % 26);
      label.textContent = colLetter + (cell.r + 1);
      label.setAttribute('x', cell.c * cw + 8);
      label.setAttribute('y', cell.r * ch + 18);
      label.setAttribute('font-family', 'IBM Plex Mono, monospace');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', 'rgba(58,92,255,0.75)');
      label.style.opacity = '0';
      if(!reduceMotion){
        label.style.animation = 'gridPulse 6s ease-in-out ' + (i * 1.1) + 's infinite';
      } else {
        label.style.opacity = '0.8';
      }
      cellsGroup.appendChild(label);
    });
    svg.appendChild(cellsGroup);

    var styleTag = document.createElementNS(NS, 'style');
    styleTag.textContent = '@keyframes gridPulse{0%,100%{opacity:0;}45%{opacity:1;}70%{opacity:1;}90%{opacity:0;}}';
    svg.appendChild(styleTag);

    canvasHost.appendChild(svg);

    if(!reduceMotion){
      var targetX = 0, targetY = 0, curX = 0, curY = 0;
      window.addEventListener('pointermove', function(e){
        var nx = (e.clientX / window.innerWidth) - 0.5;
        var ny = (e.clientY / window.innerHeight) - 0.5;
        targetX = nx * 14;
        targetY = ny * 10;
      }, { passive:true });

      function raf(){
        curX += (targetX - curX) * 0.04;
        curY += (targetY - curY) * 0.04;
        svg.style.transform = 'translate3d(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px,0) scale(1.03)';
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  /* ---------------- CONTACT FORM ---------------- */
  var form = document.getElementById('contact-form');
  if(form){
    var submitBtn = document.getElementById('cf-submit');
    var status = document.getElementById('cf-status');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      var label = submitBtn.querySelector('.btn-label');
      var originalLabel = label.textContent;
      label.textContent = 'Sending';

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function(response){
        if(response.ok){
          form.reset();
          status.textContent = 'Sent. A senior engineer will reply within one business day.';
          status.classList.add('is-success');
        } else {
          return response.json().then(function(json){
            var msg = (json && json.errors && json.errors.length)
              ? json.errors.map(function(er){ return er.message; }).join(', ')
              : 'Something went wrong. Please try again or email hello@gridd.com directly.';
            throw new Error(msg);
          });
        }
      }).catch(function(err){
        status.textContent = err.message || 'Something went wrong. Please try again or email hello@gridd.com directly.';
        status.classList.add('is-error');
      }).finally(function(){
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        label.textContent = originalLabel;
      });
    });
  }

  /* ---------------- YEAR ---------------- */
  var yearEl = document.querySelector('[data-year]');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

})();