import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// ---------- seed users ----------
const SEED_OWNER = {
  id: 'seed_owner_1',
  name: 'Carlos Estacionamentos',
  email: 'dono@teste.com',
  password: '123456',
  phone: '(46) 99111-2233',
  cpfCnpj: '12.345.678/0001-99',
  role: 'owner',
  reservations: [],
};

const SEED_USER = {
  id: 'seed_user_1',
  name: 'Cleiton',
  email: 'motorista@teste.com',
  password: '123456',
  phone: '(46) 98888-7766',
  role: 'user',
  reservations: [],
};

// ---------- seed parkings (owned by seed_owner_1) ----------
const SEED_PARKINGS = [
  {
    id: 'seed_p1',
    ownerId: 'seed_owner_1',
    name: 'Estacionamento Central',
    address: 'Rua XV de Novembro, 200 – Centro',
    city: 'Francisco Beltrão',
    totalSpots: 30,
    availableSpots: 12,
    pricePerHour: 6.0,
    rating: 4.5,
    phone: '(46) 99123-4567',
    openHours: '07:00 – 22:00',
    reservations: [],
  },
  {
    id: 'seed_p2',
    ownerId: 'seed_owner_1',
    name: 'Park Fácil',
    address: 'Av. Júlio Assis Cavalheiro, 55',
    city: 'Francisco Beltrão',
    totalSpots: 15,
    availableSpots: 8,
    pricePerHour: 5.0,
    rating: 4.1,
    phone: '(46) 98765-4321',
    openHours: '08:00 – 20:00',
    reservations: [],
  },
  {
    id: 'seed_p3',
    ownerId: 'seed_owner_1',
    name: 'Garagem Express',
    address: 'Rua Pernambuco, 310',
    city: 'Francisco Beltrão',
    totalSpots: 50,
    availableSpots: 20,
    pricePerHour: 8.0,
    rating: 3.8,
    phone: '(46) 99000-1234',
    openHours: '24 horas',
    reservations: [],
  },
];

const SEED_USERS = [SEED_OWNER, SEED_USER];

