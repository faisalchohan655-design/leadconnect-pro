const FilterBar = ({ filters, onFilterChange, showSource = true }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min Rating</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => onFilterChange('minRating', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm">{filters.minRating}★</span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">City</label>
          <input
            type="text"
            placeholder="e.g., Karachi"
            value={filters.city}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search by name</label>
          <input
            type="text"
            placeholder="Business name"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        {showSource && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Lead Source</label>
            <select
              value={filters.source}
              onChange={(e) => onFilterChange('source', e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="all">All</option>
              <option value="google">Google Maps</option>
              <option value="facebook">Facebook</option>
              <option value="email_extracted">Email Extractor</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
export default FilterBar;
