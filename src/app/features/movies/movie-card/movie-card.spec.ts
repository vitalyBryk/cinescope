import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { MovieCard } from './movie-card';

const movie: Movie = {
  id: 603,
  title: 'Матрица',
  original_title: 'The Matrix',
  overview: 'Хакер Нео узнаёт правду о реальности.',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  release_date: '1999-03-31',
  vote_average: 8.2,
  vote_count: 25000,
  genre_ids: [28, 878],
};

function render(value: Movie): HTMLElement {
  TestBed.configureTestingModule({ imports: [MovieCard], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(MovieCard);
  fixture.componentRef.setInput('movie', value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('MovieCard', () => {
  it('renders poster, title, year, rating and overview', () => {
    const el = render(movie);

    expect(el.querySelector('h2')?.textContent).toContain('Матрица');
    expect(el.textContent).toContain('1999');
    expect(el.textContent).toContain('8.2');
    expect(el.textContent).toContain('Хакер Нео');
    expect(el.querySelector('img')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w342/poster.jpg',
    );
  });

  it('links to the details page', () => {
    const el = render(movie);
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/movie/603');
  });

  it('shows fallbacks when poster and overview are missing', () => {
    const el = render({ ...movie, poster_path: null, overview: '' });

    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('Нет постера');
    expect(el.textContent).toContain('Описание отсутствует.');
  });
});
