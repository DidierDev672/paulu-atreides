import pdfMake from '@/utils/pdfFonts'

function get(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return undefined
}

const paymentMethodLabels = {
  Cash: 'Efectivo',
  Transfer: 'Transferencia',
  Card: 'Tarjeta',
  Credit: 'Crédito',
}

export function generateInvoicePDF(sale) {
  const saleNumber = get(sale, 'saleNumber', 'sale_number', 'saleNumber') || ''
  const createdAt = get(sale, 'createdAt', 'created_at', 'createdAt') || ''
  const paymentMethod = paymentMethodLabels[get(sale, 'paymentMethod', 'payment_method', 'paymentMethod')] || ''
  const subtotal = get(sale, 'subtotal', 'subtotal') || 0
  const vat = get(sale, 'VAT', 'vat', 'VAT') || 0
  const discount = get(sale, 'discount', 'discount') || 0
  const total = get(sale, 'total', 'total') || 0

  const company = sale.company || {}
  const client = sale.client || {}
  const products = sale.products || []

  const headerColumns = []
  if (company.logoBase64) {
    headerColumns.push({
      image: company.logoBase64,
      width: 80,
      margin: [0, 0, 0, 10],
    })
  }
  headerColumns.push({
    stack: [
      { text: company.name || '', style: 'companyName' },
      { text: company.address || '', style: 'companyDetail' },
      { text: company.phone || '', style: 'companyDetail' },
      { text: company.email || '', style: 'companyDetail' },
    ],
    alignment: 'right',
  })

  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 40, 40, 40],
    content: [
      {
        columns: headerColumns,
      },
      {
        columns: [
          { text: `Factura N°: ${saleNumber}`, style: 'invoiceTitle' },
          { text: `Fecha: ${createdAt}`, alignment: 'right' },
        ],
        margin: [0, 20, 0, 10],
      },
      {
        stack: [
          { text: 'Datos del Cliente', style: 'sectionHeader' },
          { text: `Nombre: ${client.name || sale.client_id || ''}` },
          { text: `Documento: ${client.document || ''}` },
          { text: `Correo: ${client.email || ''}` },
          { text: `Teléfono: ${client.phone || ''}` },
        ],
        margin: [0, 0, 0, 15],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Producto', style: 'tableHeader' },
              { text: 'Cantidad', style: 'tableHeader' },
              { text: 'Precio Unit.', style: 'tableHeader' },
              { text: 'Subtotal', style: 'tableHeader' },
            ],
            ...products.map((p) => [
              p.name || p.product || '',
              (p.quantity || 0).toString(),
              `$${((p.unitPrice || p.price || 0)).toLocaleString()}`,
              `$${((p.subtotal || 0)).toLocaleString()}`,
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15],
      },
      {
        columns: [
          { text: '' },
          {
            stack: [
              { text: `Subtotal: $${subtotal.toLocaleString()}` },
              { text: `IVA (19%): $${vat.toLocaleString()}` },
              { text: `Descuento: $${discount.toLocaleString()}` },
              { text: `Total: $${total.toLocaleString()}`, style: 'totalAmount' },
              { text: `Método de pago: ${paymentMethod}`, margin: [0, 8, 0, 0] },
            ],
            alignment: 'right',
          },
        ],
      },
    ],
    styles: {
      companyName: {
        fontSize: 14,
        bold: true,
      },
      companyDetail: {
        fontSize: 9,
        color: '#666666',
      },
      invoiceTitle: {
        fontSize: 16,
        bold: true,
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      tableHeader: {
        bold: true,
        fillColor: '#f5a623',
        color: '#ffffff',
      },
      totalAmount: {
        fontSize: 13,
        bold: true,
        margin: [0, 5, 0, 0],
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  }

  const pdfDoc = pdfMake.createPdf(docDefinition)
  pdfDoc.download(`${saleNumber}.pdf`)
  return pdfDoc
}
