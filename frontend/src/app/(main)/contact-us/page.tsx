import { Locate, LocateFixedIcon, LocateIcon, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center px-6 py-20">

      {/* Title Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Contact <span className="text-blue-600">BidBase</span>
        </h1>

        <p className="text-gray-600 text-lg">
          Have questions about auctions or need help with bidding?  
          Our team is here to help you.
        </p>
      </div>

      {/* Contact Section */}
      <div className="mt-16 grid md:grid-cols-2 gap-12 max-w-5xl w-full">

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Send us a message
          </h2>

          <form className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Your Name"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              rows={5}
              placeholder="Your Message"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Send Message
            </button>

          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Get in Touch
          </h2>

          <div className="space-y-4 text-gray-600">

            <p>
              <Mail/> <span className="font-medium text-gray-800">Email:</span> support@bidbase.com
            </p>

            <p>
              <Phone/><span className="font-medium text-gray-800">Phone:</span> +91 9876543210
            </p>

            <p>
                <LocateFixedIcon/><span className="font-medium text-gray-800">Address:</span> Mumbai, India
            </p>

            <p className="pt-4">
              Our support team usually responds within 24 hours.  
              Feel free to reach out for any questions related to auctions, bidding, or your account.
            </p>

          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-16 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition"
      >
        Back to Home
      </Link>

    </div>
  );
}