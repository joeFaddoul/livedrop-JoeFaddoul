import clsx from 'clsx';
import { TextInput } from '../atoms/text-input';

export type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  sort: 'price-asc' | 'price-desc';
  onSortChange: (sort: 'price-asc' | 'price-desc') => void;
  tags: string[];
};

export function SearchBar({
  query,
  onQueryChange,
  selectedTag,
  onTagChange,
  sort,
  onSortChange,
  tags,
}: SearchBarProps) {
  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 lg:flex-row lg:items-end"
      role="search"
      aria-label="Product filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex-1">
        <TextInput
          label="Search"
          placeholder="Search by product name or tag"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          hint="We search catalog titles and tags."
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col text-sm font-semibold text-slate-200">
          Tag
          <select
            value={selectedTag}
            onChange={(event) => onTagChange(event.target.value)}
            className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base text-slate-100 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <option value="all">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col text-sm font-semibold text-slate-200">
          Sort
          <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => onSortChange('price-asc')}
              aria-label="Sort price low to high"
              aria-pressed={sort === 'price-asc'}
              className={clsx(
                'flex-1 px-4 py-2 text-base transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                sort === 'price-asc' ? 'bg-brand text-slate-900' : 'bg-slate-900 text-slate-100',
              )}
            >
              Price ↑
            </button>
            <button
              type="button"
              onClick={() => onSortChange('price-desc')}
              aria-label="Sort price high to low"
              aria-pressed={sort === 'price-desc'}
              className={clsx(
                'flex-1 px-4 py-2 text-base transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                sort === 'price-desc' ? 'bg-brand text-slate-900' : 'bg-slate-900 text-slate-100',
              )}
            >
              Price ↓
            </button>
          </div>
        </label>
      </div>
    </form>
  );
}
