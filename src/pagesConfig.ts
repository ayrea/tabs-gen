import type { PageTabItem } from "./components/PageTabs";
import { Addresses } from "./pages/addresses/Addresses";
import { Hobbies } from "./pages/hobbies/Hobbies";
import { PersonDetails } from "./pages/personDetails/PersonDetails";
import { Pets } from "./pages/pets/Pets";
import { PhoneNumbers } from "./pages/phoneNumbers/PhoneNumbers";
import { Photos } from "./pages/photos/Photos";

export const pagesConfig: PageTabItem[] = [
  { label: "Addresses", Component: Addresses, displayOrder: 2, disabled: true },
  { label: "Phone Numbers", Component: PhoneNumbers, displayOrder: 3 },
  { label: "Pets", Component: Pets, displayOrder: 4 },
  { label: "Hobbies", Component: Hobbies, displayOrder: 5 },
  { label: "Photos", Component: Photos, displayOrder: 6 },
  { label: "Person Details", Component: PersonDetails, displayOrder: 1 },
];
