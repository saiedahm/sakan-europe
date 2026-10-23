const Stripe=require("stripe");
const {issueInvoice,safeEqual}=require("../../lib/invoices");
module.exports=async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
 const configured=process.env.INVOICE_API_SECRET,provided=req.headers["x-invoice-api-secret"];
 if(!configured||configured.length<32||!safeEqual(provided,configured))return res.status(401).json({error:"Unauthorized"});
 if(!process.env.STRIPE_SECRET_KEY||!process.env.DATABASE_URL)return res.status(503).json({error:"Invoice service is not configured"});
 const id=req.body&&req.body.checkoutSessionId;
 if(typeof id!=="string"||!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(id))return res.status(400).json({error:"Valid checkoutSessionId is required"});
 try{const stripe=new Stripe(process.env.STRIPE_SECRET_KEY),session=await stripe.checkout.sessions.retrieve(id,{expand:["line_items.data.price.product"]});if(session.payment_status!=="paid")return res.status(409).json({error:"Invoice can only be issued for a paid Stripe Checkout Session"});const result=await issueInvoice(session,"Stripe");return res.status(200).json({ok:true,invoiceNumber:result.invoiceNumber,emailed:result.emailed});}
 catch(error){console.error("SAKAN manual invoice endpoint failed",error&&error.message);return res.status(500).json({error:"Invoice could not be generated or emailed"});}
};
