import { SVC } from '../lib/supabase';
import { Zap, Link2, Circle } from 'lucide-react';

interface ServiceListPanelProps {
  services: SVC[];
  selectedService: SVC | null;
  onSelectService: (service: SVC) => void;
  loading: boolean;
}

export default function ServiceListPanel({
  services,
  selectedService,
  onSelectService,
  loading,
}: ServiceListPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Installed':
      case 'Provisioned':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-orange-500';
      case 'ERROR':
      case 'FAILED':
      case 'Decommissioned':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getCapacityIcon = (capacity: string) => {
    const value = parseInt(capacity);
    if (value >= 100) return <Zap className="w-4 h-4 text-yellow-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No services found</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelectService(service)}
          className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-l-3 ${
            selectedService?.id === service.id
              ? 'bg-blue-50 border-l-blue-600'
              : 'border-l-transparent'
          }`}
        >
          <div className="flex items-start gap-2">
            <div className={`w-1 h-12 rounded-full ${getStatusColor(service.usage_status)} flex-shrink-0`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{service.svc_name}</h3>
                <span className="text-xs font-medium text-blue-600 flex-shrink-0">{service.capacity}</span>
                {service.has_lag && (
                  <Link2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                )}
                {getCapacityIcon(service.capacity)}
              </div>

              <p className="text-xs text-gray-600 truncate mb-1">{service.customer_name}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                {/* <span>{service.usage_status}</span> */}
                {/* <Circle className="w-1 h-1 fill-current" /> */}
                <span>{service.ibx}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
