import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, Subject, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDetails, PaginatedResponse } from '../models/movie.model';

type Result<T> = { data: T; error: null } | { data: null; error: string };

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.tmdb.apiUrl;

  private readonly moviesState = signal<Movie[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly queryState = signal('');

  private readonly movieDetailsState = signal<MovieDetails | null>(null);
  private readonly detailsLoadingState = signal(false);
  private readonly detailsErrorState = signal<string | null>(null);

  readonly movies = this.moviesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly query = this.queryState.asReadonly();
  readonly isEmpty = computed(
    () => !this.loadingState() && !this.errorState() && this.moviesState().length === 0,
  );

  readonly movieDetails = this.movieDetailsState.asReadonly();
  readonly detailsLoading = this.detailsLoadingState.asReadonly();
  readonly detailsError = this.detailsErrorState.asReadonly();

  private readonly listRequests$ = new Subject<Observable<PaginatedResponse<Movie>>>();
  private readonly detailsRequests$ = new Subject<number>();

  constructor() {
    this.listRequests$
      .pipe(
        switchMap((request$) => toResult(request$.pipe(map((response) => response.results)))),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.moviesState.set(result.data ?? []);
        this.errorState.set(result.error);
        this.loadingState.set(false);
      });

    this.detailsRequests$
      .pipe(
        switchMap((id) => toResult(this.http.get<MovieDetails>(`${this.apiUrl}/movie/${id}`))),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.movieDetailsState.set(result.data);
        this.detailsErrorState.set(result.error);
        this.detailsLoadingState.set(false);
      });
  }

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
    this.movieDetailsState.set(null);
    this.detailsLoadingState.set(true);
    this.detailsErrorState.set(null);
    this.detailsRequests$.next(id);
  }

  private loadList(request$: Observable<PaginatedResponse<Movie>>): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.listRequests$.next(request$);
  }
}

/** Turns an HTTP error into a value, so one failed request does not end the whole stream. */
function toResult<T>(request$: Observable<T>): Observable<Result<T>> {
  return request$.pipe(
    map((data): Result<T> => ({ data, error: null })),
    catchError((err: unknown) => of<Result<T>>({ data: null, error: toErrorMessage(err) })),
  );
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
