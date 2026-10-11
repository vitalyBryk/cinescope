import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image.pipe';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink, DecimalPipe, TmdbImagePipe],
  templateUrl: './movie-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCard {
  readonly movie = input.required<Movie>();

  protected readonly year = computed(() => this.movie().release_date?.slice(0, 4) || null);
  protected readonly hasRating = computed(() => this.movie().vote_count > 0);
  protected readonly ratingClass = computed(() => {
    const rating = this.movie().vote_average;
    if (rating >= 7) return 'bg-emerald-500 text-emerald-950';
    if (rating >= 5) return 'bg-amber-400 text-amber-950';
    return 'bg-rose-500 text-rose-50';
  });
}
