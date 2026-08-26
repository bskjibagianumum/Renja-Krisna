export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Triliun`;
  }
  if (abs >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Miliar`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Juta`;
  }
  if (abs >= 1_000) {
    return `Rp ${(amount / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ribu`;
  }
  return formatRupiah(amount);
}

export function parseNumericValue(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  
  if (typeof value === 'string') {
    let trimmed = value.trim();
    if (!trimmed) return 0;

    // Check for negative in parentheses e.g. (1.500.000) or -1.500.000
    const isNegative = trimmed.startsWith('-') || (trimmed.startsWith('(') && trimmed.endsWith(')'));

    // Remove "Rp", "IDR", brackets, whitespaces, and currency symbols
    let cleaned = trimmed
      .replace(/Rp\.?|IDR|\(|\)|\s+/gi, '')
      .replace(/^[^\d\.,\-]+/, '') // strip any leading non-numeric chars
      .trim();

    if (!cleaned) return 0;

    // Handle Indonesian formatting vs US formatting:
    // If it has both dots and commas (e.g. 1.250.000,50 or 1,250,000.50)
    if (cleaned.includes('.') && cleaned.includes(',')) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        // ID format: 1.250.000,50 -> 1250000.50
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: 1,250,000.50 -> 1250000.50
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes('.')) {
      // Could be thousands (1.250.000 or 1.250) or decimal (12.5)
      const parts = cleaned.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        cleaned = cleaned.replace(/\./g, '');
      }
    } else if (cleaned.includes(',')) {
      const parts = cleaned.split(',');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(',', '.');
      }
    }

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    return isNegative ? -Math.abs(parsed) : parsed;
  }

  return 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
