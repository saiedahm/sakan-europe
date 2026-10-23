const fs = require("node:fs");
const path = require("node:path");
const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");

let pool;
function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined, max: 5, connectionTimeoutMillis: 5000 });
  return pool;
}
function euro(cents) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format((Number(cents) || 0) / 100); }
function safe(value, fallback = "—") { return value === null || value === undefined || String(value).trim() === "" ? fallback : String(value).trim().slice(0, 500); }
function addressLines(address) { if (!address) return []; return [address.line1,address.line2,[address.postal_code,address.city].filter(Boolean).join(" "),address.state,address.country].filter(Boolean).map(String); }
function customerFor(session) {
  const details=session.customer_details||{}, shipping=session.shipping_details||{};
  return { name:safe(shipping.name||details.name||session.customer_name,"Customer"), email:safe(details.email||session.customer_email||session.receipt_email,""), phone:safe(details.phone||session.customer_phone,""), billing:addressLines(details.address||session.customer_address), shipping:addressLines(shipping.address||details.address||session.customer_address) };
}
function itemsFor(session) {
  return (session.line_items&&session.line_items.data||[]).map(line=>{
    const product=line.price&&line.price.product, quantity=Math.max(1,Number(line.quantity)||1), unit=Number(line.price&&line.price.unit_amount);
    return {name:safe(product&&typeof product==="object"?product.name:line.description,"Product"),sku:safe(product&&typeof product==="object"&&product.metadata&&(product.metadata.sku||product.metadata.variant)||line.price&&line.price.lookup_key),quantity,unitCents:Number.isFinite(unit)?unit:Math.round((Number(line.amount_total)||0)/quantity),totalCents:Number.isFinite(Number(line.amount_total))?Number(line.amount_total):(Number.isFinite(unit)?unit*quantity:0)};
  });
}
function createPdf(inv, svg) {
 return new Promise((resolve,reject)=>{
  const doc=new PDFDocument({size:"A4",margins:{top:42,bottom:46,left:46,right:46},info:{Title:inv.invoiceNumber+" - SAKAN EUROPE",Author:"SAKAN EUROPE",Subject:"EUR invoice"}});
  const chunks=[];doc.on("data",c=>chunks.push(c));doc.on("error",reject);doc.on("end",()=>resolve(Buffer.concat(chunks)));
  const L=46,R=549,W=R-L;
  doc.rect(0,0,595,12).fill("#D4AF37");SVGtoPDF(doc,svg,L,28,{width:58,height:58,preserveAspectRatio:"xMidYMid meet"});
  doc.fillColor("#0D0D0D").font("Helvetica-Bold").fontSize(20).text("SAKAN EUROPE",116,38,{characterSpacing:1.2});
  doc.fillColor("#6B5A2A").font("Helvetica").fontSize(8).text("European Home Luxury / Premium Möbel & Wohnaccessoires",116,64,{width:420});
  doc.moveTo(L,101).lineTo(R,101).strokeColor("#D4AF37").lineWidth(1.3).stroke();
  doc.fillColor("#0D0D0D").font("Helvetica-Bold").fontSize(24).text("RECHNUNG / INVOICE",L,119);
  doc.font("Helvetica").fontSize(10).fillColor("#444444").text("Rechnungsnummer: "+inv.invoiceNumber,L,153);
  doc.text("Rechnungsdatum: "+inv.date,L,169);doc.text("Zahlungsart: "+inv.paymentMethod,L,185);doc.text("Zahlungsreferenz: "+safe(inv.paymentReference),L,201,{width:300});
  doc.fillColor("#0D0D0D").font("Helvetica-Bold").fontSize(10).text("RECHNUNGSEMPFÄNGER",360,153);
  doc.font("Helvetica").fontSize(9).fillColor("#444444").text(inv.customer.name,360,169,{width:190});
  if(inv.customer.email)doc.text(inv.customer.email,360,doc.y+3,{width:190});
  if(inv.customer.phone&&inv.customer.phone!=="—")doc.text(inv.customer.phone,360,doc.y+3,{width:190});
  for(const line of inv.customer.billing)doc.text(line,360,doc.y+2,{width:190});
  let y=Math.max(doc.y+25,265);
  doc.fillColor("#0D0D0D").font("Helvetica-Bold").fontSize(10).text("Lieferadresse",L,y);y+=16;
  doc.font("Helvetica").fontSize(9).fillColor("#444444").text(inv.customer.name,L,y);y=doc.y+2;
  for(const line of inv.customer.shipping){doc.text(line,L,y);y=doc.y+2;}
  y=Math.max(y+20,330);
  const c={name:L,sku:310,qty:407,unit:444,total:505};
  doc.rect(L,y,W,25).fill("#0D0D0D");doc.fillColor("#D4AF37").font("Helvetica-Bold").fontSize(8);
  doc.text("Produkt / Beschreibung",c.name+7,y+8,{width:245});doc.text("SKU / Variante",c.sku,y+8,{width:90});doc.text("Menge",c.qty,y+8,{width:35,align:"right"});doc.text("Einzelpreis",c.unit-5,y+8,{width:57,align:"right"});doc.text("Gesamt",c.total,y+8,{width:38,align:"right"});y+=25;
  for(const item of inv.items){
   if(y>670){doc.addPage();y=48;}
   const rowH=Math.max(28,doc.heightOfString(item.name,{width:225})+10);
   if(Math.round(y/rowH)%2===0)doc.rect(L,y,W,rowH).fill("#F7F4EA");
   doc.fillColor("#222222").font("Helvetica").fontSize(8).text(item.name,c.name+7,y+7,{width:225,height:rowH-8});
   doc.fontSize(7).fillColor("#555555").text(item.sku,c.sku,y+8,{width:87});doc.fontSize(8).fillColor("#222222").text(String(item.quantity),c.qty,y+8,{width:35,align:"right"});
   doc.text(euro(item.unitCents),c.unit-5,y+8,{width:57,align:"right"});doc.font("Helvetica-Bold").text(euro(item.totalCents),c.total,y+8,{width:38,align:"right"}).font("Helvetica");
   y+=rowH;doc.moveTo(L,y).lineTo(R,y).strokeColor("#E3D9B8").lineWidth(.5).stroke();
  }
  y+=18;if(y>690){doc.addPage();y=48;}
  const tx=350,tw=199;
  doc.font("Helvetica").fontSize(9).fillColor("#444444").text("Zwischensumme (netto)",tx,y,{width:125});doc.text(euro(inv.netCents),tx+125,y,{width:74,align:"right"});y+=18;
  doc.text("MwSt. ("+inv.vatRate.toLocaleString("de-DE")+" %, enthalten)",tx,y,{width:125});doc.text(euro(inv.vatCents),tx+125,y,{width:74,align:"right"});y+=21;
  doc.rect(tx-6,y-4,tw+6,30).fill("#0D0D0D");doc.fillColor("#D4AF37").font("Helvetica-Bold").fontSize(11).text("GESAMTBETRAG",tx,y+5,{width:125});doc.text(euro(inv.grossCents),tx+125,y+5,{width:74,align:"right"});y+=48;
  if(y>740){doc.addPage();y=55;}
  doc.fillColor("#6B5A2A").font("Helvetica").fontSize(8).text("Vielen Dank, dass Sie sich für SAKAN EUROPE entschieden haben.",L,y,{width:W,align:"center"});
  doc.fillColor("#777777").fontSize(7).text(inv.sellerFooter,L,y+18,{width:W,align:"center",lineGap:2});doc.end();
 });
}
function transporter() {
 const user=process.env.SMTP_USER||process.env.SMTP_FROM,pass=process.env.SMTP_PASS;
 if(!user||!pass||!process.env.SMTP_FROM)throw new Error("SMTP_USER/SMTP_PASS/SMTP_FROM are not configured");
 return nodemailer.createTransport({host:process.env.SMTP_HOST||"smtps.udag.de",port:Number(process.env.SMTP_PORT||465),secure:Number(process.env.SMTP_PORT||465)===465,auth:{user,pass},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000});
}
async function issueInvoice(session,paymentMethod="Stripe") {
 if(!session||session.payment_status!=="paid")throw new Error("Invoice requires a verified paid Checkout Session");
 const customer=customerFor(session);
 if(!customer.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))throw new Error("Paid order has no valid customer email");
 if(session.currency&&session.currency.toLowerCase()!=="eur")throw new Error("SAKAN EUROPE invoices accept EUR only");
 const items=itemsFor(session);if(!items.length)throw new Error("Checkout Session has no line items; configure Stripe line_items retrieval");
 const grossCents=Number(session.amount_total);if(!Number.isSafeInteger(grossCents)||grossCents<0)throw new Error("Invalid Checkout Session total");
 const vatRate=Number(process.env.INVOICE_VAT_RATE||19);if(!Number.isFinite(vatRate)||vatRate<0||vatRate>100)throw new Error("INVOICE_VAT_RATE must be between 0 and 100");
 const netCents=Math.round(grossCents/(1+vatRate/100)),vatCents=grossCents-netCents,paymentReference=String(session.payment_intent||session.id);
 const database=db(),client=await database.connect();let inv;
 try{
  await client.query("BEGIN");await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[paymentReference]);
  const existing=await client.query("SELECT invoice_number,customer_email,pdf_bytes,email_sent_at FROM sakan_invoices WHERE payment_reference=$1 FOR UPDATE",[paymentReference]);
  if(existing.rowCount){inv={invoiceNumber:existing.rows[0].invoice_number,email:existing.rows[0].customer_email,pdfBytes:existing.rows[0].pdf_bytes,sent:!!existing.rows[0].email_sent_at};await client.query("COMMIT");}
  else{
   const n=await client.query("SELECT nextval('sakan_invoice_number_seq') AS n");
   const created=new Date((session.created||Math.floor(Date.now()/1000))*1000),invoiceNumber="SE-"+created.getUTCFullYear()+"-"+String(n.rows[0].n).padStart(4,"0");
   const sellerFooter=[process.env.INVOICE_SELLER_LEGAL_NAME||"SAKAN EUROPE",process.env.INVOICE_SELLER_ADDRESS||"—",process.env.INVOICE_SELLER_REGISTRATION||"Handelsregister-/USt-IdNr.: bitte vor Livebetrieb konfigurieren",process.env.INVOICE_SUPPORT_EMAIL||process.env.SMTP_FROM].filter(Boolean).join(" · ");
   const model={invoiceNumber,date:created.toLocaleString("de-DE",{timeZone:"Europe/Berlin"}),paymentMethod,paymentReference,customer,items,grossCents,netCents,vatCents,vatRate,sellerFooter};
   const svg=fs.readFileSync(path.join(process.cwd(),"public","europe-logo.svg"),"utf8"),pdfBytes=await createPdf(model,svg);
   await client.query("INSERT INTO sakan_invoices(payment_reference,invoice_number,stripe_session_id,customer_email,gross_cents,currency,pdf_bytes,invoice_data,email_sent_at) VALUES($1,$2,$3,$4,$5,'eur',$6,$7::jsonb,NULL)",[paymentReference,invoiceNumber,session.id,customer.email,grossCents,pdfBytes,JSON.stringify({invoiceNumber,date:model.date,paymentMethod,customer,items,grossCents,netCents,vatCents,vatRate})]);
   await client.query("COMMIT");inv={invoiceNumber,email:customer.email,pdfBytes,sent:false};
  }
 }catch(e){await client.query("ROLLBACK").catch(()=>{});throw e;}finally{client.release();}
 if(!inv.sent){
  await transporter().sendMail({from:process.env.SMTP_FROM,to:inv.email,subject:"Ihre Rechnung "+inv.invoiceNumber+" – SAKAN EUROPE",text:"Vielen Dank für Ihre Bestellung bei SAKAN EUROPE. Ihre PDF-Rechnung "+inv.invoiceNumber+" finden Sie im Anhang.",html:'<div style="font-family:Arial,sans-serif;color:#0D0D0D;max-width:600px;margin:auto"><div style="border-top:6px solid #D4AF37;padding:24px"><h2 style="letter-spacing:2px">SAKAN EUROPE</h2><p>Vielen Dank für Ihre Bestellung.</p><p>Ihre Rechnung <strong>'+inv.invoiceNumber+'</strong> befindet sich im PDF-Anhang.</p><p style="color:#80651d">European Home Luxury / Premium Möbel &amp; Wohnaccessoires</p></div></div>',attachments:[{filename:inv.invoiceNumber+".pdf",content:inv.pdfBytes,contentType:"application/pdf"}]});
  await database.query("UPDATE sakan_invoices SET email_sent_at=NOW() WHERE payment_reference=$1 AND email_sent_at IS NULL",[paymentReference]);
 }
 return {invoiceNumber:inv.invoiceNumber,emailed:true};
}
function safeEqual(a,b){if(typeof a!=="string"||typeof b!=="string")return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&require("node:crypto").timingSafeEqual(x,y);}
module.exports={issueInvoice,safeEqual};
