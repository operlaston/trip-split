import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { getTripMembers } from "../../api/tripService"

const TripMembers = () => {
  const { tripId } = useParams()

  const tripMembersQuery = useQuery({
    queryKey: ['tripMembers', tripId],
    queryFn: getTripMembers
  })

  const tripMembers = tripMembersQuery.data

  return (
    <>
      <h2>
        Trip Members
      </h2>
      {
        tripMembers.map(member => {
          const dateObj = new Date(member.joined_at);
          const dateJoined = dateObj.toDateString();
          return (
            <div key={member.user_id}>
              {member.username} <span className="date-text">Joined: {dateJoined}</span>
            </div>
          )
        })
      }
    </>
  )

}

export default TripMembers

