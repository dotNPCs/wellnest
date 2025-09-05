"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">WellNest Privacy Policy</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
        <p>
          WellNest is a gamified mental-health platform created for the Singapore
          community. This policy explains how we collect, use, disclose and
          protect your personal data when you interact with our mobile app,
          website and related services (collectively, “WellNest”). It is designed
          to comply with Singapore’s Personal Data Protection Act (PDPA). The
          PDPA defines personal data as information about an individual who can
          be identified from that data or from other accessible information and
          provides baseline standards for its protection. We also recognise that
          information about your mental health is particularly sensitive and
          requires explicit, informed consent. By using WellNest, you acknowledge
          that you have read and understood this policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">What Data We Collect</h2>

        <h3 className="text-xl font-medium mt-4 mb-1">Personal Information</h3>
        <p>
          We ask for limited personal data to provide the service. This may
          include your email address, username or nickname, password, age range
          or year of birth (to confirm eligibility), and contact details if you
          choose to contact us. Under the PDPA, personal data is any data that
          can identify an individual. We do not require NRIC numbers or full
          names.
        </p>

        <h3 className="text-xl font-medium mt-4 mb-1">Self‑Care and Mood Data</h3>
        <p>
          When you log your feelings during meal times, complete guided
          activities or write journal entries, we collect the content you
          provide. Because these logs relate to your emotional state, they are
          considered sensitive personal data. We obtain explicit, granular
          consent for processing this data.
        </p>

        <h3 className="text-xl font-medium mt-4 mb-1">Usage and Technical Data</h3>
        <p>
          We collect data about how you use WellNest, such as login frequency,
          the number of pets unlocked and interaction timestamps. We may also
          gather device information (IP address, device type and operating
          system) and use cookies or similar technologies to remember your
          session. These cookies do not track you for advertising; they serve to
          improve functionality and stability.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">How We Collect Data</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Register for an account or log in.</li>
          <li>Input mood check‑ins, journaling entries or reflections.</li>
          <li>Interact with in‑app features (e.g., pets or farms).</li>
          <li>Contact us via email or support channels.</li>
        </ul>
        <p className="mt-2">
          We also collect some data automatically through cookies and analytics
          tools. You may disable cookies in your browser settings, but the
          service may not function properly.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">How We Use Your Data</h2>
        <p>
          We use your data only for purposes a reasonable person would consider
          appropriate and for which you have given consent:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            Providing the service – Your mood logs, journal entries and usage
            patterns allow us to mirror your emotional state in the virtual pet,
            personalise reminders and unlock new pets.
          </li>
          <li>
            Improving your well‑being – We analyse patterns (e.g., early signs
            of burnout) to suggest meditation or reflective activities.
          </li>
          <li>
            Analytics and research – We measure engagement and may share
            anonymised, aggregated statistics but will never identify you.
          </li>
          <li>
            Communications – We may send service announcements, respond to
            support requests, or notify you of policy updates. You may opt out of
            non‑essential communications.
          </li>
        </ul>
        <p className="mt-2">
          We do not use your personal data for targeted advertising, nor do we
          sell it to third parties.
        </p>
      </section>

      {/* Continue adding sections in same pattern for Legal Basis, Data Sharing, etc. */}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
        <p>
          If you have any questions, concerns or complaints about your personal
          data or this policy, please contact our Data Protection Officer:
        </p>
        <p className="mt-2 font-medium">Email: dpo@wellnest.sg (example)</p>
        <p className="mt-2">
          For disputes that cannot be resolved directly, you may lodge a
          complaint with the Personal Data Protection Commission of Singapore.
        </p>
        <p className="mt-4 italic">
          This privacy policy was last updated on 6 September 2025.
        </p>
      </section>
    </main>
  );
}
