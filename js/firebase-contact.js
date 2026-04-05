/* ============================================================
   GURUDO — js/firebase-contact.js
   Contact form → Cloud Firestore REST API (no SDK required)
   ============================================================

   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project (e.g. "gurudo-landing")
   3. In the left sidebar → Build → Firestore Database
   4. Click "Create database" → Start in production mode → Choose a region
   5. Once created, go to Rules tab and replace with:

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /contacts/{doc} {
            allow create: if request.resource.data.keys()
              .hasAll(['name', 'email', 'type', 'message']);
          }
        }
      }

   6. Go to Project Settings (gear icon) → General tab
   7. Under "Your apps" → click the web icon (</>)
   8. Register app → copy projectId and apiKey below
   ============================================================ */

// Values loaded from config.js (gitignored locally, injected by GitHub Actions in CI)
var _cfg = window.GURUDO_CONFIG || {};
var FIREBASE_PROJECT_ID = _cfg.firebaseProjectId || '';
var FIREBASE_API_KEY    = _cfg.firebaseApiKey    || '';
var MAKE_WEBHOOK_URL    = _cfg.makeWebhookUrl    || '';

var FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/' +
  FIREBASE_PROJECT_ID +
  '/databases/(default)/documents/contacts?key=' +
  FIREBASE_API_KEY;

/* ----------------------------------------------------------
   DOM references
---------------------------------------------------------- */
var form       = document.getElementById('contact-form');
var submitBtn  = document.getElementById('form-submit');
var successEl  = document.getElementById('form-success');
var errorEl    = document.getElementById('form-error');

if (!form) {
  // Guard: if form not found on page, do nothing
  console.warn('[firebase-contact] #contact-form not found');
} else {

  /* ----------------------------------------------------------
     Validation helpers
  ---------------------------------------------------------- */
  function setError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorSpan = document.getElementById(errorId);

    if (errorSpan) {
      errorSpan.textContent = message;
    }
    if (input) {
      if (message) {
        input.classList.add('form__input--error');
      } else {
        input.classList.remove('form__input--error');
      }
    }
  }

  function validateForm(data) {
    var valid = true;

    // Name
    if (!data.name || !data.name.trim()) {
      setError('field-name', 'error-name', 'Name is required');
      valid = false;
    } else {
      setError('field-name', 'error-name', '');
    }

    // Email
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !data.email.trim() || !emailRe.test(data.email)) {
      setError('field-email', 'error-email', 'Valid email is required');
      valid = false;
    } else {
      setError('field-email', 'error-email', '');
    }

    // Message
    if (!data.message || !data.message.trim() || data.message.trim().length < 20) {
      setError('field-message', 'error-message', 'Please write at least 20 characters');
      valid = false;
    } else {
      setError('field-message', 'error-message', '');
    }

    return valid;
  }

  /* ----------------------------------------------------------
     Form submit handler
  ---------------------------------------------------------- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var nameField    = form.querySelector('[name="name"]');
    var emailField   = form.querySelector('[name="email"]');
    var typeField    = form.querySelector('[name="type"]:checked');
    var messageField = form.querySelector('[name="message"]');

    var data = {
      name:      nameField    ? nameField.value    : '',
      email:     emailField   ? emailField.value   : '',
      type:      typeField    ? typeField.value     : 'client',
      message:   messageField ? messageField.value : '',
      timestamp: new Date().toISOString(),
    };

    if (!validateForm(data)) return;

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    successEl.classList.remove('visible');
    errorEl.classList.remove('visible');

    // Firestore REST payload
    var body = {
      fields: {
        name:      { stringValue: data.name },
        email:     { stringValue: data.email },
        type:      { stringValue: data.type },
        message:   { stringValue: data.message },
        timestamp: { stringValue: data.timestamp },
      }
    };

    try {
      var res = await fetch(FIRESTORE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('HTTP ' + res.status + ' — ' + res.statusText);
      }

      // Notify Make.com webhook (fire-and-forget)
      fetch(MAKE_WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).catch(function (err) {
        console.warn('[firebase-contact] Webhook notify failed:', err);
      });

      // Success
      successEl.classList.add('visible');
      form.reset();

      // Scroll success message into view on mobile
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      console.error('[firebase-contact] Submission error:', err);
      errorEl.classList.add('visible');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  /* ----------------------------------------------------------
     Real-time field validation on blur
  ---------------------------------------------------------- */
  ['field-name', 'field-email', 'field-message'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('blur', function () {
      var nameField    = form.querySelector('[name="name"]');
      var emailField   = form.querySelector('[name="email"]');
      var messageField = form.querySelector('[name="message"]');

      var currentData = {
        name:    nameField    ? nameField.value    : '',
        email:   emailField   ? emailField.value   : '',
        message: messageField ? messageField.value : '',
      };

      // Only validate the field that just lost focus
      if (id === 'field-name') {
        if (!currentData.name.trim()) {
          setError('field-name', 'error-name', 'Name is required');
        } else {
          setError('field-name', 'error-name', '');
        }
      }

      if (id === 'field-email') {
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!currentData.email.trim() || !emailRe.test(currentData.email)) {
          setError('field-email', 'error-email', 'Valid email is required');
        } else {
          setError('field-email', 'error-email', '');
        }
      }

      if (id === 'field-message') {
        if (!currentData.message.trim() || currentData.message.trim().length < 20) {
          setError('field-message', 'error-message', 'Please write at least 20 characters');
        } else {
          setError('field-message', 'error-message', '');
        }
      }
    });
  });

}
