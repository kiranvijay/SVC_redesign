import { useState } from 'react';
import { Plus, Minus, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddSVCFormAccordionProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  customer_name: string;
  customer_number: string;
  svc_name: string;
  product_type: string;
  capacity: string;
  vlan: string;
  asn: string;
  ipv4_address: string;
  ipv6_address: string;
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
  hostname: string;
}

type SectionKey = 'customer' | 'service' | 'location' | 'technical';

export default function AddSVCFormAccordion({ onClose, onSuccess }: AddSVCFormAccordionProps) {
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_number: '',
    svc_name: '',
    product_type: 'IA',
    capacity: '10G',
    vlan: '',
    asn: '',
    ipv4_address: '',
    ipv6_address: '',
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
    hostname: '',
  });

  const [expandedSection, setExpandedSection] = useState<SectionKey>('service');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSection(expandedSection === section ? ('' as SectionKey) : section);
  };

  const isSectionComplete = (section: SectionKey): boolean => {
    switch (section) {
      case 'customer':
        return !!formData.customer_name;
      case 'service':
        return !!formData.product_type;
      case 'location':
        return !!formData.region;
      case 'technical':
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Service Configuration</h2>
          <div className="text-white/90 text-sm">
            {formData.region} → {formData.metro} → {formData.ibx}
          </div>
        </div>
      </div> */}

      <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Customer Information */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('customer')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isSectionComplete('customer') ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Customer Information</h3>
                    <p className="text-sm text-gray-500">Who is this service for?</p>
                  </div>
                </div>
                {expandedSection === 'customer' ? (
                  <Minus className="w-5 h-5 text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'customer' && (
                <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter customer name"
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Customer Number
                      </label>
                      <input
                        type="text"
                        name="customer_number"
                        value={formData.customer_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter customer number"
                      />
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            {/* Service Configuration */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('service')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isSectionComplete('service') ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Service Configuration</h3>
                    <p className="text-sm text-gray-500">Define the service details and specifications</p>
                  </div>
                </div>
                {expandedSection === 'service' ? (
                  <Minus className="w-5 h-5 text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'service' && (
                <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: 'IA', label: 'IA - Internet Access' },
                          { value: 'CX-Equinix Fabric', label: 'CX - Equinix Fabric' },
                          { value: 'IX', label: 'IX - Internet Exchange' },
                          { value: 'MC', label: 'MC - Metro Connect' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, product_type: option.value }))}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                              formData.product_type === option.value
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                              {formData.product_type === option.value && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>



                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Service Builder</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Encapsulation
                          </label>
                          <select
                            name="encapsulation"
                            value={formData.encapsulation}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                          >
                            <option value="">Select Encapsulation</option>
                            <option value="Dot1q">Dot1q</option>
                            <option value="Qinq">Qinq</option>
                            <option value="UNTAGGEDPMC">UNTAGGEDPMC</option>
                            <option value="untaggedEPL">untaggedEPL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tag Protocol ID
                          </label>
                          <select
                            name="tag_protocol"
                            value={formData.tag_protocol}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                          >
                            <option value="">None</option>
                            <option value="dot1q">802.1Q</option>
                            <option value="qinq">QinQ</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location & Network Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('location')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isSectionComplete('location') ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Location & Network Details</h3>
                    <p className="text-sm text-gray-500">Where will this service be deployed?</p>
                  </div>
                </div>
                {expandedSection === 'location' ? (
                  <Minus className="w-5 h-5 text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'location' && (
                <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Region
                        </label>
                        <select
                          name="region"
                          value={formData.region}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="AMER">AMER </option>
                          <option value="EMEA">EMEA</option>
                          <option value="APAC">APAC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Metro
                        </label>
                        <input
                          type="text"
                          name="metro"
                          value={formData.metro}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="e.g., SV, NY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IBX
                        </label>
                        <input
                          type="text"
                          name="ibx"
                          value={formData.ibx}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="IBX data center"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">IP Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ASN
                          </label>
                          <input
                            type="number"
                            name="asn"
                            value={formData.asn}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Autonomous System Number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            IPv4 Address
                          </label>
                          <input
                            type="text"
                            name="ipv4_address"
                            value={formData.ipv4_address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="0.0.0.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            IPv6 Address
                          </label>
                          <input
                            type="text"
                            name="ipv6_address"
                            value={formData.ipv6_address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="::"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Hostname
                          </label>
                          <input
                            type="text"
                            name="hostname"
                            value={formData.hostname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Hostname"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Configuration */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('technical')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isSectionComplete('technical') ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Technical Configuration</h3>
                    <p className="text-sm text-gray-500">Advanced network settings</p>
                  </div>
                </div>
                {expandedSection === 'technical' ? (
                  <Minus className="w-5 h-5 text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'technical' && (
                <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Order Status
                        </label>
                        <select
                          name="order_status"
                          value={formData.order_status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        >
                          <option value="New">New</option>
                          <option value="Upgrade">Upgrade</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Order Status Date
                        </label>
                        <input
                          type="date"
                          name="order_status_date"
                          value={formData.order_status_date}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What is the type?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, type: 'customer' }))}
                            className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                              formData.type === 'customer'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Customer
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, type: 'provider' }))}
                            className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                              formData.type === 'provider'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Provider
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Do you want to enable LAG?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, has_lag: true }))}
                          className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                            formData.has_lag
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, has_lag: false, lag_group_id: '' }))}
                          className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                            !formData.has_lag
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Creating Service...' : 'Create Service'}
            </button>
          </div>
        </form>
    </div>
  );
}
