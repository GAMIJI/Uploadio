import React from 'react'
import SEO from './SEO'

const Terms = () => {
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
      "name": "Terms of Service",
      "item": "https://Uploadio.com/terms"
    }]
  }

  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read our terms of service to understand the rules and guidelines for using Pixora AI's image editing tools and services."
        url="https://Uploadio.com/terms"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-gray-600">Last updated: December 2024</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using Pixora AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p>Pixora AI provides AI-powered image editing tools including but not limited to passport photo generation, background removal, image resizing, compression, and format conversion.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Use the service only for lawful purposes</li>
                  <li>Not upload illegal, harmful, or infringing content</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not attempt to circumvent any security measures</li>
                  <li>Not use the service to generate misleading or deceptive content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
                <p>You retain all rights to your original images. By using our service, you grant us a temporary license to process your images solely for the purpose of providing the requested editing services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
                <p>Pixora AI is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, including but not limited to data loss, image quality issues, or misuse of generated content.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Service Availability</h2>
                <p>We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect service availability.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Prohibited Content</h2>
                <p>The following content is prohibited:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Illegal or fraudulent content</li>
                  <li>Pornographic or sexually explicit material</li>
                  <li>Content that infringes on others' rights</li>
                  <li>Harassing, threatening, or abusive content</li>
                  <li>Content containing malicious code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for violations of these terms or other harmful conduct.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Governing Law</h2>
                <p>These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
                <p>For questions about these terms, please contact us at:</p>
                <p className="mt-2">Email: legal@Uploadio.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Terms