const Stripe=require("stripe");
const {issueInvoice}=require("../lib/invoices");
module.exports.config={api:{bodyParser:false}};
async function rawBody(req){if(Buffer.isBuffer(req.body))return req.body;const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks);}
module.exports=async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
 const key=process.env.STRIPE_SECRET_KEY,secret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!key||!secret||!process.env.DATABASE_URL)return res.status(503).json({error:"Invoice payment service is not configured"});
 const stripe=new Stripe(key);let event;
 try{const body=await rawBody(req),signature=req.headers["stripe-signature"];if(!signature)return res.status(400).json({error:"Missing Stripe signature"});event=stripe.webhooks.constructEvent(body,signature,secret,300);}
 catch(_){return res.status(400).json({error:"Invalid Stripe webhook signature or payload"});}
 try{
  if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded"){
   if(event.data.object.payment_status!=="paid")return res.status(200).json({received:true,invoice:"waiting_for_payment"});
   const session=await stripe.checkout.sessions.retrieve(event.data.object.id,{expand:["line_items.data.price.product"]});
   if(session.payment_status!=="paid")return res.status(200).json({received:true,invoice:"payment_not_paid"});
   const result=await issueInvoice(session,"Stripe");return res.status(200).json({received:true,invoice:result.invoiceNumber,emailed:result.emailed});
  }
  if(event.type==="payment_intent.succeeded"){
   const sessions=await stripe.checkout.sessions.list({payment_intent:event.data.object.id,limit:1});
   const session=sessions.data[0];
   if(!session||session.payment_status!=="paid")return res.status(500).json({error:"Paid PaymentIntent has no matching paid Checkout Session yet"});
   const full=await stripe.checkout.sessions.retrieve(session.id,{expand:["line_items.data.price.product"]});
   const result=await issueInvoice(full,"Stripe");return res.status(200).json({received:true,invoice:result.invoiceNumber,emailed:result.emailed});
  }
  return res.status(200).json({received:true,ignored:true});
 }catch(error){console.error("SAKAN invoice webhook processing failed",{eventId:event.id,type:event.type,message:error&&error.message});return res.status(500).json({error:"Invoice generation or email delivery failed; Stripe may retry"});}
};
