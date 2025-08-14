// import stripe from "stripe";
// import Booking from "../Models/Booking.js";
// import { inngest } from "../Inngest/index.js";

// export const stripeWebhooks = async (req, res) => {
//   const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripeInstance.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   try {
//     switch (event.type) {
//       // case 'payment_intent.succeeded':{
//       //     const paymentIntent = event.data.object;
//       //     const sessionList = await stripeInstance.checkout.sessions.list({
//       //         payment_intent : paymentIntent.id
//       //     })

//       //     const session = sessionList.data[0];
//       //     const {bookingId} = session.metadata;
//       case "checkout.session.completed": {
//         const session = event.data.object;
//         const bookingId = session.metadata.bookingId;

//         await Booking.findByIdAndUpdate(bookingId, {
//           isPaid: true,
//           paymentLink: "",
//         });

//         // Send confirmation email
//         await inngest.send({
//           name: "app/show.booked",
//           data: { bookingId },
//         });
//         break;
//       }

//       default:
//         console.log("Unhandled event type", event.type);
//         break;
//     }

//     res.json({ received: true });
//   } catch (error) {
//     console.log("WebHook Processing Error", error);
//     res.status(500).send("Internal Server Error");
//   }
// };


// stripeWebhooks.js
import stripe from "stripe";
import Booking from "../Models/Booking.js";
import { inngest } from "../Inngest/index.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (!session.metadata || !session.metadata.bookingId) {
          console.error("No bookingId found in session metadata");
          break;
        }

        const bookingId = session.metadata.bookingId;
        console.log("✅ Payment completed for booking:", bookingId);

        // Update booking in DB
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { isPaid: true, paymentLink: "" },
          { new: true }
        );

        if (!updatedBooking) {
          console.error("❌ Booking not found in DB for ID:", bookingId);
        } else {
          console.log("✅ Booking updated:", updatedBooking._id);
        }

        // Send confirmation email via inngest
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId },
        });

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
