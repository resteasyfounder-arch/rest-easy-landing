

## Footer Update and New Pages

### Changes Overview

1. **Update Footer Product links** to point to actual landing page sections
2. **Remove "Blog"** from the Company section
3. **Create 4 new pages**: About, Contact, Privacy Policy, Terms of Service
4. **Add routes** for the new pages in `App.tsx`
5. **Update Footer links** to use React Router `Link` for internal navigation

---

### Detailed Changes

**`src/components/Footer.tsx`**
- Update the Product links to match the actual section IDs on the landing page:
  - "The Problem" -> `/#problem`
  - "Our Solution" -> `/#solution`
  - "Your Journey" -> `/#journey`
  - "Meet Remy" -> `/#remy`
- Remove "Blog" from the Company section, leaving just "About" and "Contact"
- Update Company links: About -> `/about`, Contact -> `/contact`
- Update Legal links: Privacy Policy -> `/privacy`, Terms of Service -> `/terms`
- Use React Router `Link` components instead of plain `<a>` tags for internal routes

**New Pages (simple placeholder pages with consistent styling):**

- `src/pages/About.tsx` -- Company about page with header, content area, and footer
- `src/pages/Contact.tsx` -- Contact page with a basic contact form or info
- `src/pages/PrivacyPolicy.tsx` -- Privacy policy page with placeholder legal text
- `src/pages/TermsOfService.tsx` -- Terms of service page with placeholder legal text

Each page will include the `Header` and `Footer` components wrapped in `AppLayout` for consistent navigation, matching the landing page pattern.

**`src/App.tsx`**
- Import and add routes for the 4 new pages:
  - `/about` -> About
  - `/contact` -> Contact
  - `/privacy` -> PrivacyPolicy
  - `/terms` -> TermsOfService

