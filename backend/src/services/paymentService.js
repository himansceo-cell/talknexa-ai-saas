const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a simple payment link for a deposit or full payment.
 * @param {string} customerName 
 * @param {string} serviceName 
 * @param {number} amount In dollars (e.g., 20.00)
 */
const createPaymentLink = async (customerName, serviceName, amount) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${serviceName} Deposit - ${customerName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: process.env.VITE_FRONTEND_URL + "/success", // Use env var
      cancel_url: process.env.VITE_FRONTEND_URL + "/cancel",   // Use env var
      metadata: { customerName, serviceName }
    });

    return session.url;
  } catch (error) {
    console.error("Stripe Error:", error);
    return null;
  }
};

/**
 * Lists recent checkout sessions for dashboard analytics.
 */
const getRecentPayments = async (limit = 10) => {
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ['data.payment_intent'],
    });

    return sessions.data.map(s => ({
      id: s.id,
      customer: s.metadata.customerName || "Customer",
      service: s.metadata.serviceName || "Service",
      amount: s.amount_total / 100,
      status: s.status, // open, complete, expired
      paymentStatus: s.payment_status, // paid, unpaid, no_payment_required
      created: s.created
    }));
  } catch (error) {
    console.error("Stripe List Error:", error);
    return [];
  }
};

module.exports = { createPaymentLink, getRecentPayments };
