import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Movie } from '../../../core/models/movie.model';
import { MovieList } from './movie-list';

const popularUrl = `${environment.tmdb.apiUrl}/movie/popular`;

function movie(id: number): Movie {
  return {
    id,
    title: `Фильм ${id}`,
    original_title: `Movie ${id}`,
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 7,
    vote_count: 10,
    genre_ids: [],
  };
}

describe('MovieList', () => {
  let fixture: ComponentFixture<MovieList>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MovieList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MovieList);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows skeletons while loading, then the movie cards', () => {
    expect(el.querySelector('[aria-busy="true"]')).not.toBeNull();

    http.expectOne(popularUrl).flush({ page: 1, results: [movie(1), movie(2)] });
    fixture.detectChanges();

    expect(el.querySelector('h1')?.textContent).toContain('Популярные фильмы');
    expect(el.querySelectorAll('app-movie-card').length).toBe(2);
  });

  it('shows an error with a retry button that reloads the list', () => {
    http.expectOne(popularUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Не удалось загрузить');

    el.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    http.expectOne(popularUrl).flush({ page: 1, results: [movie(1)] });
    fixture.detectChanges();

    expect(el.querySelectorAll('app-movie-card').length).toBe(1);
  });

  it('shows an empty-state message when there are no movies', () => {
    http.expectOne(popularUrl).flush({ page: 1, results: [] });
    fixture.detectChanges();

    expect(el.textContent).toContain('Фильмы не найдены.');
  });
});
