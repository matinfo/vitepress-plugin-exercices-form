declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string, quality?: number }
    html2canvas?: Record<string, unknown>
    jsPDF?: { unit?: string, format?: string, orientation?: string }
    pagebreak?: { mode?: string[], avoid?: string[] }
  }
  interface Html2PdfWorker {
    set: (opt: Html2PdfOptions) => Html2PdfWorker
    from: (el: HTMLElement | string) => Html2PdfWorker
    toPdf: () => Html2PdfWorker
    get: (type: 'pdf') => Promise<{ output: (type: 'blob') => Blob }>
    save: () => Promise<void>
    outputPdf: (type?: string) => Promise<Blob>
  }
  function html2pdf(): Html2PdfWorker
  export default html2pdf
}
