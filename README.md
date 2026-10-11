# Cinescope

Test assignment for Hot Software: an Angular app that lists and searches movies using the [TMDb API](https://developer.themoviedb.org/docs). The interface and movie data are in Russian.

## Features

- **Popular movies.** The home page shows them as a responsive grid of cards with poster, title, year, rating and a short overview.
- **Live search.** Results update 400 ms after you stop typing. The «Поиск» button or Enter searches immediately. Clearing the field (or pressing «×» or Esc) brings back the popular movies.
- **Movie page** at `/movie/:id`. It shows the poster, title, original title, tagline, genres, rating, release date, runtime and overview. The «Назад» button returns to the list with your search kept.
- **Loading, error and empty states** on every screen, with error messages in Russian and a «Повторить» button.

## Stack

- Angular 21: standalone components, zoneless change detection, `OnPush`
- **Signals** (`signal`, `computed`, `effect`, `input`) for all state
- Built-in control flow: `@if`, `@for`, `@switch`
- Angular Router with lazy-loaded pages and route params bound to component inputs
- Tailwind CSS v4
- Vitest for unit tests

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:4200.

The TMDb key is set in [src/environments/environment.ts](src/environments/environment.ts) (`tmdb.apiKey`). It must be a **v3 API key**. You can get one at https://www.themoviedb.org/settings/api.

| Command | Description |
|---|---|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Production build into `dist/cinescope` |
| `npm test` | Unit tests (watch mode). Add `-- --watch=false` for a single run. |

## Project structure

```
src/app/
├── core/
│   ├── models/movie.model.ts          # TMDb response types
│   ├── interceptors/tmdb.interceptor.ts  # adds api_key and language to TMDb requests
│   └── services/movie.service.ts      # API calls + signal-based state
├── features/movies/
│   ├── movie-list/     # home page: search + grid, @switch over loading/error/empty/ready
│   ├── movie-card/     # a single card linking to /movie/:id
│   ├── movie-search/   # search field with debounced live search
│   └── movie-detail/   # movie page loaded from the :id route param
└── shared/pipes/tmdb-image.pipe.ts    # builds TMDb image URLs
```

### How state works

`MovieService` keeps the state in private signals and exposes them read-only:

- **Movie list:** `movies`, `loading`, `error`, `query` and `isEmpty`
- **Movie page:** `movieDetails`, `detailsLoading` and `detailsError`

Components call `getPopularMovies()`, `searchMovies(keyword)` or `getMovieDetails(id)` and read the signals. A new request cancels a still-pending one, so a late response to an old query never overwrites newer results.

---

Movie data and images are provided by [TMDb](https://www.themoviedb.org). This product uses the TMDb API but is not endorsed or certified by TMDb.
