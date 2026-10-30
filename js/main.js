/**
 * =====================================================================
 * CODEBRIDGE NPO - MAIN JAVASCRIPT FILE (PART 3)
 * =====================================================================
 * This script handles all interactive behaviours across the website:
 *  1. Interactive Accordions + Expand/Collapse All (about & privacy pages)
 *  2. Gallery Lightbox Modal with keyboard + swipe navigation (programmes page)
 *  3. Leaflet.js Interactive Map, campus markers & live routing (contact page)
 *  4. Dynamic Content: programmes loaded from JSON, then searched, filtered
 *     and sorted (home page)
 *  5. Live (as-you-type) Form Validation with ARIA error messages
 *  6. Contact Form  -> validated, compiled into an email the visitor sends
 *  7. Enquiry Form  -> conditional fields, AJAX (fetch) submission and a
 *                      processed response (cost / availability / intake date)
 *  8. Donation Form -> validation, custom amount, AJAX (fetch) submission
 *  9. Scroll reveal animation + back-to-top button
 *
 * SECURITY NOTE: any text typed by a visitor is passed through
 * escapeHTML() before it is shown on the page, so it cannot inject HTML.
 * =====================================================================
 */


/* ==========================================================
   SHARED DATA & HELPER FUNCTIONS
   ========================================================== */

/* Fallback copy of data/programmes.json. It is only used when the JSON
   file cannot be fetched (for example when index.html is opened straight
   from the folder instead of through a web server). Keep both in sync. */
const PROGRAMME_FALLBACK = [
    {
        id: 'web-dev',
        title: 'Web Development Bootcamp',
        level: 'Beginner',
        levelRank: 1,
        weeks: 8,
        schedule: 'Saturdays, 09:00–13:00',
        scheduleDays: [6],
        centre: 'alexandra',
        centreName: 'Alexandra Centre',
        costPerLearner: 1000,
        seatsLeft: 18,
        keywords: 'html css javascript web development bootcamp beginner websites responsive',
        description: 'A beginner-friendly course covering HTML, CSS, and JavaScript. Learners build responsive websites and interactive features, preparing them for entry-level web developer roles.'
    },
    {
        id: 'java',
        title: 'Java Programming Fundamentals',
        level: 'Intermediate',
        levelRank: 2,
        weeks: 10,
        schedule: 'Tuesdays & Thursdays, 17:00–19:00',
        scheduleDays: [2, 4],
        centre: 'diepsloot',
        centreName: 'Diepsloot Centre',
        costPerLearner: 1500,
        seatsLeft: 12,
        keywords: 'java programming fundamentals object oriented intermediate software problem solving',
        description: 'An intermediate course focusing on Java syntax, object-oriented programming, and problem-solving. Learners gain skills to develop applications and prepare for advanced software development pathways.'
    },
    {
        id: 'digital-literacy',
        title: 'Digital Literacy & Career Skills',
        level: 'Beginner',
        levelRank: 1,
        weeks: 4,
        schedule: 'Saturdays, 10:00–12:00',
        scheduleDays: [6],
        centre: 'alexandra',
        centreName: 'Alexandra Centre',
        costPerLearner: 500,
        seatsLeft: 25,
        keywords: 'digital literacy career skills computer cv online safety email interview basic',
        description: 'A short course focusing on essential computer skills, online safety, and preparing CVs for tech-related job opportunities.'
    }
];

let programmesPromise = null;

/**
 * Loads the programme list ONCE (AJAX with fetch) and shares the result with
 * the home page cards and the enquiry form. Falls back to the built-in copy.
 */
function loadProgrammes() {
    if (!programmesPromise) {
        programmesPromise = fetch('data/programmes.json')
            .then(function (response) {
                if (!response.ok) { throw new Error('HTTP ' + response.status); }
                return response.json();
            })
            .then(function (data) { return data.programmes; })
            .catch(function (error) {
                console.warn('Could not fetch data/programmes.json, using built-in fallback data.', error);
                return PROGRAMME_FALLBACK;
            });
    }
    return programmesPromise;
}

function $(id) { return document.getElementById(id); }

/** Creates an element with an optional class and text (safe: uses textContent). */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
}

/** Escapes user-typed text before it is placed inside innerHTML. */
function escapeHTML(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value).replace(/[&<>"']/g, function (ch) { return map[ch]; });
}

function formatRand(amount) {
    return 'R' + Number(amount).toLocaleString('en-ZA');
}

function formatDate(date) {
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** First matching class day (0 = Sunday ... 6 = Saturday) of NEXT month. */
function getNextIntake(scheduleDays) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    while (scheduleDays.indexOf(date.getDay()) === -1) { date.setDate(date.getDate() + 1); }
    return date;
}

/** The next occurrence (after today) of a weekday number. */
function getNextWeekday(dayNumber) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    while (date.getDay() !== dayNumber) { date.setDate(date.getDate() + 1); }
    return date;
}


/* ==========================================================
   FORM VALIDATION ENGINE (live validation + accessibility)
   ========================================================== */

function showError(input, errorElement, message) {
    input.classList.remove('input-valid');
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    if (errorElement) {
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;
        errorElement.classList.add('visible');
        input.setAttribute('aria-describedby', errorElement.id);
    }
}

function clearError(input, errorElement) {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    }
}

