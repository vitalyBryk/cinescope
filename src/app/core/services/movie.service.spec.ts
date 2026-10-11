import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { tmdbInterceptor } from '../interceptors/tmdb.interceptor';
import { Movie, MovieDetails, PaginatedResponse } from '../models/movie.model';
import { MovieService } from './movie.service';

const { apiUrl, apiKey, language } = environment.tmdb;

function movie(id: number, title = `Movie ${id}`): Movie {
  return {
    id,
    title,
    original_title: title,
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 7.5,
    vote_count: 100,
    genre_ids: [],
  };
}

function page(results: Movie[]): PaginatedResponse<Movie> {
  return { page: 1, results, total_pages: 1, total_results: results.length };
}

describe('MovieService', () => {
  let service: MovieService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tmdbInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads popular movies with api key and language', () => {
    service.getPopularMovies();
    expect(service.loading()).toBe(true);

    const req = http.expectOne((r) => r.url === `${apiUrl}/movie/popular`);
    expect(req.request.params.get('api_key')).toBe(apiKey);
    expect(req.request.params.get('language')).toBe(language);
    req.flush(page([movie(1), movie(2)]));

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.movies().map((m) => m.id)).toEqual([1, 2]);
  });

  it('searches movies by trimmed keyword', () => {
    service.searchMovies('  Матрица ');

    const req = http.expectOne((r) => r.url === `${apiUrl}/search/movie`);
    expect(req.request.params.get('query')).toBe('Матрица');
    req.flush(page([movie(603, 'Матрица')]));

    expect(service.query()).toBe('Матрица');
    expect(service.movies()[0].title).toBe('Матрица');
  });

  it('falls back to popular movies for an empty keyword', () => {
    service.searchMovies('   ');

    http.expectOne((r) => r.url === `${apiUrl}/movie/popular`).flush(page([]));
    expect(service.query()).toBe('');
    expect(service.isEmpty()).toBe(true);
  });

  it('cancels a pending list request when a new one starts', () => {
    service.searchMovies('a');
    service.searchMovies('ab');

    const [first, second] = http.match((r) => r.url === `${apiUrl}/search/movie`);
    expect(first.cancelled).toBe(true);
    second.flush(page([movie(3)]));

    expect(service.movies().map((m) => m.id)).toEqual([3]);
  });

  it('keeps working after a failed request', () => {
    service.getPopularMovies();
    http
      .expectOne((r) => r.url === `${apiUrl}/movie/popular`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(service.error()).not.toBeNull();

    service.searchMovies('Дюна');
    http.expectOne((r) => r.url === `${apiUrl}/search/movie`).flush(page([movie(438631)]));

    expect(service.error()).toBeNull();
    expect(service.movies().map((m) => m.id)).toEqual([438631]);
  });

  it('exposes a readable error and clears movies on failure', () => {
    service.getPopularMovies();
    http
      .expectOne((r) => r.url === `${apiUrl}/movie/popular`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.loading()).toBe(false);
    expect(service.movies()).toEqual([]);
    expect(service.error()).toContain('API-ключ');
    expect(service.isEmpty()).toBe(false);
  });

  it('loads movie details', () => {
    const details: MovieDetails = {
      ...movie(603, 'Матрица'),
      genres: [{ id: 28, name: 'боевик' }],
      runtime: 136,
      tagline: '',
      status: 'Released',
    };

    service.getMovieDetails(603);
    expect(service.detailsLoading()).toBe(true);

    http.expectOne((r) => r.url === `${apiUrl}/movie/603`).flush(details);

    expect(service.detailsLoading()).toBe(false);
    expect(service.movieDetails()?.genres[0].name).toBe('боевик');
  });

  it('cancels a pending details request when another movie is opened', () => {
    service.getMovieDetails(603);
    service.getMovieDetails(438631);

    expect(http.expectOne((r) => r.url === `${apiUrl}/movie/603`).cancelled).toBe(true);
    http
      .expectOne((r) => r.url === `${apiUrl}/movie/438631`)
      .flush({ ...movie(438631), genres: [], runtime: null, tagline: '', status: '' });

    expect(service.movieDetails()?.id).toBe(438631);
  });

  it('reports a missing movie', () => {
    service.getMovieDetails(999);
    http
      .expectOne((r) => r.url === `${apiUrl}/movie/999`)
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(service.movieDetails()).toBeNull();
    expect(service.detailsError()).toBe('Фильм не найден.');
  });
});
