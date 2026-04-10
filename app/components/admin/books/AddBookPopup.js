import { compressImage } from "../../../../utils/imageUtils";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export default function AddBookPopup({
  form,
  setForm,
  onSubmit,
  onClose,
}) {

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setForm({
        ...form,
        title: value,
        slug: value.toLowerCase().trim().replace(/[\s\W-]+/g, "-"),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const url = await uploadToCloudinary(compressed);

    setForm((prev) => ({ ...prev, img: url }));
  };

  const handleMultipleImages = async (e) => {
    const files = Array.from(e.target.files);
    let urls = [];

    for (let file of files) {
      const compressed = await compressImage(file);
      const url = await uploadToCloudinary(compressed);
      urls.push(url);
    }

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...urls],
    }));
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <h3>Add Book</h3>

        <form onSubmit={onSubmit} className="book-form">
          <input name="slug" value={form.slug || ""} readOnly />
          <input name="title" placeholder="Title" value={form.title || ""} onChange={handleChange} required />
          <input name="teluguTitle" placeholder="Telugu Title" value={form.teluguTitle || ""} onChange={handleChange} />
          <input name="author" placeholder="Author" value={form.author || ""} onChange={handleChange} required />
          <input name="teluguAuthor" placeholder="Telugu Author" value={form.teluguAuthor || ""} onChange={handleChange} />
          <input name="price" placeholder="Price" value={form.price || ""} onChange={handleChange} required />
          <input name="pages" placeholder="Pages" value={form.pages || ""} onChange={handleChange} />
          <input name="binding" placeholder="Binding" value={form.binding || ""} onChange={handleChange} />
          <input name="size" placeholder="Size" value={form.size || ""} onChange={handleChange} />
          <input name="language" placeholder="Language" value={form.language || ""} onChange={handleChange} />
          <input name="paper" placeholder="Paper" value={form.paper || ""} onChange={handleChange} />
          <input name="publisher" placeholder="Publisher" value={form.publisher || ""} onChange={handleChange} />
          <input name="weight" placeholder="Weight" value={form.weight || ""} onChange={handleChange} />
          <input name="category" placeholder="Category" value={form.category || ""} onChange={handleChange} />
          <input name="tag" placeholder="Tag" value={form.tag || ""} onChange={handleChange} />

          <input type="file" onChange={handleImageUpload} />
          {form.img && <img src={form.img} style={{ width: "80px" }} />}

          <input type="file" multiple onChange={handleMultipleImages} />

          <textarea name="desc" placeholder="Description" value={form.desc || ""} onChange={handleChange} />
          <textarea name="teluguDesc" placeholder="Telugu Description" value={form.teluguDesc || ""} onChange={handleChange} />

          <button type="submit">Add Book</button>
        </form>
      </div>
    </div>
  );
}