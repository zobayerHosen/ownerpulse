import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import TabBar from "./components/TabBar";
import PTOHistoryCard from "./components/PTOHistoryCard";
import SubstituteHistoryCard from "./components/SubstituteHistoryCard";
import PTOForm from "./components/PTOForm";
import SubstituteForm from "./components/SubstituteForm";
import { useGetPtoStaff } from "@/hooks";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const INITIAL_PTO_LOG = [
  { id: 1, staffId: 1, dayType: "sick", days: 1, date: "2026-05-08" },
  { id: 2, staffId: 7, dayType: "personal", days: 1, date: "2026-05-06" },
  { id: 3, staffId: 7, dayType: "personal", days: 1, date: "2026-05-02" },
  { id: 4, staffId: 8, dayType: "vacation", days: 2, date: "2026-04-25" },
];

const INITIAL_SUBSTITUTES = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart", calledBy: "Director" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens", calledBy: "Director" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart", calledBy: "Director" },
];

const DirectorStaffManagement = () => {
  const [activeTab, setActiveTab] = useState("pto");
  const [ptoLog, setPtoLog] = useState(INITIAL_PTO_LOG);
  const [substitutes, setSubstitutes] = useState(INITIAL_SUBSTITUTES);
  const [showForm, setShowForm] = useState(false);

  const { staffList = [] } = useGetPtoStaff({ per_page: 1000 });

  const ptoStats = useMemo(() => ({
    totalDays: ptoLog.reduce((a, r) => a + r.days, 0),
    sickDays: ptoLog.filter((r) => r.dayType === "sick").reduce((a, r) => a + r.days, 0),
    personalDays: ptoLog.filter((r) => r.dayType === "personal").reduce((a, r) => a + r.days, 0),
    uniqueStaff: [...new Set(ptoLog.map((r) => r.staffId))].length,
  }), [ptoLog]);

  const subStats = useMemo(() => ({
    total: substitutes.length,
    thisWeek: substitutes.filter((r) => {
      const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length,
    uniqueSubs: [...new Set(substitutes.map((r) => r.subName))].length,
  }), [substitutes]);

  const handleAddPTO = (entry) => setPtoLog((prev) => [entry, ...prev]);
  const handleAddSub = (entry) => setSubstitutes((prev) => [entry, ...prev]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">{staffList.length} staff · Track PTO and substitutes</p>
        </div>
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" /> {activeTab === "pto" ? "Log PTO" : "Log Substitute"}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <TabBar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setShowForm(false); }} />
      </motion.div>

      {activeTab === "pto" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}><StatCard label="Total PTO Days" value={ptoStats.totalDays} /></motion.div>
            <motion.div variants={itemVariants}><StatCard label="Sick Days" value={ptoStats.sickDays} valueColor="text-amber-600" /></motion.div>
            <motion.div variants={itemVariants}><StatCard label="Personal Days" value={ptoStats.personalDays} valueColor="text-blue-600" /></motion.div>
            <motion.div variants={itemVariants}><StatCard label="Staff Affected" value={ptoStats.uniqueStaff} /></motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <PTOHistoryCard ptoLog={ptoLog} staff={staffList} />
          </motion.div>
        </>
      )}

      {activeTab === "substitute" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}><StatCard label="Total Substitutes" value={subStats.total} /></motion.div>
            <motion.div variants={itemVariants}><StatCard label="This Week" value={subStats.thisWeek} valueColor="text-blue-600" /></motion.div>
            <motion.div variants={itemVariants}><StatCard label="Unique Subs" value={subStats.uniqueSubs} /></motion.div>
            <motion.div variants={itemVariants}>
              <StatCard label="Coverage" value={subStats.thisWeek > 0 ? `${Math.round((subStats.thisWeek / subStats.total) * 100)}%` : "0%"} valueColor="text-emerald-600" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <SubstituteHistoryCard substitutes={substitutes} />
          </motion.div>
        </>
      )}

      {/* Add Form Modal */}
      {showForm && activeTab === "pto" && (
        <PTOForm onClose={() => setShowForm(false)} />
      )}
      {showForm && activeTab === "substitute" && (
        <SubstituteForm onClose={() => setShowForm(false)} />
      )}
    </motion.div>
  );
};

export default DirectorStaffManagement;
