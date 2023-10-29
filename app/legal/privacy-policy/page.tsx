import { withSiteLayout } from "@/hoc";

function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-lg mx-auto px-[15px] py-10">
        <h2 className="text-6xl font-bold">Privacy Policy</h2>
        <p className="my-4">
          This Privacy Policy tells you how Commentsy collects, uses, discloses
          and protects data relating to you in connection with our Service (as
          defined below).
        </p>
        <p className="my-4 font-bold">1. Introduction</p>
        <p className="my-4">
          Commentsy is an open source project and offers an online public
          comment sharing platform where you may login and create profiles to
          participate in conversations with peers and enjoy an interactive
          experience. Use of our platform and software (collectively the
          “Service”) is subject to the terms of this Privacy Policy. The Service
          is a public platform and Disqus or others may search for, see, use, or
          re-post any of your User Content (as defined in our Terms of Use) that
          you post through the Service. Disqus uses and shares personal data for
          marketing purposes, including cross-contest behavioral advertising.
        </p>
        <p className="my-4 font-bold">2. The data we collect about you</p>
        <p className="my-4">
          We collect, use, store and transfer the following kinds of personal
          data about you:
        </p>
        <ul className="list-disc ml-4">
          <li className="my-4">
            We do not collect any personal data except for first name, last
            name, username or similar identifier, and email address.
          </li>
          <li className="my-4">
            Publisher&apos;s web address and title when users comment, unique
            Cookie ID, Device ID.
          </li>
          <li className="my-4">
            Information about how you use the Service, and the content of
            comments that you post.
          </li>
        </ul>
        <p id="cookie-policy" className="font-bold my-4">
          3. Cookie policy
        </p>
        <p className="my-4">
          Commentsy does not use cookie for any other purposes except for
          authentication.
        </p>
        <p className="my-4">
          Commentsy uses &apos;authentication&apos; cookies, to keep you logged
          in from your web browser and personalize your Commentsy experience.
        </p>
      </div>
    </div>
  );
}
export default withSiteLayout(PrivacyPolicy);
