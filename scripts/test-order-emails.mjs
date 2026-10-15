import { createOrderMailer } from "../server/notifications/smtp.ts";
if (!process.env.ORDER_EMAIL_TEST_TO)
  throw new Error("ORDER_EMAIL_TEST_TO is required for this test.");
const mailer = createOrderMailer();
await mailer.verify();
console.log("SMTP TLS bağlantısı ve kimlik doğrulaması başarılı.");
if (process.argv.includes("--send")) {
  const order = {
    id: "MT-SMTP-TEST-" + Date.now(),
    customer: {
      name: "Test Müşterisi",
      email: process.env.ORDER_EMAIL_TEST_TO,
      phone: "Test telefonu",
      address: "Örnek teslimat adresi (gerçek sipariş değildir)",
      district: "Kadıköy",
      city: "İstanbul",
    },
    items: [
      { name: "Örnek Cam Tablo", size: "25 × 35 cm", quantity: 1, unitAmount: 61000, discount: 0 },
    ],
    amount: 61000,
    discount: 0,
    test_mode: true,
  };
  await mailer.send(order, "customer");
  console.log("Müşteri örneği SMTP sunucusu tarafından kabul edildi.");
  await mailer.send(order, "admin");
  console.log("Admin örneği SMTP sunucusu tarafından kabul edildi.");
}
