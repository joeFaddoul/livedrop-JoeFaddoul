import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { SearchBar } from './search-bar';
const meta = {
    title: 'Molecules/SearchBar',
    component: SearchBar,
    render: (args) => {
        const [query, setQuery] = useState(args.query);
        const [tag, setTag] = useState(args.selectedTag);
        const [sort, setSort] = useState(args.sort);
        return (_jsx(SearchBar, { ...args, query: query, selectedTag: tag, sort: sort, onQueryChange: setQuery, onTagChange: setTag, onSortChange: setSort }));
    },
    args: {
        query: '',
        selectedTag: 'all',
        sort: 'price-asc',
        tags: ['audio', 'wearables', 'workspace'],
    },
};
export default meta;
export const Default = {};
