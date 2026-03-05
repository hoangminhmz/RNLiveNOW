import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload } from 'lucide-react';
import dayjs from 'dayjs';

interface ImportExcelButtonProps {
  onImport: (data: any[]) => void;
}

export function ImportExcelButton({ onImport }: ImportExcelButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Skip header row (row 1)
      const rows = jsonData.slice(1);
      
      const patients = rows.map(row => {
        // Column mapping based on image:
        // B (index 1): Thời gian (e.g. "07:30 - 08:00")
        // D (index 3): Khách hàng (Name)
        // E (index 4): Số điện thoại (Phone)
        // F (index 5): Nội dung (Service/Note)
        
        const timeRange = row[1] || '';
        const name = row[3] || '';
        const phone = row[4] ? String(row[4]) : '';
        const content = row[5] || '';
        
        // Parse time: "07:30 - 08:00" -> take "07:30"
        const startTimeStr = timeRange.split('-')[0]?.trim() || '08:00';
        const [hours, minutes] = startTimeStr.split(':').map(Number);
        
        const appointmentTime = dayjs()
          .set('hour', isNaN(hours) ? 8 : hours)
          .set('minute', isNaN(minutes) ? 0 : minutes)
          .set('second', 0)
          .toISOString();

        return {
          name,
          phone,
          service: content.length > 50 ? content.substring(0, 47) + '...' : content,
          note: content,
          appointmentTime,
          status: 'scheduled'
        };
      }).filter(p => p.name); // Filter out empty rows

      onImport(patients);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Import Excel
      </button>
    </div>
  );
}
