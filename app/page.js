import HeroCarousel from "./components/HeroCarousel";
import Categories from "./components/Categories";
import PopularBooks from "./components/PopularBooks";

export default function Home() {
  return (
    <main className="mainbody1">
      <HeroCarousel />
      <Categories />
      <PopularBooks />
    </main>
  );
}