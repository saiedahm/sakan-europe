const {sendOrderNotificationSMS}=require("../../lib/order-notifications");

function paypalBase() {
 return process.env.PAYPAL_ENVIRONMENT==="live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}
async function accessToken() {
 const client=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_SECRET;
 if(!client||!secret) throw new Error("PayPal API credentials are not configured");
 const response=await fetch(paypalBase()+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+Buffer.from(client+":"+secret).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
 const data=await response.json();
 if(!response.ok||!data.access_token) throw new Error("Could not obtain PayPal access token");
 return data.access_token;
}
module.exports=async function handler(req,res) {
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
 const webhookId=process.env.PAYPAL_WEBHOOK_ID;
 if(!webhookId||!process.env.DATABASE_URL) return res.status(503).json({error:"PayPal notification service is not configured"});
 const event=req.body;
 if(!event||typeof event!=="object"||!event.event_type||!event.id) return res.status(400).json({error:"Invalid PayPal event"});
 try {
  const token=await accessToken();
  const verification={
   auth_algo:req.headers["paypal-auth-algo"],
   cert_url:req.headers["paypal-cert-url"],
   transmission_id:req.headers["paypal-transmission-id"],
   transmission_sig:req.headers["paypal-transmission-sig"],
   transmission_time:req.headers["paypal-transmission-time"],
   webhook_id:webhookId,
   webhook_event:event
  };
  if(Object.values(verification).some(v=>!v)) return res.status(400).json({error:"Missing PayPal signature headers"});
  const check=await fetch(paypalBase()+"/v1/notifications/verify-webhook-signature",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify(verification)});
  const verified=await check.json();
  if(!check.ok||verified.verification_status!=="SUCCESS") return res.status(400).json({error:"Invalid PayPal webhook signature"});
  if(event.event_type!=="PAYMENT.CAPTURE.COMPLETED") return res.status(200).json({received:true,ignored:true});
  const resource=event.resource||{};
  const related=resource.supplementary_data&&resource.supplementary_data.related_ids||{};
  const orderId=related.order_id||resource.invoice_id||resource.custom_id||resource.id;
  const currency=resource.amount&&resource.amount.currency_code;
  if(currency!=="EUR") return res.status(422).json({error:"Only EUR payments are supported for SAKAN EUROPE SMS notifications"});
  let order=null;
  if(related.order_id) {
   const response=await fetch(paypalBase()+"/v2/checkout/orders/"+encodeURIComponent(related.order_id),{headers:{Authorization:"Bearer "+token}});
   if(response.ok) order=await response.json();
  }
  const unit=order&&order.purchase_units&&order.purchase_units[0]||{};
  const payer=order&&order.payer||{};
  const shipping=unit.shipping||{}, address=shipping.address||{};
  const items=(unit.items||[]).map(i=>(i.name||"Product")+" x"+(i.quantity||1)).join(", ");
  const result=await sendOrderNotificationSMS({
   orderId:String(orderId),
   paymentReference:String(resource.id||orderId),
   customerName:[payer.name&&payer.name.given_name,payer.name&&payer.name.surname].filter(Boolean).join(" ")||shipping.name&&shipping.name.full_name||"PayPal customer",
   city:address.admin_area_2||"Unknown city",
   country:address.country_code||"Unknown country",
   itemsSummary:items||"PayPal order items not included in webhook",
   totalEur:Number(resource.amount.value),
   paymentGateway:"PayPal",
   fulfillmentStatus:"Pending supplier confirmation"
  });
  console.info("SAKAN PayPal payment notification processed",{eventId:event.id,orderId:String(orderId),smsSent:!!result.sent});
  return res.status(200).json({received:true,smsSent:!!result.sent});
 } catch(error) {
  console.error("SAKAN PayPal webhook processing failed",{eventId:event.id,message:error&&error.message});
  return res.status(500).json({error:"PayPal event processing failed"});
 }
};
