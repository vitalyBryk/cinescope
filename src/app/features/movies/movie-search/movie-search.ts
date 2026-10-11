import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, map, skip } from 'rxjs';
import { MovieService } from '../../../core/services/movie.service';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSearch {
  private readonly movieService = inject(MovieService);

  // Start from the active query so the field is filled when returning from a details page
  protected readonly term = signal(this.movieService.query());

  constructor() {
    // Live search while typing
    toObservable(this.term)
      .pipe(
        skip(1),
        map((term) => term.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        takeUntilDestroyed(),
      )
      .subscribe((term) => this.search(term));
  }

  protected onInput(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }

  /** "Поиск" button / Enter: search immediately without waiting for the debounce. */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.search(this.term().trim());
  }

  protected clear(): void {
    this.term.set('');
    this.search('');
  }

  private search(term: string): void {
    // Skip if this query is already shown (e.g. the button was pressed before the debounce fired)
    if (term === this.movieService.query() && !this.movieService.error()) {
      return;
    }
    this.movieService.searchMovies(term);
  }
}
