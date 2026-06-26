const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF directly to the HTTP response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${invoice.invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  // ── Header ──────────────────────────────────────
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('SmartShop ERP', 50, 50);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#6b7280')
    .text('Retail Management Platform', 50, 75);

  // Invoice number and date — right aligned
  doc
    .fontSize(10)
    .fillColor('#111111')
    .text(invoice.invoiceNumber, 400, 50, { align: 'right' })
    .text(
      new Date(invoice.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      400, 65, { align: 'right' }
    );

  // Divider line
  doc
    .moveTo(50, 100)
    .lineTo(545, 100)
    .strokeColor('#e5e7eb')
    .stroke();

  // ── Customer Info ────────────────────────────────
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .font('Helvetica-Bold')
    .text('BILL TO', 50, 120);

  doc
    .fontSize(11)
    .fillColor('#111111')
    .font('Helvetica-Bold')
    .text(invoice.customerName, 50, 135);

  if (invoice.customer?.phone) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(invoice.customer.phone, 50, 150);
  }

  if (invoice.customer?.address) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(invoice.customer.address, 50, 165);
  }

  // Payment method — right side
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .font('Helvetica-Bold')
    .text('PAYMENT METHOD', 400, 120, { align: 'right' });

  doc
    .fontSize(11)
    .fillColor('#111111')
    .font('Helvetica')
    .text(
      invoice.paymentMethod.toUpperCase(),
      400, 135, { align: 'right' }
    );

  doc
    .fontSize(9)
    .fillColor(invoice.status === 'paid' ? '#16a34a' : '#dc2626')
    .font('Helvetica-Bold')
    .text(
      invoice.status === 'paid' ? 'PAID' : 'CREDIT (UDHAAR)',
      400, 150, { align: 'right' }
    );

  // ── Items Table ──────────────────────────────────
  const tableTop = 210;

  // Table header background
  doc
    .rect(50, tableTop - 8, 495, 24)
    .fillColor('#f9fafb')
    .fill();

  // Table headers
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .font('Helvetica-Bold')
    .text('PRODUCT',  60,  tableTop)
    .text('QTY',      310, tableTop)
    .text('PRICE',    370, tableTop)
    .text('TOTAL',    450, tableTop, { align: 'right', width: 90 });

  // Header bottom border
  doc
    .moveTo(50, tableTop + 20)
    .lineTo(545, tableTop + 20)
    .strokeColor('#e5e7eb')
    .stroke();

  // Table rows
  let y = tableTop + 35;

  invoice.items.forEach((item) => {
    doc
      .fontSize(10)
      .fillColor('#111111')
      .font('Helvetica')
      .text(item.name,              60,  y)
      .text(String(item.quantity),  310, y)
      .text('Rs. ' + item.price,    370, y)
      .text('Rs. ' + item.total,    450, y, { align: 'right', width: 90 });

    doc
      .moveTo(50, y + 18)
      .lineTo(545, y + 18)
      .strokeColor('#f3f4f6')
      .stroke();

    y += 30;
  });

  // ── Totals ───────────────────────────────────────
  y += 10;

  doc
    .fontSize(10)
    .fillColor('#6b7280')
    .font('Helvetica')
    .text('Subtotal',    350, y)
    .text('Rs. ' + invoice.subtotal, 450, y, { align: 'right', width: 90 });

  if (invoice.discount > 0) {
    y += 20;
    doc
      .text('Discount', 350, y)
      .fillColor('#dc2626')
      .text('- Rs. ' + invoice.discount, 450, y, { align: 'right', width: 90 });
  }

  y += 25;

  // Total line
  doc
    .moveTo(350, y)
    .lineTo(545, y)
    .strokeColor('#e5e7eb')
    .stroke();

  y += 10;

  doc
    .fontSize(12)
    .fillColor('#111111')
    .font('Helvetica-Bold')
    .text('Total',         350, y)
    .text('Rs. ' + invoice.total, 450, y, { align: 'right', width: 90 });

  // ── Footer ───────────────────────────────────────
  doc
    .moveTo(50, 720)
    .lineTo(545, 720)
    .strokeColor('#e5e7eb')
    .stroke();

  doc
    .fontSize(9)
    .fillColor('#9ca3af')
    .font('Helvetica')
    .text('Thank you for your business.', 50, 730, { align: 'center' });

  doc.end();
};

module.exports = generateInvoicePDF;