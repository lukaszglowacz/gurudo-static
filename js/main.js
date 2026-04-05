/* ============================================================
   GURUDO — js/main.js
   Vanilla JS — no dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. THEME TOGGLE (dark / light)
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Ensure default if no saved preference
  if (!html.getAttribute('data-theme')) {
    html.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';

      // Enable smooth transition across all elements
      document.body.classList.add('theme-transitioning');
      html.setAttribute('data-theme', next);
      localStorage.setItem('gurudo-theme', next);
      themeToggle.setAttribute('aria-label',
        next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

      // Remove class after transition completes
      window.clearTimeout(themeToggle._transTimer);
      themeToggle._transTimer = window.setTimeout(function () {
        document.body.classList.remove('theme-transitioning');
      }, 750);
    });
  }

  /* ----------------------------------------------------------
     1. NAVBAR: add .navbar--scrolled on scroll
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     2. MOBILE MENU TOGGLE
  ---------------------------------------------------------- */
  const toggle = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      const open = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close mobile menu when any link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     3. SCROLL-REVEAL via IntersectionObserver
  ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     4. TESTIMONIALS SLIDER
  ---------------------------------------------------------- */
  var currentSlide = 0;
  var totalSlides = 4;
  var track = document.getElementById('slider-track');
  var dots = document.querySelectorAll('.slider__dot');
  var autoplayTimer;

  function goToSlide(n) {
    currentSlide = ((n % totalSlides) + totalSlides) % totalSlides;

    if (track) {
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }

    dots.forEach(function (dot, i) {
      dot.classList.toggle('slider__dot--active', i === currentSlide);
    });
  }

  var sliderNext = document.getElementById('slider-next');
  var sliderPrev = document.getElementById('slider-prev');

  if (sliderNext) {
    sliderNext.addEventListener('click', function () {
      goToSlide(currentSlide + 1);
      resetAutoplay();
    });
  }

  if (sliderPrev) {
    sliderPrev.addEventListener('click', function () {
      goToSlide(currentSlide - 1);
      resetAutoplay();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(dot.dataset.index, 10));
      resetAutoplay();
    });
  });

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  var sliderEl = document.querySelector('.slider');

  if (sliderEl) {
    sliderEl.addEventListener('mouseenter', function () {
      clearInterval(autoplayTimer);
    });

    sliderEl.addEventListener('mouseleave', function () {
      startAutoplay();
    });

    // Touch / swipe support
    var touchStartX = 0;

    sliderEl.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderEl.addEventListener('touchend', function (e) {
      var delta = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(delta) > 50) {
        goToSlide(delta > 0 ? currentSlide + 1 : currentSlide - 1);
        resetAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  /* ----------------------------------------------------------
     5. HERO "JOIN AS DEVELOPER" BUTTON: pre-select radio
  ---------------------------------------------------------- */
  var heroJoinBtn = document.getElementById('hero-join-btn');

  if (heroJoinBtn) {
    heroJoinBtn.addEventListener('click', function () {
      var devRadio = document.querySelector('input[name="type"][value="developer"]');
      if (devRadio) {
        devRadio.checked = true;
        // Trigger change event so any listeners pick it up
        devRadio.dispatchEvent(new Event('change'));
      }
    });
  }

  /* ----------------------------------------------------------
     6. SMOOTH SCROLL — handled via CSS scroll-behavior: smooth
        but we also handle hash links for better cross-browser
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navbarHeight = navbar ? navbar.offsetHeight : 0;
        var targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        });
      }
    });
  });

  /* ----------------------------------------------------------
     7. ACTIVE NAV LINK: highlight current section in nav
  ---------------------------------------------------------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.navbar__links a');

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('nav--active', isActive);
    });
  }

  // Use scroll position to pick the section closest to the top of viewport
  function onScroll() {
    var scrollY = window.scrollY + 100; // offset for navbar height
    var current = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    setActiveLink(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

})();
