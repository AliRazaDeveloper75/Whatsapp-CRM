export const metadata = {
  title: "Privacy Policy — Qomunix",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-2xl font-semibold" style={{ color: "var(--text)" }}>
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm" style={{ color: "var(--text-faint)" }}>
          Last updated: 22 August 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              Who we are
            </h2>
            <p>
              Qomunix (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) provides a customer relationship
              management platform that lets our team communicate with customers over WhatsApp. This policy explains
              what information we collect through that platform and how we use it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              Information we collect
            </h2>
            <p className="mb-2">When you message our business number on WhatsApp, we collect:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your WhatsApp phone number and profile name</li>
              <li>The content of messages you send us (text, media, and attachments)</li>
              <li>Message delivery status (sent, delivered, read)</li>
              <li>Timestamps of when messages were sent and received</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              How we use this information
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To respond to your questions and provide customer support</li>
              <li>To route your conversation to the right team member</li>
              <li>To keep a record of past conversations for continuity of service</li>
              <li>To improve our products and support quality</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              How we share information
            </h2>
            <p>
              We do not sell your information. Messages are processed through Meta&rsquo;s WhatsApp Business
              Platform to deliver and receive your messages, and are stored on our own servers so our team can
              respond to you. We do not share your data with any other third party except where required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              Data retention
            </h2>
            <p>
              We retain conversation history for as long as needed to provide support and maintain business
              records. You can ask us to delete your conversation history at any time using the contact details
              below.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              Your rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of the information we hold about you at any
              time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--text)" }}>
              Contact us
            </h2>
            <p>
              For any privacy questions or requests, reach out to us on WhatsApp through the same number you used
              to contact our business.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
