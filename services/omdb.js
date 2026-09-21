// services/omdb.js
import { OMDB_API_KEY } from "../config.js";
const OMDB_API_KEY = "df8c8440"; // Put your activated 8-character OMDb key inside the quotes
const BASE_URL = "https://www.omdbapi.com/";

// Expanded pool of 20 distinct films per color aesthetic
const COLOR_FILM_POOLS = {
    yellow: [
        "The Grand Budapest Hotel", "Amélie", "Fantastic Mr. Fox",
        "Little Miss Sunshine", "Moonrise Kingdom", "Midnight in Paris",
        "Almost Famous", "Big Fish", "La La Land", "Juno",
        "The Darjeeling Limited", "Call Me by Your Name", "Before Sunrise",
        "The Truman Show", "Paddington 2", "Singin' in the Rain",
        "Cinema Paradiso", "Lady Bird", "Licorice Pizza", "Past Lives"
    ],
    orange: [
        "Mad Max: Fury Road", "Dune", "Sicario",
        "Blade Runner 2049", "The Martian", "Lawrence of Arabia",
        "Oppenheimer", "Dunkirk", "Top Gun: Maverick", "1917",
        "Hell or High Water", "No Country for Old Men", "Apocalypse Now",
        "There Will Be Blood", "The Hurt Locker", "The Revenant",
        "Skyfall", "Gladiator", "Cast Away", "Interstellar"
    ],
    red: [
        "Her", "In the Mood for Love", "Suspiria",
        "Drive", "The Shining", "Moulin Rouge!",
        "Black Swan", "Akira", "Twin Peaks: Fire Walk with Me", "Cries and Whispers",
        "Do the Right Thing", "Perfect Blue", "Fight Club",
        "Taxi Driver", "Whiplash", "American Psycho",
        "Bram Stoker's Dracula", "Phantom Thread", "The Handmaiden", "Babylon"
    ],
    purple: [
        "Blade Runner 2049", "Drive", "Only God Forgives",
        "Enter the Void", "The Neon Demon", "Color Out of Space",
        "Spider-Man: Into the Spider-Verse", "Mandy", "Eyes Wide Shut", "Nightcrawler",
        "Spider-Man: Across the Spider-Verse", "Climax", "Paprika",
        "Tron: Legacy", "Akira", "Annihilation",
        "Spring Breakers", "Lost in Translation", "Dark City", "Donnie Darko"
    ],
    blue: [
        "The Social Network", "Minority Report", "Ex Machina",
        "Arrival", "Tron: Legacy", "Shutter Island",
        "Fight Club", "Blade Runner", "Gattaca", "Solaris",
        "The Abyss", "I, Robot", "Contact",
        "Children of Men", "Oblivion", "First Man",
        "Tenet", "The Matrix", "Ad Astra", "Gravity"
    ],
    green: [
        "The Matrix", "Annihilation", "Parasite",
        "Vertigo", "Alien", "The Green Knight",
        "Pan's Labyrinth", "Children of Men", "The Shape of Water", "Stalker",
        "Fight Club", "The Village", "Crouching Tiger, Hidden Dragon",
        "Oldboy", "The Fountain", "The Beach",
        "Jurassic Park", "Melancholia", "The Witch", "Princess Mononoke"
    ],
    grey: [
        "Zodiac", "The Batman", "The Banshees of Inisherin",
        "Prisoners", "Manchester by the Sea", "The Road",
        "No Country for Old Men", "Mystic River", "Se7en", "The Girl with the Dragon Tattoo",
        "Spotlight", "Inside Llewyn Davis", "A Separation",
        "Doubt", "The Master", "Leave No Trace",
        "The Turin Horse", "Wind River", "Winter's Bone", "The Grey"
    ],
    blackWhite: [
        "The Lighthouse", "La Haine", "Roma",
        "Schindler's List", "Raging Bull", "Eraserhead",
        "The Artist", "Nebraska", "Seven Samurai", "Persona",
        "8½", "Bicycle Thieves", "Casablanca",
        "Sunset Boulevard", "Citizen Kane", "The Seventh Seal",
        "Mank", "Cold War", "Frances Ha", "C'mon C'mon"
    ]
};

