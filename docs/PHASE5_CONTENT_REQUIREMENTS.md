# Phase 5: Content Requirements from User

**Date:** 2025-10-01
**Purpose:** Gather real content to replace placeholders
**Status:** 🟡 Awaiting User Input

---

## 📋 CONTENT NEEDED

### 1. Hero Section Trust Signals (Task 5.4)

**Current Placeholder Claims:**
- "20+ Years Experience"
- "100+ Projects Delivered"
- "Fortune 500 Trusted"

**Questions:**
1. Is "20+ years" accurate? (Can confirm: "20+ years architecting systems" appears in current copy)
2. Is "100+ projects" accurate? Or should it be different (50+, 75+, 150+)?
3. Have you worked with Fortune 500 companies? If yes, can you mention:
   - Specific industries (retail, finance, healthcare)?
   - Anonymized references ("Fortune 500 Retailer", "Global Financial Institution")?
   - Alternative: "Enterprise Clients" or "Multi-National Corporations"?

**Alternative Trust Signals to Consider:**
- Professional certifications (AWS, Azure, GCP)?
- Specific technologies ("React Expert", "GenAI Specialist")?
- Team sizes led ("Led teams of 10+", "Managed 50+ developers")?
- System scale metrics ("Architected systems serving 10M+ users")?

---

### 2. Work Projects - Real Case Studies (Task 5.5)

**Current Placeholders** (src/constants.ts lines 16-38):
- All 3 projects use Lorem Picsum placeholder images
- All links point to "#"
- Descriptions are generic

**Projects to Replace:**

#### Project #1: Current = "Agentic Software Development"
**Need from you:**
- Real project name
- 2-3 sentence description focusing on **measurable outcomes**
- Technologies used (tags)
- Project screenshot or architecture diagram (image file)
- Link to case study or GitHub repo (or remove link if confidential)
- **Metrics:**
  - Scale ("2M+ transactions/day", "500GB+ data processed")
  - Performance ("99.99% uptime", "< 200ms latency")
  - Business impact ("35% cost reduction", "+23% conversion")

**Example Format:**
```typescript
{
  title: 'Multi-Cloud Commerce Platform',
  description: 'Architected resilient e-commerce infrastructure handling 2M+ daily transactions across AWS, Azure, and GCP with 99.99% uptime. Reduced infrastructure costs by 35% while scaling to Black Friday peak loads.',
  tags: ['AWS', 'Kubernetes', 'Terraform', 'React', 'Microservices'],
  imageUrl: '/images/projects/commerce-platform.jpg',
  link: 'https://github.com/ninochavez/commerce-platform', // or '#' if confidential
  metrics: {
    scale: '2M+ transactions/day',
    uptime: '99.99%',
    costSavings: '35%'
  }
}
```

#### Project #2: Current = "Enterprise Cloud Migration"
**Need from you:**
- Same format as Project #1
- Real migration details
- Client type (if can't name: "Fortune 500 Manufacturer", etc.)
- Migration scope and outcomes

#### Project #3: Current = "Volleyball Tournament Platform"
**Options:**
1. Keep this project (it's unique and demonstrates full-stack skills)
2. Replace with different real project
3. Remove entirely (only show 2 projects)

**Your choice:**
- [ ] Keep volleyball platform (provide real link/screenshot)
- [ ] Replace with: ___________________________
- [ ] Remove (show only 2 projects)

---

### 3. Project Screenshots/Images

**Needed:**
- 2-3 project screenshots or architecture diagrams
- Format: JPG or PNG
- Recommended size: 1200x800px (or 3:2 aspect ratio)
- Optimized for web (< 500KB each)

**Options if you don't have screenshots:**
1. Architecture diagrams (can create from description)
2. Technology logos collage
3. Abstract/minimal graphics representing the domain
4. Screenshots from public-facing features (if allowed)

**Where to provide:**
- Email images to: (provide upload link or attach)
- Store in: `/public/images/projects/`
- Naming: `project-name-slug.jpg`

---

### 4. Contact Section - Calendly Link (Task 5.6)

**Current:**
- Contact section shows email only
- No consultation booking option

**Needed from you:**
- Calendly booking URL (or alternative: Cal.com, Google Calendar, etc.)
- Consultation duration (30 min? 60 min?)
- Preferred consultation framing:
  - "Book Free Architecture Consultation" (recommended)
  - "Schedule Discovery Call"
  - "Book Strategy Session"
  - Other: ___________________________

**If you don't have Calendly:**
- Option A: Create free Calendly account (takes 5 min)
- Option B: Use different scheduling tool (provide link)
- Option C: Skip for now (can add later)

**Your Calendly link:**
- [ ] https://calendly.com/___________________
- [ ] Not set up yet (will provide later)
- [ ] Don't want booking feature

---

### 5. Client Logos (Optional - Future Enhancement)

**Not required for Phase 5 but valuable for credibility:**

Do you have permission to display client logos?
- [ ] Yes (provide logos or company names)
- [ ] No (skip this)
- [ ] Can use anonymized ("Fortune 500 Retailer logo", generic industry icons)

If yes:
- 3-5 client logos
- Format: SVG or PNG with transparent background
- Size: ~200px width
- Where to display: Footer, About section, or dedicated "Trusted By" section

---

## 📝 RESPONSE FORMAT

Please respond with completed information below:

---

### HERO SECTION TRUST SIGNALS

**Confirmed or Corrected:**
- Years of experience: ______ years
- Projects delivered: ______ projects
- Client types: ______________________________
- Other credentials: ______________________________

---

### WORK PROJECT #1

**Title:** ______________________________

**Description (2-3 sentences with metrics):**
______________________________
______________________________
______________________________

**Tags:** [ ______, ______, ______, ______, ______ ]

**Image:** (attach file or describe)

**Link:** ______________________ or "N/A - confidential"

**Metrics:**
- Scale: ______________________________
- Performance: ______________________________
- Business Impact: ______________________________

---

### WORK PROJECT #2

**Title:** ______________________________

**Description (2-3 sentences with metrics):**
______________________________
______________________________
______________________________

**Tags:** [ ______, ______, ______, ______, ______ ]

**Image:** (attach file or describe)

**Link:** ______________________________

**Metrics:**
- Scale: ______________________________
- Performance: ______________________________
- Business Impact: ______________________________

---

### WORK PROJECT #3

**Decision:**
- [ ] Keep volleyball platform (provide details)
- [ ] Replace with: ______________________________
- [ ] Remove (show only 2 projects)

**If keeping or replacing, provide same format as Projects #1 and #2**

---

### CALENDLY/SCHEDULING

**Link:** ______________________________

**Preferred CTA text:** ______________________________

**Consultation duration:** ______ minutes

---

### ADDITIONAL NOTES

**Any other information you'd like to include:**
______________________________
______________________________
______________________________

---

## 🚀 NEXT STEPS AFTER YOU PROVIDE CONTENT

1. **I will:**
   - Implement hero CTA enhancements (Task 5.4)
   - Replace work project placeholders with your real content (Task 5.5)
   - Add Calendly integration to contact section (Task 5.6)
   - Optimize and upload project images
   - Update all links and metadata
   - Build and test

2. **Estimated time:** 4-6 hours implementation after receiving content

3. **Result:**
   - Zero placeholder content
   - Professional, credible portfolio
   - Conversion-optimized CTAs
   - Clear value propositions

---

**Status:** Ready to receive content
**Priority:** High (blocks Week 2 tasks)
**Contact:** Respond via chat or email content to hello@nino.photos
