import { ExcelRow, ColumnMapping, ApbnSummaryMatrix, ProgramAllocationRow } from '../types';

/**
 * Normalizes source of fund string to standard category: 'RM' | 'PNBP' | 'BLU' | 'SBSN' | 'Lainnya'
 */
export function normalizeSumberDana(rawVal: any): 'RM' | 'PNBP' | 'BLU' | 'SBSN' | 'Lainnya' {
  const str = String(rawVal || '').toLowerCase().trim();
  if (!str) return 'RM';
  if (str.includes('sbsn') || str.includes('syariah')) return 'SBSN';
  if (str.includes('blu')) return 'BLU';
  if (str.includes('pnbp')) return 'PNBP';
  if (str.includes('rm') || str.includes('rupiah') || str.includes('murni') || str.includes('apbn')) return 'RM';
  return 'RM';
}

/**
 * Determines expenditure type: 'PEGAWAI' | 'OPERASIONAL' | 'NON_OPERASIONAL'
 * - Belanja Pegawai: Komponen "001-Gaji dan tunjangan"
 * - Belanja Operasional: Komponen "002-operasional dan pemeliharaan kantor" / Type Komponen "Operasional"
 * - Belanja Non Operasional: Data dari filter "type komponen" Non Operasional atau komponen selain 001 dan 002
 */
export function classifyBelanjaType(
  row: ExcelRow,
  typeKomponenCol?: string,
  komponenCol?: string,
  roCol?: string,
  kegiatanCol?: string
): 'PEGAWAI' | 'OPERASIONAL' | 'NON_OPERASIONAL' {
  const typeVal = String(typeKomponenCol ? row[typeKomponenCol] : (row.type_komponen || row.tipe_komponen || row.jenis_belanja || '')).toLowerCase().trim();
  const kompVal = String(komponenCol ? row[komponenCol] : (row.komponen || '')).toLowerCase().trim();
  const roVal = String(roCol ? row[roCol] : (row.ro || row.rincian_output || '')).toLowerCase().trim();
  const kegVal = String(kegiatanCol ? row[kegiatanCol] : (row.kegiatan || '')).toLowerCase().trim();
  const akunVal = String(row.akun || row.kode_akun || row.kode_anggaran || '').toLowerCase().trim();

  // 1. Belanja Pegawai -> Komponen "001-Gaji dan tunjangan" (Col 4 RM)
  if (
    kompVal.startsWith('001') ||
    kompVal.includes('001-gaji') ||
    kompVal.includes('001 - gaji') ||
    kompVal.includes('gaji dan tunjangan') ||
    kompVal.includes('gaji pokok') ||
    kompVal.includes('belanja pegawai') ||
    typeVal.startsWith('001') ||
    typeVal.includes('001-gaji') ||
    typeVal.includes('001 - gaji') ||
    typeVal.includes('gaji dan tunjangan') ||
    typeVal.includes('belanja pegawai') ||
    (typeVal === 'pegawai')
  ) {
    return 'PEGAWAI';
  }

  // 2. Check if explicitly marked as Non-Operasional
  const isExplicitNonOps = 
    typeVal.includes('non operasional') || 
    typeVal.includes('non-operasional') || 
    typeVal.includes('non ops') || 
    typeVal.includes('non-ops') ||
    kompVal.includes('non operasional') ||
    kompVal.includes('non-operasional');

  // 3. Belanja Operasional -> Komponen "002-operasional dan pemeliharaan kantor" (Cols 5, 6, 7 RM/PNBP/BLU)
  if (!isExplicitNonOps) {
    if (
      kompVal.startsWith('002') ||
      kompVal.includes('002-operasional') ||
      kompVal.includes('002 - operasional') ||
      kompVal.includes('operasional dan pemeliharaan kantor') ||
      kompVal.includes('pemeliharaan kantor') ||
      typeVal.startsWith('002') ||
      typeVal.includes('002-operasional') ||
      typeVal.includes('002 - operasional') ||
      typeVal === 'operasional' ||
      typeVal === 'belanja operasional' ||
      typeVal === 'ops' ||
      (typeVal.includes('operasional') && !isExplicitNonOps) ||
      (typeVal.includes('layanan perkantoran') && (kompVal.startsWith('002') || kompVal.includes('operasional')))
    ) {
      return 'OPERASIONAL';
    }
  }

  // 4. Belanja Non Operasional -> Filter Type Komponen Non Operasional atau Komponen selain 001 dan 002 (Cols 9, 10, 11, 12)
  return 'NON_OPERASIONAL';
}

