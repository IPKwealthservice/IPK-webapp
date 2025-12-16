import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------
 MOCK DATA (replace with API later)
------------------------------------------------------------------- */
const onboardingData = [
  {
    id: "IPK25110061",
    name: "Karthik Madhu",
    source: "Walk-in",
    mobile: "9748271564",
    status: "NEW",
    clientId: "-",
  },
  {
    id: "IPK25110055",
    name: "Kishoreganesh Kumar",
    source: "Referral",
    mobile: "9597423583",
    status: "NEW",
    clientId: "-",
  },
  {
    id: "IPK25110021",
    name: "Arun Kumar",
    source: "Facebook Ads",
    mobile: "9876543210",
    status: "COMPLETED",
    clientId: "-",
  },
];

/* ------------------------------------------------------------------
 REUSABLE TABLE
------------------------------------------------------------------- */
function OnboardingTable({
  title,
  rows,
}: {
  title: string;
  rows: typeof onboardingData;
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-10">
      <h3 className="text-md font-semibold mb-3">{title}</h3>

      <div className="bg-white rounded-xl shadow border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-3">LEAD ID</th>
              <th className="p-3">NAME</th>
              <th className="p-3">MOBILE</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">CLIENT ID</th>
              <th className="p-3">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium">{row.id}</td>

                <td className="p-3">
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-gray-400">{row.source}</div>
                </td>

                <td className="p-3">{row.mobile}</td>

                <td className="p-3">
                  {row.status === "COMPLETED" ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Completed
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                <td className="p-3">{row.clientId}</td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      navigate("/sales/onboarding/process")
                    }
                    className={`px-3 py-1 text-sm rounded-lg text-white
                      ${
                        row.status === "COMPLETED"
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-brand-500 hover:bg-brand-600"
                      }`}
                  >
                    {row.status === "COMPLETED" ? "View" : "Onboard"}
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-400"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 MAIN PAGE
------------------------------------------------------------------- */
export default function OnboardingListPage() {
  const newOnboardList = onboardingData.filter(
    (i) => i.status !== "COMPLETED"
  );

  const completedList = onboardingData.filter(
    (i) => i.status === "COMPLETED"
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-6">Onboarding List</h2>

      {/* New Onboard */}
      <OnboardingTable
        title="New Onboard List"
        rows={newOnboardList}
      />

      {/* Completed */}
      <OnboardingTable
        title="Onboarding Completed"
        rows={completedList}
      />
    </div>
  );
}
