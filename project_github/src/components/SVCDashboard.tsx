import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, RefreshCw, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SVC, supabase } from '../lib/supabase';
import ServiceCard from './ServiceCard';
import FilterPanel, { FilterValues } from './FilterPanel';
import ServiceSummary from './ServiceSummary';

export default function SVCDashboard() {
  const navigate = useNavigate();
  const [svcs, setSvcs] = useState<SVC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    metro: '',
    ibx: '',
    product: '',
    customerName: '',
    lagGroupId: '',
    showWithConnections: false,
  });

  useEffect(() => {
    fetchSVCs();
  }, [filters, searchQuery]);

  const fetchSVCs = async () => {
    setLoading(true);
    try {
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

  const uniqueValues = useMemo(() => {
    return {
      regions: Array.from(new Set(svcs.map((s) => s.region).filter(Boolean))).sort() as string[],
      metros: Array.from(new Set(svcs.map((s) => s.metro).filter(Boolean))).sort() as string[],
      ibxs: Array.from(new Set(svcs.map((s) => s.ibx).filter(Boolean))).sort() as string[],
      products: Array.from(new Set(svcs.map((s) => s.product_type).filter(Boolean))).sort() as string[],
    };
  }, [svcs]);

  // Since we're doing server-side filtering, filteredSvcs is just svcs
  const filteredSvcs = svcs;

  const stats = useMemo(() => {
    return {
      total: filteredSvcs.length,
      active: filteredSvcs.filter((s) => s.ecee_status === 'PROVISIONED' || s.usage_status === 'Installed').length,
      pending: filteredSvcs.filter((s) => s.ecee_status === 'PENDING').length,
      errors: filteredSvcs.filter((s) => s.ecee_status === 'ERROR' || s.ecee_status === 'FAILED').length,
    };
  }, [filteredSvcs]);

  const handleEdit = (svc: SVC) => {
    console.log('Edit SVC:', svc);
  };

  const handleAssign = (svc: SVC) => {
    console.log('Assign Port:', svc);
  };

  const handleDeactivate = (svc: SVC) => {
    console.log('Deactivate SVC:', svc);
  };

  const handleTroubleshoot = (svc: SVC) => {
    console.log('Troubleshoot SVC:', svc);
  };

  const handleExportResults = () => {
    const csv = [
      [
        'SVC Name',
        'Customer',
        'Product',
        'Metro',
        'IBX',
        'Capacity',
        'ASN',
        'IPv4',
        'IPv6',
        'VLAN',
        'CCID',
        'Status',
      ].join(','),
      ...filteredSvcs.map((svc) =>
        [
          svc.svc_name,
          svc.customer_name,
          svc.product_type,
          svc.metro,
          svc.ibx,
          svc.capacity,
          svc.asn,
          svc.ipv4_address,
          svc.ipv6_address,
          svc.vlan,
          svc.ccid,
          svc.ecee_status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svc-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleResetFilters = () => {
    setFilters({
      region: '',
      metro: '',
      ibx: '',
      product: '',
      customerName: '',
      lagGroupId: '',
      showWithConnections: false,
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-bold text-primary-text text-gray-900 dark:text-white">Customer Port Service</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/master-detail')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={fetchSVCs}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => navigate('/add-svc?return=/')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add SVC
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SVC Name, Customer, Service ID, or Connection ID..."
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <ServiceSummary total={stats.total} active={stats.active} pending={stats.pending} errors={stats.errors} />

        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          regions={uniqueValues.regions}
          metros={uniqueValues.metros}
          ibxs={uniqueValues.ibxs}
          products={uniqueValues.products}
        />

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900">
                Services ({filteredSvcs.length} {filteredSvcs.length === 1 ? 'result' : 'results'})
              </h2>
            </div>
            <button
              onClick={handleExportResults}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading services...</span>
              </div>
            ) : filteredSvcs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No services found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSvcs.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    svc={svc}
                    onEdit={handleEdit}
                    onAssign={handleAssign}
                    onDeactivate={handleDeactivate}
                    onTroubleshoot={handleTroubleshoot}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
