import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, ChevronDown, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddSubstitution, useGetPtoStaff } from "@/hooks";

const TODAY_STR = new Date().toISOString().split("T")[0];

const SubstituteForm = ({ onClose }) => {
  const [form, setForm] = useState({
    absentEmployeeId: "",
    absentEmployeeName: "",
    absentProcareId: "",
    subEmployeeId: "",
    subEmployeeName: "",
    subProcareId: "",
    date: TODAY_STR,
  });
  const [absentSearch, setAbsentSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [absentDropdownOpen, setAbsentDropdownOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  const absentDropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  const { addSubstitution, isPending } = useAddSubstitution();
  const activeSearch = (absentDropdownOpen ? absentSearch : subDropdownOpen ? subSearch : "").trim();
  const { staffList, isLoading: staffLoading, isFetching: staffFetching } = useGetPtoStaff({
    per_page: 1000,
    search: activeSearch || undefined,
  });

  // Filter absent staff list
  const absentFilteredStaff = useMemo(() => {
    if (!absentSearch.trim()) return staffList;
    const term = absentSearch.toLowerCase().trim();
    return staffList.filter((s) => {
      const nameMatch = (s.name || "").toLowerCase().includes(term);
      const procareId = String(s.procare_employee_id || s.employee_id || s.id || "").toLowerCase();
      return nameMatch || procareId.includes(term);
    });
  }, [staffList, absentSearch]);

  // Filter substitute staff list
  const subFilteredStaff = useMemo(() => {
    if (!subSearch.trim()) return staffList;
    const term = subSearch.toLowerCase().trim();
    return staffList.filter((s) => {
      const nameMatch = (s.name || "").toLowerCase().includes(term);
      const procareId = String(s.procare_employee_id || s.employee_id || s.id || "").toLowerCase();
      return nameMatch || procareId.includes(term);
    });
  }, [staffList, subSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        absentDropdownRef.current &&
        !absentDropdownRef.current.closest(".absent-staff-picker")?.contains(e.target)
      ) {
        setAbsentDropdownOpen(false);
      }
      if (
        subDropdownRef.current &&
        !subDropdownRef.current.closest(".sub-staff-picker")?.contains(e.target)
      ) {
        setSubDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectAbsentStaff = (staff) => {
    update("absentEmployeeId", staff.id);
    update("absentEmployeeName", staff.name);
    update("absentProcareId", staff.procare_employee_id || staff.employee_id || "");
    setAbsentDropdownOpen(false);
  };

  const selectSubStaff = (staff) => {
    update("subEmployeeId", staff.id);
    update("subEmployeeName", staff.name);
    update("subProcareId", staff.procare_employee_id || staff.employee_id || "");
    setSubDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.absentEmployeeId) {
      setError("Please select the absent staff member.");
      return;
    }
    if (!form.subEmployeeId) {
      setError("Please select the substitute staff member.");
      return;
    }
    if (form.absentEmployeeId === form.subEmployeeId) {
      setError("Absent and substitute staff cannot be the same person.");
      return;
    }
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("absent_employee_id", form.absentEmployeeId);
    formData.append("sub_employee_id", form.subEmployeeId);
    formData.append("date", form.date);

    try {
      await addSubstitution(formData);
      onClose();
    } catch {
      // toast already shown by the hook's onError
    }
  };

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
              <h2 className="text-xl font-bold text-gray-900">Log Substitute</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Record a substitute covering for staff
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Custom Absent Staff Picker ── */}
            <div className="absent-staff-picker relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Absent Staff Member
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => {
                  setAbsentDropdownOpen((v) => !v);
                  setSubDropdownOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
              >
                <span className={form.absentEmployeeName ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {form.absentEmployeeName
                    ? `${form.absentEmployeeName}${form.absentProcareId ? ` (ID: ${form.absentProcareId})` : ""}`
                    : "Select absent staff..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${absentDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              <AnimatePresence>
                {absentDropdownOpen && (
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
                          placeholder="Search absent staff by name or Procare ID..."
                          value={absentSearch}
                          onChange={(e) => setAbsentSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div ref={absentDropdownRef} className="max-h-56 overflow-y-auto">
                      {staffLoading || staffFetching ? (
                        <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                          <span>Loading staff members...</span>
                        </div>
                      ) : absentFilteredStaff?.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-400 text-center">No staff found matching query.</div>
                      ) : (
                        absentFilteredStaff?.map((s) => {
                          const procareId = s?.procare_employee_id || s?.employee_id || "";
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectAbsentStaff(s)}
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
                              {form.absentEmployeeId === s?.id && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Custom Substitute Staff Picker ── */}
            <div className="sub-staff-picker relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Substitute Staff Member
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => {
                  setSubDropdownOpen((v) => !v);
                  setAbsentDropdownOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
              >
                <span className={form.subEmployeeName ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {form.subEmployeeName
                    ? `${form.subEmployeeName}${form.subProcareId ? ` (ID: ${form.subProcareId})` : ""}`
                    : "Select substitute..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${subDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              <AnimatePresence>
                {subDropdownOpen && (
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
                          placeholder="Search substitute by name or Procare ID..."
                          value={subSearch}
                          onChange={(e) => setSubSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div ref={subDropdownRef} className="max-h-48 overflow-y-auto">
                      {staffLoading || staffFetching ? (
                        <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                          <span>Loading staff members...</span>
                        </div>
                      ) : subFilteredStaff?.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-400 text-center">No staff found matching query.</div>
                      ) : (
                        subFilteredStaff?.map((s) => {
                          const procareId = s?.procare_employee_id || s?.employee_id || "";
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectSubStaff(s)}
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
                              {form.subEmployeeId === s?.id && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Coverage Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white"
              >
                {isPending ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {isPending ? "Submitting..." : "Log Substitute"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SubstituteForm;
