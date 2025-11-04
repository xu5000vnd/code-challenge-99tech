import { useState, useEffect } from 'react';
import { UserQueryParams } from '../../types';

interface UserFiltersProps {
  filters: UserQueryParams;
  onFilterChange: (filters: UserQueryParams) => void;
  autoApply?: boolean;
}

export default function UserFilters({ 
  filters, 
  onFilterChange,
  autoApply = true 
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<UserQueryParams>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Auto-apply filters with debounce
  useEffect(() => {
    if (!autoApply) return;

    const timeoutId = setTimeout(() => {
      const trimmedFilters = {
        ...localFilters,
        search: localFilters.search?.trim(),
        page: 1,
      };
      
      // Only trigger if filters actually changed
      if (JSON.stringify(trimmedFilters) !== JSON.stringify(filters)) {
        onFilterChange(trimmedFilters);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [localFilters.search, localFilters.limit, autoApply, onFilterChange, filters, localFilters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trim search term before submitting
    const trimmedFilters = {
      ...localFilters,
      search: localFilters.search?.trim(),
      page: 1, // Reset to page 1 when filtering
    };
    onFilterChange(trimmedFilters);
  };

  const handleReset = () => {
    const resetFilters: UserQueryParams = {
      search: '',
      page: 1,
      limit: filters.limit || 10,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = localFilters.search;

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Search Filter */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={localFilters.search || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, search: e.target.value })
              }
              placeholder="Search by name or email..."
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Search in both name and email fields
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!autoApply && (
          <div className="mt-4 flex justify-end space-x-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        )}
        
        {autoApply && hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

