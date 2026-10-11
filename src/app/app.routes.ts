import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Cinescope — популярные фильмы',
    loadComponent: () =>
      import('./features/movies/movie-list/movie-list').then((m) => m.MovieList),
  },
];
