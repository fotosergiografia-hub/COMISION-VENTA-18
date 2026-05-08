/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Users, 
  Calendar, 
  Smartphone, 
  FileText, 
  Plus, 
  Trash2, 
  Download,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Printer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, DayRecord, EmployeeRecord, ReportMode } from './types';

const DAILY_GOAL = 30000;
const COMMISSION_RATE = 0.05;
const CELL_PHONE_BONUS = 50;

const DAYS_NAMES = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

export default function App() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeFolio, setNewEmployeeFolio] = useState('');
  const [days, setDays] = useState<DayRecord[]>(
    DAYS_NAMES.map(name => ({ date: '', dayName: name, totalSales: 0 }))
  );
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [reportMode, setReportMode] = useState<ReportMode>('full');
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const weekRange = useMemo(() => {
    const start = new Date(weekStartDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    const fmtFull = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `${fmt(start)} al ${fmtFull(end)}`;
  }, [weekStartDate]);

  // Initialize records when employees change
  useEffect(() => {
    setRecords(prev => {
      const newRecords = employees.map(emp => {
        const existing = prev.find(p => p.employeeId === emp.id);
        if (existing) return existing;
        return {
          employeeId: emp.id,
          sales: {},
          cellPhones: {}
        };
      });
      return newRecords;
    });
  }, [employees]);

  const addEmployee = () => {
    if (!newEmployeeName.trim() || !newEmployeeFolio.trim()) return;
    const newEmp = { 
      id: crypto.randomUUID(), 
      name: newEmployeeName.trim(),
      folio: newEmployeeFolio.trim()
    };
    setEmployees([...employees, newEmp]);
    setNewEmployeeName('');
    setNewEmployeeFolio('');
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const updateDaySales = (index: number, val: string) => {
    const amount = parseFloat(val) || 0;
    const newDays = [...days];
    newDays[index].totalSales = amount;
    setDays(newDays);
  };

  const updateEmployeeValue = (empId: string, dayIndex: number, type: 'sales' | 'cellPhones', val: string) => {
    const amount = parseFloat(val) || 0;
    setRecords(prev => prev.map(rec => {
      if (rec.employeeId === empId) {
        return {
          ...rec,
          [type]: { ...rec[type], [dayIndex]: amount }
        };
      }
      return rec;
    }));
  };

  const activeDays = useMemo(() => {
    return days.map(d => d.totalSales >= DAILY_GOAL);
  }, [days]);

  const calculations = useMemo(() => {
    return employees.map(emp => {
      const rec = records.find(r => r.employeeId === emp.id);
      let totalSalesOnActiveDays = 0;
      let totalCellPhones = 0;

      activeDays.forEach((isActive, idx) => {
        if (isActive) {
          totalSalesOnActiveDays += rec?.sales[idx] || 0;
        }
        // Cell phone bonus applies regardless of active day
        totalCellPhones += rec?.cellPhones[idx] || 0;
      });

      const commission = totalSalesOnActiveDays * COMMISSION_RATE;
      const cellBonus = totalCellPhones * CELL_PHONE_BONUS;
      
      return {
        id: emp.id,
        name: emp.name,
        sales: totalSalesOnActiveDays,
        cellPhones: totalCellPhones,
        commission,
        cellBonus,
        total: commission + cellBonus
      };
    });
  }, [employees, records, activeDays]);

  const totals = useMemo(() => {
    return calculations.reduce((acc, curr) => ({
      sales: acc.sales + curr.sales,
      commission: acc.commission + curr.commission,
      cellPhones: acc.cellPhones + curr.cellPhones,
      cellBonus: acc.cellBonus + curr.cellBonus,
      total: acc.total + curr.total
    }), { sales: 0, commission: 0, cellPhones: 0, cellBonus: 0, total: 0 });
  }, [calculations]);

  const handlePrint = (mode: ReportMode) => {
    setReportMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen pb-20 select-none">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 uppercase">Papelería & Electrónica de la 18</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Gestión de Comisiones Champotón</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <Calendar size={16} />
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-xs font-mono cursor-pointer"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-1">Semana: {weekRange}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 no-print">
        {/* STEPPER */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {[
            { id: 1, label: 'Personal', icon: Users },
            { id: 2, label: 'Ventas Diarias', icon: TrendingUp },
            { id: 3, label: 'Registros', icon: Smartphone },
            { id: 4, label: 'Reporte', icon: FileText }
          ].map((s) => (
            <div 
              key={s.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all flex-shrink-0 cursor-pointer ${
                step === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setStep(s.id)}
            >
              <s.icon size={18} />
              <span className="text-sm font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: EMPLOYEES */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="font-bold text-slate-800">Directorio de Empleados</h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Folio (Eleventa)"
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-32 font-mono"
                      value={newEmployeeFolio}
                      onChange={(e) => setNewEmployeeFolio(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Nombre del empleado..."
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addEmployee()}
                    />
                    <button 
                      onClick={addEmployee}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> AGREGAR
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-50 min-h-[300px]">
                  {employees.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                      <Users size={48} strokeWidth={1.5} />
                      <p>No hay empleados registrados. Comienza agregando uno arriba.</p>
                    </div>
                  ) : (
                    employees.map(emp => (
                      <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 block">{emp.name}</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">FOLIO: {emp.folio}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeEmployee(emp.id)}
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
              <div className="flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                  disabled={employees.length === 0}
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DAILY TOTALS */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Metas Diarias ($30,000 MXN)</h2>
                  <p className="text-xs text-slate-500 mt-1">Ingresa el total de venta diaria sumando ambos turnos.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
                  {days.map((day, idx) => (
                    <div key={idx} className="bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{day.dayName}</span>
                        {activeDays[idx] ? (
                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                            <CheckCircle2 size={14} /> Activo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase">
                            <XCircle size={14} /> Inactivo
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input 
                          type="number" 
                          className={`w-full pl-7 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all font-mono font-bold ${
                            activeDays[idx] ? 'bg-emerald-50 border-emerald-200 text-emerald-900 focus:ring-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500'
                          }`}
                          placeholder="0.00"
                          value={day.totalSales || ''}
                          onChange={(e) => updateDaySales(idx, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-slate-600 font-bold flex items-center gap-1">
                  <ChevronLeft size={18} /> Anterior
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                  Capturar Ventas <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: EMPLOYEE RECORDS */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {employees.length === 0 ? (
                 <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-4">
                    <Users size={48} strokeWidth={1.5} />
                    <p>Necesitas agregar empleados primero.</p>
                    <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Regresar al paso 1</button>
                 </div>
              ) : (
                <div className="space-y-8">
                  {employees.map(emp => (
                    <section key={emp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl uppercase">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="font-bold text-slate-900 text-lg">{emp.name}</h2>
                          <p className="text-xs text-slate-500 font-medium">Registrar ventas por canal y celulares</p>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-200">
                              <th className="px-6 py-3 w-32">Día</th>
                              <th className="px-6 py-3">Ventas ($) (Solo días activos)</th>
                              <th className="px-6 py-3 w-48 text-center text-blue-600">Celulares Sold (Bonus)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {DAYS_NAMES.map((name, idx) => {
                              const isActive = activeDays[idx];
                              const rec = records.find(r => r.employeeId === emp.id);
                              return (
                                <tr key={idx} className={`${isActive ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                                  <td className="px-6 py-4">
                                    <span className="font-bold text-slate-700">{name}</span>
                                    {!isActive && <p className="text-[10px] text-slate-400">Meta no alcanzada</p>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="relative group">
                                      {isActive && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>}
                                      <input 
                                        type="number" 
                                        disabled={!isActive}
                                        className={`w-full pl-7 pr-4 py-2 rounded-lg border outline-none transition-all text-sm font-mono font-bold ${
                                          isActive 
                                            ? 'bg-emerald-50/50 border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100' 
                                            : 'bg-slate-100 border-slate-200 cursor-not-allowed'
                                        }`}
                                        value={rec?.sales[idx] || ''}
                                        onChange={(e) => updateEmployeeValue(emp.id, idx, 'sales', e.target.value)}
                                        placeholder={isActive ? "0.00" : "-"}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <input 
                                        type="number" 
                                        className="w-20 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-center font-mono font-bold text-blue-900"
                                        value={rec?.cellPhones[idx] || ''}
                                        onChange={(e) => updateEmployeeValue(emp.id, idx, 'cellPhones', e.target.value)}
                                        placeholder="0"
                                      />
                                      <span className="text-xs font-bold text-blue-400">UND</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
                </div>
              )}
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="text-slate-600 font-bold flex items-center gap-1">
                  <ChevronLeft size={18} /> Anterior
                </button>
                <button 
                  onClick={() => setStep(4)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                  Ver Resultados <FileText size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REPORT */}
          {step === 4 && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
              {/* RESULTS CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                      <h2 className="font-bold flex items-center gap-2">
                        <FileText size={18} /> Resumen General
                      </h2>
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded tracking-widest uppercase">
                        Cálculo Semanal
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-200">
                            <th className="px-6 py-3">Empleado (Folio)</th>
                            <th className="px-6 py-3">Venta Activa</th>
                            <th className="px-6 py-3">Comisión (5%)</th>
                            <th className="px-6 py-3">Celulares</th>
                            <th className="px-6 py-3">Bono Cel</th>
                            <th className="px-6 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic font-mono font-medium text-sm">
                          {calculations.map(calc => {
                            const emp = employees.find(e => e.id === calc.id);
                            return (
                              <tr key={calc.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-sans font-bold not-italic">
                                  {calc.name}
                                  <span className="text-[9px] block text-blue-500 leading-none">FOLIO: {emp?.folio}</span>
                                </td>
                                <td className="px-6 py-4">${calc.sales.toLocaleString()}</td>
                                <td className="px-6 py-4 text-emerald-600 font-bold">${calc.commission.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">{calc.cellPhones}</td>
                                <td className="px-6 py-4 text-blue-600">${calc.cellBonus.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900 underline underline-offset-4">${calc.total.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-bold">
                          <tr>
                            <td className="px-6 py-4">TOTAL</td>
                            <td className="px-6 py-4 underline">${totals.sales.toLocaleString()}</td>
                            <td className="px-6 py-4">${totals.commission.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">{totals.cellPhones}</td>
                            <td className="px-6 py-4">${totals.cellBonus.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-lg border-l border-white/20">${totals.total.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Download size={18} className="text-blue-600" /> Exportar Reporte PDF
                    </h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => handlePrint('full')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-900 text-sm">Reporte Completo</p>
                          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Ventas + Comisiones (Descargar PDF)</p>
                        </div>
                        <Printer size={18} className="text-slate-400 group-hover:text-blue-500" />
                      </button>
                      <button 
                        onClick={() => handlePrint('commissions')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-900 text-sm">Solo Comisiones</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Tabla de pagos (Descargar PDF)</p>
                        </div>
                        <Printer size={18} className="text-slate-400 group-hover:text-emerald-500" />
                      </button>
                      <button 
                        onClick={() => handlePrint('days')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-900 text-sm">Resumen de Días</p>
                          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Estatus de metas (Descargar PDF)</p>
                        </div>
                        <Printer size={18} className="text-slate-400 group-hover:text-amber-500" />
                      </button>
                    </div>
                  </section>

                  <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                    <Smartphone className="absolute -right-4 -bottom-4 opacity-20 rotate-12" size={120} />
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                       Estatus de Metas
                    </h3>
                    <div className="space-y-2">
                      {activeDays.map((isActive, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-1">
                          <span className="opacity-80 uppercase">{DAYS_NAMES[i]}</span>
                          {isActive ? (
                            <span className="bg-emerald-400 text-slate-900 px-2 py-0.5 rounded leading-none">ACTIVO</span>
                          ) : (
                            <span className="bg-white/10 text-white px-2 py-0.5 rounded leading-none">INACTIVO</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button onClick={() => setStep(3)} className="text-slate-600 font-bold flex items-center gap-1">
                  <ChevronLeft size={18} /> Editar Datos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-center no-print">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Papelería & Electrónica de la 18 • Champotón, Campeche
        </p>
      </footer>

      {/* PRINT LAYER */}
      <div className="print-only p-8 text-black bg-white">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Papelería & Electrónica de la 18</h1>
            <p className="text-sm font-bold opacity-70 italic">Reporte Semanal de Comisiones</p>
            <p className="text-xs mt-2 uppercase tracking-widest font-mono">Champotón, Campeche, México</p>
          </div>
          <div className="text-right text-xs font-mono">
            <p className="font-bold uppercase">Semana: {weekRange}</p>
            <p>GENERADO: {new Date().toLocaleDateString('es-MX')}</p>
            <p>REF: {new Date().getTime().toString(36).toUpperCase()}</p>
          </div>
        </div>

        {/* MODE: DAYS SUMMARY */}
        {(reportMode === 'full' || reportMode === 'days') && (
          <div className="mb-10">
            <h2 className="text-sm font-black uppercase mb-4 py-1 px-3 bg-black text-white inline-block">Resumen de Ventas Diarias</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-black text-left uppercase">
                  <th className="py-2">Día</th>
                  <th className="py-2">Venta Total</th>
                  <th className="py-2 text-center">Estatus</th>
                  <th className="py-2 text-right">Meta ($30K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {days.map((day, i) => (
                  <tr key={i}>
                    <td className="py-2 font-bold">{day.dayName}</td>
                    <td className="py-2">${day.totalSales.toLocaleString()}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-black ${activeDays[i] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {activeDays[i] ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono italic">
                      {activeDays[i] ? '✓ Superada' : `Faltan $${(DAILY_GOAL - day.totalSales).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODE: COMMISSIONS */}
        {(reportMode === 'full' || reportMode === 'commissions') && (
          <div className="mb-10">
            <h2 className="text-sm font-black uppercase mb-4 py-1 px-3 bg-black text-white inline-block">Comisiones por Empleado</h2>
            <table className="w-full text-xs border-collapse border-b border-black">
              <thead>
                <tr className="border-b border-black text-left uppercase">
                  <th className="py-2">Nombre (Folio)</th>
                  <th className="py-2">Ventas Activas</th>
                  <th className="py-2">Comisión (5%)</th>
                  <th className="py-2 text-center">Cels</th>
                  <th className="py-2">Bono Cel</th>
                  <th className="py-2 text-right">Total a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 italic font-mono">
                {calculations.map(calc => {
                  const emp = employees.find(e => e.id === calc.id);
                  return (
                    <tr key={calc.id}>
                      <td className="py-3 font-sans font-bold not-italic">
                        {calc.name}
                        <span className="block text-[9px] text-gray-500">Folio: {emp?.folio}</span>
                      </td>
                      <td className="py-3">${calc.sales.toLocaleString()}</td>
                      <td className="py-3 font-bold">${calc.commission.toLocaleString()}</td>
                      <td className="py-3 text-center">{calc.cellPhones}</td>
                      <td className="py-3">${calc.cellBonus.toLocaleString()}</td>
                      <td className="py-3 text-right font-black text-base not-italic underline decoration-double">
                        ${calc.total.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {(reportMode === 'commissions') && (
                <tfoot>
                  <tr className="font-black bg-gray-50 uppercase">
                    <td colSpan={5} className="py-3 text-right pr-4">Gran Total de Nómina:</td>
                    <td className="py-3 text-right text-lg">${totals.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* FINAL SUMMARY (ONLY IN FULL) */}
        {reportMode === 'full' && (
          <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-8">
            <div className="space-y-4">
              <div className="p-4 border border-black rounded-lg">
                <p className="text-[10px] font-black uppercase mb-2">Resumen Financiero</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Venta Total Activa:</span>
                    <span className="font-black">${totals.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Comisiones (5%):</span>
                    <span className="font-black">${totals.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bonos Celulares:</span>
                    <span className="font-black">${totals.cellBonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-black pt-2 mt-2 text-sm">
                    <span className="font-black">TOTAL SEMANAL:</span>
                    <span className="font-black">${totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end items-end">
              <div className="w-64 border-t border-black text-center pt-2">
                <p className="text-[10px] font-black uppercase mb-1">Firma de Recibido / Gerencia</p>
                <p className="text-[8px] opacity-40">PAPELERÍA & ELECTRÓNICA DE LA 18</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-center opacity-30 text-[8px] uppercase tracking-widest">
           Este reporte no tiene validez legal externa. Uso interno comercial exclusivo.
        </div>
      </div>
    </div>
  );
}
