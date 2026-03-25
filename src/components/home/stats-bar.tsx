interface StatsBarProps {
  listingCount: number;
  stateCount: number;
  specialtyCount: number;
}

export function StatsBar({ listingCount, stateCount, specialtyCount }: StatsBarProps) {
  const stats = [
    { value: listingCount, label: "Active Listings" },
    { value: stateCount, label: "States Covered" },
    { value: specialtyCount, label: "Specialties" },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="px-6 py-4 text-center">
          <div className="text-2xl font-bold text-foreground sm:text-3xl">
            {stat.value}
          </div>
          <div className="mt-1 text-xs font-medium text-muted sm:text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
