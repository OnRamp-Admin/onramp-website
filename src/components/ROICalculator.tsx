import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Wrench, Building2, DollarSign, Clock, Users, TrendingUp, Calculator, Zap, Shield } from 'lucide-react';
import { trackCalculatorTabSwitch, trackCalculatorValues } from '../lib/analytics';

type CalculatorTab = 'technician' | 'manager';

// Constants for calculations
const FLAT_RATE_DEFAULT = 35; // Default flat rate per hour
const HOURS_PER_WEEK = 40;
const WEEKS_PER_MONTH = 4.33;
const WEEKS_PER_YEAR = 52;
const AVG_BILLABLE_RATE = 125; // Shop rate per hour
const WARRANTY_WORK_SHARE = 0.25; // 25% of jobs are warranty/recall

export default function ROICalculator() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('technician');

  // Technician calculator state
  const [terminalVisits, setTerminalVisits] = useState(15);
  const [docMinutes, setDocMinutes] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(FLAT_RATE_DEFAULT);

  // Manager calculator state
  const [efficiencyGain, setEfficiencyGain] = useState(12);
  const [warrantyBump, setWarrantyBump] = useState(4);
  const [numTechnicians, setNumTechnicians] = useState(4);

  // [PostHog] Track calculator values 2s after last slider change (debounced)
  const trackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasInteractedRef = useRef(false);

  // Technician calculations — terminal visits × 4 min avg + doc writing time
  const MINUTES_PER_TERMINAL_VISIT = 4;
  const dailyMinutesSaved = (terminalVisits * MINUTES_PER_TERMINAL_VISIT) + docMinutes;
  const weeklyHoursSaved = (dailyMinutesSaved * 5) / 60;
  const additionalBillableHoursWeekly = weeklyHoursSaved * 0.8; // 80% can be converted to billable
  const monthlyIncomeBoost = additionalBillableHoursWeekly * hourlyRate * WEEKS_PER_MONTH;
  const yearlyIncomeBoost = monthlyIncomeBoost * 12;

  // Manager calculations
  const currentCapacity = numTechnicians * HOURS_PER_WEEK * WEEKS_PER_YEAR;
  const additionalCapacity = currentCapacity * (efficiencyGain / 100);
  const revenueFromCapacity = additionalCapacity * AVG_BILLABLE_RATE;
  const warrantyHours = currentCapacity * WARRANTY_WORK_SHARE;
  const warrantyRevenue = warrantyHours * AVG_BILLABLE_RATE;
  const warrantyRecovery = warrantyRevenue * (warrantyBump / 100);
  const totalAnnualUnlocked = revenueFromCapacity + warrantyRecovery;

  // [PostHog] Debounced tracking — captures final slider values 2s after last change
  useEffect(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      return; // Skip initial render
    }
    clearTimeout(trackTimerRef.current);
    trackTimerRef.current = setTimeout(() => {
      if (activeTab === 'technician') {
        trackCalculatorValues({
          tab: 'technician',
          values: { terminalVisits, docMinutes, hourlyRate },
          result: Math.round(monthlyIncomeBoost),
        });
      } else {
        trackCalculatorValues({
          tab: 'manager',
          values: { efficiencyGain, warrantyBump, numTechnicians },
          result: Math.round(totalAnnualUnlocked),
        });
      }
    }, 2000);
    return () => clearTimeout(trackTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalVisits, docMinutes, hourlyRate, efficiencyGain, warrantyBump, numTechnicians]);

  return (
    <section id="roi-calculator" className="relative py-24 px-4 carbon-fiber-bg overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-safety-500/10 rounded-full blur-[150px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-electric-400 text-sm font-semibold tracking-wider uppercase mb-4">
            <Calculator className="w-4 h-4" />
            ROI Engine
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Calculate Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              Hidden Revenue
            </span>
          </h2>
          <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
            Whether you're turning wrenches or running the floor, ONRAMP puts money back in your pocket.
          </p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex p-1.5 rounded-xl bg-carbon-800/80 border border-carbon-700/50">
            <button
              onClick={() => { setActiveTab('technician'); trackCalculatorTabSwitch('technician'); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'technician'
                  ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/30'
                  : 'text-carbon-300 hover:text-white'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>I'm a Technician</span>
            </button>
            <button
              onClick={() => { setActiveTab('manager'); trackCalculatorTabSwitch('manager'); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'manager'
                  ? 'bg-safety-500 text-white shadow-lg shadow-safety-500/30'
                  : 'text-carbon-300 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>I'm a Manager</span>
            </button>
          </div>
        </motion.div>

        {/* Calculator Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 backdrop-blur-sm"
          >
            {activeTab === 'technician' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-electric-500/20">
                    <Clock className="w-6 h-6 text-electric-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Time Savings Calculator</h3>
                    <p className="text-carbon-300 text-sm">See your potential take-home boost</p>
                  </div>
                </div>

                {/* Terminal Visits Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      How many times a day do you go to your terminal for diagnosis, TSB's, parts, procedures and torques?
                      <span className="block text-carbon-300 text-sm font-normal">
                        (We assume ~4 min per visit)
                      </span>
                    </label>
                    <span className="text-electric-400 font-bold text-2xl shrink-0">{terminalVisits}x</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={terminalVisits}
                    onChange={(e) => setTerminalVisits(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>5x</span>
                    <span>30x</span>
                  </div>
                </div>

                {/* Doc Time Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      How much time do you spend on average writing reports and documentation?
                    </label>
                    <span className="text-electric-400 font-bold text-2xl shrink-0">{docMinutes}m/day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={docMinutes}
                    onChange={(e) => setDocMinutes(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Hourly Rate Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      Your hourly flat rate
                    </label>
                    <span className="text-electric-400 font-bold text-2xl shrink-0">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>$20/hr</span>
                    <span>$60/hr</span>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                  <div>
                    <p className="text-carbon-300 text-sm">Daily time saved</p>
                    <p className="text-white font-bold text-xl">
                      {Math.round(dailyMinutesSaved)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-carbon-300 text-sm">Weekly hours saved</p>
                    <p className="text-white font-bold text-xl">{weeklyHoursSaved.toFixed(1)} hrs</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-safety-500/20">
                    <TrendingUp className="w-6 h-6 text-safety-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Shop Profit Calculator</h3>
                    <p className="text-carbon-300 text-sm">Find your hidden capacity</p>
                  </div>
                </div>

                {/* Efficiency Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      Overall shop efficiency gain
                      <span className="block text-carbon-300 text-sm font-normal">
                        (Industry avg: 10-15%)
                      </span>
                    </label>
                    <span className="text-safety-400 font-bold text-2xl">{efficiencyGain}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={efficiencyGain}
                    onChange={(e) => setEfficiencyGain(Number(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                    }}
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* Warranty Recovery Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      Warranty recovery from improved documentation
                      <span className="block text-carbon-300 text-sm font-normal">
                        (Approval rate improvement)
                      </span>
                    </label>
                    <span className="text-green-400 font-bold text-2xl">{warrantyBump}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={warrantyBump}
                    onChange={(e) => setWarrantyBump(Number(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, var(--color-green-600), var(--color-green-400))`,
                    }}
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Technicians Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-carbon-200 font-medium">
                      Number of technicians
                    </label>
                    <span className="text-safety-400 font-bold text-2xl">{numTechnicians}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={numTechnicians}
                    onChange={(e) => setNumTechnicians(Number(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                    }}
                  />
                  <div className="flex justify-between text-carbon-300 text-xs mt-1">
                    <span>1 tech</span>
                    <span>100 techs</span>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                  <div>
                    <p className="text-carbon-300 text-sm">Current annual capacity</p>
                    <p className="text-white font-bold text-xl">
                      {currentCapacity.toLocaleString()} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-carbon-300 text-sm">Found capacity</p>
                    <p className="text-white font-bold text-xl">
                      +{Math.round(additionalCapacity).toLocaleString()} hrs
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`p-6 md:p-8 rounded-2xl border backdrop-blur-sm ${
              activeTab === 'technician'
                ? 'bg-gradient-to-br from-electric-900/40 to-electric-950/40 border-electric-500/30'
                : 'bg-gradient-to-br from-safety-900/40 to-safety-950/40 border-safety-500/30'
            }`}
          >
            {activeTab === 'technician' ? (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-electric-500/20">
                    <DollarSign className="w-6 h-6 text-electric-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Your Take-Home Boost</h3>
                    <p className="text-carbon-300 text-sm">Based on ${hourlyRate}/hr flat rate</p>
                  </div>
                </div>

                {/* Big Number */}
                <div className="text-center py-8">
                  <motion.div
                    key={monthlyIncomeBoost}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-2"
                  >
                    <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-300 to-electric-500">
                      ${Math.round(monthlyIncomeBoost).toLocaleString()}
                    </span>
                    <span className="text-electric-400 text-2xl font-semibold">/mo</span>
                  </motion.div>
                  <p className="text-carbon-300">Potential monthly income boost</p>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-electric-400" />
                      <span className="text-carbon-200">Additional billable hours/week</span>
                    </div>
                    <span className="text-electric-400 font-bold">
                      +{additionalBillableHoursWeekly.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-carbon-200">Yearly income potential</span>
                    </div>
                    <span className="text-green-400 font-bold">
                      +${Math.round(yearlyIncomeBoost).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-carbon-300 text-xs mt-6 text-center">
                  * Based on 5 days/week. Actual results vary by shop and workload.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-safety-500/20">
                    <DollarSign className="w-6 h-6 text-safety-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Hidden Revenue Unlocked</h3>
                    <p className="text-carbon-300 text-sm">Annual shop profit potential</p>
                  </div>
                </div>

                {/* Big Number */}
                <div className="text-center py-8">
                  <motion.div
                    key={totalAnnualUnlocked}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-2"
                  >
                    <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-safety-300 to-safety-500">
                      ${Math.round(totalAnnualUnlocked).toLocaleString()}
                    </span>
                    <span className="text-safety-400 text-2xl font-semibold">/yr</span>
                  </motion.div>
                  <p className="text-carbon-300">Total revenue opportunity</p>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-safety-400" />
                      <span className="text-carbon-200">From efficiency gains</span>
                    </div>
                    <span className="text-safety-400 font-bold">
                      +${Math.round(revenueFromCapacity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-carbon-200">Warranty recovery**</span>
                    </div>
                    <span className="text-green-400 font-bold">
                      +${Math.round(warrantyRecovery).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-carbon-300 text-xs mt-6 text-center">
                  * Based on ${AVG_BILLABLE_RATE}/hr shop rate, 25% warranty work volume.
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* Bottom Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-carbon-300 text-lg mb-6">
            These aren't hypothetical numbers. This is{' '}
            <span className="text-white font-semibold">found capacity</span>—revenue that's already
            walking out the door.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-safety-500 hover:from-electric-400 hover:to-safety-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-electric-500/20"
          >
            Get ONRAMP for My Shop
          </a>
        </motion.div>
      </div>
    </section>
  );
}
