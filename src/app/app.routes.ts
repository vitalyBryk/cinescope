import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Cinescope — популярные фильмы',
    loadComponent: () =>
      import('./features/movies/movie-list/movie-list').then((m) => m.MovieList),
  },
  {
    path: 'movie/:id',
    title: 'Cinescope — фильм',
    loadComponent: () =>
      import('./features/movies/movie-detail/movie-detail').then((m) => m.MovieDetail),
  },
  { path: '**', redirectTo: '' },
];
