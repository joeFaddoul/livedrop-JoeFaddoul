import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBar } from './search-bar';

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  render: (args) => {
    const [query, setQuery] = useState(args.query);
    const [tag, setTag] = useState(args.selectedTag);
    const [sort, setSort] = useState<'price-asc' | 'price-desc'>(args.sort);
    return (
      <SearchBar
        {...args}
        query={query}
        selectedTag={tag}
        sort={sort}
        onQueryChange={setQuery}
        onTagChange={setTag}
        onSortChange={setSort}
      />
    );
  },
  args: {
    query: '',
    selectedTag: 'all',
    sort: 'price-asc',
    tags: ['audio', 'wearables', 'workspace'],
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};
