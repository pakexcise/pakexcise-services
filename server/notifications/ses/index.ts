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
} from "@/server/notifications/ses/send-transactional-email";
