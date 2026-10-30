## Part 1 Feedback & Revisions

- **Lecturer Feedback:** "Excellent, ensure to include a changelog only."
- **Part 1 Grade Received:** 81 / 100
- **Action Taken:** 
  - Created and structured `CHANGELOG.md` tracking all version history from `v1.0.0` (Part 1 HTML layout and forms) through `v1.0.2` (Part 2 CSS styling, design tokens, media queries, and responsiveness).
  - Linked `CHANGELOG.md` in the main `README.md` documentation for reviewer visibility.

# Changelog



## **v1.0.0 - Initial Release**

- Initial commit (commit cd39c8c)  

- "This is my initial commit for this project which includes the basic structure of the website, with HTML, CSS, and JavaScript files." (commit 569fe0e)  

- commit: finished index.html part 1 setup (commit 0910f07)  

  - Finished index.html Part 1 setup. I added the hero section with the mission statement and apply button, wrote the about snapshot with background info, and included the programmes snapshot for Web Development, Java, and Digital Literacy.  

  - Added four testimonials (learner, parent, digital literacy participant, donor).  

  - Created apply/volunteer teaser section.  

  - Updated footer with contact, social media placeholder, donate, and privacy policy links.  

  - Linked `main.js` script at the bottom for performance.  

  - Every section is properly commented so the rubric gang can see the purpose clearly. (commit 2aa3a74)  

- I implemented homepage structure and branding by adding codingbridge logo and favicon (commit b23a350)  

- Finish about.html Part 1: tidy structure and accessibility (commit 9af47a0)  

  - Closed logo div, added nav role and main id.  

  - Wrapped images in figure with figcaptions and lazy-loading.  

  - Clarified single-person team.  

  - Added clear section comments for the rubric.  

  - Flagged footer Donate/Privacy as Part 2 placeholders.  

  - Linked `main.js`.  

- Completed the Programmes page (commit 45d5945)  

  - Added and organised programme content (images, descriptions, durations, prerequisites, schedules, application links).  

  - Improved HTML structure and visual presentation using semantic elements, figures, captions, and section dividers.  

- Implemented the enquiry page (commit c756700)  

  - Structured HTML5 form for learner applications, volunteer sign-ups, sponsor enquiries.  

  - Organised with fieldsets and clear sections for readability.  

- Completed contact page (commit 9e18be3)  

  - Structured HTML5 form for user enquiries.  

- Updated programmes file (commit 288abf1)  

  - Added `<details>` and `<summary>` tags for curriculum breakdown per program.  

- Added donate page (commit 14bf6cf)  

- Added privacy page (commit 28a69ac)  



---



## **v1.0.1 - Patch Release**

- Fixed comments and tidied code to improve readability. (commit 19f4666)  

- Fixed comments and tidied code to improve readability. (duplicate commit 19f4666)  



---



## **v1.0.2 - PART 2 Patch Release**

- Add CHANGELOG.md (commit c4c2004)  

- Update about page responsive images and active nav state (commit d654ed5)  

  - Added `srcset` and `sizes` attributes to content images.  

  - Added `aria-current` page attribute to active navigation link.  

  - Removed redundant role navigation attribute from nav tag.  

  - Cleaned up HTML comments.  

- Update CHANGELOG with about page responsive images and nav state (commit 849527f)  

- Update README with changelog section (commit 76d07cf)  

- style: implement Part 2 external stylesheet (commit a563045)  

  - Added design tokens, base resets, flex/grid layouts, pseudo-classes, responsive media queries.  

- Enhanced css folder and added animation (commit cf4a64d)  

- Restored index.html content (commit 58470d7)  

- Added new images for device testing proof (commit 1170f57)  

- Refactored README for clarity, added testing evidence, updated formatting for website pages, and added responsive design testing sections with screenshots. (commit 7755e25)  



---



## **v1.0.3 - PART 3 Interactive Enhancements & Final Polish**

*(Commits on October 29, 2026)*
- Updated about.html for Part 3 by integrating targeted SEO meta tags (description and keywords) and converting the static 'Our Values' list into a fully interactive accordion component.
- Updated contact.html for Part 3 by embedding targeted SEO meta tags, integrating an interactive Leaflet.js map for the Alexandra and Diepsloot community centres with dynamic toggle controls, and ensuring robust routing.
- Updated donate.html for Part 3 by embedding targeted SEO meta tags and enhancing the donation form with structured fieldsets, client-side validation error containers, and custom pledge options.
- Updated enquiry.html for Part 3 by embedding targeted SEO meta tags, enhancing the multi-purpose enquiry form with client-side validation error containers, and structured dynamic conditional pricing/availability fieldsets.
- Updated index.html for Part 3 by embedding optimized SEO meta tags and integrating a dynamic search, category filter, and sorting feature for the programmes snapshot section.
- Updated privacy.html for Part 3 by integrating targeted SEO meta tags and structured the privacy disclosure into collapsible interactive sections to improve user experience.
- Updated programmes.html for Part 3 by embedding targeted SEO meta tags and structured curriculum sections using `<details>` and `<summary>` elements for smooth interactive dropdown behaviors.
- Added fully commented robots.txt and sitemap.xml files for search engine crawler indexing and SEO compliance.
- Added fully commented main.js script powering interactive accordions, lightbox gallery modal, Leaflet routing maps, search filtering, and robust form validation.
- Updated main.js with live browser geolocation routing, OSRM driving directions, and granular error guidance.

*(Commits on October 30, 2026)*
- Performed minor fixes and code refinements across templates to ensure absolute adherence to Part 3 rubric criteria, accessibility standards, and styling consistency.
- Made final adjustments to ensure all rubric criteria are fully met.