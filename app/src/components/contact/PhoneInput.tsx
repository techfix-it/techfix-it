'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './PhoneInput.module.css';

export type Country = {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  dial: string;   // e.g. "+353"
  flag: string;   // ISO 3166-1 alpha-2 lowercase, used for flagcdn.com
  mask: string;   // digit placeholder, e.g. "## ### ####"
};

export const COUNTRIES: Country[] = [
  { code: 'IE', name: 'Ireland',        dial: '+353', flag: 'ie', mask: '## ### ####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: 'gb', mask: '#### ### ####' },
  { code: 'US', name: 'United States',  dial: '+1',   flag: 'us', mask: '(###) ###-####' },
  { code: 'BR', name: 'Brazil',         dial: '+55',  flag: 'br', mask: '(##) #####-####' },
  { code: 'PT', name: 'Portugal',       dial: '+351', flag: 'pt', mask: '### ### ###' },
  { code: 'ES', name: 'Spain',          dial: '+34',  flag: 'es', mask: '### ### ###' },
  { code: 'FR', name: 'France',         dial: '+33',  flag: 'fr', mask: '# ## ## ## ##' },
  { code: 'DE', name: 'Germany',        dial: '+49',  flag: 'de', mask: '### ########' },
  { code: 'IT', name: 'Italy',          dial: '+39',  flag: 'it', mask: '### ### ####' },
  { code: 'PL', name: 'Poland',         dial: '+48',  flag: 'pl', mask: '### ### ###' },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: 'au', mask: '#### ### ###' },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: 'ca', mask: '(###) ###-####' },
  { code: 'IN', name: 'India',          dial: '+91',  flag: 'in', mask: '##### #####' },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: 'za', mask: '## ### ####' },
  { code: 'NL', name: 'Netherlands',    dial: '+31',  flag: 'nl', mask: '# #### ####' },
  { code: 'BE', name: 'Belgium',        dial: '+32',  flag: 'be', mask: '### ## ## ##' },
  { code: 'CH', name: 'Switzerland',    dial: '+41',  flag: 'ch', mask: '## ### ## ##' },
  { code: 'SE', name: 'Sweden',         dial: '+46',  flag: 'se', mask: '## ### ## ##' },
  { code: 'NO', name: 'Norway',         dial: '+47',  flag: 'no', mask: '### ## ###' },
  { code: 'DK', name: 'Denmark',        dial: '+45',  flag: 'dk', mask: '## ## ## ##' },
];

function applyMask(digits: string, mask: string): string {
  let di = 0;
  let result = '';
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === '#') {
      result += digits[di++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

type Props = {
  value: string;
  onChange: (full: string) => void;
  required?: boolean;
};

export default function PhoneInput({ value, onChange, required }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [numeral, setNumeral] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync upward whenever country or numeral changes
  useEffect(() => {
    const digits = numeral.replace(/\D/g, '');
    const formatted = digits ? applyMask(digits, country.mask) : '';
    onChange(digits ? `${country.dial} ${formatted}` : '');
  }, [country, numeral]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset numeral when value is cleared from parent (success reset)
  useEffect(() => {
    if (value === '') setNumeral('');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNumeral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const maxDigits = country.mask.split('').filter(c => c === '#').length;
    setNumeral(raw.slice(0, maxDigits));
  };

  const filtered = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  const displayValue = numeral ? applyMask(numeral, country.mask) : '';

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      {/* Country selector button */}
      <button
        type="button"
        className={styles.countryBtn}
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        aria-label="Select country code"
      >
        <img src={`https://flagcdn.com/w20/${country.flag}.png`} width={20} height={15} alt={country.name} className={styles.flag} />
        <span className={styles.dial}>{country.dial}</span>
        <span className={styles.caret}>▾</span>
      </button>

      {/* Number input */}
      <input
        type="tel"
        className={styles.numberInput}
        placeholder={country.mask.replace(/#/g, '0')}
        value={displayValue}
        onChange={handleNumeral}
        required={required}
        inputMode="numeric"
      />

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <ul className={styles.list}>
            {filtered.map(c => (
              <li key={c.code}>
                <button
                  type="button"
                  className={`${styles.option} ${c.code === country.code ? styles.active : ''}`}
                  onClick={() => { setCountry(c); setNumeral(''); setOpen(false); setSearch(''); }}
                >
                  <img src={`https://flagcdn.com/w20/${c.flag}.png`} width={20} height={15} alt={c.name} className={styles.flag} />
                  <span className={styles.optionName}>{c.name}</span>
                  <span className={styles.optionDial}>{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