// Verified direct-image fallback list (used if offline/no key)
const FALLBACK_MOVIES = {
    yellow: [
        { title: "The Grand Budapest Hotel", year: "2014", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/a/a6/The_Grand_Budapest_Hotel_poster.JPG" },
        { title: "Amélie", year: "2001", rating: "8.3", poster: "https://upload.wikimedia.org/wikipedia/en/5/53/Amelie_poster.jpg" },
        { title: "Fantastic Mr. Fox", year: "2009", rating: "7.9", poster: "https://upload.wikimedia.org/wikipedia/en/a/af/Fantastic_mr_fox.jpg" },
        { title: "Little Miss Sunshine", year: "2006", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/6/6a/Little_miss_sunshine_poster.jpg" },
        { title: "Moonrise Kingdom", year: "2012", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/4/4f/Moonrise_Kingdom_poster.jpg" }
    ],
    orange: [
        { title: "Mad Max: Fury Road", year: "2015", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg" },
        { title: "Dune", year: "2021", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg" },
        { title: "Sicario", year: "2015", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/4/4b/Sicario_poster.jpg" },
        { title: "Blade Runner 2049", year: "2017", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png" },
        { title: "The Martian", year: "2015", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/c/cd/The_Martian_film_poster.jpg" }
    ],
    red: [
        { title: "Her", year: "2013", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/4/44/Her2013Poster.jpg" },
        { title: "In the Mood for Love", year: "2000", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/4/45/In_the_Mood_for_Love_poster.jpg" },
        { title: "Suspiria", year: "1977", rating: "7.4", poster: "https://upload.wikimedia.org/wikipedia/en/3/30/Suspiria_%281977%29_poster.jpg" },
        { title: "Drive", year: "2011", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/1/13/Drive2011Poster.jpg" },
        { title: "Black Swan", year: "2010", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/7/7b/Black_Swan_poster.png" }
    ],
    purple: [
        { title: "Blade Runner 2049", year: "2017", rating: "8.0", poster: "https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png" },
        { title: "Drive", year: "2011", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/1/13/Drive2011Poster.jpg" },
        { title: "Only God Forgives", year: "2013", rating: "5.7", poster: "https://upload.wikimedia.org/wikipedia/en/b/ba/Only_God_Forgives_Poster.jpg" },
        { title: "Spider-Man: Into the Spider-Verse", year: "2018", rating: "8.4", poster: "https://upload.wikimedia.org/wikipedia/en/f/fa/Spider-Man_Into_the_Spider-Verse_poster.png" },
        { title: "Mandy", year: "2018", rating: "6.5", poster: "https://upload.wikimedia.org/wikipedia/en/e/e0/Mandy_2018_poster.png" }
    ],
    blue: [
        { title: "The Social Network", year: "2010", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_poster.png" },
        { title: "Minority Report", year: "2002", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/4/44/Minority_Report_Poster.jpg" },
        { title: "Ex Machina", year: "2014", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/b/ba/Ex-machina-uk-poster.jpg" },
        { title: "Arrival", year: "2016", rating: "7.9", poster: "https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg" },
        { title: "Tron: Legacy", year: "2010", rating: "6.8", poster: "https://upload.wikimedia.org/wikipedia/en/c/c2/Tron_Legacy_poster.jpg" }
    ],
    green: [
        { title: "The Matrix", year: "1999", rating: "8.7", poster: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg" },
        { title: "Annihilation", year: "2018", rating: "6.8", poster: "https://upload.wikimedia.org/wikipedia/en/f/f6/Annihilation_%28film%29.png" },
        { title: "Parasite", year: "2019", rating: "8.5", poster: "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png" },
        { title: "The Green Knight", year: "2021", rating: "6.6", poster: "https://upload.wikimedia.org/wikipedia/en/5/51/The_Green_Knight_poster.jpeg" },
        { title: "Alien", year: "1979", rating: "8.5", poster: "https://upload.wikimedia.org/wikipedia/en/c/c3/Alien_movie_poster.jpg" }
    ],
    grey: [
        { title: "Prisoners", year: "2013", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/6/63/Prisoners2013Poster.jpg" },
        { title: "The Batman", year: "2022", rating: "7.8", poster: "https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg" },
        { title: "Zodiac", year: "2007", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/3/3a/Zodiac2007Poster.jpg" },
        { title: "The Road", year: "2009", rating: "7.2", poster: "https://upload.wikimedia.org/wikipedia/en/3/37/The_Road_Poster.jpg" },
        { title: "The Banshees of Inisherin", year: "2022", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/8/87/The_Banshees_of_Inisherin_poster.jpg" }
    ],
    blackWhite: [
        { title: "The Lighthouse", year: "2019", rating: "7.4", poster: "https://upload.wikimedia.org/wikipedia/en/1/11/The_Lighthouse_%282019%29_poster.png" },
        { title: "La Haine", year: "1995", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/d/d4/La_haine.jpg" },
        { title: "Roma", year: "2018", rating: "7.7", poster: "https://upload.wikimedia.org/wikipedia/en/7/77/Roma_%282018_film%29_poster.png" },
        { title: "Raging Bull", year: "1980", rating: "8.1", poster: "https://upload.wikimedia.org/wikipedia/en/5/5f/Raging_Bull_poster.jpg" },
        { title: "Schindler's List", year: "1993", rating: "9.0", poster: "https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie_poster.jpg" }
    ]
};

/**
 * Fetches a single movie by title from OMDb.
 */
async function fetchMovieByTitle(title) {
    try {
        const url = `${BASE_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        if (data.Response === "False") return null;

        return {
            title: data.Title,
            year: data.Year,
            poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
            rating: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : "N/A"
        };
    } catch (err) {
        return null;
    }
}

/**
 * Returns 5 randomized movie recommendations from the pool.
 */
export async function getMoviesForColor(colorKey) {
    const pool = COLOR_FILM_POOLS[colorKey] || [];

    // 1. Randomly slice 5 titles out of the 20 available
    const selectedTitles = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);

    // 2. Fetch live data for those 5 selected titles
    if (OMDB_API_KEY && OMDB_API_KEY !== "YOUR_OMDB_KEY_HERE") {
        const moviePromises = selectedTitles.map(title => fetchMovieByTitle(title));
        const results = await Promise.all(moviePromises);
        const validMovies = results.filter(movie => movie && movie.poster);

        if (validMovies.length >= 4) {
            return validMovies;
        }
    }

    // 3. Fallback list
    const fallbackList = FALLBACK_MOVIES[colorKey] || [];
    return [...fallbackList].sort(() => Math.random() - 0.5).slice(0, 5);
}