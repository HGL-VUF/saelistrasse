// Supabase Client für das Frontend
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Konfiguration laden
let supabase;
let config;

// Funktion zum Laden der Konfiguration
async function loadConfig() {
  try {
    // Lade die Konfiguration aus der projects-config.json
    const response = await fetch('./projects-config.json');
    config = await response.json();
    
    // Supabase Client initialisieren
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    
    // Event auslösen, wenn die Konfiguration geladen ist
    window.dispatchEvent(new CustomEvent('supabase-config-loaded'));
  } catch (error) {
    console.error('Fehler beim Laden der Konfiguration:', error);
  }
}

// Konfiguration laden
loadConfig();

// Funktion zum Abrufen einer Datei aus dem Storage
async function getFileFromStorage(path) {
  if (!supabase) {
    await new Promise(resolve => {
      window.addEventListener('supabase-config-loaded', resolve, { once: true });
    });
  }
  
  const { data, error } = await supabase.storage
    .from('projects')
    .download(path);
  
  if (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
  
  return data;
}

// Funktion zum Abrufen einer JSON-Datei aus dem Storage
async function getJsonFromStorage(path) {
  const fileData = await getFileFromStorage(path);
  const text = await fileData.text();
  return JSON.parse(text);
}

// Funktion zum Abrufen einer Bild-URL aus dem Storage
function getImageUrl(path) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return '';
  }
  
  const { data } = supabase.storage
    .from('projects')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Funktion zum Abrufen des aktuellen Projekts
function getCurrentProject() {
  if (!config) {
    console.error('Configuration not loaded');
    return null;
  }
  
  // Verwende das Standard-Projekt aus der Konfiguration
  return config.projects.find(project => project.id === config.defaultProject);
}

export { 
  supabase, 
  getFileFromStorage, 
  getJsonFromStorage, 
  getImageUrl, 
  getCurrentProject 
}; 