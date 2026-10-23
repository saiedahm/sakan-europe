const crypto = require("node:crypto");

const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER;
function required(name) { const value=process.env[name]; if(!value) throw new Error(name+" is not configured"); return value; }
function safeText(value, fallback="—") { return String(value || fallback).replace(/[\r\n\t]+/g," ").trim().slice(0,180); }
function eur(amount) { return new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(amount)||0); }
function orderMessage(order) {
  const items=safeText(order.itemsSummary || "Order details unavailable", "Order details unavailable");
  return [
    "[SAKAN EUROPE] New Order Alert!",
    "Order ID: "+safeText(order.orderId),
    "Customer: "+safeText(order.customerName)+" ("+safeText(order.city)+", "+safeText(order.country)+")",
    "Items: "+items,
    "Total Amount: €"+eur(order.totalEur)+" EUR",
    "Payment Status: Paid ("+safeText(order.paymentGateway)+")",
    "Auto-Fulfillment: "+safeText(order.fulfillmentStatus,"Pending supplier confirmation")
  ].join("\n").slice(0,1500);
}
async function sendOrderNotificationSMS(orderData) {
  const orderId=String(orderData && orderData.orderId || "");
  if(!orderId) throw new Error("SMS notification requires a stable orderId");
  if(!OWNER_PHONE || !/^\+\d{8,15}$/.test(OWNER_PHONE)) throw new Error("OWNER_PHONE_NUMBER must be configured in E.164 format");
  const sid=process.env.TWILIO_ACCOUNT_SID, token=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_PHONE_NUMBER;
  if(!sid||!token||!from) {
    console.warn("SAKAN SMS skipped: Twilio environment variables are not fully configured",{orderId});
    return {sent:false,reason:"not_configured"};
  }
  if(!/^AC[a-f0-9]{32}$/i.test(sid)) throw new Error("TWILIO_ACCOUNT_SID format is invalid");
  if(!/^\+\d{8,15}$/.test(from)) throw new Error("TWILIO_PHONE_NUMBER must use E.164 format");
  if(from===OWNER_PHONE) throw new Error("Twilio sender number cannot equal the owner's recipient number");
  const dbUrl=process.env.DATABASE_URL;
  if(!dbUrl) throw new Error("DATABASE_URL is required for idempotent SMS notifications");
  // Reuse the process-wide PostgreSQL pool used by the invoice module via the shared pool module.
  const {getPool}=require("./db");
  const pool=getPool();
  const claim=await pool.query(
    "INSERT INTO sakan_sms_notifications(payment_reference,order_id,status,attempt_count,sending_at) VALUES($1,$2,'sending',1,NOW()) ON CONFLICT(payment_reference) DO UPDATE SET status='sending',attempt_count=sakan_sms_notifications.attempt_count+1,sending_at=NOW(),last_error=NULL WHERE sakan_sms_notifications.status='failed' OR (sakan_sms_notifications.status='sending' AND sakan_sms_notifications.sending_at < NOW()-INTERVAL '5 minutes') RETURNING payment_reference",
    [String(orderData.paymentReference||orderId),orderId]
  );
  if(!claim.rowCount) {
    const existing=await pool.query("SELECT status,twilio_message_sid FROM sakan_sms_notifications WHERE payment_reference=$1",[String(orderData.paymentReference||orderId)]);
    return {sent:existing.rows[0]?.status==="sent",duplicate:true,status:existing.rows[0]?.status||"unknown"};
  }
  const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),5000);
  try {
    const form=new URLSearchParams({To:OWNER_PHONE,From:from,Body:orderMessage(orderData)});
    const auth=Buffer.from(sid+":"+token).toString("base64");
    const response=await fetch("https://api.twilio.com/2010-04-01/Accounts/"+encodeURIComponent(sid)+"/Messages.json",{method:"POST",headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},body:form.toString(),signal:controller.signal});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error("Twilio API "+response.status+": "+safeText(payload.message,"message dispatch failed"));
    await pool.query("UPDATE sakan_sms_notifications SET status='sent',twilio_message_sid=$2,sent_at=NOW(),sending_at=NULL,last_error=NULL WHERE payment_reference=$1",[String(orderData.paymentReference||orderId),payload.sid||null]);
    console.info("SAKAN order SMS sent",{orderId,messageSid:payload.sid||null,status:payload.status||"queued"});
    return {sent:true,messageSid:payload.sid||null,status:payload.status||"queued"};
  } catch(error) {
    await pool.query("UPDATE sakan_sms_notifications SET status='failed',sending_at=NULL,last_error=$2 WHERE payment_reference=$1",[String(orderData.paymentReference||orderId),safeText(error.message,"SMS send failed")]).catch(()=>{});
    console.error("SAKAN order SMS failed",{orderId,error:safeText(error.message,"SMS send failed")});
    throw error;
  } finally { clearTimeout(timeout); }
}
module.exports={sendOrderNotificationSMS};
