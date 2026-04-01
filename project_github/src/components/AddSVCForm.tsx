import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Search, Network, Globe, Wifi, MapPin } from 'lucide-react';
import { Input, Select, InputNumber, Switch, Button } from 'antd';
import { supabase } from '../lib/supabase';

interface AddSVCFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  order_id: string;
  customer_name: string;
  customer_number: string;
  svc_name: string;
  product_type: string;
  capacity: string;
  committed_bandwidth: string;
  vlan: string;
  vlan_min: string;
  vlan_max: string;
  service_tier: string;
  commitment_term: string;
  billing_cycle: string;
  ix_provider: string;
  bgp_asn: string;
  peering_type: string;
  route_server_enabled: boolean;
  asn: string;
  ipv4_address: string;
  ipv6_address: string;
  hostname: string;
  region: string;
  metro: string;
  ibx: string;
  encapsulation: string;
  ccid: string;
  mac_address: string;
  asset_number: string;
  usage_status: string;
  ecee_status: string;
  has_lag: boolean;
  lag_group_id: string;
  tag_protocol: string;
  service_id: string;
  connection_id: string;
  order_status: string;
  order_status_date: string;
  type: string;
}

interface OrderSummary {
  order_id: string;
  product: string;
  location: string;
  customer: string;
  bandwidth: string;
  service_config: string;
  physical_port: string;
  status: string;
}

const STEPS = [
  { id: 1, title: 'Order Lookup', subtitle: 'Find existing order' },
  { id: 2, title: 'Product', subtitle: 'Service type and configuration' },
  { id: 3, title: 'Location', subtitle: 'Where will this be deployed?' },
  { id: 4, title: 'Customer', subtitle: 'Who is this service for?' },
  { id: 5, title: 'Service Config', subtitle: 'Technical configuration' },
  { id: 6, title: 'Physical Port', subtitle: 'Port assignment' },
  { id: 7, title: 'Review', subtitle: 'Confirm your configuration' },
];

