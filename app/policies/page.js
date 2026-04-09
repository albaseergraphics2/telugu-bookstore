export default function Policies() {
  return (
    <div style={{ padding: "40px", lineHeight: "1.6" }}>
      
      <h1>Policies</h1>

      {/* 🔐 PRIVACY POLICY */}
      <section>
        <h2>Privacy Policy</h2>
        <p>
          At Telugu Bookstore, we respect your privacy. We collect basic details
          like name, phone number, address, and email only for order processing
          and delivery.
        </p>
        <p>
          We do not share your personal information with third parties except
          for delivery purposes.
        </p>
      </section>

      <hr />

      {/* 📜 TERMS */}
      <section>
        <h2>Terms & Conditions</h2>
        <p>
          By using our website, you agree to follow our terms and conditions.
        </p>
        <p>
          All orders are subject to availability. Prices may change without
          notice.
        </p>
        <p>
          Misuse of the website or unauthorized access is strictly prohibited.
        </p>
      </section>

      <hr />

      {/* 💰 REFUND */}
      <section>
        <h2>Refund Policy</h2>
        <p>
          Refunds are available only for damaged or incorrect products.
        </p>
        <p>
          You must request within 3 days of delivery with proof (images).
        </p>
        <p>
          Product must be unused and in original condition.
        </p>
      </section>

      <hr />

      {/* 🚚 SHIPPING */}
      <section>
        <h2>Shipping Policy</h2>
        <p>
          Orders are processed within 1–2 business days.
        </p>
        <p>
          Delivery usually takes 3–7 business days depending on location.
        </p>
        <p>
          Shipping charges may vary based on location and order size.
        </p>
      </section>

    </div>
  );
}