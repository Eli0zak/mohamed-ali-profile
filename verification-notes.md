# Verification notes

- The development server is running after dependency restoration; TypeScript and Vitest pass.
- The home page renders the English content and shows the Arabic language control in the header.
- The Career Gateway page renders the English form and shows the Arabic language control in its header.
- Remaining validation is interactive: confirm language switching/persistence and the submit path with invalid/valid field states.


The browser test confirmed that clicking the home-page language control changes the header, hero, navigation, metrics, orbit labels, journey, training, skills, and contact copy to Arabic while keeping the same visual layout. The control label changes to English for switching back.


Navigating from the Arabic home page to `/career-gateway` preserved Arabic copy and RTL layout. The Career Gateway header shows the switch-back label “English”, and the form labels, select options, checkbox, upload instructions, and submit button are Arabic.


Submitting the empty Arabic form now bypasses native browser validation and renders inline Arabic errors for full name, phone, email, and CV upload. No English browser alert appears; custom validation blocks the mutation as intended.


The browser exposed the CV input as DOM input[type=file] index 8, but the upload helper rejected that index because it maps to the visible-element list rather than the DOM list. The form remained on the same page and no submission was created.


The file input was temporarily made visible in the browser and appears as visible element index 14, confirming the upload test can target it without changing the application source.
