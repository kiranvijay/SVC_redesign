import { useState, useMemo } from 'react';
import { Cloud, Building2, Network, Search, X, Info } from 'lucide-react';
import { VirtualConnection } from '../lib/supabase';

interface VirtualConnectionsTabProps {
  connections: VirtualConnection[];
  svcCapacity: string;
}

type ConnectionGroup = 'all' | 'cloud' | 'datacenter' | 'service';

export default function VirtualConnectionsTab({ connections, svcCapacity }: VirtualConnectionsTabProps) {
  const [selectedGroup, setSelectedGroup] = useState<ConnectionGroup>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const groupedConnections = useMemo(() => {
    const cloud = connections.filter(c => c.access_point_type === 'SP');
    const datacenter = connections.filter(c => c.access_point_type === 'COLO');
    const service = connections.filter(c => c.access_point_type !== 'SP' && c.access_point_type !== 'COLO');

    return {
      cloud,
      datacenter,
      service,
      cloudBandwidth: cloud.reduce((sum, c) => sum + c.bandwidth, 0),
      datacenterBandwidth: datacenter.reduce((sum, c) => sum + c.bandwidth, 0),
      serviceBandwidth: service.reduce((sum, c) => sum + c.bandwidth, 0),
    };
  }, [connections]);

  const filteredConnections = useMemo(() => {
    let filtered = connections;

    if (selectedGroup === 'cloud') {
      filtered = groupedConnections.cloud;
    } else if (selectedGroup === 'datacenter') {
      filtered = groupedConnections.datacenter;
    } else if (selectedGroup === 'service') {
      filtered = groupedConnections.service;
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.connection_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(c => c.location === locationFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(() => statusFilter === 'provisioned');
    }

    if (sideFilter !== 'all') {
      filtered = filtered.filter(c => c.side === sideFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.connection_type === typeFilter);
    }

    return filtered;
  }, [connections, selectedGroup, searchTerm, locationFilter, statusFilter, sideFilter, typeFilter, groupedConnections]);

  const locations = useMemo(() => {
    const locs = new Set(connections.map(c => c.location).filter(Boolean));
    return Array.from(locs) as string[];
  }, [connections]);

  const sides = useMemo(() => {
    const s = new Set(connections.map(c => c.side).filter(Boolean));
    return Array.from(s) as string[];
  }, [connections]);

  const types = useMemo(() => {
    const t = new Set(connections.map(c => c.connection_type).filter(Boolean));
    return Array.from(t) as string[];
  }, [connections]);

  const clearFilters = () => {
    setSelectedGroup('all');
    setSearchTerm('');
    setLocationFilter('all');
    setStatusFilter('all');
    setSideFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = selectedGroup !== 'all' || searchTerm || locationFilter !== 'all' ||
                          statusFilter !== 'all' || sideFilter !== 'all' || typeFilter !== 'all';

  const formatBandwidth = (mbps: number) => {
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(1)}G`;
    }
    return `${mbps} Mbps`;
  };

  return (
    <div className="space-y-4">
        {/* Capacity Awareness Banner */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                Capacity Utilization
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900 ml-1">{svcCapacity || '—'}</span>
              </div>
              <div>
                <span className="text-gray-600">Used:</span>
                {/* <span className="font-semibold text-blue-600 ml-1">{formatBandwidth(totalUsedBandwidth)}</span> */}
              </div>
              <div>
                <span className="text-gray-600">Available:</span>
                {/* <span className="font-semibold text-green-600 ml-1">{formatBandwidth(availableBandwidth)}</span> */}
              </div>
            </div>
          </div>
        </section>

        {/* Grouping Cards */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedGroup(selectedGroup === 'cloud' ? 'all' : 'cloud')}
            className={`bg-white border-2 rounded-lg p-3 transition-all hover:shadow-md ${
              selectedGroup === 'cloud' ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedGroup === 'cloud' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Cloud className={`w-5 h-5 ${selectedGroup === 'cloud' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-600">Cloud Connections</div>
                <div className="text-lg font-semibold text-gray-900">{groupedConnections.cloud.length}</div>
                <div className="text-xs text-gray-500">{formatBandwidth(groupedConnections.cloudBandwidth)}</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedGroup(selectedGroup === 'datacenter' ? 'all' : 'datacenter')}
            className={`bg-white border-2 rounded-lg p-3 transition-all hover:shadow-md ${
              selectedGroup === 'datacenter' ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedGroup === 'datacenter' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Building2 className={`w-5 h-5 ${selectedGroup === 'datacenter' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-600">Data Center Connections</div>
                <div className="text-lg font-semibold text-gray-900">{groupedConnections.datacenter.length}</div>
                <div className="text-xs text-gray-500">{formatBandwidth(groupedConnections.datacenterBandwidth)}</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedGroup(selectedGroup === 'service' ? 'all' : 'service')}
            className={`bg-white border-2 rounded-lg p-3 transition-all hover:shadow-md ${
              selectedGroup === 'service' ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedGroup === 'service' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Network className={`w-5 h-5 ${selectedGroup === 'service' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-600">Service Connections</div>
                <div className="text-lg font-semibold text-gray-900">{groupedConnections.service.length}</div>
                <div className="text-xs text-gray-500">{formatBandwidth(groupedConnections.serviceBandwidth)}</div>
              </div>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search VC Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="provisioned">Provisioned</option>
            </select>

            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sides</option>
              {sides.map(side => (
                <option key={side} value={side}>{side}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGroup !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {selectedGroup === 'cloud' ? 'Cloud' : selectedGroup === 'datacenter' ? 'Data Center' : 'Service'}
                  <button onClick={() => setSelectedGroup('all')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {locationFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {locationFilter}
                  <button onClick={() => setLocationFilter('all')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sideFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {sideFilter}
                  <button onClick={() => setSideFilter('all')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Empty State Banner */}
        {filteredConnections.length === 0 && !hasActiveFilters && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">No virtual connections</p>
                  <p className="text-xs text-orange-700 mt-0.5">This service has no active connections. Provision via Fabric Console.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Virtual connections enable connectivity to cloud providers, data centers, and other services. Each connection consumes bandwidth from the total SVC capacity.
            </p>
          </div>
        </div>

        {/* Virtual Connections Table */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Virtual Connections ({filteredConnections.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors">
                All
              </button>
              <button className="px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors">
                Active
              </button>
              <button className="px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors">
                Cloud
              </button>
              <button className="px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors">
                Data Center
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Connection Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Bandwidth</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Side</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Access Point</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Network className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">
                        {hasActiveFilters ? 'No connections match your filters' : 'No virtual connections found'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {hasActiveFilters ? 'Try adjusting your filters' : 'Provision via Fabric Console to see connections'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((conn) => (
                    <tr key={conn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium text-left">
                          {conn.connection_name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900">{conn.connection_type || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-900">{conn.location || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-900 font-medium">{conn.bandwidth} Mbps</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">
                          PROVISIONED
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900">{conn.side || '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-800">
                            {conn.access_point_type}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">{conn.access_point_name || '-'}</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );
}
