// NearbyUsersMap.tsx
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { User as UserType } from '@/lib/types'; // Use the same imported User type
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  users: UserType[]; // Update here to use UserType
  location: { latitude: number; longitude: number };
}

const NearbyUsersMap: React.FC<Props> = ({ users, location }) => {
  const center = { lat: location.latitude, lng: location.longitude };
  const router = useRouter(); // Initialize the router for navigation
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null); // Track the selected user for InfoWindow

  return (
    <GoogleMap
      center={center}
      zoom={14}
      mapContainerStyle={{ width: '100%', height: '400px' }} // Adjust size as needed
    >
      {/* Marker for the current user */}
      <Marker position={center} label="You" />

      {/* Markers for nearby users */}
      {users.map(user =>
        user.latitude && user.longitude && (
          <Marker
            key={user.id}
            position={{ lat: user.latitude, lng: user.longitude }}
            icon={{
              url: user.avatarUrl || 'default-avatar.png', // Use user's avatar or a default image
              scaledSize: new window.google.maps.Size(30, 30), // Adjust size of the avatar
            }}
            onClick={() => setSelectedUser(user)} // Set selected user for InfoWindow
          />
        )
      )}

      {/* InfoWindow for selected user */}
      {selectedUser && selectedUser.latitude && selectedUser.longitude && (
        <InfoWindow
          position={{ lat: selectedUser.latitude, lng: selectedUser.longitude }} // Ensure valid position
          onCloseClick={() => setSelectedUser(null)} // Close info window on click
        >
          <div style={{ width: '150px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #ccc',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img
                  src={selectedUser.avatarUrl || '/default-avatar.png'} // Use user's avatar or a default image
                  alt={`${selectedUser.username}'s avatar`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Ensure the image covers the space
                />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <button
                    onClick={() => router.push(`/users/${selectedUser.username}`)} // Navigate to user profile
                    style={{
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push(`/messages`)} // Navigate to messaging page
                    style={{
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default NearbyUsersMap;
