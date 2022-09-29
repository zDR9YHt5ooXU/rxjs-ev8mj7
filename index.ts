import './style.css';

import { of, map, Observable, defer, switchMap, shareReplay } from 'rxjs';

of('World')
  .pipe(map((name) => `Hello, ${name}!`))
  .subscribe(console.log);

// Open the console in the bottom right to see results.

interface Dataset {
  score: number;
}

const Scores: Record<string, number> = {
  team1: 100,
  team2: 60,
};

const getObservable = (team: Observable<string>): Observable<Dataset> => {
  const obsCache: Record<string, Observable<Dataset>> = {};
  return team.pipe(
    switchMap((teamName) => {
      let cache = obsCache[teamName];
      if (cache) {
        return cache;
      }
      cache = obsCache[teamName] = defer(() => of(Scores[teamName])).pipe(
        map((score) => {
          return { score };
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      return cache;
    })
  );
};

const getObservableCacheInput = (
  team: Observable<string>
): Observable<Dataset> => {
  const obsCache: Map<Observable<string>, Observable<Dataset>> = new Map();
  let cache = obsCache.get(team);
  if (cache) {
    return cache;
  }
  cache = team.pipe(
    switchMap((teamName) => {
      return defer(() => of(Scores[teamName])).pipe(
        map((score) => {
          return { score };
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  obsCache.set(team, cache);
  return cache;
};
