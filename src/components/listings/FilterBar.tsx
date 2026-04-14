import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CATEGORIES,
  CONDITIONS,
  SORT_OPTIONS,
  type CategoryValue,
  type ConditionValue,
  type SortValue,
} from '@/lib/utils/constants';

export interface FilterState {
  q: string;
  category: CategoryValue | '';
  condition: ConditionValue | '';
  min_price?: number;
  max_price?: number;
  sort: SortValue;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function FilterBar({ onFilterChange, initialFilters }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    category: '',
    condition: '',
    sort: 'newest',
    ...initialFilters,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.q);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.q) {
        const newFilters = { ...filters, q: searchValue };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      q: '',
      category: '',
      condition: '',
      sort: 'newest',
    };
    setFilters(cleared);
    setSearchValue('');
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.q || filters.category || filters.condition || filters.sort !== 'newest' || filters.min_price || filters.max_price;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-listings"
            placeholder="Search for textbooks, electronics, furniture..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Row — always visible on desktop, toggled on mobile */}
      <div
        className={`flex flex-wrap items-center gap-3 ${
          showMobileFilters ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Category */}
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value as CategoryValue | '')}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Condition */}
        <select
          id="filter-condition"
          value={filters.condition}
          onChange={(e) => updateFilter('condition', e.target.value as ConditionValue | '')}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Price Range */}
        <div className="flex items-center gap-1">
          <Input
            id="filter-min-price"
            type="number"
            placeholder="Min ₹"
            className="h-9 w-24"
            value={filters.min_price ?? ''}
            onChange={(e) =>
              updateFilter(
                'min_price',
                e.target.value ? Number(e.target.value) * 100 : undefined
              )
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            id="filter-max-price"
            type="number"
            placeholder="Max ₹"
            className="h-9 w-24"
            value={filters.max_price ?? ''}
            onChange={(e) =>
              updateFilter(
                'max_price',
                e.target.value ? Number(e.target.value) * 100 : undefined
              )
            }
          />
        </div>

        {/* Sort */}
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value as SortValue)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.q && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.q}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchValue(''); updateFilter('q', ''); }} />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.value === filters.category)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('category', '')} />
            </Badge>
          )}
          {filters.condition && (
            <Badge variant="secondary" className="gap-1">
              {CONDITIONS.find((c) => c.value === filters.condition)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('condition', '')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
