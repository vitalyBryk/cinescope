import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDetails, PaginatedResponse } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.tmdb.apiUrl;

  // Movie list state (popular movies or search results)
  private readonly moviesState = signal<Movie[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly queryState = signal('');

  // Movie details state
  private readonly movieDetailsState = signal<MovieDetails | null>(null);
  private readonly detailsLoadingState = signal(false);
  private readonly detailsErrorState = signal<string | null>(null);

  readonly movies = this.moviesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** Current search query; empty string means the popular list is shown. */
  readonly query = this.queryState.asReadonly();
  readonly isEmpty = computed(
    () => !this.loadingState() && !this.errorState() && this.moviesState().length === 0,
  );

  readonly movieDetails = this.movieDetailsState.asReadonly();
  readonly detailsLoading = this.detailsLoadingState.asReadonly();
  readonly detailsError = this.detailsErrorState.asReadonly();

  // Kept so a newer request cancels a still-pending older one
  private listRequest?: Subscription;
  private detailsRequest?: Subscription;

  getPopularMovies(): void {
    this.queryState.set('');
    this.loadList(this.http.get<PaginatedResponse<Movie>>(`${this.apiUrl}/movie/popular`));
  }

  searchMovies(keyword: string): void {
    const query = keyword.trim();
    if (!query) {
      this.getPopularMovies();
      return;
    }

    this.queryState.set(query);
    this.loadList(
      this.http.get<PaginatedResponse<Movie>>(`${this.apiUrl}/search/movie`, {
        params: { query, include_adult: false },
      }),
    );
  }

  getMovieDetails(id: number): void {
    this.detailsRequest?.unsubscribe();
    this.movieDetailsState.set(null);
    this.detailsLoadingState.set(true);
    this.detailsErrorState.set(null);

    this.detailsRequest = this.http.get<MovieDetails>(`${this.apiUrl}/movie/${id}`).subscribe({
      next: (details) => {
        this.movieDetailsState.set(details);
        this.detailsLoadingState.set(false);
      },
      error: (err: unknown) => {
        this.detailsErrorState.set(toErrorMessage(err));
        this.detailsLoadingState.set(false);
      },
    });
  }

  private loadList(request$: Observable<PaginatedResponse<Movie>>): void {
    this.listRequest?.unsubscribe();
    this.loadingState.set(true);
    this.errorState.set(null);

    this.listRequest = request$.subscribe({
      next: (response) => {
        this.moviesState.set(response.results);
        this.loadingState.set(false);
      },
      error: (err: unknown) => {
        this.moviesState.set([]);
        this.errorState.set(toErrorMessage(err));
        this.loadingState.set(false);
      },
    });
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    switch (err.status) {
      case 0:
        return 'Нет соединения с сервером. Проверьте подключение к интернету.';
      case 401:
        return 'Неверный API-ключ TMDb. Укажите ключ в src/environments/environment.ts.';
      case 404:
        return 'Фильм не найден.';
      case 429:
        return 'Слишком много запросов. Попробуйте чуть позже.';
    }
  }
  return 'Не удалось загрузить данные. Попробуйте ещё раз.';
}
