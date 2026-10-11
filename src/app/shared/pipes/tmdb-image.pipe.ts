import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

export type TmdbImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

/** Turns a TMDb image path (e.g. `/abc.jpg`) into a full URL, or null when there is no image. */
@Pipe({ name: 'tmdbImage' })
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null | undefined, size: TmdbImageSize = 'w342'): string | null {
    return path ? `${environment.tmdb.imageUrl}/${size}${path}` : null;
  }
}
