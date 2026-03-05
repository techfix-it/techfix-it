'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket } from '@/lib/types';
import styles from './dashboard.module.css';
import { LayoutDashboard, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter (Month & Year)
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(''); // Empty means all months

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*');
        
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets by selected year and month
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const d = new Date(t.created_at);
      const yearMatches = d.getFullYear().toString() === selectedYear;
      const monthMatches = selectedMonth === '' || d.getMonth().toString() === selectedMonth;
      return yearMatches && monthMatches;
    });
  }, [tickets, selectedYear, selectedMonth]);

  // Calculate top cards
  const totalTickets = filteredTickets.length;
  const openTickets = filteredTickets.filter(t => t.status === 'open').length;
  const resolvedTickets = filteredTickets.filter(t => t.status === 'closed' && t.resolution === 'resolved').length;
  const unresolvedTickets = filteredTickets.filter(t => t.status === 'closed' && t.resolution === 'unresolved').length;

  // Calculate Bar Chart Data (Tickets opened and closed per month)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barChartData = useMemo(() => {
    const data = months.map(m => ({ month: m, opened: 0, resolved: 0 }));
    filteredTickets.forEach(t => {
      const d = new Date(t.created_at);
      const monthIdx = d.getMonth();
      data[monthIdx].opened += 1;
      if (t.status === 'closed' && t.resolution === 'resolved') {
        data[monthIdx].resolved += 1;
      }
    });
    return data;
  }, [filteredTickets]);

  const maxBarValue = Math.max(1, ...barChartData.flatMap(d => [d.opened, d.resolved]));
  const yAxisSteps = [maxBarValue, Math.ceil(maxBarValue * 0.66), Math.ceil(maxBarValue * 0.33), 0];

  // Calculate Pie Chart Data (Resolved vs Unresolved vs Open ratio)
  const pieChartStyle = useMemo(() => {
    if (totalTickets === 0) return { background: 'var(--color-primary)' };
    
    const resolvedPct = (resolvedTickets / totalTickets) * 100;
    const unresolvedPct = (unresolvedTickets / totalTickets) * 100;
    const openPct = (openTickets / totalTickets) * 100;

    return {
      background: `conic-gradient(
        var(--color-accent-2) 0% ${resolvedPct}%, 
        #e53935 ${resolvedPct}% ${resolvedPct + unresolvedPct}%, 
        #ff6a00 ${resolvedPct + unresolvedPct}% 100%
      )`
    };
  }, [totalTickets, resolvedTickets, unresolvedTickets, openTickets]);

  const availableYears = useMemo(() => {
    const years = new Set(tickets.map(t => new Date(t.created_at).getFullYear().toString()));
    years.add(currentYear);
    return Array.from(years).sort().reverse();
  }, [tickets, currentYear]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard size={28} />
          <h1 className={styles.title}>OVERVIEW</h1>
        </div>
        
        <div className={styles.filter}>
          <label htmlFor="yearFilter">Ano:</label>
          <select 
            id="yearFilter" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <label htmlFor="monthFilter">Mês:</label>
          <select 
            id="monthFilter" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Todos os meses</option>
            {months.map((m, i) => (
              <option key={i} value={i.toString()}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading Dashboard...</p>
      ) : (
        <>
          {/* Top Cards */}
          <div className={styles.cards}>
            <div className={`${styles.card} ${styles.cardTotal}`}>
              <div className={styles.cardIcon}><LayoutDashboard size={24} /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{totalTickets}</span>
                <span className={styles.cardLabel}>Total Tickets</span>
              </div>
            </div>
            
            <div className={`${styles.card} ${styles.cardOpen}`}>
              <div className={styles.cardIcon}><Clock size={24} /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{openTickets}</span>
                <span className={styles.cardLabel}>Open Tickets</span>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardResolved}`}>
              <div className={styles.cardIcon}><CheckCircle size={24} /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{resolvedTickets}</span>
                <span className={styles.cardLabel}>Resolved</span>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardUnresolved}`}>
              <div className={styles.cardIcon}><XCircle size={24} /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{unresolvedTickets}</span>
                <span className={styles.cardLabel}>Unresolved</span>
              </div>
            </div>
          </div>

          <div className={styles.chartsContainer}>
            {/* Bar Chart section */}
            <div className={styles.chartBox}>
              <h3 className={styles.chartTitle}>Tickets Opened and Resolved Over Time</h3>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.barOpen}`}></div>
                  <span>Opened</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.barResolved}`}></div>
                  <span>Resolved</span>
                </div>
              </div>

              <div className={styles.barChart}>
                {/* Y-Axis */}
                <div className={styles.yAxis}>
                  {yAxisSteps.map((val, idx) => (
                    <span key={idx}>{val}</span>
                  ))}
                </div>
                
                {/* Horizontal Grid lines */}
                {yAxisSteps.slice(0, 3).map((_, idx) => (
                  <div key={idx} className={styles.gridLine} style={{ top: `${idx * 33}%` }}></div>
                ))}

                {/* Bars */}
                {barChartData.map((data, idx) => (
                  <div key={idx} className={styles.barGroup}>
                    <div 
                      className={`${styles.barCol} ${styles.barOpen}`} 
                      style={{ height: `${(data.opened / maxBarValue) * 100}%` }}
                      data-value={data.opened}
                    ></div>
                    <div 
                      className={`${styles.barCol} ${styles.barResolved}`} 
                      style={{ height: `${(data.resolved / maxBarValue) * 100}%` }}
                      data-value={data.resolved}
                    ></div>
                    <span className={styles.barLabel}>{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart section */}
            <div className={styles.chartBox}>
              <h3 className={styles.chartTitle}>Resolution Status Ratio</h3>
              
              {totalTickets === 0 ? (
                <div className={styles.emptyState}>No tickets to show</div>
              ) : (
                <div className={styles.pieContainer}>
                  <div className={styles.pieChart} style={pieChartStyle}>
                    <div className={styles.pieInner}>
                      <span className={styles.pieTotal}>{totalTickets}</span>
                      <span className={styles.pieLabel}>Tickets</span>
                    </div>
                  </div>

                  <div className={styles.pieLegends}>
                    <div className={styles.pieLegendItem}>
                      <div className={styles.pieLegendLeft}>
                        <div className={styles.legendColor} style={{ background: 'var(--color-accent-2)' }}></div>
                        <span>Resolved</span>
                      </div>
                      <strong>{((resolvedTickets / totalTickets) * 100).toFixed(1)}%</strong>
                    </div>
                    <div className={styles.pieLegendItem}>
                      <div className={styles.pieLegendLeft}>
                        <div className={styles.legendColor} style={{ background: '#e53935' }}></div>
                        <span>Unresolved</span>
                      </div>
                      <strong>{((unresolvedTickets / totalTickets) * 100).toFixed(1)}%</strong>
                    </div>
                    <div className={styles.pieLegendItem}>
                      <div className={styles.pieLegendLeft}>
                        <div className={styles.legendColor} style={{ background: '#ff6a00' }}></div>
                        <span>Open</span>
                      </div>
                      <strong>{((openTickets / totalTickets) * 100).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
