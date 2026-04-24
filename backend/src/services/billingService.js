const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { db } = require("./firebaseAdmin");

const createCheckoutSession = async (userId, userEmail) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // 1. Check if user already has a Stripe Customer ID
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    let customerId = userDoc.exists ? userDoc.data().stripeCustomerId : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { firebaseUID: userId }
      });
      customerId = customer.id;
      await userRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    // 2. Create Checkout Session for a Subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/cancel`,
    });

    return session.url;
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
};

const createPortalSession = async (userId) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) throw new Error("No customer found");

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    return session.url;
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    throw error;
  }
};

module.exports = { createCheckoutSession, createPortalSession };