/** Each validator returns an error message, or '' when the value is fine. */
const Validators = {

    fullName: function (value) {
        const v = value.trim();
        if (!v) { return 'Error: Full name is required.'; }
        if (v.length < 2) { return 'Error: Name is too short. Please enter at least 2 characters.'; }
        if (!/^[\p{L}][\p{L}' .-]*$/u.test(v)) { return 'Error: Names can only contain letters, spaces, apostrophes, hyphens and full stops.'; }
        return '';
    },

    /** Granular email validator with specific guidance messages. */
    email: function (value) {
        const v = value.trim();
        if (!v) { return 'Error: Email address is required so we can reach you.'; }
        if (!v.includes('@')) { return 'Error: Your email address is missing the "@" symbol (e.g., yourname@example.com). Please check it.'; }
        if (!v.split('@')[1] || !v.split('@')[1].includes('.')) { return 'Error: Your email address is missing a valid domain extension (e.g., .co.za or .com).'; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return 'Error: This email format appears invalid. Please make sure there are no typos or stray spaces.'; }
        return '';
    },

    /** South African numbers: 10 digits starting with 0 (mobile or landline), or +27 followed by 9 digits. */
    phone: function (value) {
        const v = value.trim();
        if (!v) { return 'Error: Contact number is required in case we need to reach you.'; }
        if (/[^\d\s+-]/.test(v)) { return 'Error: Phone numbers may only contain digits, spaces, hyphens and a leading +.'; }
        const clean = v.replace(/[\s-]/g, '');
        if (clean.startsWith('+27')) {
            if (clean.length > 12) { return 'Error: International number is too long. Use +27 followed by 9 digits (e.g., +27821234567).'; }
            if (clean.length < 12) { return 'Error: International number is too short. Use +27 followed by 9 digits (e.g., +27821234567).'; }
        } else {
            if (clean.length > 10) { return 'Error: Phone number is greater than 10 digits! South African numbers must be exactly 10 digits (e.g., 0821234567). Please shorten or correct it.'; }
            if (clean.length < 10) { return 'Error: Phone number is too short. South African numbers must be exactly 10 digits (e.g., 0821234567).'; }
            if (!clean.startsWith('0')) { return 'Error: South African numbers start with 0 (or +27).'; }
        }
        if (!/^(\+27|0)[1-8][0-9]{8}$/.test(clean)) { return 'Error: Please enter a valid South African number, e.g. 0821234567 (mobile) or 0111234567 (landline).'; }
        return '';
    },

    select: function (message) {
        return function (value) { return value ? '' : message; };
    },

    text: function (label, min, max) {
        return function (value) {
            const v = value.trim();
            if (!v) { return 'Error: ' + label + ' cannot be blank.'; }
            if (v.length < min) { return 'Error: ' + label + ' is a bit too short. Please enter at least ' + min + ' characters.'; }
            if (max && v.length > max) { return 'Error: ' + label + ' is too long. Please keep it under ' + max + ' characters.'; }
            return '';
        };
    },

    optionalText: function (label, min) {
        return function (value) {
            const v = value.trim();
            if (v && v.length < min) { return 'Error: ' + label + ' is a bit too short. Please enter at least ' + min + ' characters or leave it blank.'; }
            return '';
        };
    },

    wholeNumber: function (label, min, max) {
        return function (value) {
            const v = value.trim();
            if (!v) { return 'Error: ' + label + ' is required.'; }
            const n = Number(v);
            if (!Number.isInteger(n)) { return 'Error: ' + label + ' must be a whole number.'; }
            if (n < min || n > max) { return 'Error: ' + label + ' must be between ' + min + ' and ' + max + '.'; }
            return '';
        };
    }
};

/**
 * Connects an input to a validator. The field validates when the user leaves
 * it (blur / change) and then re-validates on every keystroke, so the error
 * message appears and disappears immediately.
 */
function bindField(inputId, errorId, validator) {
    const input = $(inputId);
    if (!input) { return null; }
    const errorElement = $(errorId);

    const field = {
        input: input,
        validate: function () {
            const message = validator(input.value);
            if (message) {
                showError(input, errorElement, message);
                return false;
            }
            clearError(input, errorElement);
            if (input.value.trim()) { input.classList.add('input-valid'); } else { input.classList.remove('input-valid'); }
            return true;
        }
    };

    input.addEventListener('blur', function () { input.dataset.touched = 'true'; field.validate(); });
    input.addEventListener('change', function () { if (input.tagName === 'SELECT') { input.dataset.touched = 'true'; field.validate(); } });
    input.addEventListener('input', function () { if (input.dataset.touched === 'true') { field.validate(); } });
    return field;
}

/** Runs every validator (no short-circuit) and focuses the first invalid field. */
function validateAll(fields) {
    let firstInvalid = null;
    fields.filter(Boolean).forEach(function (field) {
        if (field.input.matches(':disabled')) { return; }
        if (!field.validate() && !firstInvalid) { firstInvalid = field.input; }
    });
    if (firstInvalid) { firstInvalid.focus(); }
    return !firstInvalid;
}

function showResponse(div, type, html) {
    if (!div) { return; }
    div.className = 'form-response ' + type;
    div.setAttribute('role', type === 'error' ? 'alert' : 'status');
    div.innerHTML = html;
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setBusy(button, busy, busyLabel) {
    if (!button) { return; }
    if (busy) {
        button.dataset.label = button.textContent;
        button.textContent = busyLabel;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.label || button.textContent;
        button.disabled = false;
    }
}

/**
 * AJAX submission: sends the form data as JSON to the URL stored in the
 * form's own action attribute, without reloading the page.
 */
function submitAsync(form, payload) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 10000);
    return fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
    }).then(function (response) {
        clearTimeout(timer);
        if (!response.ok) { throw new Error('Server responded with status ' + response.status); }
        return response.json().catch(function () { return {}; });
    }).catch(function (error) {
        clearTimeout(timer);
        throw error;
    });
}

