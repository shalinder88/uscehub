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
    <div className="grid grid-cols-3 divide-x divide-slate-700">
      {stats.map((stat) => (
        <div key={stat.label} className="px-6 py-4 text-center">
          <div className="text-2xl font-bold text-white sm:text-3xl">
            {stat.value}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
