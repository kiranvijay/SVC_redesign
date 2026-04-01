interface ServiceSummaryProps {
  total: number;
  active: number;
  pending: number;
  errors: number;
}

export default function ServiceSummary({ total, active, pending, errors }: ServiceSummaryProps) {
  const stats = [
    {
      label: 'Total Services',
      value: total,
      description: 'All Services',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      subTextColor: 'text-blue-600',
    },
    {
      label: 'Provisioned',
      value: active,
      description: 'Currently Active',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      subTextColor: 'text-green-600',
    },
    {
      label: 'Ports With Connections',
      value: pending,
      description: 'Awaiting Approval',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      subTextColor: 'text-purple-600',
    },
    {
      label: 'Errors',
      value: errors,
      description: 'Need Attention',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      subTextColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-lg ${stat.bgColor} p-4`}>
          <h3 className="text-gray-700 text-sm font-medium">{stat.label}</h3>
          <div className="mt-1">
            <div className={`${stat.textColor} text-2xl font-semibold`}>{stat.value}</div>
            <div className={`${stat.subTextColor} text-sm`}>{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
