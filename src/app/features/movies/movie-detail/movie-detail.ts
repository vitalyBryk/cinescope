import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image.pipe';

@Component({
  selector: 'app-movie-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, TmdbImagePipe],
  templateUrl: './movie-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetail {
  private readonly movieService = inject(MovieService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  /** `:id` route param, bound via withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly movieId = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) && id > 0 ? id : null;
  });
  protected readonly isValidId = computed(() => this.movieId() !== null);

  // Ignore a previously opened movie still held by the service until the new one loads
  protected readonly movie = computed(() => {
    const movie = this.movieService.movieDetails();
    return movie?.id === this.movieId() ? movie : null;
  });
  protected readonly error = computed(() =>
    this.movieId() === null ? 'Фильм не найден.' : this.movieService.detailsError(),
  );

  protected readonly year = computed(() => this.movie()?.release_date?.slice(0, 4) || null);
  protected readonly runtime = computed(() => {
    const minutes = this.movie()?.runtime;
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} ч ${m} мин` : `${m} мин`;
  });

  constructor() {
    effect(() => {
      const id = this.movieId();
      if (id !== null) {
        this.movieService.getMovieDetails(id);
      }
    });

    effect(() => {
      const title = this.movie()?.title;
      if (title) {
        this.title.setTitle(`${title} — Cinescope`);
      }
    });
  }

  protected goBack(): void {
    // Angular stores a navigationId in history state; 1 means this page was opened directly
    const state = this.location.getState() as { navigationId?: number } | null;
    if ((state?.navigationId ?? 1) > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  protected retry(): void {
    const id = this.movieId();
    if (id !== null) {
      this.movieService.getMovieDetails(id);
    }
  }
}
