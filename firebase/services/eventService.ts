import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config';
import { Event, EventType } from '../types';

const EVENTS_COLLECTION = 'events';

// Create a new event
export const createEvent = async (eventData: {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: string;
  type: EventType;
  maxAttendees?: number;
}): Promise<string> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const now = Timestamp.now();

    const newEvent: Omit<Event, 'id'> = {
      ...eventData,
      date: Timestamp.fromDate(eventData.date),
      attendees: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(eventsRef, newEvent);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() } as Event;
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (
  eventId: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt' | 'attendees'>>
): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Get all upcoming events
export const getUpcomingEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const now = Timestamp.now();
    
    const q = query(
      eventsRef,
      where('date', '>=', now),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event));
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};

// Get all events
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('date', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event));
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
};

// RSVP to an event
export const rsvpToEvent = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    const event = await getEventById(eventId);
    if (!event) throw new Error('Event not found');

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      throw new Error('Event is full');
    }

    // Check if user already RSVP'd
    if (event.attendees.includes(userId)) {
      throw new Error('Already RSVP\'d to this event');
    }

    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error RSVP to event:', error);
    throw error;
  }
};

// Cancel RSVP to an event
export const cancelRsvp = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error canceling RSVP:', error);
    throw error;
  }
};

// Get events user is attending
export const getUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('attendees', 'array-contains', userId),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event));
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
};

