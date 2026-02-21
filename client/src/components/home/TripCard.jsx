import { useNavigate } from "react-router";

const TripCard = ({ name, status, created_at, tripId }) => {
  const dateObj = new Date(created_at);
  const dateReadable = dateObj.toDateString();
  const navigate = useNavigate()

  return (
    <div className="home-trip-card">
      <div className="name-status-container">
        <div className="home-trip-name">{name}</div>
        {status === "Completed" && <div className="status-complete home-trip-status">{status}</div>}
        {status === "In Progress" && <div className="status-in-progress home-trip-status">{status}</div>}
      </div>
      <div className="home-trip-created">Date Created: {dateReadable}</div>
      <button className="view-trip-button" onClick={() => navigate(`/trips/${tripId}`)}>View Trip</button>
    </div>
  )
}

export default TripCard