export default function AddSVCForm({ onClose, onSuccess }: AddSVCFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    order_id: '',
    customer_name: '',
    customer_number: '',
    svc_name: '',
    product_type: 'IA',
    capacity: '10G',
    committed_bandwidth: '1000',
    vlan: '',
    vlan_min: '',
    vlan_max: '',
    service_tier: 'Standard',
    commitment_term: '1 Year',
    billing_cycle: 'Monthly',
    ix_provider: '',
    bgp_asn: '',
    peering_type: 'Public Peering',
    route_server_enabled: false,
    asn: '',
    ipv4_address: '',
    ipv6_address: '',
    hostname: '',
    region: 'AMER',
    metro: 'SV',
    ibx: 'SV1',
    encapsulation: '',
    ccid: '',
    mac_address: '',
    asset_number: '',
    usage_status: 'Pending',
    ecee_status: 'PENDING',
    has_lag: false,
    lag_group_id: '',
    tag_protocol: '',
    service_id: '',
    connection_id: '',
    order_status: 'New',
    order_status_date: '',
    type: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    order_id: '',
    product: 'Not configured',
    location: 'Not configured',
    customer: 'Not configured',
    bandwidth: 'Not configured',
    service_config: 'Not configured',
    physical_port: 'Not assigned',
    status: 'RESERVED',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOrderSearch = async () => {
    if (!formData.order_id.trim()) return;

    setSearchingOrder(true);
    setError(null);

    // Simulate API call - Replace with actual API integration
    setTimeout(() => {
      // Mock data for demo purposes
      const mockOrderData: Record<string, any> = {
        'ORD-2024-0201': {
          customer_name: 'Alpha Networks',
          customer_number: 'ACC-2024-001',
          product_type: 'IA',
          region: 'AMER',
          metro: 'NY',
          ibx: 'NY4',
          capacity: '10G',
          committed_bandwidth: '1000',
        },
        'ORD-2024-0202': {
          customer_name: 'Beta Telecom',
          customer_number: 'ACC-2024-002',
          product_type: 'IX',
          region: 'EMEA',
          metro: 'FR',
          ibx: 'FR5',
          capacity: '10G',
          committed_bandwidth: '1000',
        },
        'ORD-2024-0203': {
          customer_name: 'Gamma Solutions',
          customer_number: 'ACC-2024-003',
          product_type: 'CX-Equinix Fabric',
          region: 'APAC',
          metro: 'SG',
          ibx: 'SG1',
          capacity: '100G',
          committed_bandwidth: '10000',
        },
      };

      const orderData = mockOrderData[formData.order_id.toUpperCase()];

      if (orderData) {
        // Populate form data
        setFormData(prev => ({
          ...prev,
          ...orderData,
        }));

        // Update summary panel
        setOrderSummary({
          order_id: formData.order_id.toUpperCase(),
          product: orderData.product_type === 'IX' ? 'Internet Exchange' :
                   orderData.product_type === 'IA' ? 'Internet Access' :
                   orderData.product_type === 'CX-Equinix Fabric' ? 'Equinix Fabric' :
                   orderData.product_type,
          location: `${orderData.ibx} - ${orderData.metro} - ${orderData.region}`,
          customer: orderData.customer_name,
          bandwidth: `${orderData.committed_bandwidth || '1000'} Mbps - ${orderData.capacity}`,
          service_config: 'Not configured',
          physical_port: 'Not assigned',
          status: 'RESERVED',
        });
      } else {
        setError('Order not found. Please check the Order ID or continue manually.');
      }

      setSearchingOrder(false);
    }, 800);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Order lookup is always optional
      case 2:
        return !!formData.product_type;
      case 3:
        return !!formData.region;
      case 4:
        return !!formData.customer_name && !!formData.customer_number && !!formData.capacity && !!formData.committed_bandwidth;
      case 5:
        // For Internet Exchange, require IX provider and BGP ASN
        if (formData.product_type === 'IX') {
          return !!formData.ix_provider && !!formData.bgp_asn;
        }
        return true;
      case 6:
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const submitData: any = {
        ...formData,
        asn: formData.asn ? parseInt(formData.asn) : null,
      };

      const { error: insertError } = await supabase.from('svcs').insert([submitData]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  const renderConfigurationSummary = () => {
    // Get current values from formData
    const currentSummary = {
      order_id: formData.order_id || orderSummary.order_id,
      product: formData.product_type ?
        (formData.product_type === 'IX' ? 'Internet Exchange' :
         formData.product_type === 'IA' ? 'Internet Access' :
         formData.product_type === 'CX-Equinix Fabric' ? 'Equinix Fabric' :
         formData.product_type === 'MC' ? 'Metro Connect' :
         formData.product_type) : 'Not configured',
      location: (formData.ibx || formData.metro || formData.region) ?
        `${formData.ibx || '?'} - ${formData.metro || '?'} - ${formData.region || '?'}` : 'Not configured',
      customer: formData.customer_name || 'Not configured',
      bandwidth: formData.committed_bandwidth && formData.capacity ?
        `${formData.committed_bandwidth} Mbps - ${formData.capacity}` :
        formData.capacity ? `1000 Mbps - ${formData.capacity}` : 'Not configured',
      service_config: (formData.encapsulation || formData.tag_protocol || formData.ix_provider || formData.bgp_asn) ? 'Configured' : 'Not configured',
      physical_port: 'Not assigned',
      status: 'RESERVED',
    };

    return (
      <div className="lg:col-span-1">
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden sticky top-6">
          <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200">
            <h4 className="font-semibold text-gray-900">Configuration Summary</h4>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ORDER</div>
              <div className={`text-sm font-medium ${currentSummary.order_id ? 'text-gray-900' : 'text-gray-400'}`}>
                {currentSummary.order_id ? `#${currentSummary.order_id}` : 'Not selected'}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PRODUCT</div>
              <div className={`text-sm font-medium ${currentSummary.product !== 'Not configured' ? 'text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block' : 'text-gray-400'}`}>
                {currentSummary.product}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LOCATION</div>
              <div className={`text-sm font-medium ${currentSummary.location !== 'Not configured' ? 'text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block' : 'text-gray-400'}`}>
                {currentSummary.location}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CUSTOMER</div>
              <div className={`text-sm font-medium ${currentSummary.customer !== 'Not configured' ? 'text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block' : 'text-gray-400'}`}>
                {currentSummary.customer}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">BANDWIDTH</div>
              <div className={`text-sm font-medium ${currentSummary.bandwidth !== 'Not configured' ? 'text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block' : 'text-gray-400'}`}>
                {currentSummary.bandwidth}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SERVICE CONFIG</div>
              {formData.product_type === 'IX' && (formData.ix_provider || formData.bgp_asn) ? (
                <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg space-y-1">
                  <div>IX: <span className="font-semibold">{formData.ix_provider || '?'}</span></div>
                  <div>ASN: <span className="font-semibold">{formData.bgp_asn || '?'}</span></div>
                  <div>Peering: <span className="font-semibold">{formData.peering_type}</span></div>
                  <div>Route Server: <span className="font-semibold">{formData.route_server_enabled ? 'Enabled' : 'Disabled'}</span></div>
                </div>
              ) : (
                <div className={`text-sm font-medium ${currentSummary.service_config !== 'Not configured' ? 'text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block' : 'text-gray-400'}`}>
                  {currentSummary.service_config}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PHYSICAL PORT</div>
              <div className="text-sm font-medium text-gray-400">
                {currentSummary.physical_port}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">INITIAL STATUS</div>
              <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                {currentSummary.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Order Lookup</h3>
                <p className="text-sm text-gray-600">Find existing order</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Do you have an existing order?
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter an order ID to automatically populate customer details, location, and commercial configuration.
                    <br />
                    You can also skip this step and enter details manually.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Order Search Input
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        name="order_id"
                        value={formData.order_id}
                        onChange={handleChange}
                        onPressEnter={handleOrderSearch}
                        size="large"
                        placeholder="Enter Order ID (e.g., ORD-2024-0202)"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="primary"
                      onClick={handleOrderSearch}
                      disabled={searchingOrder || !formData.order_id.trim()}
                      loading={searchingOrder}
                      size="large"
                    >
                      Search
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-5">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    No order? No problem.
                  </p>
                  <p className="text-xs text-gray-600">
                    Click <strong>Next</strong> to continue without an order reference and enter all details manually.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Available orders:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['ORD-2024-0201', 'ORD-2024-0202', 'ORD-2024-0203'].map((orderId) => (
                      <Button
                        key={orderId}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, order_id: orderId }));
                          setTimeout(handleOrderSearch, 100);
                        }}
                      >
                        {orderId}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Select Product Type</h3>
                <p className="text-sm text-gray-600">
                  Choose the interconnection product for this virtual port. The selected product determines available configurations and LAG port limits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    value: 'CX-Equinix Fabric',
                    name: 'Equinix Fabric',
                    icon: Network,
                    description: 'Layer 2/3 virtual connections to cloud providers, network services, and enterprises.',
                    tags: ['AWS Direct Connect', 'Azure ExpressRoute', 'GCP Interconnect', 'Enterprise MPLS'],
                    maxLag: 8,
                    colors: {
                      iconBg: 'bg-blue-50',
                      iconBgSelected: 'bg-blue-500',
                      iconText: 'text-blue-600',
                      iconTextSelected: 'text-white',
                      tagBg: 'bg-blue-50',
                      tagText: 'text-blue-700',
                      tagBorder: 'border-blue-200',
                      border: 'border-blue-500',
                      bgTint: 'bg-blue-50/50',
                      check: 'bg-blue-500',
                    }
                  },
                  {
                    value: 'IX',
                    name: 'Internet Exchange',
                    icon: Globe,
                    description: 'Peer with hundreds of networks at IX exchanges.',
                    tags: ['BGP Peering', 'Route Server', 'CDN Peering', 'Transit-free routing'],
                    maxLag: 10,
                    colors: {
                      iconBg: 'bg-teal-50',
                      iconBgSelected: 'bg-teal-500',
                      iconText: 'text-teal-600',
                      iconTextSelected: 'text-white',
                      tagBg: 'bg-teal-50',
                      tagText: 'text-teal-700',
                      tagBorder: 'border-teal-200',
                      border: 'border-teal-500',
                      bgTint: 'bg-teal-50/50',
                      check: 'bg-teal-500',
                    }
                  },
                  {
                    value: 'IA',
                    name: 'Internet Access',
                    icon: Wifi,
                    description: 'Direct internet access with NAT, DDoS protection, and IP addressing.',
                    tags: ['Dedicated internet', 'DDoS protection', 'IP transit', 'NAT services'],
                    maxLag: 8,
                    colors: {
                      iconBg: 'bg-green-50',
                      iconBgSelected: 'bg-green-500',
                      iconText: 'text-green-600',
                      iconTextSelected: 'text-white',
                      tagBg: 'bg-green-50',
                      tagText: 'text-green-700',
                      tagBorder: 'border-green-200',
                      border: 'border-green-500',
                      bgTint: 'bg-green-50/50',
                      check: 'bg-green-500',
                    }
                  },
                  {
                    value: 'MC',
                    name: 'Metro Connect',
                    icon: MapPin,
                    description: 'Low-latency point-to-point connections within metro.',
                    tags: ['DR replication', 'Campus interconnect', 'Low-latency trading', 'Multi-site LAN'],
                    maxLag: 8,
                    colors: {
                      iconBg: 'bg-orange-50',
                      iconBgSelected: 'bg-orange-500',
                      iconText: 'text-orange-600',
                      iconTextSelected: 'text-white',
                      tagBg: 'bg-orange-50',
                      tagText: 'text-orange-700',
                      tagBorder: 'border-orange-200',
                      border: 'border-orange-500',
                      bgTint: 'bg-orange-50/50',
                      check: 'bg-orange-500',
                    }
                  },
                ].map((product) => {
                  const Icon = product.icon;
                  const isSelected = formData.product_type === product.value;
                  return (
                    <button
                      key={product.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, product_type: product.value }))}
                      className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg hover:scale-[1.01] ${
                        isSelected
                          ? `${product.colors.border} ${product.colors.bgTint} shadow-md`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-5">
                        {/* Icon and Title */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${
                              isSelected ? product.colors.iconBgSelected : product.colors.iconBg
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isSelected ? product.colors.iconTextSelected : product.colors.iconText
                              }`} />
                            </div>
                            <h4 className="font-semibold text-[15px] text-gray-900">{product.name}</h4>
                          </div>
                          {isSelected && (
                            <div className={`w-6 h-6 ${product.colors.check} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[13px] text-gray-500 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2">
                          {product.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 ${product.colors.tagBg} ${product.colors.tagText} border ${product.colors.tagBorder} text-xs font-medium rounded-md`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Max LAG Ports */}
                        <div className="pt-4 mt-1 border-t border-gray-200">
                          <span className="text-xs font-medium text-gray-500">
                            Max LAG ports: <span className="text-gray-900 font-semibold">{product.maxLag}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Location & Network</h3>
                <p className="text-sm text-gray-600">Where will this service be deployed?</p>
              </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Which region?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'AMER', label: 'AMER', desc: '' },
                    { value: 'EMEA', label: 'EMEA', desc: '' },
                    { value: 'APAC', label: 'APAC', desc: '' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, region: option.value }))}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.region === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{option.label}</span>
                        {formData.region === option.value && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Metro location
                  </label>
                  <Input
                    name="metro"
                    value={formData.metro}
                    onChange={handleChange}
                    size="large"
                    placeholder="e.g., SV, NY, LD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    IBX data center
                  </label>
                  <Input
                    name="ibx"
                    value={formData.ibx}
                    onChange={handleChange}
                    size="large"
                    placeholder="e.g., SV1, NY4"
                  />
                </div>
              </div>

              {/* <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-gray-900">IP Configuration</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ASN
                    </label>
                    <input
                      type="number"
                      name="asn"
                      value={formData.asn}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Autonomous System Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IPv4 Address
                    </label>
                    <input
                      type="text"
                      name="ipv4_address"
                      value={formData.ipv4_address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="0.0.0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IPv6 Address
                    </label>
                    <input
                      type="text"
                      name="ipv6_address"
                      value={formData.ipv6_address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="::"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostname
                    </label>
                    <input
                      type="text"
                      name="hostname"
                      value={formData.hostname}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="hostname"
                    />
                  </div>
                </div>
              </div> */}
            </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Customer & Commercial Configuration</h3>
                <p className="text-sm text-gray-600">
                  Enter customer details, port specifications, and commercial terms for this SVC.
                </p>
              </div>

              {/* Info Banner */}
              {formData.order_id && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Fields pre-populated from order <strong>#{formData.order_id}</strong>. Review and modify as needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {/* Section 1: Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        size="large"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="customer_number"
                        value={formData.customer_number}
                        onChange={handleChange}
                        required
                        size="large"
                        placeholder="Enter account ID"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SVC Name
                    </label>
                    <Input
                      name="svc_name"
                      value={formData.svc_name}
                      onChange={handleChange}
                      size="large"
                      placeholder="e.g. Acme Corp NY Fabric (auto-generated if empty)"
                    />
                  </div>
                </div>

                {/* Section 2: Port Specifications */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Port Specifications</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port Speed <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.capacity}
                        onChange={(value) => setFormData(prev => ({ ...prev, capacity: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                          { value: '1G', label: '1G' },
                          { value: '10G', label: '10G' },
                          { value: '40G', label: '40G' },
                          { value: '100G', label: '100G' },
                          { value: '400G', label: '400G' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Committed Bandwidth (Mbps) <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        name="committed_bandwidth"
                        value={Number(formData.committed_bandwidth)}
                        onChange={(value) => setFormData(prev => ({ ...prev, committed_bandwidth: String(value || '') }))}
                        required
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VLAN Range Min
                      </label>
                      <InputNumber
                        name="vlan_min"
                        value={formData.vlan_min ? Number(formData.vlan_min) : undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, vlan_min: String(value || '') }))}
                        min={1}
                        max={4094}
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VLAN Range Max
                      </label>
                      <InputNumber
                        name="vlan_max"
                        value={formData.vlan_max ? Number(formData.vlan_max) : undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, vlan_max: String(value || '') }))}
                        min={1}
                        max={4094}
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="4094"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valid range: 1 – 4094</p>
                </div>

                {/* Section 3: Commercial Terms */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commercial Terms</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Tier
                      </label>
                      <Select
                        value={formData.service_tier}
                        onChange={(value) => setFormData(prev => ({ ...prev, service_tier: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                          { value: 'Standard', label: 'Standard' },
                          { value: 'Premium', label: 'Premium' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commitment Term
                      </label>
                      <Select
                        value={formData.commitment_term}
                        onChange={(value) => setFormData(prev => ({ ...prev, commitment_term: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                          { value: '1 Year', label: '1 Year' },
                          { value: '2 Years', label: '2 Years' },
                          { value: '3 Years', label: '3 Years' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Cycle
                      </label>
                      <Select
                        value={formData.billing_cycle}
                        onChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                          { value: 'Monthly', label: 'Monthly' },
                          { value: 'Annual', label: 'Annual' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 5:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Service Configuration</h3>
                <p className="text-sm text-gray-600">
                  Configure product-specific settings for Internet Exchange.
                </p>
              </div>

              {/* Helper Info */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm text-blue-700">
                  These settings define how your network will peer with other participants.
                </p>
              </div>

              <div className="space-y-8">
                {/* Section 1: IX Setup */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IX Setup</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IX Provider <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.ix_provider || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, ix_provider: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="Select IX provider"
                        options={[
                          { value: 'AMS-IX', label: 'AMS-IX' },
                          { value: 'DE-CIX', label: 'DE-CIX' },
                          { value: 'LINX', label: 'LINX' },
                          { value: 'Equinix IX', label: 'Equinix IX' },
                          { value: 'France-IX', label: 'France-IX' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your BGP AS Number <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        name="bgp_asn"
                        value={formData.bgp_asn ? Number(formData.bgp_asn) : undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, bgp_asn: String(value || '') }))}
                        required
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="e.g., 64512"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your public ASN (e.g., 64512)</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Peering Configuration */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Peering Configuration</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peering Type
                      </label>
                      <Select
                        value={formData.peering_type}
                        onChange={(value) => setFormData(prev => ({ ...prev, peering_type: value }))}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                          { value: 'Private Peering', label: 'Private Peering' },
                          { value: 'Public Peering', label: 'Public Peering' },
                          { value: 'Both', label: 'Both' }
                        ]}
                      />
                      {formData.peering_type === 'Private Peering' && (
                        <p className="text-xs text-amber-600 mt-2">
                          You will need to configure peers manually.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Server Peer
                      </label>
                      <div className="flex items-center gap-3 h-[42px]">
                        <Switch
                          checked={formData.route_server_enabled}
                          onChange={(checked) => setFormData((prev) => ({ ...prev, route_server_enabled: checked }))}
                        />
                        <span className={`text-sm font-medium ${formData.route_server_enabled ? 'text-blue-700' : 'text-gray-700'}`}>
                          {formData.route_server_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Route Server allows simplified peering with multiple networks via a single BGP session.
                      </p>
                      {formData.route_server_enabled && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ Route server configuration will be applied automatically.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Additional Settings</h4>
{/*
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Status
                      </label>
                      <select
                        name="order_status"
                        value={formData.order_status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      >
                        <option value="New">New</option>
                        <option value="Upgrade">Upgrade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Status Date
                      </label>
                      <input
                        type="date"
                        name="order_status_date"
                        value={formData.order_status_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, type: 'customer' }))}
                          className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                            formData.type === 'customer'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, type: 'provider' }))}
                          className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                            formData.type === 'provider'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Provider
                        </button>
                      </div>
                    </div>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enable LAG
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, has_lag: true }))}
                        className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                          formData.has_lag
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, has_lag: false, lag_group_id: '' }))}
                        className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                          !formData.has_lag
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 6:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Physical Port</h3>
                <p className="text-sm text-gray-600">Port assignment</p>
              </div>

            <div className="space-y-5">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Physical Port Configuration
                </p>
                {/* <p className="text-sm text-gray-600">
                  Port assignment will be configured in the next phase.
                </p> */}
              </div>
            </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      case 7:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Review Sections */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Review & Confirm</h3>
                <p className="text-sm text-gray-600">
                  Review all configuration details before creating the SVC. Click "Edit" to modify any section.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-700">
                      Ready to create {formData.product_type === 'IX' ? 'Internet Exchange' :
                        formData.product_type === 'IA' ? 'Internet Access' :
                        formData.product_type === 'CX-Equinix Fabric' ? 'Equinix Fabric' :
                        formData.product_type === 'MC' ? 'Metro Connect' : ''} SVC
                      {formData.customer_name && ` for ${formData.customer_name}`}
                      {formData.ibx && ` at ${formData.ibx}`}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Section 1: Order & Product */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Order & Product</h4>
                    <Button
                      type="link"
                      onClick={() => setCurrentStep(1)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {formData.order_id && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order ID</p>
                          <p className="text-sm font-medium text-gray-900">{formData.order_id}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Product</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formData.product_type === 'IX' ? 'Internet Exchange' :
                           formData.product_type === 'IA' ? 'Internet Access' :
                           formData.product_type === 'CX-Equinix Fabric' ? 'Equinix Fabric' :
                           formData.product_type === 'MC' ? 'Metro Connect' : formData.product_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</h4>
                    <Button
                      type="link"
                      onClick={() => setCurrentStep(3)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Region</p>
                        <p className="text-sm font-medium text-gray-900">{formData.region}</p>
                      </div>
                      {formData.metro && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Metro</p>
                          <p className="text-sm font-medium text-gray-900">{formData.metro}</p>
                        </div>
                      )}
                      {formData.ibx && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">IBX</p>
                          <p className="text-sm font-medium text-gray-900">{formData.ibx}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Customer & Commercial */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer & Commercial</h4>
                    <Button
                      type="link"
                      onClick={() => setCurrentStep(4)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Customer</p>
                        <p className="text-sm font-medium text-gray-900">{formData.customer_name || '—'}</p>
                      </div>
                      {formData.customer_number && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Account ID</p>
                          <p className="text-sm font-medium text-gray-900">{formData.customer_number}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Port Speed</p>
                        <p className="text-sm font-medium text-gray-900">{formData.capacity}</p>
                      </div>
                      {formData.committed_bandwidth && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bandwidth</p>
                          <p className="text-sm font-medium text-gray-900">{formData.committed_bandwidth} Mbps</p>
                        </div>
                      )}
                    </div>

                    {(formData.vlan_min || formData.vlan_max) && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-500 mb-1">VLAN Range</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formData.vlan_min || '1'} – {formData.vlan_max || '4094'}
                        </p>
                      </div>
                    )}

                    {(formData.service_tier || formData.commitment_term || formData.billing_cycle) && (
                      <div className="border-t border-gray-200 pt-3 grid grid-cols-3 gap-3">
                        {formData.service_tier && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tier</p>
                            <p className="text-sm font-medium text-gray-900">{formData.service_tier}</p>
                          </div>
                        )}
                        {formData.commitment_term && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Commitment</p>
                            <p className="text-sm font-medium text-gray-900">{formData.commitment_term}</p>
                          </div>
                        )}
                        {formData.billing_cycle && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Billing</p>
                            <p className="text-sm font-medium text-gray-900">{formData.billing_cycle}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Service Configuration */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Service Configuration</h4>
                    <Button
                      type="link"
                      onClick={() => setCurrentStep(5)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="p-5">
                    {formData.product_type === 'IX' && (formData.ix_provider || formData.bgp_asn) ? (
                      <div className="grid grid-cols-2 gap-3">
                        {formData.ix_provider && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">IX Provider</p>
                            <p className="text-sm font-medium text-gray-900">{formData.ix_provider}</p>
                          </div>
                        )}
                        {formData.bgp_asn && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">ASN</p>
                            <p className="text-sm font-medium text-gray-900">{formData.bgp_asn}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Peering</p>
                          <p className="text-sm font-medium text-gray-900">{formData.peering_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Route Server</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            formData.route_server_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {formData.route_server_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-400">Not configured</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5: Physical Port */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Physical Port</h4>
                    <Button
                      type="link"
                      onClick={() => setCurrentStep(6)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="p-5">
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No physical port assigned</p>
                      <p className="text-xs text-gray-400">SVC will start in RESERVED status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration Summary Panel */}
            {renderConfigurationSummary()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-white">Add New Service</h2>
          <p className="text-gray-300 text-sm mt-1">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div> */}

      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${
                      currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {renderStepContent()}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            icon={<ChevronLeft className="w-4 h-4" />}
            size="large"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === step.id ? 'bg-blue-500 w-8' : currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="end"
              size="large"
            >
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={submitting || !isStepValid(currentStep)}
              loading={submitting}
              icon={!submitting ? <Check className="w-4 h-4" /> : undefined}
              iconPosition="end"
              size="large"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              {submitting ? 'Creating...' : 'Create Service'}
            </Button>
          )}
        </div>
    </div>
  );
}
