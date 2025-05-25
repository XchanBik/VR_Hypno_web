// --- Types et helpers navigation ---
export type NavigationLeaf<Option = undefined> = { __navOption?: Option }
const leaf = <T = undefined>() => ({ __navOption: undefined as unknown as T }) as NavigationLeaf<T>

export type SessionEditOption = { uid: string; name: string }
export type SongEditOption = { uid: string }
export type AssetEditOption = { uid: string }
export type PlaylistUidOption = { uid: string }

export const navigationTree = {
  player: {
    playlist: {
      list: leaf(), // pas d'option
      edit: leaf<PlaylistUidOption>(),
      player: leaf<PlaylistUidOption>(),
    }
  },
  editor: {
    sessions: {
      list: leaf(),
      edit: leaf<SessionEditOption>(),
    },
    songs: {
      list: leaf(),
      edit: leaf<SongEditOption>(),
    },
    assets: {
      list: leaf(),
      edit: leaf<AssetEditOption>(),
    }
  }
} as const;

type Tree = typeof navigationTree;

type Path<T, Prev extends string[] = []> =
  T extends NavigationLeaf<any>
    ? Prev
    : T extends object
      ? { [K in keyof T]: Path<T[K], [...Prev, K & string]> }[keyof T]
      : never;

export type NavigationPath = Path<Tree>;

// Type qui transforme l'arbre en chemins de navigation
// et donne le type d'option pour chaque chemin
export type OptionForPath<T> = T extends NavigationLeaf<infer O> ? O : undefined;

type NavigationHelper<T> = {
  [K in keyof T]: T[K] extends NavigationLeaf<any>
    ? readonly [...Path<Tree, []>]
    : T[K] extends object
      ? NavigationHelper<T[K]>
      : never
};

export const nav = {} as NavigationHelper<Tree>;

function buildNavPaths<T extends object>(tree: T, target: any = nav, path: string[] = []): void {
  for (const key in tree) {
    const currentPath = [...path, key];
    if (tree[key] && typeof tree[key] === 'object' && '__navOption' in tree[key]) {
      target[key] = currentPath as readonly string[];
    } else if (tree[key] && typeof tree[key] === 'object') {
      target[key] = {};
      buildNavPaths(tree[key], target[key], currentPath);
    }
  }
}
buildNavPaths(navigationTree); 