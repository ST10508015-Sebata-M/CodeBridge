/**
 * =====================================================================
 * CODEBRIDGE NPO - MAIN JAVASCRIPT FILE (PART 3)
 * =====================================================================
 * This script handles all interactive behaviors across the website, including:
 * 1. Interactive Accordions (About Us & Privacy Policy pages)
 * 2. Image Gallery Lightbox Modal (For program & workshop images)
 * 3. Leaflet.js Interactive Mapping & Live Geolocation Routing (Contact page)
 * 4. Dynamic Content Search, Filtering & Sorting (Homepage programmes)
 * 5. Advanced, User-Friendly Client-Side Form Validation & Async Feedback 
 *    (Enquiry, Contact, and Donate forms)
 * =====================================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    /* ==========================================================
       1. INTERACTIVE ACCORDIONS (about.html & privacy.html)
       ================================================---------- */
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
       2. IMAGE GALLERY LIGHTBOX MODAL (programmes.html / images)
       ================================================---------- */
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
       3. LEAFLET.JS INTERACTIVE MAP & LIVE GEOLOCATION ROUTING (contact.html)
       ================================================---------- */
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        // Initialize map centered around Johannesburg region as fallback
        var map = L.map('map').setView([-26.1076, 28.0567], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var alexandraPoint = L.latLng(-26.1042, 28.1005); // Alexandra Centre
        var diepslootPoint = L.latLng(-26.4250, 28.0122); // Diepsloot Centre

        let userLatLng = null;
        let routingControl = null;

        // Function to draw route from user's live location to destination
        function updateRoute(destinationLatLng) {
            if (!userLatLng) return;

            if (routingControl) {
                map.removeControl(routingControl);
            }

            routingControl = L.Routing.control({
                waypoints: [userLatLng, destinationLatLng],
                routeWhileDragging: false,
                lineOptions: {
                    styles: [{ color: '#0066cc', weight: 6, opacity: 0.8 }]
                },
                createMarker: function(i, wp, nWps) {
                    if (i === 0) {
                        return L.marker(wp.latLng).bindPopup("<b>Your Live Location</b>").openPopup();
                    } else {
                        return L.marker(wp.latLng).bindPopup("<b>CodeBridge Training Centre</b>");
                    }
                }
            }).addTo(map);
        }

        // Request browser live geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                map.setView(userLatLng, 13);
                updateRoute(alexandraPoint);
            }, function(error) {
                console.warn("Geolocation access denied or unavailable. Falling back to Johannesburg Central.");
                userLatLng = L.latLng(-26.1952, 28.0436);
                updateRoute(alexandraPoint);
            }, { timeout: 10000 });
        } else {
            userLatLng = L.latLng(-26.1952, 28.0436);
            updateRoute(alexandraPoint);
        }

        // Campus Toggle Buttons
        const btnAlexandra = document.getElementById('btn-alexandra');
        const btnDiepsloot = document.getElementById('btn-diepsloot');

        if (btnAlexandra && btnDiepsloot) {
            btnAlexandra.addEventListener('click', function() {
                if (userLatLng) updateRoute(alexandraPoint);
                btnAlexandra.classList.add('active');
                btnDiepsloot.classList.remove('active');
            });

            btnDiepsloot.addEventListener('click', function() {
                if (userLatLng) updateRoute(diepslootPoint);
                btnDiepsloot.classList.add('active');
                btnAlexandra.classList.remove('active');
            });
        }
    }


    /* ==========================================================
       4. DYNAMIC CONTENT SEARCH & FILTERING (index.html)
       ================================================---------- */
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
       5. ADVANCED, USER-FRIENDLY FORM VALIDATION & AJAX FEEDBACK
       ================================================---------- */

    function showError(inputElement, errorElement, message) {
        inputElement.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = '#d9534f';
            errorElement.style.fontSize = '0.85rem';
            errorElement.style.marginTop = '4px';
            errorElement.style.display = 'block';
        }
    }

    function clearError(inputElement, errorElement) {
        inputElement.classList.remove('input-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Granular and user-friendly email validator with specific guidance messages.
     */
    function validateEmail(emailInput, errorElement) {
        const val = emailInput.value.trim();
        if (val === '') {
            showError(emailInput, errorElement, 'Error: Email address is required so we can send your confirmation receipt.');
            return false;
        }
        if (!val.includes('@')) {
            showError(emailInput, errorElement, 'Error: Your email address is missing the "@" symbol (e.g., yourname@example.com). Please check it.');
            return false;
        }
        if (!val.includes('.')) {
            showError(emailInput, errorElement, 'Error: Your email address is missing a valid domain extension (e.g., .co.za or .com).');
            return false;
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(val)) {
            showError(emailInput, errorElement, 'Error: This email format appears invalid. Please ensure there are no typos or stray spaces.');
            return false;
        }
        clearError(emailInput, errorElement);
        return true;
    }

    /**
     * Granular and user-friendly phone validator (enforcing the <= 10 digits rule for local numbers).
     */
    function validatePhone(phoneInput, errorElement) {
        const val = phoneInput.value.trim();
        if (val === '') {
            showError(phoneInput, errorElement, 'Error: Contact number is required in case we need to reach you urgently.');
            return false;
        }

        // Clean spaces and hyphens to inspect digits
        const cleanVal = val.replace(/[\s-]/g, '');

        // Check if phone number digits are greater than 10 (excluding international +27 prefix)
        if (!cleanVal.startsWith('+27') && cleanVal.length > 10) {
            showError(phoneInput, errorElement, 'Error: Phone number is greater than 10 digits! Standard South African numbers must be exactly 10 digits (e.g., 0821234567). Please shorten or correct it.');
            return false;
        }

        if (cleanVal.startsWith('+27') && cleanVal.length > 12) {
            showError(phoneInput, errorElement, 'Error: International phone number is too long. Please ensure it follows the correct format.');
            return false;
        }

        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        if (!phoneRegex.test(cleanVal)) {
            showError(phoneInput, errorElement, 'Error: Please enter a valid South African mobile number starting with 06, 07, or 08 (total 10 digits).');
            return false;
        }

        clearError(phoneInput, errorElement);
        return true;
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

            // Name Validation
            if (!name.value.trim()) {
                showError(name, document.getElementById('name-error'), 'Error: Full name is required.');
                isValid = false;
            } else if (name.value.trim().length < 2) {
                showError(name, document.getElementById('name-error'), 'Error: Name is too short. Please enter at least 2 characters.');
                isValid = false;
            } else {
                clearError(name, document.getElementById('name-error'));
            }

            // Email Validation
            if (!validateEmail(email, document.getElementById('email-error'))) {
                isValid = false;
            }

            // Phone Validation (> 10 digits check included)
            if (!validatePhone(phone, document.getElementById('phone-error'))) {
                isValid = false;
            }

            // Message Type Validation
            if (!msgType.value) {
                showError(msgType, document.getElementById('type-error'), 'Error: Please select what your message is about from the dropdown list.');
                isValid = false;
            } else {
                clearError(msgType, document.getElementById('type-error'));
            }

            // Subject Validation
            if (!subject.value.trim()) {
                showError(subject, document.getElementById('subject-error'), 'Error: Subject line is required so we know how to direct your message.');
                isValid = false;
            } else if (subject.value.trim().length < 5) {
                showError(subject, document.getElementById('subject-error'), 'Error: Subject is a bit too brief. Please enter at least 5 characters.');
                isValid = false;
            } else {
                clearError(subject, document.getElementById('subject-error'));
            }

            // Message Body Validation
            if (!message.value.trim()) {
                showError(message, document.getElementById('message-error'), 'Error: Message content cannot be blank. Tell us how we can help.');
                isValid = false;
            } else if (message.value.trim().length < 10) {
                showError(message, document.getElementById('message-error'), 'Error: Please provide a bit more detail (at least 10 characters required).');
                isValid = false;
            } else {
                clearError(message, document.getElementById('message-error'));
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Validation Successful:</strong> All fields verified. Opening your email client to send message...';
                
                setTimeout(function() {
                    const mailtoLink = `mailto:info@codebridge.org.za?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent("Name: " + name.value + "\nEmail: " + email.value + "\nPhone: " + phone.value + "\nType: " + msgType.value + "\n\nMessage:\n" + message.value)}`;
                    window.location.href = mailtoLink;
                }, 1200);
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Please Fix Errors:</strong> We noticed a few items that need correction above. Please review the guidance provided.';
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
                showError(type, document.getElementById('type-error'), 'Error: Please select whether you are applying as a learner, volunteer, or sponsor.');
                isValid = false;
            } else {
                clearError(type, document.getElementById('type-error'));
            }

            if (!fullName.value.trim() || fullName.value.trim().length < 2) {
                showError(fullName, document.getElementById('name-error'), 'Error: Please enter your full name (at least 2 characters).');
                isValid = false;
            } else {
                clearError(fullName, document.getElementById('name-error'));
            }

            if (!validatePhone(phone, document.getElementById('phone-error'))) {
                isValid = false;
            }

            if (!validateEmail(email, document.getElementById('email-error'))) {
                isValid = false;
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                
                let responseMsg = '';
                if (type.value === 'learner') {
                    responseMsg = '<strong>Application Received:</strong> Tuition is 100% free for qualifying youth. Next cohort availability opens next month. Our admissions team will contact you within 48 hours.';
                } else if (type.value === 'volunteer') {
                    responseMsg = '<strong>Thank You for Volunteering:</strong> Mentor onboarding sessions run every Saturday. We will email your mentor schedule and training pack shortly.';
                } else {
                    responseMsg = '<strong>Sponsorship Enquiry Received:</strong> Thank you for supporting CodeBridge. Our partnership director will reach out with our impact prospectus.';
                }

                responseDiv.innerHTML = responseMsg;
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Please Review:</strong> Some fields require your attention. Please check the guidance notes above.';
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
                showError(document.getElementById('amount-other'), document.getElementById('amount-error'), 'Error: Please select one of the donation amounts or enter a custom amount.');
                isValid = false;
            } else {
                clearError(document.getElementById('amount-other'), document.getElementById('amount-error'));
            }

            if (!name.value.trim() || name.value.trim().length < 2) {
                showError(name, document.getElementById('name-error'), 'Error: Please enter your full name for your donor acknowledgement receipt.');
                isValid = false;
            } else {
                clearError(name, document.getElementById('name-error'));
            }

            if (!validateEmail(email, document.getElementById('email-error'))) {
                isValid = false;
            }

            if (isValid) {
                responseDiv.className = 'form-response success';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #dff0d8; color: #3c763d; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Processing Payment:</strong> Redirecting you securely to PayFast / SnapScan gateway...';
            } else {
                responseDiv.className = 'form-response error';
                responseDiv.style.cssText = 'padding: 12px; margin-top: 15px; background: #f2dede; color: #a94442; border-radius: 4px;';
                responseDiv.innerHTML = '<strong>Form Incomplete:</strong> Please select an amount and verify your contact details.';
            }
        });
    }

});