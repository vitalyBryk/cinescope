/** Field names mirror the TMDb API response (snake_case). */

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  status: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
