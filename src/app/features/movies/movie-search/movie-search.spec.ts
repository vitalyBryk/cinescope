import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { MovieService } from '../../../core/services/movie.service';
import { MovieSearch } from './movie-search';

const { apiUrl } = environment.tmdb;
const searchUrl = `${apiUrl}/search/movie`;
const popularUrl = `${apiUrl}/movie/popular`;
const emptyPage = { page: 1, results: [], total_pages: 1, total_results: 0 };

describe('MovieSearch', () => {
  let fixture: ComponentFixture<MovieSearch>;
  let http: HttpTestingController;
  let service: MovieService;
  let input: HTMLInputElement;

  function type(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [MovieSearch],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(MovieService);
    fixture = TestBed.createComponent(MovieSearch);
    fixture.detectChanges();
    input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('searches after the user stops typing', () => {
    type('Мат');
    vi.advanceTimersByTime(200);
    type('Матрица');
    vi.advanceTimersByTime(399);
    http.expectNone(() => true);

    vi.advanceTimersByTime(1);
    const req = http.expectOne((r) => r.url === searchUrl);
    expect(req.request.params.get('query')).toBe('Матрица');
    req.flush(emptyPage);
  });

  it('searches immediately on submit and does not repeat it after the debounce', () => {
    type('Дюна');
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')!
      .dispatchEvent(new Event('submit'));

    http.expectOne((r) => r.url === searchUrl).flush(emptyPage);
    vi.advanceTimersByTime(400);
    http.expectNone(() => true);
    expect(service.query()).toBe('Дюна');
  });

  it('returns to popular movies when the field is cleared', () => {
    type('Дюна');
    vi.advanceTimersByTime(400);
    http.expectOne((r) => r.url === searchUrl).flush(emptyPage);

    type('');
    vi.advanceTimersByTime(400);
    http.expectOne(popularUrl).flush(emptyPage);
    expect(service.query()).toBe('');
  });

  it('clear button resets the field and loads popular movies right away', () => {
    type('Дюна');
    vi.advanceTimersByTime(400);
    http.expectOne((r) => r.url === searchUrl).flush(emptyPage);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[aria-label="Очистить поиск"]')!
      .click();
    fixture.detectChanges();

    expect(input.value).toBe('');
    http.expectOne(popularUrl).flush(emptyPage);
  });
});
