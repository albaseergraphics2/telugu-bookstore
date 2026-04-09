export default function PrintingService() {
  return (
    <section className="printing">
      <div className="printing-container">
        <div className="printing-text">
          <h2>Book Printing & DTP Services</h2>

          <p>
            We provide all kinds of book printing and DTP works.
            Islamic books, pamphlets, posters
            and custom book printing available.
          </p>

          <ul>
            <li>Arabic / Urdu / Telugu / English typing</li>
            <li>Book layout & formatting (DTP)</li>
            <li>Offset & Digital printing</li>
            <li>Binding & lamination</li>
          </ul>

          {/* <a href="#contact" className="print-btn">
            Contact For Printing
          </a> */}
        </div>

        <div className="printing-image">
          <img src="/images/ad.png" alt="Printing service" />
        </div>

      </div>
    </section>
  );
}