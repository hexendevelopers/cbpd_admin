import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

export const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colWidths: any[] = [];
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length;
        if (cellLength > maxWidth) {
          maxWidth = cellLength;
        }
      }
    }
    colWidths[C] = { width: Math.min(maxWidth + 2, 50) };
  }
  worksheet['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export Data');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};