interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'default';
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  PROVISIONED: {
    color: '#0f5323',
    bg: '#e6f4ea',
    border: '#9fd0aa',
    dot: '#0f5323',
  },
  PROVISIONING: {
    color: '#8a5a00',
    bg: '#fff4e6',
    border: '#ffc966',
    dot: '#ff9900',
  },
  DEPROVISIONING: {
    color: '#8a5a00',
    bg: '#fff4e6',
    border: '#ffc966',
    dot: '#ff9900',
  },
  PENDING: {
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fcd34d',
    dot: '#d97706',
  },
  ACTIVE: {
    color: '#0f5323',
    bg: '#e6f4ea',
    border: '#9fd0aa',
    dot: '#0f5323',
  },
  INSTALLED: {
    color: '#0f5323',
    bg: '#e6f4ea',
    border: '#9fd0aa',
    dot: '#0f5323',
  },
  ERROR: {
    color: '#b91c1c',
    bg: '#fee2e2',
    border: '#fca5a5',
    dot: '#b91c1c',
  },
  FAILED: {
    color: '#b91c1c',
    bg: '#fee2e2',
    border: '#fca5a5',
    dot: '#b91c1c',
  },
  INACTIVE: {
    color: '#4b5563',
    bg: '#f3f4f6',
    border: '#d1d5db',
    dot: '#6b7280',
  },
  RESERVED: {
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#93c5fd',
    dot: '#2563eb',
  },
  ADDED: {
    color: '#059669',
    bg: '#d1fae5',
    border: '#6ee7b7',
    dot: '#059669',
  },
};

const STATUS_LABELS: Record<string, string> = {
  PROVISIONED: 'Provisioned',
  PROVISIONING: 'Provisioning',
  DEPROVISIONING: 'Deprovisioning',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  INSTALLED: 'Installed',
  ERROR: 'Error',
  FAILED: 'Failed',
  INACTIVE: 'Inactive',
  RESERVED: 'Reserved',
  ADDED: 'Added',
};

export default function StatusBadge({ status, size = 'default', showDot = true }: StatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['RESERVED'];
  const label = STATUS_LABELS[normalizedStatus] || status;
  const isAnimated = normalizedStatus === 'PROVISIONING' || normalizedStatus === 'DEPROVISIONING';

  const Tag = 'span';

  return (
    <>
      <style>{`
        @keyframes status-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .status-pulse {
          animation: status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <Tag
        style={{
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: 4,
          fontSize: size === 'small' ? 11 : 12,
          fontWeight: 500,
          padding: size === 'small' ? '0 6px' : '1px 8px',
          lineHeight: size === 'small' ? '18px' : '22px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          margin: 0,
        }}
      >
        {showDot && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: config.dot,
              flexShrink: 0,
            }}
            className={isAnimated ? 'status-pulse' : undefined}
          />
        )}
        {label}
      </Tag>
    </>
  );
}
