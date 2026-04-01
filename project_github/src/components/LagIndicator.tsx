import { Tooltip } from 'antd';

interface LagIndicatorProps {
  current: number;
  max: number;
  showText?: boolean;
}

export default function LagIndicator({ current, max, showText = true }: LagIndicatorProps) {
  return (
    <Tooltip title={`${current} of ${max} LAG ports used`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="lag-indicator">
          {Array.from({ length: max }).map((_, i) => (
            <span
              key={i}
              className={`lag-dot ${i < current ? (current === max ? 'max' : 'active') : ''}`}
            />
          ))}
        </div>
        {showText && (
          <span style={{ fontSize: 12, color: '#595959', fontVariantNumeric: 'tabular-nums' }}>
            {current}/{max}
          </span>
        )}
      </div>
    </Tooltip>
  );
}
