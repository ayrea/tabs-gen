import { Addresses } from "./pages/addresses/Addresses";
import { Hobbies } from "./pages/hobbies/Hobbies";
import { PersonDetails } from "./pages/personDetails/PersonDetails";
import { Pets } from "./pages/pets/Pets";
import { PhoneNumbers } from "./pages/phoneNumbers/PhoneNumbers";
import { Photos } from "./pages/photos/Photos";

export const pagesConfig = [
    { label: "Person Details", Component: PersonDetails },
    { label: "Addresses", Component: Addresses },
    { label: "Phone Numbers", Component: PhoneNumbers },
    { label: "Pets", Component: Pets },
    { label: "Hobbies", Component: Hobbies },
    { label: "Photos", Component: Photos },
  ];