function resetFormState(form) {
    form.reset();
    form.querySelectorAll('.input-valid').forEach(function (i) { i.classList.remove('input-valid'); });
    form.querySelectorAll('[data-touched]').forEach(function (i) { delete i.dataset.touched; });
}


document.addEventListener('DOMContentLoaded', function () {

    initRevealAnimations();
    initAccordions();
    initGalleryLightbox();
    initMap();
    initProgrammes();
    initContactForm();
    initEnquiryForm();
    initDonationForm();
    initBackToTop();


    /* ==========================================================
       1. INTERACTIVE ACCORDIONS (about.html & privacy.html)
       ========================================================== */
    function initAccordions() {
        const accordions = document.querySelectorAll('.accordion');
        if (accordions.length === 0) { return; }

        accordions.forEach(function (accordion, accordionIndex) {
            const items = accordion.querySelectorAll('.accordion-item');

            function setState(item, expand) {
                const header = item.querySelector('.accordion-header');
                const content = item.querySelector('.accordion-content');
                header.setAttribute('aria-expanded', String(expand));
                item.classList.toggle('active', expand);
                content.style.maxHeight = expand ? content.scrollHeight + 'px' : null;
            }

            items.forEach(function (item, index) {
                const header = item.querySelector('.accordion-header');
                const content = item.querySelector('.accordion-content');
                const baseId = 'acc-' + accordionIndex + '-' + index;

                // ARIA wiring so screen readers announce the relationship
                header.id = header.id || baseId + '-header';
                content.id = content.id || baseId + '-panel';
                header.setAttribute('aria-controls', content.id);
                header.setAttribute('aria-expanded', 'false');
                content.setAttribute('role', 'region');
                content.setAttribute('aria-labelledby', header.id);

                header.addEventListener('click', function () {
                    setState(item, header.getAttribute('aria-expanded') !== 'true');
                });
            });

            // Expand all / Collapse all toolbar (dynamic DOM insertion)
            const toolbar = el('div', 'accordion-toolbar');
            const expandBtn = el('button', 'accordion-toolbar-btn', 'Expand all');
            const collapseBtn = el('button', 'accordion-toolbar-btn', 'Collapse all');
            expandBtn.type = 'button';
            collapseBtn.type = 'button';
            expandBtn.addEventListener('click', function () { items.forEach(function (i) { setState(i, true); }); });
            collapseBtn.addEventListener('click', function () { items.forEach(function (i) { setState(i, false); }); });
            toolbar.appendChild(expandBtn);
            toolbar.appendChild(collapseBtn);
            accordion.parentNode.insertBefore(toolbar, accordion);

            // Keep open panels the right height when the window is resized
            window.addEventListener('resize', function () {
                items.forEach(function (item) {
                    if (item.classList.contains('active')) {
                        const content = item.querySelector('.accordion-content');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });
        });
    }


    /* ==========================================================
       2. GALLERY LIGHTBOX MODAL (programmes.html gallery)
       ========================================================== */
    function initGalleryLightbox() {
        const thumbs = Array.from(document.querySelectorAll('.gallery .gallery-thumb'));
        if (thumbs.length === 0) { return; }

        // Build the modal once and add it to the page
        const overlay = el('div', 'lightbox');
        overlay.id = 'image-lightbox';
        overlay.hidden = true;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Enlarged gallery image');

        const closeBtn = el('button', 'lightbox-btn lightbox-close', '×');
        const prevBtn = el('button', 'lightbox-btn lightbox-prev', '‹');
        const nextBtn = el('button', 'lightbox-btn lightbox-next', '›');
        closeBtn.type = prevBtn.type = nextBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close enlarged image');
        prevBtn.setAttribute('aria-label', 'Previous image');
        nextBtn.setAttribute('aria-label', 'Next image');

        const figure = el('figure', 'lightbox-figure');
        const image = el('img', 'lightbox-image');
        const caption = el('figcaption', 'lightbox-caption');
        const counter = el('p', 'lightbox-counter');
        counter.setAttribute('aria-live', 'polite');
        figure.appendChild(image);
        figure.appendChild(caption);
        figure.appendChild(counter);

        overlay.appendChild(closeBtn);
        overlay.appendChild(prevBtn);
        overlay.appendChild(figure);
        overlay.appendChild(nextBtn);
        document.body.appendChild(overlay);

        let current = 0;
        let lastFocused = null;

        function show(index) {
            current = (index + thumbs.length) % thumbs.length;
            const thumbImg = thumbs[current].querySelector('img');
            const figcaption = thumbs[current].parentElement.querySelector('figcaption');
            image.src = thumbImg.dataset.full || thumbImg.currentSrc || thumbImg.src;
            image.alt = thumbImg.alt;
            caption.textContent = figcaption ? figcaption.textContent.trim() : thumbImg.alt;
            counter.textContent = 'Image ' + (current + 1) + ' of ' + thumbs.length;
        }

        function open(index) {
            lastFocused = document.activeElement;
            show(index);
            overlay.hidden = false;
            document.body.classList.add('lightbox-open');
            requestAnimationFrame(function () { overlay.classList.add('open'); });
            closeBtn.focus();
        }

        function close() {
            overlay.classList.remove('open');
            overlay.hidden = true;
            document.body.classList.remove('lightbox-open');
            if (lastFocused) { lastFocused.focus(); }
        }

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () { open(index); });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function () { show(current - 1); });
        nextBtn.addEventListener('click', function () { show(current + 1); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); } });

        // Keyboard: Esc closes, arrows navigate, Tab stays inside the modal
        document.addEventListener('keydown', function (e) {
            if (overlay.hidden) { return; }
            if (e.key === 'Escape') { close(); }
            if (e.key === 'ArrowLeft') { show(current - 1); }
            if (e.key === 'ArrowRight') { show(current + 1); }
            if (e.key === 'Tab') {
                const focusable = [closeBtn, prevBtn, nextBtn];
                const index = focusable.indexOf(document.activeElement);
                e.preventDefault();
                const next = e.shiftKey ? (index <= 0 ? focusable.length - 1 : index - 1) : (index + 1) % focusable.length;
                focusable[next].focus();
            }
        });

        // Touch: swipe left / right to change image on phones
        let touchStartX = 0;
        overlay.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
        overlay.addEventListener('touchend', function (e) {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) { show(diff < 0 ? current + 1 : current - 1); }
        }, { passive: true });
    }


    /* ==========================================================
       3. LEAFLET.JS INTERACTIVE MAP & LIVE ROUTING (contact.html)
       ========================================================== */
    function initMap() {
        const mapElement = $('map');
        if (!mapElement) { return; }

        const statusElement = $('map-status');
        function setStatus(message) { if (statusElement) { statusElement.textContent = message; } }

        if (typeof L === 'undefined') {
            setStatus('The interactive map could not load. Please check your internet connection and refresh the page.');
            return;
        }

        const parkStation = L.latLng(-26.1952, 28.0436);
        const campuses = {
            alexandra: { latLng: L.latLng(-26.1042, 28.1005), name: 'Alexandra Centre', address: '14 Roosevelt Street, Alexandra, Johannesburg, 2090' },
            diepsloot: { latLng: L.latLng(-25.9350, 28.0150), name: 'Diepsloot Centre', address: 'Extension 1, Diepsloot, Johannesburg, 2189' }
        };

        const map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Both campus markers are always drawn, even if routing fails
        const markers = {};
        Object.keys(campuses).forEach(function (key) {
            const campus = campuses[key];
            markers[key] = L.marker(campus.latLng, { title: campus.name })
                .addTo(map)
                .bindPopup('<b>CodeBridge ' + campus.name + '</b><br>' + campus.address);
        });
        map.fitBounds(L.latLngBounds([campuses.alexandra.latLng, campuses.diepsloot.latLng]), { padding: [40, 40] });

        let userLatLng = null;
        let routingControl = null;
        let currentKey = 'alexandra';

        function updateRoute() {
            if (!userLatLng) { return; }
            if (typeof L.Routing === 'undefined') {
                setStatus('The routing library could not load, so only the campus markers are shown.');
                return;
            }
            if (routingControl) { map.removeControl(routingControl); }

            const campus = campuses[currentKey];
            routingControl = L.Routing.control({
                waypoints: [userLatLng, campus.latLng],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                collapsible: true,
                lineOptions: { styles: [{ color: '#0066cc', weight: 6, opacity: 0.8 }] },
                createMarker: function () { return null; }
            }).on('routesfound', function (e) {
                const summary = e.routes[0].summary;
                setStatus('Route to ' + campus.name + ': ' + (summary.totalDistance / 1000).toFixed(1) + ' km, about ' + Math.round(summary.totalTime / 60) + ' minutes by car.');
            }).on('routingerror', function () {
                setStatus('A route could not be calculated right now (the free routing service may be busy). The campus markers are still shown.');
            }).addTo(map);
        }

        function setStart(latLng, popupText, statusText) {
            userLatLng = latLng;
            L.marker(latLng, { title: 'Your starting point' }).addTo(map).bindPopup('<b>' + popupText + '</b>').openPopup();
            setStatus(statusText);
            updateRoute();
        }

        // Ask the browser for the visitor's live location
        setStatus('Finding your location to calculate directions...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setStart(L.latLng(position.coords.latitude, position.coords.longitude), 'Your live location', 'Location found. Calculating route...');
            }, function () {
                setStart(parkStation, 'Johannesburg Central (Park Station)', 'Location sharing is off, so directions start from Johannesburg Central (Park Station).');
            }, { timeout: 10000 });
        } else {
            setStart(parkStation, 'Johannesburg Central (Park Station)', 'Your browser does not support location, so directions start from Johannesburg Central (Park Station).');
        }

        // Campus toggle buttons
        const buttons = { alexandra: $('btn-alexandra'), diepsloot: $('btn-diepsloot') };
        Object.keys(buttons).forEach(function (key) {
            if (!buttons[key]) { return; }
            buttons[key].addEventListener('click', function () {
                currentKey = key;
                Object.keys(buttons).forEach(function (k) {
                    buttons[k].classList.toggle('active', k === key);
                    buttons[k].setAttribute('aria-pressed', String(k === key));
                });
                if (userLatLng) {
                    updateRoute();
                } else {
                    map.flyTo(campuses[key].latLng, 14);
                    setStatus('Still finding your location. Showing ' + campuses[key].name + ' for now.');
                }
                markers[key].openPopup();
            });
        });
    }


    /* ==========================================================
       4. DYNAMIC CONTENT: LOAD, SEARCH, FILTER & SORT (index.html)
       ========================================================== */
    function initProgrammes() {
        const container = $('programme-cards-container');
        if (!container) { return; }

        const searchInput = $('programme-search');
        const levelSelect = $('programme-level');
        const sortSelect = $('programme-sort');
        const countElement = $('programme-count');
        const noResults = $('programme-no-results');
        const resetButton = $('programme-reset');
        let allProgrammes = [];

        function buildCard(programme) {
            const card = el('article', 'programme-card');
            card.dataset.id = programme.id;
            card.innerHTML =
                '<h3>' + escapeHTML(programme.title) + '</h3>' +
                '<p class="programme-meta"><span class="badge badge-' + escapeHTML(programme.level.toLowerCase()) + '">' + escapeHTML(programme.level) + '</span> ' +
                '<span>' + programme.weeks + ' weeks</span> <span>' + escapeHTML(programme.centreName) + '</span></p>' +
                '<p>' + escapeHTML(programme.description) + '</p>' +
                '<p class="programme-links"><a href="programmes.html#' + escapeHTML(programme.id) + '">View full curriculum</a> ' +
                '<a class="cta-button-small" href="enquiry.html?type=learner&amp;programme=' + escapeHTML(programme.id) + '">Apply for this programme</a></p>';
            return card;
        }

        function sortProgrammes(list, mode) {
            const sorted = list.slice();
            const comparators = {
                'title-asc': function (a, b) { return a.title.localeCompare(b.title); },
                'title-desc': function (a, b) { return b.title.localeCompare(a.title); },
                'duration-asc': function (a, b) { return a.weeks - b.weeks; },
                'duration-desc': function (a, b) { return b.weeks - a.weeks; },
                'level-asc': function (a, b) { return a.levelRank - b.levelRank || a.title.localeCompare(b.title); }
            };
            return sorted.sort(comparators[mode] || comparators['title-asc']);
        }

        function render() {
            const tokens = searchInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
            const level = levelSelect.value;

            const matches = allProgrammes.filter(function (p) {
                const haystack = (p.title + ' ' + p.description + ' ' + p.keywords + ' ' + p.level + ' ' + p.centreName).toLowerCase();
                const matchesSearch = tokens.every(function (token) { return haystack.includes(token); });
                const matchesLevel = level === 'all' || p.level === level;
                return matchesSearch && matchesLevel;
            });

            const sorted = sortProgrammes(matches, sortSelect.value);
            container.replaceChildren.apply(container, sorted.map(buildCard));
            countElement.textContent = 'Showing ' + sorted.length + ' of ' + allProgrammes.length + ' programmes';
            noResults.hidden = sorted.length > 0;
        }

        loadProgrammes().then(function (list) {
            allProgrammes = list;
            container.setAttribute('aria-busy', 'false');
            render();
        });

        searchInput.addEventListener('input', render);
        levelSelect.addEventListener('change', render);
        sortSelect.addEventListener('change', render);
        resetButton.addEventListener('click', function () {
            searchInput.value = '';
            levelSelect.value = 'all';
            sortSelect.value = 'title-asc';
            render();
            searchInput.focus();
        });
    }


    /* ==========================================================
       6. CONTACT FORM: VALIDATE, THEN COMPILE AN EMAIL (contact.html)
       ========================================================== */
    function initContactForm() {
        const form = $('contact-form');
        if (!form) { return; }

        const responseDiv = $('contact-form-response');
        const messageBox = $('message');
        const counter = $('message-counter');

        const fields = [
            bindField('name', 'name-error', Validators.fullName),
            bindField('email', 'email-error', Validators.email),
            bindField('phone', 'phone-error', Validators.phone),
            bindField('message-type', 'type-error', Validators.select('Error: Please select what your message is about from the dropdown list.')),
            bindField('subject', 'subject-error', Validators.text('Subject line', 5, 100)),
            bindField('message', 'message-error', Validators.text('Message', 10, 1000))
        ];

        // Live character counter
        function updateCounter() {
            if (counter) { counter.textContent = messageBox.value.length + ' / ' + messageBox.maxLength + ' characters'; }
        }
        messageBox.addEventListener('input', updateCounter);
        updateCounter();

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateAll(fields)) {
                showResponse(responseDiv, 'error', '<strong>Please fix the highlighted fields:</strong> each one has a message explaining what to change.');
                return;
            }

            // The recipient comes from the form's action attribute (mailto:...)
            const recipient = form.getAttribute('action').replace(/^mailto:/i, '');
            const subjectLine = '[' + $('message-type').value + '] ' + $('subject').value.trim();
            const bodyText = [
                'Name: ' + $('name').value.trim(),
                'Email: ' + $('email').value.trim(),
                'Phone: ' + $('phone').value.trim(),
                'Message type: ' + $('message-type').value,
                '',
                'Message:',
                messageBox.value.trim()
            ].join('\n');

            const mailtoLink = 'mailto:' + recipient +
                '?subject=' + encodeURIComponent(subjectLine) +
                '&body=' + encodeURIComponent(bodyText.replace(/\n/g, '\r\n'));

            const preview = 'To: ' + recipient + '\nSubject: ' + subjectLine + '\n\n' + bodyText;

            showResponse(responseDiv, 'success',
                '<strong>Your email is ready.</strong> Check the preview, then press the button to open it in your email app and send it to ' + escapeHTML(recipient) + '.' +
                '<pre class="email-preview">' + escapeHTML(preview) + '</pre>' +
                '<p class="response-actions"><a class="cta-button-small" id="open-email-link" href="' + escapeHTML(mailtoLink) + '">Open in my email app</a> ' +
                '<button type="button" class="accordion-toolbar-btn" id="copy-email-btn">Copy email text</button></p>' +
                '<p class="response-note" id="copy-status" aria-live="polite"></p>');

            $('copy-email-btn').addEventListener('click', function () {
                const status = $('copy-status');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(preview).then(function () {
                        status.textContent = 'Email text copied to your clipboard.';
                    }, function () {
                        status.textContent = 'Copying was blocked by the browser. Please select the text and copy it manually.';
                    });
                } else {
                    status.textContent = 'Copying is not supported in this browser. Please select the text and copy it manually.';
                }
            });
        });
    }


    /* ==========================================================
       7. ENQUIRY FORM: CONDITIONAL FIELDS, AJAX & PROCESSED RESPONSE (enquiry.html)
       ========================================================== */
    function initEnquiryForm() {
        const form = $('enquiry-form');
        if (!form) { return; }

        const typeSelect = $('enquiry-type');
        const responseDiv = $('enquiry-form-response');
        const submitButton = $('enquiry-submit-btn');
        const sections = { learner: $('learner-fields'), volunteer: $('volunteer-fields'), sponsor: $('sponsor-fields') };
        let programmes = [];

        // Show only the fieldset that belongs to the chosen enquiry type
        function toggleSections() {
            Object.keys(sections).forEach(function (key) {
                const active = typeSelect.value === key;
                sections[key].hidden = !active;
                sections[key].disabled = !active;
            });
        }

        const coreFields = [
            bindField('enquiry-type', 'type-error', Validators.select('Error: Please select whether you are applying as a learner, volunteer, or sponsor.')),
            bindField('full-name', 'name-error', Validators.fullName),
            bindField('contact-number', 'phone-error', Validators.phone),
            bindField('email', 'email-error', Validators.email)
        ];

        const typeFields = {
            learner: [
                bindField('centre', 'centre-error', Validators.select('Error: Please choose the centre you would like to attend.')),
                bindField('programme', 'programme-error', Validators.select('Error: Please choose the programme you are interested in.')),
                bindField('motivation', 'motivation-error', Validators.optionalText('Your motivation', 10))
            ],
            volunteer: [
                bindField('volunteer-expertise', 'expertise-error', Validators.select('Error: Please choose the area you would like to mentor in.')),
                bindField('volunteer-availability', 'availability-error', Validators.select('Error: Please tell us when you are available.')),
                bindField('volunteer-hours', 'hours-error', Validators.wholeNumber('Hours per month', 2, 40))
            ],
            sponsor: [
                bindField('sponsor-programme', 'sponsor-programme-error', Validators.select('Error: Please choose the programme you would like to sponsor.')),
                bindField('sponsor-learners', 'learners-error', Validators.wholeNumber('Number of learners', 1, 100)),
                bindField('sponsor-organisation', 'organisation-error', Validators.optionalText('Organisation name', 2))
            ]
        };

        function findProgramme(id) {
            return programmes.find(function (p) { return p.id === id; });
        }

        // Live cost estimate for sponsors
        function updateSponsorEstimate() {
            const output = $('sponsor-estimate');
            const programme = findProgramme($('sponsor-programme').value);
            const learners = Number($('sponsor-learners').value);
            if (programme && Number.isInteger(learners) && learners >= 1 && learners <= 100) {
                output.textContent = 'Estimated sponsorship: ' + learners + ' × ' + formatRand(programme.costPerLearner) + ' = ' + formatRand(learners * programme.costPerLearner);
            } else {
                output.textContent = '';
            }
        }
        $('sponsor-programme').addEventListener('change', updateSponsorEstimate);
        $('sponsor-learners').addEventListener('input', updateSponsorEstimate);

        // Picking a programme pre-selects the centre that presents it
        $('programme').addEventListener('change', function () {
            const programme = findProgramme(this.value);
            if (programme && !$('centre').value) { $('centre').value = programme.centre; }
        });

        typeSelect.addEventListener('change', toggleSections);
        toggleSections();

        // Pre-fill from links such as enquiry.html?type=learner&programme=java
        loadProgrammes().then(function (list) {
            programmes = list;
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type');
            const programmeId = params.get('programme');
            if (sections[type]) {
                typeSelect.value = type;
                toggleSections();
            }
            if (programmeId && findProgramme(programmeId)) {
                if (typeSelect.value === 'learner') { $('programme').value = programmeId; $('centre').value = findProgramme(programmeId).centre; }
                if (typeSelect.value === 'sponsor') { $('sponsor-programme').value = programmeId; updateSponsorEstimate(); }
            }
        });

        function collectData() {
            const type = typeSelect.value;
            const data = {
                enquiryType: type,
                fullName: $('full-name').value.trim(),
                phone: $('contact-number').value.trim(),
                email: $('email').value.trim()
            };
            if (type === 'learner') {
                data.centre = $('centre').value;
                data.programme = $('programme').value;
                data.motivation = $('motivation').value.trim();
            } else if (type === 'volunteer') {
                data.expertise = $('volunteer-expertise').value;
                data.availability = $('volunteer-availability').value;
                data.hoursPerMonth = Number($('volunteer-hours').value);
            } else if (type === 'sponsor') {
                data.programme = $('sponsor-programme').value;
                data.learners = Number($('sponsor-learners').value);
                data.organisation = $('sponsor-organisation').value.trim();
            }
            return data;
        }

        /* ---- Response builders: process the input into cost / availability info ---- */

        function learnerResponse(d) {
            const p = findProgramme(d.programme);
            const intake = formatDate(getNextIntake(p.scheduleDays));
            let html = '<strong>Application received, ' + escapeHTML(d.fullName.split(' ')[0]) + '!</strong>' +
                '<p>Here is what we have for <em>' + escapeHTML(p.title) + '</em>:</p>' +
                '<ul>' +
                '<li><strong>Cost:</strong> Free for qualifying youth (programme value ' + formatRand(p.costPerLearner) + ', funded by sponsors and donors)</li>' +
                '<li><strong>Duration:</strong> ' + p.weeks + ' weeks</li>' +
                '<li><strong>Schedule:</strong> ' + escapeHTML(p.schedule) + ' at the ' + escapeHTML(p.centreName) + '</li>' +
                '<li><strong>Next intake starts:</strong> ' + escapeHTML(intake) + '</li>' +
                '<li><strong>Availability:</strong> ' + p.seatsLeft + ' seats left in this intake</li>' +
                '</ul>';
            if (d.centre !== p.centre) {
                html += '<p class="response-note">Note: this programme is presented at the ' + escapeHTML(p.centreName) + ', so we have placed your application there instead of the centre you picked.</p>';
            }
            html += '<p>Our admissions team will contact you on ' + escapeHTML(d.phone) + ' or ' + escapeHTML(d.email) + ' within 48 hours.</p>';
            return html;
        }

        function volunteerResponse(d) {
            const p = findProgramme(d.expertise);
            const orientation = formatDate(getNextWeekday(6));
            const dayFits = {
                saturday: function (x) { return x.scheduleDays.indexOf(6) !== -1; },
                weekday: function (x) { return x.scheduleDays.indexOf(2) !== -1 || x.scheduleDays.indexOf(4) !== -1; },
                both: function () { return true; }
            };
            const fits = dayFits[d.availability](p);
            let html = '<strong>Thank you for volunteering, ' + escapeHTML(d.fullName.split(' ')[0]) + '!</strong>' +
                '<ul>' +
                '<li><strong>Your mentoring area:</strong> ' + escapeHTML(p.title) + ' (' + escapeHTML(p.schedule) + ', ' + escapeHTML(p.centreName) + ')</li>' +
                '<li><strong>Your commitment:</strong> ' + d.hoursPerMonth + ' hours a month, about ' + (d.hoursPerMonth * 12) + ' hours a year</li>' +
                '<li><strong>Next mentor orientation:</strong> ' + escapeHTML(orientation) + ' at 09:00</li>' +
                '</ul>';
            if (fits) {
                html += '<p>Your availability matches this programme\'s class times, so we can place you straight after orientation.</p>';
            } else {
                const alternatives = programmes.filter(dayFits[d.availability]).map(function (x) { return escapeHTML(x.title) + ' (' + escapeHTML(x.schedule) + ')'; });
                html += '<p class="response-note">This programme runs ' + escapeHTML(p.schedule) + ', which is outside your stated availability. Programmes that fit your availability: ' + alternatives.join('; ') + '.</p>';
            }
            html += '<p>We will email your mentor training pack to ' + escapeHTML(d.email) + ' shortly.</p>';
            return html;
        }

        function sponsorResponse(d) {
            const p = findProgramme(d.programme);
            const total = d.learners * p.costPerLearner;
            const who = d.organisation ? ' on behalf of ' + escapeHTML(d.organisation) : '';
            return '<strong>Sponsorship enquiry received, ' + escapeHTML(d.fullName.split(' ')[0]) + '!</strong>' +
                '<p>Thank you for supporting CodeBridge' + who + '. Here is your estimate:</p>' +
                '<ul>' +
                '<li><strong>Programme:</strong> ' + escapeHTML(p.title) + ' (' + p.weeks + ' weeks)</li>' +
                '<li><strong>Learners sponsored:</strong> ' + d.learners + '</li>' +
                '<li><strong>Cost per learner:</strong> ' + formatRand(p.costPerLearner) + '</li>' +
                '<li><strong>Total sponsorship:</strong> ' + formatRand(total) + '</li>' +
                '</ul>' +
                '<p>Our partnership director will email the impact prospectus to ' + escapeHTML(d.email) + ' within 2 working days.</p>';
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const type = typeSelect.value;
            const active = coreFields.concat(typeFields[type] || []);
            if (!validateAll(active)) {
                showResponse(responseDiv, 'error', '<strong>Please review:</strong> some fields need your attention. Each one has guidance underneath it.');
                return;
            }

            const data = collectData();
            setBusy(submitButton, true, 'Sending...');

            Promise.all([loadProgrammes(), submitAsync(form, data)]).then(function (results) {
                programmes = results[0];
                const builders = { learner: learnerResponse, volunteer: volunteerResponse, sponsor: sponsorResponse };
                showResponse(responseDiv, 'success', builders[data.enquiryType](data));
                resetFormState(form);
                toggleSections();
                updateSponsorEstimate();
            }).catch(function (error) {
                console.error('Enquiry submission failed:', error);
                showResponse(responseDiv, 'error', '<strong>We could not send your enquiry.</strong> Please check your internet connection and try again.');
            }).then(function () {
                setBusy(submitButton, false);
            });
        });
    }


        /* ==========================================================
       8. DONATION FORM: VALIDATION & AJAX (donate.html)
       ========================================================== */
    function initDonationForm() {
        const form = $('donation-form');
        if (!form) { return; }

        const responseDiv = $('donation-form-response');
        const submitButton = $('donation-submit-btn');
        const radios = form.querySelectorAll('input[name="amount"]');
        const otherRadio = $('amount-other');
        const otherInput = $('other-amount');
        const amountError = $('amount-error');

        const nameField = bindField('donor-name', 'name-error', Validators.fullName);
        const emailField = bindField('donor-email', 'email-error', Validators.email);

        /**
         * Impact tiers. These MUST match the "How Your Donation Helps" table
         * on donate.html:
         *   R100   = course materials for one learner for a week
         *   R250   = laptop access for one learner for a month
         *   R500   = one learner's full Digital Literacy & Career Skills programme
         *   R1000+ = a full seat on the Web Development Bootcamp
         */
        function describeImpact(amount) {
            function plural(n, singular, pluralForm) { return n + ' ' + (n === 1 ? singular : pluralForm); }

            if (amount >= 1000) {
                const seats = Math.floor(amount / 1000);
                return 'helps fund ' + plural(seats, 'full seat', 'full seats') + ' on the Web Development Bootcamp (R1 000 per seat)';
            }
            if (amount >= 500) {
                const learners = Math.floor(amount / 500);
                return 'sponsors ' + plural(learners, 'learner', 'learners') + ' through the full Digital Literacy &amp; Career Skills programme';
            }
            if (amount >= 250) {
                const months = Math.floor(amount / 250);
                return 'covers laptop access for one learner for ' + plural(months, 'month', 'months');
            }
            if (amount >= 100) {
                const weeks = Math.floor(amount / 100);
                return 'covers course materials for one learner for ' + plural(weeks, 'week', 'weeks');
            }
            return 'goes towards course materials and laptop access for our learners';
        }

        /** Returns { amount } when valid, or { error } with a helpful message. */
        function readAmount() {
            const checked = form.querySelector('input[name="amount"]:checked');
            if (!checked) { return { error: 'Error: Please select one of the donation amounts or enter a custom amount.' }; }
            if (checked.value !== 'other') { return { amount: Number(checked.value) }; }

            const raw = otherInput.value.trim();
            if (!raw) { return { error: 'Error: Please type your custom amount in rand (minimum R10).' }; }
            const n = Number(raw);
            if (!Number.isFinite(n)) { return { error: 'Error: The custom amount must be a number.' }; }
            if (!Number.isInteger(n)) { return { error: 'Error: Please enter a whole number of rand (no cents).' }; }
            if (n < 10) { return { error: 'Error: The minimum custom donation is R10.' }; }
            if (n > 100000) { return { error: 'Error: For donations above R100 000 please contact us directly.' }; }
            return { amount: n };
        }

        function checkAmount() {
            const result = readAmount();
            if (result.error) { showError(otherInput, amountError, result.error); return false; }
            clearError(otherInput, amountError);
            return true;
        }

        // Typing a custom amount automatically selects the "Other amount" radio
        otherInput.addEventListener('input', function () {
            otherRadio.checked = true;
            checkAmount();
        });
        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (radio !== otherRadio) { otherInput.value = ''; }
                checkAmount();
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const amountOk = checkAmount();
            const detailsOk = validateAll([nameField, emailField]);
            if (!amountOk || !detailsOk) {
                if (!amountOk) { otherInput.focus(); }
                showResponse(responseDiv, 'error', '<strong>Form incomplete:</strong> please choose a valid amount and check your contact details.');
                return;
            }

            const amount = readAmount().amount;
            const donorName = $('donor-name').value.trim();
            const donorEmail = $('donor-email').value.trim();
            setBusy(submitButton, true, 'Sending...');

            submitAsync(form, { donorName: donorName, donorEmail: donorEmail, amount: amount }).then(function () {
                showResponse(responseDiv, 'success',
                    '<strong>Thank you, ' + escapeHTML(donorName.split(' ')[0]) + '!</strong>' +
                    '<p>Your pledge of ' + formatRand(amount) + ' ' + describeImpact(amount) + '.</p>' +
                    '<p>A donor acknowledgement will be sent to ' + escapeHTML(donorEmail) + '.</p>' +
                    '<p class="response-note">Demonstration site: CodeBridge is fictional, so no money is taken and no payment gateway is connected.</p>');
                resetFormState(form);
            }).catch(function (error) {
                console.error('Donation submission failed:', error);
                showResponse(responseDiv, 'error', '<strong>We could not send your pledge.</strong> Please check your internet connection and try again.');
            }).then(function () {
                setBusy(submitButton, false);
            });
        });
    }

    /* ==========================================================
       9. SCROLL REVEAL ANIMATION & BACK-TO-TOP BUTTON
       ========================================================== */
    function initRevealAnimations() {
        if (!('IntersectionObserver' in window)) { return; }
        const targets = document.querySelectorAll('main > section, main > article');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        targets.forEach(function (target) {
            target.classList.add('reveal');
            observer.observe(target);
        });
    }

    function initBackToTop() {
        const button = el('button', 'back-to-top', '↑');
        button.type = 'button';
        button.hidden = true;
        button.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(button);

        window.addEventListener('scroll', function () { button.hidden = window.scrollY < 500; }, { passive: true });
        button.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

});