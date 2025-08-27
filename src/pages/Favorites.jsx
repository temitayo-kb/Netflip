import { useMovieContext } from "../contexts/MovieContext";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import "../css/Favorites.css";

function Favorites() {
  const { favorites } = useMovieContext();

  return (
    <div className="favorites">
      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <h2> </h2>
          <p>No favorite films yet. Like to add to your favorites.</p>
          <Link to="/" className="cta-button">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
