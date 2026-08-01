import React from 'react'
import SEO from './SEO'

const PrivacyPolicy = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://Uploadio.com"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Privacy Policy",
      "item": "https://Uploadio.com/privacy-policy"
    }]
  }

  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Read our privacy policy to understand how we collect, use, and protect your personal information when using Pixora AI."
        url="https://Uploadio.com/privacy-policy"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-600">Last updated: December 2024</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you upload images to our service. This includes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Images you upload for processing</li>
                  <li>Usage data and analytics</li>
                  <li>Device information and browser type</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Process and edit your images</li>
                  <li>Improve our AI models and services</li>
                  <li>Analyze usage patterns and optimize performance</li>
                  <li>Respond to your questions and support requests</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Data Retention</h2>
                <p>Your uploaded images are automatically deleted from our servers within 1 hour after processing. We do not store your images permanently or use them for any purpose other than the immediate processing you request.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. However, no method of transmission over the Internet is 100% secure.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
                <p>We use cookies to enhance your experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Third-Party Services</h2>
                <p>We may use third-party services for analytics and performance monitoring. These services have their own privacy policies and data handling practices.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                <p>Depending on your location, you may have rights including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Access to your personal data</li>
                  <li>Correction of inaccurate data</li>
                  <li>Deletion of your data</li>
                  <li>Opt-out of data collection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
                <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                <p>If you have questions about this privacy policy, please contact us at:</p>
                <p className="mt-2">Email: privacy@Uploadio.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy