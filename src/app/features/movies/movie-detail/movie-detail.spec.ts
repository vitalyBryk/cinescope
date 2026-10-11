import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { MovieDetails } from '../../../core/models/movie.model';
import { MovieDetail } from './movie-detail';

@Component({ template: 'home' })
class Home {}

const details: MovieDetails = {
  id: 603,
  title: 'Матрица',
  original_title: 'The Matrix',
  overview: 'Хакер Нео узнаёт правду о реальности.',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  release_date: '1999-03-31',
  vote_average: 8.2,
  vote_count: 25000,
  genres: [
    { id: 28, name: 'боевик' },
    { id: 878, name: 'фантастика' },
  ],
  runtime: 136,
  tagline: 'Добро пожаловать в реальный мир',
  status: 'Released',
};

const detailsUrl = (id: number) => `${environment.tmdb.apiUrl}/movie/${id}`;

describe('MovieDetail', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: '', component: Home },
            { path: 'movie/:id', component: MovieDetail },
          ],
          withComponentInputBinding(),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('loads the movie from the route id and renders its details', async () => {
    await harness.navigateByUrl('/movie/603', MovieDetail);
    expect(harness.routeNativeElement?.querySelector('[aria-busy="true"]')).not.toBeNull();

    http.expectOne(detailsUrl(603)).flush(details);
    harness.detectChanges();
    const el = harness.routeNativeElement!;

    expect(el.querySelector('h1')?.textContent).toContain('Матрица');
    expect(el.textContent).toContain('The Matrix');
    expect(el.textContent).toContain('8.2');
    expect(el.textContent).toContain('2 ч 16 мин');
    expect(el.textContent).toContain('Хакер Нео');
    expect([...el.querySelectorAll('[aria-label="Жанры"] li')].map((li) => li.textContent?.trim())).toEqual(
      ['боевик', 'фантастика'],
    );
    expect(el.querySelector('img')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg',
    );
  });

  it('shows an error for a missing movie', async () => {
    await harness.navigateByUrl('/movie/999', MovieDetail);
    http.expectOne(detailsUrl(999)).flush(null, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(
      'Фильм не найден.',
    );
  });

  it('does not call the API for an invalid id', async () => {
    await harness.navigateByUrl('/movie/abc', MovieDetail);

    http.expectNone(() => true);
    expect(harness.routeNativeElement?.textContent).toContain('Фильм не найден.');
  });

  it('"Назад" goes to the home page when the movie was opened directly', async () => {
    await harness.navigateByUrl('/movie/603', MovieDetail);
    http.expectOne(detailsUrl(603)).flush(details);

    // Simulate a fresh page load (first navigation in the history)
    vi.spyOn(TestBed.inject(Location), 'getState').mockReturnValue({ navigationId: 1 });
    harness.routeNativeElement!.querySelector('button')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Location).path()).toBe('');
  });
});
