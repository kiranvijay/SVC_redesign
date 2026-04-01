import { SVC } from '../lib/supabase';
import { CreditCard as Edit, Power, Cable, Server, Network, Tag, Shield, Activity, Globe, Wifi } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface ServiceDetailPanelProps {
  service: SVC | null;
}

export default function ServiceDetailPanel({ service }: ServiceDetailPanelProps) {
  if (!service) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Select a service to view details</p>
          <p className="text-gray-400 text-sm mt-2">Choose a service from the list to see full information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Service Details</h2>
          <span className="text-sm opacity-75">|</span>
          <Network className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <h2 className="text-sm font-semibold">{service.svc_name}</h2>
          <span className="text-sm opacity-75">|</span>
          <p className="text-sm opacity-90 truncate">{service.customer_name}</p>
          <span className="text-sm opacity-75">|</span>
          <p className="text-xs opacity-75 whitespace-nowrap">{service.service_id}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            title="Edit Service"
            className=" text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            title="Assign Port"
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Cable className="w-4 h-4" />
          </button>
          <button
            title="Deactivate Service"
            className=" text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Service Overview */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            Service Overview
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-600 mb-0.5">Product Type</div>
                <div className="font-medium text-gray-900">{service.product_type}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Customer</div>
                <div className="font-medium text-gray-900">{service.customer_name}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">ECEE Status</div>
                {service.ecee_status ? (
                  <StatusBadge status={service.ecee_status} />
                ) : (
                  <div className="font-medium text-gray-900">N/A</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            Location
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-600 mb-0.5">Region</div>
                <div className="font-medium text-gray-900">{service.region}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Metro</div>
                <div className="font-medium text-gray-900">{service.metro}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">IBX</div>
                <div className="font-medium text-gray-900">{service.ibx}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Asset Number</div>
                <div className="font-medium text-gray-900">{service.asset_number || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5" />
            Network Configuration
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-600 mb-0.5">ASN</div>
                <div className="font-medium text-gray-900 font-mono">{service.asn || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">VLAN</div>
                <div className="font-medium text-gray-900 font-mono">{service.vlan || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">IPv4 Address</div>
                <div className="font-medium text-gray-900 font-mono">{service.ipv4_address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">IPv6 Address</div>
                <div className="font-medium text-gray-900 font-mono break-all">{service.ipv6_address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">MAC Address</div>
                <div className="font-medium text-gray-900 font-mono">{service.mac_address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Encapsulation</div>
                <div className="font-medium text-gray-900">{service.encapsulation || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* LAG Configuration */}
        {service.has_lag && service.lag_group_id && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
              <Server className="h-3.5 w-3.5" />
              LAG Configuration
            </h3>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-blue-700 mb-0.5">LAG Group ID</div>
                  <div className="font-medium text-blue-900 font-mono">{service.lag_group_id}</div>
                </div>
                <div>
                  <div className="text-blue-700 mb-0.5">LAG Status</div>
                  <div className="font-medium text-blue-900">Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Associated Ports */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Cable className="h-3.5 w-3.5" />
            Associated Ports
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-xs">
              <div className="text-gray-600 mb-0.5">Port Interface</div>
              {service.port_name && service.switch_name ? (
                <div className="font-medium text-gray-900 font-mono">
                  {service.port_name} - {service.switch_name}
                </div>
              ) : service.port_name ? (
                <div className="font-medium text-gray-900 font-mono">{service.port_name}</div>
              ) : (
                <div className="font-medium text-gray-900">N/A</div>
              )}
            </div>
          </div>
        </div>

        {/* Asset Information */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" />
            Asset Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-600 mb-0.5">CCID</div>
                <div className="font-medium text-gray-900 font-mono">{service.ccid || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Tag Protocol</div>
                <div className="font-medium text-gray-900">{service.tag_protocol || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Timeline */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Activity & Timeline
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1" />
                <div>
                  <span className="text-gray-600">Service Created: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(service.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1" />
                <div>
                  <span className="text-gray-600">Last Modified: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(service.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
