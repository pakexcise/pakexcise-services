export {
  formatSesFromAddress,
  getSesEmailConfig,
  isSesConfigured,
  type SesEmailConfig,
} from "@/server/notifications/ses/config";
export { getSesClient } from "@/server/notifications/ses/client";
export {
  sendTransactionalEmail,
  type SendEmailInput,
  type SendEmailResult,
} from "@/server/notifications/send-transactional-email";
export { deliverViaSes } from "@/server/notifications/ses/deliver-via-ses";
