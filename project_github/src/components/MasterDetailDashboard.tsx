import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, RefreshCw, LayoutGrid } from 'lucide-react';
import { SVC, supabase } from '../lib/supabase';
import ServiceListPanel from './ServiceListPanel';
import ServiceDetailPanel from './ServiceDetailPanel';
import FilterPanel, { FilterValues } from './FilterPanel';
import { useNavigate } from 'react-router-dom';

export default function MasterDetailDashboard() {
  const navigate = useNavigate();
  const [svcs, setSvcs] = useState<SVC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<SVC | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    metro: '',
    ibx: '',
    product: '',
    customerName: '',
    lagGroupId: '',
    showWithConnections: false,
  });

  const fetchSVCs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('virtual_ports')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.region) query = query.eq('region', filters.region);
      if (filters.metro) query = query.eq('metro', filters.metro);
      if (filters.ibx) query = query.eq('ibx', filters.ibx);
      if (filters.product) query = query.eq('product_type', filters.product);
      if (filters.lagGroupId) query = query.eq('lag_group_id', filters.lagGroupId);
      if (filters.showWithConnections) query = query.not('connection_id', 'is', null);

      // Apply search
      if (searchQuery) {
        query = query.or(
          `svc_name.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_number.ilike.%${searchQuery}%,service_id.ilike.%${searchQuery}%,connection_id.ilike.%${searchQuery}%`
        );
      }

      // Apply customerName filter
      if (filters.customerName) {
        query = query.ilike('customer_name', `%${filters.customerName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSvcs(data || []);
    } catch (error) {
      console.error('Error fetching SVCs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSVCs();
  }, [filters, searchQuery]);

  // Since we're doing server-side filtering, filteredSVCs is just svcs
  const filteredSVCs = svcs;

  const uniqueRegions = useMemo(() => [...new Set(svcs.map((s) => s.region).filter((v): v is string => Boolean(v)))].sort(), [svcs]);
  const uniqueMetros = useMemo(() => [...new Set(svcs.map((s) => s.metro).filter((v): v is string => Boolean(v)))].sort(), [svcs]);
  const uniqueIBXs = useMemo(() => [...new Set(svcs.map((s) => s.ibx).filter((v): v is string => Boolean(v)))].sort(), [svcs]);
  const uniqueProducts = useMemo(() => [...new Set(svcs.map((s) => s.product_type).filter((v): v is string => Boolean(v)))].sort(), [svcs]);

  const metrics = useMemo(() => {
    const total = filteredSVCs.length;
    const active = filteredSVCs.filter((s) => s.usage_status === 'Installed' || s.usage_status === 'Provisioned').length;
    const pending = filteredSVCs.filter((s) => s.usage_status === 'Pending').length;
    const errors = filteredSVCs.filter((s) => s.ecee_status === 'ERROR' || s.ecee_status === 'FAILED').length;
    return { total, active, pending, errors };
  }, [filteredSVCs]);

  const exportToCSV = () => {
    const headers = [
      'SVC Name',
      'Customer',
      'Product Type',
      'Capacity',
      'Region',
      'Metro',
      'IBX',
      'Usage Status',
      'ECEE Status',
    ];
    const rows = filteredSVCs.map((svc) => [
      svc.svc_name,
      svc.customer_name,
      svc.product_type,
      svc.capacity,
      svc.region,
      svc.metro,
      svc.ibx,
      svc.usage_status,
      svc.ecee_status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svcs-export-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
          {/* Title Bar */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-primary-text text-gray-900 dark:text-white">Customer Port / Service Dashboard</h1>
                <p className="text-xs text-gray-600">Network Operations Management</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Card View
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={fetchSVCs}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
                <button
                  onClick={() => navigate('/add-svc?return=/master-detail')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add SVC
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search SVC / Customer / Service ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Compact Metrics */}
          <div className="px-3 py-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <h3 className="text-gray-700 text-xs font-medium">Total Services</h3>
                <div className="mt-1">
                  <div className="text-blue-700 text-2xl font-semibold">{metrics.total}</div>
                  <div className="text-blue-600 text-xs">All Services</div>
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <h3 className="text-gray-700 text-xs font-medium">Provisioned</h3>
                <div className="mt-1">
                  <div className="text-green-700 text-2xl font-semibold">{metrics.active}</div>
                  <div className="text-green-600 text-xs">Provisioning Completed</div>
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <h3 className="text-gray-700 text-xs font-medium">Connections</h3>
                <div className="mt-1">
                  <div className="text-purple-700 text-2xl font-semibold">{metrics.pending}</div>
                  <div className="text-purple-600 text-xs">Ports with Connections</div>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <h3 className="text-gray-700 text-xs font-medium">Errors</h3>
                <div className="mt-1">
                  <div className="text-amber-700 text-2xl font-semibold">{metrics.errors}</div>
                  <div className="text-amber-600 text-xs">Need Attention</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-3 py-2 border-t border-gray-100">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={() =>
                setFilters({
                  region: '',
                  metro: '',
                  ibx: '',
                  product: '',
                  customerName: '',
                  lagGroupId: '',
                  showWithConnections: false,
                })
              }
              regions={uniqueRegions}
              metros={uniqueMetros}
              ibxs={uniqueIBXs}
              products={uniqueProducts}
            />
          </div>
        </div>

        {/* Main Content - Independent Scrolling */}
        <div className="flex flex-1 overflow-hidden">
          {/* Service List - Independent Scroll */}
          <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">
                Service List
                <span className="ml-2 text-xs font-normal text-gray-600">({filteredSVCs.length})</span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ServiceListPanel
                services={filteredSVCs}
                selectedService={selectedService}
                onSelectService={setSelectedService}
                loading={loading}
              />
            </div>
          </div>

          {/* Service Details - Independent Scroll */}
          <div className="flex-1 overflow-y-auto bg-white">
            <ServiceDetailPanel service={selectedService} />
          </div>
        </div>
      </div>
  );
}
