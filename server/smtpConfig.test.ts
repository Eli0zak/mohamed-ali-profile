import { describe, expect, it } from "vitest";
import nodemailer from "nodemailer";

describe("SMTP configuration", () => {
  it("authenticates with the configured Gmail SMTP account without sending mail", async () => {
    expect(process.env.SMTP_HOST).toBeTruthy();
    expect(process.env.SMTP_PORT).toBeTruthy();
    expect(process.env.SMTP_USER).toBeTruthy();
    expect(process.env.SMTP_PASSWORD).toBeTruthy();
    expect(process.env.SMTP_FROM).toBeTruthy();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });

    await expect(transporter.verify()).resolves.toBe(true);
    transporter.close();
  }, 20_000);
});

export {};
