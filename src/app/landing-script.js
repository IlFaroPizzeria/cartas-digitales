(function () {
  // Scroll reveal — safe on every marketing page, no-ops if there's nothing to reveal.
  try {
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        revealEls.forEach(function (el) {
          io.observe(el);
        });
      } else {
        revealEls.forEach(function (el) {
          el.classList.add('in');
        });
      }
    }
  } catch (e) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in');
    });
  }

  // Demo tabs — only present on /producto.
  var tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        tabBtns.forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        document.querySelectorAll('.tab-panel-text').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
        document.querySelectorAll('.tap-stage').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
      });
    });
  }

  // Calculator — only present on /precios. Real Cartoca pricing.
  var menuValue = document.getElementById('menuValue');
  if (menuValue) {
    var WHATSAPP = '34644090462';
    function waLink(text) {
      return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    }

    var BASE_PRICE = 50;
    var MENU_TIER_THRESHOLD = 30, MENU_BASE = 20, MENU_DISCOUNT = 18;
    var REVIEW_TIER_THRESHOLD = 5, REVIEW_BASE = 30, REVIEW_DISCOUNT = 25;

    var state = { menu: 6, reviews: 1, maint: false };

    var reviewValue = document.getElementById('reviewValue');
    var totalAmount = document.getElementById('totalAmount');
    var maintToggle = document.getElementById('maintToggle');
    var maintLine = document.getElementById('maintLine');
    var calcWa = document.getElementById('calc-wa');

    function tierPrice(qty, base, discounted, threshold) {
      if (qty <= 0) return 0;
      var price = qty >= threshold ? discounted : base;
      return qty * price;
    }

    function bump() {
      totalAmount.classList.add('bump');
      setTimeout(function () {
        totalAmount.classList.remove('bump');
      }, 220);
    }

    function render(animate) {
      menuValue.textContent = state.menu;
      reviewValue.textContent = state.reviews;
      maintToggle.setAttribute('aria-pressed', state.maint ? 'true' : 'false');
      maintLine.style.display = state.maint ? 'flex' : 'none';

      var menuCost = tierPrice(state.menu, MENU_BASE, MENU_DISCOUNT, MENU_TIER_THRESHOLD);
      var reviewCost = tierPrice(state.reviews, REVIEW_BASE, REVIEW_DISCOUNT, REVIEW_TIER_THRESHOLD);
      var total = BASE_PRICE + menuCost + reviewCost;
      totalAmount.textContent = total + '€';
      if (animate) bump();

      var lines = [
        'Hola, quiero pedir presupuesto para mi carta digital Cartoca:',
        '- ' + state.menu + ' tarjeta(s) NFC de menú',
        '- ' + state.reviews + ' tarjeta(s) NFC de reseñas',
        '- Acceso a la plataforma: ' + (state.maint ? 'sí (desde 25€/mes, según funciones)' : 'no'),
        'Pago único estimado: ' + total + '€',
      ];
      calcWa.href = waLink(lines.join('\n'));
    }

    document.getElementById('menuMinus').addEventListener('click', function () {
      state.menu = Math.max(0, state.menu - 1);
      render(true);
    });
    document.getElementById('menuPlus').addEventListener('click', function () {
      state.menu = Math.min(80, state.menu + 1);
      render(true);
    });
    document.getElementById('reviewMinus').addEventListener('click', function () {
      state.reviews = Math.max(0, state.reviews - 1);
      render(true);
    });
    document.getElementById('reviewPlus').addEventListener('click', function () {
      state.reviews = Math.min(30, state.reviews + 1);
      render(true);
    });
    maintToggle.addEventListener('click', function () {
      state.maint = !state.maint;
      render(true);
    });

    render(false);
  }
})();
