'use client';

import html2pdf from 'html2pdf.js';

/**
 * Imprime um elemento específico como PDF
 * @param elementId - ID do elemento HTML a imprimir
 * @param fileName - Nome do arquivo PDF
 */
export const printElementToPDF = (elementId: string, fileName: string = 'documento.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID "${elementId}" não encontrado`);
    return;
  }

  const options = {
    margin: [10, 10, 10, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(options).from(element).save();
};

/**
 * Imprime elemento como imagem e dispara download
 * @param elementId - ID do elemento HTML
 * @param fileName - Nome do arquivo
 */
export const printElementAsImage = (elementId: string, fileName: string = 'documento.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID "${elementId}" não encontrado`);
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Usar html2canvas para converter
  import('html2canvas').then((html2canvas) => {
    html2canvas.default(element, { useCORS: true, logging: false }).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = fileName;
      link.click();
    });
  });
};

/**
 * Abre um elemento para impressão (usa print dialog do navegador)
 * @param elementId - ID do elemento HTML
 */
export const printElementDialog = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID "${elementId}" não encontrado`);
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Impressão</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; font-weight: bold; }');
    printWindow.document.write('h1, h2, h3 { color: #333; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

/**
 * Exporta dados para CSV
 * @param data - Array de objetos
 * @param fileName - Nome do arquivo
 */
export const exportToCSV = (data: any[], fileName: string = 'dados.csv') => {
  if (data.length === 0) {
    console.warn('Dados vazios');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  link.download = fileName;
  link.click();
};
