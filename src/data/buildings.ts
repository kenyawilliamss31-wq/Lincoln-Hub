// CAMPUS BUILDINGS - every location on Lincoln's official walking map
// (lionsconnect.lincoln.edu, LU Google Walking Map), with GPS coordinates.
// Pulled from the map's public data once. Buildings don't move, so this list
// is safe to keep in the app instead of downloading it every time.

export type Building = {
  id: number;
  name: string;
  category: string;   // which filter chip it belongs to
  lat: number;        // latitude: north/south position
  lng: number;        // longitude: east/west position (negative = west)
};

// The order the filter chips appear in. "All" is added by the screen itself.
export const categories = [
  "Offices",
  "Academic",
  "Historic",
  "Residence Halls",
  "Campus Life",
  "Arts",
  "Other Housing",
  "Parking",
];

export const buildings: Building[] = [
  { id: 1, name: "Cannon House", category: "Offices", lat: 39.809677, lng: -75.924655 },
  { id: 2, name: "Department of Public Safety", category: "Offices", lat: 39.807734, lng: -75.933083 },
  { id: 3, name: "Lincoln Hall", category: "Offices", lat: 39.810465, lng: -75.926249 },
  { id: 4, name: "Langston Hughes Memorial Library", category: "Offices", lat: 39.807658, lng: -75.926376 },
  { id: 5, name: "Vail Memorial Hall", category: "Offices", lat: 39.809789, lng: -75.926312 },
  { id: 6, name: "Top of the U", category: "Offices", lat: 39.808699, lng: -75.927092 },
  { id: 7, name: "Wright Hall", category: "Offices", lat: 39.808556, lng: -75.926365 },
  { id: 8, name: "Houston Hall", category: "Offices", lat: 39.809404, lng: -75.926514 },
  { id: 9, name: "Frank N. Hilton Power House", category: "Offices", lat: 39.806268, lng: -75.926165 },
  { id: 10, name: "Grim Hall", category: "Academic", lat: 39.808098, lng: -75.925405 },
  { id: 11, name: "Ivory V. Nelson Center for the Sciences", category: "Academic", lat: 39.803977, lng: -75.924717 },
  { id: 12, name: "John Miller Dickey Hall", category: "Academic", lat: 39.807647, lng: -75.925348 },
  { id: 13, name: "University Hall", category: "Academic", lat: 39.808318, lng: -75.924981 },
  { id: 14, name: "Alumni House", category: "Historic", lat: 39.810432, lng: -75.925143 },
  { id: 15, name: "Amos Hall", category: "Historic", lat: 39.809928, lng: -75.927109 },
  { id: 16, name: "Azikiwe-Nkrumah Hall", category: "Historic", lat: 39.810654, lng: -75.926441 },
  { id: 17, name: "Cresson Hall", category: "Historic", lat: 39.810184, lng: -75.926106 },
  { id: 18, name: "Mary Dod Brown Memorial Chapel", category: "Historic", lat: 39.808769, lng: -75.924413 },
  { id: 19, name: "Apartment Style Living Building", category: "Residence Halls", lat: 39.805864, lng: -75.923838 },
  { id: 20, name: "Ashmun Hall", category: "Residence Halls", lat: 39.80867, lng: -75.927678 },
  { id: 21, name: "Frederick Douglass Hall", category: "Residence Halls", lat: 39.808843, lng: -75.92907 },
  { id: 22, name: "Lorraine Hansberry Hall", category: "Residence Halls", lat: 39.807089, lng: -75.928592 },
  { id: 23, name: "Lucy Laney Hall", category: "Residence Halls", lat: 39.808102, lng: -75.926986 },
  { id: 24, name: "McCauley Hall", category: "Residence Halls", lat: 39.809334, lng: -75.927096 },
  { id: 25, name: "McRary Hall", category: "Residence Halls", lat: 39.809152, lng: -75.928378 },
  { id: 26, name: "Rendall Hall", category: "Residence Halls", lat: 39.809058, lng: -75.927576 },
  { id: 27, name: "Thurgood Marshall Living Learning Center (LLC)", category: "Residence Halls", lat: 39.807868, lng: -75.928692 },
  { id: 28, name: "Health and Wellness Center", category: "Campus Life", lat: 39.80523, lng: -75.926526 },
  { id: 29, name: "Field House", category: "Campus Life", lat: 39.807221, lng: -75.930548 },
  { id: 30, name: "LU Baseball & Softball Field", category: "Campus Life", lat: 39.806598, lng: -75.931842 },
  { id: 31, name: "LU Football Stadium", category: "Campus Life", lat: 39.806916, lng: -75.931108 },
  { id: 32, name: "Manuel Rivero Gymnasium", category: "Campus Life", lat: 39.8085587, lng: -75.9308727 },
  { id: 33, name: "Student Union Building (SUB)", category: "Campus Life", lat: 39.809753, lng: -75.927559 },
  { id: 34, name: "Thurgood Marshall Dining Commons", category: "Campus Life", lat: 39.807893, lng: -75.928492 },
  { id: 35, name: "Niara Sudarkasa International Cultural Center", category: "Arts", lat: 39.807557, lng: -75.932907 },
  { id: 36, name: "Ware Center for the Arts", category: "Arts", lat: 39.80896, lng: -75.925514 },
  { id: 37, name: "Guest House", category: "Other Housing", lat: 39.810782, lng: -75.925373 },
  { id: 38, name: "Residence Duplex", category: "Other Housing", lat: 39.810067, lng: -75.924891 },
  { id: 39, name: "Residence Duplex at Danjuma", category: "Other Housing", lat: 39.807484, lng: -75.924341 },
  { id: 40, name: "President's Residence", category: "Other Housing", lat: 39.809216, lng: -75.924464 },
  { id: 41, name: "Lot A", category: "Parking", lat: 39.8103198, lng: -75.9263753 },
  { id: 42, name: "Lot B", category: "Parking", lat: 39.810646, lng: -75.9270042 },
  { id: 43, name: "Lot C", category: "Parking", lat: 39.8097435, lng: -75.9244615 },
  { id: 44, name: "Lot D", category: "Parking", lat: 39.8081899, lng: -75.9240806 },
  { id: 45, name: "Lot E", category: "Parking", lat: 39.8078932, lng: -75.924955 },
  { id: 46, name: "Lot F", category: "Parking", lat: 39.8071041, lng: -75.9256068 },
  { id: 47, name: "Lot G", category: "Parking", lat: 39.8056962, lng: -75.9258388 },
  { id: 48, name: "Lot H", category: "Parking", lat: 39.8049869, lng: -75.924503 },
  { id: 49, name: "Lot I", category: "Parking", lat: 39.8104275, lng: -75.9270203 },
  { id: 50, name: "Lot J", category: "Parking", lat: 39.8039381, lng: -75.9272076 },
  { id: 51, name: "Lot K", category: "Parking", lat: 39.8064292, lng: -75.9285478 },
  { id: 52, name: "Lot L", category: "Parking", lat: 39.8072802, lng: -75.9261186 },
  { id: 53, name: "Lot M", category: "Parking", lat: 39.8069375, lng: -75.933104 },
  { id: 54, name: "Lot N", category: "Parking", lat: 39.8095745, lng: -75.9297347 },
  { id: 55, name: "Lot Q", category: "Parking", lat: 39.8084551, lng: -75.9291969 },
];