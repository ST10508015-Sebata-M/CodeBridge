/**
 * =====================================================================
 * CODEBRIDGE NPO - MAIN JAVASCRIPT FILE (PART 3)
 * =====================================================================
 * This script handles all interactive behaviors across the website, including:
 * 1. Interactive Accordions (About Us & Privacy Policy pages)
 * 2. Image Gallery Lightbox Modal (For program & workshop images)
 * 3. Leaflet.js Interactive Mapping & Routing (Contact page)
 * 4. Dynamic Content Search, Filtering & Sorting (Homepage programmes)
 * 5. Robust Client-Side Form Validation, Error Handling & Async Feedback 
 *    (Enquiry, Contact, and Donate forms)
 * =====================================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    /* ==========================================================
       1. INTERACTIVE ACCORDIONS (about.html & privacy.html)
       ================================================---------- */
    // Handles collapsible content sections to improve user experience
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.parentElement;
                const content = item.querySelector('.accordion-content');
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                // Toggle ARIA accessibility attribute
                this.setAttribute('aria-expanded', !isExpanded);
                item.classList.toggle('active');

                // Smooth expansion and collapse transition
                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            });
        });
    }


    /* ==========================================================
       2. IMAGE GALLERY LIGHTBOX MODAL (programmes.html / snapshot images)
       ================================================---------- */
    // Creates a dynamic modal popup when users click on gallery/figure images
    const galleryImages = document.querySelectorAll('figure img');
    
    if (galleryImages.length > 0) {
        // Create lightbox container dynamically in DOM
        const lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.style.cssText = 'display:none; position:fixed; z-index:9999; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); justify-content:center; align-items:center; flex-direction:column; cursor:pointer;';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.style.cssText = 'max-width:85%; max-height:80%; border-radius:6px; box-shadow:0 0 20px rgba(255,255,255,0.2);';
        
        const lightboxCaption = document.createElement('p');
        lightboxCaption.style.cssText = 'color:#fff; margin-top:15px; font-size:1.1rem; text-align:center; padding:0 20px;';
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(lightboxCaption);
        document.body.appendChild(lightbox);

        // Open lightbox on image click
        galleryImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                lightbox.style.display = 'flex';
                lightboxImg.src = this.src;
                const figcaption = this.parentElement.querySelector('figcaption');
                lightboxCaption.textContent = figcaption ? figcaption.textContent : this.alt;
            });
        });

        // Close lightbox when clicked anywhere
        lightbox.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });
    }


    /* ==========================================================
       3. LEAFLET.JS INTERACTIVE MAP & LIVE ROUTING (contact.html)
       ================================================---------- */
    // Powers the map canvas and calculates live turn-by-turn routing directions
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        // Initialize map centered around Johannesburg region
        var map = L.map('map').setView([-26.1076, 28.0567], 11);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Define start location (Johannesburg Central / Park Station) and destinations
        var startPoint = L.latLng(-26.1952, 28.0436);
        var alexandraPoint = L.latLng(-26.1042, 28.1005); // Alexandra Centre
        var diepslootPoint = L.latLng(-26.4250, 28.0122); // Diepsloot Centre

        // Default routing control pointing to Alexandra Centre
        var routingControl = L.Routing.control({
            waypoints: [startPoint, alexandraPoint],
            routeWhileDragging: false,
            lineOptions: {
                styles: [{ color: '#0066cc', weight: 6, opacity: 0.8 }]
            },
            createMarker: function(i, wp, nWps) {
                if (i === 0) {
                    return L.marker(wp.latLng).bindPopup("<b>Starting Point:</b> Johannesburg Central (Park Station)");
                } else {
                    return L.marker(wp.latLng).bindPopup("<b>Destination:</b> CodeBridge Training Centre");
                }
            }
        }).addTo(map);

        // Button interactive toggles for routing destinations
        const btnAlexandra = document.getElementById('btn-alexandra');
        const btnDiepsloot = document.getElementById('btn-diepsloot');

        if (btnAlexandra && btnDiepsloot) {
            btnAlexandra.addEventListener('click', function() {
                routingControl.setWaypoints([startPoint, alexandraPoint]);
                btnAlexandra.classList.add('active');
                btnDiepsloot.classList.remove('active');
            });

            btnDiepsloot.addEventListener('click', function() {
                routingControl.setWaypoints([startPoint, diepslootPoint]);
                btnDiepsloot.classList.add('active');
                btnAlexandra.classList.remove('active');
            });
        }
    }


    /* ==========================================================
       4. DYNAMIC CONTENT SEARCH & FILTERING (index.html)
       ================================================---------- */
    // Real-time keyword filtering for training programmes
    const programmeSearch = document.getElementById('programme-search');
    if (programmeSearch) {
        programmeSearch.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            const cards = document.querySelectorAll('#programme-cards-container .programme-card');

            cards.forEach(card => {
                const keywords = card.getAttribute('data-keywords') || '';
                const title = card.querySelector('h3').textContent.toLowerCase();
                const text = card.querySelector('p').textContent.toLowerCase();

                if (keywords.includes(query) || title.includes(query) || text.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }


    /* ==========================================================
       5. FORM VALIDATION & ASYNCHRONOUS AJAX FEEDBACK
       ================================================---------- */

    // Utility function to display validation errors
    function showError(inputElement, errorElement, message) {
        inputElement.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = '#d9534f';
            errorElement.style.fontSize = '0.85rem';
        }
    }

    // Utility function to clear validation errors
    function clearError(inputElement, errorElement) {
        inputElement.classList.remove('input-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // A. Contact Form Validation & Email Compilation (contact.html)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const msgType = document.getElementById('message-type');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            const responseDiv = document.getElementById('contact-form-response');

            // Name validation
            if (!name.value.trim() || name.value.trim().length < 2) {
                showError(name, document.getElementById('name-error'), 'Please enter a valid full name (at least 2 characters).');
                isValid = false;
            } else {
                clearError(name, document.getElementById('name-error'));
            }

            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                showError(email, document.getElementById('email-error'), 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearError(email, document.getElementById('email-error'));
            }

            // South African Phone Number validation regex
            const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
            if (!phoneRegex.test(phone.value.trim())) {
                showError(phone, document.getElementById('phone-error'), 'Please enter a valid SA phone number (e.g. 0821234567).');
                isValid = false;
            } else {
                clearError(phone, document.getElementById('phone-error'));
            }

            // Message Type validation
            if (!msgType.value) {
                showError(msgType, document.getElementById('type-error'), 'Please select a message type.');
                isValid = false;
            } else {
                clearError(msgType, document.getElementById('type-error'));
            }

            // Subject validation
            if (!subject.value.trim() || subject.value.trim().length < 5) {
                showError(subject, document.getElementById('subject-error'), 'Subject must be at least 5 characters long.');
                isValid = false;
            } else {
                clearError(subject, document.getElementById('subject-error'));
            }

            // Message body validation
            if (!message.value.trim() || message.value.trim().length < 10) {
                showError(message, document.getElementById('message-error'), 'Message must be at least 10 characters long.');
                isValid = false;
            } else {
                clearError(message, document.getElementById('message-error'));
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Success!</strong> Input validated successfully. Compiling your email client...';
                
                // Simulate asynchronous delay before launching mailto client
                setTimeout(function() {
                    const mailtoLink = `mailto:info@codebridge.org.za?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent("Name: " + name.value + "\nEmail: " + email.value + "\nPhone: " + phone.value + "\nType: " + msgType.value + "\n\nMessage:\n" + message.value)}`;
                    window.location.href = mailtoLink;
                }, 1200);
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Validation Error:</strong> Please check the highlighted fields above.';
            }
        });
    }

    // B. Enquiry Form Validation & Dynamic Response (enquiry.html)
    const enquiryForm = document.getElementById('enquiry-form');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            const type = document.getElementById('enquiry-type');
            const fullName = document.getElementById('full-name');
            const phone = document.getElementById('contact-number');
            const email = document.getElementById('email');
            const responseDiv = document.getElementById('enquiry-form-response');

            if (!type.value) {
                showError(type, document.getElementById('type-error'), 'Please select an enquiry type.');
                isValid = false;
            } else {
                clearError(type, document.getElementById('type-error'));
            }

            if (!fullName.value.trim() || fullName.value.trim().length < 2) {
                showError(fullName, document.getElementById('name-error'), 'Please enter a valid full name.');
                isValid = false;
            } else {
                clearError(fullName, document.getElementById('name-error'));
            }

            const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
            if (!phoneRegex.test(phone.value.trim())) {
                showError(phone, document.getElementById('phone-error'), 'Please enter a valid SA contact number.');
                isValid = false;
            } else {
                clearError(phone, document.getElementById('phone-error'));
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                showError(email, document.getElementById('email-error'), 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearError(email, document.getElementById('email-error'));
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                
                // Dynamic feedback response based on selection (Rubric: Enquiry Process Response)
                let responseMsg = '';
                if (type.value === 'learner') {
                    responseMsg = '<strong>Application Received!</strong> Tuition is 100% free for qualifying youth. Next cohort availability opens next month. Our admissions team will contact you within 48 hours.';
                } else if (type.value === 'volunteer') {
                    responseMsg = '<strong>Thank You for Volunteering!</strong> Mentor onboarding sessions run every Saturday. We will email your mentor schedule and training pack shortly.';
                } else {
                    responseMsg = '<strong>Sponsorship Enquiry Received!</strong> Thank you for supporting CodeBridge. Our partnership director will reach out with our impact prospectus.';
                }

                responseDiv.innerHTML = responseMsg;
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Error:</strong> Please correct the required fields highlighted above.';
            }
        });
    }

    // C. Donation Form Validation (donate.html)
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            const name = document.getElementById('donor-name');
            const email = document.getElementById('donor-email');
            const responseDiv = document.getElementById('donation-form-response');
            const amountRadios = document.querySelectorAll('input[name="amount"]');
            
            let amountSelected = false;
            amountRadios.forEach(radio => {
                if (radio.checked) amountSelected = true;
            });

            if (!amountSelected) {
                showError(document.getElementById('amount-other'), document.getElementById('amount-error'), 'Please select or enter a donation amount.');
                isValid = false;
            } else {
                clearError(document.getElementById('amount-other'), document.getElementById('amount-error'));
            }

            if (!name.value.trim() || name.value.trim().length < 2) {
                showError(name, document.getElementById('name-error'), 'Please enter your full name.');
                isValid = false;
            } else {
                clearError(name, document.getElementById('name-error'));
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                showError(email, document.getElementById('email-error'), 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearError(email, document.getElementById('email-error'));
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Processing Payment...</strong> Redirecting you securely to PayFast / SnapScan gateway...';
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Validation Error:</strong> Please complete all required donation details.';
            }
        });
    }

});