/**
 * Extracts program code & name intelligently from row
 */
export function extractProgramInfo(
  row: ExcelRow,
  programCol?: string,
  unitEselon1Col?: string
): { progCode: string; progName: string; unitCode: string; unitName: string } {
  const rawProg = String(programCol ? row[programCol] : (row.program || row.nama_program || 'Program Lainnya')).trim();
  const rawUnit = String(unitEselon1Col ? row[unitEselon1Col] : (row['unit eselon1'] || row.unit_eselon1 || 'Sekretariat Jenderal')).trim();
  const kodeAnggaran = String(row.kode_anggaran || row.kode_program || row.kode || '').trim();

  // Determine Unit Code
  let unitCode = '019.01';
  let unitName = rawUnit || 'Sekretariat Jenderal';

  const unitLower = unitName.toLowerCase();
  if (
    unitLower.includes('bskji') || 
    unitLower.includes('standardisasi') || 
    unitLower.includes('standarisasi') || 
    unitLower.includes('kebijakan jasa industri')
  ) {
    unitCode = '019.07';
    unitName = 'Badan Standardisasi dan Kebijakan Jasa Industri (BSKJI)';
  } else if (unitLower.includes('sekretariat jenderal') || unitLower.includes('setjen')) {
    unitCode = '019.01';
    unitName = 'Sekretariat Jenderal';
  } else if (unitLower.includes('agro')) {
    unitCode = '019.02';
    unitName = 'Ditjen Industri Agro';
  } else if (unitLower.includes('ikft') || unitLower.includes('kimia') || unitLower.includes('tekstil')) {
    unitCode = '019.03';
    unitName = 'Ditjen Industri Kimia, Farmasi dan Tekstil';
  } else if (unitLower.includes('ilmate') || unitLower.includes('logam') || unitLower.includes('elektronika')) {
    unitCode = '019.04';
    unitName = 'Ditjen Industri Logam, Mesin, Alat Transportasi dan Elektronika';
  } else if (unitLower.includes('ikma') || unitLower.includes('kecil')) {
    unitCode = '019.05';
    unitName = 'Ditjen Industri Kecil, Menengah dan Aneka';
  } else if (unitLower.includes('ketahanan') || unitLower.includes('kpaasi') || unitLower.includes('wilayah industri')) {
    unitCode = '019.06';
    unitName = 'Ditjen Ketahanan, Perwilayahan dan Akses Industri Internasional';
  } else if (unitLower.includes('bpsdmi') || unitLower.includes('pengembangan sumber daya') || unitLower.includes('vokasi')) {
    unitCode = '019.08';
    unitName = 'Badan Pengembangan Sumber Daya Manusia Industri';
  } else if (unitLower.includes('inspektorat') || unitLower.includes('itjen')) {
    unitCode = '019.09';
    unitName = 'Inspektorat Jenderal';
  }

  // Determine Program Code
  let progCode = `${unitCode}.WA`;
  let progName = rawProg;

  // Extract from kode_anggaran (e.g. 020.01.WA.xxxx or 019.07.WA)
  const codeMatch = kodeAnggaran.match(/(\d{3}\.\d{2}\.[A-Z]{2}|\d{2}\.[A-Z]{2}|[A-Z]{2})/);
  const progLower = rawProg.toLowerCase();

  if (progLower.includes('dukungan manajemen') || progLower.includes('manajemen')) {
    progCode = `${unitCode}.WA`;
    progName = 'Program Dukungan Manajemen';
  } else if (progLower.includes('nilai tambah') || progLower.includes('daya saing')) {
    progCode = `${unitCode}.EC`;
    progName = 'Program Nilai Tambah dan Daya Saing Industri';
  } else if (progLower.includes('riset') || progLower.includes('inovasi') || progLower.includes('standardisasi') || progLower.includes('standarisasi')) {
    progCode = `${unitCode}.BD`;
    progName = 'Program Riset, Inovasi, dan Standarisasi Industri';
  } else if (progLower.includes('pendidikan') || progLower.includes('vokasi') || progLower.includes('sdm')) {
    progCode = `${unitCode}.GG`;
    progName = 'Program Pendidikan dan Pelatihan Vokasi';
  } else if (codeMatch) {
    const rawMatch = codeMatch[1];
    if (rawMatch.length === 2) {
      progCode = `${unitCode}.${rawMatch}`;
    } else {
      const parts = rawMatch.split('.');
      const suffix = parts[parts.length - 1];
      progCode = `${unitCode}.${suffix}`;
    }
  } else {
    // Generate clean mnemonic code
    const initials = rawProg
      .replace(/program/gi, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'PR';
    progCode = `${unitCode}.${initials}`;
  }

  return { progCode, progName, unitCode, unitName };
}

/**
 * Calculates complete APBN Summary Matrix according to official Indonesian APBN format
 */
export function calculateApbnSummary(
  rows: ExcelRow[],
  columnMapping: ColumnMapping,
  alokasiKey: string | null
): ApbnSummaryMatrix {
  let totalAlokasi = 0;

  // 3. Belanja OPS Aggregators
  let totalBelanjaPegawaiRM = 0;
  let totalBelanjaOpsRM = 0;
  let totalBelanjaOpsPNBP = 0;
  let totalBelanjaOpsBLU = 0;

  // 4. Belanja NonOPS Aggregators
  let totalBelanjaNonOpsRM = 0;
  let totalBelanjaNonOpsPNBP = 0;
  let totalBelanjaNonOpsBLU = 0;
  let totalBelanjaNonOpsSBSN = 0;

  // 5. Sumber Dana Aggregators
  let totalRM = 0;
  let totalPNBP = 0;
  let totalBLU = 0;
  let totalSBSN = 0;
  let totalLainnya = 0;

  const typeCol = columnMapping['type_komponen'];
  const kompCol = columnMapping['komponen'];
  const roCol = columnMapping['ro'];
  const kegCol = columnMapping['kegiatan'];
  const sumberDanaCol = columnMapping['sumber_dana'];
  const progCol = columnMapping['program'];
  const unitCol = columnMapping['unit_eselon1'];

  // Map to group by Unit Eselon I and Program
  interface UnitGroup {
    unitCode: string;
    unitName: string;
    programs: Map<string, {
      code: string;
      name: string;
      belanjaPegawaiRM: number;
      belanjaOpsRM: number;
      belanjaOpsPNBP: number;
      belanjaOpsBLU: number;
      totalBelanjaOps: number;
      belanjaNonOpsRM: number;
      belanjaNonOpsPNBP: number;
      belanjaNonOpsBLU: number;
      belanjaNonOpsSBSN: number;
      totalBelanjaNonOps: number;
      totalAlokasiRow: number;
      rowCount: number;
    }>;
  }

  const unitMap = new Map<string, UnitGroup>();

  rows.forEach((row) => {
    // 1. Get row allocation value
    const numericKey = alokasiKey ? `__numeric_${alokasiKey}` : null;
    const alokasi = numericKey && row[numericKey] !== undefined
      ? Number(row[numericKey]) || 0
      : alokasiKey && row[alokasiKey] !== undefined
      ? Number(row[alokasiKey]) || 0
      : 0;

    totalAlokasi += alokasi;

    // 2. Classify Belanja Type & Sumber Dana
    const belanjaType = classifyBelanjaType(row, typeCol, kompCol, roCol, kegCol);
    const sumberDana = normalizeSumberDana(sumberDanaCol ? row[sumberDanaCol] : row.sumber_dana);

    // Track overall Sumber Dana
    if (sumberDana === 'RM') totalRM += alokasi;
    else if (sumberDana === 'PNBP') totalPNBP += alokasi;
    else if (sumberDana === 'BLU') totalBLU += alokasi;
    else if (sumberDana === 'SBSN') totalSBSN += alokasi;
    else totalLainnya += alokasi;

    // Categorize into specific matrix buckets
    let rowPegawaiRM = 0;
    let rowOpsRM = 0;
    let rowOpsPNBP = 0;
    let rowOpsBLU = 0;
    let rowNonOpsRM = 0;
    let rowNonOpsPNBP = 0;
    let rowNonOpsBLU = 0;
    let rowNonOpsSBSN = 0;

    if (belanjaType === 'PEGAWAI') {
      // Belanja Pegawai is placed in Col (4) [RM]
      rowPegawaiRM = alokasi;
      totalBelanjaPegawaiRM += alokasi;
    } else if (belanjaType === 'OPERASIONAL') {
      // Belanja Operasional: Col (5) RM, (6) PNBP, (7) BLU
      if (sumberDana === 'PNBP') {
        rowOpsPNBP = alokasi;
        totalBelanjaOpsPNBP += alokasi;
      } else if (sumberDana === 'BLU') {
        rowOpsBLU = alokasi;
        totalBelanjaOpsBLU += alokasi;
      } else {
        rowOpsRM = alokasi;
        totalBelanjaOpsRM += alokasi;
      }
    } else {
      // Belanja Non Operasional: Col (9) RM, (10) PNBP, (11) BLU, (12) SBSN
      if (sumberDana === 'PNBP') {
        rowNonOpsPNBP = alokasi;
        totalBelanjaNonOpsPNBP += alokasi;
      } else if (sumberDana === 'BLU') {
        rowNonOpsBLU = alokasi;
        totalBelanjaNonOpsBLU += alokasi;
      } else if (sumberDana === 'SBSN') {
        rowNonOpsSBSN = alokasi;
        totalBelanjaNonOpsSBSN += alokasi;
      } else {
        rowNonOpsRM = alokasi;
        totalBelanjaNonOpsRM += alokasi;
      }
    }

    // 3. Group by Unit Eselon I & Program
    const { progCode, progName, unitCode, unitName } = extractProgramInfo(row, progCol, unitCol);

    if (!unitMap.has(unitCode)) {
      unitMap.set(unitCode, {
        unitCode,
        unitName,
        programs: new Map(),
      });
    }

    const unitObj = unitMap.get(unitCode)!;
    if (!unitObj.programs.has(progCode)) {
      unitObj.programs.set(progCode, {
        code: progCode,
        name: progName,
        belanjaPegawaiRM: 0,
        belanjaOpsRM: 0,
        belanjaOpsPNBP: 0,
        belanjaOpsBLU: 0,
        totalBelanjaOps: 0,
        belanjaNonOpsRM: 0,
        belanjaNonOpsPNBP: 0,
        belanjaNonOpsBLU: 0,
        belanjaNonOpsSBSN: 0,
        totalBelanjaNonOps: 0,
        totalAlokasiRow: 0,
        rowCount: 0,
      });
    }

    const progObj = unitObj.programs.get(progCode)!;
    progObj.belanjaPegawaiRM += rowPegawaiRM;
    progObj.belanjaOpsRM += rowOpsRM;
    progObj.belanjaOpsPNBP += rowOpsPNBP;
    progObj.belanjaOpsBLU += rowOpsBLU;
    progObj.totalBelanjaOps += (rowOpsRM + rowOpsPNBP + rowOpsBLU);
    progObj.belanjaNonOpsRM += rowNonOpsRM;
    progObj.belanjaNonOpsPNBP += rowNonOpsPNBP;
    progObj.belanjaNonOpsBLU += rowNonOpsBLU;
    progObj.belanjaNonOpsSBSN += rowNonOpsSBSN;
    progObj.totalBelanjaNonOps += (rowNonOpsRM + rowNonOpsPNBP + rowNonOpsBLU + rowNonOpsSBSN);
    progObj.totalAlokasiRow += alokasi;
    progObj.rowCount += 1;
  });

  const totalBelanjaOps = totalBelanjaOpsRM + totalBelanjaOpsPNBP + totalBelanjaOpsBLU;
  const totalOpsWithPegawai = totalBelanjaPegawaiRM + totalBelanjaOps;
  const totalBelanjaNonOps = totalBelanjaNonOpsRM + totalBelanjaNonOpsPNBP + totalBelanjaNonOpsBLU + totalBelanjaNonOpsSBSN;

  // Build hierarchical matrix rows
  const matrixRows: ProgramAllocationRow[] = [];
  const programAllocationsList: ApbnSummaryMatrix['programAllocations'] = [];

  unitMap.forEach((unit) => {
    let unitPegawaiRM = 0;
    let unitOpsRM = 0;
    let unitOpsPNBP = 0;
    let unitOpsBLU = 0;
    let unitNonOpsRM = 0;
    let unitNonOpsPNBP = 0;
    let unitNonOpsBLU = 0;
    let unitNonOpsSBSN = 0;
    let unitTotalAlokasi = 0;

    const childProgramRows: ProgramAllocationRow[] = [];

    unit.programs.forEach((prog) => {
      unitPegawaiRM += prog.belanjaPegawaiRM;
      unitOpsRM += prog.belanjaOpsRM;
      unitOpsPNBP += prog.belanjaOpsPNBP;
      unitOpsBLU += prog.belanjaOpsBLU;
      unitNonOpsRM += prog.belanjaNonOpsRM;
      unitNonOpsPNBP += prog.belanjaNonOpsPNBP;
      unitNonOpsBLU += prog.belanjaNonOpsBLU;
      unitNonOpsSBSN += prog.belanjaNonOpsSBSN;
      unitTotalAlokasi += prog.totalAlokasiRow;

      const progRow: ProgramAllocationRow = {
        code: prog.code,
        name: prog.name,
        unitCode: unit.unitCode,
        unitName: unit.unitName,
        isUnitHeader: false,
        belanjaPegawaiRM: prog.belanjaPegawaiRM,
        belanjaOpsRM: prog.belanjaOpsRM,
        belanjaOpsPNBP: prog.belanjaOpsPNBP,
        belanjaOpsBLU: prog.belanjaOpsBLU,
        totalBelanjaOps: prog.totalBelanjaOps,
        belanjaNonOpsRM: prog.belanjaNonOpsRM,
        belanjaNonOpsPNBP: prog.belanjaNonOpsPNBP,
        belanjaNonOpsBLU: prog.belanjaNonOpsBLU,
        belanjaNonOpsSBSN: prog.belanjaNonOpsSBSN,
        totalBelanjaNonOps: prog.totalBelanjaNonOps,
        totalAlokasiRow: prog.totalAlokasiRow,
      };

      childProgramRows.push(progRow);

      programAllocationsList.push({
        code: prog.code,
        name: prog.name,
        unitCode: unit.unitCode,
        unitName: unit.unitName,
        totalAlokasi: prog.totalAlokasiRow,
        percentage: totalAlokasi > 0 ? (prog.totalAlokasiRow / totalAlokasi) * 100 : 0,
        rowCount: prog.rowCount,
      });
    });

    const unitHeaderRow: ProgramAllocationRow = {
      code: unit.unitCode,
      name: unit.unitName,
      isUnitHeader: true,
      belanjaPegawaiRM: unitPegawaiRM,
      belanjaOpsRM: unitOpsRM,
      belanjaOpsPNBP: unitOpsPNBP,
      belanjaOpsBLU: unitOpsBLU,
      totalBelanjaOps: unitOpsRM + unitOpsPNBP + unitOpsBLU,
      belanjaNonOpsRM: unitNonOpsRM,
      belanjaNonOpsPNBP: unitNonOpsPNBP,
      belanjaNonOpsBLU: unitNonOpsBLU,
      belanjaNonOpsSBSN: unitNonOpsSBSN,
      totalBelanjaNonOps: unitNonOpsRM + unitNonOpsPNBP + unitNonOpsBLU + unitNonOpsSBSN,
      totalAlokasiRow: unitTotalAlokasi,
      children: childProgramRows,
    };

    matrixRows.push(unitHeaderRow);
  });

  // Sort program allocations by total alokasi descending
  programAllocationsList.sort((a, b) => b.totalAlokasi - a.totalAlokasi);

  return {
    totalAlokasi,
    programAllocations: programAllocationsList,
    totalBelanjaPegawaiRM,
    totalBelanjaOpsRM,
    totalBelanjaOpsPNBP,
    totalBelanjaOpsBLU,
    totalBelanjaOps,
    totalOpsWithPegawai,
    totalBelanjaNonOpsRM,
    totalBelanjaNonOpsPNBP,
    totalBelanjaNonOpsBLU,
    totalBelanjaNonOpsSBSN,
    totalBelanjaNonOps,
    sumberDana: {
      RM: totalRM,
      belanjaPegawaiRM: totalBelanjaPegawaiRM,
      alokasiRM: Math.max(0, totalRM - totalBelanjaPegawaiRM),
      PNBP: totalPNBP,
      BLU: totalBLU,
      SBSN: totalSBSN,
      lainnya: totalLainnya,
      total: totalAlokasi,
    },
    matrixRows,
  };
}