// ---------- provider ----------
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [parkings, setParkings] = useState([]);
  const [users, setUsers]       = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // inject seed on first run
        const seeded = await AsyncStorage.getItem('@estacioneaq_seeded_v2');
        if (!seeded) {
          await AsyncStorage.setItem('@estacioneaq_parkings', JSON.stringify(SEED_PARKINGS));
          await AsyncStorage.setItem('@estacioneaq_users',   JSON.stringify(SEED_USERS));
          await AsyncStorage.setItem('@estacioneaq_seeded_v2', '1');
          setParkings(SEED_PARKINGS);
          setUsers(SEED_USERS);
        } else {
          const storedParkings = await AsyncStorage.getItem('@estacioneaq_parkings');
          const storedUsers    = await AsyncStorage.getItem('@estacioneaq_users');
          if (storedParkings) setParkings(JSON.parse(storedParkings));
          if (storedUsers)    setUsers(JSON.parse(storedUsers));
        }

        const stored = await AsyncStorage.getItem('@estacioneaq_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  async function saveParkings(updated) {
    setParkings(updated);
    await AsyncStorage.setItem('@estacioneaq_parkings', JSON.stringify(updated));
  }

  async function saveUsers(updated) {
    setUsers(updated);
    await AsyncStorage.setItem('@estacioneaq_users', JSON.stringify(updated));
  }

  async function refreshUser(updatedUsers, updatedUser) {
    const latest = updatedUser || updatedUsers.find(u => u.id === user.id) || user;
    const updatedList = updatedUsers || users.map(u => u.id === latest.id ? latest : u);
    await saveUsers(updatedList);
    await AsyncStorage.setItem('@estacioneaq_user', JSON.stringify(latest));
    setUser(latest);
    return latest;
  }

  // ---------- auth ----------
  async function register(data) {
    const existing = users.find(u => u.email === data.email);
    if (existing) throw new Error('E-mail já cadastrado.');
    const newUser = { ...data, id: Date.now().toString(), reservations: [] };
    const updated = [...users, newUser];
    await saveUsers(updated);
    await AsyncStorage.setItem('@estacioneaq_user', JSON.stringify(newUser));
    setUser(newUser);
  }

  async function login(email, password) {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('E-mail ou senha incorretos.');
    await AsyncStorage.setItem('@estacioneaq_user', JSON.stringify(found));
    setUser(found);
  }

  async function logout() {
    await AsyncStorage.removeItem('@estacioneaq_user');
    setUser(null);
  }

  // ---------- parking ----------
  async function addParking(data) {
    const newParking = {
      ...data,
      id: 'p' + Date.now(),
      ownerId: user.id,
      rating: 0,
      reservations: [],
      availableSpots: Number(data.totalSpots),
    };
    await saveParkings([...parkings, newParking]);
    return newParking;
  }

  // ---------- reservation lifecycle ----------
  async function makeReservation(parkingId, reservationData) {
    const reservation = {
      ...reservationData,
      id: 'r' + Date.now(),
      userId: user.id,
      userName: user.name,
      parkingId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      timerStartedAt: null,
      timerEndsAt: null,
      extraCharges: 0,
    };

    const updatedParkings = parkings.map(p => {
      if (p.id !== parkingId) return p;
      return {
        ...p,
        availableSpots: Math.max(0, p.availableSpots - 1),
        reservations: [...p.reservations, reservation],
      };
    });
    await saveParkings(updatedParkings);

    const updatedUser = {
      ...user,
      reservations: [...(user.reservations || []), reservation],
    };
    await refreshUser(users.map(u => u.id === user.id ? updatedUser : u), updatedUser);
    return reservation;
  }

  async function notifyArrival(reservationId) {
    await _updateReservationEverywhere(reservationId, { status: 'arrived_pending' });
  }

  async function confirmArrival(reservationId) {
    const now  = new Date();
    const res  = _findReservation(reservationId);
    if (!res) return;
    const endsAt = new Date(now.getTime() + res.hours * 60 * 60 * 1000);
    await _updateReservationEverywhere(reservationId, {
      status: 'active',
      timerStartedAt: now.toISOString(),
      timerEndsAt:    endsAt.toISOString(),
    });
  }

  async function extendReservation(reservationId, extraHours) {
    const res = _findReservation(reservationId);
    if (!res) return;
    const parking    = parkings.find(p => p.id === res.parkingId);
    const extraCost  = extraHours * (parking?.pricePerHour || 0);
    const newEnd     = new Date(new Date(res.timerEndsAt).getTime() + extraHours * 60 * 60 * 1000);
    await _updateReservationEverywhere(reservationId, {
      timerEndsAt:  newEnd.toISOString(),
      hours:        (res.hours || 0) + extraHours,
      totalAmount:  (res.totalAmount || 0) + extraCost,
      extraCharges: (res.extraCharges || 0) + extraCost,
    });
  }

  async function finishReservation(reservationId) {
    const res = _findReservation(reservationId);
    if (!res) return;
    const updatedParkings = parkings.map(p => {
      if (p.id !== res.parkingId) return p;
      return {
        ...p,
        availableSpots: p.availableSpots + 1,
        reservations: p.reservations.map(r =>
          r.id === reservationId ? { ...r, status: 'finished' } : r
        ),
      };
    });
    await saveParkings(updatedParkings);
    const updatedUser = {
      ...user,
      reservations: (user.reservations || []).map(r =>
        r.id === reservationId ? { ...r, status: 'finished' } : r
      ),
    };
    await refreshUser(users.map(u => u.id === user.id ? updatedUser : u), updatedUser);
  }

  async function cancelReservation(reservationId) {
    const res = _findReservation(reservationId);
    const updatedParkings = parkings.map(p => {
      if (!res || p.id !== res.parkingId) return p;
      return {
        ...p,
        availableSpots: p.availableSpots + 1,
        reservations: p.reservations.map(r =>
          r.id === reservationId ? { ...r, status: 'cancelled' } : r
        ),
      };
    });
    await saveParkings(updatedParkings);
    const updatedUser = {
      ...user,
      reservations: (user.reservations || []).map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      ),
    };
    await refreshUser(users.map(u => u.id === user.id ? updatedUser : u), updatedUser);
  }

  async function deleteReservation(reservationId) {
    const updatedUser = {
      ...user,
      reservations: (user.reservations || []).filter(r => r.id !== reservationId),
    };
    await refreshUser(users.map(u => u.id === user.id ? updatedUser : u), updatedUser);
  }

  // ---------- helpers ----------
  function _findReservation(reservationId) {
    for (const p of parkings) {
      const found = p.reservations.find(r => r.id === reservationId);
      if (found) return found;
    }
    return (user?.reservations || []).find(r => r.id === reservationId);
  }

  async function _updateReservationEverywhere(reservationId, patch) {
    const res = _findReservation(reservationId);
    if (!res) return;

    const updatedParkings = parkings.map(p => {
      if (p.id !== res.parkingId) return p;
      return {
        ...p,
        reservations: p.reservations.map(r =>
          r.id === reservationId ? { ...r, ...patch } : r
        ),
      };
    });
    await saveParkings(updatedParkings);

    if (res.userId === user.id) {
      const updatedUser = {
        ...user,
        reservations: (user.reservations || []).map(r =>
          r.id === reservationId ? { ...r, ...patch } : r
        ),
      };
      await refreshUser(users.map(u => u.id === user.id ? updatedUser : u), updatedUser);
    } else {
      const updatedUsers = users.map(u => ({
        ...u,
        reservations: (u.reservations || []).map(r =>
          r.id === reservationId ? { ...r, ...patch } : r
        ),
      }));
      await saveUsers(updatedUsers);
    }
  }

  return (
    <AuthContext.Provider value={{
      user, loading, parkings, users,
      register, login, logout,
      addParking,
      makeReservation, cancelReservation, deleteReservation,
      notifyArrival, confirmArrival, extendReservation, finishReservation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}