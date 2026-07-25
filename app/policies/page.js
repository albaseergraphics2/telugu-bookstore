export default function Policies() {
  return (
    <div style={{ padding: "40px", lineHeight: "1.8", maxWidth: "900px", margin: "auto" }}>

      <h1 style={{ marginBottom: "20px" }}>Policies</h1>

      {/* 🔐 PRIVACY POLICY */}
      <section>
      <hr/>
        <h2>Privacy Policy</h2>
        <p>
          At Telugu Bookstore, we value your privacy. We collect only essential
          information such as your name, phone number, and address to process
          orders and ensure smooth delivery.
        </p>
        <p>
          Your data is never sold or shared with third parties except for delivery
          purposes.
        </p>
      </section>

      <hr />

      {/* 📜 TERMS */}
      <section>
        <h2>Terms & Conditions</h2>
        <p>
          By accessing and using our website, you agree to comply with our terms
          and conditions.
        </p>
        <p>
          Any misuse, fraudulent activity, or unauthorized access to the website
          is strictly prohibited and may lead to legal action.
        </p>
        <p>
          Orders once placed cannot be cancelled after processing. Please review
          your order carefully before confirming.
        </p>
      </section>

      <hr />

      {/* 📲 ORDER & PAYMENT */}
      <section>
        <h2>Order & Payment Policy</h2>
        <p>
          All orders are placed through WhatsApp. After confirming your order,
          we will share payment details.
        </p>
        <p>
          Orders will be processed only after successful payment confirmation.
        </p>
        <p>
          We support UPI payments (PhonePe, Google Pay, Paytm).
        </p>
        <p>
          Please ensure all order details are correct while placing your order
          on WhatsApp to avoid delays.
        </p>
      </section>

      <hr />
            {/* 🚚 SHIPPING */}
      <section>
        <h2>Shipping Policy</h2>

        <p><strong>We provide multiple delivery options based on order quantity:</strong></p>

        <p>
          <strong>For Small Quantity Orders:</strong><br />
          Orders with fewer books will be shipped via India Post or courier services
          to ensure safe and economical delivery.
        </p>

        <p>
          <strong>For Bulk Orders (Large Quantity):</strong><br />
          Orders with more books will be shipped through RTC parcel services
          (TSRTC / APSRTC) or private travel bus transport, depending on availability
          and customer preference.
        </p>

        <p>
          Shipping method will be selected based on order size, delivery location,
          and customer preference.
        </p>

        <p>
          Final delivery charges will be informed and confirmed via WhatsApp before shipping.
        </p>

        <p>
          Orders are processed within <strong>1–2 business days</strong> after payment confirmation.
        </p>

      </section>
      {/* <hr/> */}

      {/* 💰 REFUND */}
      {/* <section>
        <h2>Refund Policy</h2>
        <p>
          Refunds are only applicable for damaged, defective, or incorrect items.
        </p>
        <p>
          Requests must be made within <strong>3 days</strong> of delivery with
          valid proof (images or video).
        </p>
        <p>
          The product must be unused and in its original condition.
        </p>
        <p>
          Approved refunds will be processed via UPI within 3–5 business days.
        </p>
      </section> */}



    </div>
  );
}