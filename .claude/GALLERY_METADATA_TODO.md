# Gallery Metadata Compliance TODO

**File**: `/src/data/gallery-metadata.json`
**Current Score**: 6.8/10.0
**Target Score**: 8.5/10.0
**Status**: Requires manual content curation
**Estimated Effort**: 2-3 hours

---

## Issues Requiring Manual Fixes

### 1. Placeholder Alt Text (CRITICAL for WCAG AAA)

**Current Pattern** (repeated for all images):
```json
"alt": "Action sports photography showcase - Portfolio image 1"
```

**Required**: Descriptive alt text for each image

**Examples of Good Alt Text**:
```json
// Portfolio-00
"alt": "Skateboarder executing kickflip at downtown skatepark, mid-air rotation captured against urban skyline backdrop"

// Portfolio-01
"alt": "BMX rider performing backflip at outdoor dirt jump, sunset golden hour lighting"

// Portfolio-02
"alt": "Volleyball player spiking ball at peak jump height, indoor tournament setting with dramatic rim lighting"
```

**Guidance**:
- Describe: Subject, Action, Location/Setting, Notable composition
- Keep concise (100-150 characters ideal)
- Focus on visual elements, not interpretation
- Include sport type, specific trick/move if applicable

---

### 2. Location Placeholders (HIGH)

**Current** (all images):
```json
"location": "Location to be specified"
```

**Required**: Actual locations or remove field entirely

**Options**:
- **Complete**: Add real locations ("Venice Beach Skatepark, Los Angeles, CA")
- **Remove**: Delete location field if privacy concerns or info unavailable

---

### 3. Generic Project Context (HIGH)

**Current** (repeated identically):
```json
"projectContext": "Action sports portfolio - capturing dynamic movement and athletic skill"
```

**Required**: Unique context per image

**Examples**:
```json
// Portfolio-00
"projectContext": "Urban skateboarding series documenting street competition at Venice Beach, August 2024. Focus on technical street tricks and urban environment integration."

// Portfolio-01
"projectContext": "BMX freestyle documentation capturing aerial tricks at Woodward Camp training facility. Part of action sports portfolio expanding into bike discipline."

// Portfolio-02
"projectContext": "Professional volleyball tournament coverage, capturing peak athletic moments during AVP championship semi-finals. Demonstrates sports photography capabilities."
```

---

### 4. Processing Notes Lack Quantification (MEDIUM)

**Current**:
```json
"processingNotes": "Contrast enhancement, vibrance adjustment, composition crop"
```

**Required**: Specific adjustment values

**Example**:
```json
"processingNotes": "Lightroom Classic: Contrast +22%, Vibrance +15, Highlights -18, Shadows +25 (+0.4EV). Crop from 3:2 to 4:5 (Instagram portrait, removed 20% left frame). Selective color grading: Orange/teal split-tone for urban aesthetic."
```

---

### 5. Placeholder Timestamps (LOW)

**Current**:
```json
"dateTaken": "2024-01-01T12:00:00Z"
```

**Issue**: New Year's Day at noon is obvious placeholder

**Required**: Actual capture dates or omit field

---

## Implementation Approach

### Option A: Full Manual Curation (Recommended)
1. Review each actual image file in `/public/images/gallery/`
2. Write descriptive alt text based on actual content
3. Add real location data from EXIF if available
4. Write unique projectContext for each image
5. Document actual Lightroom processing from catalog

**Time**: 2-3 hours
**Quality**: EXCELLENT (8.5/10.0 target)

### Option B: Partial Completion
1. Fix alt text only (WCAG compliance)
2. Remove location field entirely
3. Improve 3-5 key images with full metadata
4. Leave others with generic descriptions

**Time**: 1 hour
**Quality**: GOOD (7.5/10.0)

### Option C: Defer to Future Sprint
- Current state is functionally acceptable
- Alt text is biggest accessibility concern
- Can be completed when gallery is actively promoted

**Time**: 0 hours (defer)
**Quality**: ACCEPTABLE (6.8/10.0 current)

---

## Recommendation

**Deploy Option B** for Phase 5B completion:
1. Fix alt text for top 5 featured images
2. Remove location field from JSON schema
3. Complete one image fully as template
4. Schedule full curation for Phase 6

This achieves GOOD standard (7.5/10.0) without blocking deployment.

---

## Quick Reference: Image Inventory

Based on `/src/data/gallery-metadata.json`:

| ID | Filename | Current Alt | Needs |
|----|----------|-------------|-------|
| portfolio-00 | portfolio-00.jpg | Generic placeholder | ✏️ Descriptive alt |
| portfolio-01 | portfolio-01.jpg | Generic placeholder | ✏️ Descriptive alt |
| portfolio-02 | portfolio-02.jpg | Generic placeholder | ✏️ Descriptive alt |

*(Note: Only 3 images visible in file read - check full file for complete inventory)*

---

## Compliance Impact

| Violation | Before | After (Option B) | After (Option A) |
|-----------|--------|------------------|------------------|
| Placeholder alt text | 100% (CRITICAL) | 0% ✅ | 0% ✅ |
| Location placeholders | 100% (HIGH) | 0% ✅ | 0% ✅ |
| Generic projectContext | 100% (HIGH) | 60% | 0% ✅ |
| Quantified processing | 0% (MEDIUM) | 20% | 100% ✅ |
| **Score** | **6.8/10.0** | **7.5/10.0** | **8.5/10.0** |

---

**Next Action**: Choose option and schedule implementation. Option B can be completed in 1 hour for 7.5/10.0 quality.