import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Search, Server, Network, Cable, ArrowRight, Info, Cloud, Building2 } from 'lucide-react';
import { Row, Col, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { supabase, VirtualConnection } from '../lib/supabase';
import StatusBadge from './StatusBadge';
import LagIndicator from './LagIndicator';
import AttachPortDrawer from './AttachPortDrawer';
import VirtualConnectionsTab from './VirtualConnectionsTab';

type TabType = 'overview' | 'topology' | 'physical-ports' | 'virtual-connections' | 'activity-log';

export default function SVCDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [physicalPorts, setPhysicalPorts] = useState<any[]>([]);
  const [virtualConnections, setVirtualConnections] = useState<VirtualConnection[]>([]);
  const [attachDrawerOpen, setAttachDrawerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService(id);
      fetchPhysicalPorts(id);
      fetchVirtualConnections(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('virtual_ports')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }




  };

     const fetchPhysicalPorts = async (_serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('physical_ports')
        .select('*')
        .eq('id', 'e33d5529-6246-471e-982b-fcc9a386a200');

      if (error) throw error;
      setPhysicalPorts(data || []);
    } catch (error) {
      console.error('Error fetching physical ports:', error);
    }
  };

  const fetchVirtualConnections = async (_serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('virtual_connections')
        .select('*');

      if (error) throw error;
      setVirtualConnections(data || []);
    } catch (error) {
      console.error('Error fetching virtual connections:', error);
      setVirtualConnections([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Service not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Linked Entities Panel Component
  const LinkedEntitiesPanel = () => (
    <section className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Linked Entities</h3>
          <p className="text-xs text-gray-500 mt-0.5">0 connections · 0 services</p>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Virtual Port */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                {service.svc_name?.replace('SVC-', 'SVC-SV-')}
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded">
              Reserved
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Virtual Port</p>
          <p className="text-xs text-gray-500 italic">No virtual connections</p>
        </div>
      </div>
    </section>
  );

  // Connection Details Panel Component
  const ConnectionDetailsPanel = () => {
    const groupedConnections = useMemo(() => {
      const cloud = virtualConnections.filter(c => c.access_point_type === 'SP');
      const datacenter = virtualConnections.filter(c => c.access_point_type === 'COLO');
      const serviceConns = virtualConnections.filter(c => c.access_point_type !== 'SP' && c.access_point_type !== 'COLO');

      return {
        cloud,
        datacenter,
        service: serviceConns,
        cloudBandwidth: cloud.reduce((sum, c) => sum + c.bandwidth, 0),
        datacenterBandwidth: datacenter.reduce((sum, c) => sum + c.bandwidth, 0),
        serviceBandwidth: serviceConns.reduce((sum, c) => sum + c.bandwidth, 0),
      };
    }, []);

    const totalUsedBandwidth = virtualConnections.reduce((sum, c) => sum + c.bandwidth, 0);
    const capacityInMbps = service.capacity ? parseInt(service.capacity.replace(/[^0-9]/g, '')) * 1000 : 0;
    const availableBandwidth = capacityInMbps - totalUsedBandwidth;

    const formatBandwidth = (mbps: number) => {
      if (mbps >= 1000) {
        return `${(mbps / 1000).toFixed(1)}G`;
      }
      return `${mbps} Mbps`;
    };

    return (
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Connection Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">{virtualConnections.length} total connections</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Breakdown by Type</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-gray-700">Cloud (SP)</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{groupedConnections.cloud.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-gray-700">Data Center (COLO)</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{groupedConnections.datacenter.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-gray-700">Service</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{groupedConnections.service.length}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">Bandwidth Usage</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Total Allocated</span>
                <span className="text-xs font-semibold text-blue-600">{formatBandwidth(totalUsedBandwidth)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Available</span>
                <span className="text-xs font-semibold text-green-600">{formatBandwidth(availableBandwidth)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Tab Content Components
  const OverviewTab = () => (
    <div className="grid grid-cols-[1fr,340px] gap-6 mt-2">
      {/* Left Inner Column */}
      <div className="space-y-4">
        {/* Port Identification */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Port Identification
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">SVC ID</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {service.svc_id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">UUID</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {service.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Name</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.customer_name} SVC FABRIC
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Order ID</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {service.connection_id || 'ORD-2624-8043'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Location
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">IBX</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.ibx || 'SV5'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Metro</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.metro || 'SV'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Region</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.region || 'NA'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Port Specifications */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Port Specifications
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Speed</p>
                <p className="text-xs font-semibold text-gray-500">
                  10 Gbps
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Bandwidth</p>
                <p className="text-xs font-semibold text-gray-500">
                  10 Gbps
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">VLAN Range</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.vlan ? `1-${service.vlan}` : '1-4094'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">LAG Configuration</p>
                <LagIndicator current={physicalPorts.length} max={8} />
              </div>
            </div>
          </div>
        </section>

        {/* Timestamps */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Timestamps
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Created</p>
                <p className="text-xs font-semibold text-gray-500">
                  {new Date(service.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}, {new Date(service.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Last Updated</p>
                <p className="text-xs font-semibold text-gray-500">
                  {new Date(service.updated_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}, {new Date(service.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Inner Column */}
      <div className="space-y-4">
        {/* Customer */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-purple-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Customer
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Customer Name</p>
                <p className="text-xs font-semibold text-gray-500">
                  {service.customer_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Account ID</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {service.customer_number || 'ACC-20801'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Config */}
        {/* <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-purple-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Commercial Config
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">MRC</p>
                <p className="text-xs font-semibold text-gray-500">
                  4500
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Tier</p>
                <p className="text-xs font-semibold text-gray-500">
                  Premium
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Currency</p>
                <p className="text-xs font-semibold text-gray-500">
                  USD
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Commitment</p>
                <p className="text-xs font-semibold text-gray-500">
                  24
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Billing Cycle</p>
                <p className="text-xs font-semibold text-gray-500">
                  monthly
                </p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Service Config */}
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-purple-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Service Config
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">ASN</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {service.asn || '4'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Route Filter</p>
                <p className="text-xs font-semibold text-gray-500">
                  STRICT
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Routing Protocol</p>
                <p className="text-xs font-semibold text-gray-500">
                  BGP
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-purple-500 rounded-full" />
              <span className="text-base font-semibold text-gray-900">
                Product Info
              </span>
            </div>
          </div>
             <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Product</p>
                <p className="text-xs font-semibold text-gray-500 font-mono">
                  {'Fabric'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const TopologyTab = () => (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Physical Ports (LAG)</p>
            <p className="text-lg font-semibold text-gray-900">0 / 8</p>
          </div>
        </section>
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Virtual Connections</p>
            <p className="text-lg font-semibold text-gray-900">0 <span className="text-sm text-gray-500">(0 active)</span></p>
          </div>
        </section>
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Services</p>
            <p className="text-lg font-semibold text-gray-900">1</p>
          </div>
        </section>
        <section className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">VLAN Range</p>
            <p className="text-lg font-semibold text-gray-900">1 - 4094</p>
          </div>
        </section>
      </div>

      {/* Network Topology Diagram */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-5 bg-sky-500 rounded-full" />
            <span className="text-base font-semibold text-gray-900">
              Network Topology
            </span>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center gap-8">
            {/* Physical Ports Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500 mb-3">PHYSICAL PORTS</p>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-w-[180px]">
                <Cable className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500 mb-1">No ports attached</p>
                <p className="text-xs text-gray-400">Attach to activate</p>
              </div>
            </div>

            {/* Connection Arrow */}
            <div className="flex items-center">
              <ArrowRight className="w-6 h-6 text-gray-300" />
            </div>

            {/* SVC Node (Center) */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500 mb-3">SERVICE</p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-6 shadow-lg min-w-[220px]">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">SVC</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SVC Name:</span>
                    <span className="font-semibold text-gray-900">{service.svc_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-semibold text-gray-900">10G</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VLAN:</span>
                    <span className="font-semibold text-gray-900">1-4094</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={service.ecee_status || 'N/A'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Arrow */}
            <div className="flex items-center">
              <ArrowRight className="w-6 h-6 text-gray-300" />
            </div>

            {/* Virtual Connections Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500 mb-3">VIRTUAL CONNECTIONS</p>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-w-[200px]">
                <Network className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500 mb-2">No virtual connections</p>
                {/* <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Provision via Fabric Console
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              {/* <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Active</span>
              </div> */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Provisioning</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Fault</span>
              </div> */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-gray-600">Suspended</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              <span>VLAN ID</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const PhysicalPortsTab = () => (
    <div className="space-y-4">
      {/* LAG Utilization */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              LAG Utilization
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{physicalPorts.length} / 8 ports</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">{8 - physicalPorts.length} port(s) remaining · Max 8 for this product</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Detach Port
              </button>
              <button
                onClick={() => setAttachDrawerOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Attach Port
              </button>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(physicalPorts.length / 8) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Empty State Banner */}
      {physicalPorts.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900">No physical ports attached</p>
                <p className="text-xs text-orange-700 mt-0.5">This SVC has no active physical port assignments. Attach a physical port to begin provisioning.</p>
              </div>
            </div>
            <button
              onClick={() => setAttachDrawerOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex-shrink-0 ml-4"
            >
              Attach Port
            </button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Physical ports provide the underlying capacity for this service. Ports can be aggregated using LAG (Link Aggregation Group) for increased bandwidth and redundancy.
          </p>
        </div>
      </div>

      {/* Physical Ports Table */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <span className="text-base font-semibold text-gray-900">
              Physical Ports
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
              Down
            </button>
            <button className="px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors">
              LAG Members
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">LAG #</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Port ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Port Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Hardware Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Speed</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Slot</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Interface Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Usage Status</th>
              </tr>
            </thead>
            <tbody>
              {physicalPorts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Cable className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No physical ports found</p>
                    <p className="text-xs text-gray-400 mt-1">Attach a port to see it listed here</p>
                  </td>
                </tr>
              ) : (
                physicalPorts.map((port) => (
                  <tr key={port.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-900">{port.lag_id || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-900 font-mono">{port.port_number || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-900 font-medium">{port.port_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{port.hardware_type || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-900">{port.port_speed ? `${port.port_speed}G` : '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-900">{port.slot || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{port.interface_type || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        port.port_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {port.port_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{port.usage_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );



  const ActivityLogTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">Service Provisioned</p>
              <p className="text-xs text-gray-500">
                {new Date(service.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(service.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
            <p className="text-xs text-gray-500">Service {service.svc_name} was successfully provisioned</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">Configuration Updated</p>
              <p className="text-xs text-gray-500">
                {new Date(service.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(service.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
            <p className="text-xs text-gray-500">Service configuration was updated</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Define tab items
  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab />,
    },
    {
      key: 'topology',
      label: 'Topology',
      children: <TopologyTab />,
    },
    {
      key: 'physical-ports',
      label: `Physical Ports (${physicalPorts.length})`,
      children: <PhysicalPortsTab />,
    },
    {
      key: 'virtual-connections',
      label: `Virtual Connections (${virtualConnections.length})`,
      children: <VirtualConnectionsTab connections={virtualConnections} svcCapacity={service.capacity || '10G'} />,
    },
    {
      key: 'activity-log',
      label: 'Activity Log',
      children: <ActivityLogTab />,
    },
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-primary-text text-gray-900 dark:text-white">{service.svc_id}</h1>
                <span className="text-xs text-gray-400 font-normal">|</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{service.region || 'AMER'}</span>
                <span className="text-xs text-gray-400 font-normal">→</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{service.metro || 'SV'}</span>
                <span className="text-xs text-gray-400 font-normal">→</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{service.ibx || 'SV1'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <StatusBadge status={service.ecee_status || 'N/A'} /> */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div> */}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 ml-7">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">●</span>
              <span className='text-gray-500 dark:text-gray-400 text-xs font-semibold'>Created: {new Date(service.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(service.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">●</span>
              <span className='text-gray-500 dark:text-gray-400 text-xs font-semibold'>Completed: {new Date(service.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(service.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 24px 24px' }}>
        <Row gutter={20} style={{ marginTop: 16 }}>
          <Col span={17}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabType)}
              type="card"
              size="small"
              tabBarStyle={{ marginBottom: 16 }}
              items={tabItems}
              style={{ paddingTop: 8 }}
            />
          </Col>
          <Col span={7}>
            <div className="space-y-4">
              <LinkedEntitiesPanel />
              {activeTab === 'virtual-connections' && <ConnectionDetailsPanel />}
            </div>
          </Col>
        </Row>
      </div>

      {/* Attach Port Drawer */}
      <AttachPortDrawer
        open={attachDrawerOpen}
        virtualPort={{
          ...service,
          lag_count: physicalPorts.length,
          max_lag_count: 8,
        }}
        onClose={() => setAttachDrawerOpen(false)}
        onSuccess={() => {
          setAttachDrawerOpen(false);
          if (id) {
            fetchPhysicalPorts(id);
          }
        }}
      />
    </div>
  );
}
