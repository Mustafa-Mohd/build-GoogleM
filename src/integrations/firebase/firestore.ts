// Firestore helper functions for business cards
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './client';
import { BusinessCard } from '@/types/businessCard';

const COLLECTION_NAME = 'business_cards';

// Add a new business card
export const addBusinessCard = async (data: Omit<BusinessCard, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // Validate required fields
    if (!data.full_name || !data.front_image_url) {
      throw new Error('Full name and front image URL are required');
    }

    // Remove undefined values - Firestore doesn't accept undefined
    // Convert undefined to null or omit the field entirely
    const cleanData: Record<string, any> = {
      full_name: data.full_name,
      front_image_url: data.front_image_url,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    // Only add optional fields if they have values (not undefined)
    if (data.company !== undefined && data.company !== null) cleanData.company = data.company;
    if (data.designation !== undefined && data.designation !== null) cleanData.designation = data.designation;
    if (data.email !== undefined && data.email !== null) cleanData.email = data.email;
    if (data.phone !== undefined && data.phone !== null) cleanData.phone = data.phone;
    if (data.website !== undefined && data.website !== null) cleanData.website = data.website;
    if (data.address !== undefined && data.address !== null) cleanData.address = data.address;
    if (data.notes !== undefined && data.notes !== null) cleanData.notes = data.notes;
    if (data.back_image_url !== undefined && data.back_image_url !== null) cleanData.back_image_url = data.back_image_url;

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Firestore add error:', error);
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('Permission denied. Check your Firestore security rules.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Check your internet connection and Firebase configuration.');
      } else if (error.message.includes('quota')) {
        throw new Error('Firebase quota exceeded. Check your Firebase plan.');
      } else if (error.message.includes('undefined')) {
        throw new Error('Invalid data: undefined values are not allowed. Please fill in all required fields.');
      }
      throw error;
    }
    throw new Error('Failed to save business card to Firestore.');
  }
};

// Get all business cards
export const getBusinessCards = async (): Promise<BusinessCard[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as BusinessCard[];
};

// Delete a business card
export const deleteBusinessCard = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

