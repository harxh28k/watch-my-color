# Your Cinematic Color

An interactive web app that maps your current mood and taste to a distinct cinematic color palette, then pulls matching film recommendations graded to that atmosphere.

## How It Works

Instead of generic genre filters, the app diagnoses your viewing mood through an 8-question Likert scale quiz. 

1. **Diagnosis**: You respond to 8 curated statements evaluating narrative tone, pacing, visual density, and aesthetic preference.
2. **Archetype Mapping**: The calculator scores your inputs against specific visual profiles (e.g., Analytical Slate Blue, Warm Nostalgia, Noir Contrast).
3. **Curated Recommendations**: The app queries the OMDb API in real-time, fetching posters, release years, and IMDb ratings for films that fit your assigned spectrum, with local fallback data if the API limit is reached.

## Tech Stack

- **Frontend**: Vanilla HTML5, modern CSS3 (custom CSS custom properties, grid/flexbox layouts)
- **Logic**: Vanilla JavaScript using ES Modules (`import`/`export`)
- **Typography**: DM Sans & DM Serif Display via Google Fonts
- **External Data**: OMDb REST API

## Project Architecture

```text
watch-my-color/
├── index.html              # Main application markup
├── style.css               # Editorial design, styling, and animations
├── config.example.js       # Template for external API keys
├── data/
│   ├── colorProfiles.js    # Visual spectrum metadata and archetype definitions
│   └── question.js         # Diagnostic statements and scoring weights
├── js/
│   ├── app.js              # Application controller and view transitions
│   └── calculator.js       # Scoring and color matching algorithm
└── services/
    └── omdb.js             # API client handling movie fetches and fallbacks