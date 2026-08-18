import React, { useRef } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PTOSkeletonItem = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 animate-pulse gap-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="space-y-1.5">
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="w-44 h-3 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="sm:w-56 shrink-0 space-y-1.5">
      <div className="flex justify-between">
        <div className="w-16 h-3 bg-gray-200 rounded" />
        <div className="w-8 h-3 bg-gray-200 rounded" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full" />
    </div>
  </div>
);

const PTOSummaryCard = ({ ptoSummary, staffList = [], pagination, onLoadMore, isLoadingMore }) => {
  const overallPct = ptoSummary?.overall_pto_percentage ?? 0;
  const usedDays = ptoSummary?.total_pto_used_days ?? 0;
  const allowanceDays = ptoSummary?.total_pto_allowance_days ?? 0;

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

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-purple-600" /> PTO Summary
            </CardTitle>
            <CardDescription className="mt-1">
              {overallPct}% of total PTO allowance used YTD ({usedDays}/{allowanceDays} days total)
            </CardDescription>
          </div>
          {ptoSummary?.high_usage_count > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
              <AlertCircle size={13} /> {ptoSummary.high_usage_count} High Usage
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {staffList.length > 0 ? (
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="max-h-95 overflow-y-auto pr-1 space-y-2.5"
          >
            {staffList.map((s, idx) => {
              const used = s.used_days ?? s.ptoUsed ?? 0;
              const allowance = s.allowance_days ?? s.ptoAllowance ?? 10;
              const remaining = s.remaining_days ?? s.remaining ?? (allowance - used);
              const usagePct = s.usage_percentage ?? (allowance > 0 ? Math.round((used / allowance) * 100) : 0);
              const isHigh = s.is_warning || usagePct >= 70;
              const key = s.employee_id ? `${s.employee_id}-${idx}` : idx;

              const initials = (s.name || "Staff")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl transition-all gap-3 ${
                    isHigh
                      ? "bg-red-50/70 border border-red-100 hover:bg-red-50"
                      : "bg-gray-50/80 border border-gray-100 hover:bg-gray-100/80"
                  }`}
                >
                  {/* Left Employee Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isHigh ? "bg-red-500 text-white" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        {isHigh && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                            Warning
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {remaining} days remaining of {allowance} days allowance
                      </p>
                    </div>
                  </div>

                  {/* Right Usage Progress */}
                  <div className="flex items-center gap-3 sm:w-56 shrink-0 justify-end">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className={isHigh ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {used} / {allowance} Days
                        </span>
                        <span className={isHigh ? "text-red-600 font-bold" : "text-gray-500 font-semibold"}>
                          {usagePct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isHigh ? "bg-red-500" : "bg-purple-600"
                          }`}
                          style={{ width: `${Math.min(usagePct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Skeleton Loading Items on Infinite Scroll */}
            {isLoadingMore && (
              <>
                <PTOSkeletonItem />
                <PTOSkeletonItem />
              </>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">No PTO summary records found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PTOSummaryCard;
