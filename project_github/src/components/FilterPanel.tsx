import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface FilterValues {
  region: string;
  metro: string;
  ibx: string;
  product: string;
  customerName: string;
  lagGroupId: string;
  showWithConnections: boolean;
}

interface FilterPanelProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onReset: () => void;
  regions: string[];
  metros: string[];
  ibxs: string[];
  products: string[];
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  regions,
  metros,
  ibxs,
  products,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = (key: keyof FilterValues, value: string | boolean) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== false && value !== 'ALL'
  );

  return (
    <div className="bg-gray-50 border border-gray-200 rounded">
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
              Active
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-6 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
              <select
                value={filters.region}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Metro</label>
              <select
                value={filters.metro}
                onChange={(e) => updateFilter('metro', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {metros.map((metro) => (
                  <option key={metro} value={metro}>
                    {metro}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">IBX</label>
              <select
                value={filters.ibx}
                onChange={(e) => updateFilter('ibx', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {ibxs.map((ibx) => (
                  <option key={ibx} value={ibx}>
                    {ibx}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select
                value={filters.product}
                onChange={(e) => updateFilter('product', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => updateFilter('customerName', e.target.value)}
                placeholder="Search customer"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LAG Group ID</label>
              <input
                type="text"
                value={filters.lagGroupId}
                onChange={(e) => updateFilter('lagGroupId', e.target.value)}
                placeholder="Enter LAG ID"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showWithConnections}
                onChange={(e) => updateFilter('showWithConnections', e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">Show Ports With Connections</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
