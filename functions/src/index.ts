import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");

export const sendSms = onRequest(
  {
    cors: ["https://stock-list-8fa75.web.app", "http://localhost:4200"],
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhoneNumber],
  },
  async (req, res) => {
    try {
      const { to, message } = req.body ?? {};

      if (
        typeof to !== "string" ||
        typeof message !== "string" ||
        !to.trim() ||
        !message.trim()
      ) {
        res.status(400).json({
          success: false,
          error: "Request body must include non-empty 'to' and 'message' strings.",
        });
        return;
      }

      const client = twilio(
        twilioAccountSid.value(),
        twilioAuthToken.value()
      );

      const result = await client.messages.create({
        body: message.trim(),
        from: twilioPhoneNumber.value(),
        to: to.trim(),
      });

      res.json({ success: true, sid: result.sid });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Unable to send SMS.",
      });
    }
  }
);