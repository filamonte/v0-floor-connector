"use client";

type WeatherDay = {
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
};

type DashboardWeatherWidgetProps = {
  currentCondition?: string;
  currentTemp?: number;
  forecast?: WeatherDay[];
};

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#ea580c]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#64748b]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8.5 19a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
      <path d="M8.5 14.5a4.5 4.5 0 0 1 9 0" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#3b82f6]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6M8 14v6M12 16v6" />
    </svg>
  );
}

function PartlyCloudyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#ea580c]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" />
      <path d="M15.947 12.65a4 4 0 1 0-5.925-4.128" />
      <path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 0 6H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

function WeatherIcon({ condition }: { condition: WeatherDay["condition"] }) {
  switch (condition) {
    case "sunny":
      return <SunIcon />;
    case "cloudy":
      return <CloudIcon />;
    case "rainy":
      return <RainIcon />;
    case "partly-cloudy":
      return <PartlyCloudyIcon />;
    default:
      return <SunIcon />;
  }
}

const DEFAULT_FORECAST: WeatherDay[] = [
  { day: "Sun", high: 54, low: 38, condition: "sunny" },
  { day: "Mon", high: 48, low: 32, condition: "partly-cloudy" },
  { day: "Tue", high: 52, low: 29, condition: "cloudy" },
  { day: "Wed", high: 55, low: 38, condition: "sunny" },
  { day: "Thu", high: 63, low: 41, condition: "partly-cloudy" },
  { day: "Fri", high: 62, low: 43, condition: "sunny" },
  { day: "Sat", high: 55, low: 41, condition: "rainy" }
];

export function DashboardWeatherWidget({
  currentCondition = "Clear",
  currentTemp = 54,
  forecast = DEFAULT_FORECAST
}: DashboardWeatherWidgetProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">{currentCondition}</h2>
        <span className="text-sm font-medium text-[#ea580c]">{currentTemp}°F</span>
      </div>

      <div className="px-3 pb-3">
        <div className="grid grid-cols-7 gap-0.5">
          {forecast.map((day) => (
            <div
              key={day.day}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <span className="text-[9px] font-medium uppercase tracking-wider text-[#94a3b8]">
                {day.day}
              </span>
              <WeatherIcon condition={day.condition} />
              <div className="text-center">
                <span className="block text-[10px] font-semibold text-[#17243b]">
                  {day.high}°
                </span>
                <span className="block text-[9px] text-[#94a3b8]">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-[10px] text-[#94a3b8]">
          Warming up with a chance of rain Saturday.
        </p>
      </div>
    </section>
  );
}
