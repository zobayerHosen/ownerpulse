import React, { useRef } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RosterSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-3 px-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200" />
        <div className="w-28 h-4 bg-gray-200 rounded" />
      </div>
    </td>
    <td className="py-3 px-2">
      <div className="w-20 h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 text-center">
      <div className="w-8 h-4 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="py-3 px-2 text-center">
      <div className="w-8 h-4 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="py-3 px-2">
      <div className="flex items-center gap-2 justify-center">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
        <div className="w-6 h-3 bg-gray-200 rounded" />
      </div>
    </td>
  </tr>
);

const StaffRosterTable = ({
  staffRoster = [],
  sortBy,
  onSortChange,
  pagination,
  onLoadMore,
  isLoadingMore,
}) => {
  const hasMore = pagination ? Number(pagination.current_page) < Number(pagination.last_page) : false;
  const listContainerRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight <= 50) {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const sorted = React.useMemo(() => {
    return [...staffRoster].sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "ptoUsed") return (b.pto_used ?? 0) - (a.pto_used ?? 0);
      if (sortBy === "ptoRemaining") return (a.remaining ?? 0) - (b.remaining ?? 0);
      return 0;
    });
  }, [staffRoster, sortBy]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} /> Staff Roster
          </CardTitle>
          {pagination?.total && (
            <span className="text-xs text-gray-500 font-medium">
              Showing {staffRoster.length} of {pagination.total} staff members
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto max-h-105 overflow-y-auto pr-1"
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="border-b border-gray-100">
                  <th
                    className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("name")}
                  >
                    Name {sortBy === "name" && "↓"}
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th
                    className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("ptoUsed")}
                  >
                    PTO Used {sortBy === "ptoUsed" && "↓"}
                  </th>
                  <th
                    className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("ptoRemaining")}
                  >
                    Remaining {sortBy === "ptoRemaining" && "↓"}
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((s, idx) => {
                  const ptoUsed = s.pto_used ?? s.ptoUsed ?? 0;
                  const remaining = s.remaining ?? (s.ptoAllowance ? s.ptoAllowance - ptoUsed : 0);
                  const usagePct = s.usage_percentage ?? (s.ptoAllowance ? Math.round((ptoUsed / s.ptoAllowance) * 100) : 0);
                  const isHigh = usagePct >= 70;
                  const name = s.name || "Staff Member";
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const key = s.employee_id ? `${s.employee_id}-${idx}` : idx;

                  return (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900">{name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{s.role || "Teacher"}</td>
                      <td className="py-3 px-2 text-center font-medium text-gray-900">{ptoUsed}</td>
                      <td className={`py-3 px-2 text-center font-medium ${isHigh ? "text-red-600" : "text-gray-900"}`}>{remaining}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-400"}`}>{usagePct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {isLoadingMore && (
                  <>
                    <RosterSkeletonRow />
                    <RosterSkeletonRow />
                    <RosterSkeletonRow />
                  </>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">No staff found in roster.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffRosterTable;
