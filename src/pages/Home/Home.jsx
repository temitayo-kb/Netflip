import { React, useEffect } from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import HeroCard from "../../components/HeroCard/HeroCard";
import TitleCard from "../../components/TitleCard/TitleCard";
import Footer from "../../components/Footer/Footer";
import { useDailyHero } from "../../hooks/dailyHero";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { heroShow, loading } = useDailyHero();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlayClick = () => {
    if (heroShow && heroShow.id) {
      navigate(`/player/${heroShow.id}`, { state: { from: "/home" } });
    }
  };

  const handleMoreInfoClick = () => {
    // TODO= Navigate to show details page when implemented
    console.log("More info for:", heroShow?.name);
  };

  return (
    <div className="home page-transition">
      <Navbar />

      <HeroCard
        heroShow={heroShow}
        loading={loading}
        onPlayClick={handlePlayClick}
        onMoreInfoClick={handleMoreInfoClick}
        mediaType={heroShow?.media_type || "tv"}
      />

      <div className="more-cards">
        {/* Movies Section */}
        <TitleCard
          layout="carousel"
          category="popular"
          title="Popular on Netflip"
          mediaType="movie"
        />
        <TitleCard
          layout="carousel"
          title={"Blockbuster Films"}
          category={"top_rated"}
          mediaType="movie"
        />
        <TitleCard
          title={"Only On Netflip"}
          category={"popular"}
          mediaType="movie"
        />
        {/* TV Shows Section */}
        <TitleCard
          title={"Popular TV Shows"}
          category={"popular"}
          mediaType="tv"
        />
        <TitleCard
          title={"Top Rated Series"}
          category={"top_rated"}
          mediaType="tv"
        />
        <TitleCard
          title={"Airing Today"}
          category={"airing_today"}
          mediaType="tv"
        />
        {/* More Movies */}
        <TitleCard
          title={"Upcoming Films"}
          category={"upcoming"}
          mediaType="movie"
        />
        <TitleCard
          title={"Top Picks For You"}
          category={"now_playing"}
          mediaType="movie"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
