/**
 * FloodGuard Native IndexedDB Layer
 * Zero-dependency, lightweight, ultra-reliable offline structured storage.
 */

const DB_NAME = 'FloodGuardDB';
const DB_VERSION = 1;

export interface DBStores {
  cachedForecasts: any;
  offlineShelters: any;
  emergencyContacts: any;
  familyCheckIns: any;
  communityReports: any;
  checklistStatus: any;
  sensorReadings: any;
  offlineResources: any;
}

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('cachedForecasts')) {
        db.createObjectStore('cachedForecasts', { keyPath: 'locationKey' });
      }
      if (!db.objectStoreNames.contains('offlineShelters')) {
        db.createObjectStore('offlineShelters', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('emergencyContacts')) {
        db.createObjectStore('emergencyContacts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('familyCheckIns')) {
        db.createObjectStore('familyCheckIns', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('communityReports')) {
        db.createObjectStore('communityReports', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('checklistStatus')) {
        db.createObjectStore('checklistStatus', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sensorReadings')) {
        db.createObjectStore('sensorReadings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineResources')) {
        db.createObjectStore('offlineResources', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Generic Put / Save item
 */
export async function dbPut<T>(storeName: keyof DBStores, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB put failed for ${storeName}:`, err);
  }
}

/**
 * Generic Get item by key
 */
export async function dbGet<T>(storeName: keyof DBStores, key: IDBValidKey): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB get failed for ${storeName}:`, err);
    return null;
  }
}

/**
 * Generic Get All items
 */
export async function dbGetAll<T>(storeName: keyof DBStores): Promise<T[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB getAll failed for ${storeName}:`, err);
    return [];
  }
}

/**
 * Generic Delete item by key
 */
export async function dbDelete(storeName: keyof DBStores, key: IDBValidKey): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB delete failed for ${storeName}:`, err);
  }
}

/**
 * Clear All User Data (Privacy-first Delete-My-Data requirement)
 */
export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  const storeNames = Array.from(db.objectStoreNames);
  const tx = db.transaction(storeNames, 'readwrite');
  for (const name of storeNames) {
    tx.objectStore(name).clear();
  }
  return new Promise((resolve) => {
    tx.oncomplete = () => {
      try {
        localStorage.clear();
      } catch (_) {}
      resolve();
    };
  });
}
