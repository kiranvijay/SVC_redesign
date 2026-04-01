import { useState, useEffect } from 'react';
import {
  Drawer,
  Steps,
  Button,
  Radio,
  Table,
  Alert,
  Spin,
  Result,
  Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Server, Plus, Link as LinkIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface AttachPortDrawerProps {
  open: boolean;
  virtualPort: any;
  onClose: () => void;
  onSuccess: () => void;
}

type AttachMode = 'provision' | 'lag';

export default function AttachPortDrawer({
  open,
  virtualPort,
  onClose,
  onSuccess,
}: AttachPortDrawerProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<AttachMode>('provision');
  const [availablePorts, setAvailablePorts] = useState<any[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && virtualPort) {
      setStep(0);
      setMode('provision');
      setSelectedPortId('');
      setDone(false);
      setError('');
      loadPorts();
    }
  }, [open, virtualPort?.ibx]);

  const loadPorts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailablePorts([
        {
          id: '1',
          port_id: 'PP-SV5-001',
          device_name: 'SW-SV5-CORE-01',
          port_speed: '10G',
          slot_number: 'Slot 1/0/1',
          status: 'AVAILABLE',
        },
        {
          id: '2',
          port_id: 'PP-SV5-002',
          device_name: 'SW-SV5-CORE-01',
          port_speed: '10G',
          slot_number: 'Slot 1/0/2',
          status: 'AVAILABLE',
        },
      ]);
    } catch {
      setAvailablePorts([]);
    } finally {
      setLoading(false);
    }
  };

  const lagIndex = (virtualPort?.lag_count || 0) + 1;
  const maxLag = virtualPort?.max_lag_count || 8;
  const remaining = maxLag - (virtualPort?.lag_count || 0);
  const lagPercent = Math.round(((virtualPort?.lag_count || 0) / maxLag) * 100);

  const handleConfirm = async () => {
    if (!selectedPortId) return;
    setSubmitting(true);
    setError('');

    try {
      // Mock attachment - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDone(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const portColumns: ColumnsType<any> = [
    {
      title: '',
      key: 'select',
      width: 44,
      render: (_, record) => (
        <Radio
          checked={selectedPortId === record.id}
          onChange={() => setSelectedPortId(record.id)}
        />
      ),
    },
    {
      title: 'Port ID',
      dataIndex: 'port_id',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Device',
      dataIndex: 'device_name',
      render: (val) => <span style={{ fontSize: 13 }}>{val}</span>,
    },
    {
      title: 'Speed',
      dataIndex: 'port_speed',
      width: 70,
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>
      ),
    },
    {
      title: 'Slot',
      dataIndex: 'slot_number',
      render: (val) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{val || '—'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  const steps = [
    { title: 'Select Mode' },
    { title: 'Choose Port' },
    { title: 'Confirm' },
  ];

  if (!virtualPort) return null;

  if (done) {
    const selected = availablePorts.find((p) => p.id === selectedPortId);
    return (
      <Drawer
        open={open}
        onClose={onClose}
        width={560}
        title="Attach Physical Port"
        footer={
          <Button type="primary" onClick={onSuccess} style={{ width: '100%' }}>
            Done
          </Button>
        }
      >
        <Result
          status="success"
          title="Physical Port Attached"
          subTitle={
            <div>
              <strong>{selected?.port_id}</strong> has been attached as LAG member{' '}
              <strong>{lagIndex}</strong> to <strong>{virtualPort.svc_id}</strong>.
              <div style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>
                The port is now in PROVISIONING status.
              </div>
            </div>
          }
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={
        <div>
          <div style={{ fontWeight: 700, color: '#1a1a2e' }}>Attach Physical Port</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
            {virtualPort.svc_id} · {virtualPort.ibx || 'SV5'}
          </div>
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {step > 0 && (
            <Button onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          {step < 2 ? (
            <Button
              type="primary"
              disabled={step === 1 && !selectedPortId}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              loading={submitting}
              disabled={!selectedPortId}
              onClick={handleConfirm}
              icon={<LinkIcon size={14} />}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {submitting ? 'Attaching...' : 'Confirm Attach'}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <Steps current={step} size="small" items={steps} />
      </div>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e6f4ff',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            LAG Slot {lagIndex} of {maxLag}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {remaining - 1} slots will remain after this attachment
          </div>
        </div>
        <div style={{ width: 100 }}>
          <Progress
            percent={lagPercent}
            size="small"
            strokeColor="#1677ff"
            showInfo={false}
          />
          <div style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c' }}>
            {virtualPort?.lag_count || 0}/{maxLag}
          </div>
        </div>
      </div>

      {step === 0 && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>
            What would you like to do?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              onClick={() => setMode('provision')}
              style={{
                border: `2px solid ${mode === 'provision' ? '#1677ff' : '#f0f0f0'}`,
                borderRadius: 10,
                padding: 16,
                cursor: 'pointer',
                background: mode === 'provision' ? '#e6f4ff' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Radio checked={mode === 'provision'} onChange={() => setMode('provision')} />
                <Server size={18} color={mode === 'provision' ? '#1677ff' : '#8c8c8c'} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a2e' }}>Provision New Port</div>
                  <div style={{ fontSize: 13, color: '#595959' }}>
                    Assign an available physical port from {virtualPort.ibx || 'SV5'} inventory
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setMode('lag')}
              style={{
                border: `2px solid ${mode === 'lag' ? '#1677ff' : '#f0f0f0'}`,
                borderRadius: 10,
                padding: 16,
                cursor: 'pointer',
                background: mode === 'lag' ? '#e6f4ff' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Radio checked={mode === 'lag'} onChange={() => setMode('lag')} />
                <Plus size={18} color={mode === 'lag' ? '#1677ff' : '#8c8c8c'} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a2e' }}>Add LAG Member</div>
                  <div style={{ fontSize: 13, color: '#595959' }}>
                    Add another physical port to expand LAG group capacity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 500 }}>
            Select an available port at {virtualPort.ibx || 'SV5'}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
              <div style={{ marginTop: 10, color: '#8c8c8c' }}>Loading available ports...</div>
            </div>
          )}

          {!loading && availablePorts.length === 0 && (
            <Alert
              type="warning"
              message={`No available physical ports found at ${virtualPort.ibx || 'SV5'}.`}
              showIcon
            />
          )}

          {!loading && availablePorts.length > 0 && (
            <Table
              columns={portColumns}
              dataSource={availablePorts}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({
                onClick: () => setSelectedPortId(record.id),
                style: {
                  cursor: 'pointer',
                  background: selectedPortId === record.id ? '#e6f4ff' : undefined,
                },
              })}
              style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}
            />
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
            Review and confirm the port attachment
          </div>

          {(() => {
            const selected = availablePorts.find((p) => p.id === selectedPortId);
            return selected ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f0f0f0',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    ['Physical Port', selected.port_id],
                    ['Device', selected.device_name],
                    ['Speed', selected.port_speed],
                    ['Slot', selected.slot_number || '—'],
                    ['LAG Index', String(lagIndex)],
                    ['Virtual Port', virtualPort.svc_id],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <Alert
                  type="info"
                  message="The physical port will be marked IN_USE and the link will start in PROVISIONING status."
                  style={{ marginTop: 14, borderRadius: 8 }}
                  showIcon
                />
              </div>
            ) : null;
          })()}

          {error && (
            <Alert
              type="error"
              message="Attachment failed"
              description={error}
              style={{ marginTop: 12, borderRadius: 8 }}
              showIcon
            />
          )}
        </div>
      )}
    </Drawer>
  );
}
