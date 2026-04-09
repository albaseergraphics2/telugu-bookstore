import HeroCarousel from "./components/HeroCarousel";
import Categories from "./components/Categories";
import PopularBooks from "./components/PopularBooks";

export default function Home() {
  return (
    <>
      <div className="mainbody1">
        <HeroCarousel />
        <Categories />
        <PopularBooks />
      </div>
    </>
  );
}
