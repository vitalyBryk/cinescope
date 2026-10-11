import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MovieService } from '../../../core/services/movie.service';
import { MovieCard } from '../movie-card/movie-card';

type ViewState = 'loading' | 'error' | 'empty' | 'ready';

@Component({
  selector: 'app-movie-list',
  imports: [MovieCard],
  templateUrl: './movie-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieList implements OnInit {
  private readonly movieService = inject(MovieService);

  protected readonly movies = this.movieService.movies;
  protected readonly error = this.movieService.error;
  protected readonly query = this.movieService.query;
  protected readonly skeletons = Array.from({ length: 10 }, (_, i) => i);

  protected readonly viewState = computed<ViewState>(() => {
    if (this.movieService.loading()) return 'loading';
    if (this.error()) return 'error';
    if (this.movieService.isEmpty()) return 'empty';
    return 'ready';
  });

  ngOnInit(): void {
    // Keep the current list (e.g. search results) when coming back from a details page
    if (this.movies().length === 0 && !this.movieService.loading()) {
      this.movieService.getPopularMovies();
    }
  }

  protected retry(): void {
    this.movieService.searchMovies(this.query());
  }
}
