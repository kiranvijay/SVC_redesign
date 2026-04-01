import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, CreditCard as Edit, Plug, Power, Network, Wrench } from 'lucide-react';
import { SVC } from '../lib/supabase';
import StatusBadge from './StatusBadge';

interface ServiceCardProps {
  svc: any;
  onEdit: (svc: SVC) => void;
  onAssign: (svc: SVC) => void;
  onDeactivate: (svc: SVC) => void;
  onTroubleshoot: (svc: SVC) => void;
}

export default function ServiceCard({ svc, onEdit, onAssign, onDeactivate, onTroubleshoot }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-200 transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-4 h-4 text-blue-600" />
                <Link to={`/svc/${svc.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">{svc.svc_id}</h3>
                </Link>
              </div>
              <p className="text-sm text-gray-600">{svc.customer_name}</p>
              {svc.customer_number && (
                <p className="text-xs text-gray-500 mt-1">Account: {svc.customer_number}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Product</p>
              <p className="text-sm font-medium text-gray-900">{svc.product}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Encapsulation</p>
              <p className="text-sm font-medium text-gray-900">
                {svc.encapsulation || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Tag Protocol</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {svc.tag_protocol || 'N/A'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs text-gray-500">Lag</p>
                {/* <p className="text-sm font-medium text-gray-900">{svc.capacity || 'N/A'}</p> */}
              </div>
              {svc.has_lag && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                  <Network className="w-3 h-3" />
                  LAG
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={svc.status} />

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onEdit(svc)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Service"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAssign(svc)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Assign Port"
              >
                <Plug className="w-4 h-4" />
              </button>
              <button
                onClick={() => onTroubleshoot(svc)}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                title="Troubleshoot"
              >
                <Wrench className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeactivate(svc)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Deactivate Service"
              >
                <Power className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title={isExpanded ? 'Collapse Details' : 'Expand Details'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                {/* <p className="text-xs text-gray-500 mb-1">Port Name</p> */}
                {svc.port_name ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle port navigation or action here
                      console.log('Navigate to port:', svc.port_name);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {svc.port_name}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">N/A</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">ASN</p>
                <p className="text-sm font-medium text-gray-900">{svc.asn || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">IPv4 Address</p>
                <p className="text-sm font-mono text-gray-900">{svc.ipv4_address || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">IPv6 Address</p>
                <p className="text-sm font-mono text-gray-900">{svc.ipv6_address || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">VLAN</p>
                <p className="text-sm font-medium text-gray-900">{svc.vlan_min || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">CCID</p>
                <p className="text-sm font-medium text-gray-900">{svc.ccid || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">MAC Address</p>
                <p className="text-sm font-mono text-gray-900">{svc.mac_address || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Asset Number</p>
                <p className="text-sm font-medium text-gray-900">{svc.asset_number || 'N/A'}</p>
              </div>

              {svc.lag_group_id && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">LAG Group ID</p>
                  <p className="text-sm font-medium text-gray-900">{svc.lag_group_id}</p>
                </div>
              )}


              {svc.service_id && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Service ID</p>
                  <p className="text-sm font-mono text-gray-900">{svc.service_id}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
