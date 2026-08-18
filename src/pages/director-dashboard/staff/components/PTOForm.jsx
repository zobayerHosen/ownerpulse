import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, ChevronDown, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPto, useGetPtoStaff } from "@/hooks";

const TODAY_STR = new Date().toISOString().split("T")[0];

const PTOForm = ({ onClose }) => {
  const [form, setForm] = useState({
    staffId: "",
    staffName: "",
    staffProcareId: "",
    dayType: "sick",
    days: 1,
    date: TODAY_STR,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  const { addPto, isPending } = useAddPto();

  // ─── Fetch staff with search param ─────────────────────────────────────────
  const { staffList, isLoading: staffLoading, isFetching: staffFetching } = useGetPtoStaff({
    per_page: 1000,
    search: searchTerm.trim() || undefined,
  });

  // Filter client-side as well for instant feedback
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staffList;
    const term = searchTerm.toLowerCase().trim();
    return staffList.filter((s) => {
      const nameMatch = (s.name || "").toLowerCase().includes(term);
      const procareId = String(s.procare_employee_id || s.employee_id || s.id || "").toLowerCase();
      const idMatch = procareId.includes(term);
      return nameMatch || idMatch;
    });
  }, [staffList, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.closest(".pto-staff-picker")?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectStaff = (staff) => {
    update("staffId", staff.id);
    update("staffName", staff.name);
    update("staffProcareId", staff.procare_employee_id || staff.employee_id || "");
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staffId) { setError("Please select a staff member."); return; }
    if (!form.date) { setError("Please select a date."); return; }
    setError("");

    const formData = new FormData();
    formData.append("employee_id", form.staffId);
    formData.append("day_type", form.dayType);
    formData.append("days", form.days);
    formData.append("date", form.date);

    try {
      await addPto(formData);
      onClose();
    } catch {
      // toast shown by hook's onError
    }
  };

  const selected = staffList.find((s) => s.id === Number(form.staffId));
  const remaining = selected ? selected.pto_remaining : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Log PTO</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record time off for a staff member</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Custom Staff Picker ── */}
            <div className="pto-staff-picker relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Staff Member
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
              >
                <span className={form.staffName ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {form.staffName
                    ? `${form.staffName}${form.staffProcareId ? ` (ID: ${form.staffProcareId})` : ""}`
                    : "Select staff member..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50/60">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or Procare ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div
                      ref={dropdownRef}
                      className="max-h-48 overflow-y-auto"
                    >
                      {staffLoading || staffFetching ? (
                        <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                          <span>Loading staff members...</span>
                        </div>
                      ) : filteredStaff.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-400 text-center">No staff found matching query.</div>
                      ) : (
                        filteredStaff.map((s) => {
                          const procareId = s?.procare_employee_id || s?.employee_id || "";
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectStaff(s)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center justify-between group transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-800 font-medium">{s?.name}</span>
                                {procareId && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                                    ID: {procareId}
                                  </span>
                                )}
                              </div>
                              <span className="flex items-center gap-2">
                                <span className={`text-xs ${s?.pto_remaining <= 2 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                                  {s?.pto_remaining ?? 0}d left
                                </span>
                                {form.staffId === s?.id && (
                                  <Check size={14} className="text-blue-600" />
                                )}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {remaining !== null && (
                <p className={`text-xs mt-1 ${remaining <= 2 ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {remaining} PTO days remaining
                </p>
              )}
            </div>

            {/* Day Type + Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Day Type</label>
                <select
                  value={form.dayType}
                  onChange={(e) => update("dayType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="vacation">Vacation</option>
                  <option value="jury">Jury Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Days <span className="text-gray-400 font-normal">(1–10)</span>
                </label>
                <input
                  type="number"
                  value={form.days}
                  onChange={(e) => update("days", e.target.value)}
                  min={1}
                  max={10}
                  step={1}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">PTO Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
                {isPending ? "Submitting..." : "Log PTO"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PTOForm;
