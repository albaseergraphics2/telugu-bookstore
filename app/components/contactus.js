import { FaWhatsapp } from "react-icons/fa";

export default function contactus() {
  const email="albaseergraphics1@gmail.com";
  const phoneNumber = "+91 9441055065";
  const whatsappNumber = "919441055065";
  const message = "Hello, I want to enquire about books.";
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section className="about-contact" id="contact">

      <div className="about-contact-container">
        <div className="contact-box">
          <h2>Contact Us</h2>
          <div className="direct-contact">

            <p className="contact-note">
              For quick response, contact us directly on WhatsApp or call.
            </p>

            <div className="contact-details">
              <p><strong>📞 Mobile:</strong> {phoneNumber}</p>
              <p><strong>📧 Email:</strong> {email}</p>

              <a
                href={whatsappURL}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                <FaWhatsapp className="phone-icon" />
                Chat on WhatsApp
              </a>
            </div>

            {/* <div className="bulk-order">
              <h3>Bulk Orders</h3>
              <p>
                Special discount available for bulk quantity orders.
                Contact us on WhatsApp for catalogue and price list.
              </p>
            </div> */}

          </div>
        </div>
      </div>
    </section>
  );
}
