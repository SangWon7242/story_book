# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static children's e-book web app ("Beep's Blue Ocean Adventure" / 비프의 푸른 바다 모험) targeting ages 5-9. No build tools, no npm — pure HTML/CSS/JS served as static files.

## Running the Project

No build step required. Open `index.html` directly or serve via any static server:

```bash
python -m http.server 8080
# Or use VS Code Live Server extension
```

## Architecture

### Dual-Mode Rendering

The app runs two completely different UI engines based on screen width:

- **Desktop (>768px)**: Uses **StPageFlip v2.0.7** (CDN) for 3D book page-flip with dual-page spread (left=illustration, right=text)
- **Mobile/Tablet (≤768px)**: Custom card view with full-screen slides (image top, text bottom) and swipe support

Entry points: `initDesktopBook()` and `initMobileBook()` in `js/main.js`. The switch happens at `MOBILE_BREAKPOINT = 768`.

### File Structure

- `index.html` — All story content (6 chapters as page pairs: illustration + text)
- `css/style.css` — Complete stylesheet with CSS variable design system
- `js/main.js` — All logic: book initialization, navigation, audio player, responsive switching
- `images/1-6.png` — Chapter illustrations (~1.6MB each)
- `audio/story_audio.wav` — Narration audio
- `.agent/skills/` — 5 AI skill guideline files (page management, UI, layout, audio, content generation)
- `.gemini/GEMINI.md` — AI code generation system prompt (Korean)

### Page Structure Pattern

Each chapter = 2 HTML divs (illustration page + story page). Story text uses sentence-level `<span class="sentence" data-sentence="N">` wrapping for TTS readiness. When adding/removing chapters, update `TOTAL_STORIES` constant in `js/main.js`.

### CSS Design System

All theming via `:root` variables: `--paper-cream`, `--antique-gold`, `--dark-slate`, `--bg-dark`, `--font-child` (Jua), `--font-title` (Playfair Display), `--touch-min` (54px). Typography uses `clamp()` for fluid responsive sizing.

### Audio Player

Fixed-position collapsible panel with play/pause, seek, and volume. Initialized by `initAudioPlayer()` in `js/main.js`.

## Key Constraints

- **Child-friendly UX**: Minimum 54px touch targets, line-height 2.2, bounce animations, rounded UI, no jarring transitions (<0.25s ease minimum)
- **Korean content**: All story text, comments, and UI labels in Korean
- **Zero dependencies**: No npm/node — only external dep is StPageFlip via CDN
- **6-level responsive breakpoints**: 1200px, 769px, 768px, 480px, 360px
- **Accessibility**: High contrast ratios, `prefers-reduced-motion` support, keyboard nav (arrow keys)

## AI Skill Guidelines

Detailed implementation guides live in `.agent/skills/*/SKILL.md` covering:
- **storybook-page-management**: Adding/removing chapters, sentence wrapping rules
- **child-friendly-ui**: Design tokens, animation patterns, accessibility checklist
- **responsive-ebook-layout**: StPageFlip config, flexbox layout blueprint, scroll prevention
- **audio-tts-integration**: Audio player structure, sentence highlighting CSS, Web Speech API template
- **story-content-generation**: Age-appropriate writing rules (15-30 chars/sentence), story arc template, image prompt structure
