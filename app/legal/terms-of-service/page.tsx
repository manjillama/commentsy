import Footer from "@/components/footer";
import { withSiteLayout } from "@/hoc";

async function TermsOfService() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-lg mx-auto px-[15px] py-10">
        <h2 className="text-6xl font-bold">Terms of Service</h2>
        <p className="my-4">
          Commentsy. (“Commentsy”, “we”, “us” or “our”) is an open source
          project and offers an online public comment sharing platform where you
          may login and create profiles to participate in conversations with
          peers and enjoy an interactive experience. Our services are best only
          for small businesses and individuals with small-scale needs and it is
          best to use other commercial projects if your project has extensive
          needs. These Terms of Service (the “Terms”) govern your use of and
          access to our comment sharing platform, software and website
          (collectively the “Service”) by using the Service you understand and
          agree to be bound by these Terms. Commentsy will not be liable for any
          losses.
        </p>
        <p className="my-4 font-bold">Commentsy Account.</p>
        <p className="my-4">
          By creating a Commentsy account, you agree to these Terms. When
          creating your account, you must provide accurate and complete
          information. You are solely responsible for the activity that occurs
          on your account, and you must keep your account password secure. We
          encourage you to use “strong” passwords (passwords that use a
          combination of upper and lowercase letters, numbers and symbols) with
          your account. You may never use another user’s account without
          permission.
        </p>
        <p className="my-4 font-bold">Privacy. </p>
        <p className="my-4">
          The Commentsy Privacy Policy describes how we use and process the
          information you provide to us when you use the Service. You understand
          that by using the Services you consent to the collection, use and
          disclosure of your information as set forth in our Privacy Policy.
        </p>
        <p className="my-4 font-bold">Content on the Services.</p>
        <p className="my-4">
          You are responsible for your use of the Services and for any content
          you submit, post, display or otherwise make available on or through
          the Service (“User Content”), including that such User Content
          complies with applicable laws, rules, and regulations. You should only
          provide Content that you are comfortable sharing with others.
        </p>
        <p className="my-4 font-bold">Commentsy Content</p>
        <p className="my-4">
          Commentsy’ name, logo, designs, trademarks, trade dress, service
          marks, copyrights, patents or other intellectual property rights in
          Commentsy’ software, images, text, graphics, illustrations, logos,
          APIs etc. (the “Commentsy Content”) is the exclusive property of
          Commentsy or its licensors. Except as explicitly provided herein,
          nothing in these Terms shall be deemed to create a license in or to
          Commentsy Content, and you agree not to sell, license, rent, modify,
          distribute, copy, reproduce, transmit, publicly display, publicly
          perform, publish, adapt, edit or create derivative works from any
          Commentsy Content. Use of the Commentsy Content for any purpose not
          expressly permitted by these Terms is strictly prohibited.
        </p>
        <p className="my-4 font-bold">Service Rules</p>
        <p className="my-4">
          Please review the Commentsy Service Rules below, in consideration of
          the license to use the Services you agree to comply with the Service
          Rules which are part of these Terms and outline what is prohibited on
          the services. Please also note, Commentsy comments often appear in
          websites and online communities not owned by Commentsy, these websites
          and online communities may have their own rules about content and
          comments on their site, please respect the rules of the communities in
          which you are using Commentsy to comment.
        </p>
        <p className="my-4">
          Bullying; Harassment; Hate Speech. We do not allow bullying or hate
          speech on the Commentsy platform. Hate speech attacks people based on
          “protected characteristics” which include race, ethnicity, sexual
          orientation, religious affiliation, sex, gender, gender identity or
          serious disability or disease. Bullying targets individuals with the
          intention of degrading or shaming them. Bullying is especially harmful
          to minors because they may be more vulnerable. Commentsy prohibits
          bullying and hate speech and requires our users to respect each other
          and comment with the respect and sensitivity of others in mind.
        </p>
        <p className="my-4">
          Trademark Rights and Rights of Publicity; Impersonation. Users are
          required to respect the intellectual property rights of others, and
          are prohibited from posting content that violates someone else’s
          copyright, trademark, or right of publicity. Additionally, users are
          prohibited from impersonating others in a manner that does or is
          intended to mislead or deceive others. Accounts portraying another
          person in a confusing or deceptive manner may be banned at Commentsy’
          discretion.
        </p>
        <p className="my-4">
          Safety; Self-Harm. Users are prohibited from promoting or encouraging
          suicide or self-harm. When we receive reports that a person is
          threatening suicide or self-harm, we may take a number of steps to
          assist them, such as reaching out to that person and providing
          resources such as contact information for our mental health partners.
        </p>
        <p className="my-4">
          Violence and Criminal Acts. Users are prohibited from promoting or
          publicizing violent crime, theft, or fraud. We also prohibit users
          from making credible threats of violence, serious physical harm, or
          death. This includes, but is not limited to, promoting, publicizing or
          threatening terrorist activity, organized hate crime, mass or serial
          murder, human trafficking, organized violence.
        </p>
        <p className="my-4">
          Child sexual exploitation. Commentsy prohibits content that sexually
          exploits or endangers children. If we become aware of apparent child
          exploitation, we will report it in compliance with applicable law.
        </p>
        <p className="my-4">
          Inappropriate Content. Graphic media, including explicit violence,
          gore, and pornographic content are not allowed.
        </p>
        <p className="my-4">
          Deceitful data collection; Malware Collecting or harvesting any
          personally identifiable information, including account names, from the
          Service; attempting to interfere with, to compromise the system
          integrity or security or to decipher any transmissions to or from the
          servers running the Service; (v) taking any action that imposes, or
          may impose at our sole discretion an unreasonable or
          disproportionately large load on our infrastructure; (vi) uploading
          data, viruses, worms, or other software agents through the Service
          accessing any content on the Service through any technology or means
          other than those provided or authorized by the Service; or (xiii)
          bypassing the measures we may use to prevent or restrict access to the
          Service, including without limitation features that prevent or
          restrict use or copying of any content or enforce limitations on use
          of the Service or the content therein.
        </p>
        <p className="my-4 font-bold">Spam.</p>
        <p className="my-4">
          Users are prohibited from posting or sending Spam through the service.
          What constitutes Spam is constantly evolving. Generally, Spam means
          repeated actions that negatively impact others, such as repeatedly
          posting a comment with the intent to post a thread etc.
        </p>
      </div>
    </div>
  );
}

export default withSiteLayout(TermsOfService);
